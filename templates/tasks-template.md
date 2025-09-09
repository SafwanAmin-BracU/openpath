# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name## Parallel Example

````
# Launch T004-T006 together:
Task: "Route test for index.tsx in src/routes/[route]/index.test.tsx"
Task: "Integration test for route loader in src/routes/[route]/index.test.tsx"
Task: "Integration test for route action in src/routes/[route]/index.test.tsx"
```erequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
````

1. Load plan.md from feature directory
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

```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **QwikCity routes**: `src/routes/` with max 2 files per directory (index.tsx, layout.tsx)
- **Server abstraction**: `src/server/[businessLogicApp]/index.ts` for business logic classes
- **Components**: `src/components/` for reusable UI
- Paths shown below assume QwikCity structure - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create route directory structure per implementation plan
- [ ] T002 Initialize server abstraction classes in src/server/[businessLogicApp]/
- [ ] T003 [P] Configure linting and formatting tools

## Phase 3.2: Core Implementation
- [ ] T004 [P] Server abstraction class in src/server/[businessLogicApp]/index.ts
- [ ] T005 [P] Route index.tsx with routeLoader$ and routeAction$
- [ ] T006 [P] Route layout.tsx if needed
- [ ] T007 [P] Component in src/components/[ComponentName]/index.tsx
- [ ] T008 Input validation in route handlers
- [ ] T009 Error handling and logging

## Phase 3.3: Integration
- [ ] T010 Connect server abstraction to database
- [ ] T011 Auth integration
- [ ] T012 Request/response logging
- [ ] T013 CORS and security headers

## Phase 3.4: Polish
- [ ] T014 [P] Update docs/README.md
- [ ] T015 Remove duplication
- [ ] T016 Run manual code review

## Dependencies
- T004 blocks T005, T010
- T007 blocks T008, T011
- T012 blocks T013
- Implementation before polish (T014-T016)

## Parallel Example
```

# Launch T004-T007 together:

Task: "Server abstraction class in src/server/[businessLogicApp]/index.ts"
Task: "Route index.tsx with routeLoader$ and routeAction$"
Task: "Route layout.tsx if needed"
Task: "Component in src/components/[ComponentName]/index.tsx"

```

## Notes
- [P] tasks = different files, no dependencies
- Commit after each task
- Avoid: vague tasks, same file conflicts
- Manual code review required for all changes

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → implementation task [P]
   - Each endpoint → feature task

2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories**:
   - Each story → feature implementation task
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Implementation order: Models before services before UI
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All routes have corresponding implementation
- [ ] All server abstractions have implementation tasks
- [ ] All user stories have feature tasks
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
- [ ] Route structure follows max 2 files per directory
- [ ] Business logic properly abstracted to server classes
```
