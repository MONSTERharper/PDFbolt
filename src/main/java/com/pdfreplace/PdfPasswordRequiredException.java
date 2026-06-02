package com.pdfreplace;

/**
 * Thrown when a PDF requires a password before processing.
 */
public class PdfPasswordRequiredException extends IllegalArgumentException {
    public static final String ERROR_CODE = "pdf_password_required";

    public PdfPasswordRequiredException(String message) {
        super(message);
    }
}
