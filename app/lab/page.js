import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountType } from "@/lib/accountType";
import { getOpenProjects, getManagerProjects, getMySubmissions } from "@/lib/projects";
import IndividualProjectBoard from "@/components/IndividualProjectBoard";
import ManagerProjectBoard from "@/components/ManagerProjectBoard";

export const metadata = {
  title: "The Lab",
  description: "Open projects and collabs — post one, or find one to join.",
};

export default async function LabPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?next=/lab");

  const accountType = getAccountType(user);

  if (accountType === "manager") {
    const [projects, { data: manager }] = await Promise.all([
      getManagerProjects(user.id),
      supabase.from("managers").select("name, company").eq("id", user.id).maybeSingle(),
    ]);
    return (
      <ManagerProjectBoard managerId={user.id} manager={manager} initialProjects={projects} />
    );
  }

  const [projects, submissions] = await Promise.all([
    getOpenProjects(),
    getMySubmissions(user.id),
  ]);

  return (
    <IndividualProjectBoard
      userId={user.id}
      initialProjects={projects}
      initialSubmissions={submissions}
    />
  );
}
