# Implementation Plan: Dynamic Skill-Based Filtering

**Branch**: `001-dynamic-skill-based` | **Date**: September 10, 2025 | **Spec**: /specs/001-dynamic-skill-based/spec.md
**Input**: Feature specification from `/specs/001-dynamic-skill-based/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Implement a /filter route that provides dropdown filtering for GitHub issues by programming language and repository topics. The feature will index GitHub issues and allow users to narrow results with real-time filtering, using QwikCity's server-side data fetching with route loaders and abstracted business logic in service classes.

## Technical Context

**Language/Version**: TypeScript (strict mode)  
**Primary Dependencies**: QwikCity, Octokit (GitHub API), Drizzle ORM, PostgreSQL  
**Storage**: PostgreSQL with Drizzle ORM for caching GitHub data  
**Testing**: Manual code review (no automated testing)  
**Target Platform**: Web application with SSR  
**Project Type**: Web (frontend + backend)  
**Performance Goals**: <2 second initial load, <500ms filter response  
**Constraints**: Must follow QwikCity route structure (max 2 files per route), server-side data fetching only  
**Scale/Scope**: Single feature route with GitHub API integration

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Route Structure**:

- Each route directory limited to index.tsx and layout.tsx? YES - /filter route will follow this
- No additional files in route directories? YES - only index.tsx needed
- Route files follow 8-step organization order (imports → constants → middlewares → loaders → actions → page → top-level components → child components)? YES - will follow this structure

**Data Fetching Strategy**:

- No useEffect for data fetching? YES - will use routeLoader$ for server-side data fetching
- Using routeLoader$ and routeAction$ for server-side data? YES - routeLoader$ for initial data, routeAction$ for filter updates
- Loaders follow `fetch<NameOfData>` naming convention? YES - will use `fetchGitHubIssues`
- Actions follow `submit<NameOfAction>` naming convention? YES - will use `submitFilterUpdate`
- All actions validated using Zod schema with `zod$()`? YES - will validate filter parameters

**Abstraction Layer**:

- Business logic abstracted to /src/server/[businessLogicApp]/index.ts? YES - will create /src/server/app/github-filter/index.ts
- Route handlers thin and focused on presentation? YES - route will only call service methods

**Global Resources**:

- Global loaders/actions only when needed across routes? YES - this is route-specific
- Local loaders/actions preferred? YES - keeping local to /filter route

**Business Logic Integration**:

- routeAction/routeLoader use abstracted service classes? YES - will use GitHubFilterService
- No direct business logic in routes? YES - all logic in service layer
- Service classes located in `/src/server/app/[serviceName]/logicName.service.ts`? YES - /src/server/app/github-filter/githubFilter.service.ts

**Component Architecture**:

- Components shared only when needed across multiple routes? YES - filter components may be shared
- Route-local components preferred over shared extraction? YES - will start route-local
- Shared components in `/src/components/[ComponentName]/index.ts`? YES - if shared, will extract to /src/components/FilterDropdown/index.ts
- Components concise (5-7 elements maximum)? YES - will keep components focused

**Data Sharing Patterns**:

- URL query parameters used for client-to-server data sharing? YES - filter state in URL params
- sharedMap used for route action/loader communication? YES - for filter state persistence
- server$ functions in `/src/server/remotes/[functionName].remote.ts` when needed? NO - route patterns sufficient
- URL maintained as single source of truth for shareable state? YES - filter state in URL

**Simplicity**:

- Projects: 1 (web application)
- Using framework directly? YES (QwikCity)
- Single data model? YES (GitHub issues)
- Avoiding patterns? YES (no unnecessary abstractions)

**Architecture**:

- EVERY feature as library? NO - integrated into main application
- Libraries listed: N/A
- CLI per library: N/A
- Library docs: N/A

**Observability**:

- Structured logging included? YES - will add console logging
- Frontend logs → backend? NO - client-side only
- Error context sufficient? YES - will log filter parameters and errors

**Versioning**:

- Version number assigned? YES (1.0.0)
- BUILD increments on every change? YES
- Breaking changes handled? YES (migration plan for data model changes)

## Project Structure

### Documentation (this feature)

```
specs/001-dynamic-skill-based/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# QwikCity Full-Stack Application Structure
src/
├── routes/                    # Route definitions (max 2 files per directory)
│   ├── index.tsx             # Home route
│   ├── layout.tsx            # Root layout
│   └── filter/               # NEW: Filter route
│       └── index.tsx         # Filter page with dropdowns and results
├── server/                   # Server-side logic
│   ├── app/                  # Business logic services
│   │   └── github-filter/    # NEW: GitHub filtering service
│   │       └── githubFilter.service.ts  # Service for GitHub API and filtering
│   ├── remotes/              # Server$ remote functions
│   ├── db/                   # Database layer (existing)
│   ├── auth/                 # Authentication (existing)
│   └── octokit/              # GitHub API integration (existing)
├── components/               # Reusable UI components
└── global.tw.css            # Global styles (existing)

# Configuration files (existing)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
└── eslint.config.js
```

**Structure Decision**: QwikCity full-stack application with server-side business logic abstraction

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context**:

   - GitHub API rate limits and caching strategy
   - Optimal data structure for GitHub issues filtering
   - DaisyUI dropdown component integration with Qwik
   - Real-time filtering performance optimization

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research GitHub API rate limits for issue filtering"
     Task: "Research DaisyUI dropdown integration with Qwik"
     Task: "Research optimal caching strategy for GitHub data"
     Task: "Research real-time filtering performance patterns"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all unknowns resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - GitHub Issue: title, labels, repository, language, topics
   - Filter Criteria: language, topic selections
   - Filter Result: filtered issue collection
   - Cache Entry: timestamp, data freshness tracking

2. **Generate API contracts** from functional requirements:

   - GET /filter: Initial page load with filter options
   - POST /filter/update: Apply filter selections
   - GET /api/github/issues: Fetch GitHub issues (internal)
   - POST /api/cache/refresh: Refresh cached data

3. **Extract test scenarios** from user stories:

   - Load filter page → see dropdowns populated
   - Select language → see filtered results
   - Select topic → see combined filtering
   - Clear filters → see all results

4. **Update agent file incrementally**:
   - Run `/scripts/update-agent-context.sh copilot` for GitHub Copilot
   - Add GitHub API integration patterns
   - Add Qwik form handling patterns
   - Preserve existing context

**Output**: data-model.md, /contracts/\*, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → implementation task [P]
- Each entity → model creation task [P]
- Each user story → feature implementation task
- Implementation tasks to complete the feature

**Ordering Strategy**:

- Implementation order: Data models before service before route before components
- Dependency order: GitHub service before filtering logic before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 12-15 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No violations detected - design follows constitutional principles_

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

_Based on Constitution v1.7.0 - See `/memory/constitution.md`_
