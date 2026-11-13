package com.insa.crm.dto.dashboard;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardKpiResponse {
    private long totalLeads;
    private BigDecimal pipelineValue;
    private double winRate;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long totalCustomers;
    private long overdueInvoices;
}
