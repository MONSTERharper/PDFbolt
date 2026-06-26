package com.pdfreplace;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves a standalone, crawler-readable HTML index of every PDFbolt tool at {@code /tools}.
 * Unlike the React app shell, this page is plain HTML with no JavaScript requirement.
 */
@RestController
public class ToolsIndexController {

    @Value("${boltreplacer.site.base-url:https://mypdfbolt.shop}")
    private String baseUrl;

    @GetMapping(value = "/tools", produces = MediaType.TEXT_HTML_VALUE)
    public String toolsIndex() {
        String origin = normalizeBaseUrl();
        int count = ToolsIndexCatalog.toolCount();
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n");
        html.append("  <meta charset=\"UTF-8\" />\n");
        html.append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n");
        html.append("  <title>All PDF tools — PDFbolt</title>\n");
        html.append("  <meta name=\"description\" content=\"Browse all ")
                .append(count)
                .append(" free online PDF tools on PDFbolt — merge, split, compress, convert, edit, sign, and secure PDF files.\" />\n");
        html.append("  <link rel=\"canonical\" href=\"").append(origin).append("/tools\" />\n");
        html.append("  <meta property=\"og:type\" content=\"website\" />\n");
        html.append("  <meta property=\"og:site_name\" content=\"PDFbolt\" />\n");
        html.append("  <meta property=\"og:title\" content=\"All PDF tools — PDFbolt\" />\n");
        html.append("  <meta property=\"og:description\" content=\"Browse all ")
                .append(count)
                .append(" free online PDF tools — merge, split, compress, convert, edit, sign, and secure PDF files.\" />\n");
        html.append("  <meta property=\"og:url\" content=\"").append(origin).append("/tools\" />\n");
        html.append("  <meta property=\"og:image\" content=\"").append(origin).append("/og-image.png\" />\n");
        html.append("</head>\n<body style=\"font-family: system-ui, sans-serif; max-width: 48rem; margin: 2rem auto; padding: 0 1rem; color: #141414; line-height: 1.6;\">\n");
        html.append("  <p><a href=\"/\">← PDFbolt home</a> · <a href=\"/directory\">Interactive directory</a> · <a href=\"/guides\">Guides</a></p>\n");
        html.append("  <h1>All PDFbolt tools</h1>\n");
        html.append("  <p>PDFbolt offers <strong>").append(count).append("</strong> free online PDF tools. ");
        html.append("Each tool below opens in your browser — no install and no account. ");
        html.append("Most tools process your file on our server for a single job and remove it afterward; ");
        html.append("Sign, Redact, and Unlock run entirely in your browser.</p>\n");

        for (ToolsIndexCatalog.Category category : ToolsIndexCatalog.categories()) {
            html.append("  <section style=\"margin-top: 2.5rem;\">\n");
            html.append("    <h2 style=\"font-size: 1.35rem; margin-bottom: 0.25rem;\">")
                    .append(escapeHtml(category.title()))
                    .append("</h2>\n");
            html.append("    <p style=\"color: #57534e; margin-top: 0;\">")
                    .append(escapeHtml(category.description()))
                    .append("</p>\n");

            for (ToolsIndexCatalog.ToolRef toolRef : category.tools()) {
                String toolId = toolRef.toolId();
                String slug = ToolsIndexCatalog.slugForToolId(toolId);
                String path = "/bolt/" + slug;
                SitePageMeta meta = SitePageCatalog.resolve(path);
                SitePageContent.Content content = SitePageContent.resolve(path);
                String intro = content != null && !content.paragraphs().isEmpty()
                        ? content.paragraphs().get(0)
                        : meta.description();

                html.append("    <article style=\"margin: 1.25rem 0; padding-bottom: 1rem; border-bottom: 1px solid #e7e5e4;\">\n");
                html.append("      <h3 style=\"margin: 0 0 0.35rem;\"><a href=\"")
                        .append(path)
                        .append("\" style=\"color: #FF3300; text-decoration: none;\">")
                        .append(escapeHtml(meta.heading()))
                        .append("</a></h3>\n");
                html.append("      <p style=\"margin: 0.25rem 0; color: #57534e;\"><em>")
                        .append(escapeHtml(meta.description()))
                        .append("</em></p>\n");
                html.append("      <p style=\"margin: 0.5rem 0 0;\">")
                        .append(escapeHtml(intro))
                        .append("</p>\n");
                if ("ocr-pdf".equals(toolId)) {
                    html.append("      <p style=\"margin: 0.35rem 0 0; color: #92400e;\"><strong>Coming soon</strong> — visible in the directory but not runnable yet.</p>\n");
                }
                html.append("    </article>\n");
            }
            html.append("  </section>\n");
        }

        html.append("  <footer style=\"margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #e7e5e4; font-size: 0.9rem; color: #57534e;\">\n");
        html.append("    <p><a href=\"/about\">About</a> · <a href=\"/faq\">Help &amp; FAQ</a> · <a href=\"/privacy\">Privacy</a> · <a href=\"/terms\">Terms</a> · <a href=\"/contact\">Contact</a></p>\n");
        html.append("  </footer>\n");
        html.append("</body>\n</html>\n");
        return html.toString();
    }

    private String normalizeBaseUrl() {
        String trimmed = baseUrl == null ? "" : baseUrl.trim();
        if (trimmed.isEmpty()) {
            return "https://mypdfbolt.shop";
        }
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    private static String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
