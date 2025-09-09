# Copilot Instructions for OpenPath Repository

## High-Level Details

### Repository Summary
OpenPath is a platform designed to connect computer science students with open-source projects, helping them discover, contribute to, and track real-world development experience. It leverages the GitHub API to curate personalized project matches based on user skills and interests, providing quantifiable metrics for informed decision-making. The mission is to democratize access to open-source ecosystems by empowering students with tailored opportunities, mentorship, and verifiable proof of their impact.

### Repository Information
- **Size**: Small to medium-sized project with approximately 20-30 files in the main source directory.
- **Type**: Full-stack web application.
- **Languages**: TypeScript (primary), JavaScript (config files).
- **Frameworks/Runtimes**: 
  - Frontend: QwikCity (full-stack framework)
  - Styling: Tailwind CSS with DaisyUI
  - Database: PostgreSQL with Drizzle ORM
  - API: GitHub GraphQL API via Octokit
  - Build Tool: Vite
  - Package Manager: Bun
- **Target Runtime**: Node.js (engines: ^18.17.0 || ^20.3.0 || >=21.0.0)

## Build Instructions

### Bootstrap
- **Command**: `bun install`
- **Purpose**: Install all dependencies listed in package.json.
- **Preconditions**: Ensure Bun is installed (version 1.2.21 or compatible). Node.js must be installed with one of the supported versions.
- **Postconditions**: node_modules/ directory is populated with dependencies.
- **Notes**: Always run this before any build, test, or dev commands. The command completes quickly (under 1 second if dependencies are cached).

### Build
- **Command**: `bun run build`
- **Purpose**: Compile TypeScript, bundle client and server code, and prepare for production.
- **Sequence**:
  1. `bun install` (if not already done)
  2. `bun run build`
- **Preconditions**: Dependencies installed, no linting errors (see below).
- **Postconditions**: dist/ directory created with built assets.
- **Known Issues**:
  - Build currently fails due to postgres package importing Node.js modules in client-side build. Error: `"performance" is not exported by "__vite-browser-external"`.
  - Workaround: The vite.config.ts has a commented SSR configuration that may resolve this by externalizing dependencies properly. Uncomment and adjust the `ssr` section if needed.
  - Time: Build takes approximately 3-5 seconds before failing.
- **Validation**: Check for successful completion without errors. If postgres errors occur, investigate SSR configuration.

### Test
- **Command**: No dedicated test script found in package.json.
- **Purpose**: Run unit tests.
- **Sequence**: N/A (no test script defined).
- **Preconditions**: N/A.
- **Postconditions**: N/A.
- **Notes**: A test file exists at `src/routes/user/repos/index.test.tsx`, but no script to run it. Consider adding a test script like `"test": "vitest"` or similar if tests are expanded.

### Run (Development)
- **Command**: `bun run dev`
- **Purpose**: Start development server with hot reloading.
- **Sequence**:
  1. `bun install`
  2. `bun run dev`
- **Preconditions**: Dependencies installed.
- **Postconditions**: Server starts on default port (likely 5173), accessible at http://localhost:5173.
- **Notes**: Uses Vite's SSR mode. Server should start successfully without the postgres build issues affecting runtime.

### Lint
- **Command**: `bun run lint`
- **Purpose**: Check code quality and style using ESLint.
- **Sequence**:
  1. `bun install`
  2. `bun run lint`
- **Preconditions**: Dependencies installed.
- **Postconditions**: Reports errors and warnings in src/**/*.ts* files.
- **Known Issues**:
  - Currently fails with 6 errors and 3 warnings, including unused variables, incorrect loader naming, and missing image attributes.
  - Errors must be fixed before build succeeds.
  - Workaround: Fix linting issues by removing unused imports, renaming loaders to follow `use*` convention, and adding width/height to img tags.
- **Validation**: Command should exit with code 0. Fix all errors before committing.

