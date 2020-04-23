package com.pesho.fileshare.repositories;

import com.pesho.fileshare.models.DBFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DBFileRepository extends JpaRepository<DBFile, Long> {
}
