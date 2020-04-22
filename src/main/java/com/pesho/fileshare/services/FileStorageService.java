package com.pesho.fileshare.services;

import com.pesho.fileshare.exceptions.FileNotFoundException;
import com.pesho.fileshare.exceptions.FileStorageException;
import com.pesho.fileshare.models.File;
import com.pesho.fileshare.models.FileType;
import com.pesho.fileshare.models.User;
import com.pesho.fileshare.repositories.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class FileStorageService {

    @Autowired
    private FileRepository fileRepository;

    public File storeFile(MultipartFile file, User owner, File parent) {
        // Normalize file name
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            // Check if the file's name contains invalid characters
            if(fileName.contains("..")) {
                throw new FileStorageException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            File newFile = new File(FileType.FILE, fileName, owner, file.getBytes(), parent);
            return fileRepository.save(newFile);
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }
}
