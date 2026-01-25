package com.bizsync.backend.dto.request;

import com.bizsync.backend.domain.entity.AccountStatus;
import com.bizsync.backend.domain.entity.Role;
import com.bizsync.backend.domain.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SignumRequestDTO(

        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "비밀번호는 필수 입니다.")
        String password,

        @NotBlank(message = "이름은 필수입니다.")
        String name,
        String empNo,
        String department
) {

    public User toEntity(String encodedPassword) {
        return User.builder()
                .email(this.email)
                .password(encodedPassword)
                .name(this.name)
                .empNo(this.empNo)
                .department(this.department())
                .role(Role.MEMBER)
                .status(AccountStatus.PENDING)
                .build();
    }
}
