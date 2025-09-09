# Constitution Update Checklist

When amending the constitution (`/memory/constitution.md`), ensure all dependent documents are updated to maintain consistency.

## Templates to Update

### When adding/modifying ANY article

- [x] `/templates/plan-template.md` - Update Constitution Check section
- [ ] `/templates/spec-template.md` - Update if requirements/scope affected
- [x] `/templates/tasks-template.md` - Update if new task types needed
- [ ] `/.claude/commands/plan.md` - Update if planning process changes
- [ ] `/.claude/commands/tasks.md` - Update if task generation affected
- [ ] `/CLAUDE.md` - Update runtime development guidelines

### Article-specific updates

#### Article I (Route Structure)

- [x] Ensure templates emphasize route creation with max 2 files
- [x] Update path conventions to QwikCity routes
- [x] Add route structure reminders

#### Article II (Data Fetching Strategy)

- [x] Update task examples to use routeLoader$ and routeAction$
- [x] Add data fetching strategy checks in constitution check

#### Article III (Abstraction Layer)

- [x] Update task examples to create server abstraction classes
- [x] Add abstraction layer checks in constitution check

#### Article IV (Global Resources)

- [x] Add global resources checks in constitution check
- [x] Update task dependencies for global vs local

#### Article V (Business Logic Integration)

- [x] Add business logic integration checks in constitution check
- [x] Update task examples to use abstracted classes in routes

#### Article VI (No TDD/Testing)

- [x] Remove TDD references from constitution
- [x] Remove test-related tasks from templates
- [x] Update technology stack to reflect manual testing only

## Validation Steps

1. **Before committing constitution changes:**

   - [x] All templates reference new requirements
   - [x] Examples updated to match new rules
   - [x] No contradictions between documents

2. **After updating templates:**

   - [x] Run through a sample implementation plan
   - [x] Verify all constitution requirements addressed
   - [x] Check that templates are self-contained (readable without constitution)

3. **Version tracking:**
   - [x] Update constitution version number
   - [x] Note version in template footers
   - [x] Add amendment to constitution history

## Common Misses

Watch for these often-forgotten updates:

- Command documentation (`/commands/*.md`)
- Checklist items in templates
- Example code/commands
- Domain-specific variations (web vs mobile vs CLI)
- Cross-references between documents

## Template Sync Status

Last sync check: 2025-09-10

- Constitution version: 1.1.0
- Templates aligned: ✅ (removed TDD/testing, updated for manual review)

---

_This checklist ensures the constitution's principles are consistently applied across all project documentation._
