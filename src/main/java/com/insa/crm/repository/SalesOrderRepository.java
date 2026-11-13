package com.insa.crm.repository;

import com.insa.crm.model.SalesOrder;
import com.insa.crm.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long>, JpaSpecificationExecutor<SalesOrder> {
    Optional<SalesOrder> findByOrderCode(String orderCode);
    long countByStatus(OrderStatus status);
    List<SalesOrder> findByCustomerId(Long customerId);
}
