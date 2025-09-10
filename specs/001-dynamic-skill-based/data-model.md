# Data Model: Dynamic Skill-Based Filtering

**Feature**: Dynamic Skill-Based Filtering
**Date**: September 10, 2025

## Entities Overview

The Dynamic Skill-Based Filtering feature requires the following data entities to support GitHub issue filtering by language and topics.

## Core Entities

### 1. GitHub Issue

Represents a GitHub issue with filtering metadata.

**Fields**:

- `id`: string (GitHub issue ID)
- `number`: number (Issue number in repository)
- `title`: string (Issue title)
- `body`: string (Issue description, optional)
- `state`: 'open' | 'closed' (Issue status)
- `html_url`: string (GitHub URL)
- `created_at`: Date (Creation timestamp)
- `updated_at`: Date (Last update timestamp)
- `labels`: string[] (GitHub labels array)
- `repository_name`: string (Repository name)
- `repository_full_name`: string (Full repository name with owner)
- `repository_language`: string (Primary programming language)
- `repository_topics`: string[] (Repository topics/tags)
- `difficulty_labels`: string[] (Extracted difficulty indicators)

**Validation Rules**:

- `id` must be unique and non-empty
- `title` must be non-empty
- `repository_language` must be valid programming language
- `repository_topics` must be array of strings
- `created_at` and `updated_at` must be valid dates

**Relationships**:

- Belongs to Repository (via repository_full_name)
- Has many Labels (via labels array)

### 2. Filter Criteria

Represents user filter selections.

**Fields**:

- `language`: string | null (Selected programming language)
- `topic`: string | null (Selected repository topic)
- `session_id`: string (User session identifier)

**Validation Rules**:

- `language` must be valid programming language or null
- `topic` must be valid topic string or null
- `session_id` must be non-empty

**State Transitions**:

- Initial: {language: null, topic: null}
- Language selected: {language: "JavaScript", topic: null}
- Topic selected: {language: "JavaScript", topic: "web-development"}
- Reset: {language: null, topic: null}

### 3. Filter Result

Represents the result of applying filters to issues.

**Fields**:

- `issues`: GitHubIssue[] (Filtered issues array)
- `total_count`: number (Total issues matching filters)
- `filter_applied`: FilterCriteria (Applied filter criteria)
- `cache_timestamp`: Date (When data was cached)
- `is_from_cache`: boolean (Whether data came from cache)

**Validation Rules**:

- `issues` must be array of valid GitHubIssue objects
- `total_count` must equal issues.length
- `cache_timestamp` must be valid date
- `is_from_cache` must be boolean

### 4. Cache Entry

Represents cached GitHub data with freshness tracking.

**Fields**:

- `cache_key`: string (Unique cache identifier)
- `data`: any (Cached data payload)
- `created_at`: Date (Cache creation timestamp)
- `expires_at`: Date (Cache expiration timestamp)
- `data_type`: 'issues' | 'languages' | 'topics' (Type of cached data)

**Validation Rules**:

- `cache_key` must be unique and non-empty
- `created_at` must be before `expires_at`
- `data_type` must be valid enum value
- `expires_at` must be in the future for active cache

## Database Schema

### Issues Cache Table

```sql
CREATE TABLE github_issues_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('issues', 'languages', 'topics'))
);

-- Index for efficient cache lookups
CREATE INDEX idx_github_issues_cache_key ON github_issues_cache(cache_key);
CREATE INDEX idx_github_issues_cache_expires ON github_issues_cache(expires_at);
CREATE INDEX idx_github_issues_cache_type ON github_issues_cache(data_type);
```

### Filter Sessions Table (Optional)

```sql
CREATE TABLE filter_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    language_filter VARCHAR(100),
    topic_filter VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Data Flow

### 1. Initial Load

1. Check cache for issues data
2. If cache valid → Return cached data
3. If cache expired → Fetch from GitHub API → Update cache → Return data

### 2. Filter Application

1. Receive filter criteria from client
2. Validate filter parameters
3. Apply filters to issue dataset
4. Return filtered results
5. Update session state

### 3. Cache Management

1. Store fetched data with 1-hour TTL
2. Check TTL on each request
3. Background refresh when TTL expires
4. Manual refresh on user request

## TypeScript Interfaces

```typescript
interface GitHubIssue {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  html_url: string;
  created_at: Date;
  updated_at: Date;
  labels: string[];
  repository_name: string;
  repository_full_name: string;
  repository_language: string;
  repository_topics: string[];
  difficulty_labels: string[];
}

interface FilterCriteria {
  language: string | null;
  topic: string | null;
  session_id: string;
}

interface FilterResult {
  issues: GitHubIssue[];
  total_count: number;
  filter_applied: FilterCriteria;
  cache_timestamp: Date;
  is_from_cache: boolean;
}

interface CacheEntry {
  cache_key: string;
  data: any;
  created_at: Date;
  expires_at: Date;
  data_type: "issues" | "languages" | "topics";
}
```

## Validation Rules Summary

- All string fields must be trimmed and non-empty where required
- Date fields must be valid ISO date strings
- Array fields must contain valid string elements
- Enum fields must match allowed values
- Foreign key relationships must reference existing entities
- Cache TTL must be enforced for data freshness

## Performance Considerations

- Index cache keys for fast lookups
- Limit result sets to prevent memory issues
- Use pagination for large datasets
- Implement background cache refresh
- Monitor cache hit rates for optimization

---

_Data model complete - Ready for contract generation_
