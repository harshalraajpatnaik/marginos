# MarginOS — Product Requirements Document (PRD)

## 1. Product Vision & Problem Statement

### 1.1 Vision
To establish **MarginOS** as the definitive financial operating system for Indian micro, small, and medium businesses—empowering business owners to understand their actual cash, true gross and net margins, break-even sales targets, and expansion viability from Day 1.

### 1.2 Core Problem Statement
Indian small business owners routinely face cash shortages despite high gross sales because traditional software is either too difficult to adopt (Tally, SAP) or too simplistic to provide actionable financial intelligence (basic Udhaar apps). Business owners lack clarity on whether they are truly profitable, how much capital is trapped in stock, and whether they can afford to borrow or expand.

---

## 2. Product Architecture & Operating Modes

### 2.1 Mode A — Quick Start (Shopkeeper Daily Cashbook)
- **Functional Requirements**:
  - Record opening cash, daily cash sales, digital/UPI sales, customer udhaar given, and customer collections.
  - Record cash purchases, operating expenses (rent, helper wages, tea/snacks, power), and supplier payments.
  - Compute real-time theoretical cash in drawer.
  - Accept physical counted cash input and calculate exact cash variance (Matched, Shortage, Surplus).
  - Generate formatted WhatsApp daily closing text digest.
- **Acceptance Criteria**:
  - A user must be able to complete daily cash reconciliation in under 60 seconds.
  - All calculated numbers must be backed by balanced double-entry ledger entries.

### 2.2 Mode B — Detailed Business Operations
- **Functional Requirements**:
  - Product catalog with SKU, barcode, unit of measure, GST tax rate, and reorder levels.
  - Real-time Weighted-Average Costing (WAVG) based on AS-2.
  - GST Sales Invoicing with line-item discounts and pre-sale profit margin preview.
  - Quick 1-click counter POS for rush hours.
  - Supplier purchase bills with automatic WAVG updates and input tax credit (ITC) ledger posting.
  - Customer Khata with 0-30, 31-60, 61-90, 90+ day receivables aging and 1-click WhatsApp payment reminders.
  - Supplier dues tracking with payment terms.
  - Pareto ABC inventory classification, slow-moving dead stock detection, and Economic Order Quantity (EOQ) optimization.
- **Acceptance Criteria**:
  - Stock movements must maintain zero-drift valuation matching general ledger account `1200`.
  - Invoices must enforce tenant isolation and cryptographic verification.

### 2.3 Mode C — MBA Business Simulator
- **Functional Requirements**:
  - Create hypothetical scenarios testing revenue changes (-50% to +150%), COGS variations (-25% to +30%), additional monthly fixed overheads, one-time CapEx, and loan EMIs.
  - Side-by-side comparison matrix showing projected vs. baseline monthly revenue, gross margin %, net operating profit, break-even targets, and runway impact.
  - Display clear disclaimers that simulated models do not alter live accounting books.
- **Acceptance Criteria**:
  - Projections must be computed strictly in memory without altering PostgreSQL ledger tables.

### 2.4 Double-Entry Financial Statements
- **Functional Requirements**:
  - Master Chart of Accounts (COA) compliant with Indian standards.
  - Manual journal entries with dynamic line additions and strict $\sum \text{Debits} == \sum \text{Credits}$ enforcement.
  - Real-time Trial Balance report with `balanced: true` indicator.
  - Statement of Profit & Loss (Operating Revenue, COGS, Gross Profit, Operating Expenses, Operating Profit, Net Profit).
  - Balance Sheet (Assets = Liabilities + Owner's Equity).
  - Direct Cash Flow Statement.
- **Acceptance Criteria**:
  - All financial calculations must use `BigDecimal` with half-up rounding. Floating point arithmetic is prohibited.

---

## 3. Product Roadmap

| Phase | Milestone | Scope | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1: Foundation (MVP)** | Core Accounting & Engine | Double-entry ledger, WAVG costing, Mode A Cashbook, Mode B Invoicing, Mode C Simulator, Auth, Docker infrastructure | **Delivered (v1.0)** |
| **Phase 2: Mobile & Offline** | Android APK & PWA | Native Android thermal printer Bluetooth support, offline SQLite sync with background reconciliation | Q1 2027 |
| **Phase 3: Financial Services** | Embedded Lending | Direct API gateway connecting SME DSCR metrics with Indian NBFCs and banks for instant working capital credit lines | Q3 2027 |
| **Phase 4: Multi-Store Chains** | Enterprise Distribution | Centralized warehouse distribution, inter-store stock transfers, consolidated multi-branch balance sheets | Q4 2027 |
