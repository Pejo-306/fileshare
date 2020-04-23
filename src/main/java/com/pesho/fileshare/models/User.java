package com.pesho.fileshare.models;

import com.pesho.fileshare.exceptions.FileNotFoundException;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    @Column(unique = true)
    private String username;

    @NotNull
    @Column(unique = true)
    private String email;

    @NotNull
    private String password;

    @Transient
    private String passwordConfirm;

    private boolean enabled;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<DBFile> files;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPasswordConfirm() {
        return passwordConfirm;
    }

    public void setPasswordConfirm(String passwordConfirm) {
        this.passwordConfirm = passwordConfirm;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Set<DBFile> getFiles() {
        return files;
    }

    public void setFiles(Set<DBFile> files) {
        this.files = files;
    }

    public DBFile getRootFolder() {
        return files.stream()
                .filter(file -> file.getFileType() == DBFileType.DIRECTORY)  // get only directories
                .filter(file -> file.getParent() == null)  // root folder has no parent
                .findFirst().orElseThrow(FileNotFoundException::new);
    }
}
