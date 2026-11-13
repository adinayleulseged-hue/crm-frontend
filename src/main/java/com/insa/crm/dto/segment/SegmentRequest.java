package com.insa.crm.dto.segment;
import jakarta.validation.constraints.*;
import com.insa.crm.model.enums.SegmentCategory;
import lombok.Data;
@Data
public class SegmentRequest {
    @NotBlank private String name;
    @NotNull private SegmentCategory category;
    private String description;
}

