/**
 * Mock data for OpenPath Portfolio
 * This file contains sample data to populate a student's contribution portfolio
 */

import { contributions, skills, contributionSkills, resolvedIssues, contributionMetrics } from "~/server/db/schema";

// Mock user ID (replace with actual user ID when seeding)
const MOCK_USER_ID = "mock-user-123";

// Mock contributions data
export const MOCK_CONTRIBUTIONS = [
  {
    userId: MOCK_USER_ID,
    prId: "PR_kwDOB8JZ4M5abc123",
    prNumber: 42,
    title: "Add dark mode support to dashboard",
    url: "https://github.com/vercel/next.js/pull/42",
    repositoryName: "next.js",
    repositoryOwner: "vercel",
    mergedAt: new Date("2024-01-15T10:30:00Z"),
    additions: 1250,
    deletions: 340,
    changedFiles: 8,
    primaryLanguage: "TypeScript",
    labels: ["enhancement", "frontend", "good first issue"],
    files: [
      "src/components/Dashboard.tsx",
      "src/styles/dark-theme.css",
      "src/hooks/useTheme.ts",
      "src/utils/theme-helpers.ts",
      "src/components/Header.tsx",
      "src/components/Sidebar.tsx",
      "src/pages/dashboard.tsx",
      "src/styles/globals.css"
    ],
  },
  {
    userId: MOCK_USER_ID,
    prId: "PR_kwDOB8JZ4M5def456",
    prNumber: 28,
    title: "Fix memory leak in data fetching hook",
    url: "https://github.com/facebook/react/pull/28",
    repositoryName: "react",
    repositoryOwner: "facebook",
    mergedAt: new Date("2024-01-22T14:15:00Z"),
    additions: 45,
    deletions: 23,
    changedFiles: 2,
    primaryLanguage: "JavaScript",
    labels: ["bug", "performance", "hooks"],
    files: [
      "src/hooks/useData.ts",
      "src/hooks/__tests__/useData.test.js"
    ],
  },
  {
    userId: MOCK_USER_ID,
    prId: "PR_kwDOB8JZ4M5ghi789",
    prNumber: 156,
    title: "Add TypeScript support for configuration files",
    url: "https://github.com/microsoft/vscode/pull/156",
    repositoryName: "vscode",
    repositoryOwner: "microsoft",
    mergedAt: new Date("2024-02-05T09:45:00Z"),
    additions: 890,
    deletions: 120,
    changedFiles: 12,
    primaryLanguage: "TypeScript",
    labels: ["enhancement", "typescript", "configuration"],
    files: [
      "src/vs/workbench/services/configuration/common/configuration.ts",
      "src/vs/workbench/services/configuration/browser/configurationService.ts",
      "src/vs/workbench/services/configuration/electron-sandbox/configurationService.ts",
      "src/vs/platform/configuration/common/configurationModels.ts",
      "src/vs/platform/configuration/common/configurationRegistry.ts",
      "src/vs/workbench/contrib/preferences/browser/settingsEditor2.ts",
      "src/vs/workbench/contrib/preferences/common/settingsEditorModel.ts",
      "src/vs/workbench/services/preferences/common/preferences.ts",
      "src/vs/workbench/services/preferences/browser/preferencesService.ts",
      "src/vs/platform/jsonschema/common/jsonSchema.ts",
      "src/vs/platform/jsonschema/browser/jsonSchemaService.ts",
      "src/vs/workbench/services/textmodel/common/textModelService.ts"
    ],
  },
  {
    userId: MOCK_USER_ID,
    prId: "PR_kwDOB8JZ4M5jkl012",
    prNumber: 89,
    title: "Improve error handling in API routes",
    url: "https://github.com/vercel/next.js/pull/89",
    repositoryName: "next.js",
    repositoryOwner: "vercel",
    mergedAt: new Date("2024-02-12T16:20:00Z"),
    additions: 156,
    deletions: 67,
    changedFiles: 5,
    primaryLanguage: "TypeScript",
    labels: ["enhancement", "api", "error-handling"],
    files: [
      "src/server/api/auth.ts",
      "src/server/api/users.ts",
      "src/server/middleware/error-handler.ts",
      "src/utils/api-helpers.ts",
      "src/types/api.ts"
    ],
  },
  {
    userId: MOCK_USER_ID,
    prId: "PR_kwDOB8JZ4M5mno345",
    prNumber: 234,
    title: "Add unit tests for utility functions",
    url: "https://github.com/lodash/lodash/pull/234",
    repositoryName: "lodash",
    repositoryOwner: "lodash",
    mergedAt: new Date("2024-02-28T11:30:00Z"),
    additions: 567,
    deletions: 23,
    changedFiles: 15,
    primaryLanguage: "JavaScript",
    labels: ["testing", "enhancement", "utilities"],
    files: [
      "test/array.test.js",
      "test/object.test.js",
      "test/string.test.js",
      "test/util.test.js",
      "test/lang.test.js",
      "src/array.js",
      "src/object.js",
      "src/string.js",
      "src/util.js",
      "src/lang.js",
      "src/index.js",
      "test/mocha.opts",
      "test/helpers.js",
      "test/setup.js",
      "test/teardown.js"
    ],
  },
  {
    userId: MOCK_USER_ID,
    prId: "PR_kwDOB8JZ4M5pqr678",
    prNumber: 67,
    title: "Update documentation for new features",
    url: "https://github.com/facebook/react/pull/67",
    repositoryName: "react",
    repositoryOwner: "facebook",
    mergedAt: new Date("2024-03-08T13:45:00Z"),
    additions: 2340,
    deletions: 890,
    changedFiles: 8,
    primaryLanguage: "Markdown",
    labels: ["documentation", "enhancement"],
    files: [
      "docs/hooks-reference.md",
      "docs/getting-started.md",
      "docs/advanced-guides.md",
      "docs/contributing.md",
      "docs/code-of-conduct.md",
      "docs/maintainers.md",
      "README.md",
      "CHANGELOG.md"
    ],
  },
  {
    userId: MOCK_USER_ID,
    prId: "PR_kwDOB8JZ4M5stu901",
    prNumber: 145,
    title: "Optimize database queries for better performance",
    url: "https://github.com/prisma/prisma/pull/145",
    repositoryName: "prisma",
    repositoryOwner: "prisma",
    mergedAt: new Date("2024-03-15T08:20:00Z"),
    additions: 78,
    deletions: 45,
    changedFiles: 3,
    primaryLanguage: "TypeScript",
    labels: ["performance", "database", "optimization"],
    files: [
      "src/packages/client/src/runtime/query.ts",
      "src/packages/client/src/runtime/getPrismaClient.ts",
      "src/packages/client/src/generation/generator.ts"
    ],
  },
  {
    userId: MOCK_USER_ID,
    prId: "PR_kwDOB8JZ4M5vwx234",
    prNumber: 78,
    title: "Add accessibility improvements to components",
    url: "https://github.com/mui/material-ui/pull/78",
    repositoryName: "material-ui",
    repositoryOwner: "mui",
    mergedAt: new Date("2024-03-22T15:10:00Z"),
    additions: 345,
    deletions: 123,
    changedFiles: 7,
    primaryLanguage: "TypeScript",
    labels: ["accessibility", "enhancement", "components"],
    files: [
      "packages/mui-material/src/Button/Button.tsx",
      "packages/mui-material/src/TextField/TextField.tsx",
      "packages/mui-material/src/Dialog/Dialog.tsx",
      "packages/mui-material/src/Menu/Menu.tsx",
      "packages/mui-material/src/Tooltip/Tooltip.tsx",
      "packages/mui-material/src/Chip/Chip.tsx",
      "packages/mui-system/src/styleFunctionSx.js"
    ],
  },
  {
    userId: MOCK_USER_ID,
    prId: "PR_kwDOB8JZ4M5yzab567",
    prNumber: 112,
    title: "Implement CI/CD pipeline improvements",
    url: "https://github.com/actions/toolkit/pull/112",
    repositoryName: "toolkit",
    repositoryOwner: "actions",
    mergedAt: new Date("2024-04-02T12:00:00Z"),
    additions: 678,
    deletions: 234,
    changedFiles: 9,
    primaryLanguage: "TypeScript",
    labels: ["ci", "automation", "infrastructure"],
    files: [
      ".github/workflows/ci.yml",
      ".github/workflows/release.yml",
      "src/toolkit.ts",
      "src/cache.ts",
      "src/store.ts",
      "src/exec.ts",
      "src/artifact.ts",
      "src/project.ts",
      "package.json"
    ],
  },
  {
    userId: MOCK_USER_ID,
    prId: "PR_kwDOB8JZ4M5cdef890",
    prNumber: 203,
    title: "Add security headers and CSRF protection",
    url: "https://github.com/expressjs/express/pull/203",
    repositoryName: "express",
    repositoryOwner: "expressjs",
    mergedAt: new Date("2024-04-10T17:30:00Z"),
    additions: 189,
    deletions: 67,
    changedFiles: 4,
    primaryLanguage: "JavaScript",
    labels: ["security", "enhancement", "middleware"],
    files: [
      "lib/security.js",
      "lib/middleware/csrf.js",
      "test/security.test.js",
      "examples/security-demo.js"
    ],
  }
];

