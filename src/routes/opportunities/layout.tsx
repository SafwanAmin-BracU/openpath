import { component$, Slot } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Main Content */}
      <main>
        <Slot />
      </main>

      {/* Footer */}
      <footer class="border-t border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
        <div class="container mx-auto px-4 py-8">
          <div class="text-center text-stone-500 dark:text-stone-400">
            <p>
              &copy; 2025 OpenPath. Connecting students with open-source
              opportunities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
});
