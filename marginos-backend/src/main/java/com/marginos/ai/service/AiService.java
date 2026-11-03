package com.marginos.ai.service;

import com.marginos.accounting.dto.AccountingDto.ProfitLossReport;
import com.marginos.accounting.service.AccountingService;
import com.marginos.ai.dto.AiDto.*;
import com.marginos.cashbook.dto.CashbookDto.CashSummaryResponse;
import com.marginos.cashbook.service.CashbookService;
import com.marginos.common.MoneyUtils;
import com.marginos.dashboard.dto.DashboardDto.BusinessDashboardSummary;
import com.marginos.dashboard.service.DashboardService;
import com.marginos.inventory.dto.InventoryDto.InventoryValuationResponse;
import com.marginos.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final DashboardService dashboardService;
    private final AccountingService accountingService;
    private final CashbookService cashbookService;
    private final InventoryService inventoryService;

    @Value("${app.ai.enabled:false}")
    private boolean aiEnabled;

    @Value("${app.ai.provider:lm-studio}")
    private String aiProvider;

    public AskAiResponse askAssistant(UUID businessId, AskAiRequest req) {
        // Collect authoritative deterministic facts from backend services
        BusinessDashboardSummary dash = dashboardService.getDashboardSummary(businessId);
        CashSummaryResponse cash = cashbookService.getSummary(businessId);
        InventoryValuationResponse inv = inventoryService.getInventoryValuation(businessId);
        ProfitLossReport pnl = accountingService.getProfitLoss(businessId, LocalDate.now().minusDays(30), LocalDate.now());

        List<String> metrics = new ArrayList<>();
        metrics.add("Cash in Hand: " + MoneyUtils.formatInr(dash.getCashInHand()));
        metrics.add("Month-to-Date Sales: " + MoneyUtils.formatInr(dash.getMonthToDateSales()));
        metrics.add("Gross Margin: " + dash.getMonthToDateGrossMarginPercent() + "%");
        metrics.add("Customer Khata Due: " + MoneyUtils.formatInr(dash.getPendingReceivables()));
        metrics.add("Supplier Bills Due: " + MoneyUtils.formatInr(dash.getPendingPayables()));
        metrics.add("Low Stock SKUs: " + inv.getLowStockCount());

        List<String> actions = new ArrayList<>();
        if (inv.getLowStockCount() > 0) {
            actions.add(String.format("Reorder %d critical items before you run out of stock.", inv.getLowStockCount()));
        }
        if (dash.getPendingReceivables().compareTo(new BigDecimal("10000.00")) > 0) {
            actions.add(String.format("Send payment reminders to customers for %s in outstanding credit.", MoneyUtils.formatInr(dash.getPendingReceivables())));
        }
        if (dash.getMonthToDateGrossMarginPercent().compareTo(new BigDecimal("15.00")) < 0) {
            actions.add("Gross margin is below 15%. Review supplier purchase prices or reduce counter discounts.");
        }

        // Deterministic financial explanation
        String q = req.getQuestion().toLowerCase();
        StringBuilder answer = new StringBuilder();

        if (q.contains("margin") || q.contains("profit")) {
            answer.append(String.format(
                    "📊 **Profitability Analysis for %s:**\n" +
                    "- **Month-to-Date Sales:** %s\n" +
                    "- **Gross Profit:** %s (Gross Margin: **%s%%**)\n" +
                    "- **Operating Expenses:** %s\n" +
                    "- **Estimated Net Profit:** %s\n\n" +
                    "**Guidance:** In Indian retail/kirana, a healthy gross margin is typically 18%% - 22%%. " +
                    "Ensure high-margin staples (pulses, packaged goods) offset lower-margin staples (sugar, wheat).",
                    dash.getBusinessName(),
                    MoneyUtils.formatInr(dash.getMonthToDateSales()),
                    MoneyUtils.formatInr(dash.getMonthToDateGrossProfit()),
                    dash.getMonthToDateGrossMarginPercent(),
                    MoneyUtils.formatInr(dash.getMonthToDateExpenses()),
                    MoneyUtils.formatInr(dash.getMonthToDateNetProfit())
            ));
        } else if (q.contains("cash") || q.contains("liquidity")) {
            answer.append(String.format(
                    "💵 **Cash Position Summary:**\n" +
                    "- **Physical Cash in Hand:** %s\n" +
                    "- **Bank Account Balance:** %s\n" +
                    "- **Total Cash Available:** %s\n" +
                    "- **Upcoming Supplier Payables:** %s\n\n" +
                    "**Liquidity Assessment:** %s",
                    MoneyUtils.formatInr(dash.getCashInHand()),
                    MoneyUtils.formatInr(dash.getBankBalance()),
                    MoneyUtils.formatInr(dash.getTotalCashAvailable()),
                    MoneyUtils.formatInr(dash.getPendingPayables()),
                    dash.getTotalCashAvailable().compareTo(dash.getPendingPayables()) >= 0
                            ? "Your available cash comfortably covers current supplier dues."
                            : "⚠️ Caution: Supplier dues exceed current liquid cash. Expedite customer khata collections."
            ));
        } else if (q.contains("inventory") || q.contains("stock")) {
            answer.append(String.format(
                    "📦 **Inventory Diagnostic:**\n" +
                    "- **Total SKUs Tracked:** %d\n" +
                    "- **Total Inventory Valuation (WAVG):** %s\n" +
                    "- **Low Stock SKUs:** %d needing immediate reorder\n\n" +
                    "**Next Step:** Run ABC Analysis from the Inventory menu to identify which 20%% of products generate 70%% of your sales.",
                    inv.getTotalSkus(),
                    MoneyUtils.formatInr(inv.getTotalStockValue()),
                    inv.getLowStockCount()
            ));
        } else {
            answer.append(String.format(
                    "🤖 **MarginOS Financial Assistant for %s:**\n\n" +
                    "Here is your current operational snapshot:\n" +
                    "- **Today's Sales:** %s\n" +
                    "- **Cash Available:** %s\n" +
                    "- **Customer Credit Outstanding:** %s\n" +
                    "- **Net Profit MTD:** %s\n\n" +
                    "Ask me specific questions such as: *'How can I improve my margin?'*, *'Can I afford a loan?'*, or *'What is my break-even target?'*",
                    dash.getBusinessName(),
                    MoneyUtils.formatInr(dash.getTodaySales()),
                    MoneyUtils.formatInr(dash.getTotalCashAvailable()),
                    MoneyUtils.formatInr(dash.getPendingReceivables()),
                    MoneyUtils.formatInr(dash.getMonthToDateNetProfit())
            ));
        }

        return AskAiResponse.builder()
                .answer(answer.toString())
                .provider("DETERMINISTIC_FINANCIAL_ADVISOR")
                .isAiEnabled(aiEnabled)
                .investigatedMetrics(metrics)
                .recommendedActions(actions)
                .build();
    }
}
