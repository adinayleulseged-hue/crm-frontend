package com.insa.crm.service;
import com.insa.crm.dto.payment.*;
import com.insa.crm.model.Invoice;
import com.insa.crm.model.Payment;
import com.insa.crm.model.enums.InvoiceStatus;
import com.insa.crm.model.enums.PaymentMethod;
import com.insa.crm.model.enums.PaymentStatus;
import com.insa.crm.repository.CustomerRepository;
import com.insa.crm.repository.InvoiceRepository;
import com.insa.crm.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service @RequiredArgsConstructor @Slf4j
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    
    public Page<PaymentResponse> getAllPayments(String search, PaymentMethod method, PaymentStatus status, Pageable pageable) {
        return paymentRepository.findAll(pageable).map(this::mapToResponse);
    }
    public PaymentResponse getPaymentById(Long id) {
        return mapToResponse(paymentRepository.findById(id).orElseThrow());
    }
    public PaymentResponse createPayment(PaymentRequest req) {
        Invoice invoice = invoiceRepository.findById(req.getInvoiceId()).orElseThrow();
        if(req.getAmount().compareTo(invoice.getBalanceAmount()) > 0) {
            throw new RuntimeException("Payment amount exceeds balance");
        }
        Payment payment = new Payment();
        payment.setPaymentNumber(String.format("PAY-%d-%03d", LocalDate.now().getYear(), paymentRepository.count() + 1));
        payment.setInvoice(invoice);
        payment.setCustomer(customerRepository.findById(req.getCustomerId()).orElseThrow());
        payment.setPaymentMethod(req.getPaymentMethod());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setAmount(req.getAmount());
        payment.setPaymentDate(req.getPaymentDate() != null ? req.getPaymentDate() : LocalDate.now());
        payment.setTransactionReference(req.getTransactionReference());
        payment.setReceivedBy(req.getReceivedBy());
        payment.setNotes(req.getNotes());
        
        invoice.setPaidAmount(invoice.getPaidAmount().add(req.getAmount()));
        invoice.setBalanceAmount(invoice.getTotalAmount().subtract(invoice.getPaidAmount()));
        if(invoice.getBalanceAmount().compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            invoice.setStatus(InvoiceStatus.PENDING);
        }
        invoiceRepository.save(invoice);
        
        return mapToResponse(paymentRepository.save(payment));
    }
    public PaymentResponse updatePayment(Long id, PaymentRequest req) {
        Payment payment = paymentRepository.findById(id).orElseThrow();
        payment.setNotes(req.getNotes());
        return mapToResponse(paymentRepository.save(payment));
    }
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id).orElseThrow();
        Invoice invoice = payment.getInvoice();
        invoice.setPaidAmount(invoice.getPaidAmount().subtract(payment.getAmount()));
        invoice.setBalanceAmount(invoice.getTotalAmount().subtract(invoice.getPaidAmount()));
        invoice.setStatus(InvoiceStatus.PENDING);
        invoiceRepository.save(invoice);
        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);
    }
    private PaymentResponse mapToResponse(Payment p) {
        return PaymentResponse.builder().id(p.getId()).paymentNumber(p.getPaymentNumber())
            .invoiceId(p.getInvoice().getId()).invoiceNumber(p.getInvoice().getInvoiceNumber())
            .customerId(p.getCustomer().getId()).customerName(p.getCustomer().getName())
            .paymentMethod(p.getPaymentMethod().name()).status(p.getStatus().name())
            .amount(p.getAmount()).paymentDate(p.getPaymentDate()).transactionReference(p.getTransactionReference())
            .receivedBy(p.getReceivedBy()).notes(p.getNotes())
            .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt()).build();
    }
}

