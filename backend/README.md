# SettleTrace Backend — Core Reconciliation Engine & Infrastructure

SettleTrace is an AI-powered settlement reconciliation and financial investigation platform. This backend provides the deterministic financial reconciliation engine, PostgreSQL schema migrations, and synthetic dataset generation.

## Reconciliation Architecture & Formula

Reconciliation is calculated strictly from raw database records without ORM overhead or ML inference:

$$\text{Expected Settlement} = \text{Payments} - \text{Refunds} - \text{Chargebacks} - \text{Fees} + \text{Adjustments}$$

$$\text{Variance} = \text{Expected Settlement} - \text{Actual Bank Credit}$$

### Deterministic Status Definitions

- `MATCHED`: Expected Settlement equals Actual Bank Credit Amount ($\text{Variance} = 0$).
- `VARIANCE`: Expected Settlement does not equal Actual Bank Credit Amount ($\text{Variance} \neq 0$).
- `PARTIAL`: Actual Bank Credit is non-zero but less than Expected Settlement Amount ($0 < \text{Actual} < \text{Expected}$).
- `MISSING`: Expected financial records exist but matching Bank Credit or Settlement transaction is missing.
- `DUPLICATE`: Multiple payment, settlement, or bank transactions reference identical UTRs or Payment IDs.

---

## Commands & Scripts

### 1. Database Migrations & Initial Seed
```bash
npm run db:migrate    # Runs SQL DDL migrations creating 17 core financial tables
npm run db:seed       # Seeds initial deterministic test scenario
```

### 2. Synthetic Data Generator (Seed = 42)
Populates PostgreSQL with 100+ realistic payment cases across 3 merchants with controlled exception injection (~70% MATCHED, ~10% VARIANCE, ~5% PARTIAL, ~5% MISSING, ~3% DUPLICATE, ~7% OTHER):
```bash
npm run seed:synthetic
```

### 3. Run Batch Reconciliation Engine & Benchmark
Processes all merchant settlement cases in PostgreSQL, calculates expected vs actual credit, evaluates status, traces evidence IDs, and measures throughput (records/sec):
```bash
npm run reconcile
```

### 4. Run Automated Unit Tests
```bash
npm run test
```

### 5. Validate Single Case (Milestone 5B)
```bash
npm run validate:recon
```

### 6. Development Server
```bash
npm run dev
```

---

## Environment Variables (.env)

```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/settletrace
PORT=4000
NODE_ENV=development
```
