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
class WebPageControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void spaRoutesReturnSeoHtmlShell() throws Exception {
        for (String path : new String[] {
                "/",
                "/about",
                "/contact",
                "/privacy",
                "/terms",
                "/faq",
                "/status",
                "/directory"
        }) {
            mockMvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                    .andExpect(content().string(containsString("<div id=\"root\">")))
                    .andExpect(content().string(containsString("<main id=\"seo-prerender\">")));
        }
    }

    @Test
    void boltMergePageHasToolSpecificMetaAndBody() throws Exception {
        mockMvc.perform(get("/bolt/merge"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(content().string(containsString("<title>")))
                .andExpect(content().string(containsString("Merge PDF")))
                .andExpect(content().string(containsString("PDFbolt</title>")))
                .andExpect(content().string(containsString("Combine multiple PDFs into one file.")))
                .andExpect(content().string(containsString("<h1>Merge PDF</h1>")))
                .andExpect(content().string(containsString("rel=\"canonical\" href=\"https://mypdfbolt.shop/bolt/merge\"")))
                .andExpect(content().string(containsString("application/ld+json")));
    }

    @Test
    void boltImageSlugResolvesToImageToPdfCopy() throws Exception {
        mockMvc.perform(get("/bolt/image-to-pdf"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Image to PDF")))
                .andExpect(content().string(containsString("PDFbolt</title>")))
                .andExpect(content().string(containsString("HEIC")));
    }

    @Test
    void unknownBoltSlugGetsNotFoundMeta() throws Exception {
        mockMvc.perform(get("/bolt/not-a-real-tool"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Page not found")))
                .andExpect(content().string(containsString("PDFbolt</title>")))
                .andExpect(content().string(not(containsString("<div id=\"root\"></div>"))));
    }
}
