package com.insa.crm.controller;
import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.dto.campaign.*;
import com.insa.crm.service.CampaignService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/campaigns") @RequiredArgsConstructor @Slf4j @Tag(name="Campaigns")
public class CampaignController {
    private final CampaignService campaignService;
    
    @GetMapping("/")
    public ResponseEntity<ApiResponse<PageResponse<CampaignResponse>>> getAllCampaigns(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(campaignService.getAllCampaigns(pageable))));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CampaignResponse>> getCampaignById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.getCampaignById(id)));
    }
    @PostMapping("/")
    public ResponseEntity<ApiResponse<CampaignResponse>> createCampaign(@Valid @RequestBody CampaignRequest req) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.createCampaign(req)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CampaignResponse>> updateCampaign(@PathVariable Long id, @Valid @RequestBody CampaignRequest req) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.updateCampaign(id, req)));
    }
}
