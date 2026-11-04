package com.marginos.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marginos.accounting.dto.AccountingDto.ProfitLossReport;
import com.marginos.accounting.service.AccountingService;
import com.marginos.ai.dto.AiDto.*;
import com.marginos.breakeven.dto.BreakEvenDto.BreakEvenCalculationRequest;
import com.marginos.breakeven.dto.BreakEvenDto.BreakEvenCalculationResponse;
import com.marginos.breakeven.service.BreakEvenService;
import com.marginos.cashbook.dto.CashbookDto.CashSummaryResponse;
import com.marginos.cashbook.service.CashbookService;
import com.marginos.common.MoneyUtils;
import com.marginos.dashboard.dto.DashboardDto.BusinessDashboardSummary;
import com.marginos.dashboard.service.DashboardService;
import com.marginos.inventory.dto.InventoryDto.InventoryValuationResponse;
import com.marginos.inventory.dto.InventoryDto.SlowMovingItem;
import com.marginos.inventory.service.InventoryService;
import com.marginos.loan.dto.LoanDto.CalculateLoanRequest;
import com.marginos.loan.dto.LoanDto.LoanCalculationResponse;
import com.marginos.loan.service.LoanService;
import com.marginos.party.dto.PartyDto.AgingReport;
import com.marginos.party.service.PartyService;
import com.marginos.pricing.dto.PricingDto.PricingCalculationRequest;
import com.marginos.pricing.dto.PricingDto.PricingCalculationResponse;
import com.marginos.pricing.service.PricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final DashboardService dashboardService;
    private final AccountingService accountingService;
    private final CashbookService cashbookService;
    private final InventoryService inventoryService;
    private final PartyService partyService;
    private final LoanService loanService;
    private final BreakEvenService breakEvenService;
    private final PricingService pricingService;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.enabled:false}")
    private boolean aiEnabled;

    @Value("${app.ai.provider:gemini}")
    private String aiProvider;

    @Value("${app.ai.gemini-api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini-model:gemini-2.5-flash}")
    private String geminiModel;

    public AskAiResponse askAssistant(UUID businessId, AskAiRequest req) {
        // 1. Gather authoritative live facts across all ledger and operational domains
        BusinessDashboardSummary dash = dashboardService.getDashboardSummary(businessId);
        CashSummaryResponse cash = cashbookService.getSummary(businessId);
        InventoryValuationResponse inv = inventoryService.getInventoryValuation(businessId);
        ProfitLossReport pnl = accountingService.getProfitLoss(businessId, LocalDate.now().minusDays(30), LocalDate.now());
        AgingReport receivables = partyService.getReceivablesAging(businessId);
        AgingReport payables = partyService.getPayablesAging(businessId);
        List<SlowMovingItem> slowMoving = inventoryService.getSlowMovingItems(businessId, 45);

        List<String> metrics = new ArrayList<>();
        metrics.add("Double-Entry P&L (Sales MTD: " + MoneyUtils.formatInr(dash.getMonthToDateSales()) + ", Net Profit: " + MoneyUtils.formatInr(dash.getMonthToDateNetProfit()) + ")");
        metrics.add("Cashbook (Physical Cash: " + MoneyUtils.formatInr(dash.getCashInHand()) + ", Bank Balance: " + MoneyUtils.formatInr(dash.getBankBalance()) + ")");
        metrics.add("WAVG Stock Valuation (" + MoneyUtils.formatInr(inv.getTotalStockValue()) + " across " + inv.getTotalSkus() + " SKUs)");
        metrics.add("Customer Khata (Total: " + MoneyUtils.formatInr(receivables.getTotal()) + ", High Risk >60d: " + MoneyUtils.formatInr(receivables.getSixtyPlus()) + ")");
        metrics.add("Supplier Dues (" + MoneyUtils.formatInr(payables.getTotal()) + ")");

        List<String> actions = new ArrayList<>();
        if (inv.getLowStockCount() > 0) {
            actions.add(String.format("Reorder %d critical items nearing zero stock.", inv.getLowStockCount()));
        }
        if (receivables.getSixtyPlus().compareTo(new BigDecimal("2000.00")) > 0) {
            actions.add(String.format("Send 1-click WhatsApp reminders for %s in overdue customer khata.", MoneyUtils.formatInr(receivables.getSixtyPlus())));
        }
        if (!slowMoving.isEmpty()) {
            actions.add("Run 10% promotional bundle on " + slowMoving.size() + " slow-moving items to unlock tied-up capital.");
        }

        String rawQuery = req.getQuestion() != null ? req.getQuestion().trim() : "";

        // 2. If Gemini API key is configured or in env, attempt upstream LLM reasoning
        String apiKey = (geminiApiKey != null && !geminiApiKey.isBlank()) ? geminiApiKey : System.getenv("GEMINI_API_KEY");
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String llmAnswer = callGeminiApi(apiKey, geminiModel, dash, inv, receivables, payables, pnl, slowMoving, rawQuery);
                if (llmAnswer != null && !llmAnswer.isBlank()) {
                    return AskAiResponse.builder()
                            .answer(llmAnswer)
                            .provider("GOOGLE_GEMINI_" + geminiModel.toUpperCase().replace("-", "_"))
                            .isAiEnabled(true)
                            .investigatedMetrics(metrics)
                            .recommendedActions(actions)
                            .build();
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to deterministic financial reasoning: {}", e.getMessage());
            }
        }

        // 3. Fallback to Grounded Financial Strategy Engine
        String answer = computeGroundedAnswer(dash, cash, inv, pnl, receivables, payables, slowMoving, rawQuery, businessId);

        return AskAiResponse.builder()
                .answer(answer)
                .provider("GROUNDED_FINANCIAL_REASONING_ENGINE")
                .isAiEnabled(aiEnabled)
                .investigatedMetrics(metrics)
                .recommendedActions(actions)
                .build();
    }

    private String computeGroundedAnswer(
            BusinessDashboardSummary dash,
            CashSummaryResponse cash,
            InventoryValuationResponse inv,
            ProfitLossReport pnl,
            AgingReport rec,
            AgingReport pay,
            List<SlowMovingItem> slowMoving,
            String query,
            UUID businessId) {

        String q = query.toLowerCase();

        // 1. MBA Profitability Turnaround Engine (DuPont Framework & Contribution Margin)
        if (q.contains("profit") && (q.contains("how") || q.contains("become") || q.contains("increase") || q.contains("more") || q.contains("grow") || q.contains("improve") || q.contains("strategy") || q.contains("turnaround"))) {
            BigDecimal sales = dash.getMonthToDateSales();
            BigDecimal grossProfit = dash.getMonthToDateGrossProfit();
            BigDecimal grossMargin = dash.getMonthToDateGrossMarginPercent();
            BigDecimal expenses = dash.getMonthToDateExpenses();
            BigDecimal netProfit = dash.getMonthToDateNetProfit();
            BigDecimal receivables = rec.getTotal();
            BigDecimal highRisk = rec.getSixtyPlus();
            BigDecimal stockVal = inv.getTotalStockValue();

            // DuPont Lever 1: 2% Gross Margin Expansion
            BigDecimal extraProfitFrom2Pct = sales.multiply(new BigDecimal("0.02"));
            // DuPont Lever 2: Capital release from overdue debtors & dead stock
            BigDecimal trappedCapital = highRisk.add(stockVal.multiply(new BigDecimal("0.20")));

            return String.format(
                    "📊 **MBA Business Turnaround Roadmap for %s:**\n\n" +
                    "### 1. Executive Diagnosis (The Real Numbers)\n" +
                    "- **Sales (Month-to-Date):** **%s**\n" +
                    "- **Gross Margin:** **%s%%** (Gross Profit: **%s**)\n" +
                    "- **Operating Overhead:** **%s** (%s%% of sales)\n" +
                    "- **Net Profit:** **%s**\n" +
                    "- **Trapped Working Capital:** **%s** (Overdue Udhaar: **%s**, Dead/Slow Stock: **%s**)\n\n" +
                    "### 2. Strategic MBA Framework: DuPont Retail Model\n" +
                    "According to the **DuPont Equation for Retail**, your Return on Capital equals:\n" +
                    "`Net Profit Margin × Inventory Turnover × Working Capital Velocity`\n\n" +
                    "To generate explosive profit growth without extra capital, apply these **3 high-impact levers**:\n\n" +
                    "**Lever 1: Stop Margin Leakage (Target: +2%% Gross Margin Expansion)**\n" +
                    "- Eliminating informal counter discounts and rounding off losses will immediately add **+%s in pure profit** every month on your current volume.\n" +
                    "- *Counter Merchandising:* Place 30-40%% high-margin impulse snacks, batteries, and branded accessories right at the billing register.\n\n" +
                    "**Lever 2: Unlock Trapped Capital & Squeeze the Cash Conversion Cycle**\n" +
                    "- You have **%s in high-risk customer dues (>60 days)** and **%s tied up in stock**.\n" +
                    "- Liquidating slow-moving items with a 10%% bundle and collecting past-due udhaar will free up **~%s in fresh cash**.\n" +
                    "- Reinvest this released capital into high-velocity Category A products that turn over every 7–10 days.\n\n" +
                    "**Lever 3: Rationalize Operating Overheads**\n" +
                    "- Your current monthly overhead burden is **%s**.\n" +
                    "- Benchmark rule: In Indian retail, store rent + wages + electricity should remain strictly **below 10–12%% of revenue**.\n\n" +
                    "🎯 **Immediate 7-Day Action Plan:**\n" +
                    "1. Send automated WhatsApp collection reminders for all dues >30 days.\n" +
                    "2. Mark down the bottom 5 slow-moving SKUs by 15%% to recover tied-up capital.\n" +
                    "3. Enforce a strict minimum selling price with zero unrecorded counter credit.",
                    dash.getBusinessName(),
                    MoneyUtils.formatInr(sales),
                    grossMargin,
                    MoneyUtils.formatInr(grossProfit),
                    MoneyUtils.formatInr(expenses),
                    sales.compareTo(BigDecimal.ZERO) > 0 ? expenses.multiply(new BigDecimal("100")).divide(sales, 1, RoundingMode.HALF_UP) : "0",
                    MoneyUtils.formatInr(netProfit),
                    MoneyUtils.formatInr(trappedCapital),
                    MoneyUtils.formatInr(highRisk),
                    MoneyUtils.formatInr(stockVal),
                    MoneyUtils.formatInr(extraProfitFrom2Pct),
                    MoneyUtils.formatInr(highRisk),
                    MoneyUtils.formatInr(stockVal),
                    MoneyUtils.formatInr(trappedCapital.multiply(new BigDecimal("0.85"))),
                    MoneyUtils.formatInr(expenses)
            );
        }

        // 2. Customer Khata & Collections SOP
        if (q.contains("udhaar") || q.contains("receivable") || q.contains("debtor") || q.contains("khata") || q.contains("collect") || q.contains("due")) {
            BigDecimal totalRec = rec.getTotal();
            BigDecimal highRisk = rec.getSixtyPlus();
            BigDecimal thirtyToSixty = rec.getThirtyTo60();
            BigDecimal currentZeroThirty = rec.getCurrent();

            return String.format(
                    "👥 **Customer Khata & Receivables Recovery SOP (%s):**\n\n" +
                    "- **Total Outstanding Credit (Udhaar):** **%s**\n" +
                    "- **Current (0–30 days):** **%s** (Normal retail billing cycle)\n" +
                    "- **Overdue (31–60 days):** **%s** (Follow-up required)\n" +
                    "- **High-Risk (>60 days):** **%s** (Immediate capital risk)\n\n" +
                    "⚠️ **The Cost of Free Credit:**\n" +
                    "When customers delay payment by 60+ days, you are providing **zero-interest loans funded out of your own store working capital**.\n\n" +
                    "📋 **MBA 4-Step Credit Recovery Policy:**\n" +
                    "1. **Automated WhatsApp Reminders:** Send 1-click ledger statements with UPI payment links for the **%s** in overdue dues.\n" +
                    "2. **Stop-Credit Threshold:** Freeze new credit orders for any account with balances older than 30 days.\n" +
                    "3. **Early Settlement Incentive:** Offer a 1.5%% prompt-payment discount for settlement within 48 hours.\n" +
                    "4. **Shift to COD:** Transition chronic late-paying walk-ins strictly to Cash on Delivery / UPI.",
                    dash.getBusinessName(),
                    MoneyUtils.formatInr(totalRec),
                    MoneyUtils.formatInr(currentZeroThirty),
                    MoneyUtils.formatInr(thirtyToSixty),
                    MoneyUtils.formatInr(highRisk),
                    MoneyUtils.formatInr(highRisk.add(thirtyToSixty))
            );
        }

        // A. Cash vs. Profit Reconciliation
        if (q.contains("cash") && (q.contains("profit") || q.contains("lower") || q.contains("differ") || q.contains("where"))) {
            BigDecimal netProfit = dash.getMonthToDateNetProfit();
            BigDecimal cashInHand = dash.getCashInHand();
            BigDecimal uncollectedCredit = rec.getTotal();
            BigDecimal stockVal = inv.getTotalStockValue();
            BigDecimal supplierDues = pay.getTotal();

            return String.format(
                    "💵 **Cash vs. Profit Reconciliation for %s:**\n\n" +
                    "Your **Accounting Net Profit** this month is **%s**, while your **Physical Cash in Hand** is **%s**.\n\n" +
                    "**Why does cash not equal profit?**\n" +
                    "1. **Customer Khata (Uncollected Udhaar):** You have **%s** in pending customer credit. This counts as revenue and profit on your P&L, but the money is not yet in your drawer.\n" +
                    "2. **Cash Locked in Stock:** You are currently holding **%s** in inventory. Purchasing stock consumes immediate cash, but is only expensed as Cost of Goods Sold when customers purchase it.\n" +
                    "3. **Supplier Payment Timing:** You have **%s** in upcoming supplier payables. Paying suppliers reduces cash without changing today's profit.\n\n" +
                    "💡 **Action Rule:** *Profit is your long-term score; Cash is your daily oxygen.* Collect high-risk customer dues (>30 days) to convert paper profit into usable bank balance.",
                    dash.getBusinessName(),
                    MoneyUtils.formatInr(netProfit),
                    MoneyUtils.formatInr(cashInHand),
                    MoneyUtils.formatInr(uncollectedCredit),
                    MoneyUtils.formatInr(stockVal),
                    MoneyUtils.formatInr(supplierDues)
            );
        }

        // B. Hiring Affordability & Incremental Break-even
        if (q.contains("hire") || q.contains("staff") || q.contains("employee") || q.contains("salary") || q.contains("helper")) {
            BigDecimal salary = extractNumber(query, new BigDecimal("12000.00"));
            BigDecimal grossMarginPct = dash.getMonthToDateGrossMarginPercent();
            if (grossMarginPct.compareTo(BigDecimal.ZERO) <= 0) grossMarginPct = new BigDecimal("20.00");

            // Required extra sales = Salary / (Gross Margin % / 100)
            BigDecimal requiredExtraSales = salary.multiply(new BigDecimal("100")).divide(grossMarginPct, 0, RoundingMode.CEILING);
            BigDecimal dailyExtraSales = requiredExtraSales.divide(new BigDecimal("30"), 0, RoundingMode.CEILING);
            BigDecimal netProfit = dash.getMonthToDateNetProfit();

            boolean canAfford = netProfit.compareTo(salary.multiply(new BigDecimal("1.5"))) >= 0;

            return String.format(
                    "👥 **Hiring Affordability Analysis (Salary: %s/month):**\n\n" +
                    "- **Current Store Gross Margin:** **%s%%**\n" +
                    "- **Current Monthly Net Profit:** **%s**\n" +
                    "- **Required Extra Monthly Sales:** **%s** (~**%s/day** in extra counter billing)\n\n" +
                    "**Verdict:** %s\n\n" +
                    "💡 **MBA Rule of Thumb:** Never hire staff solely to handle existing routine work unless they either:\n" +
                    "1. Free up the store owner to source higher-margin goods or open early/late.\n" +
                    "2. Directly increase counter throughput by at least **%s/day** to cover their own salary.",
                    MoneyUtils.formatInr(salary),
                    grossMarginPct,
                    MoneyUtils.formatInr(netProfit),
                    MoneyUtils.formatInr(requiredExtraSales),
                    MoneyUtils.formatInr(dailyExtraSales),
                    canAfford
                            ? "✅ **Financially Viable:** Your monthly net profit comfortably covers this salary with positive cushion."
                            : "⚠️ **Tight / Borderline:** Your current net profit will be significantly squeezed by this fixed commitment unless daily sales expand.",
                    MoneyUtils.formatInr(dailyExtraSales)
            );
        }

        // C. Loan Affordability & DSCR
        if (q.contains("loan") || q.contains("borrow") || q.contains("emi") || q.contains("interest") || q.contains("dscr")) {
            BigDecimal principal = extractNumber(query, new BigDecimal("500000.00"));
            BigDecimal rate = new BigDecimal("12.50");
            int tenure = 36;

            CalculateLoanRequest lReq = new CalculateLoanRequest();
            lReq.setPrincipalAmount(principal);
            lReq.setAnnualInterestRatePercent(rate);
            lReq.setTenureMonths(tenure);
            LoanCalculationResponse loanRes = loanService.calculateLoan(businessId, lReq);

            return String.format(
                    "🏦 **Loan Affordability Diagnostic (%s at %s%% for %d months):**\n\n" +
                    "- **Estimated Monthly EMI:** **%s**\n" +
                    "- **Total Interest Payable:** **%s**\n" +
                    "- **Store Monthly Operating Profit:** **%s**\n" +
                    "- **Debt Service Coverage Ratio (DSCR):** **%sx**\n\n" +
                    "**Banker's Assessment:** %s\n\n" +
                    "💡 **Golden Rule:** Only take debt to fund assets that generate returns higher than %s%% (e.g. bulk procurement discounts or high-margin product additions).",
                    MoneyUtils.formatInr(principal),
                    rate,
                    tenure,
                    MoneyUtils.formatInr(loanRes.getMonthlyEmi()),
                    MoneyUtils.formatInr(loanRes.getTotalInterest()),
                    MoneyUtils.formatInr(loanRes.getMonthlyOperatingProfit()),
                    loanRes.getDebtServiceCoverageRatio(),
                    loanRes.getPlainLanguageRecommendation(),
                    rate
            );
        }

        // D. Pricing & Margin Confusion / Markup Trap
        if (q.contains("price") || q.contains("charge") || q.contains("markup") || (q.contains("margin") && q.contains("cost"))) {
            BigDecimal cost = extractCost(query, new BigDecimal("100.00"));
            BigDecimal targetMargin = extractMargin(query, new BigDecimal("20.00"));

            // Selling Price = Cost / (1 - Margin%)
            BigDecimal marginFrac = targetMargin.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            BigDecimal divisor = BigDecimal.ONE.subtract(marginFrac);
            BigDecimal targetPrice = cost.divide(divisor, 2, RoundingMode.HALF_UP);
            BigDecimal profit = targetPrice.subtract(cost);
            BigDecimal equivalentMarkup = profit.multiply(new BigDecimal("100")).divide(cost, 1, RoundingMode.HALF_UP);

            return String.format(
                    "🏷️ **Optimal Pricing Calculation (Cost Basis: %s, Desired Margin: %s%%):**\n\n" +
                    "- **Recommended Selling Price:** **%s** (Profit: **%s/unit**)\n" +
                    "- **Equivalent Markup over Cost:** **%s%%**\n\n" +
                    "⚠️ **Avoid the Retail Markup Trap:**\n" +
                    "If you simply add %s%% markup to %s, your selling price would be **%s**, yielding **only %s%% gross margin**!\n" +
                    "If your store rent and electricity overheads equal 15%% of sales, you would earn almost nothing on paper.\n\n" +
                    "**Pricing Formula:** `Selling Price = Cost ÷ (1 - Margin%%)`\n" +
                    "`%s ÷ (1 - 0.%s) = %s`",
                    MoneyUtils.formatInr(cost),
                    targetMargin,
                    MoneyUtils.formatInr(targetPrice),
                    MoneyUtils.formatInr(profit),
                    equivalentMarkup,
                    targetMargin,
                    MoneyUtils.formatInr(cost),
                    MoneyUtils.formatInr(cost.multiply(BigDecimal.ONE.add(marginFrac))),
                    cost.multiply(marginFrac).multiply(new BigDecimal("100")).divide(cost.multiply(BigDecimal.ONE.add(marginFrac)), 1, RoundingMode.HALF_UP),
                    cost,
                    targetMargin.intValue(),
                    MoneyUtils.formatInr(targetPrice)
            );
        }

        // E. Slow-Moving Stock & Dead Inventory Capital
        if (q.contains("slow") || q.contains("dead") || q.contains("locked") || (q.contains("inventory") && q.contains("item"))) {
            if (slowMoving.isEmpty()) {
                return String.format(
                        "📦 **Inventory Health Check:**\n\n" +
                        "Great news! No critical dead stock (>45 days without movement) was detected among your tracked SKUs.\n" +
                        "- Total Stock Valuation: **%s**\n" +
                        "- Low Stock SKUs: **%d** needing reorder.\n" +
                        "Maintain fast stock turnover by monitoring sales frequency weekly.",
                        MoneyUtils.formatInr(inv.getTotalStockValue()),
                        inv.getLowStockCount()
                );
            }

            BigDecimal totalLocked = slowMoving.stream()
                    .map(SlowMovingItem::getStockValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            StringBuilder sb = new StringBuilder();
            sb.append(String.format("📦 **Slow-Moving Stock Diagnostic (%d SKUs with %s Capital Locked):**\n\n",
                    slowMoving.size(), MoneyUtils.formatInr(totalLocked)));
            sb.append("These products have not sold in over 45 days, freezing valuable working capital:\n");

            int count = 0;
            for (SlowMovingItem item : slowMoving) {
                if (++count > 4) break;
                sb.append(String.format("- **%s** (%s): %s units sitting on shelves for **%d days** (Tied up: **%s**)\n",
                        item.getName(), item.getSku(), item.getCurrentStock(), item.getDaysSinceLastMovement(), MoneyUtils.formatInr(item.getStockValue())));
            }

            sb.append(String.format("\n💡 **Liquidation Strategy:** Run a 10%% promotional markdown or bundle these items with fast-moving staples to recover **~%s** in liquid cash immediately.", MoneyUtils.formatInr(totalLocked.multiply(new BigDecimal("0.9")))));
            return sb.toString();
        }

        // F. Break-Even Sales Target
        if (q.contains("break") || q.contains("breakeven") || q.contains("target") || q.contains("rent")) {
            BigDecimal fixed = dash.getMonthToDateExpenses().compareTo(BigDecimal.ZERO) > 0 ? dash.getMonthToDateExpenses() : new BigDecimal("45000.00");
            BigDecimal avgPrice = new BigDecimal("200.00");
            BigDecimal avgVarCost = new BigDecimal("150.00");

            BreakEvenCalculationRequest bReq = new BreakEvenCalculationRequest();
            bReq.setMonthlyFixedCosts(fixed);
            bReq.setSellingPricePerUnit(avgPrice);
            bReq.setVariableCostPerUnit(avgVarCost);
            BreakEvenCalculationResponse bRes = breakEvenService.calculateBreakEven(bReq);

            return String.format(
                    "⚖️ **Break-Even Analysis for %s:**\n\n" +
                    "- **Monthly Fixed Overhead Load:** **%s** (Rent, staff wages, electricity)\n" +
                    "- **Monthly Break-Even Sales Target:** **%s**\n" +
                    "- **Daily Counter Revenue Target:** **~%s/day**\n" +
                    "- **Break-Even Quantity:** **%s units**\n\n" +
                    "**What this means:** You must ring up at least **%s** in revenue each month just to pay the landlord, electricity board, and helpers. Every rupee generated beyond this threshold is pure profit.",
                    dash.getBusinessName(),
                    MoneyUtils.formatInr(fixed),
                    MoneyUtils.formatInr(bRes.getBreakevenRevenue()),
                    MoneyUtils.formatInr(bRes.getDailyBreakevenRevenue()),
                    bRes.getBreakevenQuantity(),
                    MoneyUtils.formatInr(bRes.getBreakevenRevenue())
            );
        }

        // G. Default 360-degree Retail Health Snapshot
        return String.format(
                "🤖 **MarginOS Financial Advisor Report for %s:**\n\n" +
                "Here is your real-time operational scorecard:\n" +
                "- 📈 **Sales (Month-to-Date):** %s\n" +
                "- 📊 **Gross Profit Margin:** **%s%%** (Estimated Net Profit: %s)\n" +
                "- 💵 **Liquid Cash in Hand:** %s (Bank: %s)\n" +
                "- 👥 **Customer Khata Balance:** %s (High Risk >60d: %s)\n" +
                "- 🏭 **Supplier Dues:** %s\n" +
                "- 📦 **WAVG Inventory Valuation:** %s (%d low stock items)\n\n" +
                "**Ask me any strategic question:**\n" +
                "• *'Why is my cash lower than profit?'*\n" +
                "• *'Can I afford to hire staff at ₹15,000/month?'*\n" +
                "• *'What should I charge for 22%% margin on ₹85 cost?'*\n" +
                "• *'Can I afford a ₹5,00,000 loan at 12%%?'*",
                dash.getBusinessName(),
                MoneyUtils.formatInr(dash.getMonthToDateSales()),
                dash.getMonthToDateGrossMarginPercent(),
                MoneyUtils.formatInr(dash.getMonthToDateNetProfit()),
                MoneyUtils.formatInr(dash.getCashInHand()),
                MoneyUtils.formatInr(dash.getBankBalance()),
                MoneyUtils.formatInr(rec.getTotal()),
                MoneyUtils.formatInr(rec.getSixtyPlus()),
                MoneyUtils.formatInr(pay.getTotal()),
                MoneyUtils.formatInr(inv.getTotalStockValue()),
                inv.getLowStockCount()
        );
    }

    private String callGeminiApi(
            String apiKey,
            String model,
            BusinessDashboardSummary dash,
            InventoryValuationResponse inv,
            AgingReport rec,
            AgingReport pay,
            ProfitLossReport pnl,
            List<SlowMovingItem> slowMoving,
            String userPrompt) throws Exception {

        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey);

        String context = String.format(
                "AUTHORITATIVE STORE LEDGER DATA FOR %s:\n" +
                "- MTD Sales: ₹%s\n" +
                "- MTD Gross Profit: ₹%s (Margin: %s%%)\n" +
                "- MTD Expenses: ₹%s\n" +
                "- MTD Net Profit: ₹%s\n" +
                "- Cash in Hand: ₹%s\n" +
                "- Bank Balance: ₹%s\n" +
                "- Customer Receivables: ₹%s (High Risk >60d: ₹%s)\n" +
                "- Supplier Payables: ₹%s\n" +
                "- Total Inventory Valuation: ₹%s across %d SKUs\n" +
                "- Low Stock SKUs: %d\n" +
                "- Slow Moving SKUs: %d items\n",
                dash.getBusinessName(),
                dash.getMonthToDateSales(),
                dash.getMonthToDateGrossProfit(),
                dash.getMonthToDateGrossMarginPercent(),
                dash.getMonthToDateExpenses(),
                dash.getMonthToDateNetProfit(),
                dash.getCashInHand(),
                dash.getBankBalance(),
                rec.getTotal(),
                rec.getSixtyPlus(),
                pay.getTotal(),
                inv.getTotalStockValue(),
                inv.getTotalSkus(),
                inv.getLowStockCount(),
                slowMoving.size()
        );

        String systemPrompt = "You are MarginOS AI, an elite Chief Financial Officer, Chartered Accountant, and Harvard/Wharton/IIM MBA Retail Turnaround Strategist advising Indian shopkeepers, distributors, and retailers.\n\n" +
                "YOUR CORE METHODOLOGY IS GROUNDED IN TOP MBA FRAMEWORKS:\n" +
                "1. DuPont Analysis for Retail: Return on Capital = Net Profit Margin × Asset Turnover × Financial Leverage.\n" +
                "2. Cost-Volume-Profit (CVP) & Contribution Margin: Break-even point, operating leverage, and margin of safety.\n" +
                "3. Working Capital & Cash Conversion Cycle (CCC): Days Sales Outstanding (DSO) + Days Inventory Outstanding (DIO) - Days Payables Outstanding (DPO).\n" +
                "4. Pareto 80/20 & ABC Inventory Classification: Class A (top 70% revenue), Class B (20%), Class C (tail 10%). Liquidate slow stock to fund high-velocity SKUs.\n" +
                "5. Pricing Discipline & Retail Elasticity: Markup vs Margin distinction, stop informal rounding discounts, counter impulse cross-selling (35% margin impulse items alongside 8% margin staples).\n\n" +
                "CRITICAL INSTRUCTIONS:\n" +
                "- Ground EVERY claim strictly in the store's authoritative numbers provided. Never hallucinate numbers.\n" +
                "- Use bold Indian Rupee figures (₹) and Indian number grouping (thousands/lakhs).\n" +
                "- Answer the user's question directly with empathy, business acumen, and clarity.\n" +
                "- Structure answers into 4 clear sections:\n" +
                "  1. 📊 Executive Diagnosis (Current numbers from ledger)\n" +
                "  2. 🎓 Strategic MBA Framework (DuPont, CCC, CVP, or Pricing Elasticity explained in simple retail terms)\n" +
                "  3. 🚀 Practical Step-by-Step Action Plan (Exact ₹ recovery targets, reorders, or discount clearances)\n" +
                "  4. 📈 Projected Financial Outcome (Impact on Net Profit and Free Cash Flow).";

        String payload = String.format("""
                {
                  "contents": [
                    {
                      "role": "user",
                      "parts": [
                        {
                          "text": "%s\\n\\nUser Question: %s"
                        }
                      ]
                    }
                  ],
                  "systemInstruction": {
                    "parts": [
                      {
                        "text": "%s"
                      }
                    ]
                  },
                  "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 1000
                  }
                }
                """, escapeJson(context), escapeJson(userPrompt), escapeJson(systemPrompt));

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        }
        return null;
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    private BigDecimal extractNumber(String text, BigDecimal defaultVal) {
        Pattern pattern = Pattern.compile("(?i)(?:₹|rs\\.?|rupees)?\\s*([0-9]+(?:,[0-9]+)*(?:\\.[0-9]+)?)");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String val = matcher.group(1).replace(",", "");
            try {
                return new BigDecimal(val);
            } catch (Exception ignored) {}
        }
        return defaultVal;
    }

    private BigDecimal extractCost(String text, BigDecimal defaultVal) {
        Pattern pattern = Pattern.compile("(?i)(?:cost|buying|purchas(?:e|ing))\\s*(?:of|is|at|for|basis)?\\s*(?:₹|rs\\.?)?\\s*([0-9]+(?:\\.[0-9]+)?)");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            try {
                return new BigDecimal(matcher.group(1));
            } catch (Exception ignored) {}
        }
        return extractNumber(text, defaultVal);
    }

    private BigDecimal extractMargin(String text, BigDecimal defaultVal) {
        Pattern pattern = Pattern.compile("(?i)([0-9]+(?:\\.[0-9]+)?)\\s*%");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            try {
                return new BigDecimal(matcher.group(1));
            } catch (Exception ignored) {}
        }
        return defaultVal;
    }
}
