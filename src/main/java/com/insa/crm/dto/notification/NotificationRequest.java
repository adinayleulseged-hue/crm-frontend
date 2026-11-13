package com.insa.crm.dto.notification;

import com.insa.crm.model.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NotificationRequest {
    private String recipientUsername;
    
    @NotBlank
    private String title;
    
    @NotBlank
    private String message;
    
    private NotificationType type;
    private String relatedEntityType;
    private Long relatedEntityId;
}
