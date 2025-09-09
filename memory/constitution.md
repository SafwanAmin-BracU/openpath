# OpenPath Constitution

## Core Principles

### I. Route Structure

Each route directory can have at most two files: index.tsx and layout.tsx. This ensures clean, focused routing and prevents route sprawl.

### II. Data Fetching Strategy

Avoid client-side data fetching with useEffect hooks. Prefer routeLoader$ and routeAction$ for server-side data handling to improve performance and SEO.

### III. Abstraction Layer

Abstract business logic into classes in /src/server/[businessLogicApp]/index.ts. Keep route handlers thin and focused on presentation.

### IV. Global Resources

Use global route loaders/actions only when required across multiple routes. Otherwise, keep them local to maintain modularity.

### V. Business Logic Integration

In routeAction/routeLoader, perform business logic by using the abstracted app classes. Do not implement business logic directly in routes.

## Technology Stack Requirements

- **Framework**: QwikCity for full-stack web application
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with DaisyUI
- **Database**: PostgreSQL with Drizzle ORM
- **API**: GitHub GraphQL API via Octokit
- **Build Tool**: Vite with Bun package manager
- **Testing**: Manual code review (no automated testing)
- **Linting**: ESLint with Qwik-specific rules

## Development Workflow

### Code Review Requirements

- All changes must pass linting (`bun run lint`)
- Route structure must follow the two-file limit
- Business logic must be abstracted to server classes
- Data fetching must use routeLoaders/routeActions, not useEffect

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

All PRs/reviews must verify compliance with route structure, data fetching strategy, and abstraction principles.

**Version**: 1.1.0 | **Ratified**: 2025-09-10 | **Last Amended**: 2025-09-10
