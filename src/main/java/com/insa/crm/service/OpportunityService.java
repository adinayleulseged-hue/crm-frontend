package com.insa.crm.service;
import com.insa.crm.dto.opportunity.*;
import com.insa.crm.model.Opportunity;
import com.insa.crm.model.enums.OpportunityStage;
import com.insa.crm.repository.CustomerRepository;
import com.insa.crm.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service @RequiredArgsConstructor @Slf4j
public class OpportunityService {
    private final OpportunityRepository opportunityRepository;
    private final CustomerRepository customerRepository;
    
    public Page<OpportunityResponse> getAllOpportunities(String search, OpportunityStage stage, Pageable pageable) {
        return opportunityRepository.findAll(pageable).map(this::mapToResponse);
    }
    public OpportunityResponse getOpportunityById(Long id) {
        return mapToResponse(opportunityRepository.findById(id).orElseThrow());
    }
    public OpportunityResponse createOpportunity(OpportunityRequest req) {
        Opportunity opp = new Opportunity();
        opp.setOppCode(String.format("OPP-%d-%03d", LocalDate.now().getYear(), opportunityRepository.count() + 1));
        mapRequestToEntity(req, opp);
        return mapToResponse(opportunityRepository.save(opp));
    }
    public OpportunityResponse updateOpportunity(Long id, OpportunityRequest req) {
        Opportunity opp = opportunityRepository.findById(id).orElseThrow();
        mapRequestToEntity(req, opp);
        return mapToResponse(opportunityRepository.save(opp));
    }
    public void deleteOpportunity(Long id) {
        opportunityRepository.deleteById(id);
    }
    private void mapRequestToEntity(OpportunityRequest req, Opportunity opp) {
        opp.setTitle(req.getTitle());
        opp.setDescription(req.getDescription());
        opp.setCustomer(customerRepository.findById(req.getCustomerId()).orElseThrow());
        if(req.getStage() != null) opp.setStage(req.getStage());
        opp.setAmount(req.getAmount());
        opp.setProbability(req.getProbability());
        opp.setExpectedCloseDate(req.getExpectedCloseDate());
        opp.setAssignedTo(req.getAssignedTo());
    }
    private OpportunityResponse mapToResponse(Opportunity opp) {
        return OpportunityResponse.builder().id(opp.getId()).oppCode(opp.getOppCode()).title(opp.getTitle())
            .description(opp.getDescription()).customerId(opp.getCustomer().getId()).customerName(opp.getCustomer().getName())
            .stage(opp.getStage() != null ? opp.getStage().name() : null).amount(opp.getAmount())
            .probability(opp.getProbability()).expectedCloseDate(opp.getExpectedCloseDate()).assignedTo(opp.getAssignedTo())
            .createdAt(opp.getCreatedAt()).updatedAt(opp.getUpdatedAt()).build();
    }
}

