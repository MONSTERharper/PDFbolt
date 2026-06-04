package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@EnabledIf("com.pdfreplace.GhostscriptConditions#isAvailable")
class PdfToPdfaServiceTest {
    @Autowired
    private PdfToPdfaService pdfToPdfaService;

    @TempDir
    Path tempDir;

    @Test
    void convertsSimplePdfToPdfA() throws Exception {
        Path sample = tempDir.resolve("sample.pdf");
        PdfTestSupport.createPdfWithText(sample, "PDF/A test");
        byte[] bytes = Files.readAllBytes(sample);
        MockMultipartFile upload = new MockMultipartFile(
                "file",
                "sample.pdf",
                "application/pdf",
                bytes);
        PdfAConversionResult result = pdfToPdfaService.convert(upload, PdfAStandard.PDF_A_1B, null, null);
        PdfTestSupport.assertPdfMagic(result.pdfBytes());
        assertTrue(result.pdfBytes().length > 100);
        assertNotNull(result.validationNote());
        assertFalse(result.validationNote().contains("11b"), "veraPDF flavour must not be 11b");
    }

    @Test
    void convertsWithUiLabel() throws Exception {
        Path sample = tempDir.resolve("label.pdf");
        PdfTestSupport.createPdfWithText(sample, "label");
        MockMultipartFile upload = new MockMultipartFile(
                "file",
                "label.pdf",
                "application/pdf",
                Files.readAllBytes(sample));
        PdfAStandard parsed = PdfAStandard.parse("PDF/A-1b (ISO 19005-1)");
        PdfAConversionResult result = pdfToPdfaService.convert(upload, parsed, null, null);
        assertTrue(result.pdfBytes().length > 100);
        assertFalse(result.validationNote().contains("11b"));
    }
}
