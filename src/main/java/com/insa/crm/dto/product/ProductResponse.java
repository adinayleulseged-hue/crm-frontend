package com.insa.crm.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String productCode;
    private String name;
    private String category;
    private String description;
    private BigDecimal unitPrice;
    private String sku;
    private Integer stockQuantity;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
