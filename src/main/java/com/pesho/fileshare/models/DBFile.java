package com.pesho.fileshare.models;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Entity
@Table(name = "dbfiles")
public class DBFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private DBFileType fileType;

    @NotNull
    private String name;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Lob
    private byte[] content;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private DBFile parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private Set<DBFile> nestedFiles;

    public DBFile() {
        super();
    }

    public DBFile(@NotNull DBFileType fileType, @NotNull String name, User user, byte[] content, DBFile parent) {
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

    public DBFileType getFileType() {
        return fileType;
    }

    public void setFileType(DBFileType fileType) {
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

    public DBFile getParent() {
        return parent;
    }

    public void setParent(DBFile parent) {
        this.parent = parent;
    }

    public Set<DBFile> getNestedFiles() {
        return nestedFiles;
    }

    public void setNestedFiles(Set<DBFile> nestedFiles) {
        this.nestedFiles = nestedFiles;
    }
}
