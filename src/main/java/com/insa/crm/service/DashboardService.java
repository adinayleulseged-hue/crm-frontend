package com.insa.crm.service;
import com.insa.crm.dto.dashboard.*;
import com.insa.crm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service @RequiredArgsConstructor @Slf4j
public class DashboardService {
    private final LeadRepository leadRepository;
    private final OpportunityRepository opportunityRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    
    @Cacheable("dashboardKpis")
    public DashboardKpiResponse getKpis() {
        return DashboardKpiResponse.builder()
            .totalLeads(leadRepository.count())
            .pipelineValue(BigDecimal.ZERO) // compute properly in full app
            .winRate(50.0)
            .totalOrders(salesOrderRepository.count())
            .totalRevenue(BigDecimal.ZERO)
            .totalCustomers(customerRepository.count())
            .overdueInvoices(0)
            .build();
    }
    public RevenueReportResponse getRevenueReport() {
        List<MonthlyRevenue> revs = new ArrayList<>();
        revs.add(new MonthlyRevenue("Jan", new BigDecimal("10000"), new BigDecimal("12000")));
        return new RevenueReportResponse(revs);
    }
}
