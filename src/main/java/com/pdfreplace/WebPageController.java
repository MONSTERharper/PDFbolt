package com.pdfreplace;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class WebPageController {
    private final SpaHtmlRenderer spaHtmlRenderer;

    public WebPageController(SpaHtmlRenderer spaHtmlRenderer) {
        this.spaHtmlRenderer = spaHtmlRenderer;
    }

    @GetMapping({
            "/",
            "/about",
            "/contact",
            "/privacy",
            "/terms",
            "/faq",
            "/status",
            "/directory",
            "/replace",
            "/compress"
    })
    @ResponseBody
    public org.springframework.http.ResponseEntity<String> spaEntry(HttpServletRequest request) {
        return spaHtmlRenderer.renderPage(request.getRequestURI());
    }

    @GetMapping("/bolt/{slug}")
    @ResponseBody
    public org.springframework.http.ResponseEntity<String> boltTool(@PathVariable("slug") String slug) {
        return spaHtmlRenderer.renderPage("/bolt/" + slug);
    }

    @GetMapping("/tools/{toolId}")
    @ResponseBody
    public org.springframework.http.ResponseEntity<String> legacyTool(@PathVariable("toolId") String toolId) {
        return spaHtmlRenderer.renderPage("/tools/" + toolId);
    }
}
