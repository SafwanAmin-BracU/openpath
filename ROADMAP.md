# OpenPath Changelog

**Last updated:** Sunday, July 20, 2025, 6:16 AM +06

---

## Iteration-01: Core Matching & Discovery

### [New Features]

- **Dynamic Skill Filtering:**  
  - Added multi-layer filter for language, framework, and domain.
  - Implemented search auto-suggestions.

- **Difficulty Tier System:**  
  - Developed logic to auto-categorize issues using codebase size, PR stats, and maintainer response.
  - Visual representation of beginner, intermediate, advanced labels.

- **Project Viability Scoring:**  
  - Aggregates documentation, activity, and maintainer engagement metrics.
  - Score (1–10) visible on dashboard and project details.

### [UI/UX]

- **Main Dashboard:**  
  - Project/issue listing with filter sidebar and quick sort.
  - Repository cards display health score, key tags, and top metrics.
  - Issue modal with difficulty indicator and smart labels.

- **Project Detail Pages:**  
  - Expanded metrics: stars, forks, docs, last commit, responsiveness.

---

## [Setup & Infra]

- Set up MVC repo with SvelteKit for frontend, Hono.js backend, PostgreSQL and Redis.
- Integrated GitHub OAuth (read:user, repo scopes).
- Scaffold for user onboarding page.

---

## [Known Gaps/Risks]

- Project health scoring currently uses derived metrics (commit age, issue ratios).  
- No real-time webhook refresh; fallback is 15min polling.

---

## [To Do for Next Iteration]

- Build out PR tracking integration.
- Portfolio analytics (user contributions, growth charts).
- Begin work on PDF export module.

---
