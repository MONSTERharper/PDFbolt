package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfCompareEngineTest {
    @TempDir
    Path tempDir;

    @Test
    void detectsIdenticalPdfs() throws Exception {
        Path one = tempDir.resolve("a.pdf");
        PdfTestSupport.createPdfWithText(one, "Same content");
        Path two = tempDir.resolve("b.pdf");
        PdfTestSupport.createPdfWithText(two, "Same content");

        PdfCompareEngine.CompareResult result = PdfCompareEngine.compare(one, two, "a.pdf", "b.pdf");
        assertTrue(result.overallMatch());
        assertTrue(result.bytesIdentical() || result.pagesWithTextDifferences() == 0);
    }

    @Test
    void detectsTextDifference() throws Exception {
        Path one = tempDir.resolve("a.pdf");
        PdfTestSupport.createPdfWithText(one, "Version A");
        Path two = tempDir.resolve("b.pdf");
        PdfTestSupport.createPdfWithText(two, "Version B");

        PdfCompareEngine.CompareResult result = PdfCompareEngine.compare(one, two, "a.pdf", "b.pdf");
        assertFalse(result.overallMatch());
        assertTrue(result.pagesWithTextDifferences() >= 1);
    }
}
