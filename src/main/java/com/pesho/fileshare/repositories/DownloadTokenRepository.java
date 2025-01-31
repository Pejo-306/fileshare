package com.pesho.fileshare.repositories;

import com.pesho.fileshare.models.DownloadToken;
import com.pesho.fileshare.models.DBFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DownloadTokenRepository extends JpaRepository<DownloadToken, Long> {

    Optional<DownloadToken> findByFile(DBFile file);

    Optional<DownloadToken> findByToken(String token);
}
