package com.pdfreplace;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Public AdSense settings for the React app (banner slot, client id).
 * Configure on the server via .env — no UI rebuild required when the slot changes.
 */
@RestController
@RequestMapping("/api/public")
public class AdsensePublicController {

    @Value("${boltreplacer.adsense.enabled:true}")
    private boolean enabled;

    @Value("${boltreplacer.adsense.client:ca-pub-3054286166063522}")
    private String client;

    @Value("${boltreplacer.adsense.banner-slot:}")
    private String bannerSlot;

    @Value("${boltreplacer.adsense.sidebar-slot:}")
    private String sidebarSlot;

    @GetMapping("/ads-config")
    public Map<String, Object> adsConfig() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("enabled", enabled);
        body.put("client", client.trim());
        body.put("bannerSlot", bannerSlot.trim());
        body.put("sidebarSlot", sidebarSlot.isBlank() ? bannerSlot.trim() : sidebarSlot.trim());
        return body;
    }
}
