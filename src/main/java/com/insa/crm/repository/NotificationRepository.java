package com.insa.crm.repository;

import com.insa.crm.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipientUsernameOrderByCreatedAtDesc(String recipientUsername, Pageable pageable);
    Page<Notification> findByRecipientUsernameOrRecipientUsernameIsNullOrderByCreatedAtDesc(String recipientUsername, Pageable pageable);
    long countByRecipientUsernameAndReadStatusFalse(String recipientUsername);
    long countByRecipientUsernameIsNullAndReadStatusFalse();
    
    List<Notification> findTop10ByRecipientUsernameOrRecipientUsernameIsNullOrderByCreatedAtDesc(String recipientUsername);
    
    @Modifying
    @Query("UPDATE Notification n SET n.readStatus = true WHERE n.recipientUsername = :username OR n.recipientUsername IS NULL")
    void markAllAsReadForUser(String username);
}
