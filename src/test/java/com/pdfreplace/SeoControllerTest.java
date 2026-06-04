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
class SeoControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void robotsTxtReferencesSitemap() throws Exception {
        mockMvc.perform(get("/robots.txt"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Sitemap:")))
                .andExpect(content().string(containsString("sitemap.xml")));
    }

    @Test
    void sitemapListsBoltToolsAndFaq() throws Exception {
        mockMvc.perform(get("/sitemap.xml"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("/bolt/merge")))
                .andExpect(content().string(containsString("/bolt/image-to-pdf")))
                .andExpect(content().string(containsString("/faq")))
                .andExpect(content().string(containsString("/status")));
    }
}
