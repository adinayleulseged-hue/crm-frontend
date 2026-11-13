package com.insa.crm.repository;

import com.insa.crm.model.Lead;
import com.insa.crm.model.enums.LeadStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long>, JpaSpecificationExecutor<Lead> {
    Optional<Lead> findByLeadCode(String leadCode);
    boolean existsByLeadCode(String leadCode);
    long countByStage(LeadStage stage);
    List<Lead> findByStage(LeadStage stage);
    org.springframework.data.domain.Page<Lead> findByStage(LeadStage stage, org.springframework.data.domain.Pageable pageable);
}
