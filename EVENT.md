# EVENT DECLARATION

## Event Metadata
- **Team ID**: `lsh26-t042`
- **Problem ID**: `p08`
- **Problem Name**: School Result Processing & GPA Engine
- **Event Start Code**: `LSH26-8490-C900`
- **Timestamp**: `2026-08-30`

---

## Pre-Event Material Declaration
- **Public Sample Dataset**: `P08_school_results_public.json` / `sample_data.json` (Public sample examination dataset containing 80 students across 2 classes).
- **Tooling & Frameworks**: Standard open-source tooling (Next.js, React, Node.js, Express, Prisma ORM, PostgreSQL Docker, TypeScript, Tailwind CSS, TanStack Query, Vitest, Lucide Icons, Google Font Archivo).
- **Proprietary Code**: None. All application architecture, mathematical calculation logic, deterministic result engines, database schemas, API routes, and user interface components were authored during the event session.

---

## Approach & Team Contributions

### Architectural Approach
1. **Separation of Authoritative Business Logic**: The result and GPA processing engine was constructed as a pure, deterministic TypeScript library (`apps/api/src/result-engine/`), independent of framework or database drivers, enabling 100% test coverage and zero floating-point rounding bugs.
2. **Relational Database Model**: PostgreSQL schema designed with third-normal form normalization, strictly tracking raw theory/practical marks, calculated result snapshots, auditable rule execution traces, and pre-release teacher checking lists.
3. **Auditable Step-by-Step Pipeline**: Every student calculation produces an auditable breakdown tracking compulsory GP sums, optional contribution formulas $\text{max}(0, \text{GP}-2)$, uncancelled GPA, and compulsory failure overrides under Rule R-13.
4. **Institutional Black & White Monochrome Interface**: Designed for educational school administrators with high-contrast legibility, Google Font Archivo, 100% Lucide React icons, and natural casing.

### Member Roles & Major Contributions
- **Full-Stack Architect & Lead Engineer**: System design, monorepo setup, PostgreSQL schema design, and end-to-end integration.
- **Engine & Mathematics Specialist**: Implementation of Rules R-10, R-11, R-12, R-13, and R-29, edge-case generation, and Vitest test suite.
- **Backend API & Persistence Engineer**: Node.js/Express REST API, Zod validation middleware, Prisma transactions, and Supertest integration tests.
- **Frontend & UI/UX Specialist**: Next.js 16+ App Router implementation, executive KPI dashboard, tabulation sheets, calculation trace visualizer, and Teacher Verification Center.
