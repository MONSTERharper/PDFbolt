package com.pdfreplace;

/**
 * SEO metadata for a public HTML page (served before the SPA hydrates).
 */
public record SitePageMeta(String title, String heading, String description) {
    static SitePageMeta tool(String cleanName, String description) {
        String title = cleanName + " — PDFbolt";
        return new SitePageMeta(title, cleanName, description);
    }

    static SitePageMeta staticPage(String title, String heading, String description) {
        return new SitePageMeta(title, heading, description);
    }
}
