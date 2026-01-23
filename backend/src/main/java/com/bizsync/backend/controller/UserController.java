package com.bizsync.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        List<User> users = userRepository.findAll();

        List<Map<String, Object>> userList = users.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("userId", user.getUserId());
                    userMap.put("name", user.getName());
                    userMap.put("email", user.getEmail());
                    userMap.put("department", user.getDepartment() != null ? user.getDepartment() : "");
                    userMap.put("role", user.getRole().name());
                    userMap.put("position", user.getPosition() != null ? user.getPosition().getKorean() : "");
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(userList));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchUsers(@RequestParam String keyword) {
        List<User> users = userRepository.findByNameContainingOrEmailContaining(keyword, keyword);

        List<Map<String, Object>> userList = users.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("userId", user.getUserId());
                    userMap.put("name", user.getName());
                    userMap.put("email", user.getEmail());
                    userMap.put("department", user.getDepartment() != null ? user.getDepartment() : "");
                    userMap.put("position", user.getPosition() != null ? user.getPosition().getKorean() : "");
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(userList));
    }
}
