package com.bizsync.backend.service;

import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.repository.ProjectRepository;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.ProjectCreateRequestDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @InjectMocks
    private ProjectService projectService;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Test
    @DisplayName("프로젝트 생성 시 프로젝트 저장 & 생성자가 멤버로 등록되어야 함")
    void createProject_success() {
        // given
        Long userId = 1L;
        ProjectCreateRequestDTO req = new ProjectCreateRequestDTO(
                "차세대 SI 구축", "설명", LocalDate.now(), LocalDate.now().plusMonths(3), new BigDecimal("10000000.00")
        );

        User fakeUser = User.builder().userId(userId).build();
        Project fakeProject = Project.builder().projectId(10L).name("차세대 SI 구축").build();

        given(userRepository.findById(userId)).willReturn(Optional.of(fakeUser));
        given(projectRepository.save(any(Project.class))).willReturn(fakeProject);

        // when (아직 메서드 없으므로 컴파일 에러 발생 - RED)
        Long projectId = projectService.createProject(userId, req);

        // then
        assertThat(projectId).isEqualTo(10L);
        // 프로젝트 멤버 저장 로직이 호출되었는지 검증
        verify(projectMemberRepository).save(any());
    }
}