import { Slot, component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  useLocation,
  type RequestHandler,
} from "@builder.io/qwik-city";
import { useSignOut, verifySessionMiddleware } from "~/server/auth";
import { getOctokit, getViewerData } from "~/server/octokit";

// Middleware
export const onRequest: RequestHandler = async (event) => {
  verifySessionMiddleware(event);
};

// Loaders
const useViewerData = routeLoader$(async (event) => {
  const viewer = await getViewerData(
    await getOctokit(await event.sharedMap.get("session")),
  );
  return viewer;
});
// Actions

// Page
export default component$(() => {
  return (
    <>
      <div
        data-appGridContainer
        style={{ gridTemplateColumns: false ? "3rem 1fr" : "15rem 1fr" }}
      >
        <Header />
        <Sidebar />
        <main data-appMain>
          <Slot />
        </main>
      </div>
    </>
  );
});

// Components

const Header = component$(() => {
  const loc = useLocation();
  return (
    <div data-appGridHeader>
      <span>
        {loc.url.pathname.split("/").join(" > ").trimStart().substring(1)}
      </span>
      {/* <div class="rounded-xl bg-gray-400" style={{ gridArea: "header" }}></div> */}
    </div>
  );
});

const Sidebar = component$(() => {
  const viewerData = useViewerData();
  const signOut = useSignOut();
  return (
    <div data-appGridSidebar>
      <div>hello</div>
      <div>hello</div>
      <div>hello</div>
      <div>hello</div>
      <div>hello</div>
      <div>hello</div>
      <div>
        <img src={viewerData?.value.avatarUrl} alt="" />
        <span>@{viewerData?.value.login}</span>
        <button onClick$={async () => await signOut.submit({})}>x</button>
      </div>
    </div>
  );
});
