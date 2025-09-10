import { Slot, component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  useLocation,
  type RequestHandler,
} from "@builder.io/qwik-city";
import { useSignOut, verifySessionMiddleware } from "~/server/auth";
import { getOctokit, getViewerData } from "~/server/app/octokit";

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
    <div class="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-50">
      {/* Top Navigation Bar */}
      <TopNavigation />

      {/* Main Content */}
      <main class="pt-16">
        <Slot />
      </main>
    </div>
  );
});

// Components

const TopNavigation = component$(() => {
  const viewerData = useViewerData();
  const signOut = useSignOut();
  const loc = useLocation();

  return (
    <nav class="fixed top-0 right-0 left-0 z-50 border-b border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          {/* Left: App Logo */}
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <a href="/" class="flex items-center space-x-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                  <span class="text-sm font-bold text-white">OP</span>
                </div>
                <span class="text-xl font-bold text-stone-900 dark:text-stone-100">
                  OpenPath
                </span>
              </a>
            </div>
          </div>

          {/* Center: Navigation Pages */}
          <div class="hidden items-center space-x-8 md:flex">
            <a
              href="/"
              class={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                loc.url.pathname === "/"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  : "text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
              }`}
            >
              Home
            </a>
            <a
              href="/filter"
              class={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                loc.url.pathname === "/filter"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  : "text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
              }`}
            >
              Filter
            </a>
            <a
              href="/portfolio"
              class={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                loc.url.pathname === "/portfolio"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  : "text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
              }`}
            >
              Portfolio
            </a>
            <a
              href="/user/repos"
              class={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                loc.url.pathname === "/user/repos"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  : "text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
              }`}
            >
              Repositories
            </a>
          </div>

          {/* Right: User Profile & Sign Out */}
          <div class="flex items-center space-x-4">
            {/* User Profile */}
            <div class="flex items-center space-x-2">
              <img
                src={viewerData?.value.avatarUrl}
                alt={`${viewerData?.value.login}'s avatar`}
                class="h-8 w-8 rounded-full ring-2 ring-stone-200 dark:ring-stone-600"
                width="32"
                height="32"
              />
              <span class="hidden text-sm font-medium text-stone-700 md:block dark:text-stone-300">
                @{viewerData?.value.login}
              </span>
            </div>

            {/* Sign Out Button */}
            <button
              onClick$={async () => await signOut.submit({})}
              class="inline-flex items-center rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              <svg
                class="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div class="md:hidden">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md p-2 text-stone-700 hover:bg-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:ring-inset dark:text-stone-300 dark:hover:bg-stone-700"
              aria-expanded="false"
            >
              <svg
                class="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
});
