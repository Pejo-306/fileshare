package com.pesho.fileshare.services;

public interface SecurityService {
    String findLoggedInUsername();

    void autoLogin(String username, String password);
}
