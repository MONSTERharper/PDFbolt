package com.pdfreplace;

import java.util.Locale;
import java.util.Set;

public enum PdfToolOperation {
    MERGE,
    SPLIT,
    REMOVE_PAGES,
    EXTRACT_PAGES,
    ORGANIZE_PDF,
    IMAGES_TO_PDF,
    REPAIR_PDF,
    OCR_PDF,
    WORD_TO_PDF,
    POWERPOINT_TO_PDF,
    EXCEL_TO_PDF,
    TEXT_TO_PDF,
    HTML_TO_PDF,
    PDF_TO_JPG,
    PDF_TO_WORD,
    PDF_TO_POWERPOINT,
    PDF_TO_EXCEL,
    PDF_TO_TEXT,
    PDF_TO_CSV,
    PDF_TO_PDFA,
    PDF_TO_DXF,
    ROTATE_PDF,
    ADD_PAGE_NUMBERS,
    ADD_WATERMARK,
    CROP_PDF,
    EDIT_PDF,
    PDF_FORMS,
    UNLOCK_PDF,
    PROTECT_PDF,
    SIGN_PDF,
    REDACT_PDF,
    COMPARE_PDF;

    private static final Set<String> WIP_OPERATIONS = Set.of(
            "ocr-pdf"
    );

    public static boolean isWip(String raw) {
        if (raw == null || raw.isBlank()) {
            return false;
        }
        return WIP_OPERATIONS.contains(raw.trim().toLowerCase(Locale.ROOT).replace('_', '-'));
    }

    public static PdfToolOperation parse(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("operation is required.");
        }
        if (isWip(raw)) {
            throw new IllegalArgumentException(
                    "This tool is not available yet (work in progress). Check the suite directory for Live tools.");
        }
        String normalized = raw.trim().toLowerCase(Locale.ROOT).replace('_', '-');
        return switch (normalized) {
            case "merge" -> MERGE;
            case "split" -> SPLIT;
            case "remove-pages" -> REMOVE_PAGES;
            case "extract-pages" -> EXTRACT_PAGES;
            case "organize-pdf" -> ORGANIZE_PDF;
            case "scan-to-pdf", "jpg-to-pdf", "images-to-pdf" -> IMAGES_TO_PDF;
            case "repair-pdf" -> REPAIR_PDF;
            case "ocr-pdf" -> OCR_PDF;
            case "word-to-pdf" -> WORD_TO_PDF;
            case "powerpoint-to-pdf" -> POWERPOINT_TO_PDF;
            case "excel-to-pdf" -> EXCEL_TO_PDF;
            case "html-to-pdf" -> HTML_TO_PDF;
            case "text-to-pdf" -> TEXT_TO_PDF;
            case "pdf-to-jpg" -> PDF_TO_JPG;
            case "pdf-to-word" -> PDF_TO_WORD;
            case "pdf-to-powerpoint" -> PDF_TO_POWERPOINT;
            case "pdf-to-excel" -> PDF_TO_EXCEL;
            case "pdf-to-text" -> PDF_TO_TEXT;
            case "pdf-to-csv" -> PDF_TO_CSV;
            case "pdf-to-pdfa" -> PDF_TO_PDFA;
            case "pdf-to-dxf" -> PDF_TO_DXF;
            case "rotate-pdf" -> ROTATE_PDF;
            case "add-page-numbers" -> ADD_PAGE_NUMBERS;
            case "add-watermark" -> ADD_WATERMARK;
            case "crop-pdf" -> CROP_PDF;
            case "edit-pdf" -> EDIT_PDF;
            case "pdf-forms" -> PDF_FORMS;
            case "unlock-pdf" -> UNLOCK_PDF;
            case "protect-pdf" -> PROTECT_PDF;
            case "sign-pdf" -> SIGN_PDF;
            case "redact-pdf" -> REDACT_PDF;
            case "compare-pdf" -> COMPARE_PDF;
            default -> throw new IllegalArgumentException("Unsupported operation: " + raw);
        };
    }
}
