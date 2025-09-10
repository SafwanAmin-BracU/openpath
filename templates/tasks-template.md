# Tasks: [FEATURE NAME]

**\*Input**: Design document- **QwikCity routes**: `src/routes/` with max 2 files per directory (index.tsx, layout.tsx)

- **Route file organization**: 8-step order (imports → constants → middlewares → loaders → actions → page → top-level components → child components)
- **Naming conventions**: Loaders use `fetch<NameOfData>`, actions use `submit<NameOfAction>`
- **Validation**: All actions must use Zod schema validation with `zod$()`
- **Service classes**: `src/server/app/[serviceName]/logicName.service.ts` for business logic
- **Remote functions**: `src/server/remotes/[functionName].remote.ts` for server$ functions
- **Components**: `src/components/[ComponentName]/index.ts` only when shared across routes
- **Data sharing**: URL query parameters for client-server, sharedMap for route communicationm `/specs/[###-feature-name]/`

#

# Parallel Example

```md
# Launch T004-T006 together:

Task:
"Route test for index.tsx in src/routes/[route]/index.test.tsx"
Task: "Integration test for route loader in src/routes/[route]/index.test.tsx"
Task: "Integration test for route action in src/routes/[route]/index.test.tsx"

**prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```

1. Load pln.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have implementations?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)

```md
## Format: `[ID] [P?] Description`

- _m`d_[P\*: Can run in parallel (different
  files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **QwikCity routes**: `src/routes/` with max 2 files per directory (index.tsx, layout.tsx)
- **Service classes**: `src/server/app/[serviceName]/logicName.service.ts` for business logic
- **Remote functions**: `src/server/remotes/[functionName].remote.ts` for server$ functions
- **Components**: `src/components/[ComponentName]/index.ts` only when shared across routes
- **Data sharing**: URL query parameters for client-server, sharedMap for route communication
- Paths shown below assume QwikCity structure - adjust based on plan.md structure

## Phase 3.1: Setup

- [ ] T001 Create route directory structure per impl
      ementation plan
- [ ] T002 Initialize service classes in src/server/app/[serviceName]/
- [ ] T003 [P] Configure linting and formatting tools

## Phase 3.2: Core Implementation

- [ ] T004 [P] Service class in src/server/app/[serviceName]/logicName.service.ts
- [ ] T005 [P] Route index.tsx with fetchDataLoader and submitAction (following naming conventions)
- [ ] T006 [P] Route layout.tsx if needed
- [ ] T007 [P] Component in route file (prefer local over shared)
- [ ] T008 [P] Remote function in src/server/remotes/[functionName].remote.ts (if needed)
- [ ] T009 Input validation using Zod schema for all actions
- [ ] T010 Error handling and logging

## Phase 3.3: Integration

- [ ] T011 Connect service classes to database
- [ ] T012 Auth integration
- [ ] T013 Request/response logging
- [ ] T014 CORS and security headers

## Phase 3.4: Polish

- [ ] T015 [P] Update docs/README.md
- [ ] T016 Remove duplication
- [ ] T017 Run manual code review

## Dependencies

- T004 blocks T005, T011
- T007 blocks T009, T012
- T013 blocks T014
- Implementation before polish (T015-T017)

## Parallel Example
```

# Launch T004-T007 together:

Task: "Service class in src/server/app/[serviceName]/logicName.service.ts"
Task: "Route index.tsx with fetchDataLoader and submitAction (following naming conventions)"
Task: "Route layout.tsx if needed"
Task: "Component in route file (prefer local over shared)"

````md
## Notes

- [P] tasks = different files, no dependencies
- Commit after each task
- Avo```id`: vague tasks,
  same file conflicts
- Manual code review required for all changes

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:

   - Each contract file → implementation tas
     \_ [P]
   - Each endpoint → featu_e task

2. **From Data Model
   **:

   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories
   **:

   - Each story → feature implementation task
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Implementation order: Models before services before UI
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All routes have corresponding implementation
- [ ] All service classes have implementation tasks
- [ ] All user stories have feature tasks
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
- [ ] Route structure follows max 2 files per directory
- [ ] Route files follow 8-step organization order
- [ ] Loaders use fetch\<NameOfData\> naming convention
- [ ] Actions use submit\<NameOfAction\> naming convention
- [ ] All actions include Zod validation schema
- [ ] Business logic properly abstracted to service classes
````
