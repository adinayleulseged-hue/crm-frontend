package com.insa.crm.dto.opportunity;
import jakarta.validation.constraints.*;
import com.insa.crm.model.enums.OpportunityStage;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
@Data
public class OpportunityRequest {
    @NotBlank private String title;
    private String description;
    @NotNull private Long customerId;
    private OpportunityStage stage;
    private BigDecimal amount;
    private Integer probability;
    private LocalDate expectedCloseDate;
    private String assignedTo;
}

