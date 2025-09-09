# Copilot Instructions for App_OpenPath

## Tech Stack

This project is built using the following technologies:

- **Qwik**: A framework for building resumable web applications with server-side rendering and client-side hydration.
- **TypeScript**: For type-safe development.
- **Drizzle ORM**: For database interactions, schema definition, and migrations.
- **Vite**: For build tooling and development server.
- **Bun**: As the package manager and runtime (evidenced by `bun.lock`).
- **ESLint**: For code linting and style enforcement.
- Additional libraries: Octokit for GitHub API interactions, authentication handling.

## Project Structure Guidelines

- **Routes**: Each route directory can contain at most two files: `index.tsx` (the main component) and `layout.tsx` (for shared layout).
- **Data Fetching**: Avoid client-side data fetching and `useEffect` hooks. Prefer Qwik's `routeActions` and `routeLoaders` for server-side data handling.
- **Global Loaders/Actions**: Use global route loaders and actions only when they are required in multiple places across the application.
- **Business Logic Abstraction**: Abstract business logic into classes located in `/src/server/[businessLogicApp]/index.ts`, where `[businessLogicApp]` represents the specific business domain (e.g., `auth`, `db`, `octokit`).
- **Route Implementation**: In `routeAction` and `routeLoader` functions, perform business logic by instantiating and using the appropriate app class from the server directory.

## Coding Best Practices

- **Type Safety**: Leverage TypeScript for all code to ensure type safety and better developer experience.
- **Server-Side Focus**: Prioritize server-side rendering and data fetching to improve performance and SEO.
- **Modularization**: Keep components and logic modular. Abstract reusable logic into server classes.
- **Database Interactions**: Use Drizzle ORM for all database operations. Define schemas in `/src/server/db/schema.ts` and handle connections/utilities in `/src/server/db/utils.ts`.
- **Authentication**: Handle auth logic in `/src/server/auth/`, using the core, index, and utils files as needed.
- **GitHub Integration**: Use Octokit for GitHub API calls, abstracted in `/src/server/octokit/index.ts`.
- **Global Actions/Loaders**: Place shared actions and loaders in `/src/server/global/actions/index.ts` and `/src/server/global/loaders/index.ts` respectively.
- **Testing**: Write tests for routes and components, following the structure seen in `src/routes/user/repos/index.test.tsx`.
- **Scripts and Templates**: Utilize the provided scripts in `/scripts/` for setup, feature creation, and updates. Use templates in `/templates/` for consistent file generation.

## Additional Notes

- Ensure all new code adheres to the ESLint configuration.
- When adding new features, use the scripts like `create-new-feature.sh` to maintain consistency.
- For database changes, update the Drizzle schema and run migrations as needed.
- Keep the codebase clean and follow the roadmap outlined in `ROADMAP.md`.

If any part of these instructions is unclear or if additional rules need to be added, please provide clarification.
