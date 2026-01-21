package com.bizsync.backend.service;

import com.bizsync.backend.domain.repository.KanbanColumnRepository;
import com.bizsync.backend.domain.repository.ProjectRepository;
import com.bizsync.backend.domain.repository.TaskRepository;
import com.bizsync.backend.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ExelService {

    private final TaskRepository taskRepository;
    private final KanbanColumnRepository kanbanColumnRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    /**
     * 엑셀 파일을 읽어서 업무(Task)를 대량 등록
     *
     * 엑셀 형식:
     * | 컬럼명    | 업무제목 | 담당자(이메일) | 마감일(yyyy-MM-dd) | 상세내용 |
     * | -------- | ------- | ------------ | ----------------- | ------- |
     * | 진행 전  | 로그인   | user@co.kr   | 2026-02-01        | 내용    |
     */
/*    public int uploadTaskFromExel(long projectId, MultipartFile file) throws IOException {
    }*/
}
