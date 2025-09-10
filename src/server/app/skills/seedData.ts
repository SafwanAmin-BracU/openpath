/**
 * Seed data for the Skills Development System
 * This file contains initial data for tutorials, badges, and etiquette guides
 */

export const TUTORIAL_SEED_DATA = [
  {
    title: "Git Basics: Your First Commit",
    description: "Learn the fundamentals of version control with Git. Master basic commands and workflows.",
    category: "version-control",
    difficulty: "beginner",
    estimatedTime: 15,
    steps: [
      {
        id: "git_init",
        title: "Initialize a Git Repository",
        description: "Learn how to create a new Git repository for your project.",
        instructions: [
          "Open your terminal or command prompt",
          "Navigate to your project directory",
          "Run the command: git init",
          "Verify the repository was created by checking for a .git folder"
        ],
        type: "instruction",
        expectedOutcome: "A new Git repository is initialized in your project directory"
      },
      {
        id: "git_add",
        title: "Stage Files for Commit",
        description: "Add files to the staging area before committing them.",
        instructions: [
          "Create a simple text file (e.g., README.md)",
          "Check the status with: git status",
          "Add the file to staging: git add README.md",
          "Or add all files: git add .",
          "Check status again to see staged files"
        ],
        type: "exercise",
        expectedOutcome: "Files are properly staged and ready for commit"
      },
      {
        id: "git_commit",
        title: "Make Your First Commit",
        description: "Create your first commit with a meaningful message.",
        instructions: [
          "Commit the staged files: git commit -m 'Initial commit'",
          "View commit history: git log",
          "Check the current status: git status"
        ],
        type: "exercise",
        expectedOutcome: "Your first commit is created successfully"
      }
    ],
    validationRules: [
      {
        stepId: "git_init",
        type: "command",
        criteria: { expectedCommand: "git init" },
        successMessage: "Repository initialized successfully!",
        failureMessage: "Please run 'git init' to initialize the repository"
      },
      {
        stepId: "git_add",
        type: "command",
        criteria: { expectedCommand: "git add" },
        successMessage: "Files staged successfully!",
        failureMessage: "Please stage your files with 'git add'"
      },
      {
        stepId: "git_commit",
        type: "command",
        criteria: { expectedCommand: "git commit" },
        successMessage: "First commit created successfully!",
        failureMessage: "Please create your commit with 'git commit -m \"message\"'"
      }
    ]
  },
  {
    title: "Branching and Merging",
    description: "Master Git branching strategies and conflict resolution techniques.",
    category: "version-control",
    difficulty: "intermediate",
    estimatedTime: 25,
    steps: [
      {
        id: "create_branch",
        title: "Create and Switch Branches",
        description: "Learn to create feature branches for isolated development.",
        instructions: [
          "Create a new branch: git checkout -b feature-branch",
          "Make some changes to files",
          "Stage and commit the changes",
          "Switch back to main: git checkout main"
        ],
        type: "exercise",
        expectedOutcome: "New branch created and switched successfully"
      },
      {
        id: "merge_branches",
        title: "Merge Branches",
        description: "Combine changes from different branches.",
        instructions: [
          "Ensure you're on the main branch",
          "Merge the feature branch: git merge feature-branch",
          "Resolve any merge conflicts if they occur",
          "Delete the merged branch: git branch -d feature-branch"
        ],
        type: "exercise",
        expectedOutcome: "Branches merged successfully without conflicts"
      }
    ],
    validationRules: [
      {
        stepId: "create_branch",
        type: "command",
        criteria: { expectedCommand: "git checkout -b" },
        successMessage: "Branch created successfully!",
        failureMessage: "Please create a new branch with 'git checkout -b'"
      },
      {
        stepId: "merge_branches",
        type: "command",
        criteria: { expectedCommand: "git merge" },
        successMessage: "Branches merged successfully!",
        failureMessage: "Please merge the branches with 'git merge'"
      }
    ]
  },
  {
    title: "Pull Request Workflow",
    description: "Learn the complete pull request process from fork to merge.",
    category: "pr-practice",
    difficulty: "intermediate",
    estimatedTime: 30,
    steps: [
      {
        id: "fork_repo",
        title: "Fork a Repository",
        description: "Create your own copy of a repository to work on.",
        instructions: [
          "Find a repository on GitHub you want to contribute to",
          "Click the 'Fork' button in the top right",
          "Clone your fork: git clone https://github.com/YOUR_USERNAME/REPO_NAME.git",
          "Set up the upstream remote: git remote add upstream https://github.com/ORIGINAL_OWNER/REPO_NAME.git"
        ],
        type: "instruction",
        expectedOutcome: "Repository forked and cloned locally"
      },
      {
        id: "create_pr_branch",
        title: "Create a Pull Request Branch",
        description: "Create a dedicated branch for your pull request.",
        instructions: [
          "Create and switch to a new branch: git checkout -b fix-issue-123",
          "Make your changes and commit them",
          "Push the branch: git push origin fix-issue-123"
        ],
        type: "exercise",
        expectedOutcome: "PR branch created and pushed to your fork"
      },
      {
        id: "submit_pr",
        title: "Submit Pull Request",
        description: "Create a pull request on GitHub.",
        instructions: [
          "Go to your fork on GitHub",
          "Click 'Compare & pull request'",
          "Write a clear title and description",
          "Click 'Create pull request'"
        ],
        type: "instruction",
        expectedOutcome: "Pull request submitted successfully"
      }
    ],
    validationRules: [
      {
        stepId: "fork_repo",
        type: "manual",
        criteria: { requiresFork: true },
        successMessage: "Repository forked successfully!",
        failureMessage: "Please fork the repository on GitHub"
      },
      {
        stepId: "create_pr_branch",
        type: "command",
        criteria: { expectedCommand: "git push" },
        successMessage: "Branch pushed successfully!",
        failureMessage: "Please push your branch with 'git push'"
      },
      {
        stepId: "submit_pr",
        type: "manual",
        criteria: { requiresPR: true },
        successMessage: "Pull request submitted successfully!",
        failureMessage: "Please create a pull request on GitHub"
      }
    ]
  }
];

