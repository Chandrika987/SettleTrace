# SettleTrace

> **Money can move correctly and still fail to reconcile.**

SettleTrace is an AI-powered settlement reconciliation and investigation platform built for finance teams who need to go beyond "these numbers don't match" — tracing a mismatch from the original payment all the way through settlement, bank credit, and ledger.

Instead of stopping at detection, SettleTrace is built to answer four questions, in order:

**What happened? Why did it happen? What evidence supports it? What should happen next?**

---

## Overview

Modern payment systems generate a web of related records for a single transaction — refunds, chargebacks, fees, adjustments, settlement entries, bank credits, ledger postings. When these records drift out of alignment, traditional reconciliation tools can flag *that* something is wrong, but the actual investigation — tracing the discrepancy back through every system it touched — is still manual, slow, and error-prone.

SettleTrace closes that gap by combining deterministic financial reconciliation, anomaly detection, evidence-based investigation, AI-assisted reasoning, structured recommendations, human approval, and a full audit trail into one workflow.

```text
Payment
   ↓
Refunds / Chargebacks / Fees / Adjustments
   ↓
Settlement
   ↓
Bank Credit
   ↓
Ledger
   ↓
Reconciliation
   ↓
Anomaly Detection
   ↓
Investigation
   ↓
Recommendation
   ↓
Human Approval
   ↓
Audit
```

**Core principle:** Financial records remain the source of truth. AI operates *on top of* the evidence — it never replaces the deterministic financial calculation underneath it.

---

## Problem

Settlement reconciliation gets hard the moment financial data is spread across multiple systems. Common sources of exceptions:

- Settlement amount mismatches
- Refunds and chargebacks
- Processing fees and adjustments
- Partial settlements
- Missing settlement records or bank credits
- Duplicate records
- Timing differences
- Ledger inconsistencies

A traditional reconciliation process can tell you:

```text
Expected Settlement ≠ Actual Bank Credit
```

...but that leaves the questions that actually matter unanswered: *Why* is there a difference? *Which* records caused it? What's the supporting evidence? Is this a refund, a fee, a partial settlement, a duplicate, or something missing entirely? What should the finance team actually do — and can that decision be audited later? SettleTrace is built around closing exactly that gap.

---

## Solution

SettleTrace runs a structured financial control loop:

| Step | What happens |
|---|---|
| **Reconcile** | Calculate expected settlement from the underlying financial records |
| **Compare** | Compare the expected amount against the actual bank credit |
| **Classify** | Classify the case based on the observed financial state |
| **Investigate** | Connect the exception to its underlying financial evidence |
| **Explain** | Use AI to investigate anomalies and generate root-cause hypotheses |
| **Recommend** | Suggest an appropriate next action |
| **Approve** | Keep a human in control of high-impact decisions |
| **Audit** | Preserve evidence, decisions, and actions for full traceability |

---

## Reconciliation Logic

The deterministic core of SettleTrace:

```text
Expected Settlement =
    Payments
  − Refunds
  − Chargebacks
  − Fees
  + Adjustments

Variance =
    Expected Settlement
  − Actual Bank Credit
```

**Worked example:**

```text
Payment              ₹4,86,160
Refund               ₹3,730
─────────────────────────────
Expected Settlement  ₹4,82,430
Actual Bank Credit   ₹4,78,700
─────────────────────────────
Variance             ₹3,730   →  status: VARIANCE
```

The variance is always derived from the underlying financial records — never generated or estimated by a model.

### Reconciliation statuses

| Status | Meaning |
|---|---|
| `MATCHED` | Expected settlement equals actual bank credit |
| `VARIANCE` | Settlement and bank records exist but amounts differ |
| `MISSING` | Expected records exist but settlement or bank-side records don't |
| `PARTIAL` | Settlement or bank credit is incomplete |
| `DUPLICATE` | Duplicate source identifiers or records detected |

---

## Synthetic Dataset

SettleTrace runs on synthetic financial data for development and demonstration — no real customer or production payment data is used.

| Entity | Count |
|---|---:|
| Merchants | 3 |
| Payments | 100 |
| Refunds | 35 |
| Chargebacks | 21 |
| Settlements | 90 |
| Settlement Line Items | 149 |
| Bank Transactions | 105 |
| Ledger Entries | 90 |

