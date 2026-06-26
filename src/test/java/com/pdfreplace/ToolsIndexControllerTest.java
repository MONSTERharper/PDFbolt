package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ToolsIndexControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void toolsIndexIsStandaloneHtmlWithAllTools() throws Exception {
        mockMvc.perform(get("/tools"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(content().string(containsString("<!DOCTYPE html>")))
                .andExpect(content().string(containsString("<h1>All PDFbolt tools</h1>")))
                .andExpect(content().string(containsString("Merge PDF")))
                .andExpect(content().string(containsString("href=\"/bolt/merge\"")))
                .andExpect(content().string(containsString("Compress PDF")))
                .andExpect(content().string(containsString("Replace Text")))
                .andExpect(content().string(containsString("rel=\"canonical\" href=\"https://mypdfbolt.shop/tools\"")))
                .andExpect(content().string(not(containsString("<div id=\"root\">"))));
    }

    @Test
    void sitemapIncludesToolsIndex() throws Exception {
        mockMvc.perform(get("/sitemap.xml"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("https://mypdfbolt.shop/tools")));
    }
}
