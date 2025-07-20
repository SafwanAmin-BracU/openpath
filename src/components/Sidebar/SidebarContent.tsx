import { component$ } from "@builder.io/qwik";
import { NavRoutes } from "./SidebarNavRoutes";
import { SidebarLinkItem } from "./SidebarLinkItem";

export default component$(() => {
  return (
    <div class="flex flex-col gap-2" style={{ gridArea: "sidebarContent" }}>
      {NavRoutes.map((route) => (
        <SidebarLinkItem key={route.path} {...route} />
      ))}
    </div>
  );
});
