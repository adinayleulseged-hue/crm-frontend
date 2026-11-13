package com.insa.crm.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String recipientUsername;
    private String title;
    private String message;
    private String type;
    private boolean readStatus;
    private String relatedEntityType;
    private Long relatedEntityId;
    private LocalDateTime createdAt;
}
