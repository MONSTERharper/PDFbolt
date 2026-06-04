package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WebPageControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void spaRoutesReturnIndexHtml() throws Exception {
        for (String path : new String[] {"/", "/about", "/status", "/directory", "/contact"}) {
            mockMvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl(
                            "/app/index.html"));
        }
    }
}
