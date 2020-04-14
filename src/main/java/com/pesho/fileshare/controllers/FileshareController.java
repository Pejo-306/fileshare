package com.pesho.fileshare.controllers;

import com.pesho.fileshare.models.Folder;
import com.pesho.fileshare.models.User;
import com.pesho.fileshare.repositories.UserRepository;
import com.pesho.fileshare.services.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Set;

@Controller
public class FileshareController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityService securityService;

    @RequestMapping(value = "/fileshare", method = RequestMethod.GET)
    private String viewFileshare(Model model, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName());
        Folder rootFolder = user.getRootFolder();
        Set<Folder> subRootFolders = rootFolder.getNestedFolders();
        model.addAttribute("subRootFolders", subRootFolders);
        return "fileshare";
    }
}
