# 🚀 Multi-Source Candidate Data Transformer

A MERN-based candidate data transformation platform that ingests information from multiple sources, resolves identities, removes duplicates, handles conflicting data, tracks provenance, and generates a unified canonical candidate profile.

The platform helps recruiters and hiring systems consolidate fragmented candidate information from resumes, ATS systems, recruiter spreadsheets, LinkedIn profiles, and GitHub profiles into a single reliable candidate record.

---

## 🌐 Live Demo

🔗 Live Application:

[https://candidate-data-transformer-1.onrender.com/]

---

# 📋 Table of Contents

- Features
- Multi-Source Data Ingestion
- Identity Resolution
- Resume Parsing
- Conflict Resolution
- Backfill Mechanism
- Confidence Scoring
- Provenance Tracking
- Canonical Candidate Profile
- System Architecture Overview
- High-Level Architecture
- Data Processing Workflow
- Design Decisions & Reasoning
- UI/UX Design
- Tech Stack
- Getting Started
- Clone & Install
- Environment Variables
- Run Development Servers
- Demo Video
- Future Enhancements
- License
- Contact

---

# ✨ Features

## 📥 Multi-Source Data Ingestion

The platform supports multiple candidate data sources:

- Resume PDF
- ATS JSON
- Recruiter CSV
- LinkedIn JSON
- GitHub JSON

Each source is processed independently and transformed into a common internal schema.

---

## 🆔 Identity Resolution

The same candidate may appear in multiple systems.

The platform intelligently identifies matching records using:

1. Email Address
2. Phone Number
3. LinkedIn URL
4. GitHub URL
5. Name Similarity

This prevents duplicate candidate creation.

---

## 📄 Resume Parsing

Automatically extracts:

- Full Name
- Email Address
- Phone Number
- Skills
- Education
- Experience
- Years of Experience

Includes validation rules to prevent section headers such as:

- Professional Summary
- Skills
- Projects
- Education

from being incorrectly classified as candidate names.

---

## ⚖️ Conflict Resolution

Different sources may contain conflicting values.

Example:

Resume → Preethi S

CSV → Preethi Selvaraj

ATS → Preethi S

The system automatically selects the most trusted value based on source priority.

---

## 🔄 Backfill Mechanism

If a higher-priority source lacks information, missing values are automatically filled using lower-priority sources.

Example:

Resume → Missing Phone Number

CSV → Has Phone Number

Result → Phone Number Backfilled From CSV

---

## 📊 Confidence Scoring

Each extracted field receives a confidence score based on:

- Source reliability
- Extraction strategy
- Validation quality

Example:

```json
{
  "email": {
    "value": "candidate@email.com",
    "confidence": 0.95
  }
}
```

---

## 🔍 Provenance Tracking

Every field maintains source attribution.

Example:

```json
{
  "full_name": {
    "value": "Preethi S",
    "source": "Resume"
  }
}
```

This provides transparency and explainability.

---

## 👤 Canonical Candidate Profile

After processing, the platform generates a unified candidate profile containing:

- Personal Information
- Skills
- Experience
- Education
- Confidence Scores
- Provenance Information
- Source Metadata

---

# 🏗️ System Architecture Overview

The application follows a modular data-processing architecture.

---

## High-Level Architecture

```text
Input Sources
     ↓
Source Validation
     ↓
Identity Resolution
     ↓
Source Parsing
     ↓
Field Extraction
     ↓
Field Validation
     ↓
Normalization
     ↓
Deduplication
     ↓
Merge Engine
     ↓
Confidence & Provenance
     ↓
Canonical Profile
     ↓
Projection Engine
     ↓
Final Output
```

---

## Architecture Diagram

Add Architecture Screenshot Here

```md
![Architecture](./screenshots/architecture.png)
```

---

# 🔄 Data Processing Workflow

<img width="3224" height="2018" alt="image" src="https://github.com/user-attachments/assets/e1247496-008b-423b-863e-6891801a166e" />

### Step 1: Source Upload

Users upload candidate information from one or more supported sources.

### Step 2: Source Validation

Uploaded files are validated for structure and data integrity.

### Step 3: Identity Resolution

Matching candidate records are grouped together.

### Step 4: Field Extraction

Candidate information is extracted from each source.

### Step 5: Normalization

Data is standardized into a common schema.

### Step 6: Deduplication

Duplicate entries are removed.

### Step 7: Merge Engine

Conflicting values are resolved using source-priority rules.

### Step 8: Confidence & Provenance

Confidence scores and source metadata are attached.

### Step 9: Canonical Profile Generation

A unified candidate profile is generated.

---

# ⚙️ Source Priority Strategy

The system follows a priority-based merge strategy.

| Source | Priority |
|----------|----------|
| Resume | 5 |
| Recruiter CSV | 4 |
| ATS | 3 |
| LinkedIn | 2 |
| GitHub | 1 |

Higher-priority sources override lower-priority sources.

---

# 🎨 UI/UX Design

The application provides an intuitive interface for:

- Uploading candidate sources
- Viewing merged profiles
- Inspecting provenance
- Reviewing confidence scores
- Understanding conflict resolutions

---

## Screenshots

### Dashboard

```md
![Dashboard](./screenshots/dashboard.png)
```

### Candidate Profile

```md
![Profile](./screenshots/profile.png)
```

### Provenance Tracking

```md
![Provenance](./screenshots/provenance.png)
```

### Conflict Resolution

```md
![Conflict Resolution](./screenshots/conflicts.png)
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Tailwind CSS
- Axios

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Processing Layer

- PDF Parse
- Resume Parser Service
- Identity Resolution Engine
- Merge Engine
- Provenance Engine

## Deployment

- Vercel (Frontend)
- Render / Railway / AWS (Backend)
- MongoDB Atlas

---

# 📂 Project Structure

```text
candidate-transformer/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│
├── server/
│   ├── src/
│   │   ├── adapters/
│   │   ├── parsers/
│   │   ├── merge/
│   │   ├── identity/
│   │   ├── provenance/
│   │   ├── normalization/
│   │   └── projection/
│
├── screenshots/
├── sample-data/
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/preethi3s/candidate-transformer.git

cd candidate-transformer
```

---

## 2. Install Dependencies

### Backend

```bash
cd server

npm install
```

### Frontend

```bash
cd client

npm install
```

---

## 3. Environment Variables

Create a `.env` file inside the server directory:

```env
PORT=yourport

MONGODB_URI=mongodbconfiguration
```

---

## 4. Run Development Servers

### Backend

```bash
cd server

npm start
```

### Frontend

```bash
cd client

npm run dev
```

---

## 5. Open Browser


depending on your frontend configuration.

---

# 🎥 Demo Video

Watch the complete project walkthrough:

📹 Add Video Link Here

The demo includes:

- Source Upload
- Resume Parsing
- Identity Resolution
- Merge Engine
- Conflict Resolution
- Provenance Tracking
- Canonical Profile Generation

---

# 📄 Sample Input Files

The repository includes sample data files:

- recruiter-data.csv
- ats-data.json
- linkedin-data.json
- github-data.json
- resume.pdf

---

# 🔮 Future Enhancements

- OCR Support
- AI-Based Resume Understanding
- Advanced Entity Resolution
- Skill Taxonomy Mapping
- ATS Integrations
- Real-Time Candidate Synchronization
- Analytics Dashboard
- Bulk Candidate Processing

---

# 📜 License

This project is licensed under the MIT License.

See the LICENSE file for details.

---

# 👨‍💻 Author

### Preethi S

Computer Science Engineering Student

GitHub: https://github.com/Preethi3S

LinkedIn: https://www.linkedin.com/in/preethi-s-385410290

---
