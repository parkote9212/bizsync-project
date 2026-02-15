package com.bizsync.backend.domain.user.dto;

import com.bizsync.backend.domain.user.entity.OAuthProvider;

import java.util.Map;

/**
 * GitHub OAuth2 사용자 정보
 *
 * @author BizSync Team
 */
public class GithubOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public OAuthProvider getProvider() {
        return OAuthProvider.GITHUB;
    }

    @Override
    public String getProviderId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getName() {
        String name = (String) attributes.get("name");
        if (name == null || name.isBlank()) {
            name = (String) attributes.get("login");
        }
        return name;
    }

    @Override
    public String getPicture() {
        return (String) attributes.get("avatar_url");
    }
}
