package com.marginos.inventory;

import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.inventory.model.MovementType;
import com.marginos.inventory.repository.InventoryMovementRepository;
import com.marginos.inventory.service.InventoryService;
import com.marginos.product.model.Product;
import com.marginos.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class InventoryWavgTest {

    private InventoryService inventoryService;
    private ProductRepository productRepository;
    private InventoryMovementRepository movementRepository;
    private BusinessRepository businessRepository;

    @BeforeEach
    void setUp() {
        productRepository = Mockito.mock(ProductRepository.class);
        movementRepository = Mockito.mock(InventoryMovementRepository.class);
        businessRepository = Mockito.mock(BusinessRepository.class);

        when(movementRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        inventoryService = new InventoryService(movementRepository, productRepository, businessRepository);
    }

    @Test
    @DisplayName("Should correctly recalculate Weighted Average Cost (WAVG) on subsequent purchases")
    void testWeightedAverageCostRecalculation() {
        UUID bizId = UUID.randomUUID();
        UUID prodId = UUID.randomUUID();

        Business biz = Business.builder().id(bizId).name("Test Store").build();

        // Initial state: 10 units @ ₹100.00
        Product product = Product.builder()
                .id(prodId)
                .business(biz)
                .name("Basmati Rice")
                .purchasePrice(new BigDecimal("100.00"))
                .sellingPrice(new BigDecimal("140.00"))
                .currentStock(new BigDecimal("10.0000"))
                .weightedAverageCost(new BigDecimal("100.0000"))
                .build();

        when(productRepository.findById(prodId)).thenReturn(Optional.of(product));

        // Action: Purchase 5 more units @ ₹130.00
        // Expected WAVG = (10 * 100 + 5 * 130) / 15 = (1000 + 650) / 15 = 1650 / 15 = ₹110.00
        // Expected Stock = 15 units
        inventoryService.recordMovement(
                bizId,
                prodId,
                MovementType.PURCHASE,
                new BigDecimal("5.0000"),
                new BigDecimal("130.0000"),
                "PURCHASE_BILL",
                null,
                "Batch 2",
                LocalDate.now()
        );

        assertEquals(new BigDecimal("15.0000"), product.getCurrentStock().setScale(4));
        assertEquals(new BigDecimal("110.0000"), product.getWeightedAverageCost().setScale(4));

        // Action: Sell 8 units
        // Expected: Stock decreases to 7, WAVG remains ₹110.00
        inventoryService.recordMovement(
                bizId,
                prodId,
                MovementType.SALE,
                new BigDecimal("8.0000"),
                null,
                "SALES_INVOICE",
                null,
                "Sale 1",
                LocalDate.now()
        );

        assertEquals(new BigDecimal("7.0000"), product.getCurrentStock().setScale(4));
        assertEquals(new BigDecimal("110.0000"), product.getWeightedAverageCost().setScale(4));
    }
}
