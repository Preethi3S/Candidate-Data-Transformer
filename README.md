# 🚀 Multi-Source Candidate Data Transformer

<img width="1563" height="850" alt="image" src="https://github.com/user-attachments/assets/bc8c5f59-4388-458c-99c2-9e7c8a9727cb" />


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


<img width="2070" height="799" alt="diagram-export-30-06-2026-18_54_07" src="https://github.com/user-attachments/assets/912b0b81-0496-4d20-a1fd-78d5ec684a45" />

---

# 🔄 Data Processing Workflow

<img width="1612" height="1009" alt="diagram-export-30-06-2026-18_10_08" src="https://github.com/user-attachments/assets/f1e80adc-86a2-43dd-816d-7899c65d50c6" />


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

<img width="1608" height="730" alt="image" src="https://github.com/user-attachments/assets/cdb74350-52d8-4924-a4fc-6672a2b6931b" />


### Candidate Profile

<img width="1606" height="876" alt="image" src="https://github.com/user-attachments/assets/dff5dfdd-9a9c-4f16-a48c-fafcedb45826" />


### Conflict Resolution

<img width="1550" height="376" alt="image" src="https://github.com/user-attachments/assets/bceee786-c210-4073-ba45-92056f4d7aca" />


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

## 5. Video


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
