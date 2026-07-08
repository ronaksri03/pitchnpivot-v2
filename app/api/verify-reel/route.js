import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountType } from "@/lib/accountType";
import { signVerification } from "@/lib/verificationSignature";
import { notify } from "@/lib/notifications";

const POST_TABLE = { project: "manager_projects", job: "jobs" };
const SUBMISSION_TABLE = { project: "project_submissions", job: "job_applications" };
const POST_FK = { project: "project_id", job: "job_id" };

export async function POST(request) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (getAccountType(user) !== "manager") {
    return NextResponse.json({ error: "Only manager accounts can verify reels." }, { status: 403 });
  }

  const body = await request.json();
  const { reelId, type, postId, submissionId, projectTitle, verificationNote } = body;

  if (!reelId || !type || !postId || !submissionId || !POST_TABLE[type]) {
    return NextResponse.json({ error: "Missing or invalid request fields." }, { status: 400 });
  }

  // Defense-in-depth ownership check (patent claim 4): confirm this manager
  // created the posting, and that the reel being verified is actually the
  // one attached to that specific submission — independent of whatever RLS
  // policy is (or isn't) configured on the database.
  const { data: post } = await supabase
    .from(POST_TABLE[type])
    .select("id, manager_id")
    .eq("id", postId)
    .maybeSingle();

  if (!post || post.manager_id !== user.id) {
    return NextResponse.json({ error: "You don't own this posting." }, { status: 403 });
  }

  const { data: submission } = await supabase
    .from(SUBMISSION_TABLE[type])
    .select(`id, individual_id, ${POST_FK[type]}`)
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission || submission[POST_FK[type]] !== postId) {
    return NextResponse.json({ error: "That submission isn't for this posting." }, { status: 403 });
  }

  // The manager may verify any reel belonging to the applicant — not only a
  // reel they happened to attach at submission time (patent claim 8).
  const { data: targetReel } = await supabase
    .from("reels")
    .select("id, user_id")
    .eq("id", reelId)
    .maybeSingle();

  if (!targetReel || targetReel.user_id !== submission.individual_id) {
    return NextResponse.json(
      { error: "That reel doesn't belong to this applicant." },
      { status: 403 }
    );
  }

  const { data: manager } = await supabase
    .from("managers")
    .select("name, company")
    .eq("id", user.id)
    .maybeSingle();

  const verifiedAt = new Date().toISOString();
  const signature = signVerification({
    reelId,
    verifiedBy: user.id,
    verifiedByName: manager?.name ?? null,
    verifiedByCompany: manager?.company ?? null,
    verifiedProjectTitle: projectTitle ?? null,
    verifiedAt,
  });

  const { data: reel, error: updateError } = await supabase
    .from("reels")
    .update({
      is_verified: true,
      verified_by: user.id,
      verified_by_name: manager?.name ?? null,
      verified_by_company: manager?.company ?? null,
      verified_at: verifiedAt,
      verification_note: verificationNote || null,
      verified_project_title: projectTitle ?? null,
      verification_signature: signature,
    })
    .eq("id", reelId)
    .select()
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // No row came back → the database's row-level security blocked the write
  // (the verification RLS policy for managers hasn't been applied yet).
  if (!reel) {
    return NextResponse.json(
      {
        error:
          "Verification was blocked by the database. The manager-verification policy needs to be applied (supabase-migration-6.sql).",
      },
      { status: 403 }
    );
  }

  await notify(supabase, {
    userId: reel.user_id,
    type: "reel_verified",
    payload: {
      reelId: reel.id,
      reelTitle: reel.title,
      verifiedByName: manager?.name ?? null,
      verifiedByCompany: manager?.company ?? null,
      projectTitle: projectTitle ?? null,
    },
  });

  return NextResponse.json({ reel });
}
