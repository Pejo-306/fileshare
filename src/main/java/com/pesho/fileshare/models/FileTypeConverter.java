package com.pesho.fileshare.models;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.util.stream.Stream;

@Converter(autoApply = true)
public class FileTypeConverter implements AttributeConverter<FileType, String> {

    @Override
    public String convertToDatabaseColumn(FileType fileType) {
        if (fileType == null) {
            return null;
        }
        return fileType.getCode();
    }

    @Override
    public FileType convertToEntityAttribute(String code) {
        if (code == null) {
            return null;
        }

        return Stream.of(FileType.values())
                .filter(fileType -> fileType.getCode().equals(code))
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }
}
