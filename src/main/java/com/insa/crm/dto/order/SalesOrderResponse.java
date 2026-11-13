package com.insa.crm.dto.order;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SalesOrderResponse {
    private Long id;
    private String orderCode;
    private String quotationRef;
    private Long customerId;
    private String customerName;
    private LocalDate orderDate;
    private LocalDate deliveryDate;
    private BigDecimal totalAmount;
    private String status;
    private String assignedTo;
    private String notes;
    private List<SalesOrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
