# OpenPath Development Guidelines

Auto-generated from all feature plans. Last updated: [DATE]

## Active Technologies

### Core Stack

- **Frontend Framework**: QwikCity (full-stack framework)
- **Language**: TypeScript (primary), JavaScript (config files)
- **Styling**: Tailwind CSS v4 with DaisyUI components
- **Database**: PostgreSQL with Drizzle ORM
- **API Integration**: GitHub GraphQL API via Octokit
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Authentication**: @auth/qwik

### Runtime Requirements

- **Node.js**: ^18.17.0 || ^20.3.0 || >=21.0.0
- **Bun**: 1.2.21 or compatible

## Project Structure

```text
src/
├── routes/              # QwikCity routes (max 2 files per route: index.tsx, layout.tsx)
├── server/              # Server-side abstractions
│   ├── auth/           # Authentication logic
│   ├── db/             # Database schema and utilities
│   └── app/octokit/    # GitHub API integration
├── components/         # Reusable UI components
├── entry.*.tsx         # Qwik entry points
└── global.tw.css      # Global Tailwind styles
```

## Commands

### Development Workflow

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Format code
bun run fmt

# Lint code
bun run lint

# Build for production
bun run build
```

### Database Management

```bash
# Generate migrations
bunx drizzle-kit generate

# Run migrations
bunx drizzle-kit migrate

# View database studio
bunx drizzle-kit studio
```

## Code Style

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use path aliases (`~/` for `src/`)
- Follow Qwik component patterns with `component$`

### Route Structure

- Each route directory limited to `index.tsx` and `layout.tsx`
- Use `routeLoader$` for data fetching
- Use `routeAction$` for form handling
- Keep global loaders/actions minimal

### Business Logic Abstraction

- Abstract business logic into classes in `src/server/[domain]/index.ts`
- Use abstracted classes in route handlers
- Export main functionality from domain index files

### Database Patterns

- Define schemas in `src/server/db/schema.ts`
- Use Drizzle ORM for type-safe queries
- Follow naming conventions: camelCase for TypeScript, snake_case for SQL

### Styling

- Use Tailwind CSS utility classes
- Leverage DaisyUI components when appropriate
- Keep global styles minimal in `global.tw.css`

## Validation Pipeline

### Pre-commit Checks

1. Run `bun run lint` (must exit with code 0)
2. Run `bun run fmt` (auto-format code)
3. Fix any TypeScript compilation errors

### Pre-push Checks

1. Run `bun run build` (resolve postgres externalization issues if present)
2. Test key routes in development mode
3. Verify database connections work

### Known Issues

- **Build Issue**: postgres package importing Node.js modules in client-side build
- **Workaround**: Use SSR configuration in vite.config.ts to externalize dependencies
- **Linting**: Currently 6 errors and 3 warnings - must be resolved before build

## Environment Setup

### Required Variables

```env
AUTH_DRIZZLE_URL=postgresql://user:password@localhost:5432/openpath
```

### Optional Configuration

- GitHub API token for authenticated requests
- Database connection pooling settings
- Development vs production environment flags

## Recent Changes

[LAST 3 FEATURES AND WHAT THEY ADDED]

## Architecture Patterns

### Data Flow

1. Route loaders fetch data server-side
2. Components receive data as props
3. Actions handle form submissions
4. Server classes abstract business logic

### Error Handling

- Use Qwik's error boundaries
- Implement proper HTTP status codes
- Log errors appropriately for debugging

### Performance

- Leverage Qwik's resumability
- Minimize client-side JavaScript
- Use progressive enhancement patterns

<!-- MANUAL ADDITIONS START -->
<!-- Add project-specific guidelines and exceptions here -->
<!-- MANUAL ADDITIONS END -->
