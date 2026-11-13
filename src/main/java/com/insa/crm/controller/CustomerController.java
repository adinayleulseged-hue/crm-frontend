package com.insa.crm.controller;
import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.dto.customer.*;
import com.insa.crm.model.enums.CustomerStatus;
import com.insa.crm.model.enums.CustomerType;
import com.insa.crm.service.CustomerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/customers") @RequiredArgsConstructor @Slf4j @Tag(name="Customers")
public class CustomerController {
    private final CustomerService customerService;
    
    @GetMapping("/")
    public ResponseEntity<ApiResponse<PageResponse<CustomerResponse>>> getAllCustomers(
            @RequestParam(required=false) String search, @RequestParam(required=false) CustomerType type,
            @RequestParam(required=false) CustomerStatus status, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(customerService.getAllCustomers(search, type, status, pageable))));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerById(id)));
    }
    @PostMapping("/")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CustomerRequest req) {
        return ResponseEntity.ok(ApiResponse.success(customerService.createCustomer(req)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerRequest req) {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateCustomer(id, req)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

