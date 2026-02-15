package com.bizsync.backend.domain.user.dto.response;

import com.bizsync.backend.domain.user.entity.UserOAuth;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * OAuth2 연동 계정 정보 응답 DTO
 *
 * @author BizSync Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuth2AccountResponse {

    private Long oauthId;
    private String provider;
    private String providerEmail;
    private String providerName;
    private String providerPicture;
    private LocalDateTime createdAt;

    /**
     * UserOAuth 엔티티로부터 DTO 생성
     *
     * @param userOAuth UserOAuth 엔티티
     * @return OAuth2AccountResponse
     */
    public static OAuth2AccountResponse from(UserOAuth userOAuth) {
        return OAuth2AccountResponse.builder()
                .oauthId(userOAuth.getOauthId())
                .provider(userOAuth.getProvider().name())
                .providerEmail(userOAuth.getProviderEmail())
                .providerName(userOAuth.getProviderName())
                .providerPicture(userOAuth.getProviderPicture())
                .createdAt(userOAuth.getCreatedAt())
                .build();
    }
}
