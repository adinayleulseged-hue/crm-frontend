package com.insa.crm.controller;
import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.dto.segment.SegmentRequest;
import com.insa.crm.model.CustomerSegment;
import com.insa.crm.service.CustomerSegmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/segments") @RequiredArgsConstructor @Slf4j @Tag(name="Segments")
public class SegmentController {
    private final CustomerSegmentService customerSegmentService;
    
    @GetMapping("/")
    public ResponseEntity<ApiResponse<PageResponse<CustomerSegment>>> getAllSegments(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(customerSegmentService.getAllSegments(pageable))));
    }
    @PostMapping("/")
    public ResponseEntity<ApiResponse<CustomerSegment>> createSegment(@Valid @RequestBody SegmentRequest req) {
        return ResponseEntity.ok(ApiResponse.success(customerSegmentService.createSegment(req)));
    }
}

