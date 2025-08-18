import {
  Slot,
  component$,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import { Octokit } from "octokit";
import Header from "~/components/Header";
import Sidebar, { SidebarCollapseContext } from "~/components/Sidebar";
import { SessionWithAccessToken } from "./plugin@auth";

// Middleware
export const onRequest: RequestHandler = async (event) => {
  const session: SessionWithAccessToken | null = event.sharedMap.get("session");
  if (!session || new Date(session.expires) < new Date() || !session.user) {
    throw event.redirect(302, `/auth/signin?callbackUrl=${event.url.pathname}`);
  }
  event.sharedMap.set("octokit", new Octokit({ auth: session.accessToken! }));
  await event.next();
};

// Loaders
export const useGhUserData = routeLoader$(async ({ sharedMap }) => {
  const octokit: Octokit = sharedMap.get("octokit");
  const data = await octokit.graphql<{
    viewer: {
      login: string;
      name: string;
      avatarUrl: string;
      url: string;
      email: string;
    };
  }>(
    `#graphql
    query {
      viewer {
        login
        name
        avatarUrl
        url
        email
      }
    }
    `,
  );
  return data;
});

// Layout
export default component$(() => {
  const sidebarCollapseSignal = useSignal<boolean>(false);
  useContextProvider(SidebarCollapseContext, sidebarCollapseSignal);
  return (
    <div
      class={[
        "grid size-full gap-3 p-4",
        // "transition-all duration-300 ease-in-out",
        "**:roundeds *:p-0 **:overflow-scroll",
      ]}
      style={{
        gridTemplateColumns: sidebarCollapseSignal.value
          ? "3rem 1fr"
          : "15rem 1fr",
        gridTemplateRows: "3rem 1fr",
        gridTemplateAreas: `"sidebar header""sidebar main"`,
      }}
    >
      <Sidebar />
      <Header />
      <div
        class="box-border size-full"
        style={{
          gridArea: "main",
          // overflowY: "scroll",
        }}
      >
        <Slot />
      </div>
    </div>
  );
});
