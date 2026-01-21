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

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * 전체 사용자 목록 조회 (조직도용)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<User> users = userRepository.findAll();

        // HashMap으로 명시적으로 생성
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

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("data", userList);
        response.put("message", null);

        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 검색 (이름 또는 이메일)
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchUsers(@RequestParam String keyword) {
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

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("data", userList);

        return ResponseEntity.ok(response);
    }
}
