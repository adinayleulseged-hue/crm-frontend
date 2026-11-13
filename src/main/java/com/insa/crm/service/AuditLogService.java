package com.insa.crm.service;
import com.insa.crm.model.AuditLog;
import com.insa.crm.model.enums.AuditAction;
import com.insa.crm.model.enums.AuditModule;
import com.insa.crm.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor @Slf4j
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;
    
    public Page<AuditLog> getAllAuditLogs(AuditModule module, AuditAction action, String performedBy, Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }
    public void createAuditLog(AuditModule module, AuditAction action, String description, String performedBy, String role, String ipAddress) {
        AuditLog logEntity = new AuditLog();
        logEntity.setModule(module);
        logEntity.setAction(action);
        logEntity.setDescription(description);
        logEntity.setPerformedBy(performedBy);
        logEntity.setRole(role);
        logEntity.setIpAddress(ipAddress);
        logEntity.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(logEntity);
    }
}

