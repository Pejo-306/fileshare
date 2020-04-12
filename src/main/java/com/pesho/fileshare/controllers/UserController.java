package com.pesho.fileshare.controllers;

import com.pesho.fileshare.models.User;
import com.pesho.fileshare.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(path = "/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping(path = "/all")
    public @ResponseBody Iterable<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping(path = "/create")
    public @ResponseBody String addNewUser(@RequestParam String email) {
        User user = new User();
        user.setEmail(email);
        userRepository.save(user);
        return "Saved";
    }
}
