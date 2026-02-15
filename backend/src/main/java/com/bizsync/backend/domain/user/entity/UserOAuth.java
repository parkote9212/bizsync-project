package com.bizsync.backend.domain.user.entity;

import com.bizsync.backend.global.common.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * OAuth2 연동 정보 엔티티
 * 사용자가 여러 OAuth2 제공자와 연동할 수 있도록 지원
 *
 * @author BizSync Team
 */
@Entity
@Table(
    name = "user_oauth",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"provider", "provider_id"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserOAuth extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "oauth_id")
    private Long oauthId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OAuthProvider provider;

    @Column(name = "provider_id", nullable = false, length = 100)
    private String providerId;

    @Column(name = "provider_email", length = 100)
    private String providerEmail;

    @Column(name = "provider_name", length = 100)
    private String providerName;

    @Column(name = "provider_picture", length = 500)
    private String providerPicture;

    /**
     * OAuth 정보 업데이트
     * 로그인 시 변경된 정보를 동기화
     *
     * @param email OAuth 제공자 이메일
     * @param name OAuth 제공자 이름
     * @param picture OAuth 제공자 프로필 사진 URL
     */
    public void updateOAuthInfo(String email, String name, String picture) {
        this.providerEmail = email;
        this.providerName = name;
        this.providerPicture = picture;
    }
}
