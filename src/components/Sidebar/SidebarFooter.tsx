import { component$, useContext } from "@builder.io/qwik";
import { LuLogOut } from "@qwikest/icons/lucide";
import { useGhUserData } from "~/routes/layout";
import { useSignOut } from "~/routes/plugin@auth";
import { SidebarCollapseContext } from ".";

export default component$(() => {
  const sidebarCollapseSignal = useContext(SidebarCollapseContext);
  const { viewer } = useGhUserData().value;
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
        src={viewer.avatarUrl}
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
        @{viewer.login}
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
        {viewer.name}
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
