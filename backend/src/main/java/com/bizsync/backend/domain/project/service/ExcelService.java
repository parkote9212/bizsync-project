package com.bizsync.backend.domain.project.service;

import com.bizsync.backend.domain.project.entity.Project;
import com.bizsync.backend.domain.project.entity.Task;
import com.bizsync.backend.domain.project.entity.KanbanColumn;
import com.bizsync.backend.domain.project.mapper.TaskMapper;
import com.bizsync.backend.domain.project.repository.KanbanColumnRepository;
import com.bizsync.backend.domain.project.repository.ProjectRepository;
import com.bizsync.backend.domain.project.repository.TaskRepository;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

/**
 * 엑셀 파일 처리 관련 비즈니스 로직을 처리하는 서비스
 *
 * <p>엑셀 파일을 통한 업무 대량 등록 및 업무 목록 엑셀 다운로드 기능을 제공합니다.
 *
 * @author BizSync Team
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ExcelService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final KanbanColumnRepository kanbanColumnRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    /**
     * 엑셀 파일을 읽어서 업무(Task)를 대량 등록합니다.
     *
     * <p>엑셀 형식:
     * <ul>
     *   <li>컬럼명: 칸반 컬럼 이름</li>
     *   <li>업무제목: 업무 제목</li>
     *   <li>담당자(이메일): 담당자 이메일</li>
     *   <li>마감일(yyyy-MM-dd): 마감일</li>
     *   <li>상세내용: 업무 상세 내용</li>
     * </ul>
     *
     * @param projectId 프로젝트 ID
     * @param file      엑셀 파일
     * @return 등록된 업무 수
     * @throws IOException 파일 읽기 오류
     */
    public int uploadTasksFromExcel(Long projectId, MultipartFile file) throws IOException {
        Project project = projectRepository.findByIdOrThrow(projectId);

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<Task> tasksToSave = new ArrayList<>();
        int rowIndex = 0;

        for (Row row : sheet) {
            // 첫 번째 행은 헤더이므로 스킵
            if (rowIndex++ == 0) continue;

            try {
                String columnName = getCellValueAsString(row.getCell(0));
                String title = getCellValueAsString(row.getCell(1));
                String workerEmail = getCellValueAsString(row.getCell(2));
                String deadlineStr = getCellValueAsString(row.getCell(3));
                String content = getCellValueAsString(row.getCell(4));

                // 빈 행 스킵
                if (columnName == null || columnName.isBlank()) continue;

                // 컬럼 찾기
                KanbanColumn column = kanbanColumnRepository
                        .findByProjectIdAndNameOrThrow(projectId, columnName);

                // 담당자 찾기 (이메일이 없으면 null로 설정)
                User worker = null;
                if (workerEmail != null && !workerEmail.isBlank()) {
                    try {
                        worker = userRepository.findByEmailOrThrow(workerEmail);
                    } catch (Exception e) {
                        log.warn("엑셀 {}번 행: 담당자 이메일을 찾을 수 없습니다. email={}", rowIndex, workerEmail);
                        // 담당자를 찾을 수 없어도 업무는 생성 (null로 설정)
                    }
                }

                // 마감일 파싱 (LocalDate)
                LocalDate deadline = parseDeadline(deadlineStr);

                // 최대 시퀀스 조회
                Integer maxSeq = taskRepository.findMaxSequenceByColumnId(column.getColumnId()).orElse(0);

                // Task 생성
                Task task = Task.builder()
                        .column(column)
                        .worker(worker)
                        .title(title)
                        .content(content)
                        .deadline(deadline)
                        .sequence(maxSeq + 1)
                        .build();

                tasksToSave.add(task);

            } catch (Exception e) {
                log.error("엑셀 {}번 행 파싱 실패: {}", rowIndex, e.getMessage());
                // 계속 진행 (에러 행은 스킵)
            }
        }

        workbook.close();

        // 일괄 저장
        taskRepository.saveAll(tasksToSave);

        return tasksToSave.size();
    }

    /**
     * 프로젝트의 모든 업무를 엑셀 파일로 다운로드합니다.
     *
     * <p>컬럼 순서와 업무 순서대로 정렬하여 엑셀 파일을 생성합니다.
     *
     * @param projectId 프로젝트 ID
     * @return 엑셀 파일 바이트 배열
     * @throws IOException 파일 생성 오류
     */
    @Transactional(readOnly = true)
    public byte[] downloadTasksAsExcel(Long projectId) throws IOException {
        List<Task> tasks = taskMapper.selectTasksByProjectIdOrderByColumnSequenceAndTaskSequence(projectId);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Tasks");

        // 헤더 행 생성
        Row headerRow = sheet.createRow(0);
        String[] headers = {"컬럼명", "업무제목", "담당자(이메일)", "마감일", "상세내용"};
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // 데이터 행 생성
        int rowIndex = 1;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Task task : tasks) {
            Row row = sheet.createRow(rowIndex++);
            row.createCell(0).setCellValue(task.getColumn().getName());
            row.createCell(1).setCellValue(task.getTitle());
            row.createCell(2).setCellValue(task.getWorker() != null ? task.getWorker().getEmail() : "미배정");
            row.createCell(3).setCellValue(task.getDeadline() != null ? task.getDeadline().format(formatter) : "");
            row.createCell(4).setCellValue(task.getContent() != null ? task.getContent() : "");
        }

        // 컬럼 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }

    // Helper Methods
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> null;
        };
    }

    private LocalDate parseDeadline(String deadlineStr) {
        if (deadlineStr == null || deadlineStr.isBlank()) {
            return null;
        }

        try {
            // "yyyy-MM-dd" 형식을 LocalDate로 파싱
            return LocalDate.parse(deadlineStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (DateTimeParseException e) {
            log.warn("마감일 파싱 실패: {}", deadlineStr);
            return null;
        }
    }
}