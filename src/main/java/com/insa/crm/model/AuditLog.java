package com.insa.crm.model;

import com.insa.crm.model.enums.AuditAction;
import com.insa.crm.model.enums.AuditModule;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private AuditModule module;

    @Enumerated(EnumType.STRING)
    private AuditAction action;

    private String description;
    private String performedBy;
    private String role;
    private String ipAddress;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
