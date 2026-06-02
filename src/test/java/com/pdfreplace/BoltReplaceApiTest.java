package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Path;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BoltReplaceApiTest {
    @Autowired
    private MockMvc mockMvc;

    @TempDir
    Path tempDir;

    @Test
    void replaceAllMatches() throws Exception {
        Path input = tempDir.resolve("invoice.pdf");
        PdfTestSupport.createPdfWithText(input, "Invoice invoice");
        byte[] pdf = PdfTestSupport.readBytes(input);

        mockMvc.perform(multipart("/api/replace")
                        .file(PdfTestSupport.mockPdf("file", "invoice.pdf", pdf))
                        .param("search", "invoice")
                        .param("replacement", "bill")
                        .param("matchMode", "caseInsensitive")
                        .param("replaceScope", "all"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Bolt-Replacer-Matches"))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void replaceNthOccurrence() throws Exception {
        Path input = tempDir.resolve("repeat.pdf");
        PdfTestSupport.createPdfWithText(input, "bolt bolt bolt");
        byte[] pdf = PdfTestSupport.readBytes(input);

        mockMvc.perform(multipart("/api/replace")
                        .file(PdfTestSupport.mockPdf("file", "repeat.pdf", pdf))
                        .param("search", "bolt")
                        .param("replacement", "BOLT")
                        .param("matchMode", "exact")
                        .param("replaceScope", "nth")
                        .param("occurrenceIndex", "2"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Bolt-Replacer-Matches", "1"));
    }

    @Test
    void replaceRejectsEmptySearch() throws Exception {
        Path input = tempDir.resolve("empty.pdf");
        PdfTestSupport.createPdfWithText(input, "text");
        byte[] pdf = PdfTestSupport.readBytes(input);

        mockMvc.perform(multipart("/api/replace")
                        .file(PdfTestSupport.mockPdf("file", "empty.pdf", pdf))
                        .param("search", "   ")
                        .param("replacement", "x")
                        .param("matchMode", "exact")
                        .param("replaceScope", "all"))
                .andExpect(status().isBadRequest());
    }
}
