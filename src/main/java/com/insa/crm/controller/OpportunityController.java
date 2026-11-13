package com.insa.crm.controller;
import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.dto.opportunity.*;
import com.insa.crm.model.enums.OpportunityStage;
import com.insa.crm.service.OpportunityService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/opportunities") @RequiredArgsConstructor @Slf4j @Tag(name="Opportunities")
public class OpportunityController {
    private final OpportunityService opportunityService;
    
    @GetMapping("/")
    public ResponseEntity<ApiResponse<PageResponse<OpportunityResponse>>> getAllOpportunities(
            @RequestParam(required=false) String search, @RequestParam(required=false) OpportunityStage stage, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(opportunityService.getAllOpportunities(search, stage, pageable))));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OpportunityResponse>> getOpportunityById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(opportunityService.getOpportunityById(id)));
    }
    @PostMapping("/")
    public ResponseEntity<ApiResponse<OpportunityResponse>> createOpportunity(@Valid @RequestBody OpportunityRequest req) {
        return ResponseEntity.ok(ApiResponse.success(opportunityService.createOpportunity(req)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OpportunityResponse>> updateOpportunity(@PathVariable Long id, @Valid @RequestBody OpportunityRequest req) {
        return ResponseEntity.ok(ApiResponse.success(opportunityService.updateOpportunity(id, req)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOpportunity(@PathVariable Long id) {
        opportunityService.deleteOpportunity(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

