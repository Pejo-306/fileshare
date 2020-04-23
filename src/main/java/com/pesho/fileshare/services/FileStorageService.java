package com.pesho.fileshare.services;

import com.pesho.fileshare.exceptions.FileStorageException;
import com.pesho.fileshare.models.DBFile;
import com.pesho.fileshare.models.DBFileType;
import com.pesho.fileshare.models.User;
import com.pesho.fileshare.repositories.DBFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class FileStorageService {

    @Autowired
    private DBFileRepository fileRepository;

    public DBFile storeFile(MultipartFile file, User owner, DBFile parent) {
        // Normalize file name
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            // Check if the file's name contains invalid characters
            if(fileName.contains("..")) {
                throw new FileStorageException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            DBFile newFile = new DBFile(DBFileType.FILE, fileName, owner, file.getBytes(), parent);
            return fileRepository.save(newFile);
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public byte[] getDownloadableFileByteArray(DBFile file) throws IOException {
        byte[] result = null;

        if (file.getFileType() == DBFileType.FILE) {
            result = file.getContent();
        } else if (file.getFileType() == DBFileType.DIRECTORY) {
            // create a buffered byte array output stream and pass it to a zip output stream
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(byteArrayOutputStream);
            ZipOutputStream zipOutputStream = new ZipOutputStream(bufferedOutputStream);

            zipDownloadableFileByteArray(file, "/", zipOutputStream);

            zipOutputStream.finish();
            zipOutputStream.flush();
            zipOutputStream.close();
            bufferedOutputStream.close();
            byteArrayOutputStream.close();

            result = byteArrayOutputStream.toByteArray();
        }
        return result;
    }

    private void zipDownloadableFileByteArray(DBFile file, String prefix, ZipOutputStream zipOutputStream) throws IOException {
        if (file.getFileType() == DBFileType.FILE) {
            zipOutputStream.putNextEntry(new ZipEntry(prefix + file.getName()));
            zipOutputStream.write(file.getContent());
            zipOutputStream.closeEntry();
        } else if (file.getFileType() == DBFileType.DIRECTORY) {
            zipOutputStream.putNextEntry(new ZipEntry(prefix + file.getName() + "/"));
            for (DBFile nestedFile : file.getNestedFiles()) {
                zipDownloadableFileByteArray(nestedFile, prefix + file.getName() + "/", zipOutputStream);
            }
        }
    }
}
