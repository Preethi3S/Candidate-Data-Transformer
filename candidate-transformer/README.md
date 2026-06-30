# Multi-Source Candidate Data Transformer

Production-style MERN internship assignment for ingesting candidate data from multiple sources, normalizing it into a canonical profile, resolving conflicts, tracking provenance, scoring confidence, and generating runtime-configurable output schemas.

## Problem Statement

Recruiting systems receive candidate data from recruiter CSV exports, resumes, ATS exports, public profiles, and notes. These sources often disagree. This app builds a deterministic mini recruiting intelligence platform that explains how candidate data was parsed, normalized, merged, and projected.

## Architecture Diagram

```text
Source Upload
      |
      v
Parser Layer
      |
      v
Canonical Mapper
      |
      v
Normalizer Layer
      |
      v
Merge Engine
      |
      v
Conflict Resolution Engine
      |
      v
Confidence Engine
      |
      v
Provenance Engine
      |
      v
Projection Engine
      |
      v
Schema Validation
      |
      v
Final Output
```

## Design Decisions

The backend is organized as independent services under `server/src`: adapters, parsers, normalizers, mergers, confidence, provenance, projection, validators, controllers, routes, models, and middleware.

Adapters implement the Open/Closed Principle. `CSVAdapter` and `ResumeAdapter` produce a shared internal field-observation contract. Future `ATSAdapter`, `GitHubAdapter`, and `LinkedInAdapter` classes can be registered without changing merge or projection logic.

Normalization is deterministic. Phones are converted to E.164, dates to `YYYY-MM`, country aliases to ISO alpha-2, and skill aliases such as `Core Java`, `Java SE`, and `ReactJS` are canonicalized.

Conflict resolution is explainable. Single-value fields select the winner by source confidence, then source priority, then a deterministic tie-break. Multi-value fields use union and deduplication. Experience and education are merged by stable composite keys.

Confidence scoring uses weighted field-level confidence for name, email, phone, skills, and experience. The response exposes both `overall_confidence` and per-field confidence.

Projection accepts runtime JSON config for field selection, field renaming, nested path extraction, type conversion, confidence inclusion, provenance inclusion, and missing-value strategies: `null`, `omit`, or `error`.

## Tech Stack

- Frontend: React, Vite, TailwindCSS, React Hook Form, Axios
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Libraries: csv-parser, pdf-parse, multer, zod, uuid, dotenv
- Testing: Jest, Supertest

## Setup Instructions

Install dependencies:

```bash
npm run install:all
```

Backend:

```bash
cd server
cp .env.example .env
npm run dev
```

Frontend:

```bash
cd client
cp .env.example .env
npm run dev
```

MongoDB is optional for local evaluation. If `MONGODB_URI` is unavailable, the API uses an in-memory repository so uploads, retrieval, and tests still work.

## REST APIs

- `POST /api/auth/signup`: create a recruiter account
- `POST /api/auth/signin`: sign in and receive a bearer token
- `GET /api/auth/me`: validate the current session
- `POST /api/auth/logout`: end the client session
- `POST /api/upload`: multipart upload for `csvFile`, `resumeFile`, and optional `configFile`
- `GET /api/profile/:id`: fetch one stored candidate
- `GET /api/profiles`: fetch all stored candidates
- `POST /api/profile/:id/project`: rerun projection with a new runtime config

Candidate APIs require an `Authorization: Bearer <token>` header. The React app handles this automatically after signup or sign in.

## Example Inputs

CSV:

```csv
name,email,phone,current_company,title
John Doe,john@gmail.com,9876543210,Google,SDE
```

Resume text sample is provided at `sample-data/resume-sample.txt`. The resume parser uses `pdf-parse` for PDF files and deterministic regex/dictionary extraction. Text fallback is included to keep tests lightweight and reproducible.

Projection config:

```json
{
  "fields": [
    { "path": "candidate_name", "from": "full_name" },
    { "path": "primary_email", "from": "emails[0]" },
    { "path": "phone", "from": "phones[0]", "normalize": "E164" }
  ],
  "include_confidence": true,
  "include_provenance": true,
  "on_missing": "null"
}
```

## Example Outputs

Canonical output:

```json
{
  "candidate_id": "uuid",
  "full_name": "John Doe",
  "emails": ["john@gmail.com"],
  "phones": ["+919876543210"],
  "headline": "SDE",
  "skills": [{ "name": "Java", "confidence": 0.8, "sources": ["Resume"] }],
  "overall_confidence": 0.91,
  "provenance": []
}
```

Projected output:

```json
{
  "candidate_name": "John Doe",
  "primary_email": "john@gmail.com",
  "phone": "+919876543210",
  "_confidence": {
    "overall": 0.91
  },
  "_provenance": []
}
```

## Frontend

The React dashboard includes:

- Sign up, sign in, persistent session restore, and logout
- CSV, resume, and projection-config upload cards
- Processing pipeline status
- Canonical profile viewer
- Projected JSON viewer
- Provenance lineage panel
- Candidate lineage view for field-level explainability
- Confidence dashboard with progress bars

## Testing Instructions

```bash
cd server
npm test
```

Tests cover phone normalization, skill normalization, date normalization, country normalization, CSV parsing, resume parsing, merge engine, conflict resolution, confidence scoring, projection engine, validation, and API upload behavior.

## Assumptions

- CSV source has the highest base confidence and priority because it is structured recruiter-entered data.
- Resume extraction is deterministic and intentionally conservative.
- India is the default country code for 10-digit local phone numbers because the assignment examples use Indian numbers.
- Missing MongoDB should not block evaluation; the repository falls back to memory.
- A candidate can be processed from only CSV, only resume, or both.

## Future Enhancements

- GitHub Integration
- LinkedIn Integration
- ATS Integration
- ElasticSearch
- AI-based Skill Extraction
- Human-in-the-loop conflict review
- Persistent projection configuration templates
