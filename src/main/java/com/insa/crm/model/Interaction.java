package com.insa.crm.model;

import com.insa.crm.model.enums.InteractionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "interactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Interaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private Long leadId;

    @Enumerated(EnumType.STRING)
    private InteractionType type;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String performedBy;
    private LocalDateTime date;
}
