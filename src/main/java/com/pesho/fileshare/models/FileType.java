package com.pesho.fileshare.models;

public enum FileType {

    FILE("F"), DIRECTORY("D");

    private String code;

    FileType(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
