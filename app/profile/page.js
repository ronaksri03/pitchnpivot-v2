import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountType } from "@/lib/accountType";
import { getOwnReels } from "@/lib/reels";
import ProfileForm from "@/components/ProfileForm";
import ReelManager from "@/components/ReelManager";
import ManagerProfileForm from "@/components/ManagerProfileForm";

export const metadata = {
  title: "Your profile",
  description: "Manage your profile and pitches.",
};

export default async function ProfilePage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?next=/profile");

  if (getAccountType(user) === "manager") {
    let { data: manager } = await supabase
      .from("managers")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Self-heal: if signup happened while email confirmation was pending,
    // AuthForm couldn't write this row yet (no session = no auth.uid()).
    if (!manager) {
      const { data: created } = await supabase
        .from("managers")
        .upsert({ id: user.id, name: user.email.split("@")[0], created_at: new Date().toISOString() })
        .select("*")
        .single();
      manager = created;
    }

    return (
      <main>
        <section style={{ paddingTop: 120 }}>
          <span className="label">Your profile</span>
          <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
            {manager?.name || "Welcome"}
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 8, marginBottom: 32 }}>{user.email}</p>

          <ManagerProfileForm userId={user.id} manager={manager} />
        </section>
      </main>
    );
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Self-heal: a DB trigger creates a bare profiles row (id + username)
  // on signup, but doesn't set role. The client can't do this itself when
  // email confirmation is pending (no session yet), so patch it here on
  // the first authenticated load instead.
  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .upsert({ id: user.id, username: user.email.split("@")[0], role: "individual" })
      .select("*")
      .single();
    profile = created;
  } else if (!profile.role) {
    const { data: updated } = await supabase
      .from("profiles")
      .update({ role: "individual" })
      .eq("id", user.id)
      .select("*")
      .single();
    profile = updated ?? profile;
  }

  const reels = await getOwnReels(user.id);

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Your profile</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          {profile?.first_name || profile?.username || "Welcome"}
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8, marginBottom: 8 }}>{user.email}</p>
        {profile?.username && (
          <a
            href={`/u/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="apply"
            style={{ display: "inline-block", marginBottom: 32 }}
          >
            View public profile ↗
          </a>
        )}

        <ProfileForm userId={user.id} profile={profile} />
      </section>

      <section>
        <span className="label">Your pitches</span>
        <ReelManager userId={user.id} initialReels={reels} />
      </section>
    </main>
  );
}
