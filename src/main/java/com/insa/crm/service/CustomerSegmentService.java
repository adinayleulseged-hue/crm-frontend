package com.insa.crm.service;
import com.insa.crm.dto.segment.*;
import com.insa.crm.model.CustomerSegment;
import com.insa.crm.repository.CustomerSegmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service @RequiredArgsConstructor @Slf4j
public class CustomerSegmentService {
    private final CustomerSegmentRepository customerSegmentRepository;
    
    public Page<CustomerSegment> getAllSegments(Pageable pageable) {
        return customerSegmentRepository.findAll(pageable);
    }
    public CustomerSegment createSegment(SegmentRequest req) {
        CustomerSegment seg = new CustomerSegment();
        seg.setName(req.getName());
        seg.setCategory(req.getCategory());
        seg.setDescription(req.getDescription());
        seg.setCustomerCount(0);
        seg.setTotalPipelineValue(BigDecimal.ZERO);
        return customerSegmentRepository.save(seg);
    }
}

