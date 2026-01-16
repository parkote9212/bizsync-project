package com.bizsync.backend.service;

import com.bizsync.backend.common.util.JwtProvider;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.LoginRequestDTO;
import com.bizsync.backend.dto.request.SignumRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public Long signUp(SignumRequestDTO dto){
        if (userRepository.findByEmail(dto.email()).isPresent()){
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        if (userRepository.existsByEmpNo(dto.empNo())) {
            throw new IllegalArgumentException("이미 존재하는 사번입니다.");
        }

        String encodedPassword = passwordEncoder.encode(dto.password());

        return userRepository.save(dto.toEntity(encodedPassword)).getUserId();
    }

    @Transactional(readOnly = true)
    public String login(LoginRequestDTO dto) {

        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return jwtProvider.createToken(user.getUserId(), user.getRole());
    }
}
