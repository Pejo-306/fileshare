package com.pesho.fileshare.repositories;

import com.pesho.fileshare.models.File;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileRepository extends JpaRepository<File, Long> {
}
