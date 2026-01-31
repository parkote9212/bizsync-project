package com.bizsync.backend.controller;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.dto.request.MemberInviteRequestDTO;
import com.bizsync.backend.dto.request.ProjectCreateRequestDTO;
import com.bizsync.backend.dto.request.ProjectUpdateRequestDTO;
import com.bizsync.backend.dto.response.ApiResponse;
import com.bizsync.backend.dto.response.ProjectListResponseDTO;
import com.bizsync.backend.dto.response.ProjectMemberResponseDTO;
import com.bizsync.backend.dto.response.kanban.ProjectBoardDTO;
import com.bizsync.backend.service.ProjectMemberService;
import com.bizsync.backend.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 프로젝트 관련 REST API 컨트롤러
 *
 * <p>프로젝트 생성, 수정, 삭제, 조회 등의 API를 제공합니다.
 *
 * @author BizSync Team
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMemberService projectMemberService;

    /**
     * 새로운 프로젝트를 생성합니다.
     *
     * @param dto 프로젝트 생성 요청 DTO
     * @return 성공 응답
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createProject(
            @Valid @RequestBody ProjectCreateRequestDTO dto) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        projectService.createProject(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("프로젝트 생성 성공!"));
    }

    /**
     * 프로젝트 칸반 보드 정보를 조회합니다.
     *
     * @param projectId 프로젝트 ID
     * @return 프로젝트 보드 정보
     */
    @GetMapping("/{projectId}/board")
    public ResponseEntity<ApiResponse<ProjectBoardDTO>> getProjectBoard(@PathVariable Long projectId) {
        ProjectBoardDTO board = projectService.getProjectBoard(projectId);
        return ResponseEntity.ok(ApiResponse.success(board));
    }

    /**
     * 사용자가 참여한 프로젝트 목록을 조회합니다.
     *
     * @return 프로젝트 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectListResponseDTO>>> getProjectList() {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(projectService.getMyProjects(userId)));
    }

    /**
     * 프로젝트 단건 조회
     */
    @GetMapping("/{id}")
    @Operation(summary = "프로젝트 단건 조회", description = "프로젝트 ID로 상세 정보 조회 (Redis 캐싱)")
    public ResponseEntity<ApiResponse<Project>> getProject(@PathVariable Long id) {
        Project project = projectService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(project));
    }

    /**
     * 프로젝트에 멤버를 초대합니다.
     *
     * @param projectId 프로젝트 ID
     * @param dto       멤버 초대 요청 DTO
     * @return 성공 응답
     */
    @PostMapping("/{projectId}/invite")
    public ResponseEntity<ApiResponse<Void>> inviteMember(
            @PathVariable Long projectId,
            @RequestBody @Valid MemberInviteRequestDTO dto) {
        projectMemberService.inviteMember(projectId, dto.email());
        return ResponseEntity.ok(ApiResponse.success("멤버 초대가 완료되었습니다."));
    }

    /**
     * 기획중인 프로젝트를 진행중 상태로 변경합니다.
     *
     * @param projectId 프로젝트 ID
     * @return 성공 응답
     */
    @PatchMapping("/{projectId}/start")
    public ResponseEntity<ApiResponse<Void>> startProject(@PathVariable Long projectId) {
        projectService.startProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("프로젝트가 진행되었습니다."));
    }

    /**
     * 프로젝트를 완료 상태로 변경합니다.
     *
     * @param projectId 프로젝트 ID
     * @return 성공 응답
     */
    @PatchMapping("/{projectId}/complete")
    public ResponseEntity<ApiResponse<Void>> completeProject(@PathVariable Long projectId) {
        projectService.completeProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("프로젝트가 완료되었습니다."));
    }

    /**
     * 프로젝트를 재진행 상태로 변경합니다.
     *
     * @param projectId 프로젝트 ID
     * @return 성공 응답
     */
    @PatchMapping("/{projectId}/reopen")
    public ResponseEntity<ApiResponse<Void>> reopenProject(@PathVariable Long projectId) {
        projectService.reopenProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("프로젝트를 재진행합니다."));
    }

    /**
     * 프로젝트 정보를 수정합니다.
     *
     * @param projectId 프로젝트 ID
     * @param dto       프로젝트 수정 요청 DTO
     * @return 성공 응답
     */
    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> updateProject(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectUpdateRequestDTO dto) {
        projectService.updateProject(projectId, dto);
        return ResponseEntity.ok(ApiResponse.success("프로젝트가 수정되었습니다."));
    }

    /**
     * 프로젝트를 삭제합니다 (소프트 삭제).
     *
     * <p>프로젝트 상태를 취소(CANCELLED)로 변경하여 소프트 삭제를 수행합니다.
     * 관련 데이터는 유지되며, 통계에 반영됩니다.
     *
     * @param projectId 프로젝트 ID
     * @return 성공 응답
     */
    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("프로젝트가 삭제되었습니다."));
    }

    /**
     * 프로젝트 멤버 목록을 조회합니다.
     *
     * @param projectId 프로젝트 ID
     * @return 프로젝트 멤버 목록
     */
    @GetMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponseDTO>>> getProjectMembers(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(projectMemberService.getProjectMembers(projectId)));
    }

    /**
     * 프로젝트 멤버의 권한을 변경합니다.
     *
     * @param projectId 프로젝트 ID
     * @param memberId  멤버 ID
     * @param request   권한 변경 요청 (role 필드 포함)
     * @return 성공 응답
     */
    @PatchMapping("/{projectId}/members/{memberId}/role")
    public ResponseEntity<ApiResponse<Void>> updateMemberRole(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        projectMemberService.updateMemberRole(projectId, memberId, newRole);
        return ResponseEntity.ok(ApiResponse.success("멤버 권한이 변경되었습니다."));
    }

    /**
     * 프로젝트에서 멤버를 제거합니다.
     *
     * @param projectId 프로젝트 ID
     * @param memberId  제거할 멤버 ID
     * @return 성공 응답
     */
    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long memberId) {
        projectMemberService.removeMember(projectId, memberId);
        return ResponseEntity.ok(ApiResponse.success("멤버가 삭제되었습니다."));
    }

}
