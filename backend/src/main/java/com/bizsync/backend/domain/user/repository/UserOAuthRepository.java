package com.bizsync.backend.domain.user.repository;

import com.bizsync.backend.domain.user.entity.OAuthProvider;
import com.bizsync.backend.domain.user.entity.UserOAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserOAuth 리포지토리
 *
 * @author BizSync Team
 */
@Repository
public interface UserOAuthRepository extends JpaRepository<UserOAuth, Long> {

    /**
     * provider와 providerId로 OAuth 연동 정보 조회
     *
     * @param provider OAuth 제공자
     * @param providerId 제공자별 사용자 ID
     * @return OAuth 연동 정보
     */
    Optional<UserOAuth> findByProviderAndProviderId(OAuthProvider provider, String providerId);

    /**
     * 사용자의 모든 OAuth 연동 목록 조회
     *
     * @param userId 사용자 ID
     * @return OAuth 연동 목록
     */
    List<UserOAuth> findByUser_UserId(Long userId);

    /**
     * 사용자의 특정 provider OAuth 연동 조회
     *
     * @param userId 사용자 ID
     * @param provider OAuth 제공자
     * @return OAuth 연동 정보
     */
    Optional<UserOAuth> findByUser_UserIdAndProvider(Long userId, OAuthProvider provider);

    /**
     * provider와 provider email로 OAuth 연동 정보 조회
     *
     * @param provider OAuth 제공자
     * @param providerEmail 제공자 이메일
     * @return OAuth 연동 정보
     */
    Optional<UserOAuth> findByProviderAndProviderEmail(OAuthProvider provider, String providerEmail);

    /**
     * 사용자의 OAuth 연동 존재 여부 확인
     *
     * @param userId 사용자 ID
     * @param provider OAuth 제공자
     * @return 연동 존재 여부
     */
    boolean existsByUser_UserIdAndProvider(Long userId, OAuthProvider provider);
}
