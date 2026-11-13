package com.insa.crm.service;

import com.insa.crm.dto.lead.*;
import com.insa.crm.dto.opportunity.OpportunityResponse;
import com.insa.crm.model.Customer;
import com.insa.crm.model.Lead;
import com.insa.crm.model.Opportunity;
import com.insa.crm.model.enums.CustomerStatus;
import com.insa.crm.model.enums.CustomerType;
import com.insa.crm.model.enums.LeadStage;
import com.insa.crm.model.enums.OpportunityStage;
import com.insa.crm.repository.CustomerRepository;
import com.insa.crm.repository.LeadRepository;
import com.insa.crm.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeadService {
    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final OpportunityRepository opportunityRepository;
    private final OpportunityService opportunityService;

    public Page<LeadResponse> getAllLeads(String search, LeadStage stage, Pageable pageable) {
        if (stage != null) {
            return leadRepository.findByStage(stage, pageable).map(this::mapToResponse);
        }
        return leadRepository.findAll(pageable).map(this::mapToResponse);
    }

    public LeadResponse getLeadById(Long id) {
        return mapToResponse(leadRepository.findById(id).orElseThrow());
    }

    @Transactional
    public LeadResponse createLead(LeadRequest req) {
        Lead lead = new Lead();
        lead.setLeadCode(String.format("LED-%d-%03d", LocalDate.now().getYear(), leadRepository.count() + 1));
        mapRequestToEntity(req, lead);
        if (lead.getStage() == null) {
            lead.setStage(LeadStage.NEW);
        }
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse updateLead(Long id, LeadRequest req) {
        Lead lead = leadRepository.findById(id).orElseThrow();
        mapRequestToEntity(req, lead);
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse updateLeadStatus(Long id, LeadStage stage, String disqualificationReason) {
        Lead lead = leadRepository.findById(id).orElseThrow();
        lead.setStage(stage);
        if (stage == LeadStage.QUALIFIED) {
            lead.setDisqualificationReason(null);
            if (lead.getScore() == null || lead.getScore() < 70) {
                lead.setScore(80);
            }
            log.info("Lead #{} qualified by admin", id);
        } else if (stage == LeadStage.DISQUALIFIED || stage == LeadStage.UNQUALIFIED) {
            lead.setStage(LeadStage.DISQUALIFIED);
            if (disqualificationReason != null && !disqualificationReason.isBlank()) {
                lead.setDisqualificationReason(disqualificationReason);
            }
            log.info("Lead #{} disqualified by admin. Reason: {}", id, disqualificationReason);
        }
        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse qualifyLead(Long id) {
        return updateLeadStatus(id, LeadStage.QUALIFIED, null);
    }

    @Transactional
    public LeadResponse disqualifyLead(Long id, String reason) {
        return updateLeadStatus(id, LeadStage.DISQUALIFIED, reason);
    }

    @Transactional
    public OpportunityResponse convertLead(Long id) {
        Lead lead = leadRepository.findById(id).orElseThrow();
        lead.setStage(LeadStage.CLOSED_WON);
        leadRepository.save(lead);

        Customer customer = new Customer();
        customer.setCustomerCode(String.format("CUS-%03d", customerRepository.count() + 1));
        customer.setName(lead.getCompany() != null ? lead.getCompany() : "Converted Lead Customer");
        customer.setContactPerson(lead.getContactName());
        customer.setPhone(lead.getPhone());
        customer.setEmail(lead.getEmail());
        customer.setCustomerType(CustomerType.PRIVATE);
        customer.setStatus(CustomerStatus.ACTIVE);
        customer.setCreditLimit(BigDecimal.ZERO);
        customer.setOutstandingBalance(BigDecimal.ZERO);
        customer.setTin("0000000000"); // default for converted
        customerRepository.save(customer);

        Opportunity opp = new Opportunity();
        opp.setOppCode(String.format("OPP-%d-%03d", LocalDate.now().getYear(), opportunityRepository.count() + 1));
        opp.setTitle("Converted from lead: " + lead.getCompany());
        opp.setCustomer(customer);
        opp.setStage(OpportunityStage.NEEDS_ANALYSIS);
        opp.setAmount(lead.getEstimatedValue() != null ? lead.getEstimatedValue() : BigDecimal.valueOf(100000));
        opp.setProbability(50);
        opp.setExpectedCloseDate(LocalDate.now().plusMonths(1));
        opp.setAssignedTo(lead.getAssignedTo());
        opportunityRepository.save(opp);

        return opportunityService.getOpportunityById(opp.getId());
    }

    public void deleteLead(Long id) {
        leadRepository.deleteById(id);
    }

    private void mapRequestToEntity(LeadRequest req, Lead lead) {
        lead.setCompany(req.getCompany());
        lead.setContactName(req.getContactName());
        lead.setPhone(req.getPhone());
        lead.setEmail(req.getEmail());
        if (req.getSource() != null) lead.setSource(req.getSource());
        if (req.getStage() != null) lead.setStage(req.getStage());
        lead.setScore(req.getScore() != null ? req.getScore() : 0);
        lead.setEstimatedValue(req.getEstimatedValue());
        lead.setAssignedTo(req.getAssignedTo());
        lead.setNotes(req.getNotes());
        if (req.getDisqualificationReason() != null) {
            lead.setDisqualificationReason(req.getDisqualificationReason());
        }
    }

    private LeadResponse mapToResponse(Lead lead) {
        return LeadResponse.builder()
                .id(lead.getId())
                .leadCode(lead.getLeadCode())
                .company(lead.getCompany())
                .contactName(lead.getContactName())
                .phone(lead.getPhone())
                .email(lead.getEmail())
                .source(lead.getSource() != null ? lead.getSource().name() : null)
                .stage(lead.getStage() != null ? lead.getStage().name() : null)
                .score(lead.getScore())
                .estimatedValue(lead.getEstimatedValue())
                .assignedTo(lead.getAssignedTo())
                .notes(lead.getNotes())
                .disqualificationReason(lead.getDisqualificationReason())
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();
    }
}
