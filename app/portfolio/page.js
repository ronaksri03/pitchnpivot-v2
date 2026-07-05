import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountType } from "@/lib/accountType";
import PortfolioManager from "@/components/PortfolioManager";

export const metadata = {
  title: "My Projects",
  description: "Your portfolio of side projects and work.",
};

export default async function PortfolioPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?next=/portfolio");
  if (getAccountType(user) === "manager") redirect("/lab");

  const { data: projects } = await supabase
    .from("individual_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Portfolio</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          My Projects
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8, marginBottom: 32 }}>
          Showcase your side projects and work, separate from your pitch reels.
        </p>

        <PortfolioManager userId={user.id} initialProjects={projects ?? []} />
      </section>
    </main>
  );
}
