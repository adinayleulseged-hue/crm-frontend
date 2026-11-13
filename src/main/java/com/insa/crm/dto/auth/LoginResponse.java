package com.insa.crm.dto.auth;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginResponse {
    private String token;
    @Builder.Default private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String name;
    private String role;
}
