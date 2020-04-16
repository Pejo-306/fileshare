package com.pesho.fileshare.models;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Entity
@Table(name = "files")
public class File {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private FileType fileType;

    @NotNull
    private String name;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Lob
    private byte[] content;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private File parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private Set<File> nestedFiles;

    public File() {
        super();
    }

    public File(@NotNull FileType fileType, @NotNull String name, User user, byte[] content, File parent) {
        this.fileType = fileType;
        this.name = name;
        this.user = user;
        this.content = content;
        this.parent = parent;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FileType getFileType() {
        return fileType;
    }

    public void setFileType(FileType fileType) {
        this.fileType = fileType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public byte[] getContent() {
        return content;
    }

    public void setContent(byte[] content) {
        this.content = content;
    }

    public File getParent() {
        return parent;
    }

    public void setParent(File parent) {
        this.parent = parent;
    }

    public Set<File> getNestedFiles() {
        return nestedFiles;
    }

    public void setNestedFiles(Set<File> nestedFiles) {
        this.nestedFiles = nestedFiles;
    }
}
