package com.insa.crm.model;

import com.insa.crm.model.enums.CustomerStatus;
import com.insa.crm.model.enums.CustomerType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers", uniqueConstraints = {
        @UniqueConstraint(columnNames = "customerCode"),
        @UniqueConstraint(columnNames = "tin")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String customerCode;

    private String name;

    @Column(length = 10)
    private String tin;

    @Enumerated(EnumType.STRING)
    private CustomerType customerType;

    private String contactPerson;
    private String phone;
    private String email;
    private String city;
    private String address;

    @Builder.Default
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal outstandingBalance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CustomerStatus status = CustomerStatus.ACTIVE;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
