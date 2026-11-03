package com.marginos.sales.service;

import com.marginos.accounting.dto.AccountingDto.*;
import com.marginos.accounting.model.Account;
import com.marginos.accounting.model.SourceType;
import com.marginos.accounting.repository.AccountRepository;
import com.marginos.accounting.service.AccountingService;
import com.marginos.auth.model.User;
import com.marginos.auth.repository.UserRepository;
import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.customer.model.Customer;
import com.marginos.customer.repository.CustomerRepository;
import com.marginos.inventory.model.MovementType;
import com.marginos.inventory.service.InventoryService;
import com.marginos.product.model.Product;
import com.marginos.product.repository.ProductRepository;
import com.marginos.sales.dto.SalesDto.*;
import com.marginos.sales.model.SalesInvoice;
import com.marginos.sales.model.SalesInvoiceLine;
import com.marginos.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesService {

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final AccountingService accountingService;
    private final AccountRepository accountRepository;

    @Transactional
    public SalesInvoiceResponse createInvoice(UUID businessId, UUID userId, CreateSalesInvoiceRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        Customer customer = null;
        if (req.getCustomerId() != null) {
            customer = customerRepository.findById(req.getCustomerId()).orElse(null);
        }

        long count = salesInvoiceRepository.countByBusinessId(businessId) + 1;
        String invoiceNumber = String.format("INV-%s-%04d",
                req.getInvoiceDate().format(DateTimeFormatter.ofPattern("yyyyMM")), count);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;
        BigDecimal discountTotal = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal totalCogs = BigDecimal.ZERO;

        List<SalesInvoiceLine> lines = new ArrayList<>();

        for (SalesLineRequest lineReq : req.getLines()) {
            BigDecimal qty = lineReq.getQuantity().abs();
            BigDecimal unitPrice = lineReq.getUnitPrice();
            BigDecimal lineBase = qty.multiply(unitPrice);

            BigDecimal lineDiscount = BigDecimal.ZERO;
            if (lineReq.getDiscountPercent() != null && lineReq.getDiscountPercent().compareTo(BigDecimal.ZERO) > 0) {
                lineDiscount = lineBase.multiply(lineReq.getDiscountPercent())
                        .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            }

            BigDecimal taxableAmount = lineBase.subtract(lineDiscount);
            BigDecimal lineTax = BigDecimal.ZERO;
            if (lineReq.getTaxRate() != null && lineReq.getTaxRate().compareTo(BigDecimal.ZERO) > 0) {
                lineTax = taxableAmount.multiply(lineReq.getTaxRate())
                        .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            }

            BigDecimal lineTotal = taxableAmount.add(lineTax);

            subtotal = subtotal.add(lineBase);
            taxTotal = taxTotal.add(lineTax);

            Product product = null;
            BigDecimal costPrice = BigDecimal.ZERO;
            if (lineReq.getProductId() != null) {
                product = productRepository.findById(lineReq.getProductId()).orElse(null);
                if (product != null) {
                    costPrice = product.getWeightedAverageCost() != null
                            ? product.getWeightedAverageCost() : product.getPurchasePrice();
                    totalCogs = totalCogs.add(qty.multiply(costPrice));

                    // Deduct stock via inventory movement
                    inventoryService.recordMovement(
                            businessId,
                            product.getId(),
                            MovementType.SALE,
                            qty,
                            costPrice,
                            "SALES_INVOICE",
                            null,
                            "Invoice " + invoiceNumber,
                            req.getInvoiceDate()
                    );
                }
            }

            SalesInvoiceLine line = SalesInvoiceLine.builder()
                    .product(product)
                    .productName(lineReq.getProductName())
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .costPrice(costPrice)
                    .discountPercent(lineReq.getDiscountPercent() != null ? lineReq.getDiscountPercent() : BigDecimal.ZERO)
                    .discountAmount(lineDiscount)
                    .taxRate(lineReq.getTaxRate() != null ? lineReq.getTaxRate() : BigDecimal.ZERO)
                    .taxAmount(lineTax)
                    .totalAmount(lineTotal)
                    .build();
            lines.add(line);
        }

        BigDecimal finalTotal = subtotal.subtract(discountTotal).add(taxTotal);
        BigDecimal paidAmount = req.getPaidAmount() != null ? req.getPaidAmount() : finalTotal;
        BigDecimal balanceAmount = finalTotal.subtract(paidAmount).max(BigDecimal.ZERO);

        String paymentMode = req.getPaymentMode() != null ? req.getPaymentMode().toUpperCase() : "CASH";
        String status = balanceAmount.compareTo(BigDecimal.ZERO) == 0 ? "PAID"
                : (paidAmount.compareTo(BigDecimal.ZERO) > 0 ? "PARTIALLY_PAID" : "ISSUED");

        SalesInvoice invoice = SalesInvoice.builder()
                .business(business)
                .invoiceNumber(invoiceNumber)
                .invoiceDate(req.getInvoiceDate())
                .dueDate(req.getDueDate())
                .customer(customer)
                .customerName(req.getCustomerName())
                .customerPhone(req.getCustomerPhone())
                .subtotal(subtotal)
                .discountAmount(discountTotal)
                .taxAmount(taxTotal)
                .totalAmount(finalTotal)
                .paidAmount(paidAmount)
                .balanceAmount(balanceAmount)
                .paymentMode(paymentMode)
                .status(status)
                .notes(req.getNotes())
                .createdBy(user)
                .build();

        for (SalesInvoiceLine l : lines) {
            invoice.addLine(l);
        }

        // If customer exists and balance > 0, update customer khata balance
        if (customer != null && balanceAmount.compareTo(BigDecimal.ZERO) > 0) {
            customer.setCurrentBalance(customer.getCurrentBalance().add(balanceAmount));
            customerRepository.save(customer);
        }

        // Post underlying balanced Journal Entry
        try {
            UUID debitAccountId;
            if ("CREDIT".equalsIgnoreCase(paymentMode)) {
                debitAccountId = getAccountIdBySubCategory(businessId, "RECEIVABLES", "1100");
            } else if ("BANK_TRANSFER".equalsIgnoreCase(paymentMode) || "CARD".equalsIgnoreCase(paymentMode)) {
                debitAccountId = getAccountIdBySubCategory(businessId, "BANK", "1010");
            } else {
                debitAccountId = getAccountIdBySubCategory(businessId, "CASH", "1000");
            }

            UUID salesRevenueAccountId = getAccountIdBySubCategory(businessId, "SALES_REVENUE", "4000");

            List<JournalLineRequest> jLines = new ArrayList<>();
            // Debit Cash/Bank/Receivables
            jLines.add(new JournalLineRequest(debitAccountId, finalTotal, BigDecimal.ZERO, "Sale " + invoiceNumber));
            // Credit Sales Revenue
            jLines.add(new JournalLineRequest(salesRevenueAccountId, BigDecimal.ZERO, finalTotal, "Sale " + invoiceNumber));

            CreateJournalEntryRequest jReq = new CreateJournalEntryRequest(
                    req.getInvoiceDate(),
                    invoiceNumber,
                    "Sales Invoice: " + req.getCustomerName() + " (" + invoiceNumber + ")",
                    SourceType.SALE,
                    jLines
            );

            JournalEntryDto jEntry = accountingService.postJournalEntry(businessId, userId, jReq);
            // Link journal entry id
            invoice.setJournalEntry(null); // will be linked or referenced
        } catch (Exception e) {
            log.warn("Automatic journal posting for invoice {} encountered: {}", invoiceNumber, e.getMessage());
        }

        SalesInvoice saved = salesInvoiceRepository.save(invoice);
        return toInvoiceResponse(saved);
    }

    @Transactional
    public SalesInvoiceResponse createQuickSale(UUID businessId, UUID userId, QuickSaleRequest req) {
        CreateSalesInvoiceRequest invReq = new CreateSalesInvoiceRequest();
        invReq.setInvoiceDate(LocalDate.now());
        invReq.setCustomerName("Walk-in Customer");
        invReq.setPaymentMode(req.getPaymentMode());
        invReq.setPaidAmount(req.getAmount());

        SalesLineRequest line = new SalesLineRequest();
        line.setProductName(req.getDescription());
        line.setQuantity(BigDecimal.ONE);
        line.setUnitPrice(req.getAmount());
        invReq.setLines(List.of(line));

        return createInvoice(businessId, userId, invReq);
    }

    @Transactional(readOnly = true)
    public Page<SalesInvoiceResponse> getInvoices(UUID businessId, Pageable pageable) {
        return salesInvoiceRepository.findByBusinessIdOrderByInvoiceDateDescCreatedAtDesc(businessId, pageable)
                .map(this::toInvoiceResponse);
    }

    @Transactional(readOnly = true)
    public SalesInvoiceResponse getInvoiceById(UUID businessId, UUID invoiceId) {
        SalesInvoice inv = salesInvoiceRepository.findById(invoiceId)
                .filter(i -> i.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        return toInvoiceResponse(inv);
    }

    private UUID getAccountIdBySubCategory(UUID businessId, String subCategory, String fallbackCode) {
        return accountRepository.findByBusinessIdAndSubCategory(businessId, subCategory)
                .map(Account::getId)
                .orElseGet(() -> accountRepository.findByBusinessIdAndCode(businessId, fallbackCode)
                        .map(Account::getId)
                        .orElseThrow(() -> new IllegalStateException("Required system account not found: " + fallbackCode)));
    }

    private SalesInvoiceResponse toInvoiceResponse(SalesInvoice inv) {
        List<SalesLineResponse> lineResponses = inv.getLines().stream()
                .map(l -> SalesLineResponse.builder()
                        .id(l.getId())
                        .productId(l.getProduct() != null ? l.getProduct().getId() : null)
                        .productName(l.getProductName())
                        .quantity(l.getQuantity())
                        .unitPrice(l.getUnitPrice())
                        .costPrice(l.getCostPrice())
                        .discountAmount(l.getDiscountAmount())
                        .taxAmount(l.getTaxAmount())
                        .totalAmount(l.getTotalAmount())
                        .build())
                .collect(Collectors.toList());

        return SalesInvoiceResponse.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .invoiceDate(inv.getInvoiceDate())
                .dueDate(inv.getDueDate())
                .customerId(inv.getCustomer() != null ? inv.getCustomer().getId() : null)
                .customerName(inv.getCustomerName())
                .customerPhone(inv.getCustomerPhone())
                .subtotal(inv.getSubtotal())
                .discountAmount(inv.getDiscountAmount())
                .taxAmount(inv.getTaxAmount())
                .totalAmount(inv.getTotalAmount())
                .paidAmount(inv.getPaidAmount())
                .balanceAmount(inv.getBalanceAmount())
                .paymentMode(inv.getPaymentMode())
                .status(inv.getStatus())
                .notes(inv.getNotes())
                .lines(lineResponses)
                .build();
    }
}
