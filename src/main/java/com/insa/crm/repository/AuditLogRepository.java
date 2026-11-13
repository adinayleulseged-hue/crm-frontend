package com.insa.crm.repository;

import com.insa.crm.model.AuditLog;
import com.insa.crm.model.enums.AuditModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {
    List<AuditLog> findByModule(AuditModule module);
    List<AuditLog> findByPerformedBy(String performedBy);
    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
