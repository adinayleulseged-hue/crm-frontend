package com.insa.crm.dto.product;

import com.insa.crm.model.enums.ProductCategory;
import com.insa.crm.model.enums.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank
    private String name;
    
    @NotNull
    private ProductCategory category;
    
    private String description;
    
    @NotNull
    private BigDecimal unitPrice;
    
    private String sku;
    private Integer stockQuantity;
    private ProductStatus status;
}
