package com.insa.crm.controller;
import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.dashboard.*;
import com.insa.crm.service.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api") @RequiredArgsConstructor @Slf4j @Tag(name="Dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    
    @GetMapping("/dashboard/kpis")
    public ResponseEntity<ApiResponse<DashboardKpiResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getKpis()));
    }
    @GetMapping("/reports/revenue")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReport() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRevenueReport()));
    }
}
