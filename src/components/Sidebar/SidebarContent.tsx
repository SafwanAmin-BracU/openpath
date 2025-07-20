import { component$, useContext } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { SidebarCollapseContext } from ".";
import { INavRoute, NavRoutes } from "./SidebarNavRoutes";

export default component$(() => {
  return (
    <div class="flex flex-col gap-2" style={{ gridArea: "sidebarContent" }}>
      {NavRoutes.map((route) => (
        <SidebarLinkItem key={route.path} {...route} />
      ))}
    </div>
  );
});

const SidebarLinkItem = component$((props: INavRoute) => {
  const sidebarCollapseSignal = useContext(SidebarCollapseContext);
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