export const BADGE_SEED_DATA = [
  {
    name: "First Commit",
    description: "Made your first Git commit",
    icon: "🎯",
    category: "tutorial",
    criteria: {
      type: "tutorial_completion",
      target: "git-basics"
    },
    points: 10,
    rarity: "common"
  },
  {
    name: "Branch Master",
    description: "Successfully created and merged Git branches",
    icon: "🌿",
    category: "tutorial",
    criteria: {
      type: "tutorial_completion",
      target: "branching-merging"
    },
    points: 15,
    rarity: "common"
  },
  {
    name: "PR Pioneer",
    description: "Submitted your first pull request",
    icon: "🚀",
    category: "milestone",
    criteria: {
      type: "milestone",
      target: "first_pr"
    },
    points: 25,
    rarity: "rare"
  },
  {
    name: "Etiquette Master",
    description: "Completed open source etiquette training",
    icon: "🤝",
    category: "tutorial",
    criteria: {
      type: "tutorial_completion",
      target: "etiquette_master"
    },
    points: 20,
    rarity: "rare"
  },
  {
    name: "Conflict Resolver",
    description: "Successfully resolved merge conflicts",
    icon: "🛠️",
    category: "milestone",
    criteria: {
      type: "milestone",
      target: "conflict_resolution"
    },
    points: 30,
    rarity: "epic"
  },
  {
    name: "Open Source Contributor",
    description: "Made 5 successful contributions",
    icon: "⭐",
    category: "contribution",
    criteria: {
      type: "contribution_count",
      target: 5
    },
    points: 50,
    rarity: "epic"
  }
];

