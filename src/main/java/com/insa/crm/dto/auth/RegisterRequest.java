package com.insa.crm.dto.auth;
import jakarta.validation.constraints.*;
import com.insa.crm.model.enums.UserRole;
import lombok.Data;
@Data
public class RegisterRequest {
    @NotBlank private String username;
    @NotBlank @Email private String email;
    @NotBlank @Size(min=6) private String password;
    @NotBlank private String name;
    private UserRole role;
}

