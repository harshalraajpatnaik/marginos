package com.marginos.csv.service;

import com.marginos.accounting.dto.AccountingDto.*;
import com.marginos.accounting.service.AccountingService;
import com.marginos.cashbook.model.CashbookEntry;
import com.marginos.cashbook.repository.CashbookEntryRepository;
import com.marginos.expense.model.Expense;
import com.marginos.expense.repository.ExpenseRepository;
import com.marginos.product.dto.ProductDto.CreateProductRequest;
import com.marginos.product.model.Product;
import com.marginos.product.repository.ProductRepository;
import com.marginos.product.service.ProductService;
import com.marginos.purchase.model.PurchaseInvoice;
import com.marginos.purchase.repository.PurchaseInvoiceRepository;
import com.marginos.sales.model.SalesInvoice;
import com.marginos.sales.repository.SalesInvoiceRepository;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CsvService {

    private final ProductRepository productRepository;
    private final ProductService productService;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final CashbookEntryRepository cashbookEntryRepository;
    private final AccountingService accountingService;

    /**
     * Sanitizes a cell to prevent CSV Formula Injection in Excel/Google Sheets
     * Characters like '=', '+', '-', '@', '\t', '\r' are prefixed with a single quote.
     */
    public static String sanitizeCell(Object val) {
        if (val == null) return "";
        String s = val.toString();
        if (s.isEmpty()) return "";
        char first = s.charAt(0);
        if (first == '=' || first == '+' || first == '-' || first == '@' || first == '\t' || first == '\r') {
            return "'" + s;
        }
        return s;
    }

    @Transactional(readOnly = true)
    public String exportProducts(UUID businessId) {
        List<Product> products = productRepository.findByBusinessIdAndActiveTrueOrderByNameAsc(businessId);
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[]{"SKU", "Barcode", "Product Name", "Unit", "Purchase Cost", "Selling Price", "MRP", "Tax Rate %", "Current Stock", "WAVG Cost"});
            for (Product p : products) {
                writer.writeNext(new String[]{
                        sanitizeCell(p.getSku()),
                        sanitizeCell(p.getBarcode()),
                        sanitizeCell(p.getName()),
                        sanitizeCell(p.getUnit()),
                        sanitizeCell(p.getPurchasePrice()),
                        sanitizeCell(p.getSellingPrice()),
                        sanitizeCell(p.getMrp()),
                        sanitizeCell(p.getTaxRate()),
                        sanitizeCell(p.getCurrentStock()),
                        sanitizeCell(p.getWeightedAverageCost())
                });
            }
        } catch (Exception e) {
            log.error("CSV generation failed", e);
        }
        return sw.toString();
    }

    @Transactional(readOnly = true)
    public String exportSales(UUID businessId) {
        List<SalesInvoice> sales = salesInvoiceRepository.findByBusinessIdOrderByInvoiceDateDescCreatedAtDesc(businessId, Pageable.unpaged()).getContent();
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[]{"Invoice Number", "Date", "Customer Name", "Payment Mode", "Subtotal", "Tax Amount", "Total Amount", "Paid Amount", "Balance Due", "Status"});
            for (SalesInvoice s : sales) {
                writer.writeNext(new String[]{
                        sanitizeCell(s.getInvoiceNumber()),
                        sanitizeCell(s.getInvoiceDate()),
                        sanitizeCell(s.getCustomerName()),
                        sanitizeCell(s.getPaymentMode()),
                        sanitizeCell(s.getSubtotal()),
                        sanitizeCell(s.getTaxAmount()),
                        sanitizeCell(s.getTotalAmount()),
                        sanitizeCell(s.getPaidAmount()),
                        sanitizeCell(s.getBalanceAmount()),
                        sanitizeCell(s.getStatus())
                });
            }
        } catch (Exception e) {
            log.error("CSV generation failed", e);
        }
        return sw.toString();
    }

    @Transactional(readOnly = true)
    public String exportExpenses(UUID businessId) {
        List<Expense> expenses = expenseRepository.findByBusinessIdOrderByExpenseDateDescCreatedAtDesc(businessId, Pageable.unpaged()).getContent();
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[]{"Date", "Category", "Description", "Amount", "Payment Mode", "Vendor Name", "Is Recurring"});
            for (Expense e : expenses) {
                writer.writeNext(new String[]{
                        sanitizeCell(e.getExpenseDate()),
                        sanitizeCell(e.getCategory()),
                        sanitizeCell(e.getDescription()),
                        sanitizeCell(e.getAmount()),
                        sanitizeCell(e.getPaymentMode()),
                        sanitizeCell(e.getVendorName()),
                        sanitizeCell(e.isRecurring())
                });
            }
        } catch (Exception e) {
            log.error("CSV generation failed", e);
        }
        return sw.toString();
    }

    @Transactional(readOnly = true)
    public String exportCashbook(UUID businessId) {
        List<CashbookEntry> list = cashbookEntryRepository.findByBusinessIdOrderByEntryDateDesc(businessId, Pageable.unpaged()).getContent();
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[]{"Date", "Opening Cash", "Cash Sales", "Digital Sales", "Credit Sales", "Cash Purchases", "Operating Expenses", "Collections", "Supplier Payments", "Closing Cash", "Variance", "Est Net Profit"});
            for (CashbookEntry c : list) {
                writer.writeNext(new String[]{
                        sanitizeCell(c.getEntryDate()),
                        sanitizeCell(c.getOpeningCash()),
                        sanitizeCell(c.getCashSales()),
                        sanitizeCell(c.getDigitalSales()),
                        sanitizeCell(c.getCreditSales()),
                        sanitizeCell(c.getCashPurchases()),
                        sanitizeCell(c.getOperatingExpenses()),
                        sanitizeCell(c.getCustomerCollections()),
                        sanitizeCell(c.getSupplierPayments()),
                        sanitizeCell(c.getCalculatedClosingCash()),
                        sanitizeCell(c.getCashVariance()),
                        sanitizeCell(c.getEstimatedNetProfit())
                });
            }
        } catch (Exception e) {
            log.error("CSV generation failed", e);
        }
        return sw.toString();
    }

    @Transactional(readOnly = true)
    public String exportTrialBalance(UUID businessId) {
        TrialBalanceReport tb = accountingService.getTrialBalance(businessId, LocalDate.now());
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[]{"Account Code", "Account Name", "Account Type", "Debit Amount (INR)", "Credit Amount (INR)"});
            for (TrialBalanceItem item : tb.getItems()) {
                writer.writeNext(new String[]{
                        sanitizeCell(item.getAccountCode()),
                        sanitizeCell(item.getAccountName()),
                        sanitizeCell(item.getAccountType()),
                        sanitizeCell(item.getDebitBalance()),
                        sanitizeCell(item.getCreditBalance())
                });
            }
            writer.writeNext(new String[]{"TOTAL", "", "", sanitizeCell(tb.getTotalDebit()), sanitizeCell(tb.getTotalCredit())});
        } catch (Exception e) {
            log.error("CSV generation failed", e);
        }
        return sw.toString();
    }

    @Transactional
    public int importProducts(UUID businessId, MultipartFile file) {
        int importedCount = 0;
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            boolean isHeader = true;
            while ((line = reader.readNext()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                if (line.length < 3) continue;

                String name = line[0].trim();
                if (name.isEmpty()) continue;

                BigDecimal purchase = line.length > 1 && !line[1].isBlank() ? new BigDecimal(line[1].trim()) : BigDecimal.ZERO;
                BigDecimal selling = line.length > 2 && !line[2].isBlank() ? new BigDecimal(line[2].trim()) : purchase.multiply(new BigDecimal("1.2"));
                BigDecimal stock = line.length > 3 && !line[3].isBlank() ? new BigDecimal(line[3].trim()) : BigDecimal.ZERO;

                CreateProductRequest req = new CreateProductRequest();
                req.setName(name);
                req.setPurchasePrice(purchase);
                req.setSellingPrice(selling);
                req.setInitialStock(stock);

                productService.createProduct(businessId, req);
                importedCount++;
            }
        } catch (Exception e) {
            log.error("Failed to parse CSV upload", e);
            throw new IllegalArgumentException("Failed to parse CSV file: " + e.getMessage());
        }
        return importedCount;
    }
}
