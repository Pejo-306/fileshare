package com.pesho.fileshare.controllers;

import com.pesho.fileshare.models.Folder;
import com.pesho.fileshare.models.User;
import com.pesho.fileshare.repositories.FolderRepository;
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
    private FolderRepository folderRepository;

    @Autowired
    private SecurityService securityService;

    @RequestMapping(value = "/fileshare", method = RequestMethod.GET)
    public String viewFileshare(Model model, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName());
        Folder rootFolder = user.getRootFolder();
        Set<Folder> subRootFolders = rootFolder.getNestedFolders();
        model.addAttribute("subRootFolders", subRootFolders);
        return "fileshare";
    }

    @ResponseBody
    @RequestMapping(value = "/fileshare/get-sub-folder", method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<Long, String> getSubFolder(Model model, @RequestParam("parentFolderId") Long parentFolderId) {
        Map<Long, String> result = null;
        Optional<Folder> parentFolder = folderRepository.findById(parentFolderId);

        if (parentFolder.isPresent()) {
            result = new HashMap<>();
            for (Folder folder : parentFolder.get().getNestedFolders()) {
                result.put(folder.getId(), folder.getName());
            }
        }
        return result;
    }
}
