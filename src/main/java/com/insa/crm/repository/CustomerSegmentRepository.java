package com.insa.crm.repository;

import com.insa.crm.model.CustomerSegment;
import com.insa.crm.model.enums.SegmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerSegmentRepository extends JpaRepository<CustomerSegment, Long>, JpaSpecificationExecutor<CustomerSegment> {
    List<CustomerSegment> findByCategory(SegmentCategory category);
}
