package com.pdfreplace;

import java.util.Locale;

final class HtmlDocumentBuilder {
    private HtmlDocumentBuilder() {}

    static String toFullDocument(String html, String title) {
        if (html == null || html.isBlank()) {
            throw new IllegalArgumentException("HTML content is required.");
        }
        String body = html.strip();
        String lower = body.toLowerCase(Locale.ROOT);
        if (lower.contains("<html")) {
            return body;
        }
        String docTitle = title == null || title.isBlank() ? "Document" : title.strip();
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8"/>
                  <title>%s</title>
                </head>
                <body>
                %s
                </body>
                </html>
                """.formatted(escapeHtml(docTitle), body);
    }

    private static String escapeHtml(String raw) {
        return raw
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
