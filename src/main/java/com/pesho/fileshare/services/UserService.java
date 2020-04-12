package com.pesho.fileshare.services;

import com.pesho.fileshare.models.User;

public interface UserService {

    void save(User user);

    User findByUsername(String username);

    User findByEmail(String email);
}
