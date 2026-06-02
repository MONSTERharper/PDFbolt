package com.pdfreplace;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OfficeDocumentTypeTest {
    @Test
    void acceptsWordExtensions() {
        assertDoesNotThrow(() -> OfficeDocumentType.WORD.ensureFilename("report.docx"));
        assertDoesNotThrow(() -> OfficeDocumentType.WORD.ensureFilename("legacy.doc"));
    }

    @Test
    void rejectsWrongExtensionForWord() {
        assertThrows(IllegalArgumentException.class, () -> OfficeDocumentType.WORD.ensureFilename("sheet.xlsx"));
    }

    @Test
    void resolvesFromOperationId() {
        assertTrue(OfficeDocumentType.forOperation("excel-to-pdf") == OfficeDocumentType.EXCEL);
    }
}
