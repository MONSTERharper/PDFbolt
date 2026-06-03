package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "boltreplacer.adsense.enabled=true",
        "boltreplacer.adsense.client=ca-pub-test123",
        "boltreplacer.adsense.banner-slot=1112223334"
})
class AdsensePublicControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void adsConfigReturnsServerSettings() throws Exception {
        mockMvc.perform(get("/api/public/ads-config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled", is(true)))
                .andExpect(jsonPath("$.client", is("ca-pub-test123")))
                .andExpect(jsonPath("$.bannerSlot", is("1112223334")));
    }
}
