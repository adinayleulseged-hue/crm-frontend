package com.insa.crm.controller;

import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.dto.notification.NotificationRequest;
import com.insa.crm.dto.notification.NotificationResponse;
import com.insa.crm.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getUserNotifications(
            Authentication authentication,
            Pageable pageable) {
        String username = (authentication != null) ? authentication.getName() : "admin";
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(notificationService.getUserNotifications(username, pageable))));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getRecentNotifications(Authentication authentication) {
        String username = (authentication != null) ? authentication.getName() : "admin";
        return ResponseEntity.ok(ApiResponse.success(notificationService.getRecentUserNotifications(username)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUnreadCount(Authentication authentication) {
        String username = (authentication != null) ? authentication.getName() : "admin";
        long count = notificationService.getUnreadCount(username);
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(@Valid @RequestBody NotificationRequest req) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.createNotification(req)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.markAsRead(id)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        String username = (authentication != null) ? authentication.getName() : "admin";
        notificationService.markAllAsRead(username);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
