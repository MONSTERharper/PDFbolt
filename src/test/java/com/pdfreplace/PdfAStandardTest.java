package com.pdfreplace;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PdfAStandardTest {

    @Test
    void verapdfFlavourMatchesIsoLevels() {
        assertEquals("1b", PdfAStandard.PDF_A_1B.verapdfFlavour());
        assertEquals("2b", PdfAStandard.PDF_A_2B.verapdfFlavour());
        assertEquals("3b", PdfAStandard.PDF_A_3B.verapdfFlavour());
    }

    @Test
    void parseUiLabels() {
        assertEquals(PdfAStandard.PDF_A_1B, PdfAStandard.parse("PDF/A-1b (ISO 19005-1)"));
        assertEquals(PdfAStandard.PDF_A_2B, PdfAStandard.parse("PDF/A-2b (ISO 19005-2)"));
        assertEquals(PdfAStandard.PDF_A_3B, PdfAStandard.parse("PDF/A-3b (ISO 19005-3)"));
    }

    @Test
    void parseDoesNotConfuseIsoRevisionInOneBLabel() {
        assertEquals(PdfAStandard.PDF_A_1B, PdfAStandard.parse("PDF/A-1b (ISO 19005-1)"));
        assertEquals(PdfAStandard.PDF_A_1B, PdfAStandard.parse("pdf/a-1b"));
    }

    @Test
    void parseBlankDefaultsToOneB() {
        assertEquals(PdfAStandard.PDF_A_1B, PdfAStandard.parse(null));
        assertEquals(PdfAStandard.PDF_A_1B, PdfAStandard.parse("  "));
    }
}
