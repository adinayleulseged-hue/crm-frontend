package com.insa.crm.repository;

import com.insa.crm.model.Interaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long>, JpaSpecificationExecutor<Interaction> {
    List<Interaction> findByCustomerId(Long customerId);
    List<Interaction> findByLeadId(Long leadId);
}
