# OpenPath Portfolio Mock Data

This directory contains mock data and seeding scripts for populating the OpenPath portfolio system with realistic sample data for demonstration and testing purposes.

## Overview

The mock data includes:

- **10 realistic contributions** across popular repositories (Next.js, React, VS Code, etc.)
- **12 skills** with proficiency levels and usage tracking
- **5 resolved issues** demonstrating problem-solving impact
- **3 contribution metrics** for different time periods (monthly, quarterly, yearly)
- **Contribution-skill relationships** linking contributions to demonstrated skills

## Mock Data Structure

### Contributions

The mock contributions represent a student's journey from beginner to intermediate level:

- **Beginner**: Basic bug fixes and documentation updates
- **Intermediate**: Feature implementations and performance optimizations
- **Advanced**: Complex refactoring and architectural improvements

### Skills

Skills are categorized and include:

- **Languages**: TypeScript, JavaScript, CSS, HTML
- **Frameworks**: React, Next.js
- **Tools**: Git, Docker
- **Skills**: Testing, API Development, Performance Optimization

### Metrics

Metrics provide insights into:

- Contribution velocity and impact
- Language and repository diversity
- Skill development over time
- Issue resolution effectiveness

## Usage

### Prerequisites

1. Ensure PostgreSQL is running and accessible
2. Set the `AUTH_DRIZZLE_URL` environment variable with your database connection string
3. Install dependencies: `bun install`

### Seeding the Database

Run the seeding script to populate your database with mock data:

```bash
# Using bun (recommended)
bun run seed:portfolio

# Or using npm
npm run seed:portfolio
```

### What the Script Does

1. **Clears existing mock data** for user ID `mock-user-123`
2. **Inserts mock contributions** with realistic GitHub PR data
3. **Inserts mock skills** with proficiency tracking
4. **Inserts mock resolved issues** showing impact
5. **Inserts mock metrics** for different time periods
6. **Creates skill-contribution relationships** based on PR content analysis

### Viewing the Portfolio

After seeding, you can view the portfolio at `/portfolio` in your application. The mock data will display:

- **Statistics Dashboard**: Total contributions, lines of code, repositories contributed to
- **Skills Overview**: Proficiency levels and usage tracking
- **Recent Contributions**: Timeline of merged pull requests
- **Impact Metrics**: Quantitative measures of contribution impact

## Mock User Details

- **User ID**: `mock-user-123`
- **Contribution Period**: June 2023 - April 2024
- **Primary Languages**: TypeScript, JavaScript
- **Focus Areas**: Frontend development, performance optimization, testing

## Customization

### Modifying Mock Data

Edit `src/server/app/portfolio/mockData.ts` to:

- Change contribution details and repositories
- Adjust skill proficiency levels
- Modify time periods and metrics
- Add or remove contributions

### Adding More Data

To add more mock contributions:

1. Add entries to `MOCK_CONTRIBUTIONS` array
2. Update `MOCK_SKILLS` if new skills are introduced
3. Adjust metrics in `MOCK_CONTRIBUTION_METRICS`
4. The `generateContributionSkillLinks` function will automatically create relationships

## Files

- `src/server/app/portfolio/mockData.ts` - Mock data definitions
- `scripts/seed-portfolio-mock-data.ts` - Database seeding script
- `package.json` - Updated with seeding script

## Notes

- All mock data uses realistic GitHub repository names and contribution patterns
- Skills are automatically detected based on PR titles, languages, and repository names
- Metrics are calculated to show progressive improvement over time
- The mock user represents a typical computer science student's contribution journey

## Troubleshooting

### Database Connection Issues

Ensure `AUTH_DRIZZLE_URL` is set correctly:

```bash
export AUTH_DRIZZLE_URL="postgresql://user:password@localhost:5432/openpath"
```

### Permission Errors

Make sure your database user has INSERT, UPDATE, and DELETE permissions on the portfolio tables.

### Duplicate Data

The seeding script clears existing mock data before inserting new data, so it's safe to run multiple times.
