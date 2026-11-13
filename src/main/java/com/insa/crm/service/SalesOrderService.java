package com.insa.crm.service;
import com.insa.crm.dto.order.*;
import com.insa.crm.model.SalesOrder;
import com.insa.crm.model.SalesOrderItem;
import com.insa.crm.model.enums.OrderStatus;
import com.insa.crm.repository.CustomerRepository;
import com.insa.crm.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class SalesOrderService {
    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;
    
    public Page<SalesOrderResponse> getAllOrders(String search, OrderStatus status, Pageable pageable) {
        return salesOrderRepository.findAll(pageable).map(this::mapToResponse);
    }
    public SalesOrderResponse getOrderById(Long id) {
        return mapToResponse(salesOrderRepository.findById(id).orElseThrow());
    }
    public SalesOrderResponse createOrder(SalesOrderRequest req) {
        SalesOrder order = new SalesOrder();
        order.setOrderCode(String.format("SO-%d-%03d", LocalDate.now().getYear(), salesOrderRepository.count() + 1));
        mapRequestToEntity(req, order);
        return mapToResponse(salesOrderRepository.save(order));
    }
    public SalesOrderResponse updateOrder(Long id, SalesOrderRequest req) {
        SalesOrder order = salesOrderRepository.findById(id).orElseThrow();
        order.getItems().clear();
        mapRequestToEntity(req, order);
        return mapToResponse(salesOrderRepository.save(order));
    }
    public SalesOrderResponse approveOrder(Long id) {
        SalesOrder order = salesOrderRepository.findById(id).orElseThrow();
        order.setStatus(OrderStatus.CONFIRMED);
        return mapToResponse(salesOrderRepository.save(order));
    }
    public void deleteOrder(Long id) {
        salesOrderRepository.deleteById(id);
    }
    private void mapRequestToEntity(SalesOrderRequest req, SalesOrder order) {
        order.setQuotationRef(req.getQuotationRef());
        order.setCustomer(customerRepository.findById(req.getCustomerId()).orElseThrow());
        order.setOrderDate(req.getOrderDate() != null ? req.getOrderDate() : LocalDate.now());
        order.setDeliveryDate(req.getDeliveryDate());
        order.setStatus(req.getStatus() != null ? req.getStatus() : OrderStatus.DRAFT);
        order.setAssignedTo(req.getAssignedTo());
        order.setNotes(req.getNotes());
        if(order.getItems() == null) order.setItems(new ArrayList<>());
        BigDecimal total = BigDecimal.ZERO;
        if(req.getItems() != null) {
            for(SalesOrderItemRequest itemReq : req.getItems()) {
                SalesOrderItem item = new SalesOrderItem();
                item.setSalesOrder(order);
                item.setItemDescription(itemReq.getItemDescription());
                item.setQuantity(itemReq.getQuantity());
                item.setUnitPrice(itemReq.getUnitPrice());
                item.setTotalPrice(itemReq.getUnitPrice().multiply(new BigDecimal(itemReq.getQuantity())));
                total = total.add(item.getTotalPrice());
                order.getItems().add(item);
            }
        }
        order.setTotalAmount(total);
    }
    private SalesOrderResponse mapToResponse(SalesOrder order) {
        return SalesOrderResponse.builder().id(order.getId()).orderCode(order.getOrderCode())
            .quotationRef(order.getQuotationRef()).customerId(order.getCustomer().getId()).customerName(order.getCustomer().getName())
            .orderDate(order.getOrderDate()).deliveryDate(order.getDeliveryDate()).totalAmount(order.getTotalAmount())
            .status(order.getStatus().name()).assignedTo(order.getAssignedTo()).notes(order.getNotes())
            .items(order.getItems().stream().map(i -> SalesOrderItemResponse.builder().id(i.getId())
                .itemDescription(i.getItemDescription()).quantity(i.getQuantity()).unitPrice(i.getUnitPrice())
                .totalPrice(i.getTotalPrice()).build()).collect(Collectors.toList()))
            .createdAt(order.getCreatedAt()).updatedAt(order.getUpdatedAt()).build();
    }
}

