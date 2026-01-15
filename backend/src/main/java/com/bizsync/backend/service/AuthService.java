package com.bizsync.backend.service;

import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.SignumRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

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
}
