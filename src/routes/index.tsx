import { Session } from "@auth/qwik";
import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getOctokit, getViewerData } from "~/server/octokit";

const loader = routeLoader$(async (event) => {
  return {};
});

export default component$(() => {
  const data = loader();
  return (
    <>
      <pre>{JSON.stringify(data.value, null, 2)}</pre>
    </>
  );
});
