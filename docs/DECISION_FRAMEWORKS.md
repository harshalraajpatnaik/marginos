# MarginOS — MBA Financial Frameworks & Decision Models

## 1. The Markup vs. Margin Framework

### 1.1 The Mathematical Distinction
Many Indian retailers mistakenly believe that a 25% markup means they make a 25% profit margin. In reality:

$$\text{Markup \%} = \frac{\text{Selling Price} - \text{Cost}}{\text{Cost}} \times 100$$

$$\text{Margin \%} = \frac{\text{Selling Price} - \text{Cost}}{\text{Selling Price}} \times 100$$

### 1.2 The "Kirana Markup Trap"
Consider an item purchased for ₹100:
- Retailer marks it up by **25%** $\rightarrow$ Selling Price = **₹125**.
- Gross Profit = **₹25**.
- Actual Profit Margin on Sales = $\frac{25}{125} \times 100 =$ **20.0%**.

If the store's operating overheads (rent, electricity, helper salaries, transport, financing) total **22% of revenue**, the retailer will **lose 2% on every single sale** while assuming they are earning 25%!

### 1.3 Conversion Formulas
$$\text{Selling Price} = \frac{\text{Cost Price}}{1 - \frac{\text{Target Margin \%}}{100}}$$

$$\text{Required Markup \%} = \frac{\text{Target Margin \%}}{100 - \text{Target Margin \%}} \times 100$$

### 1.4 Minimum Viable Selling Price (MVP)
MarginOS computes the baseline floor price below which an item causes direct economic loss:
$$\text{MVP} = \text{Purchase Cost} + \text{Packaging} + \text{Transport} + \text{Fixed Overhead Allocation} + \text{Wastage Allowance}$$

---

## 2. Break-Even Analysis Engine

Break-even represents the volume where total business revenue exactly covers both variable costs and fixed overheads:

$$\text{Contribution Margin per Unit} = \text{Average Selling Price} - \text{Variable Cost per Unit}$$

$$\text{Contribution Margin Ratio} = \frac{\text{Contribution Margin per Unit}}{\text{Average Selling Price}}$$

$$\text{Break-Even Quantity (Units)} = \frac{\text{Total Monthly Fixed Costs}}{\text{Contribution Margin per Unit}}$$

$$\text{Break-Even Revenue (₹)} = \frac{\text{Total Monthly Fixed Costs}}{\text{Contribution Margin Ratio}}$$

$$\text{Daily Sales Target (₹)} = \frac{\text{Break-Even Revenue}}{30}$$

---

## 3. Working Capital & Cash Conversion Cycle (CCC)

Working capital measures how much cash is locked inside operating cycles before returning to the business bank account:

$$\text{CCC (Days)} = \text{DIO} + \text{DSO} - \text{DPO}$$

1. **Days Inventory Outstanding (DIO)**:
   $$\text{DIO} = \frac{\text{Average Inventory}}{\text{Cost of Goods Sold (COGS)}} \times 365$$
2. **Days Sales Outstanding (DSO)**:
   $$\text{DSO} = \frac{\text{Accounts Receivable (Customer Udhaar)}}{\text{Total Credit Sales}} \times 365$$
3. **Days Payable Outstanding (DPO)**:
   $$\text{DPO} = \frac{\text{Accounts Payable (Supplier Dues)}}{\text{Total Purchases}} \times 365$$

### Strategic Action Levers:
- **High DIO**: Capital trapped in dead stock $\rightarrow$ Apply Pareto ABC clearance discounts.
- **High DSO**: High bad-debt risk $\rightarrow$ Enable WhatsApp automated payment reminders.
- **Low DPO**: Paying suppliers too fast in cash $\rightarrow$ Negotiate standard 15-30 day credit cycles.

---

## 4. Loan Affordability & DSCR Analysis

Indian commercial banks evaluate SME loan applications using the **Debt Service Coverage Ratio (DSCR)**:

$$\text{DSCR} = \frac{\text{Annual Net Operating Profit (EBITDA)}}{\text{Annual Debt Service (Principal Repayments} + \text{Interest)}}$$

### Affordability Thresholds:
| DSCR Value | Rating | Interpretation |
| :--- | :--- | :--- |
| $\ge 2.0\times$ | **Highly Safe** | Excellent cash buffer. Business easily absorbs sales dips. |
| $1.5\times - 1.99\times$ | **Healthy** | Standard banking approval benchmark. |
| $1.0\times - 1.49\times$ | **Risky** | Fragile. A 10% drop in sales causes inability to service EMI. |
| $< 1.0\times$ | **Danger / Insolvent** | Monthly profit is less than EMI obligation. Do not borrow. |

---

## 5. Mode C Business Simulator (What-If Modeling)

Mode C enables hypothetical scenario projections without modifying live accounting ledgers:
- **Revenue Shock**: What if competitor opens nearby and sales decline by 20%?
- **Store Expansion**: Opening branch #2 (Adds ₹35,000 rent + ₹30,000 salaries + ₹2,00,000 CapEx).
- **Supplier Consolidation**: Negotiating 5% bulk purchase discount across all top FMCG SKUs.
