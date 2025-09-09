import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useLoader = routeLoader$(async () => {
  return {};
});

export default component$(() => {
  const data = useLoader();
  return (
    <>
      <pre>{JSON.stringify(data.value, null, 2)}</pre>
    </>
  );
});
