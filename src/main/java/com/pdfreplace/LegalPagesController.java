package com.pdfreplace;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Plain HTML legal pages for crawlers (AdSense, Google) and direct links — no SPA required.
 */
@Controller
public class LegalPagesController {

    @GetMapping(value = "/privacy", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> privacy() throws IOException {
        return html("legal/privacy.html");
    }

    @GetMapping(value = "/terms", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> terms() throws IOException {
        return html("legal/terms.html");
    }

    @GetMapping(value = "/faq", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> faq() throws IOException {
        return html("legal/faq.html");
    }

    private static ResponseEntity<String> html(String classpath) throws IOException {
        ClassPathResource resource = new ClassPathResource(classpath);
        String body = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(body);
    }
}
