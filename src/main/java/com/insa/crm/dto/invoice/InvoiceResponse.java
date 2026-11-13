package com.insa.crm.dto.invoice;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private Long salesOrderId;
    private String salesOrderCode;
    private Long customerId;
    private String customerName;
    private String status;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private String currency;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
