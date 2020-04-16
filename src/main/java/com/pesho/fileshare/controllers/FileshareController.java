package com.pesho.fileshare.controllers;

import com.pesho.fileshare.models.File;
import com.pesho.fileshare.models.FileType;
import com.pesho.fileshare.models.User;
import com.pesho.fileshare.repositories.FileRepository;
import com.pesho.fileshare.repositories.UserRepository;
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

import java.util.*;

@Controller
public class FileshareController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private SecurityService securityService;

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
    public List<Map<String, String>> getSubFiles(Model model, @RequestParam("parentFolderId") Long parentFolderId) {
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
    public Map<String, Boolean> createSubFolder(Long parentFolderId, String folderName) {
        Optional<File> parentFolderOpt = fileRepository.findById(parentFolderId);

        if (parentFolderOpt.isPresent()) {
            File parentFolder = parentFolderOpt.get();
            File newFolder = new File(FileType.DIRECTORY, folderName, parentFolder.getUser(), null, parentFolder);
            fileRepository.save(newFolder);
            return Collections.singletonMap("success", true);
        }
        return Collections.singletonMap("success", false);
    }

    /*
    @ResponseBody
    @RequestMapping(value = "/fileshare/rename-folder", method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> renameFolder(Long folderId, String newFolderName) {
        Optional<Folder> folderOpt = folderRepository.findById(folderId);

        if (folderOpt.isPresent()) {
            Folder folder = folderOpt.get();
            folder.setName(newFolderName);
            folderRepository.save(folder);
            return Collections.singletonMap("success", true);
        }
        return Collections.singletonMap("success", false);
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/delete-folder", method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> deleteFolder(Long folderId) {
        Optional<Folder> folderOpt = folderRepository.findById(folderId);

        if (folderOpt.isPresent()) {
            folderRepository.delete(folderOpt.get());
            return Collections.singletonMap("success", true);
        }
        return Collections.singletonMap("success", false);
    }

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
