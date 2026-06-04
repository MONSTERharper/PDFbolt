package com.pdfreplace;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Public site settings for the React app (limits, support contact).
 */
@RestController
@RequestMapping("/api/public")
public class SitePublicController {

    @Value("${boltreplacer.site.support-email:support@mypdfbolt.shop}")
    private String supportEmail;

    @Value("${boltreplacer.limits.max-pages:250}")
    private int maxPages;

    @Value("${boltreplacer.limits.max-files:10}")
    private int maxFiles;

    @Value("${boltreplacer.limits.max-file-size-bytes:26214400}")
    private long maxFileSizeBytes;

    @Value("${boltreplacer.limits.max-total-upload-bytes:104857600}")
    private long maxTotalUploadBytes;

    @GetMapping("/site-config")
    public Map<String, Object> siteConfig() {
        Map<String, Object> limits = new LinkedHashMap<>();
        limits.put("maxPages", maxPages);
        limits.put("maxFiles", maxFiles);
        limits.put("maxFileSizeBytes", maxFileSizeBytes);
        limits.put("maxTotalUploadBytes", maxTotalUploadBytes);
        limits.put("maxFileSizeLabel", HumanMessages.formatBytes(maxFileSizeBytes));
        limits.put("maxTotalUploadLabel", HumanMessages.formatBytes(maxTotalUploadBytes));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("supportEmail", supportEmail.trim());
        body.put("limits", limits);
        return body;
    }
}
