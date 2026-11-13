package com.insa.crm.dto.order;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SalesOrderItemResponse {
    private Long id;
    private String itemDescription;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
