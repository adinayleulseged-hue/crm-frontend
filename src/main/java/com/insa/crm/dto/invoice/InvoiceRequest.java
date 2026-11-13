package com.insa.crm.dto.invoice;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;
@Data
public class InvoiceRequest {
    private Long salesOrderId;
    @NotNull private Long customerId;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    @NotNull @Positive private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private String notes;
}
