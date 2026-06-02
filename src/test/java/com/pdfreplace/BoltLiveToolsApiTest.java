package com.pdfreplace;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.file.Path;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HTTP integration tests for every Live {@code /api/pdf/tools} operation.
 */
@SpringBootTest
@AutoConfigureMockMvc
class BoltLiveToolsApiTest {
    @Autowired
    private MockMvc mockMvc;

    @TempDir
    Path tempDir;

    private byte[] singlePagePdf;
    private byte[] twoPagePdf;

    @BeforeEach
    void setUp() throws Exception {
        Path one = tempDir.resolve("one.pdf");
        Path two = tempDir.resolve("two.pdf");
        PdfTestSupport.createPdfWithText(one, "Bolt test");
        PdfTestSupport.createPdfWithPages(two, 2);
        singlePagePdf = PdfTestSupport.readBytes(one);
        twoPagePdf = PdfTestSupport.readBytes(two);
    }

    @Test
    void merge() throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools")
                        .file(PdfTestSupport.mockPdf("files", "a.pdf", singlePagePdf))
                        .file(PdfTestSupport.mockPdf("files", "b.pdf", twoPagePdf))
                        .param("operation", "merge"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"));
    }

    @Test
    void split() throws Exception {
        mockMvc.perform(toolWithFile("split")
                        .param("pageRange", "1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void removePages() throws Exception {
        mockMvc.perform(toolWithFile("remove-pages")
                        .param("pageRange", "2"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void extractPages() throws Exception {
        mockMvc.perform(toolWithFile("extract-pages")
                        .param("pageRange", "1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void organizePdf() throws Exception {
        mockMvc.perform(toolWithFile("organize-pdf")
                        .param("pageOrder", "2, 1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void jpgToPdf() throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools")
                        .file(PdfTestSupport.mockPng("files", "scan.png"))
                        .param("operation", "jpg-to-pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void repairPdf() throws Exception {
        mockMvc.perform(toolWithFile("repair-pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void pdfToJpg() throws Exception {
        mockMvc.perform(toolWithFile("pdf-to-jpg")
                        .param("dpi", "72"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/zip"));
    }

    @Test
    void pdfToCsv() throws Exception {
        mockMvc.perform(toolWithFile("pdf-to-csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"));
    }

    @Test
    void rotatePdf() throws Exception {
        mockMvc.perform(toolWithFile("rotate-pdf")
                        .param("angle", "90")
                        .param("rotationScope", "All"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void addPageNumbers() throws Exception {
        mockMvc.perform(toolWithFile("add-page-numbers")
                        .param("pageNumberFormat", "Page {X}")
                        .param("pageNumberSize", "10")
                        .param("pageNumberAlignment", "Center"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void addWatermark() throws Exception {
        mockMvc.perform(toolWithFile("add-watermark")
                        .param("watermarkText", "CONFIDENTIAL")
                        .param("watermarkSize", "24")
                        .param("watermarkRotation", "45")
                        .param("watermarkOpacity", "0.3")
                        .param("watermarkColor", "#ff3300"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void cropPdf() throws Exception {
        mockMvc.perform(toolWithFile("crop-pdf")
                        .param("cropLeft", "10")
                        .param("cropRight", "10")
                        .param("cropTop", "10")
                        .param("cropBottom", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void editPdfMetadata() throws Exception {
        mockMvc.perform(toolWithFile("edit-pdf")
                        .param("metadataTitle", "Bolt Title")
                        .param("metadataAuthor", "Bolt Author")
                        .param("metadataSubject", "Testing")
                        .param("metadataCreator", "PDFBolt"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void pdfForms() throws Exception {
        mockMvc.perform(toolWithFile("pdf-forms"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void unlockPdf() throws Exception {
        mockMvc.perform(toolWithFile("unlock-pdf")
                        .param("password", ""))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void protectPdf() throws Exception {
        mockMvc.perform(toolWithFile("protect-pdf")
                        .param("password", "bolt-secret")
                        .param("ownerPassword", "bolt-secret"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void redactPdf() throws Exception {
        mockMvc.perform(toolWithFile("redact-pdf")
                        .param("redactPage", "1")
                        .param("redactX", "50")
                        .param("redactY", "650")
                        .param("redactWidth", "200")
                        .param("redactHeight", "40"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void comparePdf() throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools")
                        .file(PdfTestSupport.mockPdf("files", "a.pdf", singlePagePdf))
                        .file(PdfTestSupport.mockPdf("files", "b.pdf", twoPagePdf))
                        .param("operation", "compare-pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("overallMatch")));
    }

    @Test
    void signPdf() throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools")
                        .file(PdfTestSupport.mockPdf("file", "sample.pdf", twoPagePdf))
                        .file(PdfTestSupport.mockPng("signature", "signature.png"))
                        .param("operation", "sign-pdf")
                        .param("sigPage", "1")
                        .param("sigX", "50")
                        .param("sigY", "50")
                        .param("sigWidth", "100")
                        .param("sigHeight", "40"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder toolWithFile(
            String operation) {
        return multipart("/api/pdf/tools")
                .file(PdfTestSupport.mockPdf("file", "sample.pdf", twoPagePdf))
                .param("operation", operation);
    }
}
