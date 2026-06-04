package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfToolOperationTest {
    @ParameterizedTest
    @ValueSource(strings = {
            "merge",
            "split",
            "remove-pages",
            "extract-pages",
            "organize-pdf",
            "images-to-pdf",
            "scan-to-pdf",
            "word-to-pdf",
            "powerpoint-to-pdf",
            "excel-to-pdf",
            "html-to-pdf",
            "repair-pdf",
            "pdf-to-jpg",
            "pdf-to-word",
            "pdf-to-powerpoint",
            "pdf-to-excel",
            "pdf-to-csv",
            "rotate-pdf",
            "add-page-numbers",
            "add-watermark",
            "crop-pdf",
            "edit-pdf",
            "pdf-forms",
            "unlock-pdf",
            "protect-pdf",
            "sign-pdf",
            "redact-pdf",
            "compare-pdf",
            "pdf-to-pdfa"
    })
    void parsesLiveOperations(String operationId) {
        PdfToolOperation operation = PdfToolOperation.parse(operationId);
        assertTrue(operation.name().length() > 0);
        assertTrue(!PdfToolOperation.isWip(operationId));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "ocr-pdf"
    })
    void rejectsWipOperations(String operationId) {
        assertTrue(PdfToolOperation.isWip(operationId));
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> PdfToolOperation.parse(operationId));
        assertTrue(ex.getMessage().contains("work in progress"));
    }

    @Test
    void normalizesUnderscoresAndCase() {
        assertEquals(PdfToolOperation.MERGE, PdfToolOperation.parse("MERGE"));
        assertEquals(PdfToolOperation.ROTATE_PDF, PdfToolOperation.parse("rotate_pdf"));
    }

    @Test
    void rejectsBlankOperation() {
        assertThrows(IllegalArgumentException.class, () -> PdfToolOperation.parse("  "));
    }

    @Test
    void rejectsUnknownOperation() {
        assertThrows(IllegalArgumentException.class, () -> PdfToolOperation.parse("not-a-bolt-tool"));
    }
}
