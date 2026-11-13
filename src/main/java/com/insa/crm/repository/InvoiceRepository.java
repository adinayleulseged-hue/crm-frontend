package com.insa.crm.repository;

import com.insa.crm.model.Invoice;
import com.insa.crm.model.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByCustomerId(Long customerId);
    List<Invoice> findBySalesOrderId(Long salesOrderId);
    long countByStatus(InvoiceStatus status);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i")
    BigDecimal sumTotalAmount();

    @Query("SELECT SUM(i.paidAmount) FROM Invoice i")
    BigDecimal sumPaidAmount();
}
