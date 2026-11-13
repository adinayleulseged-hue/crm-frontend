package com.insa.crm.repository;

import com.insa.crm.model.Customer;
import com.insa.crm.model.enums.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {
    Optional<Customer> findByCustomerCode(String customerCode);
    Optional<Customer> findByTin(String tin);
    boolean existsByCustomerCode(String customerCode);
    boolean existsByTin(String tin);
    
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.status = :status")
    long countByStatus(CustomerStatus status);
    
    Page<Customer> findByNameContainingIgnoreCaseOrCustomerCodeContainingIgnoreCase(String name, String customerCode, Pageable pageable);
}
