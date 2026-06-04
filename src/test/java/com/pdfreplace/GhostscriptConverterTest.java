package com.pdfreplace;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

/**
 * Guards veraPDF {@code --flavour} mapping (must be {@code 1b}/{@code 2b}/{@code 3b}, not {@code 11b}).
 */
class GhostscriptConverterTest {

    @Test
    void verapdfFlavourUsesConformanceOnly() throws Exception {
        Method method = GhostscriptConverter.class.getDeclaredMethod("verapdfFlavour", PdfAStandard.class);
        method.setAccessible(true);

        assertEquals("1b", method.invoke(null, PdfAStandard.PDF_A_1B));
        assertEquals("2b", method.invoke(null, PdfAStandard.PDF_A_2B));
        assertEquals("3b", method.invoke(null, PdfAStandard.PDF_A_3B));

        assertNotEquals(
                String.valueOf(PdfAStandard.PDF_A_1B.ghostscriptLevel()) + PdfAStandard.PDF_A_1B.verapdfFlavour(),
                method.invoke(null, PdfAStandard.PDF_A_1B));
    }
}
