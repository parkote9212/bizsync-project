package com.bizsync.backend.controller;

import com.bizsync.backend.dto.request.LoginRequestDTO;
import com.bizsync.backend.dto.request.SignumRequestDTO;
import com.bizsync.backend.dto.response.LoginResponseDTO;
import com.bizsync.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<String> signop(@Valid @RequestBody SignumRequestDTO dto){
        authService.signUp(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body("회원가입성공");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto){
        String token = authService.login(dto);

        return ResponseEntity.ok(LoginResponseDTO.of(token));
    }
}
