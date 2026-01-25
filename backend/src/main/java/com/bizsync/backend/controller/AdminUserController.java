package com.bizsync.backend.controller;

import com.bizsync.backend.domain.entity.AccountStatus;
import com.bizsync.backend.domain.entity.Position;
import com.bizsync.backend.domain.entity.Role;
import com.bizsync.backend.dto.request.PasswordResetRequestDTO;
import com.bizsync.backend.dto.request.UserPositionUpdateRequestDTO;
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

/**
 * 관리자용 사용자 관리 REST API 컨트롤러
 *
 * <p>사용자 목록 조회, 승인/거부, 정지/활성화, 권한 변경 등의 API를 제공합니다.
 * ADMIN 권한이 필요합니다.
 *
 * @author BizSync Team
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * 사용자 목록을 조회합니다 (필터링 및 검색 지원).
     *
     * @param status   계정 상태 필터
     * @param role     사용자 권한 필터
     * @param position 사용자 직급 필터
     * @param keyword  검색 키워드
     * @param pageable 페이지 정보
     * @return 사용자 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDetailResponseDTO>>> getUserList(
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Position position,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        Page<UserDetailResponseDTO> users = adminUserService.getUserList(status, role, position, keyword, pageable)
                .map(UserDetailResponseDTO::from);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * 사용자 상세 정보를 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 사용자 상세 정보
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserDetailResponseDTO>> getUserDetail(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
                UserDetailResponseDTO.from(adminUserService.getUserDetail(userId))
        ));
    }

    /**
     * 사용자 계정을 승인합니다.
     *
     * @param userId 승인할 사용자 ID
     * @return 성공 응답
     */
    @PatchMapping("/{userId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveUser(@PathVariable Long userId) {
        adminUserService.approveUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 승인되었습니다."));
    }

    /**
     * 사용자 계정을 거부합니다.
     *
     * @param userId 거부할 사용자 ID
     * @return 성공 응답
     */
    @PatchMapping("/{userId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectUser(@PathVariable Long userId) {
        adminUserService.rejectUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 거부되었습니다."));
    }

    /**
     * 사용자 계정을 정지합니다.
     *
     * @param userId 정지할 사용자 ID
     * @return 성공 응답
     */
    @PatchMapping("/{userId}/suspend")
    public ResponseEntity<ApiResponse<Void>> suspendUser(@PathVariable Long userId) {
        adminUserService.suspendUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 정지되었습니다."));
    }

    /**
     * 사용자 계정을 활성화합니다.
     *
     * @param userId 활성화할 사용자 ID
     * @return 성공 응답
     */
    @PatchMapping("/{userId}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long userId) {
        adminUserService.activateUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 활성화되었습니다."));
    }

    /**
     * 사용자 권한을 변경합니다.
     *
     * @param userId 사용자 ID
     * @param dto    권한 변경 요청 DTO
     * @return 성공 응답
     */
    @PatchMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<Void>> changeUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleUpdateRequestDTO dto
    ) {
        adminUserService.changeUserRole(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("사용자 권한이 변경되었습니다."));
    }

    /**
     * 사용자 직급을 변경합니다.
     *
     * @param userId 사용자 ID
     * @param dto    직급 변경 요청 DTO
     * @return 성공 응답
     */
    @PatchMapping("/{userId}/position")
    public ResponseEntity<ApiResponse<Void>> changeUserPosition(
            @PathVariable Long userId,
            @Valid @RequestBody UserPositionUpdateRequestDTO dto
    ) {
        adminUserService.changeUserPosition(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("사용자 직급이 변경되었습니다."));
    }

    /**
     * 사용자 비밀번호를 재설정합니다.
     *
     * @param userId 사용자 ID
     * @param dto    비밀번호 재설정 요청 DTO
     * @return 성공 응답
     */
    @PatchMapping("/{userId}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long userId,
            @Valid @RequestBody PasswordResetRequestDTO dto
    ) {
        adminUserService.resetPassword(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("비밀번호가 재설정되었습니다."));
    }

    /**
     * 사용자를 삭제합니다 (소프트 삭제 - 상태를 DELETED로 변경).
     *
     * @param userId 삭제할 사용자 ID
     * @return 성공 응답
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminUserService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 삭제되었습니다."));
    }

    /**
     * 사용자 통계 정보를 조회합니다.
     *
     * @return 사용자 통계 정보
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<AdminUserStatisticsDTO>> getStatistics() {
        AdminUserStatisticsDTO statistics = adminUserService.getStatistics();
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
}
