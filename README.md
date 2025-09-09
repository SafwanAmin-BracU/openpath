# Project OpenPath

**Last updated:** Sunday, July 20, 2025, 6:16 AM +06

## Project Concept

OpenPath is a platform designed to connect computer science students with open-source projects, helping them discover, contribute to, and track real-world development experience. By leveraging the GitHub API, OpenPath curates personalized project matches based on a user’s skills and interests, and provides quantifiable metrics to support informed decision-making[1].

## Mission Statement

"To democratize access to open-source ecosystems by empowering students with tailored opportunities, mentorship, and verifiable proof of their impact. We turn the chaos of scattered repositories into a guided curriculum for real-world software development."[1]

---

## Key Features

### 1. Intelligent Opportunity Matching Engine

- **Dynamic Skill-Based Filtering:** Multi-layer filtering by language, framework, domain, and issue label.
- **Strategic Recommendations:** Issue recommendations based on GitHub activity, stated interests, or coursework.
- **Beginner Difficulty Grading:** Auto-classification into Beginner/Intermediate/Advanced using contributor data, codebase stats, and maintainer responsiveness.
- **Project Viability Scoring:** Projects scored (1–10) for clarity of documentation, maintainer engagement, and community activity[1].

### 2. Contribution Portfolio & Verification System

- **Automated PR Tracking:** Syncs accepted PRs from GitHub, tagging with relevant skills.
- **Impact Metrics:** Tracks lines of code, resolved issues, and contribution frequency.
- **Growth Dashboard:** Visualizes technical breadth (languages/frameworks) and depth.
- **Experience Export:** PDF/LinkedIn-ready summaries with skill heatmaps and project testimonials.

### 3. Skill Development Engine

- **Interactive Tutorials:** Hands-on labs for version control and PR practice.
- **Progress Tracking:** Earn badges for milestone achievements.
- **Open Source Etiquette:** Embedded mini-courses and etiquette guides.

---

## User Flow Summary

1. **Discovery:** Receive & filter tailored issues and projects.
2. **Contribution:** In-dashboard tracking of PRs/issues.
3. **Growth:** See skills progress and generate verifiable experience reports.

---

## Technology Stack

- **FullStack:** QwikCity
- **Styling:** Tailwindcss, DaisyUI
- **Database:** PostgreSQL (primary)
- **API:** GitHub GraphQL
