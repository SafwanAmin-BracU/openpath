import { Session } from "@auth/qwik";
import {
  Slot,
  component$,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import { Octokit } from "octokit";
import Sidebar, { SidebarCollapseContext } from "~/components/Sidebar";
import { OctokitFactory } from "~/server/services/octokit";
// Middleware
export const onRequest: RequestHandler = async (event) => {
  const session: Session | null = event.sharedMap.get("session");
  if (!session || new Date(session.expires) < new Date() || !session.user) {
    throw event.redirect(302, `/auth/signin?callbackUrl=${event.url.pathname}`);
  }
  const octokit = await OctokitFactory.createOctokitInstance(session.user.id!);
  event.sharedMap.set("octokit", octokit);
  await event.next();
};

// Loaders
export const useGhUserData = routeLoader$(async ({ sharedMap }) => {
  const octokit: Octokit = sharedMap.get("octokit");
  const { data } = await octokit.rest.users.getAuthenticated();
  return { ...data };
});

// Layout component
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
      <Main children={<Slot />} />
    </div>
  );
});

// Components
const Main = component$(() => {
  return (
    <div
      class="box-border size-full"
      style={{
        gridArea: "main",
        // overflowY: "scroll",
      }}
    >
      <Slot />
    </div>
  );
});

const Header = component$(() => {
  return (
    <div class="bg-gray-400" style={{ gridArea: "header" }}>
      Header
    </div>
  );
});
