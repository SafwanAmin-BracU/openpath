import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export default component$(() => {
  const loc = useLocation();
  return (
    <>
      <span>
        {loc.url.pathname.split("/").join(" > ").trimStart().substring(1)}
      </span>
      {/* <div class="rounded-xl bg-gray-400" style={{ gridArea: "header" }}></div> */}
    </>
  );
});
