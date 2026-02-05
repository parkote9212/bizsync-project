package com.bizsync.backend.domain.user.dto.response;

public record LoginResponseDTO(
        String accessToken,
        String tikenType
) {

    public static LoginResponseDTO of(String accessToken) {
        return new LoginResponseDTO(accessToken, "Bearer");
    }
}
