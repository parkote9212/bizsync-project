package com.bizsync.backend.domain.user.dto;

import com.bizsync.backend.domain.user.entity.OAuthProvider;

/**
 * OAuth2 제공자별 사용자 정보 추출 인터페이스
 *
 * @author BizSync Team
 */
public interface OAuth2UserInfo {

    /**
     * OAuth 제공자
     */
    OAuthProvider getProvider();

    /**
     * 제공자별 고유 ID
     */
    String getProviderId();

    /**
     * 이메일
     */
    String getEmail();

    /**
     * 이름
     */
    String getName();

    /**
     * 프로필 사진 URL
     */
    String getPicture();
}
