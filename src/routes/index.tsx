import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div class="mb-16 text-center">
          <h1 class="mb-6 text-4xl font-bold text-stone-900 sm:text-6xl dark:text-stone-100">
            Welcome to{" "}
            <span class="text-emerald-600 dark:text-emerald-400">OpenPath</span>
          </h1>
          <p class="mx-auto mb-8 max-w-3xl text-xl text-stone-600 dark:text-stone-400">
            Discover open-source projects that match your skills and interests.
            Connect with the developer community and contribute to meaningful
            projects.
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/filter"
              class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
            >
              Explore Projects
              <svg
                class="-mr-1 ml-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>
            <a
              href="/user/repos"
              class="inline-flex items-center rounded-md border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-stone-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              View My Repositories
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
              <svg
                class="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 class="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Smart Filtering
            </h3>
            <p class="text-stone-600 dark:text-stone-400">
              Filter GitHub issues by programming language and repository topics
              to find projects that match your skills.
            </p>
          </div>

          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
              <svg
                class="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 class="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Fast Performance
            </h3>
            <p class="text-stone-600 dark:text-stone-400">
              Optimized caching and responsive design ensure a smooth experience
              across all devices.
            </p>
          </div>

          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
              <svg
                class="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 class="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Community Driven
            </h3>
            <p class="text-stone-600 dark:text-stone-400">
              Connect with other developers and contribute to projects that make
              a real impact.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div class="text-center">
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-8 dark:border-emerald-800 dark:bg-emerald-900/20">
            <h2 class="mb-4 text-2xl font-bold text-stone-900 dark:text-stone-100">
              Ready to Get Started?
            </h2>
            <p class="mb-6 text-stone-600 dark:text-stone-400">
              Start exploring open-source projects and find your next
              contribution opportunity.
            </p>
            <a
              href="/filter"
              class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
            >
              Start Exploring
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});
