package com.insa.crm.dto.order;
import jakarta.validation.constraints.*;
import com.insa.crm.model.enums.OrderStatus;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;
@Data
public class SalesOrderRequest {
    private String quotationRef;
    @NotNull private Long customerId;
    private LocalDate orderDate;
    private LocalDate deliveryDate;
    private OrderStatus status;
    private String assignedTo;
    private String notes;
    private List<SalesOrderItemRequest> items;
}

