import {
  component$,
  createContextId,
  Signal,
  useContext,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuLogOut } from "@qwikest/icons/lucide";
import { useGhUserData } from "~/routes/layout";
import { useSignOut } from "~/routes/plugin@auth";

// Contexts
export const SidebarCollapseContext = createContextId<Signal<boolean>>(
  "sidebarCollapseContext",
);

export default component$(() => {
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
