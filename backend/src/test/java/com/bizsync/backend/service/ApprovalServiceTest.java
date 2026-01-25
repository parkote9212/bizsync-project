package com.bizsync.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.bizsync.backend.domain.entity.ApprovalDocument;
import com.bizsync.backend.domain.entity.ApprovalLine;
import com.bizsync.backend.domain.entity.ApprovalStatus;
import com.bizsync.backend.domain.entity.ApprovalType;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.ApprovalDocumentRepository;
import com.bizsync.backend.domain.repository.ApprovalLineRepository;
import com.bizsync.backend.domain.repository.ProjectRepository;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.ApprovalCreateRequestDTO;
import com.bizsync.backend.dto.request.ApprovalProcessRequestDTO;

@ExtendWith({ MockitoExtension.class, SpringExtension.class })
class ApprovalServiceTest {

        @InjectMocks
        private ApprovalService approvalService; // 아직 없음 (RED)

        @Mock
        private ApprovalDocumentRepository approvalDocumentRepository;

        @Mock
        private ApprovalLineRepository approvalLineRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private NotificationService notificationService;

        @Mock
        private ProjectRepository projectRepository;

        @Test
        @DisplayName("결재 상신 시: 문서는 PENDING 상태여야 하고, 결재선은 순서대로 저장되어야 한다")
        @WithMockUser(username = "1", roles = { "MEMBER" })
        void createApproval_success() {
                // given
                Long drafterId = 1L; // 기안자 (나)
                Long approver1Id = 10L; // 결재자 1 (팀장)
                Long approver2Id = 20L; // 결재자 2 (사장)

                ApprovalCreateRequestDTO dto = new ApprovalCreateRequestDTO(
                                null, // projectId
                                ApprovalType.LEAVE, // type
                                null, // amount
                                "휴가 신청서", // title
                                "쉬고 싶습니다.", // content
                                List.of(approver1Id, approver2Id) // approverIds
                );

                User drafter = User.builder().userId(drafterId).name("나신입").build();
                User approver1 = User.builder().userId(approver1Id).name("김팀장").build();
                User approver2 = User.builder().userId(approver2Id).name("박사장").build();

                // Mocking
                given(userRepository.findByIdOrThrow(drafterId)).willReturn(drafter);
                // 결재자 목록 조회 Mocking (순서를 유지하며 리턴한다고 가정)
                given(userRepository.findAllById(dto.approverIds())).willReturn(List.of(approver1, approver2));

                // 문서 저장 시 ID가 부여된 객체를 리턴하도록 설정
                ApprovalDocument savedDoc = ApprovalDocument.builder().documentId(100L).build();
                given(approvalDocumentRepository.save(any(ApprovalDocument.class))).willReturn(savedDoc);

                // when (메서드 실행 - 현재 컴파일 에러 발생함)
                approvalService.createApproval(drafterId, dto);

                // then (검증)
                // 1. 문서가 저장되었는지 확인
                verify(approvalDocumentRepository).save(any(ApprovalDocument.class));

                // 2. 결재선(ApprovalLine)이 2번 저장되었는지 확인
                ArgumentCaptor<ApprovalLine> lineCaptor = ArgumentCaptor.forClass(ApprovalLine.class);
                verify(approvalLineRepository, times(2)).save(lineCaptor.capture());

                List<ApprovalLine> savedLines = lineCaptor.getAllValues();

                // ★ 핵심 검증: 순서(Sequence)가 1, 2로 잘 들어갔는지
                assertThat(savedLines.get(0).getApprover().getUserId()).isEqualTo(approver1Id);
                assertThat(savedLines.get(0).getSequence()).isEqualTo(1); // 첫 번째 결재자 = 순서 1

                assertThat(savedLines.get(1).getApprover().getUserId()).isEqualTo(approver2Id);
                assertThat(savedLines.get(1).getSequence()).isEqualTo(2); // 두 번째 결재자 = 순서 2
        }

        @Test
        @DisplayName("마지막 결재자가 승인하면 문서 상태가 APPROVED로 변경되어야 한다")
        @WithMockUser(username = "20", roles = { "MEMBER" })
        void processApproval_final_approve() {
                // given
                Long documentId = 100L;
                Long approverId = 20L; // 마지막 결재자

                ApprovalProcessRequestDTO req = new ApprovalProcessRequestDTO(
                                ApprovalStatus.APPROVED, "고생했습니다.");

                // 가짜 문서 및 결재선 데이터 생성
                ApprovalDocument doc = ApprovalDocument.builder()
                                .documentId(documentId)
                                .status(ApprovalStatus.PENDING) // 현재 진행 중
                                .build();

                User approver = User.builder().userId(approverId).build();

                // 내 결재 라인 (순서 2번, 마지막이라고 가정)
                ApprovalLine myLine = ApprovalLine.builder()
                                .id(5L)
                                .document(doc) // 연관관계 설정
                                .approver(approver)
                                .sequence(2)
                                .status(ApprovalStatus.PENDING)
                                .build();

                // Mocking: 내 결재선 찾기 (findByDocumentAndApproverEntity 사용)
                given(approvalLineRepository.findByDocumentAndApproverEntity(doc, approverId))
                                .willReturn(Optional.of(myLine));

                // Mocking: 내 앞 순서(1번)가 아직 안 끝났는지 확인 (false = 앞 순서 모두 승인됨)
                given(approvalLineRepository.existsByDocument_DocumentIdAndSequenceLessThanAndStatusNot(
                                documentId, 2, ApprovalStatus.APPROVED))
                                .willReturn(false);

                // Mocking: 문서 조회
                given(approvalDocumentRepository.findByIdOrThrow(documentId)).willReturn(doc);

                // Mocking: 모든 결재선 조회 (모두 승인된 상태로 설정)
                ApprovalLine line1 = ApprovalLine.builder()
                                .id(4L)
                                .document(doc)
                                .sequence(1)
                                .status(ApprovalStatus.APPROVED)
                                .build();
                given(approvalLineRepository.findByDocumentOrderBySequence(doc))
                                .willReturn(List.of(line1, myLine));

                // when (메서드 실행 - 파라미터 순서: approverId, documentId, dto)
                approvalService.processApproval(approverId, documentId, req);

                // then
                // 1. 내 결재선 상태가 APPROVED로 변했는지
                assertThat(myLine.getStatus()).isEqualTo(ApprovalStatus.APPROVED);
                // 2. 문서 전체 상태가 APPROVED로 변했는지 (핵심)
                assertThat(doc.getStatus()).isEqualTo(ApprovalStatus.APPROVED);
                // 3. 완료 일시가 찍혔는지
                assertThat(doc.getCompletedAt()).isNotNull();
        }
}