Generated with a fixed, reproducible seed (`42`) so reconciliation logic and system behavior can be tested consistently.

**Case distribution:**

```text
MATCHED    50
VARIANCE   16
PARTIAL    10
MISSING    10
DUPLICATE  15
```

---

## Performance

Latest observed local benchmark:

```text
101 reconciliation cases
376 ms processing time
~269 records/second
```

These are development-environment measurements, not production SLAs or guaranteed throughput.

---

## Architecture

```mermaid
flowchart TD
    A[Financial Records] --> B[Deterministic Reconciliation]
    B --> C{Reconciliation Status}
    C -->|MATCHED| D[Resolved Case]
    C -->|VARIANCE| E[Exception Case]
    C -->|PARTIAL| E
    C -->|MISSING| E
    C -->|DUPLICATE| E
    E --> F[Evidence]
    F --> G[Anomaly Detection]
    G --> H[AI Investigation]
    H --> I[Recommendation]
    I --> J[Human Approval]
    J --> K[Audit Trail]
```

Current implementation stack:

```text
React + Vite
      ↓
REST API
      ↓
Node.js + Express + TypeScript
      ↓
Service Layer
      ↓
PostgreSQL
```

The intelligence and control-loop layers (anomaly detection → AI investigation → recommendation → approval) are being built on top of this reconciliation foundation.

---

## Financial Data Model

```text
Merchant
   └── Payment
          ├── Refunds
          ├── Chargebacks
          └── Settlement
                 └── Settlement Line Items

Settlement
   └── Bank Transaction

Payment / Settlement / Bank Transaction
   └── Ledger Entry

Financial Records
   └── Reconciliation Case
          ├── Anomaly
          ├── Investigation
          │      └── Evidence
          ├── Recommendation
          ├── Approval
          └── Audit Events
```

**Core entities:** Merchants · Payments · Refunds · Chargebacks · Settlements · Settlement Line Items · Bank Transactions · Ledger Entries · Reconciliation Cases · Anomalies · Investigations · Investigation Evidence · Recommendations · Approval Cases · Approval Actions · Audit Events · Data Sources

---

## AI Strategy

AI is deliberately **not** the financial source of truth.

```text
Financial Records
        ↓
Deterministic Reconciliation
        ↓
Anomaly Detection
        ↓
Evidence Collection
        ↓
AI Investigation
        ↓
Recommendation
        ↓
Human Approval
        ↓
Audit Trail
```

Financial calculations stay deterministic and explainable; the AI layer reasons *about* the evidence rather than inventing financial facts:

```text
Financial Records → What actually happened?
       ↓
   Evidence → What is the likely reason?
       ↓
   Recommended action
```

High-impact decisions remain under human control by design.

---

## Frontend

A fintech-style financial operations interface, built around:

- Overview Dashboard
- Reconciliation
- Anomaly Intelligence
- Investigation Workspace
- Settlement Explorer
- Approval Queue
- Audit Trail
- Analytics
- Data Sources
- Settings

Information hierarchy:

```text
MONEY → RISK → EVIDENCE → DECISION → CONTROL
```

Visual language: dark, enterprise-fintech, with distinct states for healthy records, attention, risk, and intelligence.

### Investigation Workspace

```text
Problem → Evidence → Root Cause → Recommendation → Human Decision
```

The goal isn't a red "mismatch" badge — it's connecting the discrepancy to its underlying records with an evidence-driven explanation.

---

## API

```text
GET /health

GET /api/reconciliation
GET /api/reconciliation/:caseId
GET /api/reconciliation/summary

GET /api/settlements
GET /api/settlements/:id

GET /api/merchants
```

Reconciliation endpoints support filtering and pagination where implemented. The backend is the financial source of truth; the frontend consumes and presents it.

---

## Project Structure

```text
SettleTrace/
├── UI/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## Technology Stack

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, `pg` |
| Intelligence | Deterministic reconciliation, synthetic data generation, ML/statistical anomaly detection, AI-assisted investigation, evidence-based recommendations |
| Tooling | Git, GitHub, automated build & test validation |

---

## Getting Started

### Prerequisites
Node.js · npm · PostgreSQL · Git

### Clone
```bash
git clone <repository-url>
cd SettleTrace
```

### Backend
```bash
cd backend
npm install
```

`.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/settletrace
PORT=4000
NODE_ENV=development
```

Run migrations and seed scripts, then start the backend:
```bash
npm run dev
```

API available at `http://localhost:4000` — health check at `GET /health`.

