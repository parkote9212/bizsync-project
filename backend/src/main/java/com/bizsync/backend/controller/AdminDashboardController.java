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

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminDashboardStatisticsDTO>> getDashboardStatistics() {
        return ResponseEntity.ok(ApiResponse.success(adminDashboardService.getDashboardStatistics()));
    }
}
