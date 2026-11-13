package com.insa.crm.repository;

import com.insa.crm.model.Payment;
import com.insa.crm.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {
    Optional<Payment> findByPaymentNumber(String paymentNumber);
    List<Payment> findByInvoiceId(Long invoiceId);
    List<Payment> findByCustomerId(Long customerId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED'")
    BigDecimal sumAmountByStatusCompleted();
}
