package com.bizsync.backend.controller;

import com.bizsync.backend.domain.entity.AccountStatus;
import com.bizsync.backend.domain.entity.Role;
import com.bizsync.backend.dto.request.PasswordResetRequestDTO;
import com.bizsync.backend.dto.request.UserRoleUpdateRequestDTO;
import com.bizsync.backend.dto.response.AdminUserStatisticsDTO;
import com.bizsync.backend.dto.response.ApiResponse;
import com.bizsync.backend.dto.response.UserDetailResponseDTO;
import com.bizsync.backend.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDetailResponseDTO>>> getUserList(
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        Page<UserDetailResponseDTO> users = adminUserService.getUserList(status, role, keyword, pageable)
                .map(UserDetailResponseDTO::from);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserDetailResponseDTO>> getUserDetail(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
                UserDetailResponseDTO.from(adminUserService.getUserDetail(userId))
        ));
    }

    @PatchMapping("/{userId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveUser(@PathVariable Long userId) {
        adminUserService.approveUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 승인되었습니다."));
    }

    @PatchMapping("/{userId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectUser(@PathVariable Long userId) {
        adminUserService.rejectUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 거부되었습니다."));
    }

    @PatchMapping("/{userId}/suspend")
    public ResponseEntity<ApiResponse<Void>> suspendUser(@PathVariable Long userId) {
        adminUserService.suspendUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 정지되었습니다."));
    }

    @PatchMapping("/{userId}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long userId) {
        adminUserService.activateUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 활성화되었습니다."));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<Void>> changeUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleUpdateRequestDTO dto
    ) {
        adminUserService.changeUserRole(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("사용자 권한이 변경되었습니다."));
    }

    @PatchMapping("/{userId}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long userId,
            @Valid @RequestBody PasswordResetRequestDTO dto
    ) {
        adminUserService.resetPassword(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("비밀번호가 재설정되었습니다."));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminUserService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 삭제되었습니다."));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<AdminUserStatisticsDTO>> getStatistics() {
        AdminUserStatisticsDTO statistics = adminUserService.getStatistics();
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
}
