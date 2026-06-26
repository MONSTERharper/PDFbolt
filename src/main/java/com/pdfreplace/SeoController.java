package com.pdfreplace;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Root-level SEO files ({@code /robots.txt}, {@code /sitemap.xml}) — not under {@code /app/}.
 */
@RestController
public class SeoController {

    private static final Map<String, String> SLUG_OVERRIDES = Map.of("images-to-pdf", "image-to-pdf");

    private static final List<String> TOOL_IDS = List.of(
            "merge",
            "split",
            "remove-pages",
            "extract-pages",
            "organize-pdf",
            "scan-to-pdf",
            "compress",
            "repair-pdf",
            "ocr-pdf",
            "images-to-pdf",
            "word-to-pdf",
            "powerpoint-to-pdf",
            "excel-to-pdf",
            "html-to-pdf",
            "pdf-to-jpg",
            "pdf-to-word",
            "pdf-to-powerpoint",
            "pdf-to-excel",
            "pdf-to-pdfa",
            "pdf-to-dxf",
            "replace",
            "rotate-pdf",
            "add-page-numbers",
            "add-watermark",
            "crop-pdf",
            "edit-pdf",
            "pdf-forms",
            "unlock-pdf",
            "protect-pdf",
            "sign-pdf",
            "redact-pdf",
            "compare-pdf"
    );

    private static final List<String> STATIC_PATHS = List.of(
            "/",
            "/directory",
            "/tools",
            "/guides",
            "/about",
            "/contact",
            "/faq",
            "/status",
            "/privacy",
            "/terms"
    );

    @Value("${boltreplacer.site.base-url:https://mypdfbolt.shop}")
    private String baseUrl;

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String robots() {
        String origin = normalizeBaseUrl();
        return """
                User-agent: *
                Allow: /

                Sitemap: %s/sitemap.xml
                """.formatted(origin).trim() + "\n";
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        String origin = normalizeBaseUrl();
        String today = LocalDate.now().toString();
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (String path : STATIC_PATHS) {
            appendUrl(xml, origin + path, today, path.equals("/") ? "daily" : "weekly");
        }
        for (String toolId : TOOL_IDS) {
            String slug = SLUG_OVERRIDES.getOrDefault(toolId, toolId);
            appendUrl(xml, origin + "/bolt/" + slug, today, "weekly");
        }
        for (GuideCatalog.Guide guide : GuideCatalog.all()) {
            appendUrl(xml, origin + "/guides/" + guide.slug(), today, "monthly");
        }
        xml.append("</urlset>\n");
        return xml.toString();
    }

    private void appendUrl(StringBuilder xml, String loc, String lastmod, String changefreq) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(escapeXml(loc)).append("</loc>\n");
        xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("  </url>\n");
    }

    private String normalizeBaseUrl() {
        String trimmed = baseUrl == null ? "" : baseUrl.trim();
        if (trimmed.isEmpty()) {
            return "https://mypdfbolt.shop";
        }
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    private static String escapeXml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
