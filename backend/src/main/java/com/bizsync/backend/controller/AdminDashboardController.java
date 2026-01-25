package com.bizsync.backend.controller;

import com.bizsync.backend.dto.response.AdminDashboardStatisticsDTO;
import com.bizsync.backend.dto.response.ApiResponse;
import com.bizsync.backend.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 관리자 대시보드 REST API 컨트롤러
 * 
 * <p>관리자 대시보드 통계 정보 조회 API를 제공합니다.
 * ADMIN 권한이 필요합니다.
 * 
 * @author BizSync Team
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    /**
     * 관리자 대시보드 통계 정보를 조회합니다.
     * 
     * @return 대시보드 통계 정보
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AdminDashboardStatisticsDTO>> getDashboardStatistics() {
        return ResponseEntity.ok(ApiResponse.success(adminDashboardService.getDashboardStatistics()));
    }
}
