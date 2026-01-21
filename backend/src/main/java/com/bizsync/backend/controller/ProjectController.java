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
import com.bizsync.backend.dto.response.ProjectListResponseDTO;
import com.bizsync.backend.dto.response.kanban.ProjectBoardDTO;
import com.bizsync.backend.service.ProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * 프로젝트 생성
     * <p>
     * SecurityUtil을 사용하여 현재 인증된 사용자 ID를 조회합니다.
     * Authentication 파라미터를 사용하는 것보다 더 깔끔하고 테스트하기 좋습니다.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> createProject(
            @Valid @RequestBody ProjectCreateRequestDTO dto) {
        // SecurityUtil로 현재 인증된 사용자 ID 조회
        // 인증되지 않은 경우 예외가 발생합니다 (Security Filter에서 이미 차단됨)
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();

        projectService.createProject(userId, dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "프로젝트 생성 성공!"));
    }

    /**
     * 프로젝트 칸반 보드 조회
     * GET /api/projects/{projectId}/board
     */
    @GetMapping("/{projectId}/board")
    public ResponseEntity<ProjectBoardDTO> getProjectBoard(@PathVariable Long projectId) {

        ProjectBoardDTO board = projectService.getProjectBoard(projectId);
        return ResponseEntity.ok(board);
    }

    /**
     * 내 프로젝트 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<ProjectListResponseDTO>> getProjectList() {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(projectService.getMyProjects(userId));
    }

    @PostMapping("/{projectId}/invite")
    public ResponseEntity<String> inviteMember(
            @PathVariable Long projectId,
            @RequestBody @Valid MemberInviteRequestDTO dto) {
        projectService.inviteMember(projectId, dto.email());
        return ResponseEntity.ok("멤버 초대가 완료되었습니다.");
    }

    /**
     * 프로젝트 완료 처리
     */
    @PatchMapping("/{projectId}/complete")
    public ResponseEntity<Map<String, String>> completeProject(@PathVariable Long projectId) {
        projectService.completeProject(projectId);
        return ResponseEntity.ok(Map.of("message", "프로젝트가 완료되었습니다."));
    }

    /**
     * 프로젝트 재진행 처리
     */
    @PatchMapping("/{projectId}/reopen")
    public ResponseEntity<Map<String, String>> reopenProject(@PathVariable Long projectId) {
        projectService.reopenProject(projectId);
        return ResponseEntity.ok(Map.of("message", "프로젝트를 재진행합니다."));
    }

    /**
     * 프로젝트 수정 (PL만)
     */
    @PutMapping("/{projectId}")
    public ResponseEntity<Map<String, String>> updateProject(
            @PathVariable Long projectId,
            @Valid @RequestBody com.bizsync.backend.dto.request.ProjectUpdateRequestDTO dto) {
        projectService.updateProject(projectId, dto);
        return ResponseEntity.ok(Map.of("message", "프로젝트가 수정되었습니다."));
    }

    /**
     * 프로젝트 삭제 (PL만)
     */
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(Map.of("message", "프로젝트가 삭제되었습니다."));
    }

    /**
     * 프로젝트 멤버 목록 조회
     */
    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<com.bizsync.backend.dto.response.ProjectMemberResponseDTO>> getProjectMembers(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectMembers(projectId));
    }

    /**
     * 멤버 권한 변경 (PL만)
     */
    @PatchMapping("/{projectId}/members/{memberId}/role")
    public ResponseEntity<Map<String, String>> updateMemberRole(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        projectService.updateMemberRole(projectId, memberId, newRole);
        return ResponseEntity.ok(Map.of("message", "멤버 권한이 변경되었습니다."));
    }

    /**
     * 멤버 삭제 (PL만)
     */
    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long memberId) {
        projectService.removeMember(projectId, memberId);
        return ResponseEntity.ok(Map.of("message", "멤버가 삭제되었습니다."));
    }

}
