package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LegalPagesControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void privacyReturnsHtml() throws Exception {
        mockMvc.perform(get("/privacy"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string(containsString("Privacy policy")))
                .andExpect(content().string(containsString("Google AdSense")));
    }

    @Test
    void termsAndFaqReturnHtml() throws Exception {
        mockMvc.perform(get("/terms"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Terms of use")));
        mockMvc.perform(get("/faq"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Help")));
    }
}
