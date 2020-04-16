package com.pesho.fileshare.exceptions;

public class FileNotFoundException extends RuntimeException {

    public FileNotFoundException() {
        super("File has not been found");
    }

    public FileNotFoundException(String message) {
        super(message);
    }

    public FileNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
