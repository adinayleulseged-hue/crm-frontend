package com.insa.crm.repository;

import com.insa.crm.model.Campaign;
import com.insa.crm.model.enums.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long>, JpaSpecificationExecutor<Campaign> {
    Optional<Campaign> findByCampaignCode(String campaignCode);
    List<Campaign> findByStatus(CampaignStatus status);
}
