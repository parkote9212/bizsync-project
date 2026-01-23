package com.bizsync.backend.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Entity
@Table(name = "users")
@Getter
@ToString(exclude = "password")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @JsonIgnore
    @Getter(AccessLevel.NONE)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    private String name;

    @Column(name = "emp_no", unique = true, length = 20)
    private String empNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "position", length = 30)
    private Position position;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private AccountStatus status = AccountStatus.PENDING;

    @Column(length = 50)
    private String department;

    public void updateInfo(String name, String department) {
        this.name = name;
        this.department = department;
    }

    /**
     * 비밀번호 변경
     */
    public void changePassword(String newEncodedPassword) {
        this.password = newEncodedPassword;
    }

    /**
     * 비밀번호 검증
     * password getter를 제거했으므로 이 메서드를 통해만 비밀번호 검증 가능
     */
    public boolean matchesPassword(String rawPassword, PasswordEncoder encoder) {
        return encoder.matches(rawPassword, this.password);
    }

    public void approve() {
        this.status = AccountStatus.ACTIVE;
    }

    public void reject() {
        this.status = AccountStatus.DELETED;
    }

    public void suspend() {
        this.status = AccountStatus.SUSPENDED;
    }

    public void activate() {
        this.status = AccountStatus.ACTIVE;
    }

    public void changeRole(Role newRole) {
        this.role = newRole;
    }

    public void resetPassword(String newEncodedPassword) {
        this.password = newEncodedPassword;
    }
}
