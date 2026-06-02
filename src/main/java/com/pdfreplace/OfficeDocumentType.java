package com.pdfreplace;

import java.util.Locale;
import java.util.Set;

public enum OfficeDocumentType {
    WORD("word-to-pdf", Set.of(".doc", ".docx")),
    POWERPOINT("powerpoint-to-pdf", Set.of(".ppt", ".pptx")),
    EXCEL("excel-to-pdf", Set.of(".xls", ".xlsx"));

    private final String operationId;
    private final Set<String> extensions;

    OfficeDocumentType(String operationId, Set<String> extensions) {
        this.operationId = operationId;
        this.extensions = extensions;
    }

    public String operationId() {
        return operationId;
    }

    public static OfficeDocumentType forOperation(String raw) {
        String normalized = raw.trim().toLowerCase(Locale.ROOT).replace('_', '-');
        return switch (normalized) {
            case "word-to-pdf" -> WORD;
            case "powerpoint-to-pdf" -> POWERPOINT;
            case "excel-to-pdf" -> EXCEL;
            default -> throw new IllegalArgumentException("Unsupported office operation: " + raw);
        };
    }

    public void ensureFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("Office file must have a filename with a supported extension.");
        }
        String lower = filename.toLowerCase(Locale.ROOT);
        boolean ok = extensions.stream().anyMatch(lower::endsWith);
        if (!ok) {
            throw new IllegalArgumentException(
                    "Unsupported file type for " + operationId + ". Allowed: " + String.join(", ", extensions) + ".");
        }
    }

    public String preferredExtension() {
        return switch (this) {
            case WORD -> ".docx";
            case POWERPOINT -> ".pptx";
            case EXCEL -> ".xlsx";
        };
    }
}
