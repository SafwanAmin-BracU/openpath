import { component$, createContextId, Signal } from "@builder.io/qwik";
import SidebarHeader from "./SidebarHeader";
import SidebarContent from "./SidebarContent";
import SidebarFooter from "./SidebarFooter";

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
