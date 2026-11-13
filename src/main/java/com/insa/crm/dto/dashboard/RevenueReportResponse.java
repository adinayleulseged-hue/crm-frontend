package com.insa.crm.dto.dashboard;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RevenueReportResponse {
    private List<MonthlyRevenue> monthlyRevenues;
}
