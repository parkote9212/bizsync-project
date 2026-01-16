package com.bizsync.backend.service;

import com.bizsync.backend.common.util.JwtProvider;
import com.bizsync.backend.domain.entity.Role;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.LoginRequestDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
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
                .build();

        given(userRepository.findByEmail(request.email())).willReturn(Optional.of(testUser));
        given(passwordEncoder.matches(request.password(), testUser.getPassword())).willReturn(true);

         given(jwtProvider.createToken(any(), any())).willReturn("access_token_sample");

        //when
        String token = authService.login(request);

        //then
        assertThat(token).isNotNull();

    }

    @Test
    @DisplayName("비밀번호가 틀리면 예외가 발생해야 한다")
    void login_fail() {
        //given
        LoginRequestDTO request = new LoginRequestDTO("test@bizsync.com", "wrong_pw");
        User fakeUser = User.builder().email("test@bizsync.com").password("encoded_1234").build();

        given(userRepository.findByEmail(request.email())).willReturn(Optional.of(fakeUser));
        given(passwordEncoder.matches(request.password(), fakeUser.getPassword())).willReturn(false);

        //when & then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("비밀번호가 일치하지 않습니다.");

    }
}