// Mock skills data
export const MOCK_SKILLS = [
  {
    userId: MOCK_USER_ID,
    name: "TypeScript",
    category: "language",
    proficiency: 8,
    firstUsed: new Date("2023-08-01"),
    lastUsed: new Date("2024-04-10"),
    totalContributions: 5,
  },
  {
    userId: MOCK_USER_ID,
    name: "JavaScript",
    category: "language",
    proficiency: 9,
    firstUsed: new Date("2023-06-01"),
    lastUsed: new Date("2024-04-10"),
    totalContributions: 4,
  },
  {
    userId: MOCK_USER_ID,
    name: "React",
    category: "framework",
    proficiency: 7,
    firstUsed: new Date("2023-09-01"),
    lastUsed: new Date("2024-03-08"),
    totalContributions: 3,
  },
  {
    userId: MOCK_USER_ID,
    name: "Next.js",
    category: "framework",
    proficiency: 6,
    firstUsed: new Date("2023-10-01"),
    lastUsed: new Date("2024-02-12"),
    totalContributions: 2,
  },
  {
    userId: MOCK_USER_ID,
    name: "Node.js",
    category: "runtime",
    proficiency: 7,
    firstUsed: new Date("2023-07-01"),
    lastUsed: new Date("2024-04-10"),
    totalContributions: 3,
  },
  {
    userId: MOCK_USER_ID,
    name: "CSS",
    category: "language",
    proficiency: 8,
    firstUsed: new Date("2023-06-01"),
    lastUsed: new Date("2024-01-15"),
    totalContributions: 1,
  },
  {
    userId: MOCK_USER_ID,
    name: "HTML",
    category: "language",
    proficiency: 9,
    firstUsed: new Date("2023-06-01"),
    lastUsed: new Date("2024-01-15"),
    totalContributions: 1,
  },
  {
    userId: MOCK_USER_ID,
    name: "Git",
    category: "tool",
    proficiency: 8,
    firstUsed: new Date("2023-06-01"),
    lastUsed: new Date("2024-04-10"),
    totalContributions: 10,
  },
  {
    userId: MOCK_USER_ID,
    name: "Docker",
    category: "tool",
    proficiency: 5,
    firstUsed: new Date("2024-04-02"),
    lastUsed: new Date("2024-04-02"),
    totalContributions: 1,
  },
  {
    userId: MOCK_USER_ID,
    name: "Testing",
    category: "skill",
    proficiency: 6,
    firstUsed: new Date("2024-01-22"),
    lastUsed: new Date("2024-02-28"),
    totalContributions: 2,
  },
  {
    userId: MOCK_USER_ID,
    name: "API Development",
    category: "skill",
    proficiency: 7,
    firstUsed: new Date("2024-02-12"),
    lastUsed: new Date("2024-04-10"),
    totalContributions: 2,
  },
  {
    userId: MOCK_USER_ID,
    name: "Performance Optimization",
    category: "skill",
    proficiency: 6,
    firstUsed: new Date("2024-01-22"),
    lastUsed: new Date("2024-03-15"),
    totalContributions: 2,
  }
];

