import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultPending() {
  return <div className="min-h-screen bg-background" />;
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    defaultPendingMinMs: 0,
    defaultPendingComponent: DefaultPending,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
