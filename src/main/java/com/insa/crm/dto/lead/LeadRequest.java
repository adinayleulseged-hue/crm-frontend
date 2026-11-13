package com.insa.crm.dto.lead;

import jakarta.validation.constraints.*;
import com.insa.crm.model.enums.LeadSource;
import com.insa.crm.model.enums.LeadStage;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class LeadRequest {
    private String company;
    private String contactName;
    private String firstName;
    private String lastName;
    private String phone;
    @Email 
    private String email;
    private LeadSource source;
    private LeadStage stage;
    private Integer score;
    private BigDecimal estimatedValue;
    private BigDecimal budget;
    private String assignedTo;
    private String notes;
    private String internalNotes;
    private String disqualificationReason;

    public String getCompany() {
        if (company != null && !company.isBlank()) return company;
        if (firstName != null || lastName != null) {
            return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
        }
        return "New Prospect";
    }

    public String getContactName() {
        if (contactName != null && !contactName.isBlank()) return contactName;
        if (firstName != null || lastName != null) {
            return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
        }
        return "Contact Person";
    }

    public BigDecimal getEstimatedValue() {
        if (estimatedValue != null) return estimatedValue;
        if (budget != null) return budget;
        return null;
    }
}
