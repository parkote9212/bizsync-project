package com.bizsync.backend.domain.user.service;

import com.bizsync.backend.domain.user.dto.OAuth2UserInfo;
import com.bizsync.backend.domain.user.dto.OAuth2UserInfoFactory;
import com.bizsync.backend.domain.user.entity.OAuthProvider;
import com.bizsync.backend.domain.user.entity.Role;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.entity.UserOAuth;
import com.bizsync.backend.domain.user.repository.UserOAuthRepository;
import com.bizsync.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * OAuth2 로그인 사용자 정보 처리 서비스
 *
 * <p>OAuth2 로그인 시 호출되어 사용자 정보를 처리합니다:
 * <ul>
 *   <li>기존 OAuth 연동 확인</li>
 *   <li>이메일 기반 기존 사용자 매칭</li>
 *   <li>신규 사용자 생성</li>
 *   <li>OAuth 정보 업데이트</li>
 * </ul>
 *
 * @author BizSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final UserOAuthRepository userOAuthRepository;

    /**
     * OAuth2 로그인 시 사용자 정보 로드 및 처리
     *
     * @param userRequest OAuth2 사용자 요청
     * @return OAuth2User
     * @throws OAuth2AuthenticationException OAuth2 인증 예외
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. OAuth2 제공자로부터 사용자 정보 가져오기
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 2. OAuth 제공자 확인
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuthProvider provider = OAuthProvider.fromRegistrationId(registrationId);

        // 3. 제공자별 사용자 정보 추출
        Map<String, Object> attributes = oAuth2User.getAttributes();
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(provider, attributes);

        String providerId = oAuth2UserInfo.getProviderId();
        String email = oAuth2UserInfo.getEmail();
        String name = oAuth2UserInfo.getName();
        String picture = oAuth2UserInfo.getPicture();

        log.info("OAuth2 로그인 시도: provider={}, providerId={}, email={}", provider, providerId, email);

        // 4. 기존 OAuth 연동 확인
        UserOAuth userOAuth = userOAuthRepository.findByProviderAndProviderId(provider, providerId)
                .orElse(null);

        User user;

        if (userOAuth != null) {
            // 4-1. 기존 OAuth 연동이 있는 경우 → 사용자 정보 업데이트
            user = userOAuth.getUser();
            userOAuth.updateOAuthInfo(email, name, picture);
            log.info("기존 OAuth 연동 사용자 로그인: userId={}, provider={}", user.getUserId(), provider);
        } else {
            // 4-2. 신규 OAuth 연동
            if (email != null && !email.isBlank()) {
                // 이메일이 있는 경우 → 기존 사용자와 매칭 시도
                user = userRepository.findByEmail(email).orElse(null);

                if (user != null) {
                    // 기존 사용자와 OAuth 연동
                    log.info("기존 사용자와 OAuth 연동: userId={}, email={}, provider={}", user.getUserId(), email, provider);
                } else {
                    // 신규 사용자 생성
                    user = createNewUser(email, name);
                    log.info("OAuth2 신규 사용자 생성: userId={}, email={}, provider={}", user.getUserId(), email, provider);
                }
            } else {
                // 이메일이 없는 경우 → 임시 이메일로 신규 사용자 생성
                String tempEmail = provider.getRegistrationId() + "_" + providerId + "@oauth.bizsync.com";
                user = createNewUser(tempEmail, name);
                log.warn("이메일 없는 OAuth2 사용자 생성: userId={}, tempEmail={}, provider={}", user.getUserId(), tempEmail, provider);
            }

            // UserOAuth 생성
            userOAuth = UserOAuth.builder()
                    .user(user)
                    .provider(provider)
                    .providerId(providerId)
                    .providerEmail(email)
                    .providerName(name)
                    .providerPicture(picture)
                    .build();
            userOAuthRepository.save(userOAuth);
        }

        // 5. OAuth2User 반환 (Spring Security가 처리)
        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }

    /**
     * 신규 사용자 생성
     *
     * @param email 이메일
     * @param name 이름
     * @return 생성된 사용자
     */
    private User createNewUser(String email, String name) {
        User newUser = User.builder()
                .email(email)
                .password("") // OAuth 사용자는 비밀번호 불필요
                .name(name != null ? name : "OAuth User")
                .role(Role.MEMBER)
                // status는 @Builder.Default로 ACTIVE
                .build();
        return userRepository.save(newUser);
    }
}