export const ETIQUETTE_SEED_DATA = [
  {
    title: "How to Write Good Issues",
    description: "Learn to write clear, actionable issue reports that maintainers love.",
    category: "communication",
    difficulty: "beginner",
    estimatedTime: 10,
    lessons: [
      {
        id: "issue_title",
        title: "Writing Effective Issue Titles",
        content: "A good issue title should be descriptive and specific. It should clearly indicate what the issue is about without being too long.",
        keyPoints: [
          "Be specific about the problem",
          "Include relevant context (e.g., 'Login button not working on mobile')",
          "Avoid generic titles like 'Bug' or 'Help needed'",
          "Use proper capitalization and punctuation"
        ],
        examples: [
          "✅ Good: 'Login form validation fails when using special characters in password'",
          "❌ Bad: 'Bug with login'"
        ]
      },
      {
        id: "issue_description",
        title: "Crafting Detailed Descriptions",
        content: "The issue description should provide all the information a maintainer needs to understand and potentially fix the problem.",
        keyPoints: [
          "Describe what you expected to happen",
          "Explain what actually happened",
          "Include steps to reproduce the issue",
          "Mention your environment (OS, browser, version)",
          "Add screenshots or code snippets when relevant"
        ],
        doDontList: {
          do: [
            "Provide step-by-step reproduction instructions",
            "Include error messages and stack traces",
            "Mention if this is a regression from a previous version",
            "Be polite and appreciative of maintainers' time"
          ],
          dont: [
            "Demand immediate fixes or use entitled language",
            "Post duplicate issues without searching first",
            "Include sensitive information or credentials",
            "Tag multiple people unnecessarily"
          ]
        }
      }
    ],
    quiz: [
      {
        id: "issue_title_quiz",
        question: "Which of these is the best issue title?",
        type: "multiple-choice",
        options: [
          "Bug",
          "Login not working",
          "Login form validation fails when password contains special characters",
          "Help needed urgently"
        ],
        correctAnswer: "Login form validation fails when password contains special characters",
        explanation: "The best title is specific, descriptive, and clearly indicates the problem without being too verbose."
      },
      {
        id: "issue_description_quiz",
        question: "What should you include in an issue description?",
        type: "multiple-choice",
        options: [
          "Only the error message",
          "Steps to reproduce, expected vs actual behavior, and environment details",
          "Just your opinion about the problem",
          "Demands for when the fix should be completed"
        ],
        correctAnswer: "Steps to reproduce, expected vs actual behavior, and environment details",
        explanation: "A good issue description helps maintainers understand and fix the problem efficiently."
      }
    ],
    passingScore: 70
  },
  {
    title: "Communication with Maintainers",
    description: "Master the art of professional communication in open source communities.",
    category: "communication",
    difficulty: "intermediate",
    estimatedTime: 15,
    lessons: [
      {
        id: "professional_tone",
        title: "Maintaining Professional Tone",
        content: "Open source communication should be respectful, clear, and constructive.",
        keyPoints: [
          "Use polite language and proper grammar",
          "Be patient when waiting for responses",
          "Express appreciation for maintainers' work",
          "Focus on facts rather than emotions"
        ]
      },
      {
        id: "asking_questions",
        title: "Asking Good Questions",
        content: "Well-formulated questions get better answers and show respect for others' time.",
        keyPoints: [
          "Search existing issues and documentation first",
          "Provide context about what you've already tried",
          "Be specific about what you need help with",
          "Use clear, concise language"
        ],
        doDontList: {
          do: [
            "Explain what you're trying to accomplish",
            "Share relevant code or error messages",
            "Mention what you've already researched",
            "Thank people for their help"
          ],
          dont: [
            "Ask vague questions like 'How do I fix this?'",
            "Expect immediate responses",
            "Demand that others do your work for you",
            "Get frustrated if you don't understand something immediately"
          ]
        }
      }
    ],
    quiz: [
      {
        id: "tone_quiz",
        question: "Which response shows the most appropriate tone for open source communication?",
        type: "multiple-choice",
        options: [
          "'This is broken! Fix it now!'",
          "'I noticed an issue with the login functionality. Could you help me understand what's causing this?'",
          "'Why isn't this working? This is ridiculous!'",
          "'I demand you fix this immediately!'"
        ],
        correctAnswer: "'I noticed an issue with the login functionality. Could you help me understand what's causing this?'",
        explanation: "Professional communication is polite, specific, and shows respect for maintainers' time and expertise."
      }
    ],
    passingScore: 70
  }
];
