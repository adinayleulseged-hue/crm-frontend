package com.insa.crm.service;
import com.insa.crm.dto.invoice.*;
import com.insa.crm.model.Invoice;
import com.insa.crm.model.enums.InvoiceStatus;
import com.insa.crm.repository.CustomerRepository;
import com.insa.crm.repository.InvoiceRepository;
import com.insa.crm.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service @RequiredArgsConstructor @Slf4j
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final SalesOrderRepository salesOrderRepository;
    
    public Page<InvoiceResponse> getAllInvoices(String q, InvoiceStatus status, Long customerId, Long salesOrderId, LocalDate dueFrom, LocalDate dueTo, Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(this::mapToResponse);
    }
    public InvoiceResponse getInvoiceById(Long id) {
        return mapToResponse(invoiceRepository.findById(id).orElseThrow());
    }
    public InvoiceResponse createInvoice(InvoiceRequest req) {
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(String.format("INV-%d-%03d", LocalDate.now().getYear(), invoiceRepository.count() + 1));
        mapRequestToEntity(req, invoice);
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setPaidAmount(BigDecimal.ZERO);
        return mapToResponse(invoiceRepository.save(invoice));
    }
    public InvoiceResponse updateInvoice(Long id, InvoiceRequest req) {
        Invoice invoice = invoiceRepository.findById(id).orElseThrow();
        mapRequestToEntity(req, invoice);
        return mapToResponse(invoiceRepository.save(invoice));
    }
    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }
    public String exportCsv(String q, InvoiceStatus status, Long customerId) {
        StringBuilder sb = new StringBuilder();
        sb.append("Invoice Number,Customer,Total Amount,Status\n");
        invoiceRepository.findAll().forEach(i -> {
            sb.append(i.getInvoiceNumber()).append(",").append(i.getCustomer().getName()).append(",")
              .append(i.getTotalAmount()).append(",").append(i.getStatus().name()).append("\n");
        });
        return sb.toString();
    }
    private void mapRequestToEntity(InvoiceRequest req, Invoice invoice) {
        if(req.getSalesOrderId() != null) invoice.setSalesOrder(salesOrderRepository.findById(req.getSalesOrderId()).orElse(null));
        invoice.setCustomer(customerRepository.findById(req.getCustomerId()).orElseThrow());
        invoice.setInvoiceDate(req.getInvoiceDate() != null ? req.getInvoiceDate() : LocalDate.now());
        invoice.setDueDate(req.getDueDate());
        invoice.setSubtotal(req.getSubtotal());
        invoice.setDiscountAmount(req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO);
        invoice.setTaxAmount(req.getSubtotal().multiply(new BigDecimal("0.15")));
        invoice.setTotalAmount(invoice.getSubtotal().add(invoice.getTaxAmount()).subtract(invoice.getDiscountAmount()));
        invoice.setBalanceAmount(invoice.getTotalAmount().subtract(invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO));
        invoice.setCurrency("ETB");
        invoice.setNotes(req.getNotes());
    }
    private InvoiceResponse mapToResponse(Invoice invoice) {
        return InvoiceResponse.builder().id(invoice.getId()).invoiceNumber(invoice.getInvoiceNumber())
            .salesOrderId(invoice.getSalesOrder() != null ? invoice.getSalesOrder().getId() : null)
            .salesOrderCode(invoice.getSalesOrder() != null ? invoice.getSalesOrder().getOrderCode() : null)
            .customerId(invoice.getCustomer().getId()).customerName(invoice.getCustomer().getName())
            .status(invoice.getStatus().name()).invoiceDate(invoice.getInvoiceDate()).dueDate(invoice.getDueDate())
            .subtotal(invoice.getSubtotal()).taxAmount(invoice.getTaxAmount()).discountAmount(invoice.getDiscountAmount())
            .totalAmount(invoice.getTotalAmount()).paidAmount(invoice.getPaidAmount()).balanceAmount(invoice.getBalanceAmount())
            .currency(invoice.getCurrency()).notes(invoice.getNotes())
            .createdAt(invoice.getCreatedAt()).updatedAt(invoice.getUpdatedAt()).build();
    }
}

