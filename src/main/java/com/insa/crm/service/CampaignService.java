package com.insa.crm.service;
import com.insa.crm.dto.campaign.*;
import com.insa.crm.model.Campaign;
import com.insa.crm.model.enums.CampaignStatus;
import com.insa.crm.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service @RequiredArgsConstructor @Slf4j
public class CampaignService {
    private final CampaignRepository campaignRepository;
    
    public Page<CampaignResponse> getAllCampaigns(Pageable pageable) {
        return campaignRepository.findAll(pageable).map(this::mapToResponse);
    }
    public CampaignResponse getCampaignById(Long id) {
        return mapToResponse(campaignRepository.findById(id).orElseThrow());
    }
    public CampaignResponse createCampaign(CampaignRequest req) {
        Campaign campaign = new Campaign();
        campaign.setCampaignCode(String.format("CMP-%d-%02d", LocalDate.now().getYear(), campaignRepository.count() + 1));
        campaign.setName(req.getName());
        campaign.setType(req.getType());
        campaign.setStatus(CampaignStatus.PLANNED);
        campaign.setStartDate(req.getStartDate());
        campaign.setEndDate(req.getEndDate());
        campaign.setBudget(req.getBudget() != null ? req.getBudget() : BigDecimal.ZERO);
        campaign.setSpent(BigDecimal.ZERO);
        campaign.setLeadsGenerated(0);
        campaign.setRevenueGenerated(BigDecimal.ZERO);
        return mapToResponse(campaignRepository.save(campaign));
    }
    public CampaignResponse updateCampaign(Long id, CampaignRequest req) {
        Campaign campaign = campaignRepository.findById(id).orElseThrow();
        campaign.setName(req.getName());
        campaign.setType(req.getType());
        campaign.setStartDate(req.getStartDate());
        campaign.setEndDate(req.getEndDate());
        campaign.setBudget(req.getBudget());
        return mapToResponse(campaignRepository.save(campaign));
    }
    private CampaignResponse mapToResponse(Campaign c) {
        return CampaignResponse.builder().id(c.getId()).campaignCode(c.getCampaignCode())
            .name(c.getName()).type(c.getType().name()).status(c.getStatus().name())
            .startDate(c.getStartDate()).endDate(c.getEndDate()).budget(c.getBudget())
            .spent(c.getSpent()).leadsGenerated(c.getLeadsGenerated()).revenueGenerated(c.getRevenueGenerated())
            .createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt()).build();
    }
}

