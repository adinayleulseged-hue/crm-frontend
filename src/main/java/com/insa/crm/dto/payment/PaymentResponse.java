package com.insa.crm.dto.payment;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private String paymentNumber;
    private Long invoiceId;
    private String invoiceNumber;
    private Long customerId;
    private String customerName;
    private String paymentMethod;
    private String status;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String transactionReference;
    private String receivedBy;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
