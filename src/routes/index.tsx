import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <>
      <div id="appLayoutGrid">
        <div id="sidebar">sidebar</div>
        <div id="header">header</div>
        <div id="main">main</div>
      </div>
    </>
  );
});
