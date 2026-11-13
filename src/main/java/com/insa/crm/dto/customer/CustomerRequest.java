package com.insa.crm.dto.customer;
import jakarta.validation.constraints.*;
import com.insa.crm.model.enums.CustomerType;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class CustomerRequest {
    @NotBlank private String name;
    @NotBlank @Size(min=10, max=10) private String tin;
    @NotNull private CustomerType customerType;
    private String contactPerson;
    private String phone;
    @Email private String email;
    private String city;
    private String address;
    private BigDecimal creditLimit;
}

