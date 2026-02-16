# QueryDSL + Java Record 트러블슈팅 보고서

## 문제 개요

**날짜**: 2026-02-16 ~ 2026-02-17
**Phase**: Phase 4-2 통합 테스트
**증상**: 프로젝트 목록 조회 API에서 500 Internal Server Error 발생

---

## 에러 상세

### 1. 초기 에러 메시지

```
com.querydsl.core.types.ExpressionException:
No constructor found for class com.bizsync.backend.domain.project.dto.response.ProjectListResponseDTO with parameters:
[class java.lang.Long, class java.lang.String, class java.lang.String, class java.time.LocalDate, class java.time.LocalDate, class java.lang.String, class java.math.BigDecimal, class java.math.BigDecimal]

Caused by: java.lang.NoSuchMethodException:
com.bizsync.backend.domain.project.dto.response.ProjectListResponseDTO.<init>()
```

### 2. 발생 위치

- **API 엔드포인트**: `GET /api/projects`
- **서비스**: `ProjectService.getMyProjects(Long userId)`
- **리포지토리**: `ProjectRepositoryCustomImpl.findMyProjects(Long userId)`
- **문제 코드 라인**: 124번 줄

```java
// ProjectRepositoryCustomImpl.java:124
return queryFactory
    .select(Projections.fields(ProjectListResponseDTO.class,  // ❌ 문제!
        project.projectId,
        project.name,
        // ...
    ))
```

---

## 근본 원인 분석

### 1. Java Record의 특성

Java Record는 **기본 생성자(no-args constructor)**를 제공하지 않습니다.

```java
// ProjectListResponseDTO.java (record)
public record ProjectListResponseDTO(
    Long projectId,
    String name,
    String description,
    LocalDate startDate,
    LocalDate endDate,
    String status,
    BigDecimal totalBudget,
    BigDecimal usedBudget
) {
    // ❌ 기본 생성자 없음
    // ✅ all-args 생성자만 제공됨
}
```

### 2. QueryDSL Projections 방식 비교

| 방식 | 필요한 생성자 | Record 호환성 |
|------|--------------|---------------|
| `Projections.fields()` | 기본 생성자 + Setter | ❌ 불가능 |
| `Projections.bean()` | 기본 생성자 + Setter | ❌ 불가능 |
| `Projections.constructor()` | 매개변수 생성자 | ✅ 가능 |

### 3. 코드 실행 흐름

```
1. QueryDSL이 Projections.fields() 실행
   ↓
2. QBean.newInstance() 호출
   ↓
3. 기본 생성자 찾기 시도 (리플렉션)
   ↓
4. ProjectListResponseDTO.<init>() 없음 ❌
   ↓
5. NoSuchMethodException 발생
```

---

## 트러블슈팅 과정

### 시도 1: Projections.constructor()로 변경 (실패)

**작업 내용**:
```java
// ProjectRepositoryCustomImpl.java:124
.select(Projections.constructor(ProjectListResponseDTO.class,
    project.projectId,
    project.name,
    project.description,
    project.startDate,
    project.endDate,
    project.status.stringValue(),  // .as("status") 제거
    project.totalBudget,
    project.usedBudget
))
```

**결과**: ❌ 에러 지속

**원인**: `.claude/worktrees/pensive-merkle/backend` 경로를 수정했으나, IntelliJ는 실제 프로젝트 경로(`~/code/bizsync-project/backend`)를 실행 중이었음

### 시도 2: Record → POJO 클래스 변환 (잘못된 경로)

**작업 내용**:
```java
// ❌ 잘못된 경로: .claude/worktrees/pensive-merkle/backend
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectListResponseDTO {
    private Long projectId;
    // ...
}
```

**결과**: ❌ 에러 지속

**원인**: 여전히 잘못된 경로를 수정함

### 시도 3: 파일 경로 확인 (발견!)

**확인 작업**:
```bash
# Worktree 파일 (수정됨)
/Users/gcpark/code/bizsync-project/.claude/worktrees/pensive-merkle/backend/src/.../ProjectListResponseDTO.java
→ 수정 시각: 00:01

# 실제 프로젝트 파일 (수정 안됨!)
/Users/gcpark/code/bizsync-project/backend/src/.../ProjectListResponseDTO.java
→ 여전히 record

# 컴파일된 클래스
.../target/classes/.../ProjectListResponseDTO.class
→ 수정 시각: 23:37 (이전 버전)
```

**발견 사항**:
- Claude Code의 worktree와 실제 프로젝트 경로가 다름
- IntelliJ는 실제 프로젝트 경로를 실행 중
- 잘못된 경로를 계속 수정하고 있었음

### 시도 4: 실제 프로젝트 파일 수정 (성공! ✅)

**작업 내용**:
1. 실제 프로젝트 경로 확인
   ```bash
   /Users/gcpark/code/bizsync-project/backend/src/main/java/com/bizsync/backend/domain/project/
   ```

