package com.pdfreplace;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebPageController {
    @GetMapping({
            "/",
            "/about",
            "/contact",
            "/status",
            "/directory",
            "/bolt/{slug}",
            // Legacy URLs (SPA redirects to /bolt/…)
            "/replace",
            "/compress",
            "/tools/{toolId}"
    })
    public String spaEntry() {
        return "forward:/app/index.html";
    }
}
