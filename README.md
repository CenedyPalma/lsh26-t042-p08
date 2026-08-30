# School Result Processing & GPA Engine

**Problem ID**: `p08`  
**Team ID**: `lsh26-t042`  
**Event Start Code**: `LSH26-8490-C900`  
**Live Production URL**: [https://lsh26-t042-p08-api.vercel.app](https://lsh26-t042-p08-api.vercel.app)  
**Local Web App**: [http://localhost:3000](http://localhost:3000)  
**Local Backend API**: [http://localhost:4000](http://localhost:4000)  

An institutional-grade, full-stack school result calculation, GPA derivation, audit trace, and teacher verification engine built with **Next.js 16+ (App Router)**, **Node.js + Express (TypeScript)**, **Prisma ORM**, and **PostgreSQL**.

---

## 🏛️ System Architecture & Major Decisions

```text
┌────────────────────────────────────────────────────────┐
│             Next.js 16+ Web Application                │
│ (App Router, Tailwind CSS, TanStack Query, Archivo)    │
│  - Executive KPI Dashboard                             │
│  - Class-wise Results with Filters & Flags             │
│  - Student Detail with Step-by-Step Calculation Trace  │
│  - Teacher Verification Center (3 review tabs)         │
│  - Transactional Result Recalculation Trigger          │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Node.js / Express Backend                  │
│  - Zod Validation Middleware                           │
│  - Deterministic GPA & Result Engine                   │
│  - Auditable Trace & Rule Code Generator               │
│  - Checking List Generator (R-29)                      │
│  - Recalculation Service with DB Transactions          │
└───────────────────────────┬────────────────────────────┘
                            │ Prisma ORM
                            ▼
┌────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Docker)              │
│  - Classes, Students, Subjects                         │
│  - StudentSubjectMarks (Authoritative Raw Marks)       │
│  - StudentResults, ResultTraces, CheckingItems         │
└────────────────────────────────────────────────────────┘
```

### Major Architectural Decisions
1. **Isolated Authoritative Result Engine**: The calculation logic is implemented as a pure TypeScript domain library in `apps/api/src/result-engine/` with zero database or web framework dependencies. This ensures 100% mathematical determinism, portability, and independent unit testability.
2. **Normalized Relational Data Model**: Stored in PostgreSQL with Prisma ORM. Raw marks are preserved immutably, and recalculation recomputes grades and traces transactionally using PostgreSQL transactions.
3. **Black & White Monochrome Institutional Design**: High-contrast, clean editorial aesthetic with Google Font Archivo, 100% Lucide React icons, and natural casing.
4. **Transparent Calculation Trace**: Every student result stores a step-by-step breakdown explaining the compulsory grade point sum, optional contribution formula $\text{max}(0, \text{GP}-2)$, uncancelled GPA, and compulsory failure overrides.

---

## 📐 Rule Engine Specifications & Compliance Proof

### 1. Grade Scale & Final Letter Grade (**Rule R-10**)
| Mark Range | Grade | Grade Point |
|---|---|---|
| 80 – 100 | **A+** | 5.00 |
| 70 – 79 | **A** | 4.00 |
| 60 – 69 | **A-** | 3.50 |
| 50 – 59 | **B** | 3.00 |
| 40 – 49 | **C** | 2.00 |
| 33 – 39 | **D** | 1.00 |
| 0 – 32 | **F** | 0.00 |

### 2. Component Pass/Fail Validation (**Rule R-11**)
- **Practical Subjects** (Theory 75 + Practical 25 = 100):
  - Theory Pass Mark: **25 / 75**
  - Practical Pass Mark: **8 / 25**
  - Failing either component yields an unconditional **FAIL** ($F / 0.00\text{ GP}$). High combined totals do NOT override component failures (e.g., Theory 70 + Practical 6 = 76 $\rightarrow$ **F / 0.00 GP**).
- **Theory-Only Subjects** (Max 100):
  - Pass Mark: **33 / 100**. Less than 33 $\rightarrow$ **F / 0.00 GP**.

### 3. Absence Handling (**Rule R-12**)
- Student marked `AB` receives $F / 0.00\text{ GP}$, `status = AB`.
- Compulsory `AB` results in automatic overall failure (**Final GPA 0.00, Grade F**).
- Optional `AB` yields `contribution = 0.00`, flags the student for checking list review, and does not independently fail the student.

### 4. Optional Contribution & Compulsory Override (**Rule R-13**)
- **Optional Contribution**: $\text{max}(0, \text{OptionalGP} - 2.00)$
- **Uncancelled GPA**: $\min\left(5.00, \frac{\sum \text{CompulsoryGP} + \max(0, \text{OptionalGP} - 2)}{6}\right)$
- **Compulsory Failure Override**: If ANY compulsory subject fails ($0.00\text{ GP}$, `FAIL`, or `AB`), **Final GPA is forced to 0.00** and **Final Grade is F**, while the **Uncancelled GPA remains preserved and visible** for administrative auditing.

### 5. Pre-Release Verification Checking Lists (**Rule R-29**)
- **Optional Review**: Students with `OptionalGP <= 2.00` (includes GP 2, 1, 0, AB).
- **Practical Fail Review**: Students with `practicalMarks < 8` in any subject.
- **Absent Review**: Students with `AB` in any subject.
- Students can belong to multiple lists simultaneously.

---

## 🔬 Dataset & Edge-Case Proof

The system was seeded with **89 students** across **2 classes** with **6 compulsory + 1 optional subject per student**:

| Case ID | Student Name | Scenario | Expected Behavior | Actual Result | Status |
|---|---|---|---|---|:---:|
| `S-EDGE-01` | Tanvir Hasan | High avg (85-90 in 5 subj) + BIO Theory fail (24/75) | Uncancelled GPA 4.67, Final GPA 0.00, Grade F (R-13) | Final GPA: 0.00, Grade: F, Uncancelled: 4.67 | **PASS** |
| `S-EDGE-02` | Rifat Ahmed | PHY Theory 60/75, Practical 7/25 (< 8) | Subject Grade F, 0.00 GP (R-11) | Subject Grade: F, GP: 0.00 | **PASS** |
| `S-EDGE-03` | Nusrat Jahan | PHY Theory 70/75 + Practical 6/25 = 76 Total | Component fail overrides total -> F, 0.00 GP (R-11) | Subject Grade: F, GP: 0.00 | **PASS** |
| `S-EDGE-04` | Shakil Khan | PHY Theory 24/75 (< 25), Practical 20/25 | Component fail -> F, 0.00 GP (R-11) | Subject Grade: F, GP: 0.00 | **PASS** |
| `S-EDGE-05` | Mehedi Hasan | Optional GP = 2.00 | Contribution = 0.00, On Optional List (R-13, R-29) | Contribution: 0.00, Flagged | **PASS** |
| `S-EDGE-06` | Sadia Islam | Optional GP = 1.00 | Contribution = 0.00, On Optional List (R-13, R-29) | Contribution: 0.00, Flagged | **PASS** |
| `S-EDGE-07` | Farhan Kabir | Compulsory MAT Absent (`AB`) | Final GPA 0.00, Grade F, On Absent List (R-12) | Final GPA: 0.00, Grade: F, Flagged | **PASS** |
| `S-EDGE-08` | Tasnim Akter | Optional AGR Absent (`AB`) | Contribution 0.00, Passes overall, On lists (R-12, R-13) | Contribution: 0.00, Passed, Flagged | **PASS** |
| `S-EDGE-09` | Multi-Case Student | Opt GP 1 + Prac 6 + Comp AB | Appears on all 3 checking lists (R-29) | On Optional, Practical, Absent lists | **PASS** |

---

## 🛠️ Setup & Running Instructions

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- `pnpm v10+`
- `docker` and `docker compose`

### 2. Quick Setup & Seed
```bash
# Enter workspace
cd /home/cdev/Development/P08

# Start PostgreSQL database container (Port 5434)
pnpm db:up

# Install all dependencies
pnpm install

# Build shared types package
pnpm --filter @school-result/shared build

# Push database schema & generate Prisma Client
pnpm db:migrate

# Seed database with sample dataset & edge cases
pnpm db:seed

# Run database rule self-check
pnpm db:self-check
```

### 3. Start Development Servers
```bash
# Run both API (port 4000) and Web (port 3000) in parallel:
pnpm dev

# Or separately:
pnpm dev:api   # Express API on http://localhost:4000
pnpm dev:web   # Next.js Web on http://localhost:3000
```

### 4. Running Automated Tests
```bash
# Run all Vitest and Supertest suites:
pnpm test

# Run unit tests only:
pnpm test:unit

# Run API integration tests only:
pnpm test:api
```

---

## 👥 Approach & Team Member Contributions

- **System Architecture & Data Modeling**: Monorepo orchestration, PostgreSQL schema design, Prisma ORM migrations, and transactional recalculation pipelines.
- **Result & GPA Engine Implementation**: Deterministic mathematical formulation of Rules R-10, R-11, R-12, R-13, and R-29 with auditable trace generators.
- **REST API Engineering**: Express controllers, Zod validation middleware, error handlers, and Supertest suite.
- **Frontend & UX Design**: Next.js 16+ App Router interface, Executive KPI dashboard, tabulation sheets, calculation trace viewer, Teacher Verification Center, and Archivo typography monochrome system.

---

## ⚠️ Known Limitations
1. **Curriculum Scope**: The engine is calibrated specifically for the Bangladesh Secondary Education Board 6-compulsory + 1-optional subject structure. Expanding to university credit-hour models would require configuring weight factors per course.
2. **Single Institution Instance**: The current database model is structured as a dedicated single-school installation. Multi-tenant multi-school deployment would require adding a `SchoolTenant` organization layer.

---

## 🔒 Security & Privacy Notice
No private credentials, secret API tokens, passwords, or personal private identification data are present in this repository. All credentials use standard local container environment defaults (`postgres:postgres@localhost:5434/school_result_db`).
