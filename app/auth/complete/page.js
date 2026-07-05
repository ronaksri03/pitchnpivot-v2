import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import CompleteAccountForm from "@/components/CompleteAccountForm";

export const metadata = {
  title: "Finish setting up your account",
};

export default async function CompleteAccountPage({ searchParams }) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const next = searchParams?.next || "/profile";

  if (!user) redirect(`/auth?next=${encodeURIComponent(next)}`);
  if (user.user_metadata?.account_type) redirect(next);

  const meta = user.user_metadata || {};
  const fullName = meta.full_name || meta.name || "";
  const [suggestedFirst, ...rest] = fullName.split(" ");

  return (
    <CompleteAccountForm
      next={next}
      suggestedFirstName={suggestedFirst || ""}
      suggestedLastName={rest.join(" ")}
      email={user.email}
    />
  );
}
