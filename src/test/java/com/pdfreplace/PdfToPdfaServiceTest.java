package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

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
    }
}
