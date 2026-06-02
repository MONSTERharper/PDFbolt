package com.pdfreplace;

public record PdfAConversionResult(byte[] pdfBytes, boolean validated, String validationNote) {
}
