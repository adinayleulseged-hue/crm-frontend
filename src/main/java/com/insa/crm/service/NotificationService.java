package com.insa.crm.service;

import com.insa.crm.dto.notification.NotificationRequest;
import com.insa.crm.dto.notification.NotificationResponse;
import com.insa.crm.model.Notification;
import com.insa.crm.model.enums.NotificationType;
import com.insa.crm.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public Page<NotificationResponse> getUserNotifications(String username, Pageable pageable) {
        return notificationRepository.findByRecipientUsernameOrRecipientUsernameIsNullOrderByCreatedAtDesc(username, pageable)
                .map(this::mapToResponse);
    }

    public List<NotificationResponse> getRecentUserNotifications(String username) {
        return notificationRepository.findTop10ByRecipientUsernameOrRecipientUsernameIsNullOrderByCreatedAtDesc(username)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String username) {
        return notificationRepository.countByRecipientUsernameAndReadStatusFalse(username) +
               notificationRepository.countByRecipientUsernameIsNullAndReadStatusFalse();
    }

    @Transactional
    public NotificationResponse createNotification(NotificationRequest req) {
        Notification notification = new Notification();
        notification.setRecipientUsername(req.getRecipientUsername());
        notification.setTitle(req.getTitle());
        notification.setMessage(req.getMessage());
        notification.setType(req.getType() != null ? req.getType() : NotificationType.INFO);
        notification.setRelatedEntityType(req.getRelatedEntityType());
        notification.setRelatedEntityId(req.getRelatedEntityId());
        notification.setReadStatus(false);
        
        log.info("Notification created for user '{}': {}", req.getRecipientUsername(), req.getTitle());
        return mapToResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void sendSystemNotification(String recipientUsername, String title, String message, NotificationType type) {
        NotificationRequest req = new NotificationRequest();
        req.setRecipientUsername(recipientUsername);
        req.setTitle(title);
        req.setMessage(message);
        req.setType(type);
        createNotification(req);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setReadStatus(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(String username) {
        notificationRepository.markAllAsReadForUser(username);
        log.info("Marked all notifications as read for user: {}", username);
    }

    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .recipientUsername(notification.getRecipientUsername())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType() != null ? notification.getType().name() : null)
                .readStatus(notification.isReadStatus())
                .relatedEntityType(notification.getRelatedEntityType())
                .relatedEntityId(notification.getRelatedEntityId())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
