/**
 * Mock data for opportunity recommendations
 * This file contains predefined mock data for testing and development
 */

export interface MockProject {
  owner: string;
  name: string;
  language: string;
  topics: string[];
  description?: string;
  stars?: number;
  forks?: number;
}

export interface MockIssue {
  title: string;
  body: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  labels: string[];
  created_at: string;
}

export const MOCK_PROJECTS: MockProject[] = [
  // React ecosystem
  {
    owner: 'facebook',
    name: 'react',
    language: 'javascript',
    topics: ['frontend', 'ui', 'framework'],
    description: 'A JavaScript library for building user interfaces',
    stars: 200000,
    forks: 40000
  },
  {
    owner: 'vercel',
    name: 'next.js',
    language: 'javascript',
    topics: ['frontend', 'framework', 'ssr'],
    description: 'The React Framework for Production',
    stars: 100000,
    forks: 20000
  },
  {
    owner: 'mui',
    name: 'material-ui',
    language: 'javascript',
    topics: ['ui', 'components', 'design'],
    description: 'React components that implement Google\'s Material Design',
    stars: 85000,
    forks: 28000
  },
  {
    owner: 'reduxjs',
    name: 'redux',
    language: 'javascript',
    topics: ['state-management', 'frontend'],
    description: 'Predictable state container for JavaScript apps',
    stars: 59000,
    forks: 15000
  },

  // Python ecosystem
  {
    owner: 'psf',
    name: 'requests',
    language: 'python',
    topics: ['http', 'api', 'web'],
    description: 'Python HTTP for Humans.',
    stars: 49000,
    forks: 9000
  },
  {
    owner: 'django',
    name: 'django',
    language: 'python',
    topics: ['web', 'framework', 'backend'],
    description: 'The Web framework for perfectionists with deadlines.',
    stars: 68000,
    forks: 29000
  },
  {
    owner: 'pallets',
    name: 'flask',
    language: 'python',
    topics: ['web', 'microframework', 'api'],
    description: 'The Python micro framework for building web applications.',
    stars: 62000,
    forks: 17000
  },
  {
    owner: 'pandas-dev',
    name: 'pandas',
    language: 'python',
    topics: ['data-analysis', 'data-science'],
    description: 'Flexible and powerful data analysis / manipulation library for Python',
    stars: 37000,
    forks: 16000
  },

  // Go ecosystem
  {
    owner: 'golang',
    name: 'go',
    language: 'go',
    topics: ['programming-language', 'systems'],
    description: 'The Go programming language',
    stars: 108000,
    forks: 16000
  },
  {
    owner: 'kubernetes',
    name: 'kubernetes',
    language: 'go',
    topics: ['containers', 'orchestration', 'devops'],
    description: 'Production-Grade Container Scheduling and Management',
    stars: 97000,
    forks: 36000
  },
  {
    owner: 'gin-gonic',
    name: 'gin',
    language: 'go',
    topics: ['web', 'framework', 'api'],
    description: 'Gin is a HTTP web framework written in Go',
    stars: 67000,
    forks: 7300
  },

  // Rust ecosystem
  {
    owner: 'rust-lang',
    name: 'cargo',
    language: 'rust',
    topics: ['package-manager', 'build-tool'],
    description: 'The Rust package manager',
    stars: 9500,
    forks: 1200
  },
  {
    owner: 'tokio-rs',
    name: 'tokio',
    language: 'rust',
    topics: ['async', 'runtime', 'concurrency'],
    description: 'A runtime for writing reliable asynchronous applications with Rust',
    stars: 19000,
    forks: 1700
  },

  // Java ecosystem
  {
    owner: 'spring-projects',
    name: 'spring-boot',
    language: 'java',
    topics: ['framework', 'microservices', 'backend'],
    description: 'Spring Boot helps you to create Spring-powered, production-grade applications',
    stars: 65000,
    forks: 41000
  },
  {
    owner: 'square',
    name: 'retrofit',
    language: 'java',
    topics: ['http', 'api', 'android'],
    description: 'A type-safe HTTP client for Android and Java',
    stars: 41000,
    forks: 7200
  },

  // TypeScript ecosystem
  {
    owner: 'microsoft',
    name: 'vscode',
    language: 'typescript',
    topics: ['editor', 'ide', 'productivity'],
    description: 'Visual Studio Code',
    stars: 143000,
    forks: 25000
  },
  {
    owner: 'denoland',
    name: 'deno',
    language: 'typescript',
    topics: ['runtime', 'javascript', 'security'],
    description: 'A modern runtime for JavaScript and TypeScript',
    stars: 88000,
    forks: 4700
  },
  {
    owner: 'nestjs',
    name: 'nestjs',
    language: 'typescript',
    topics: ['framework', 'backend', 'nodejs'],
    description: 'A progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
    stars: 57000,
    forks: 6800
  },

  // DevOps/Tools
  {
    owner: 'docker',
    name: 'docker',
    language: 'go',
    topics: ['containers', 'devops', 'deployment'],
    description: 'Docker - Build, Ship, and Run Any App, Anywhere',
    stars: 65000,
    forks: 20000
  },
  {
    owner: 'prettier',
    name: 'prettier',
    language: 'javascript',
    topics: ['code-formatter', 'tooling'],
    description: 'Prettier is an opinionated code formatter',
    stars: 45000,
    forks: 3800
  },

  // Mobile Development
  {
    owner: 'flutter',
    name: 'flutter',
    language: 'dart',
    topics: ['mobile', 'cross-platform', 'ui'],
    description: 'Flutter makes it easy and fast to build beautiful apps for mobile and beyond',
    stars: 148000,
    forks: 24000
  },
  {
    owner: 'react-native',
    name: 'react-native',
    language: 'javascript',
    topics: ['mobile', 'react', 'cross-platform'],
    description: 'A framework for building native apps with React',
    stars: 108000,
    forks: 23000
  },

  // Database
  {
    owner: 'prisma',
    name: 'prisma',
    language: 'typescript',
    topics: ['orm', 'database', 'typescript'],
    description: 'Next-generation ORM for TypeScript & Node.js',
    stars: 29000,
    forks: 1800
  }
];

