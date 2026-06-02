package com.pdfreplace;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Path;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * PDF → Office via LibreOffice headless. Skipped when {@code soffice} is not installed.
 */
@SpringBootTest
@AutoConfigureMockMvc
@EnabledIf("com.pdfreplace.LibreOfficeConditions#isAvailable")
class LibreOfficePdfToOfficeApiTest {
    @Autowired
    private MockMvc mockMvc;

    @TempDir
    Path tempDir;

    private byte[] samplePdf;

    @BeforeEach
    void setUp() throws Exception {
        Path pdf = tempDir.resolve("sample.pdf");
        PdfTestSupport.createPdfWithText(pdf, "PDF to Office export test");
        samplePdf = PdfTestSupport.readBytes(pdf);
    }

    @Test
    void pdfToWord() throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools")
                        .file(PdfTestSupport.mockPdf("file", "sample.pdf", samplePdf))
                        .param("operation", "pdf-to-word"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
    }

    @Test
    void pdfToPowerpoint() throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools")
                        .file(PdfTestSupport.mockPdf("file", "sample.pdf", samplePdf))
                        .param("operation", "pdf-to-powerpoint"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.presentationml.presentation"));
    }

    @Test
    void pdfToExcel() throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools")
                        .file(PdfTestSupport.mockPdf("file", "sample.pdf", samplePdf))
                        .param("operation", "pdf-to-excel"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }
}