### Frontend
```bash
cd UI
npm install
```

`.env`:
```env
VITE_API_BASE_URL=http://localhost:4000
```

```bash
npm run dev
```

---

## Environment Variables

**Backend**
```env
DATABASE_URL=
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend**
```env
VITE_API_BASE_URL=http://localhost:4000
```

Never commit real credentials or secrets.

---

## Validation

- TypeScript compilation
- Backend build
- Reconciliation tests
- Synthetic dataset validation
- Data integrity checks
- Seed reproducibility

---

## Current Status

**Implemented**
- PostgreSQL financial data model & event relationships
- Deterministic settlement + variance calculation
- Reconciliation status classification
- Reproducible synthetic data generation
- Data integrity validation
- Reconciliation service layer & backend REST API foundation
- Frontend application (reconciliation- and investigation-oriented UI)
- Backend build and test validation

**In Progress**
- Frontend/backend deployment
- ML-based anomaly detection
- AI-powered investigation & root-cause explanation
- Evidence-driven recommendations
- Human approval workflow
- Complete audit/control loop

**Planned**
- Production payment-provider & banking integrations
- Authentication and role-based access control
- Advanced anomaly models
- Continuous monitoring & automated financial controls
- Production observability
- Enterprise-scale deployment

---

## Roadmap

```text
Phase 1 — Reconciliation Foundation
   Financial Data → Deterministic Reconciliation → Exception Classification

Phase 2 — Anomaly Intelligence
   Reconciliation Cases → Statistical/ML Detection → Prioritized Anomalies

Phase 3 — AI Investigation
   Anomaly → Evidence → AI Investigation → Root-Cause Hypothesis

Phase 4 — Recommendations
   Investigation → Recommended Action → Confidence

Phase 5 — Human Approval
   Recommendation → Human Review → Approve / Reject

Phase 6 — Audit & Control
   Detection → Investigation → Decision → Action → Audit → Continuous Improvement
```

---

## Demo Flow

```text
1. Open Overview
2. Review reconciliation summary
3. Open a variance case
4. Compare expected vs actual settlement
5. Inspect supporting financial evidence
6. Investigate the exception
7. Review anomaly intelligence
8. Review recommendation
9. Human approval
10. Audit trail
```

Steps still under active development are presented as roadmap capabilities, not finished functionality.

---

## Why SettleTrace?

Traditional reconciliation asks: **"Does it match?"**
SettleTrace asks further: **"Why doesn't it match? What evidence supports that? What should happen next?"**

```text
DETECT → TRACE → UNDERSTAND → DECIDE → AUDIT
```

---

## Trust & Safety Principles

- **Deterministic Financial Truth** — calculations derive from explicit financial records
- **Evidence-Based AI** — AI reasons over available evidence, never invents financial facts
- **Human-in-the-Loop** — high-impact decisions stay under human review
- **Traceability** — investigations remain connected to their supporting records
- **Auditability** — decisions and actions are recorded for reconstruction
- **Synthetic Data** — development and demos never touch real financial data

---

## Limitations

SettleTrace is currently a prototype / buildathon project:

- Uses synthetic data for development and demonstration
- No production payment-provider or banking integration
- AI/ML capabilities are still being developed
- Performance figures are local development measurements
- No authentication or enterprise RBAC yet
- Production hardening and operational deployment are separate from this prototype

SettleTrace should not be used for real financial decisions without further validation, security, compliance, and operational review.

---

## Disclaimer

SettleTrace is a prototype built for demonstration and experimentation. All financial records used are synthetic unless explicitly stated otherwise. It demonstrates how deterministic reconciliation, anomaly intelligence, AI-assisted investigation, human decision-making, and auditability can combine into a financial operations workflow — it does not represent access to real payment-provider production data.

---

## Vision

The long-term goal isn't another reconciliation dashboard — it's a financial control loop:

```text
Unknown → Detected → Explained → Reviewed → Resolved → Audited
```

Shrinking the distance between *finding* a financial mismatch and *understanding and resolving* it.

---



<div align="center">

**SettleTrace**
*Money can move correctly and still fail to reconcile.*

**Trace it. Understand it. Resolve it.**

</div>
