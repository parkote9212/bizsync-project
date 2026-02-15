# Phase 1-1: MyBatis → QueryDSL 전환 + 회원가입 변경

## 브랜치

```bash
git checkout dev && git pull origin dev
git checkout -b feature/querydsl-migration
```

---

## Task 1: QueryDSL 의존성 추가

**파일**: `backend/build.gradle`

```groovy
// 추가할 의존성
implementation 'com.querydsl:querydsl-jpa:5.1.0:jakarta'
annotationProcessor 'com.querydsl:querydsl-apt:5.1.0:jakarta'
annotationProcessor 'jakarta.annotation:jakarta.annotation-api'
annotationProcessor 'jakarta.persistence:jakarta.persistence-api'
```

**확인**:
- [ ] `./gradlew clean build` 성공
- [ ] `backend/build/generated/sources/annotationProcessor/` 에 Q클래스 생성 확인
- [ ] QProject, QTask, QUser 등 Q클래스 존재 확인

**커밋**: `feat(querydsl): QueryDSL 의존성 추가 및 QClass 생성 설정`

---

## Task 2: QueryDslConfig 생성

**파일**: `backend/src/.../global/config/QueryDslConfig.java`

```java
@Configuration
public class QueryDslConfig {
    @PersistenceContext
    private EntityManager entityManager;

    @Bean
    public JPAQueryFactory jpaQueryFactory() {
        return new JPAQueryFactory(entityManager);
    }
}
```

**커밋**: `feat(querydsl): QueryDslConfig 설정 클래스 추가`

---

## Task 3: ProjectMapper → QueryDSL 전환

### 3-1. 기존 MyBatis 쿼리 분석

**파일 확인**: `backend/src/main/resources/mapper/ProjectMapper.xml`
- `selectProjectBoard`: 프로젝트 보드 조회 (칸반 컬럼 + 태스크 + 담당자)
- `selectMyProjects`: 내가 참여한 프로젝트 목록

**파일 확인**: `backend/src/.../domain/project/mapper/ProjectMapper.java`
- 메서드 시그니처, 반환 타입 확인

### 3-2. Custom Repository 생성

**파일**: `backend/src/.../domain/project/repository/ProjectRepositoryCustom.java`

```java
public interface ProjectRepositoryCustom {
    // selectProjectBoard 대체
    List<KanbanColumnDTO> findProjectBoard(Long projectId);
    // selectMyProjects 대체
    List<ProjectListResponseDTO> findMyProjects(Long userId);
}
```

**파일**: `backend/src/.../domain/project/repository/ProjectRepositoryCustomImpl.java`

```java
@RequiredArgsConstructor
public class ProjectRepositoryCustomImpl implements ProjectRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    // 구현...
}
```

### 3-3. ProjectRepository에 Custom 인터페이스 추가

```java
public interface ProjectRepository extends JpaRepository<Project, Long>, ProjectRepositoryCustom {
}
```

### 3-4. Service에서 Mapper → Repository 교체

**파일 수정**: 관련 Service 파일에서 `projectMapper.selectXxx()` → `projectRepository.findXxx()` 변경

**확인**:
- [ ] 기존 API와 동일한 응답 반환 확인
- [ ] Swagger UI에서 API 테스트
- [ ] `./gradlew test` 통과

**커밋**: `refactor(project): ProjectMapper를 QueryDSL Custom Repository로 전환`

---

## Task 4: TaskMapper → QueryDSL 전환

**동일 패턴**:
- [ ] `TaskRepositoryCustom.java` 인터페이스 생성
- [ ] `TaskRepositoryCustomImpl.java` 구현체 생성
- [ ] `TaskRepository`에 Custom extends 추가
- [ ] Service에서 Mapper → Repository 교체
- [ ] API 동작 검증

**커밋**: `refactor(project): TaskMapper를 QueryDSL Custom Repository로 전환`

---

## Task 5: MyBatis 완전 제거

### 5-1. MyBatis 관련 파일 삭제
- [ ] `backend/src/.../domain/project/mapper/ProjectMapper.java` 삭제
- [ ] `backend/src/.../domain/project/mapper/TaskMapper.java` 삭제
- [ ] `backend/src/main/resources/mapper/ProjectMapper.xml` 삭제
- [ ] `backend/src/main/resources/mapper/TaskMapper.xml` 삭제
- [ ] `backend/src/.../domain/project/mapper/` 디렉토리 삭제

### 5-2. build.gradle에서 MyBatis 의존성 제거
```groovy
// 삭제
implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.5'
testImplementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter-test:3.0.5'
```

### 5-3. application-dev.yml에서 MyBatis 설정 제거
```yaml
# 삭제
mybatis:
  mapper-locations: ...
  type-aliases-package: ...
  configuration:
    map-underscore-to-camel-case: true
```

### 5-4. application-prod.yml에서도 동일하게 제거

**확인**:
- [ ] `./gradlew clean build` 성공
- [ ] 컴파일 에러 없음
- [ ] 전체 API 정상 동작

**커밋**: `refactor(mybatis): MyBatis 의존성 및 설정 완전 제거`

---

## Task 6: 회원가입 기본 상태 변경 (PENDING → ACTIVE)

### 6-1. User 엔티티 수정

**파일**: `backend/src/.../domain/user/entity/User.java`

```java
// Before
@Builder.Default
private AccountStatus status = AccountStatus.PENDING;

// After
@Builder.Default
private AccountStatus status = AccountStatus.ACTIVE;
```

### 6-2. AuthService 로그인 로직 수정

**파일**: `backend/src/.../domain/user/service/AuthService.java`

- PENDING 상태 체크 로직 제거 또는 수정
- 회원가입 시 즉시 로그인 가능하도록 변경

### 6-3. SignupRequestDTO 확인

- `toEntity()` 메서드에서 status 설정 확인

### 6-4. AdminUserService 확인

- 관리자 승인 관련 로직이 있다면 정리 (approve 메서드는 유지, 다른 용도로 활용 가능)

**확인**:
- [ ] 회원가입 후 바로 로그인 가능
- [ ] 기존 ACTIVE 사용자 로그인 정상
- [ ] 관리자 기능 정상

**커밋**: `feat(auth): 회원가입 시 즉시 ACTIVE 상태로 변경`

---

## Task 7: 테스트 정리

- [ ] MyBatis 관련 테스트 제거
- [ ] QueryDSL 기반 Repository 테스트 추가 (선택)
- [ ] `./gradlew test` 전체 통과

**커밋**: `test(querydsl): QueryDSL 전환에 따른 테스트 정리`

---

## Phase 1-1 완료 체크리스트

- [ ] QueryDSL 의존성 추가 및 QClass 생성
- [ ] QueryDslConfig 설정 완료
- [ ] ProjectMapper → QueryDSL 전환 완료
- [ ] TaskMapper → QueryDSL 전환 완료
- [ ] MyBatis 의존성/설정/파일 완전 제거
- [ ] 회원가입 ACTIVE 기본값 변경
- [ ] AuthService PENDING 체크 제거
- [ ] 전체 테스트 통과
- [ ] dev 브랜치에 merge

```bash
git checkout dev
git merge feature/querydsl-migration --no-ff
git branch -d feature/querydsl-migration
git push origin dev
```