export const MOCK_ISSUES: Record<string, MockIssue[]> = {
  'facebook/react': [
    {
      title: 'Add support for React Server Components in testing utilities',
      body: 'We need to update our testing utilities to properly support React Server Components. This involves updating the render methods and adding new test helpers.',
      difficulty: 'intermediate',
      labels: ['enhancement', 'testing', 'react-server-components'],
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      title: 'Improve error messages for invalid JSX attributes',
      body: 'The current error messages for invalid JSX attributes are not very helpful. We should provide more descriptive error messages that guide developers to the correct syntax.',
      difficulty: 'beginner',
      labels: ['good first issue', 'enhancement', 'dx'],
      created_at: '2024-01-20T14:45:00Z'
    }
  ],
  'vercel/next.js': [
    {
      title: 'Add support for custom loading states in app router',
      body: 'The app router should support custom loading states similar to the pages router. This would improve the user experience during navigation.',
      difficulty: 'intermediate',
      labels: ['enhancement', 'app-router', 'loading'],
      created_at: '2024-01-10T09:15:00Z'
    },
    {
      title: 'Improve error handling for invalid route configurations',
      body: 'When users provide invalid route configurations, the error messages should be more descriptive and provide actionable guidance.',
      difficulty: 'beginner',
      labels: ['good first issue', 'enhancement', 'error-handling'],
      created_at: '2024-01-25T16:20:00Z'
    }
  ],
  'psf/requests': [
    {
      title: 'Add examples for common authentication patterns',
      body: 'The documentation should include more examples of how to handle different authentication methods (OAuth, JWT, etc.).',
      difficulty: 'beginner',
      labels: ['documentation', 'examples', 'authentication'],
      created_at: '2024-01-12T11:00:00Z'
    },
    {
      title: 'Improve error handling for network timeouts',
      body: 'Network timeout errors should provide more detailed information about what went wrong and potential solutions.',
      difficulty: 'intermediate',
      labels: ['enhancement', 'error-handling', 'networking'],
      created_at: '2024-01-18T13:30:00Z'
    }
  ]
};

// Helper functions for working with mock data
export function getMockProjectsByLanguage(language: string): MockProject[] {
  return MOCK_PROJECTS.filter(project => project.language === language);
}

export function getMockProjectsByTopic(topic: string): MockProject[] {
  return MOCK_PROJECTS.filter(project => project.topics.includes(topic));
}

export function getMockProjectByFullName(owner: string, name: string): MockProject | undefined {
  return MOCK_PROJECTS.find(project => project.owner === owner && project.name === name);
}

export function getMockIssuesForProject(owner: string, name: string): MockIssue[] {
  const key = `${owner}/${name}`;
  return MOCK_ISSUES[key] || [];
}
