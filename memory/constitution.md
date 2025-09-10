# OpenPath Constitution

## Core Principles

### I. Route Structure

Each route directory can have at most two files: index.tsx and layout.tsx. This ensures clean, focused routing and prevents route sprawl.

#### Route File Organization

Each route file (index.tsx or layout.tsx) must follow this structure order:

1. **Imports** - All import statements
2. **Constants** - Static values and configuration
3. **Middlewares** - OnRequest, OnGet|Post|Put|Delete etc.
4. **Route Loaders** - Default loader is called `routeDataLoader`
5. **Route Actions** - Form actions and server functions
6. **Page Component** - Default export component
7. **Top Level Components** - Components directly used in page
8. **Child Components** - Components not directly used in page

### II. Data Fetching Strategy

Avoid client-side data fetching with useEffect hooks. Prefer routeLoader$ and routeAction$ for server-side data handling to improve performance and SEO. When route actions and loaders are not sufficient, use server$ functions as remote functions stored in `/src/server/remotes/[functionName].remote.ts`.

#### Naming Conventions

- **Loaders**: Must follow the naming scheme `fetch<NameOfData>` (e.g., `fetchUserProfile`, `fetchProjectList`)
- **Actions**: Must follow the naming scheme `submit<NameOfAction>` (e.g., `submitUserRegistration`, `submitProjectUpdate`)

#### Validation Requirements

All actions (form submits) must be validated using Zod schema validation with `zod$()`. This ensures type safety and data validation at the route level.

### III. Abstraction Layer

Abstract business logic into service classes in `/src/server/app/[serviceName]/logicName.service.ts`. Keep route handlers thin and focused on presentation.

### IV. Global Resources

Use global route loaders/actions only when required across multiple routes. Otherwise, keep them local to maintain modularity.

### V. Business Logic Integration

In routeAction/routeLoader, perform business logic by using the abstracted service classes. Route loaders or actions should only contain function calls, and the logic should be abstracted to the service layer.

### VI. Component Architecture

- Components should only be shared when needed across multiple routes
- Keep components in the route index.tsx or layout.tsx file where applicable
- Only extract to `/src/components/[ComponentName]/index.ts` when truly shared
- Components should be concise, containing at most 5-7 elements
- Favor composition over complex single components

### VII. Data Sharing Patterns

- **Client-to-Server**: Prefer URL query parameters for sharing data from client to server
- **Route Communication**: Use `sharedMap` to share data between route actions and loaders
- **Advanced Server Functions**: When route actions/loaders are insufficient, use `server$` functions stored in `/src/server/remotes/[functionName].remote.ts`
- Avoid complex state management when simple URL-based state suffices
- Maintain URL as the single source of truth for shareable application state

## Technology Stack Requirements

- **Framework**: QwikCity for full-stack web application
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with DaisyUI components
- **Database**: PostgreSQL with Drizzle ORM
- **API**: GitHub GraphQL API via Octokit
- **Build Tool**: Vite with Bun package manager
- **Testing**: Manual code review (no automated testing)
- **Linting**: ESLint with Qwik-specific rules

### Technology Documentation Standards

- **DaisyUI**: Use DaisyUI components for consistent UI design patterns
- **Tailwind CSS**: Follow Tailwind utility-first CSS approach
- **Qwik**: Leverage Qwik's SSR capabilities and resumability
- **Drizzle ORM**: Use schema-first approach with TypeScript definitions in `/src/server/db/schema.ts`

## Development Workflow

### Code Review Requirements

- All changes must pass linting (`bun run lint`)
- Route structure must follow the two-file limit
- Route files must follow the 8-step organization order (imports → constants → middlewares → loaders → actions → page → top-level components → child components)
- Loaders must use `fetch<NameOfData>` naming convention
- Actions must use `submit<NameOfAction>` naming convention
- All actions must be validated using Zod schema with `zod$()`
- Business logic must be abstracted to service classes in `/src/server/app/[serviceName]/logicName.service.ts`
- Data fetching must use routeLoaders/routeActions, not useEffect
- Use `server$` functions in `/src/server/remotes/[functionName].remote.ts` when route patterns are insufficient
- Components should only be shared when truly needed across multiple routes
- Components should be kept concise (5-7 elements maximum)
- Prefer route-local components over shared extraction
- Use URL query parameters for client-to-server data sharing
- Use `sharedMap` for data sharing between route actions and loaders

### Quality Gates

- No unused variables or imports
- Proper TypeScript types
- Consistent formatting with Prettier
- Manual code review for all changes

## Governance

Constitution supersedes all other practices. Amendments require:

1. Documentation of change
2. Update to dependent templates
3. Validation that changes don't break existing structure

All PRs/reviews must verify compliance with:

- Route structure (two-file limit, file organization, and naming conventions)
- Data fetching strategy (server-side loaders/actions with validation, remote functions when needed)
- Abstraction principles (service layer separation)
- Component architecture (prefer route-local over shared components)
- Data sharing patterns (URL query params and sharedMap usage)

**Version**: 1.7.0 | **Ratified**: 2025-09-10 | **Last Amended**: 2025-09-10
