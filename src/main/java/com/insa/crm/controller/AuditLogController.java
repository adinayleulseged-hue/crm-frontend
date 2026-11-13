package com.insa.crm.controller;
import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.model.AuditLog;
import com.insa.crm.model.enums.AuditAction;
import com.insa.crm.model.enums.AuditModule;
import com.insa.crm.service.AuditLogService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/audit-logs") @RequiredArgsConstructor @Slf4j @Tag(name="Audit Logs")
public class AuditLogController {
    private final AuditLogService auditLogService;
    
    @GetMapping("/")
    public ResponseEntity<ApiResponse<PageResponse<AuditLog>>> getAllLogs(
            @RequestParam(required=false) AuditModule module, @RequestParam(required=false) AuditAction action,
            @RequestParam(required=false) String performedBy, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(auditLogService.getAllAuditLogs(module, action, performedBy, pageable))));
    }
}

