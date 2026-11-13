package com.insa.crm.service;
import com.insa.crm.dto.auth.*;
import com.insa.crm.model.User;
import com.insa.crm.repository.UserRepository;
import com.insa.crm.model.enums.AuditModule;
import com.insa.crm.model.enums.AuditAction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor @Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    // Assume a JWT util exists, or we mock token generation for this scope
    public LoginResponse login(LoginRequest req) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        User user = userRepository.findByUsername(req.getUsername()).orElseThrow();
        String token = "dummy-jwt-token-for-" + user.getUsername(); // To be replaced with actual JwtService
        auditLogService.createAuditLog(AuditModule.AUTH, AuditAction.LOGIN, "User logged in", user.getUsername(), user.getRole().name(), "127.0.0.1");
        return LoginResponse.builder().token(token).id(user.getId()).username(user.getUsername()).email(user.getEmail()).name(user.getName()).role(user.getRole().name()).build();
    }
    public LoginResponse register(RegisterRequest req) {
        if(userRepository.existsByUsername(req.getUsername())) throw new RuntimeException("Username exists");
        if(userRepository.existsByEmail(req.getEmail())) throw new RuntimeException("Email exists");
        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setName(req.getName());
        user.setRole(req.getRole());
        userRepository.save(user);
        auditLogService.createAuditLog(AuditModule.AUTH, AuditAction.CREATE, "User registered", req.getUsername(), req.getRole().name(), "127.0.0.1");
        return login(new LoginRequest(req.getUsername(), req.getPassword()));
    }
    public User getCurrentUser(String username) {
        return userRepository.findByUsername(username).orElseThrow();
    }
}

