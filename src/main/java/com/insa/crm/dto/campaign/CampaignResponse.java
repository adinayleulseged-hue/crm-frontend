package com.insa.crm.dto.campaign;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CampaignResponse {
    private Long id;
    private String campaignCode;
    private String name;
    private String type;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
    private BigDecimal spent;
    private Integer leadsGenerated;
    private BigDecimal revenueGenerated;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