// Mock resolved issues data
export const MOCK_RESOLVED_ISSUES = [
  {
    userId: MOCK_USER_ID,
    issueId: "I_kwDOB8JZ4M5abc001",
    issueNumber: 38,
    title: "Dark mode toggle not working on mobile devices",
    url: "https://github.com/vercel/next.js/issues/38",
    repositoryName: "next.js",
    repositoryOwner: "vercel",
    resolvedAt: new Date("2024-01-15T10:30:00Z"),
    resolvedBy: "PR_kwDOB8JZ4M5abc123",
    labels: ["bug", "mobile", "good first issue"],
  },
  {
    userId: MOCK_USER_ID,
    issueId: "I_kwDOB8JZ4M5def002",
    issueNumber: 25,
    title: "Memory leak in useData hook causing performance issues",
    url: "https://github.com/facebook/react/issues/25",
    repositoryName: "react",
    repositoryOwner: "facebook",
    resolvedAt: new Date("2024-01-22T14:15:00Z"),
    resolvedBy: "PR_kwDOB8JZ4M5def456",
    labels: ["bug", "performance", "hooks"],
  },
  {
    userId: MOCK_USER_ID,
    issueId: "I_kwDOB8JZ4M5ghi003",
    issueNumber: 142,
    title: "TypeScript configuration not working for .config files",
    url: "https://github.com/microsoft/vscode/issues/142",
    repositoryName: "vscode",
    repositoryOwner: "microsoft",
    resolvedAt: new Date("2024-02-05T09:45:00Z"),
    resolvedBy: "PR_kwDOB8JZ4M5ghi789",
    labels: ["enhancement", "typescript", "configuration"],
  },
  {
    userId: MOCK_USER_ID,
    issueId: "I_kwDOB8JZ4M5jkl004",
    issueNumber: 76,
    title: "API routes not handling errors properly",
    url: "https://github.com/vercel/next.js/issues/76",
    repositoryName: "next.js",
    repositoryOwner: "vercel",
    resolvedAt: new Date("2024-02-12T16:20:00Z"),
    resolvedBy: "PR_kwDOB8JZ4M5jkl012",
    labels: ["bug", "api", "error-handling"],
  },
  {
    userId: MOCK_USER_ID,
    issueId: "I_kwDOB8JZ4M5mno005",
    issueNumber: 198,
    title: "Missing unit tests for utility functions",
    url: "https://github.com/lodash/lodash/issues/198",
    repositoryName: "lodash",
    repositoryOwner: "lodash",
    resolvedAt: new Date("2024-02-28T11:30:00Z"),
    resolvedBy: "PR_kwDOB8JZ4M5pqr678",
    labels: ["enhancement", "testing", "help wanted"],
  }
];

