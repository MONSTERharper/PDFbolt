package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Path;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BoltCompressApiTest {
    @Autowired
    private MockMvc mockMvc;

    @TempDir
    Path tempDir;

    @ParameterizedTest
    @ValueSource(strings = {"high", "balanced", "strong"})
    void compressWithEachLevel(String level) throws Exception {
        Path input = tempDir.resolve("sample.pdf");
        PdfTestSupport.createPdfWithText(input, "Compress " + level);
        byte[] pdf = PdfTestSupport.readBytes(input);

        byte[] body = mockMvc.perform(multipart("/api/compress")
                        .file(PdfTestSupport.mockPdf("files", "sample.pdf", pdf))
                        .param("level", level)
                        .param("retainMetadata", "true"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("X-Bolt-Compress-Level", level))
                .andExpect(header().exists("X-Bolt-Compress-Original-Bytes"))
                .andExpect(header().exists("X-Bolt-Compress-Output-Bytes"))
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        PdfTestSupport.assertPdfMagic(body);
    }

    @Test
    void compressRejectsMissingFile() throws Exception {
        mockMvc.perform(multipart("/api/compress")
                        .param("level", "balanced"))
                .andExpect(status().isBadRequest());
    }
}
