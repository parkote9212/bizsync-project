package com.bizsync.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.dto.request.MemberInviteRequestDTO;
import com.bizsync.backend.dto.request.ProjectCreateRequestDTO;
import com.bizsync.backend.dto.response.ApiResponse;
import com.bizsync.backend.dto.response.ProjectListResponseDTO;
import com.bizsync.backend.dto.response.ProjectMemberResponseDTO;
import com.bizsync.backend.dto.response.kanban.ProjectBoardDTO;
import com.bizsync.backend.service.ProjectMemberService;
import com.bizsync.backend.service.ProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMemberService projectMemberService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createProject(
            @Valid @RequestBody ProjectCreateRequestDTO dto) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        projectService.createProject(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("프로젝트 생성 성공!"));
    }

    @GetMapping("/{projectId}/board")
    public ResponseEntity<ApiResponse<ProjectBoardDTO>> getProjectBoard(@PathVariable Long projectId) {
        ProjectBoardDTO board = projectService.getProjectBoard(projectId);
        return ResponseEntity.ok(ApiResponse.success(board));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectListResponseDTO>>> getProjectList() {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(projectService.getMyProjects(userId)));
    }

    @PostMapping("/{projectId}/invite")
    public ResponseEntity<ApiResponse<Void>> inviteMember(
            @PathVariable Long projectId,
            @RequestBody @Valid MemberInviteRequestDTO dto) {
        projectMemberService.inviteMember(projectId, dto.email());
        return ResponseEntity.ok(ApiResponse.success("멤버 초대가 완료되었습니다."));
    }

    @PatchMapping("/{projectId}/complete")
    public ResponseEntity<ApiResponse<Void>> completeProject(@PathVariable Long projectId) {
        projectService.completeProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("프로젝트가 완료되었습니다."));
    }

    @PatchMapping("/{projectId}/reopen")
    public ResponseEntity<ApiResponse<Void>> reopenProject(@PathVariable Long projectId) {
        projectService.reopenProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("프로젝트를 재진행합니다."));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> updateProject(
            @PathVariable Long projectId,
            @Valid @RequestBody com.bizsync.backend.dto.request.ProjectUpdateRequestDTO dto) {
        projectService.updateProject(projectId, dto);
        return ResponseEntity.ok(ApiResponse.success("프로젝트가 수정되었습니다."));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("프로젝트가 삭제되었습니다."));
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponseDTO>>> getProjectMembers(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(projectMemberService.getProjectMembers(projectId)));
    }

    @PatchMapping("/{projectId}/members/{memberId}/role")
    public ResponseEntity<ApiResponse<Void>> updateMemberRole(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        projectMemberService.updateMemberRole(projectId, memberId, newRole);
        return ResponseEntity.ok(ApiResponse.success("멤버 권한이 변경되었습니다."));
    }

    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long memberId) {
        projectMemberService.removeMember(projectId, memberId);
        return ResponseEntity.ok(ApiResponse.success("멤버가 삭제되었습니다."));
    }

}