### Format
- **Command**: `bun run fmt`
- **Purpose**: Format code using Prettier.
- **Sequence**: `bun run fmt`
- **Preconditions**: Dependencies installed.
- **Postconditions**: Code files are reformatted according to .prettierrc.js.
- **Notes**: Always run after making changes to maintain consistent formatting.

### Environment Setup
- **Required Environment Variables**: 
  - `AUTH_DRIZZLE_URL`: PostgreSQL connection string for Drizzle ORM (defined in drizzle.config.ts).
- **Optional but Recommended**: Set up .env file with database credentials.
- **Database**: PostgreSQL must be running and accessible.
- **GitHub API**: Ensure GitHub token is configured if using authenticated API calls.

### Validation Steps
- After build: Check dist/ directory exists and contains built files.
- After lint: Ensure no errors (exit code 0).
- After dev: Server starts without errors, app loads in browser.
- Manual Testing: Navigate to routes like /user/repos to verify functionality.

## Project Layout

### Major Architectural Elements
- **Root Configuration Files**:
  - `package.json`: Defines scripts, dependencies, and Node.js engine requirements.
  - `tsconfig.json`: TypeScript configuration with Qwik JSX settings and path aliases (~/* for src/*).
  - `vite.config.ts`: Vite configuration for QwikCity, including plugins for Qwik, Tailwind, and path resolution.
  - `drizzle.config.ts`: Database configuration for PostgreSQL with schema at `./src/server/db/schema.ts`.
  - `eslint.config.js`: ESLint configuration with Qwik-specific rules and extensive ignore patterns.
- **Source Structure**:
  - `src/routes/`: Route definitions using QwikCity. Each route directory can have at most two files: `index.tsx` and `layout.tsx`.
  - `src/server/`: Server-side logic, abstracted into classes in subdirectories like `auth/`, `db/`, `octokit/`. Each has an `index.ts` for main exports.
  - `src/components/`: Reusable UI components.
  - `src/entry.*.tsx`: Qwik entry points for different modes (dev, preview, SSR).
- **Public Assets**: `public/` contains static files like favicon, manifest, robots.txt.
- **Scripts**: `scripts/` contains Bash scripts for feature management and setup (e.g., `setup-plan.sh`, `create-new-feature.sh`).
- **Templates**: `templates/` has Markdown templates for plans, specs, etc.

### Checks Prior to Check-in
- **Linting**: Run `bun run lint` and fix all errors.
- **Formatting**: Run `bun run fmt` to ensure consistent code style.
- **Build**: Attempt `bun run build` and resolve any issues (currently postgres externalization problem).
- **Type Checking**: `bun run build.types` (part of build) ensures TypeScript compilation.
- **No Dedicated CI/CD**: No GitHub workflows found; manual validation required.

### Validation Pipeline
- Pre-commit: Run lint and format.
- Pre-push: Run build and ensure no failures.
- Manual: Test key routes in dev mode.

### Dependencies and Notes
- **Database**: PostgreSQL is required; Drizzle ORM handles migrations.
- **GitHub API**: Octokit library used for API interactions.
- **Styling**: Tailwind CSS v4 with DaisyUI for components.
- **Authentication**: @auth/qwik for auth handling.

### Key Files and Snippets
- **Main Entry**: `src/root.tsx` - Root component for the app.
- **Route Example**: `src/routes/index.tsx` - Home route with loader.
- **Server Logic**: `src/server/auth/index.ts` - Auth abstraction class.
- **Database Schema**: `src/server/db/schema.ts` - Drizzle schema definitions.
- **Config Example**: `vite.config.ts` includes optimizeDeps for @auth/qwik.

## Coding Guidelines
- **Route Structure**: Each route directory limited to `index.tsx` and `layout.tsx`.
- **Data Fetching**: Prefer `routeLoader$` and `routeAction$` over client-side `useEffect`.
- **Global Loaders/Actions**: Use only when needed across multiple routes; otherwise, keep local.
- **Business Logic**: Abstract into classes in `src/server/[businessLogicApp]/index.ts`.
- **In Route Handlers**: Use the abstracted app classes for business logic.

Trust these instructions and only search if information is incomplete or erroneous.
