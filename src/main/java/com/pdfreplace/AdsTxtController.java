package com.pdfreplace;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves {@code /ads.txt} for Google AdSense (required at the site root, not under {@code /app/}).
 */
@RestController
public class AdsTxtController {

    @Value("${boltreplacer.adsense.ads-txt-line:google.com, pub-3054286166063522, DIRECT, f08c47fec0942fa0}")
    private String adsTxtLine;

    @GetMapping(value = "/ads.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String adsTxt() {
        return adsTxtLine.trim() + "\n";
    }
}
