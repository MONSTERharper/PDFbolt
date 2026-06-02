package com.pdfreplace;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.io.InputStream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Office → PDF via LibreOffice headless. Skipped when {@code soffice} is not installed.
 */
@SpringBootTest
@AutoConfigureMockMvc
@EnabledIf("com.pdfreplace.LibreOfficeConditions#isAvailable")
class LibreOfficeOfficeToolsApiTest {
    @Autowired
    private MockMvc mockMvc;

    private static byte[] sampleDocx;

    @BeforeAll
    static void loadSample() throws Exception {
        ClassPathResource resource = new ClassPathResource("samples/minimal.docx");
        try (InputStream in = resource.getInputStream()) {
            sampleDocx = in.readAllBytes();
        }
    }

    @Test
    void wordToPdf() throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools")
                        .file(new MockMultipartFile(
                                "file",
                                "minimal.docx",
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                sampleDocx))
                        .param("operation", "word-to-pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(content().contentType("application/pdf"));
    }
}
