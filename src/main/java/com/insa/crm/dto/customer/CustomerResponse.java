package com.insa.crm.dto.customer;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String customerCode;
    private String name;
    private String tin;
    private String customerType;
    private String contactPerson;
    private String phone;
    private String email;
    private String city;
    private String address;
    private BigDecimal creditLimit;
    private BigDecimal outstandingBalance;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
