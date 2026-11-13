package com.insa.crm.dto.payment;
import jakarta.validation.constraints.*;
import com.insa.crm.model.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;
@Data
public class PaymentRequest {
    @NotNull private Long invoiceId;
    @NotNull private Long customerId;
    @NotNull private PaymentMethod paymentMethod;
    @NotNull @Positive private BigDecimal amount;
    private LocalDate paymentDate;
    private String transactionReference;
    private String receivedBy;
    private String notes;
}

