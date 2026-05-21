import { createFileRoute, redirect } from "@tanstack/react-router";
import { getReadySession } from "@/lib/auth-session";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getReadySession();
    if (session) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/login" });
  },
});
