package com.insa.crm.dto.lead;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeadResponse {
    private Long id;
    private String leadCode;
    private String company;
    private String contactName;
    private String phone;
    private String email;
    private String source;
    private String stage;
    private Integer score;
    private BigDecimal estimatedValue;
    private String assignedTo;
    private String notes;
    private String disqualificationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
