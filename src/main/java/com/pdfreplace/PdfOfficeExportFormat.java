package com.pdfreplace;

import java.util.Locale;

/**
 * LibreOffice {@code --convert-to} targets for PDF → Office export.
 */
public enum PdfOfficeExportFormat {
    DOCX("docx", ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"),
    PPTX("pptx", ".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"),
    XLSX("xlsx", ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx");

    private final String convertTo;
    private final String extension;
    private final String contentType;
    private final String outputSuffix;

    PdfOfficeExportFormat(String convertTo, String extension, String contentType, String outputSuffix) {
        this.convertTo = convertTo;
        this.extension = extension;
        this.contentType = contentType;
        this.outputSuffix = outputSuffix;
    }

    public String convertTo() {
        return convertTo;
    }

    public String extension() {
        return extension;
    }

    public String contentType() {
        return contentType;
    }

    public String outputSuffix() {
        return outputSuffix;
    }

    public static PdfOfficeExportFormat forOperation(PdfToolOperation operation) {
        return switch (operation) {
            case PDF_TO_WORD -> DOCX;
            case PDF_TO_POWERPOINT -> PPTX;
            case PDF_TO_EXCEL -> XLSX;
            default -> throw new IllegalArgumentException("Not an Office export operation: " + operation);
        };
    }

    public static PdfOfficeExportFormat parseToolId(String toolId) {
        if (toolId == null || toolId.isBlank()) {
            throw new IllegalArgumentException("tool id is required.");
        }
        return switch (toolId.trim().toLowerCase(Locale.ROOT).replace('_', '-')) {
            case "pdf-to-word" -> DOCX;
            case "pdf-to-powerpoint" -> PPTX;
            case "pdf-to-excel" -> XLSX;
            default -> throw new IllegalArgumentException("Unsupported Office export: " + toolId);
        };
    }
}
