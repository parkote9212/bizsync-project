package com.bizsync.backend.domain.user.controller;

import com.bizsync.backend.domain.user.dto.response.UserSummaryDTO;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserRepository;
import com.bizsync.backend.global.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 사용자 관련 REST API 컨트롤러
 *
 * <p>사용자 목록 조회 및 검색 API를 제공합니다.
 *
 * @author BizSync Team
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * 전체 사용자 목록을 조회합니다.
     *
     * @return 사용자 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserSummaryDTO> userList = users.stream()
                .map(UserSummaryDTO::from)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(userList));
    }

    /**
     * 키워드로 사용자를 검색합니다.
     *
     * @param keyword 검색 키워드 (이름 또는 이메일)
     * @return 검색된 사용자 목록
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> searchUsers(@RequestParam String keyword) {
        List<User> users = userRepository.findByNameContainingOrEmailContaining(keyword, keyword);
        List<UserSummaryDTO> userList = users.stream()
                .map(UserSummaryDTO::from)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(userList));
    }
}
