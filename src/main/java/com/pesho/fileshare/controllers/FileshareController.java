package com.pesho.fileshare.controllers;

import com.pesho.fileshare.models.DownloadToken;
import com.pesho.fileshare.models.DBFile;
import com.pesho.fileshare.models.DBFileType;
import com.pesho.fileshare.models.User;
import com.pesho.fileshare.repositories.DownloadTokenRepository;
import com.pesho.fileshare.repositories.DBFileRepository;
import com.pesho.fileshare.repositories.UserRepository;
import com.pesho.fileshare.services.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;

@Controller
public class FileshareController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DBFileRepository fileRepository;

    @Autowired
    private DownloadTokenRepository downloadTokenRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @RequestMapping(value = "/fileshare", method = RequestMethod.GET)
    public String viewFileshare(Model model, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName());
        DBFile rootFolder = user.getRootFolder();

        model.addAttribute("rootFolder", rootFolder);
        return "fileshare";
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/get-sub-files", method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Map<String, String>> getSubFiles(@RequestParam("parentFolderId") Long parentFolderId) {
        List<Map<String, String>> result = null;
        Optional<DBFile> parentFolder = fileRepository.findById(parentFolderId);

        if (parentFolder.isPresent()) {
            result = new ArrayList<>();
            for (DBFile file : parentFolder.get().getNestedFiles()) {
                Map<String, String> triplet = new HashMap<>();
                triplet.put("id", file.getId().toString());
                triplet.put("fileType", file.getFileType().toString());
                triplet.put("name", file.getName());
                result.add(triplet);
            }
        }
        return result;
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/create-sub-folder", method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> createSubFolder(@RequestParam("parentFolderId") Long parentFolderId,
                                                @RequestParam("folderName") String folderName) {
        Optional<DBFile> parentFolderOpt = fileRepository.findById(parentFolderId);

        if (parentFolderOpt.isPresent()) {
            DBFile parentFolder = parentFolderOpt.get();
            DBFile newFolder = new DBFile(DBFileType.DIRECTORY, folderName, parentFolder.getUser(), null, parentFolder);

            fileRepository.save(newFolder);
            return Collections.singletonMap("success", true);
        }
        return Collections.singletonMap("success", false);
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/upload-file", method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> uploadFile(@RequestParam("file") MultipartFile file,
                                           @RequestParam("parentFolderId") Long parentFolderId) {
        Optional<DBFile> parentFolderOpt = fileRepository.findById(parentFolderId);

        if (parentFolderOpt.isPresent()) {
            DBFile parentFolder = parentFolderOpt.get();
            DBFile newFile = fileStorageService.storeFile(file, parentFolder.getUser(), parentFolder);

            return Collections.singletonMap("success", true);
        }
        return Collections.singletonMap("success", false);
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/rename-file", method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> renameFolder(@RequestParam("fileId") Long fileId,
                                             @RequestParam("newFileName") String newFileName) {
        Optional<DBFile> fileOpt = fileRepository.findById(fileId);

        if (fileOpt.isPresent()) {
            DBFile file = fileOpt.get();

            file.setName(newFileName);
            fileRepository.save(file);
            return Collections.singletonMap("success", true);
        }
        return Collections.singletonMap("success", false);
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/delete-file", method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> deleteFile(@RequestParam("fileId") Long fileId) {
        Optional<DBFile> fileOpt = fileRepository.findById(fileId);

        if (fileOpt.isPresent()) {
            fileRepository.delete(fileOpt.get());
            return Collections.singletonMap("success", true);
        }
        return Collections.singletonMap("success", false);
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/move-file", method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> moveFile(@RequestParam("fileId") Long fileId,
                                         @RequestParam("newParentId") Long newParentId) {
        Optional<DBFile> fileOpt = fileRepository.findById(fileId);
        Optional<DBFile> newParentOpt = fileRepository.findById(newParentId);

        if (fileOpt.isPresent() && newParentOpt.isPresent()) {
            DBFile file = fileOpt.get();
            DBFile newParent = newParentOpt.get();

            if (newParent.getFileType() == DBFileType.DIRECTORY) {  // allow movement only to folders
                file.setParent(newParent);
                fileRepository.save(file);
                return Collections.singletonMap("success", true);
            }
            return Collections.singletonMap("success", false);
        }
        return Collections.singletonMap("success", false);
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/get-download-link", method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> getDownloadLink(HttpServletRequest request,
                                               @RequestParam("fileId") Long fileId) throws MalformedURLException {
        Optional<DBFile> fileOpt = fileRepository.findById(fileId);

        if (fileOpt.isPresent()) {
            DBFile file = fileOpt.get();
            Optional<DownloadToken> downloadTokenOpt = downloadTokenRepository.findByFile(file);
            DownloadToken downloadToken;

            if (downloadTokenOpt.isPresent()) {
                downloadToken = downloadTokenOpt.get();
            } else {
                downloadToken = new DownloadToken(file);
                downloadTokenRepository.save(downloadToken);
            }

            URL url = new URL(request.getRequestURL().toString());
            StringBuilder downloadLink = new StringBuilder();

            downloadLink.append("http://localhost:");
            downloadLink.append(url.getPort());
            downloadLink.append("/fileshare/download-file?token=");
            downloadLink.append(downloadToken.getToken());
            return Collections.singletonMap("downloadLink", downloadLink.toString());
        }
        return Collections.singletonMap("downloadLink", "INVALID_FILE_ID");
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/destroy-download-link", method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> destroyDownloadLink(@RequestParam("fileId") Long fileId) {
        Optional<DBFile> fileOpt = fileRepository.findById(fileId);

        if (fileOpt.isPresent()) {
            DBFile file = fileOpt.get();
            Optional<DownloadToken> downloadTokenOpt = downloadTokenRepository.findByFile(file);

            if (downloadTokenOpt.isPresent()) {
                DownloadToken downloadToken = downloadTokenOpt.get();

                downloadTokenRepository.delete(downloadToken);
                return Collections.singletonMap("success", true);
            } else {
                return Collections.singletonMap("success", false);
            }
        }
        return Collections.singletonMap("success", false);
    }

    @RequestMapping(value = "/fileshare/download-file", method = RequestMethod.GET)
    public ResponseEntity<Resource> downloadFile(@RequestParam("token") String token) throws IOException  {
        Optional<DownloadToken> downloadTokenOpt = downloadTokenRepository.findByToken(token);

        if (downloadTokenOpt.isPresent()) {
            DownloadToken downloadToken = downloadTokenOpt.get();
            DBFile file = downloadToken.getFile();
            String filename = (file.getFileType() == DBFileType.DIRECTORY) ? file.getName() + ".zip" : file.getName();
            byte[] downloadableFileByteArray = fileStorageService.getDownloadableFileByteArray(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(new ByteArrayResource(downloadableFileByteArray));
        }
        return new ResponseEntity(HttpStatus.NOT_FOUND);
    }
}
