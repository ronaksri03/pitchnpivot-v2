import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMyConnections } from "@/lib/connections";
import ConnectionsManager from "@/components/ConnectionsManager";

export const metadata = {
  title: "Connections",
  description: "Your network on pitchNpivot.",
};

export default async function ConnectionsPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?next=/connections");

  const { incoming, outgoing, accepted } = await getMyConnections(user.id);

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Network</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          Connections
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8, marginBottom: 32 }}>
          {accepted.length} connection{accepted.length !== 1 ? "s" : ""}
        </p>

        <ConnectionsManager
          initialIncoming={incoming}
          initialOutgoing={outgoing}
          initialAccepted={accepted}
        />
      </section>
    </main>
  );
}
