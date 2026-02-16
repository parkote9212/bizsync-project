package com.bizsync.backend.domain.user.controller;

import com.bizsync.backend.domain.user.dto.request.PasswordChangeRequestDTO;
import com.bizsync.backend.domain.user.dto.response.UserDetailResponseDTO;
import com.bizsync.backend.domain.user.dto.response.UserSummaryDTO;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserRepository;
import com.bizsync.backend.domain.user.service.UserService;
import com.bizsync.backend.global.common.dto.ApiResponse;
import com.bizsync.backend.global.security.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
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
    private final UserService userService;

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

    /**
     * 현재 로그인한 사용자의 상세 정보를 조회합니다.
     *
     * @return 현재 사용자 상세 정보
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDetailResponseDTO>> getCurrentUser() {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        UserDetailResponseDTO userDetail = userService.getUserDetail(userId);
        return ResponseEntity.ok(ApiResponse.success(userDetail));
    }

    /**
     * 현재 사용자의 비밀번호를 변경합니다.
     *
     * @param dto 비밀번호 변경 요청 DTO
     * @return 성공 응답
     */
    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody PasswordChangeRequestDTO dto) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        userService.changePassword(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 현재 사용자의 OAuth 연동을 해제합니다.
     *
     * @return 성공 응답
     */
    @DeleteMapping("/me/oauth")
    public ResponseEntity<ApiResponse<Void>> unlinkOAuth() {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        userService.unlinkOAuth(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 현재 사용자 계정을 탈퇴합니다.
     *
     * @return 성공 응답
     */
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        userService.deleteAccount(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
