package com.pesho.fileshare.models;

public enum DBFileType {

    FILE("F"), DIRECTORY("D");

    private String code;

    DBFileType(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
