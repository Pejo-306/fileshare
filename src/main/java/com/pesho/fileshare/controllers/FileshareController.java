package com.pesho.fileshare.controllers;

import com.pesho.fileshare.models.File;
import com.pesho.fileshare.models.FileType;
import com.pesho.fileshare.models.User;
import com.pesho.fileshare.repositories.FileRepository;
import com.pesho.fileshare.repositories.UserRepository;
import com.pesho.fileshare.services.FileStorageService;
import com.pesho.fileshare.services.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Controller
public class FileshareController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private SecurityService securityService;

    @Autowired
    private FileStorageService fileStorageService;

    @RequestMapping(value = "/fileshare", method = RequestMethod.GET)
    public String viewFileshare(Model model, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName());
        File rootFolder = user.getRootFolder();
        model.addAttribute("rootFolder", rootFolder);
        return "fileshare";
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/get-sub-files", method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Map<String, String>> getSubFiles(@RequestParam("parentFolderId") Long parentFolderId) {
        List<Map<String, String>> result = null;
        Optional<File> parentFolder = fileRepository.findById(parentFolderId);

        if (parentFolder.isPresent()) {
            result = new ArrayList<>();
            for (File file : parentFolder.get().getNestedFiles()) {
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
        Optional<File> parentFolderOpt = fileRepository.findById(parentFolderId);

        if (parentFolderOpt.isPresent()) {
            File parentFolder = parentFolderOpt.get();
            File newFolder = new File(FileType.DIRECTORY, folderName, parentFolder.getUser(), null, parentFolder);
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
        Optional<File> parentFolderOpt = fileRepository.findById(parentFolderId);

        if (parentFolderOpt.isPresent()) {
            File parentFolder = parentFolderOpt.get();
            File newFile = fileStorageService.storeFile(file, parentFolder.getUser(), parentFolder);
            return Collections.singletonMap("success", true);
        }
        return Collections.singletonMap("success", false);
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/rename-file", method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> renameFolder(@RequestParam("fileId") Long fileId,
                                             @RequestParam("newFileName") String newFileName) {
        Optional<File> fileOpt = fileRepository.findById(fileId);

        if (fileOpt.isPresent()) {
            File file = fileOpt.get();
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
        Optional<File> fileOpt = fileRepository.findById(fileId);

        if (fileOpt.isPresent()) {
            fileRepository.delete(fileOpt.get());
            return Collections.singletonMap("success", true);
        }
        return Collections.singletonMap("success", false);
    }

    /*
    @ResponseBody
    @RequestMapping(value = "/fileshare/move-folder", method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> moveFolder(Long folderId, Long newParentId) {
        Optional<Folder> folderOpt = folderRepository.findById(folderId);
        Optional<Folder> newParentOpt = folderRepository.findById(newParentId);

        if (folderOpt.isPresent() && newParentOpt.isPresent()) {
            Folder folder = folderOpt.get();
            Folder newParent = newParentOpt.get();
            folder.setParent(newParent);
            folderRepository.save(folder);
            return Collections.singletonMap("success", true);
        }
        return Collections.singletonMap("success", false);
    }

     */
}
