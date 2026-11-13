package com.insa.crm.controller;
import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.dto.invoice.*;
import com.insa.crm.model.enums.InvoiceStatus;
import com.insa.crm.service.InvoiceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import org.springframework.http.MediaType;

@RestController @RequestMapping("/api/invoices") @RequiredArgsConstructor @Slf4j @Tag(name="Invoices")
public class InvoiceController {
    private final InvoiceService invoiceService;
    
    @GetMapping("/")
    public ResponseEntity<ApiResponse<PageResponse<InvoiceResponse>>> getAllInvoices(
            @RequestParam(required=false) String q, @RequestParam(required=false) InvoiceStatus status,
            @RequestParam(required=false) Long customerId, @RequestParam(required=false) Long salesOrderId,
            @RequestParam(required=false) LocalDate dueFrom, @RequestParam(required=false) LocalDate dueTo, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(invoiceService.getAllInvoices(q, status, customerId, salesOrderId, dueFrom, dueTo, pageable))));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceById(id)));
    }
    @PostMapping("/")
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(@Valid @RequestBody InvoiceRequest req) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.createInvoice(req)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> updateInvoice(@PathVariable Long id, @Valid @RequestBody InvoiceRequest req) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.updateInvoice(id, req)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    @GetMapping(value = "/export.csv", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> exportCsv(
            @RequestParam(required=false) String q, @RequestParam(required=false) InvoiceStatus status, @RequestParam(required=false) Long customerId) {
        return ResponseEntity.ok(invoiceService.exportCsv(q, status, customerId));
    }
}