// Mock contribution metrics data
export const MOCK_CONTRIBUTION_METRICS = [
  {
    userId: MOCK_USER_ID,
    period: "monthly",
    periodStart: new Date("2024-03-01"),
    periodEnd: new Date("2024-03-31"),
    totalContributions: 3,
    totalAdditions: 2675,
    totalDeletions: 1033,
    totalFilesChanged: 15,
    resolvedIssues: 2,
    repositoriesContributed: 3,
    languagesUsed: ["TypeScript", "JavaScript", "Markdown"],
    skillsDemonstrated: ["TypeScript", "React", "Documentation", "Performance Optimization"],
  },
  {
    userId: MOCK_USER_ID,
    period: "quarterly",
    periodStart: new Date("2024-01-01"),
    periodEnd: new Date("2024-03-31"),
    totalContributions: 7,
    totalAdditions: 4561,
    totalDeletions: 1516,
    totalFilesChanged: 53,
    resolvedIssues: 5,
    repositoriesContributed: 5,
    languagesUsed: ["TypeScript", "JavaScript", "Markdown"],
    skillsDemonstrated: ["TypeScript", "JavaScript", "React", "Next.js", "Testing", "API Development", "Performance Optimization"],
  },
  {
    userId: MOCK_USER_ID,
    period: "yearly",
    periodStart: new Date("2024-01-01"),
    periodEnd: new Date("2024-12-31"),
    totalContributions: 10,
    totalAdditions: 5926,
    totalDeletions: 1913,
    totalFilesChanged: 71,
    resolvedIssues: 5,
    repositoriesContributed: 8,
    languagesUsed: ["TypeScript", "JavaScript", "Markdown", "CSS", "HTML"],
    skillsDemonstrated: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "CSS", "HTML", "Git", "Testing", "API Development", "Performance Optimization", "Docker"],
  }
];

