package com.bizsync.backend.controller;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.dto.request.MemberInviteRequestDTO;
import com.bizsync.backend.dto.request.ProjectCreateRequestDTO;
import com.bizsync.backend.dto.response.ProjectListResponseDTO;
import com.bizsync.backend.dto.response.kanban.ProjectBoardDTO;
import com.bizsync.backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
            @Valid @RequestBody ProjectCreateRequestDTO dto
    ) {
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
            @RequestBody @Valid MemberInviteRequestDTO dto
    ) {
        projectService.inviteMember(projectId, dto.email());
        return ResponseEntity.ok("멤버 초대가 완료되었습니다.");
    }


}
