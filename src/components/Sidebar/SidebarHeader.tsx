import { component$, useContext } from "@builder.io/qwik";
import { SidebarCollapseContext } from ".";

export default component$(() => {
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
