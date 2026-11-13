package com.insa.crm.dto.campaign;
import jakarta.validation.constraints.*;
import com.insa.crm.model.enums.CampaignType;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;
@Data
public class CampaignRequest {
    @NotBlank private String name;
    @NotNull private CampaignType type;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
}

