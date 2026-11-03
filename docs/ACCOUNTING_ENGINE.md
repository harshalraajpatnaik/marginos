# MarginOS — Double-Entry Accounting Engine Specification

## 1. Accounting Philosophy

MarginOS adheres strictly to the **dual-aspect concept** of double-entry bookkeeping, aligned with **Indian Accounting Standards (AS-1, AS-2, Ind-AS)** and Chartered Accountant compliance requirements.

Every transaction in MarginOS produces a balanced journal entry where:
$$\sum \text{Debits} = \sum \text{Credits}$$

### Principles:
1. **Mathematical Precision**: All currency amounts are represented using Java `BigDecimal` with 4 decimal places for internal rates and 2 decimal places for posted ledger amounts (`NUMERIC(19, 4)` and `NUMERIC(19, 2)` in PostgreSQL). Floating-point drift is strictly prevented.
2. **Immutable Posted Entries**: Once a journal entry is posted, it cannot be modified or deleted. Errors are corrected via compensating reversal entries (`AccountingService.reverseJournalEntry()`), preserving an audit trail.
3. **No Unbalanced Entries**: The database schema and service layer reject any journal entry whose sum of debits does not exactly equal its sum of credits.

---

## 2. Indian Standard Chart of Accounts (COA)

MarginOS automatically seeds a comprehensive Indian Chart of Accounts across five major categories:

```
1000 ASSETS (Normal Balance: DEBIT)
├── 1010 Cash in Hand (Shop Drawer)
├── 1020 Bank Account (Current A/c)
├── 1030 UPI Settlement Clearing
├── 1100 Accounts Receivable (Customer Khata)
├── 1200 Merchandise Inventory (WAVG Valuation)
├── 1300 Input CGST Receivable
├── 1310 Input SGST Receivable
└── 1500 Shop Equipment & Furniture

2000 LIABILITIES (Normal Balance: CREDIT)
├── 2010 Accounts Payable (Supplier Dues)
├── 2100 Output CGST Payable
├── 2110 Output SGST Payable
├── 2200 Short-Term Business Loan Payable
└── 2300 Accrued Operating Expenses

3000 EQUITY (Normal Balance: CREDIT)
├── 3010 Owner's Capital Introduced
├── 3020 Owner's Drawings (Contra Equity - Debit)
└── 3100 Retained Earnings / Current Period Profit

4000 REVENUE (Normal Balance: CREDIT)
├── 4010 Counter Cash Sales
├── 4020 UPI / Digital Sales
├── 4030 Credit (Udhaar) Sales
└── 4090 Sales Discounts Allowed (Contra Revenue - Debit)

5000 COST OF GOODS SOLD (COGS) (Normal Balance: DEBIT)
├── 5010 Cost of Goods Sold (Inventory Expense)
└── 5020 Inventory Shrinkage & Spoilage

6000 OPERATING EXPENSES (Normal Balance: DEBIT)
├── 6010 Shop Rent
├── 6020 Electricity & Utilities
├── 6030 Staff Wages & Helper Salaries
├── 6040 Logistics, Freight & Cartage
├── 6050 Packaging & Consumables
├── 6060 Maintenance & Repairs
├── 6070 Refreshments (Daily Tea & Snacks)
└── 6090 Bank Charges & Interest
```

---

## 3. Automated Transaction Journal Postings

### 3.1 Customer Cash Sale (₹1,000 + 5% GST = ₹1,050)
| Account Code | Account Name | Debit (₹) | Credit (₹) |
| :--- | :--- | :--- | :--- |
| `1010` | Cash in Hand | **1,050.00** | — |
| `4010` | Counter Sales Revenue | — | **1,000.00** |
| `2100` | Output CGST Payable (2.5%) | — | **25.00** |
| `2110` | Output SGST Payable (2.5%) | — | **25.00** |
| `5010` | Cost of Goods Sold (COGS) | **820.00** | — |
| `1200` | Merchandise Inventory (at WAVG) | — | **820.00** |

*Result:* Balanced in 2 distinct entry layers. Immediately records revenue, tax liability, gross margin, and stock reduction.

### 3.2 Credit Sale on Customer Khata (Udhaar) (₹2,500)
| Account Code | Account Name | Debit (₹) | Credit (₹) |
| :--- | :--- | :--- | :--- |
| `1100` | Accounts Receivable (Ramesh Patel) | **2,500.00** | — |
| `4030` | Credit Sales Revenue | — | **2,500.00** |
| `5010` | Cost of Goods Sold (COGS) | **1,950.00** | — |
| `1200` | Merchandise Inventory (at WAVG) | — | **1,950.00** |

### 3.3 Supplier Purchase on Credit (₹10,000 + 5% GST = ₹10,500)
| Account Code | Account Name | Debit (₹) | Credit (₹) |
| :--- | :--- | :--- | :--- |
| `1200` | Merchandise Inventory (at Cost) | **10,000.00** | — |
| `1300` | Input CGST Receivable (2.5%) | **250.00** | — |
| `1310` | Input SGST Receivable (2.5%) | **250.00** | — |
| `2010` | Accounts Payable (Metro Cash & Carry) | — | **10,500.00** |

*Note:* Inventory weighted-average unit cost is recalculated automatically on posting.

### 3.4 Mode A Daily Cash Closing (Reconciliation Variance)
When the shopkeeper counts drawer cash at night:
- Theoretical Cash: ₹12,000
- Physical Counted Cash: ₹11,850 (Shortage of ₹150)
- Auto-balancing adjusting entry:
  - **Debit**: `6090 Miscellaneous Expense (Cash Shortage)` ₹150.00
  - **Credit**: `1010 Cash in Hand` ₹150.00
- Drawer reconciled to 100% exact physically counted notes.
