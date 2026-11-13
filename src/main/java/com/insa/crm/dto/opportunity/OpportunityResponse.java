package com.insa.crm.dto.opportunity;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OpportunityResponse {
    private Long id;
    private String oppCode;
    private String title;
    private String description;
    private Long customerId;
    private String customerName;
    private String stage;
    private BigDecimal amount;
    private Integer probability;
    private LocalDate expectedCloseDate;
    private String assignedTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
