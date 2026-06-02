package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@EnabledIf("com.pdfreplace.LibreOfficeConditions#isAvailable")
class LibreOfficeHtmlToolsApiTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void htmlToPdf() throws Exception {
        String html = """
                <h1>PDFbolt HTML test</h1>
                <p>Rendered via LibreOffice.</p>
                """;
        mockMvc.perform(multipart("/api/pdf/tools")
                        .param("operation", "html-to-pdf")
                        .param("text", html)
                        .param("title", "Sample HTML"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void htmlToPdfFromFile() throws Exception {
        byte[] html = "<!DOCTYPE html><html><body><h1>File upload</h1></body></html>"
                .getBytes(StandardCharsets.UTF_8);
        mockMvc.perform(multipart("/api/pdf/tools")
                        .file(new MockMultipartFile(
                                "file",
                                "page.html",
                                "text/html",
                                html))
                        .param("operation", "html-to-pdf")
                        .param("title", "Uploaded"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }
}
