package com.insa.crm.dto.dashboard;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MonthlyRevenue {
    private String month;
    private BigDecimal revenue;
    private BigDecimal target;
}
