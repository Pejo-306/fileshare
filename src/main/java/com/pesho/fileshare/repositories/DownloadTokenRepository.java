package com.pesho.fileshare.repositories;

import com.pesho.fileshare.models.DownloadToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DownloadTokenRepository extends JpaRepository<DownloadToken, Long> {

    DownloadToken findByToken(String token);
}
