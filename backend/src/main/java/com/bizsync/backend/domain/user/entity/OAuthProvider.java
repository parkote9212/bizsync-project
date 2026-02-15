package com.bizsync.backend.domain.user.entity;

/**
 * OAuth2 제공자 타입
 *
 * @author BizSync Team
 */
public enum OAuthProvider {
    GOOGLE("google"),
    GITHUB("github"),
    KAKAO("kakao");

    private final String registrationId;

    OAuthProvider(String registrationId) {
        this.registrationId = registrationId;
    }

    public String getRegistrationId() {
        return registrationId;
    }

    /**
     * registrationId로 OAuthProvider 조회
     *
     * @param registrationId 제공자 ID (google, github, kakao)
     * @return OAuthProvider
     */
    public static OAuthProvider fromRegistrationId(String registrationId) {
        for (OAuthProvider provider : values()) {
            if (provider.getRegistrationId().equalsIgnoreCase(registrationId)) {
                return provider;
            }
        }
        throw new IllegalArgumentException("Unknown OAuth provider: " + registrationId);
    }
}
