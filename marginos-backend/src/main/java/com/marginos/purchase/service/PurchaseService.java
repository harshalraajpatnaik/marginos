package com.marginos.purchase.service;

import com.marginos.accounting.dto.AccountingDto.*;
import com.marginos.accounting.model.Account;
import com.marginos.accounting.model.SourceType;
import com.marginos.accounting.repository.AccountRepository;
import com.marginos.accounting.service.AccountingService;
import com.marginos.auth.model.User;
import com.marginos.auth.repository.UserRepository;
import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.inventory.model.MovementType;
import com.marginos.inventory.service.InventoryService;
import com.marginos.product.model.Product;
import com.marginos.product.repository.ProductRepository;
import com.marginos.purchase.dto.PurchaseDto.*;
import com.marginos.purchase.model.PurchaseInvoice;
import com.marginos.purchase.model.PurchaseInvoiceLine;
import com.marginos.purchase.repository.PurchaseInvoiceRepository;
import com.marginos.supplier.model.Supplier;
import com.marginos.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseInvoiceRepository purchaseRepository;
    private final BusinessRepository businessRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final AccountingService accountingService;
    private final AccountRepository accountRepository;

    @Transactional
    public PurchaseInvoiceResponse createPurchase(UUID businessId, UUID userId, CreatePurchaseRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        Supplier supplier = null;
        if (req.getSupplierId() != null) {
            supplier = supplierRepository.findById(req.getSupplierId()).orElse(null);
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;
        BigDecimal discountTotal = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;

        List<PurchaseInvoiceLine> lines = new ArrayList<>();

        for (PurchaseLineRequest lineReq : req.getLines()) {
            BigDecimal qty = lineReq.getQuantity().abs();
            BigDecimal unitCost = lineReq.getUnitCost();
            BigDecimal lineBase = qty.multiply(unitCost);

            BigDecimal lineTax = BigDecimal.ZERO;
            if (lineReq.getTaxRate() != null && lineReq.getTaxRate().compareTo(BigDecimal.ZERO) > 0) {
                lineTax = lineBase.multiply(lineReq.getTaxRate())
                        .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            }

            BigDecimal lineTotal = lineBase.add(lineTax);

            subtotal = subtotal.add(lineBase);
            taxTotal = taxTotal.add(lineTax);

            Product product = null;
            if (lineReq.getProductId() != null) {
                product = productRepository.findById(lineReq.getProductId()).orElse(null);
                if (product != null) {
                    // Update inventory with Weighted-Average Cost calculation
                    inventoryService.recordMovement(
                            businessId,
                            product.getId(),
                            MovementType.PURCHASE,
                            qty,
                            unitCost,
                            "PURCHASE_BILL",
                            null,
                            "Bill " + req.getBillNumber(),
                            req.getBillDate()
                    );
                }
            }

            PurchaseInvoiceLine line = PurchaseInvoiceLine.builder()
                    .product(product)
                    .productName(lineReq.getProductName())
                    .quantity(qty)
                    .unitCost(unitCost)
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
                : (paidAmount.compareTo(BigDecimal.ZERO) > 0 ? "PARTIALLY_PAID" : "RECEIVED");

        PurchaseInvoice purchase = PurchaseInvoice.builder()
                .business(business)
                .billNumber(req.getBillNumber())
                .billDate(req.getBillDate())
                .dueDate(req.getDueDate())
                .supplier(supplier)
                .supplierName(req.getSupplierName())
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

        for (PurchaseInvoiceLine l : lines) {
            purchase.addLine(l);
        }

        // If supplier exists and balance > 0, update supplier payables balance
        if (supplier != null && balanceAmount.compareTo(BigDecimal.ZERO) > 0) {
            supplier.setCurrentBalance(supplier.getCurrentBalance().add(balanceAmount));
            supplierRepository.save(supplier);
        }

        // Post underlying balanced Journal Entry
        try {
            UUID inventoryAccountId = getAccountIdBySubCategory(businessId, "INVENTORY", "1200");
            UUID creditAccountId;
            if ("CREDIT".equalsIgnoreCase(paymentMode)) {
                creditAccountId = getAccountIdBySubCategory(businessId, "PAYABLES", "2000");
            } else if ("BANK_TRANSFER".equalsIgnoreCase(paymentMode)) {
                creditAccountId = getAccountIdBySubCategory(businessId, "BANK", "1010");
            } else {
                creditAccountId = getAccountIdBySubCategory(businessId, "CASH", "1000");
            }

            List<JournalLineRequest> jLines = new ArrayList<>();
            // Debit Inventory Asset
            jLines.add(new JournalLineRequest(inventoryAccountId, finalTotal, BigDecimal.ZERO, "Bill " + req.getBillNumber()));
            // Credit Cash / Bank / Payables
            jLines.add(new JournalLineRequest(creditAccountId, BigDecimal.ZERO, finalTotal, "Bill " + req.getBillNumber()));

            CreateJournalEntryRequest jReq = new CreateJournalEntryRequest(
                    req.getBillDate(),
                    req.getBillNumber(),
                    "Purchase Bill: " + req.getSupplierName() + " (" + req.getBillNumber() + ")",
                    SourceType.PURCHASE,
                    jLines
            );

            accountingService.postJournalEntry(businessId, userId, jReq);
        } catch (Exception e) {
            log.warn("Automatic journal posting for purchase {} encountered: {}", req.getBillNumber(), e.getMessage());
        }

        PurchaseInvoice saved = purchaseRepository.save(purchase);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseInvoiceResponse> getPurchases(UUID businessId, Pageable pageable) {
        return purchaseRepository.findByBusinessIdOrderByBillDateDescCreatedAtDesc(businessId, pageable)
                .map(this::toResponse);
    }

    private UUID getAccountIdBySubCategory(UUID businessId, String subCategory, String fallbackCode) {
        return accountRepository.findByBusinessIdAndSubCategory(businessId, subCategory)
                .map(Account::getId)
                .orElseGet(() -> accountRepository.findByBusinessIdAndCode(businessId, fallbackCode)
                        .map(Account::getId)
                        .orElseThrow(() -> new IllegalStateException("Required system account not found: " + fallbackCode)));
    }

    private PurchaseInvoiceResponse toResponse(PurchaseInvoice p) {
        List<PurchaseLineResponse> lineResponses = p.getLines().stream()
                .map(l -> PurchaseLineResponse.builder()
                        .id(l.getId())
                        .productId(l.getProduct() != null ? l.getProduct().getId() : null)
                        .productName(l.getProductName())
                        .quantity(l.getQuantity())
                        .unitCost(l.getUnitCost())
                        .taxAmount(l.getTaxAmount())
                        .totalAmount(l.getTotalAmount())
                        .build())
                .collect(Collectors.toList());

        return PurchaseInvoiceResponse.builder()
                .id(p.getId())
                .billNumber(p.getBillNumber())
                .billDate(p.getBillDate())
                .dueDate(p.getDueDate())
                .supplierId(p.getSupplier() != null ? p.getSupplier().getId() : null)
                .supplierName(p.getSupplierName())
                .subtotal(p.getSubtotal())
                .taxableAmount(p.getSubtotal() != null ? p.getSubtotal() : (p.getTotalAmount().subtract(p.getTaxAmount() != null ? p.getTaxAmount() : BigDecimal.ZERO)))
                .discountAmount(p.getDiscountAmount())
                .taxAmount(p.getTaxAmount())
                .totalAmount(p.getTotalAmount())
                .paidAmount(p.getPaidAmount())
                .balanceAmount(p.getBalanceAmount())
                .paymentMode(p.getPaymentMode())
                .status(p.getStatus())
                .notes(p.getNotes())
                .lines(lineResponses)
                .build();
    }
}
