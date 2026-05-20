package com.pdfreplace;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.File;
import java.nio.file.Files;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Simulates the React UI multipart POST to {@code /api/replace} for the Neuberg sample PDF.
 */
@SpringBootTest
@AutoConfigureMockMvc
class NeubergApiReplaceTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void apiReplaceSarveshLikeFrontend() throws Exception {
        File sample = new File("src/test/resources/neuberg-sarvesh-sample.pdf");
        if (!sample.isFile()) {
            return;
        }
        byte[] pdfBytes = Files.readAllBytes(sample.toPath());
        MockMultipartFile file = new MockMultipartFile(
                "files",
                "7338566739.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                pdfBytes
        );

        MvcResult result = mockMvc.perform(multipart("/api/replace")
                        .file(file)
                        .param("search", "JOHN DOE")
                        .param("replacement", "JANE DOE")
                        .param("matchMode", "exact")
                        .param("replaceScope", "all")
                        .param("strict", "false")
                        .param("preserveStyle", "true")
                        .param("retainMetadata", "true"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Bolt-Replacer-Matches", "1"))
                .andReturn();

        String text = extractText(result.getResponse().getContentAsByteArray());
        assertTrue(text.contains("JANE DOE"), () -> text);
        assertFalse(text.contains("JOHN DOE"), () -> text);
    }

    @Test
    void apiReplaceMobileLikeFrontend() throws Exception {
        File sample = new File("src/test/resources/neuberg-sarvesh-sample.pdf");
        if (!sample.isFile()) {
            return;
        }
        byte[] pdfBytes = Files.readAllBytes(sample.toPath());
        MockMultipartFile file = new MockMultipartFile(
                "files",
                "7338566739.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                pdfBytes
        );

        MvcResult result = mockMvc.perform(multipart("/api/replace")
                        .file(file)
                        .param("search", "5550100000")
                        .param("replacement", "9999999999")
                        .param("matchMode", "exact")
                        .param("replaceScope", "all")
                        .param("strict", "false")
                        .param("preserveStyle", "true")
                        .param("retainMetadata", "true"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Bolt-Replacer-Matches", "1"))
                .andReturn();

        String text = extractText(result.getResponse().getContentAsByteArray());
        assertTrue(text.contains("9999999999"), () -> text);
        assertFalse(text.contains("5550100000"), () -> text);
    }

    private static String extractText(byte[] pdfBytes) throws Exception {
        try (PDDocument document = PDDocument.load(pdfBytes)) {
            return new PDFTextStripper().getText(document).replace('\n', ' ');
        }
    }
}
