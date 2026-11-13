package com.insa.crm.controller;

import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.dto.lead.*;
import com.insa.crm.dto.opportunity.OpportunityResponse;
import com.insa.crm.model.enums.LeadStage;
import com.insa.crm.service.LeadService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Leads")
public class LeadController {
    private final LeadService leadService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<LeadResponse>>> getAllLeads(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LeadStage stage,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(leadService.getAllLeads(search, stage, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadResponse>> getLeadById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(leadService.getLeadById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeadResponse>> createLead(@Valid @RequestBody LeadRequest req) {
        return ResponseEntity.ok(ApiResponse.success(leadService.createLead(req)));
    }

    @PostMapping("/public")
    public ResponseEntity<ApiResponse<LeadResponse>> createPublicLead(@RequestBody LeadRequest req) {
        log.info("Public contact form submitted lead for company: {}", req.getCompany());
        req.setStage(LeadStage.NEW);
        return ResponseEntity.ok(ApiResponse.success(leadService.createLead(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadResponse>> updateLead(@PathVariable Long id, @Valid @RequestBody LeadRequest req) {
        return ResponseEntity.ok(ApiResponse.success(leadService.updateLead(id, req)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<LeadResponse>> updateLeadStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, String> body) {
        
        String targetStatusStr = status;
        String reason = null;
        
        if (body != null) {
            if (targetStatusStr == null && body.containsKey("status")) {
                targetStatusStr = body.get("status");
            }
            if (body.containsKey("disqualificationReason")) {
                reason = body.get("disqualificationReason");
            } else if (body.containsKey("reason")) {
                reason = body.get("reason");
            }
        }
        
        LeadStage stage = LeadStage.NEW;
        if (targetStatusStr != null) {
            try {
                stage = LeadStage.valueOf(targetStatusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                if ("UNQUALIFIED".equalsIgnoreCase(targetStatusStr)) {
                    stage = LeadStage.DISQUALIFIED;
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success(leadService.updateLeadStatus(id, stage, reason)));
    }

    @PostMapping("/{id}/qualify")
    public ResponseEntity<ApiResponse<LeadResponse>> qualifyLead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(leadService.qualifyLead(id)));
    }

    @PostMapping("/{id}/disqualify")
    public ResponseEntity<ApiResponse<LeadResponse>> disqualifyLead(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Disqualified by admin";
        return ResponseEntity.ok(ApiResponse.success(leadService.disqualifyLead(id, reason)));
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<ApiResponse<OpportunityResponse>> convertLead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(leadService.convertLead(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLead(@PathVariable Long id) {
        leadService.deleteLead(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
