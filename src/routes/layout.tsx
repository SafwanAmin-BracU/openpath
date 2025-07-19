import { Session } from "@auth/qwik";
import {
  $,
  Signal,
  Slot,
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import {
  Link,
  routeLoader$,
  useNavigate,
  type RequestHandler,
} from "@builder.io/qwik-city";
import { LuLogOut } from "@qwikest/icons/lucide";
import { Octokit } from "octokit";
import { OctokitFactory } from "~/services/octokit";
import { useSignOut } from "./plugin@auth";

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

// Contexts
const SidebarCollapseContext = createContextId<Signal<boolean>>(
  "sidebarCollapseContext",
);

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

const Sidebar = component$(() => {
  return (
    <div
      class="sidebarCollapseTransition grid gap-3 *:flex *:size-full"
      style={{
        gridArea: "sidebar",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "3rem 1fr 3rem",
        gridTemplateAreas: `"sidebarHeader""sidebarContent""sidebarFooter"`,
      }}
    >
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter />
    </div>
  );
});

const SidebarHeader = component$(() => {
  const sidebarCollapseSignal = useContext(SidebarCollapseContext);
  return (
    <div
      class={[
        "flex cursor-pointer items-center justify-center rounded-md text-lg font-semibold text-gray-700",
        // "outline-2 -outline-offset-2 outline-gray-700 hover:bg-gray-200",
      ]}
      style={{ gridArea: "sidebarHeader" }}
      onClick$={() => {
        sidebarCollapseSignal.value = !sidebarCollapseSignal.value;
      }}
    >
      {sidebarCollapseSignal.value ? (
        <span class="text-2xl">☰</span>
      ) : (
        <span>OpenPath</span>
      )}
    </div>
  );
});
const SidebarContent = component$(() => {
  const sidebarCollapseSignal = useContext(SidebarCollapseContext);
  const navRoutes = [
    {
      name: "Home",
      path: "/",
      icon: "🏠",
    },
    {
      name: "Repositories",
      path: "/repo",
      icon: "📦",
    },
  ];

  const SidebarLinkItem = component$((props: (typeof navRoutes)[number]) => {
    return (
      <Link
        class={[
          "flex h-10 w-full items-center gap-1 rounded-md px-2 text-gray-700 hover:bg-gray-200",
          sidebarCollapseSignal.value ? "justify-center" : "justify-start",
        ]}
        href={props.path}
      >
        {props.icon}
        <span
          class="text-lg"
          style={{ display: sidebarCollapseSignal.value ? "none" : "block" }}
        >
          {props.name}
        </span>
      </Link>
    );
  });
  return (
    <div class="flex flex-col gap-2" style={{ gridArea: "sidebarContent" }}>
      {navRoutes.map((route) => (
        <SidebarLinkItem key={route.path} {...route} />
      ))}
    </div>
  );
});

const SidebarFooter = component$(() => {
  const sidebarCollapseSignal = useContext(SidebarCollapseContext);
  const ghUserData = useGhUserData();
  const signOut = useSignOut();
  return (
    <div
      class="items-center justify-between rounded-md bg-white p-2 outline-2 -outline-offset-2 outline-gray-700"
      style={{
        gridArea: "sidebarFooter",
        display: "grid",
        gridTemplateAreas: `'avatar fullname signout' 'avatar username signout'`,
        gridTemplateRows: "1fr 1fr",
        gridTemplateColumns: "2rem 1fr 2rem",
        gap: "0.25rem",
      }}
    >
      <img
        src={ghUserData.value.avatar_url}
        alt="user avatar"
        class="size-8 rounded-sm p-1 outline-2 -outline-offset-1 outline-gray-700"
        style={{ gridArea: "avatar", cursor: "pointer" }}
      />
      <span
        class="text-sm text-gray-700"
        style={{
          display: !sidebarCollapseSignal.value ? "block" : "none",
          gridArea: "username",
        }}
      >
        @{ghUserData.value.login}
      </span>
      <span
        class={[
          "text-lg font-semibold text-gray-800",
          sidebarCollapseSignal.value ? "sidebarHidden" : "sidebarVisible",
        ]}
        style={{
          gridArea: "fullname",
        }}
      >
        {ghUserData.value.name}
      </span>
      <LuLogOut
        class="size-8 rounded-sm bg-rose-200 p-1 text-rose-500 outline-2 -outline-offset-1 outline-rose-500 hover:bg-rose-300"
        style={{
          cursor: "pointer",
          gridArea: "signout",
        }}
        onClick$={() => {
          signOut.submit({ redirectTo: "/" });
        }}
      />
    </div>
  );
});
