package com.insa.crm.controller;
import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.dto.payment.*;
import com.insa.crm.model.enums.PaymentMethod;
import com.insa.crm.model.enums.PaymentStatus;
import com.insa.crm.service.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/payments") @RequiredArgsConstructor @Slf4j @Tag(name="Payments")
public class PaymentController {
    private final PaymentService paymentService;
    
    @GetMapping("/")
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getAllPayments(
            @RequestParam(required=false) String search, @RequestParam(required=false) PaymentMethod method,
            @RequestParam(required=false) PaymentStatus status, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(paymentService.getAllPayments(search, method, status, pageable))));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentById(id)));
    }
    @PostMapping("/")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(@Valid @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.createPayment(req)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> updatePayment(@PathVariable Long id, @Valid @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.updatePayment(id, req)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

