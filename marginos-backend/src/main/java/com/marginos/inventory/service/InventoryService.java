package com.marginos.inventory.service;

import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.inventory.dto.InventoryDto.*;
import com.marginos.inventory.model.InventoryMovement;
import com.marginos.inventory.model.MovementType;
import com.marginos.inventory.repository.InventoryMovementRepository;
import com.marginos.product.model.Product;
import com.marginos.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final BusinessRepository businessRepository;

    @Transactional
    public InventoryMovement recordMovement(
            UUID businessId,
            UUID productId,
            MovementType type,
            BigDecimal quantity,
            BigDecimal unitCost,
            String referenceType,
            UUID referenceId,
            String notes,
            LocalDate date) {

        Product product = productRepository.findById(productId)
                .filter(p -> p.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("Movement quantity cannot be zero");
        }

        BigDecimal qty = quantity.abs();
        BigDecimal cost = unitCost != null ? unitCost : product.getPurchasePrice();
        BigDecimal totalCost = qty.multiply(cost);

        BigDecimal currentStock = product.getCurrentStock();
        BigDecimal currentWavg = product.getWeightedAverageCost() != null ? product.getWeightedAverageCost() : product.getPurchasePrice();

        // Stock and WAVG updates
        switch (type) {
            case PURCHASE:
            case OPENING:
            case RETURN_IN:
                // Weighted Average Cost formula:
                // new_wavg = (currentStock * currentWavg + qty * cost) / (currentStock + qty)
                BigDecimal totalOldValuation = currentStock.multiply(currentWavg);
                BigDecimal totalNewValuation = qty.multiply(cost);
                BigDecimal newStockTotal = currentStock.add(qty);

                if (newStockTotal.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal newWavg = totalOldValuation.add(totalNewValuation)
                            .divide(newStockTotal, 4, RoundingMode.HALF_UP);
                    product.setWeightedAverageCost(newWavg);
                }
                product.setCurrentStock(newStockTotal);
                break;

            case SALE:
            case RETURN_OUT:
                product.setCurrentStock(currentStock.subtract(qty));
                cost = currentWavg; // Sales movements cost at current WAVG
                totalCost = qty.multiply(cost);
                break;

            case ADJUSTMENT:
                if (quantity.compareTo(BigDecimal.ZERO) > 0) {
                    product.setCurrentStock(currentStock.add(qty));
                } else {
                    product.setCurrentStock(currentStock.subtract(qty));
                    cost = currentWavg;
                    totalCost = qty.multiply(cost);
                }
                break;
        }

        productRepository.save(product);

        InventoryMovement movement = InventoryMovement.builder()
                .business(product.getBusiness())
                .product(product)
                .movementType(type)
                .quantity(qty)
                .unitCost(cost)
                .totalCost(totalCost)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .notes(notes)
                .movementDate(date != null ? date : LocalDate.now())
                .build();

        return movementRepository.save(movement);
    }

    @Transactional(readOnly = true)
    public Page<MovementResponse> getMovements(UUID businessId, Pageable pageable) {
        return movementRepository.findByBusinessIdOrderByMovementDateDescCreatedAtDesc(businessId, pageable)
                .map(this::toMovementResponse);
    }

    @Transactional(readOnly = true)
    public InventoryValuationResponse getInventoryValuation(UUID businessId) {
        List<Product> products = productRepository.findByBusinessIdAndActiveTrueOrderByNameAsc(businessId);

        BigDecimal totalValuation = BigDecimal.ZERO;
        int lowStockCount = 0;
        List<ProductValuationItem> items = new ArrayList<>();

        for (Product p : products) {
            BigDecimal wavg = p.getWeightedAverageCost() != null ? p.getWeightedAverageCost() : p.getPurchasePrice();
            BigDecimal val = p.getCurrentStock().multiply(wavg);
            totalValuation = totalValuation.add(val);

            boolean isLow = p.isLowStock();
            if (isLow) lowStockCount++;

            items.add(ProductValuationItem.builder()
                    .productId(p.getId())
                    .sku(p.getSku())
                    .name(p.getName())
                    .unit(p.getUnit())
                    .currentStock(p.getCurrentStock())
                    .weightedAverageCost(wavg)
                    .valuation(val)
                    .isLowStock(isLow)
                    .build());
        }

        return InventoryValuationResponse.builder()
                .totalStockValue(totalValuation)
                .totalSkus(products.size())
                .lowStockCount(lowStockCount)
                .items(items)
                .build();
    }

    @Transactional(readOnly = true)
    public AbcAnalysisResponse getAbcAnalysis(UUID businessId) {
        List<Product> products = productRepository.findByBusinessIdAndActiveTrueOrderByNameAsc(businessId);

        // Compute simulated/annual revenue per product = currentStock * sellingPrice (or historical)
        Map<Product, BigDecimal> productRevenueMap = new HashMap<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Product p : products) {
            // Turnover estimate: selling_price * current_stock (or 3x stock turn typical in FMCG)
            BigDecimal estTurnover = p.getSellingPrice().multiply(p.getCurrentStock().max(new BigDecimal("10")));
            productRevenueMap.put(p, estTurnover);
            totalRevenue = totalRevenue.add(estTurnover);
        }

        if (totalRevenue.compareTo(BigDecimal.ZERO) == 0) {
            totalRevenue = new BigDecimal("1.00");
        }

        final BigDecimal finalTotalRevenue = totalRevenue;
        List<Map.Entry<Product, BigDecimal>> sorted = productRevenueMap.entrySet().stream()
                .sorted(Map.Entry.<Product, BigDecimal>comparingByValue().reversed())
                .collect(Collectors.toList());

        List<AbcItem> classA = new ArrayList<>();
        List<AbcItem> classB = new ArrayList<>();
        List<AbcItem> classC = new ArrayList<>();

        BigDecimal cumulativePct = BigDecimal.ZERO;

        for (Map.Entry<Product, BigDecimal> entry : sorted) {
            Product p = entry.getKey();
            BigDecimal rev = entry.getValue();
            BigDecimal sharePct = rev.multiply(new BigDecimal("100")).divide(finalTotalRevenue, 2, RoundingMode.HALF_UP);
            cumulativePct = cumulativePct.add(sharePct);

            String classification;
            if (cumulativePct.compareTo(new BigDecimal("70.00")) <= 0 || classA.isEmpty()) {
                classification = "A";
                classA.add(toAbcItem(p, rev, sharePct, cumulativePct, classification));
            } else if (cumulativePct.compareTo(new BigDecimal("90.00")) <= 0 || classB.isEmpty()) {
                classification = "B";
                classB.add(toAbcItem(p, rev, sharePct, cumulativePct, classification));
            } else {
                classification = "C";
                classC.add(toAbcItem(p, rev, sharePct, cumulativePct, classification));
            }
        }

        return AbcAnalysisResponse.builder()
                .classA(classA)
                .classB(classB)
                .classC(classC)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SlowMovingItem> getSlowMovingItems(UUID businessId, Integer thresholdDays) {
        int days = thresholdDays != null ? thresholdDays : 45;
        List<Product> products = productRepository.findByBusinessIdAndActiveTrueOrderByNameAsc(businessId);
        List<SlowMovingItem> slowMoving = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Product p : products) {
            List<InventoryMovement> movements = movementRepository.findByProductIdOrderByMovementDateDesc(p.getId());
            LocalDate lastDate = movements.isEmpty() ? today.minusDays(90) : movements.get(0).getMovementDate();
            long daysSince = ChronoUnit.DAYS.between(lastDate, today);

            if (daysSince >= days && p.getCurrentStock().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal wavg = p.getWeightedAverageCost() != null ? p.getWeightedAverageCost() : p.getPurchasePrice();
                BigDecimal val = p.getCurrentStock().multiply(wavg);

                String rec;
                if (daysSince > 90) {
                    rec = "Dead stock risk: bundle with fast-moving items or run 15-20% discount clearance.";
                } else {
                    rec = "Slow turnover: avoid placing new supplier orders until existing stock is cleared.";
                }

                slowMoving.add(SlowMovingItem.builder()
                        .productId(p.getId())
                        .sku(p.getSku())
                        .name(p.getName())
                        .currentStock(p.getCurrentStock())
                        .stockValue(val)
                        .lastSoldDate(lastDate)
                        .daysSinceLastMovement((int) daysSince)
                        .recommendation(rec)
                        .build());
            }
        }

        return slowMoving;
    }

    @Transactional(readOnly = true)
    public EoqCalculationResponse calculateEoq(
            UUID businessId,
            UUID productId,
            BigDecimal annualDemand,
            BigDecimal orderingCost,
            BigDecimal holdingCostRate) {

        Product product = productRepository.findById(productId)
                .filter(p -> p.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        BigDecimal demand = (annualDemand != null && annualDemand.compareTo(BigDecimal.ZERO) > 0)
                ? annualDemand : product.getCurrentStock().multiply(new BigDecimal("12")).max(new BigDecimal("100"));
        BigDecimal sCost = (orderingCost != null && orderingCost.compareTo(BigDecimal.ZERO) > 0)
                ? orderingCost : new BigDecimal("250.00"); // Typical phone call + freight per order in India
        BigDecimal hRate = (holdingCostRate != null && holdingCostRate.compareTo(BigDecimal.ZERO) > 0)
                ? holdingCostRate : new BigDecimal("0.15"); // 15% holding cost per year

        BigDecimal unitCost = product.getWeightedAverageCost() != null && product.getWeightedAverageCost().compareTo(BigDecimal.ZERO) > 0
                ? product.getWeightedAverageCost() : product.getPurchasePrice();

        BigDecimal hCostPerUnit = unitCost.multiply(hRate);
        if (hCostPerUnit.compareTo(BigDecimal.ZERO) == 0) hCostPerUnit = new BigDecimal("1.00");

        // EOQ = sqrt( (2 * D * S) / H )
        double dVal = demand.doubleValue();
        double sVal = sCost.doubleValue();
        double hVal = hCostPerUnit.doubleValue();
        double eoqVal = Math.sqrt((2.0 * dVal * sVal) / hVal);

        BigDecimal eoq = BigDecimal.valueOf(eoqVal).setScale(2, RoundingMode.HALF_UP);
        BigDecimal ordersPerYear = demand.divide(eoq, 1, RoundingMode.HALF_UP);

        String explanation = String.format(
                "To minimize total inventory holding and procurement costs for '%s', you should order approximately %s %s every time, resulting in %s orders per year.",
                product.getName(), eoq.setScale(0, RoundingMode.HALF_UP), product.getUnit(), ordersPerYear);

        return EoqCalculationResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .annualDemand(demand)
                .orderingCost(sCost)
                .holdingCostPerUnit(hCostPerUnit)
                .economicOrderQuantity(eoq)
                .optimalOrdersPerYear(ordersPerYear)
                .explanation(explanation)
                .build();
    }

    private AbcItem toAbcItem(Product p, BigDecimal rev, BigDecimal share, BigDecimal cum, String classification) {
        return AbcItem.builder()
                .productId(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .salesRevenue(rev)
                .revenueSharePercent(share)
                .cumulativePercent(cum)
                .classification(classification)
                .build();
    }

    private MovementResponse toMovementResponse(InventoryMovement m) {
        return MovementResponse.builder()
                .id(m.getId())
                .productId(m.getProduct().getId())
                .productName(m.getProduct().getName())
                .sku(m.getProduct().getSku())
                .movementType(m.getMovementType())
                .quantity(m.getQuantity())
                .unitCost(m.getUnitCost())
                .totalCost(m.getTotalCost())
                .referenceType(m.getReferenceType())
                .notes(m.getNotes())
                .movementDate(m.getMovementDate())
                .build();
    }
}
