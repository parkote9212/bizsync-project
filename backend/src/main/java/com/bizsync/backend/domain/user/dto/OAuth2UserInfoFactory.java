package com.bizsync.backend.domain.user.dto;

import com.bizsync.backend.domain.user.entity.OAuthProvider;

import java.util.Map;

/**
 * OAuth2 제공자별 사용자 정보 추출 팩토리
 *
 * @author BizSync Team
 */
public class OAuth2UserInfoFactory {

    /**
     * OAuth2 제공자에 따라 적절한 OAuth2UserInfo 구현체 생성
     *
     * @param provider OAuth 제공자
     * @param attributes OAuth2 사용자 정보 attributes
     * @return OAuth2UserInfo 구현체
     */
    public static OAuth2UserInfo getOAuth2UserInfo(OAuthProvider provider, Map<String, Object> attributes) {
        return switch (provider) {
            case GOOGLE -> new GoogleOAuth2UserInfo(attributes);
            case GITHUB -> new GithubOAuth2UserInfo(attributes);
            case KAKAO -> new KakaoOAuth2UserInfo(attributes);
        };
    }
}
