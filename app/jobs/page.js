import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountType } from "@/lib/accountType";
import { getOpenJobs, getManagerJobs, getMyJobApplications } from "@/lib/jobs";
import IndividualJobBoard from "@/components/IndividualJobBoard";
import ManagerJobBoard from "@/components/ManagerJobBoard";

export const metadata = {
  title: "Jobs that hire on proof, not paper",
  description:
    "Roles from teams that would rather watch what you can do than scan a CV.",
};

export default async function JobsPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?next=/jobs");

  const accountType = getAccountType(user);

  if (accountType === "manager") {
    const [jobs, { data: manager }] = await Promise.all([
      getManagerJobs(user.id),
      supabase.from("managers").select("name, company").eq("id", user.id).maybeSingle(),
    ]);
    return <ManagerJobBoard managerId={user.id} manager={manager} initialJobs={jobs} />;
  }

  const [jobs, applications] = await Promise.all([
    getOpenJobs(),
    getMyJobApplications(user.id),
  ]);

  return (
    <IndividualJobBoard userId={user.id} initialJobs={jobs} initialApplications={applications} />
  );
}
