package com.insa.crm.service;
import com.insa.crm.model.User;
import com.insa.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow();
    }
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}

