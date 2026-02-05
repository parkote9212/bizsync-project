package com.bizsync.backend.domain.user;

import com.bizsync.backend.domain.user.entity.AccountStatus;
import com.bizsync.backend.domain.user.entity.Role;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserRepository;
import com.bizsync.backend.domain.user.service.AuthService;
import com.bizsync.backend.domain.user.dto.request.LoginRequestDTO;
import com.bizsync.backend.domain.user.dto.response.JwtTokenResponse;
import com.bizsync.backend.global.common.exception.BusinessException;
import com.bizsync.backend.global.security.jwt.JwtProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;


@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtProvider jwtProvider;

    @Test
    @DisplayName("로그인 성공 시 토큰을 반환해야 한다")
    void login_succcess() {
        //given
        LoginRequestDTO request = new LoginRequestDTO("test@bizsync.com", "1234");

        User testUser = User.builder()
                .userId(1L)
                .email("test@bizsync.com")
                .password("encoded_1234")
                .role(Role.MEMBER)
                .status(AccountStatus.ACTIVE)
                .name("테스트 사용자")
                .build();

        given(userRepository.findByEmailOrThrow(request.email())).willReturn(testUser);
        given(passwordEncoder.matches(request.password(), "encoded_1234")).willReturn(true);

        given(jwtProvider.createToken(any(), any())).willReturn("access_token_sample");
        given(jwtProvider.createRefreshToken(any())).willReturn("refresh_token_sample");
        given(jwtProvider.getExpirationDate("access_token_sample")).willReturn(new Date(System.currentTimeMillis() + 3600_000));

        //when
        JwtTokenResponse token = authService.login(request);

        //then
        assertThat(token).isNotNull();
        assertThat(token.getAccessToken()).isEqualTo("access_token_sample");
        assertThat(token.getRefreshToken()).isEqualTo("refresh_token_sample");

    }

    @Test
    @DisplayName("비밀번호가 틀리면 예외가 발생해야 한다")
    void login_fail() {
        //given
        LoginRequestDTO request = new LoginRequestDTO("test@bizsync.com", "wrong_pw");
        User fakeUser = User.builder()
                .email("test@bizsync.com")
                .password("encoded_1234")
                .status(AccountStatus.ACTIVE)
                .build();

        given(userRepository.findByEmailOrThrow(request.email())).willReturn(fakeUser);
        given(passwordEncoder.matches(request.password(), "encoded_1234")).willReturn(false);

        //when & then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class);

    }
}
