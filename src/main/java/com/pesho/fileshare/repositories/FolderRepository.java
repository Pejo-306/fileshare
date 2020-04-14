package com.pesho.fileshare.repositories;

import com.pesho.fileshare.models.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolderRepository extends JpaRepository<Folder, Long> {
}
