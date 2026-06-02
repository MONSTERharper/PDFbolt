package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Smoke tests for tools controller validation. Detailed coverage: {@link BoltLiveToolsApiTest}. */
@SpringBootTest
@AutoConfigureMockMvc
class PdfToolsControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void missingOperationIsRejected() throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownOperationIsRejected() throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools")
                        .param("operation", "not-real"))
                .andExpect(status().isBadRequest());
    }
}
