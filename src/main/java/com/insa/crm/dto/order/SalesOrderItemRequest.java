package com.insa.crm.dto.order;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import lombok.Data;
@Data
public class SalesOrderItemRequest {
    @NotBlank private String itemDescription;
    @NotNull @Positive private Integer quantity;
    @NotNull @Positive private BigDecimal unitPrice;
}
