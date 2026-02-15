package com.bizsync.backend.domain.user.controller;

import com.bizsync.backend.domain.user.dto.response.OAuth2AccountResponse;
import com.bizsync.backend.domain.user.entity.OAuthProvider;
import com.bizsync.backend.domain.user.entity.UserOAuth;
import com.bizsync.backend.domain.user.repository.UserOAuthRepository;
import com.bizsync.backend.global.common.exception.BusinessException;
import com.bizsync.backend.global.common.exception.ErrorCode;
import com.bizsync.backend.global.common.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * OAuth2 API 컨트롤러
 *
 * @author BizSync Team
 */
@Slf4j
@Tag(name = "OAuth2", description = "OAuth2 소셜 로그인 API")
@RestController
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final UserOAuthRepository userOAuthRepository;

    /**
     * 연동된 OAuth2 계정 목록 조회
     *
     * @return OAuth2 계정 목록
     */
    @Operation(summary = "연동된 OAuth2 계정 목록 조회")
    @GetMapping("/accounts")
    public ResponseEntity<List<OAuth2AccountResponse>> getLinkedAccounts() {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();

        List<OAuth2AccountResponse> accounts = userOAuthRepository.findByUser_UserId(userId)
                .stream()
                .map(OAuth2AccountResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(accounts);
    }

    /**
     * OAuth2 연동 해제
     *
     * @param provider OAuth 제공자 (google, github, kakao)
     * @return 성공 응답
     */
    @Operation(summary = "OAuth2 연동 해제")
    @DeleteMapping("/unlink/{provider}")
    public ResponseEntity<Void> unlinkOAuth2Account(@PathVariable String provider) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();

        OAuthProvider oAuthProvider;
        try {
            oAuthProvider = OAuthProvider.fromRegistrationId(provider);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        UserOAuth userOAuth = userOAuthRepository.findByUser_UserIdAndProvider(userId, oAuthProvider)
                .orElseThrow(() -> new BusinessException(ErrorCode.OAUTH_NOT_LINKED));

        userOAuthRepository.delete(userOAuth);

        log.info("OAuth2 연동 해제: userId={}, provider={}", userId, provider);

        return ResponseEntity.noContent().build();
    }

    /**
     * 특정 OAuth 제공자 연동 여부 확인
     *
     * @param provider OAuth 제공자 (google, github, kakao)
     * @return 연동 여부
     */
    @Operation(summary = "OAuth2 연동 여부 확인")
    @GetMapping("/check/{provider}")
    public ResponseEntity<Boolean> checkOAuth2Link(@PathVariable String provider) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();

        OAuthProvider oAuthProvider;
        try {
            oAuthProvider = OAuthProvider.fromRegistrationId(provider);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        boolean isLinked = userOAuthRepository.existsByUser_UserIdAndProvider(userId, oAuthProvider);

        return ResponseEntity.ok(isLinked);
    }
}
