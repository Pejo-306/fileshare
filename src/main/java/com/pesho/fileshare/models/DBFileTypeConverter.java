package com.pesho.fileshare.models;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.util.stream.Stream;

@Converter(autoApply = true)
public class DBFileTypeConverter implements AttributeConverter<DBFileType, String> {

    @Override
    public String convertToDatabaseColumn(DBFileType fileType) {
        if (fileType == null) {
            return null;
        }
        return fileType.getCode();
    }

    @Override
    public DBFileType convertToEntityAttribute(String code) {
        if (code == null) {
            return null;
        }

        return Stream.of(DBFileType.values())
                .filter(fileType -> fileType.getCode().equals(code))
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }
}
