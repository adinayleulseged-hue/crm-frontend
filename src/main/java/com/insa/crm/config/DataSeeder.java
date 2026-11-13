package com.insa.crm.config;

import com.insa.crm.model.*;
import com.insa.crm.model.enums.*;
import com.insa.crm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final OpportunityRepository opportunityRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;
        
        log.info("Seeding users...");
        User admin = new User(); admin.setUsername("admin"); admin.setPassword(passwordEncoder.encode("admin123")); admin.setRole(UserRole.ADMIN); admin.setName("System Administrator"); admin.setEmail("admin@insa.gov.et"); userRepository.save(admin);
        User sManager = new User(); sManager.setUsername("sales.manager"); sManager.setPassword(passwordEncoder.encode("password123")); sManager.setRole(UserRole.SALES_MANAGER); sManager.setName("Abebe Kebede"); sManager.setEmail("abebe@insa.gov.et"); userRepository.save(sManager);
        User sRep = new User(); sRep.setUsername("sales.rep"); sRep.setPassword(passwordEncoder.encode("password123")); sRep.setRole(UserRole.SALES_REP); sRep.setName("Tigist Haile"); sRep.setEmail("tigist@insa.gov.et"); userRepository.save(sRep);
        User aMgr = new User(); aMgr.setUsername("account.mgr"); aMgr.setPassword(passwordEncoder.encode("password123")); aMgr.setRole(UserRole.ACCOUNT_MANAGER); aMgr.setName("Dawit Mekonnen"); aMgr.setEmail("dawit@insa.gov.et"); userRepository.save(aMgr);
        User mOff = new User(); mOff.setUsername("marketing"); mOff.setPassword(passwordEncoder.encode("password123")); mOff.setRole(UserRole.MARKETING_OFFICER); mOff.setName("Sara Tadesse"); mOff.setEmail("sara@insa.gov.et"); userRepository.save(mOff);
        User aud = new User(); aud.setUsername("auditor"); aud.setPassword(passwordEncoder.encode("password123")); aud.setRole(UserRole.AUDITOR); aud.setName("Yohannes Girma"); aud.setEmail("yohannes@insa.gov.et"); userRepository.save(aud);
        
        log.info("Seeding customers...");
        Customer c1 = new Customer(); c1.setCustomerCode("CUS-001"); c1.setName("Ministry of Finance"); c1.setTin("0000000001"); c1.setCustomerType(CustomerType.GOVERNMENT); c1.setCity("Addis Ababa"); c1.setStatus(CustomerStatus.ACTIVE); c1.setCreditLimit(BigDecimal.ZERO); c1.setOutstandingBalance(BigDecimal.ZERO); customerRepository.save(c1);
        Customer c2 = new Customer(); c2.setCustomerCode("CUS-002"); c2.setName("Ethiopian Airlines Group"); c2.setTin("0000000002"); c2.setCustomerType(CustomerType.STATE_ENTERPRISE); c2.setCity("Addis Ababa"); c2.setStatus(CustomerStatus.ACTIVE); c2.setCreditLimit(BigDecimal.ZERO); c2.setOutstandingBalance(BigDecimal.ZERO); customerRepository.save(c2);
        Customer c3 = new Customer(); c3.setCustomerCode("CUS-003"); c3.setName("Commercial Bank of Ethiopia"); c3.setTin("0000000003"); c3.setCustomerType(CustomerType.STATE_ENTERPRISE); c3.setCity("Addis Ababa"); c3.setStatus(CustomerStatus.ACTIVE); c3.setCreditLimit(BigDecimal.ZERO); c3.setOutstandingBalance(BigDecimal.ZERO); customerRepository.save(c3);
        Customer c4 = new Customer(); c4.setCustomerCode("CUS-004"); c4.setName("Ethio Telecom"); c4.setTin("0000000004"); c4.setCustomerType(CustomerType.STATE_ENTERPRISE); c4.setCity("Addis Ababa"); c4.setStatus(CustomerStatus.ACTIVE); c4.setCreditLimit(BigDecimal.ZERO); c4.setOutstandingBalance(BigDecimal.ZERO); customerRepository.save(c4);
        Customer c5 = new Customer(); c5.setCustomerCode("CUS-005"); c5.setName("Safaricom Ethiopia"); c5.setTin("0000000005"); c5.setCustomerType(CustomerType.PRIVATE); c5.setCity("Addis Ababa"); c5.setStatus(CustomerStatus.ACTIVE); c5.setCreditLimit(BigDecimal.ZERO); c5.setOutstandingBalance(BigDecimal.ZERO); customerRepository.save(c5);
        
        log.info("Seeding products...");
        Product prod1 = Product.builder().productCode("PRD-2025-001").name("INSA Enterprise Shield Firewall").category(ProductCategory.SECURITY_HARDWARE).description("High-performance next-generation hardware security appliance.").unitPrice(new BigDecimal("450000")).sku("SKU-HW-101").stockQuantity(15).status(ProductStatus.ACTIVE).build();
        Product prod2 = Product.builder().productCode("PRD-2025-002").name("Biometric Multi-Factor Terminal").category(ProductCategory.SECURITY_HARDWARE).description("Advanced facial and fingerprint access control hardware.").unitPrice(new BigDecimal("120000")).sku("SKU-HW-102").stockQuantity(30).status(ProductStatus.ACTIVE).build();
        Product prod3 = Product.builder().productCode("PRD-2025-003").name("INSA ERP Software License (Annual)").category(ProductCategory.ENTERPRISE_ERP).description("Comprehensive Enterprise Resource Planning software subscription for state enterprises.").unitPrice(new BigDecimal("850000")).sku("SKU-SW-201").stockQuantity(100).status(ProductStatus.ACTIVE).build();
        Product prod4 = Product.builder().productCode("PRD-2025-004").name("Cybersecurity Vulnerability Audit Package").category(ProductCategory.CYBERSECURITY_AUDIT).description("Full organizational penetration testing and infrastructure security assessment.").unitPrice(new BigDecimal("320000")).sku("SKU-SV-301").stockQuantity(50).status(ProductStatus.ACTIVE).build();
        productRepository.save(prod1); productRepository.save(prod2); productRepository.save(prod3); productRepository.save(prod4);

        log.info("Seeding notifications...");
        Notification n1 = Notification.builder().recipientUsername("admin").title("New Lead Contact Inquiry").message("National Bank of Ethiopia submitted a service inquiry via public contact form.").type(NotificationType.LEAD_CREATED).readStatus(false).relatedEntityType("LEAD").relatedEntityId(7L).build();
        Notification n2 = Notification.builder().recipientUsername("admin").title("Invoice Payment Received").message("Ethiopian Airlines paid Invoice #INV-2023-002 (ETB 138,000).").type(NotificationType.INVOICE_PAID).readStatus(false).relatedEntityType("INVOICE").relatedEntityId(2L).build();
        Notification n3 = Notification.builder().recipientUsername("admin").title("Sales Order Pending Approval").message("Sales Order #SO-2023-001 requires management sign-off.").type(NotificationType.ORDER_APPROVAL).readStatus(true).relatedEntityType("ORDER").relatedEntityId(1L).build();
        notificationRepository.save(n1); notificationRepository.save(n2); notificationRepository.save(n3);

        log.info("Seeding leads...");
        Lead l1 = new Lead(); l1.setLeadCode("LED-2023-001"); l1.setCompany("Awash Bank"); l1.setContactName("Samuel"); l1.setStage(LeadStage.NEW); l1.setSource(LeadSource.WEBSITE); leadRepository.save(l1);
        Lead l2 = new Lead(); l2.setLeadCode("LED-2023-002"); l2.setCompany("Oromia Bank"); l2.setContactName("Kebede"); l2.setStage(LeadStage.QUALIFIED); l2.setSource(LeadSource.REFERRAL); leadRepository.save(l2);
        Lead l3 = new Lead(); l3.setLeadCode("LED-2023-003"); l3.setCompany("Dashen Bank"); l3.setContactName("Bekele"); l3.setStage(LeadStage.PROPOSAL); l3.setSource(LeadSource.DIRECT); leadRepository.save(l3);
        
        log.info("Seeding opportunities...");
        Opportunity o1 = new Opportunity(); o1.setOppCode("OPP-2023-001"); o1.setTitle("ERP Implementation"); o1.setCustomer(c1); o1.setStage(OpportunityStage.PROPOSAL); o1.setAmount(new BigDecimal("500000")); o1.setExpectedCloseDate(LocalDate.now().plusDays(30)); opportunityRepository.save(o1);
        Opportunity o2 = new Opportunity(); o2.setOppCode("OPP-2023-002"); o2.setTitle("Network Security"); o2.setCustomer(c2); o2.setStage(OpportunityStage.NEGOTIATION); o2.setAmount(new BigDecimal("1200000")); o2.setExpectedCloseDate(LocalDate.now().plusDays(15)); opportunityRepository.save(o2);
        
        log.info("Seeding sales orders & items...");
        SalesOrder so1 = new SalesOrder(); so1.setOrderCode("SO-2023-001"); so1.setCustomer(c1); so1.setOrderDate(LocalDate.now()); so1.setStatus(OrderStatus.CONFIRMED); so1.setTotalAmount(new BigDecimal("50000")); salesOrderRepository.save(so1);
        SalesOrder so2 = new SalesOrder(); so2.setOrderCode("SO-2023-002"); so2.setCustomer(c2); so2.setOrderDate(LocalDate.now()); so2.setStatus(OrderStatus.DELIVERED); so2.setTotalAmount(new BigDecimal("120000")); salesOrderRepository.save(so2);
        
        log.info("Seeding invoices...");
        Invoice inv1 = new Invoice(); inv1.setInvoiceNumber("INV-2023-001"); inv1.setCustomer(c1); inv1.setSalesOrder(so1); inv1.setStatus(InvoiceStatus.SENT); inv1.setSubtotal(new BigDecimal("50000")); inv1.setTaxAmount(new BigDecimal("7500")); inv1.setTotalAmount(new BigDecimal("57500")); inv1.setBalanceAmount(new BigDecimal("57500")); inv1.setPaidAmount(BigDecimal.ZERO); inv1.setCurrency("ETB"); invoiceRepository.save(inv1);
        Invoice inv2 = new Invoice(); inv2.setInvoiceNumber("INV-2023-002"); inv2.setCustomer(c2); inv2.setSalesOrder(so2); inv2.setStatus(InvoiceStatus.PAID); inv2.setSubtotal(new BigDecimal("120000")); inv2.setTaxAmount(new BigDecimal("18000")); inv2.setTotalAmount(new BigDecimal("138000")); inv2.setBalanceAmount(BigDecimal.ZERO); inv2.setPaidAmount(new BigDecimal("138000")); inv2.setCurrency("ETB"); invoiceRepository.save(inv2);
        
        log.info("Seeding payments...");
        Payment p1 = new Payment(); p1.setPaymentNumber("PAY-2023-001"); p1.setCustomer(c2); p1.setInvoice(inv2); p1.setAmount(new BigDecimal("138000")); p1.setPaymentMethod(PaymentMethod.BANK_TRANSFER); p1.setStatus(PaymentStatus.COMPLETED); p1.setPaymentDate(LocalDate.now()); paymentRepository.save(p1);
        log.info("Seeding complete.");
    }
}