// Helper function to generate contribution-skill links
export const generateContributionSkillLinks = (contributions: any[], skills: any[]) => {
  const links: Array<{contributionId: string, skillId: string, confidence: number}> = [];

  // Create mappings for skills
  const skillMap = {
    "TypeScript": ["TypeScript"],
    "JavaScript": ["JavaScript"],
    "React": ["React", "JavaScript"],
    "Next.js": ["Next.js", "React", "TypeScript"],
    "Node.js": ["Node.js", "JavaScript"],
    "CSS": ["CSS"],
    "HTML": ["HTML"],
    "Git": ["Git"],
    "Docker": ["Docker"],
    "Testing": ["Testing", "JavaScript"],
    "API Development": ["API Development", "Node.js"],
    "Performance Optimization": ["Performance Optimization"],
  };

  contributions.forEach((contribution, contribIndex) => {
    const contributionId = `mock-contrib-${contribIndex + 1}`;

    // Determine which skills apply to this contribution
    let applicableSkills: string[] = [];

    if (contribution.primaryLanguage === "TypeScript") {
      applicableSkills = ["TypeScript"];
    } else if (contribution.primaryLanguage === "JavaScript") {
      applicableSkills = ["JavaScript"];
    } else if (contribution.primaryLanguage === "Markdown") {
      applicableSkills = ["Documentation"];
    }

    // Add framework-specific skills
    if (contribution.repositoryName === "next.js") {
      applicableSkills.push("Next.js", "React");
    } else if (contribution.repositoryName === "react") {
      applicableSkills.push("React");
    } else if (contribution.repositoryName === "vscode") {
      applicableSkills.push("TypeScript");
    }

    // Add general skills based on PR content
    if (contribution.title.toLowerCase().includes("test")) {
      applicableSkills.push("Testing");
    }
    if (contribution.title.toLowerCase().includes("api")) {
      applicableSkills.push("API Development");
    }
    if (contribution.title.toLowerCase().includes("performance") || contribution.title.toLowerCase().includes("optimize")) {
      applicableSkills.push("Performance Optimization");
    }
    if (contribution.title.toLowerCase().includes("ci") || contribution.title.toLowerCase().includes("docker")) {
      applicableSkills.push("Docker");
    }

    // Remove duplicates
    applicableSkills = [...new Set(applicableSkills)];

    // Create links for applicable skills
    applicableSkills.forEach(skillName => {
      const skill = skills.find(s => s.name === skillName);
      if (skill) {
        links.push({
          contributionId,
          skillId: `mock-skill-${skills.indexOf(skill) + 1}`,
          confidence: Math.floor(Math.random() * 4) + 6, // 6-9 confidence
        });
      }
    });
  });

  return links;
};

// Export all mock data
export const MOCK_PORTFOLIO_DATA = {
  contributions: MOCK_CONTRIBUTIONS,
  skills: MOCK_SKILLS,
  resolvedIssues: MOCK_RESOLVED_ISSUES,
  contributionMetrics: MOCK_CONTRIBUTION_METRICS,
  contributionSkillLinks: [], // Will be populated by generateContributionSkillLinks
};
