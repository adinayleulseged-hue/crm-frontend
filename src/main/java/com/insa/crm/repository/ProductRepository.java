package com.insa.crm.repository;

import com.insa.crm.model.Product;
import com.insa.crm.model.enums.ProductCategory;
import com.insa.crm.model.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findByProductCode(String productCode);
    boolean existsByProductCode(String productCode);
    Page<Product> findByCategory(ProductCategory category, Pageable pageable);
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseOrProductCodeContainingIgnoreCase(String name, String code, Pageable pageable);
}
