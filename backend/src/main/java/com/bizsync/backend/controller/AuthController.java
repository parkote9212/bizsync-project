package com.bizsync.backend.controller;

import com.bizsync.backend.dto.SignumRequestDTO;
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
}
