# API Contracts: Dynamic Skill-Based Filtering

**Feature**: Dynamic Skill-Based Filtering
**Date**: September 10, 2025
**Version**: 1.0.0

## Overview

This document defines the API contracts for the Dynamic Skill-Based Filtering feature, which provides GitHub issue filtering by programming language and repository topics.

## Route Contracts

### 1. GET /filter - Filter Page Load

**Purpose**: Initial page load for the filtering interface

**Request**:

```
GET /filter
Accept: text/html
```

**Response**:

```http
HTTP/1.1 200 OK
Content-Type: text/html

<html>
  <!-- Filter page with dropdowns and initial issue list -->
</html>
```

**Contract**:

- Returns HTML page with filter UI
- Includes initial set of GitHub issues
- Filter dropdowns populated with available options
- No authentication required

### 2. POST /filter/update - Apply Filters

**Purpose**: Apply language and topic filters to issue results

**Request**:

```http
POST /filter/update
Content-Type: application/x-www-form-urlencoded

language=JavaScript&topic=web-development
```

**Request Schema** (Zod validation):

```typescript
const filterSchema = z.object({
  language: z.string().optional(),
  topic: z.string().optional(),
});

type FilterRequest = z.infer<typeof filterSchema>;
```

**Response**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "issues": [...],
  "total_count": 25,
  "filter_applied": {
    "language": "JavaScript",
    "topic": "web-development"
  },
  "cache_timestamp": "2025-09-10T15:30:00Z",
  "is_from_cache": false
}
```

**Response Schema**:

```typescript
interface FilterResponse {
  issues: GitHubIssue[];
  total_count: number;
  filter_applied: {
    language: string | null;
    topic: string | null;
  };
  cache_timestamp: string;
  is_from_cache: boolean;
}
```

**Error Responses**:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid filter parameters",
  "details": "Language must be valid programming language"
}
```

### 3. GET /api/github/issues - Fetch Issues (Internal)

**Purpose**: Internal API for fetching GitHub issues with caching

**Request**:

```
GET /api/github/issues?language=JavaScript&topic=web-development&force_refresh=false
```

**Response**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "issues": [...],
  "cache_info": {
    "timestamp": "2025-09-10T15:30:00Z",
    "ttl_seconds": 3600,
    "is_fresh": true
  }
}
```

### 4. POST /api/cache/refresh - Refresh Cache

**Purpose**: Manually refresh the GitHub data cache

**Request**:

```http
POST /api/cache/refresh
Content-Type: application/json

{
  "data_type": "issues"
}
```

**Response**:

```http
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "message": "Cache refresh initiated",
  "estimated_completion": "2025-09-10T15:35:00Z"
}
```

## Data Contracts

### GitHub Issue Schema

```typescript
interface GitHubIssue {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  labels: string[];
  repository_name: string;
  repository_full_name: string;
  repository_language: string;
  repository_topics: string[];
  difficulty_labels: string[];
}
```

### Filter Options Schema

```typescript
interface FilterOptions {
  languages: string[];
  topics: string[];
  last_updated: string;
}
```

## Validation Contracts

### Filter Parameter Validation

```typescript
const languageOptions = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
];

const validateLanguage = (language: string | null): boolean => {
  if (!language) return true; // null is valid (no filter)
  return languageOptions.includes(language);
};

const validateTopic = (topic: string | null): boolean => {
  if (!topic) return true; // null is valid (no filter)
  // Topic validation would check against known topics
  return topic.length > 0 && topic.length <= 50;
};
```

## Error Contracts

### Standard Error Response

```typescript
interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
  timestamp: string;
}
```

### Error Codes

- `INVALID_FILTER`: Filter parameter validation failed
- `GITHUB_API_ERROR`: GitHub API request failed
- `CACHE_ERROR`: Cache operation failed
- `RATE_LIMIT_EXCEEDED`: GitHub API rate limit exceeded

## Performance Contracts

### Response Time Guarantees

- Page load: <2 seconds
- Filter application: <500ms
- Cache refresh: <5 seconds
- API timeout: 30 seconds

### Rate Limits

- Filter requests: 10 per minute per user
- Cache refresh: 1 per hour per user
- GitHub API: Respect GitHub's rate limits

## Security Contracts

### Input Validation

- All filter parameters validated with Zod schemas
- SQL injection prevention through parameterized queries
- XSS prevention through proper HTML encoding
- Rate limiting to prevent abuse

### Data Privacy

- No user data stored permanently
- Session data cleared on logout
- GitHub data cached temporarily only
- No sensitive information logged

---

_API contracts complete - Ready for implementation_
