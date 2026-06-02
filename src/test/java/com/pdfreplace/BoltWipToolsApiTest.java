package com.pdfreplace;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * WIP tools must be rejected at the API layer with a clear message.
 */
@SpringBootTest
@AutoConfigureMockMvc
class BoltWipToolsApiTest {
    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest
    @ValueSource(strings = {
            "ocr-pdf"
    })
    void wipOperationReturnsBadRequest(String operation) throws Exception {
        mockMvc.perform(multipart("/api/pdf/tools")
                        .param("operation", operation)
                        .param("text", "sample"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("work in progress")));
    }
}
