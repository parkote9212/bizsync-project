package com.bizsync.backend.domain.repository;

import com.bizsync.backend.domain.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
