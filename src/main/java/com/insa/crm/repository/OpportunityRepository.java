package com.insa.crm.repository;

import com.insa.crm.model.Opportunity;
import com.insa.crm.model.enums.OpportunityStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, Long>, JpaSpecificationExecutor<Opportunity> {
    Optional<Opportunity> findByOppCode(String oppCode);
    List<Opportunity> findByStage(OpportunityStage stage);

    @Query("SELECT SUM(o.amount) FROM Opportunity o WHERE o.stage = :stage")
    BigDecimal sumAmountByStage(OpportunityStage stage);
}