2. `ProjectRepositoryCustomImpl.java` 수정 (실제 경로)
   ```java
   // Line 124
   .select(Projections.constructor(ProjectListResponseDTO.class,
       project.projectId,
       project.name,
       project.description,
       project.startDate,
       project.endDate,
       project.status.stringValue(),  // ✅ .as("status") 제거
       project.totalBudget,
       project.usedBudget
   ))
   ```

3. Record 유지 (record와 Projections.constructor() 호환됨)

4. Spring Boot 재시작

**결과**: ✅ 성공!

```json
{
  "success": true,
  "data": [
    {
      "projectId": 1,
      "name": "BizSync v2 개발",
      "description": "BizSync 플랫폼 v2 업그레이드 프로젝트",
      "startDate": "2026-01-01",
      "endDate": "2026-06-30",
      "status": "IN_PROGRESS",
      "totalBudget": 50000000.00,
      "usedBudget": 10000000.00
    }
  ],
  "message": null
}
```

---

## 해결 방법

### 최종 수정 사항

**파일 1: ProjectRepositoryCustomImpl.java**
```java
@Override
public List<ProjectListResponseDTO> findMyProjects(Long userId) {
    return queryFactory
            .select(Projections.constructor(ProjectListResponseDTO.class,  // ✅ constructor 사용
                    project.projectId,
                    project.name,
                    project.description,
                    project.startDate,
                    project.endDate,
                    project.status.stringValue(),  // ✅ alias 제거
                    project.totalBudget,
                    project.usedBudget
            ))
            .from(projectMember)
            .innerJoin(projectMember.project, project)
            .where(
                    projectMember.user.userId.eq(userId),
                    project.status.ne(ProjectStatus.CANCELLED)
            )
            .orderBy(project.projectId.desc())
            .fetch();
}
```

**파일 2: ProjectListResponseDTO.java**
```java
// Record 유지 (all-args 생성자 제공)
public record ProjectListResponseDTO(
        Long projectId,
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        BigDecimal totalBudget,
        BigDecimal usedBudget
) {
    public static ProjectListResponseDTO from(Project project) {
        return new ProjectListResponseDTO(
                project.getProjectId(),
                project.getName(),
                project.getDescription(),
                project.getStartDate(),
                project.getEndDate(),
                project.getStatus().name(),
                project.getTotalBudget(),
                project.getUsedBudget()
        );
    }
}
```

---

## 교훈 및 베스트 프랙티스

### 1. QueryDSL + Record 사용 시

✅ **권장**: `Projections.constructor()` 사용
```java
.select(Projections.constructor(DtoClass.class, field1, field2, ...))
```

❌ **비권장**: `Projections.fields()` 또는 `Projections.bean()` 사용
```java
.select(Projections.fields(DtoClass.class, field1, field2, ...))  // Record와 불호환
```

### 2. 필드 매핑 시 주의사항

- **Alias 불필요**: `Projections.constructor()`는 순서대로 매핑하므로 `.as("alias")` 불필요
- **타입 일치**: 생성자 매개변수 순서와 타입이 정확히 일치해야 함
- **Enum 처리**: `enum.stringValue()` 사용 (`.name()` 대신)

### 3. 개발 환경 확인

⚠️ **중요**: 파일 경로 확인!
- Claude Code worktree: `.claude/worktrees/{브랜치명}/`
- 실제 프로젝트: `~/code/{프로젝트명}/`
- IntelliJ가 어느 경로를 실행 중인지 확인 필수

### 4. 컴파일 확인

```bash
# 코드 변경 후 반드시 확인
./gradlew clean compileJava

# 또는 IntelliJ에서
Build > Rebuild Project
```

### 5. Record vs POJO 선택 기준

| 상황 | 권장 타입 | 이유 |
|------|----------|------|
| 불변 DTO | Record | 간결함, 타입 안전성 |
| QueryDSL Projection | Record + `constructor()` | 호환 가능 |
| 빌더 패턴 필요 | POJO + Lombok | Builder 지원 |
| 필드 검증 필요 | POJO + Validation | 복잡한 로직 가능 |

---

## 관련 파일

- `backend/src/main/java/com/bizsync/backend/domain/project/repository/ProjectRepositoryCustomImpl.java`
- `backend/src/main/java/com/bizsync/backend/domain/project/dto/response/ProjectListResponseDTO.java`
- `backend/src/main/java/com/bizsync/backend/global/config/QuerydslConfig.java`

---

## 참고 자료

- [QueryDSL Projections Documentation](http://querydsl.com/static/querydsl/latest/reference/html/ch03.html#d0e1800)
- [Java Record Specification (JEP 395)](https://openjdk.org/jeps/395)
- [Spring Data JPA with QueryDSL](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#core.extensions)

---

## 작성자

- Claude (Anthropic AI Assistant)
- 작성일: 2026-02-17
- Phase: Phase 4-2 통합 테스트
