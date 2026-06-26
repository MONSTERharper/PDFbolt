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

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Simulates the React UI multipart POST to {@code /api/compress} for the Neuberg sample PDF.
 */
@SpringBootTest
@AutoConfigureMockMvc
class NeubergApiCompressTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void apiCompressNeubergHigh() throws Exception {
        postAndAssertLevel("high", "high");
    }

    @Test
    void apiCompressNeubergBalanced() throws Exception {
        postAndAssertLevel("balanced", "balanced");
    }

    @Test
    void apiCompressNeubergStrong() throws Exception {
        postAndAssertLevel("strong", "strong");
    }

    private void postAndAssertLevel(String requestLevel, String expectedLevelHeader) throws Exception {
        File sample = new File("src/test/resources/neuberg-sample.pdf");
        assumeTrue(sample.isFile(), "neuberg sample PDF missing");

        MockMultipartFile file = new MockMultipartFile(
                "files",
                "neuberg-sample.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                Files.readAllBytes(sample.toPath())
        );

        MvcResult result = mockMvc.perform(multipart("/api/compress")
                        .file(file)
                        .param("level", requestLevel)
                        .param("retainMetadata", "true"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("X-Bolt-Compress-Level", expectedLevelHeader))
                .andExpect(header().exists("X-Bolt-Compress-Original-Bytes"))
                .andExpect(header().exists("X-Bolt-Compress-Output-Bytes"))
                .andReturn();

        byte[] pdfBytes = result.getResponse().getContentAsByteArray();
        assertTrue(pdfBytes.length > 5);
        assertTrue(pdfBytes[0] == '%' && pdfBytes[1] == 'P');

        try (PDDocument document = PDDocument.load(pdfBytes)) {
            String text = new PDFTextStripper().getText(document).replace('\n', ' ');
            assertTrue(text.contains("JOHN DOE"), () -> text);
        }
    }
}
