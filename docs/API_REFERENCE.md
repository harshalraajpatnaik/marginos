# MarginOS — REST API Reference & Developer Guide

## 1. Overview & Authentication

MarginOS provides a versioned REST API (`/api/v1`) designed for POS integrations, e-commerce sync (Shopify, WooCommerce), and external accounting extracts.

### Authentication Mechanisms:
1. **User JWT Bearer Token**: Used by the web application. Transmitted via `Authorization: Bearer <token>`.
2. **Workspace API Keys**: High-performance keys prefixed with `mk_live_...`. Transmitted via HTTP header `X-API-Key: mk_live_<token>`.

### Base URL:
- Local Development: `http://localhost:8085/api/v1`
- Swagger UI Documentation: `http://localhost:8085/swagger-ui.html`
- OpenAPI JSON Specification: `http://localhost:8085/v3/api-docs`

---

## 2. API Endpoints

### 2.1 Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Register a new user and create an initial business workspace.
- `POST /api/v1/auth/login` — Authenticate using email and password. Returns `accessToken`, `refreshToken`, and user workspaces.
- `GET /api/v1/auth/me` — Retrieve authenticated user profile.
- `POST /api/v1/auth/refresh` — Rotate and obtain a new access token using a refresh token.

### 2.2 Business Management (`/api/v1/businesses`)
- `GET /api/v1/businesses` — List workspaces the user belongs to.
- `POST /api/v1/businesses` — Create a new business workspace.
- `POST /api/v1/businesses/{id}/mode` — Switch operating mode (`QUICK_START`, `DETAILED`, `SIMULATOR`).

### 2.3 Dashboard (`/api/v1/businesses/{businessId}/dashboard`)
- `GET /api/v1/businesses/{businessId}/dashboard` — Aggregated KPIs: Cash in hand, bank balance, today's sales, gross/net margins, working capital cycle, receivables, payables, and low stock count.

### 2.4 Mode A: Cashbook (`/api/v1/businesses/{businessId}/cashbook`)
- `GET /api/v1/businesses/{businessId}/cashbook` — Query historical daily cashbook entries by date range.
- `GET /api/v1/businesses/{businessId}/cashbook/daily?date=YYYY-MM-DD` — Retrieve cashbook entry for a specific date.
- `POST /api/v1/businesses/{businessId}/cashbook` — Post daily closing: records inflows, outflows, physical counted cash, and variance.
- `GET /api/v1/businesses/{businessId}/cashbook/whatsapp-summary?date=YYYY-MM-DD` — Generates a formatted text summary ready for WhatsApp sharing.

### 2.5 Products & Inventory (`/api/v1/businesses/{businessId}`)
- `GET /api/v1/businesses/{businessId}/products` — Product catalog with SKU, barcodes, WAVG cost, selling price, and stock levels.
- `POST /api/v1/businesses/{businessId}/products` — Add a new product.
- `GET /api/v1/businesses/{businessId}/inventory/valuation` — Total stock valuation based on Weighted-Average Cost (WAVG).
- `GET /api/v1/businesses/{businessId}/inventory/abc-analysis` — Pareto classification (Class A: 70% value, Class B: 20%, Class C: 10%).
- `GET /api/v1/businesses/{businessId}/inventory/slow-moving?days=45` — Detect dead stock with zero sales in 45+ days.
- `GET /api/v1/businesses/{businessId}/inventory/eoq` — Economic Order Quantity calculator.

### 2.6 Sales & Billing (`/api/v1/businesses/{businessId}/sales`)
- `POST /api/v1/businesses/{businessId}/sales/quick-counter-sale` — 1-click cash/UPI counter sale without entering SKU line items.
- `POST /api/v1/businesses/{businessId}/sales/invoices` — Itemized tax sales invoice. Auto-posts balanced double-entry journal and updates inventory.

### 2.7 Purchases & Expenses (`/api/v1/businesses/{businessId}`)
- `POST /api/v1/businesses/{businessId}/purchases/invoices` — Record supplier bills. Auto-updates WAVG cost.
- `POST /api/v1/businesses/{businessId}/expenses` — Record overheads (Rent, electricity, salaries, transport, tea/snacks).

### 2.8 Double-Entry Accounting (`/api/v1/businesses/{businessId}/accounting`)
- `GET /api/v1/businesses/{businessId}/accounting/trial-balance` — Real-time Trial Balance with `isBalanced` verification.
- `GET /api/v1/businesses/{businessId}/accounting/profit-loss` — Statement of Profit & Loss (Revenue, COGS, Gross Profit, EBITDA, Net Profit).
- `GET /api/v1/businesses/{businessId}/accounting/balance-sheet` — Balance Sheet (Assets = Liabilities + Equity).
- `GET /api/v1/businesses/{businessId}/accounting/cash-flow` — Direct Cash Flow Statement.

### 2.9 Decision Engines
- `POST /api/v1/businesses/{businessId}/pricing/calculate` — Markup vs Margin calculator, minimum viable price, discount impact.
- `POST /api/v1/businesses/{businessId}/breakeven/calculate` — Break-even units, revenue, and daily target.
- `GET /api/v1/businesses/{businessId}/working-capital/metrics` — Cash Conversion Cycle (DIO + DSO - DPO).
- `POST /api/v1/businesses/{businessId}/loan/calculate` — EMI amortization schedule.
- `POST /api/v1/businesses/{businessId}/loan/affordability` — Debt Service Coverage Ratio (DSCR) check.
- `POST /api/v1/businesses/{businessId}/scenarios` — Mode C hypothetical business expansion simulations.

### 2.10 Developer Platform (`/api/v1/businesses/{businessId}/api-keys`)
- `POST /api/v1/businesses/{businessId}/api-keys` — Create scoped API key (`mk_live_...`).
- `GET /api/v1/businesses/{businessId}/api-keys` — List active keys with masked identifiers.
- `DELETE /api/v1/businesses/{businessId}/api-keys/{id}` — Revoke an API key immediately.

---

## 3. Code Samples

### Python: Record Quick Counter Sale
```python
import requests

url = "http://localhost:8085/api/v1/businesses/b0000000-0000-0000-0000-000000000001/sales/quick-counter-sale"
headers = {
    "X-API-Key": "mk_live_your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "totalAmount": 350.00,
    "paymentMode": "UPI",
    "notes": "Counter rush sale"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### cURL: Fetch Live Trial Balance
```bash
curl -X GET "http://localhost:8085/api/v1/businesses/b0000000-0000-0000-0000-000000000001/accounting/trial-balance" \
     -H "X-API-Key: mk_live_your_api_key_here"
```
