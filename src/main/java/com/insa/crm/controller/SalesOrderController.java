package com.insa.crm.controller;
import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.dto.order.*;
import com.insa.crm.model.enums.OrderStatus;
import com.insa.crm.service.SalesOrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/sales-orders") @RequiredArgsConstructor @Slf4j @Tag(name="Sales Orders")
public class SalesOrderController {
    private final SalesOrderService salesOrderService;
    
    @GetMapping("/")
    public ResponseEntity<ApiResponse<PageResponse<SalesOrderResponse>>> getAllOrders(
            @RequestParam(required=false) String search, @RequestParam(required=false) OrderStatus status, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(salesOrderService.getAllOrders(search, status, pageable))));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(salesOrderService.getOrderById(id)));
    }
    @PostMapping("/")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> createOrder(@Valid @RequestBody SalesOrderRequest req) {
        return ResponseEntity.ok(ApiResponse.success(salesOrderService.createOrder(req)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> updateOrder(@PathVariable Long id, @Valid @RequestBody SalesOrderRequest req) {
        return ResponseEntity.ok(ApiResponse.success(salesOrderService.updateOrder(id, req)));
    }
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> approveOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(salesOrderService.approveOrder(id)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        salesOrderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

