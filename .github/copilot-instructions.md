# Copilot Instructions for OpenPath

## Repository Summary

**OpenPath** is a platform that connects computer science students with open-source projects, helping them discover, contribute to, and track real-world development experience. The platform leverages the GitHub API to curate personalized project matches based on user skills and interests, providing quantifiable metrics to support informed decision-making.

### High-Level Repository Information

- **Project Type**: Full-stack web application
- **Size**: ~525 npm packages, TypeScript-heavy codebase
- **Target Runtime**: Node.js 18.17.0+ (optimized for Node 20+)
- **Primary Languages**: TypeScript (95%), JavaScript, CSS
- **Framework**: QwikCity (Qwik full-stack framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Package Manager**: Bun (preferred) or npm (fallback)

### Tech Stack

- **Frontend/Backend**: QwikCity with server-side rendering
- **Styling**: TailwindCSS v4 with DaisyUI
- **Database**: PostgreSQL with Drizzle ORM for schema and migrations
- **Authentication**: @auth/qwik with GitHub OAuth
- **API Integration**: Octokit for GitHub GraphQL API interactions
- **Build Tools**: Vite for development and bundling
- **Code Quality**: ESLint + Prettier + TypeScript strict mode

## Build and Development Instructions

### Prerequisites

**ALWAYS ensure these are installed before any development work:**

1. **Node.js**: Version 18.17.0 or higher (20.3.0+ recommended)
2. **Package Manager**: Bun (preferred) or npm as fallback
3. **Database**: PostgreSQL instance with connection URL

### Environment Setup

**Required environment variables** (create `.env.local` file in project root):

```
AUTH_DRIZZLE_URL=postgresql://user:password@localhost:5432/openpath
AUTH_SECRET=your-auth-secret-here
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret
```

**Important**: Without `AUTH_DRIZZLE_URL`, the development server will fail to start with database connection errors.

### Installation and Setup

**ALWAYS run these commands in order:**

1. **Install dependencies** (required before any other commands):

   ```bash
   npm install
   ```

   - Takes ~1-2 minutes
   - May show 7 vulnerabilities (non-critical for development)
   - Use `bun install` if Bun is available (faster)

2. **Database setup** (if working with database features):
   - Configure PostgreSQL connection via `AUTH_DRIZZLE_URL` environment variable
   - Database schema is defined in `src/server/db/schema.ts`
   - Use `drizzle-kit` commands for migrations: `npx drizzle-kit generate` and `npx drizzle-kit migrate`

### Core Development Commands

**Build Process (run in this order for validation):**

1. **Type checking** (always run first):

   ```bash
   npm run build.types
   ```

   - Takes ~5-10 seconds
   - Must pass before proceeding with development

2. **Linting** (currently has known issues):

   ```bash
   npm run lint
   ```

   - **Known Issues**: 6 errors, 3 warnings in current codebase
   - Common errors: unused imports, Qwik naming conventions
   - Fix before submitting changes

3. **Code formatting** (currently needs fixes):

   ```bash
   npm run fmt.check  # Check formatting
   npm run fmt        # Fix formatting issues
   ```

   - **Known Issues**: 13 files need formatting
   - ALWAYS run `npm run fmt` before committing

4. **Full build**:
   ```bash
   npm run build
   ```
   - Takes ~30-60 seconds
   - Runs type checking, client build, and linting
   - Must pass for production readiness

### Development Server

```bash
npm run dev
# or
npm start  # Opens browser automatically
```

- Runs on development mode with SSR
- Hot module replacement enabled
- Use `npm run dev.debug` for debugging with Node.js inspector

### Testing

```bash
# No unified test script currently - check individual test files
# Example tests exist in: src/routes/user/repos/index.test.tsx
```

## Project Layout and Architecture

### Core Architecture

**QwikCity Route-Based Structure:**

- Routes in `/src/routes/` use file-based routing
- Each route can have maximum 2 files: `index.tsx` (component) and `layout.tsx` (shared layout)
- Server-side rendering with resumable hydration

### Key Directories

```
/src/
├── routes/              # QwikCity file-based routes
│   ├── index.tsx       # Homepage route
│   ├── layout.tsx      # Root layout with auth
│   ├── user/           # User-related routes
│   └── plugin@auth.ts  # Auth plugin configuration
├── server/             # Business logic abstraction
│   ├── auth/           # Authentication logic (core.ts, utils.ts)
│   ├── db/             # Database schema and utilities
│   │   ├── schema.ts   # Drizzle schema definitions
│   │   ├── utils.ts    # DB connection utilities
│   │   └── index.ts    # Main DB exports
│   ├── octokit/        # GitHub API integration
│   │   └── index.ts    # Octokit wrapper functions
│   └── global/         # Shared loaders and actions
│       ├── actions/    # Global route actions
│       └── loaders/    # Global route loaders
├── components/         # Reusable UI components
└── global.tw.css      # Global Tailwind styles
```

### Configuration Files

- `vite.config.ts` - Vite configuration with QwikCity plugins
- `drizzle.config.ts` - Database schema and migration config
- `eslint.config.js` - ESLint configuration with Qwik plugin
- `tsconfig.json` - TypeScript configuration
- `.prettierrc.js` - Prettier formatting rules
- `package.json` - Dependencies and scripts

### Development Workflow Scripts

Located in `/scripts/`:

- `create-new-feature.sh` - Scaffold new features with proper structure
- `setup-plan.sh` - Initialize planning documents
- `check-task-prerequisites.sh` - Validate development environment

### Templates

Located in `/templates/`:

- Standard templates for consistent file generation
- Use scripts to create new features following established patterns

## Coding Guidelines and Best Practices

### QwikCity Specific Rules

1. **Route Loaders**: Use `routeLoader$` for server-side data fetching

   - Export with `use*` naming convention: `export const useLoader = routeLoader$(...)`
   - Avoid client-side `useEffect` and data fetching

2. **Route Actions**: Use `routeAction$` for form submissions and mutations

   - Follow same naming convention: `export const useAction = routeAction$(...)`

3. **Business Logic**: Abstract into classes in `/src/server/[domain]/index.ts`

   - Example domains: `auth`, `db`, `octokit`
   - Instantiate and use these classes in route loaders/actions

4. **Global Loaders/Actions**: Only use when needed across multiple routes
   - Place in `/src/server/global/loaders/` or `/src/server/global/actions/`

### Database Patterns

- **Schema**: Define in `/src/server/db/schema.ts`
- **Queries**: Use Drizzle ORM syntax
- **Migrations**: Generated automatically via `drizzle-kit`

### Authentication

- GitHub OAuth integration via `@auth/qwik`
- Session management in route loaders
- Access tokens stored and retrieved via database

## Known Issues and Workarounds

### Current Build Issues

1. **ESLint Errors**: 6 errors in `src/routes/index.tsx` and `src/routes/layout.tsx`

   - Unused imports: Remove unused `Session`, `getOctokit`, `getViewerData`
   - Naming convention: Rename `loader` to `useLoader`
   - Fix before submitting changes

2. **Build Failure**: Client build fails due to database dependencies in client bundle

   - Error: `"performance" is not exported by "__vite-browser-external"`
   - **Root Cause**: `layout.tsx` imports `getOctokit` which pulls database dependencies into client bundle
   - **Current State**: Build will fail until server-only imports are properly isolated
   - **Temporary Workaround**: Use development mode (`npm run dev`) which works correctly
   - **Proper Fix**: Requires refactoring to use server$ functions or conditional imports

3. **ESLint Errors**: Reduced to 2 issues in `src/routes/layout.tsx`

   - Constant condition and missing img attributes (non-critical)
   - Major import issues have been resolved

4. **Package Vulnerabilities**: 7 vulnerabilities reported by npm
   - Non-critical for development
   - Address with `npm audit fix` if needed

### Environment Issues

1. **Bun vs npm**: Project designed for Bun but npm works as fallback

   - Use npm commands as documented above
   - Bun may offer faster install times if available

2. **Database Connection**: Requires valid PostgreSQL connection
   - Must set `AUTH_DRIZZLE_URL` environment variable
   - Schema will be created automatically on first run

### Development Tips

1. **Development Mode**: Use `npm run dev` for development - production build currently fails
2. **Before committing**: Run `npm run fmt && npm run lint` to ensure quality
3. **For new features**: Use `./scripts/create-new-feature.sh` for proper scaffolding
4. **Database changes**: Update schema in `src/server/db/schema.ts` and regenerate migrations
5. **Server Dependencies**: Keep database/server-only code separate from client code to avoid bundling issues

## Validation Steps

When making changes, validate with:

1. `npm run build.types` - Ensure TypeScript compliance (should pass)
2. `npm run lint` - Check code quality (2 remaining issues in layout.tsx)
3. `npm run fmt.check` - Verify formatting consistency (should pass)
4. `npm run dev` - Test in development mode (recommended for current state)
5. Manual testing - Verify functionality works correctly

**Note**: `npm run build` currently fails due to server dependency bundling issue. Use development mode for testing.

## Trust These Instructions

These instructions are comprehensive and tested. Only search for additional information if:

- Commands fail with specific error messages not covered here
- New features require patterns not documented
- Environment setup fails despite following prerequisites

The most common issues are resolved by ensuring proper command execution order and fixing the known linting/formatting issues before development.
