package com.pdfreplace;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/**
 * Serves the SPA shell with route-specific meta tags and crawler-visible HTML inside {@code #root}.
 */
@Service
public class SpaHtmlRenderer {
    private static final Pattern TITLE = Pattern.compile("<title>[^<]*</title>", Pattern.CASE_INSENSITIVE);
    private static final Pattern META_DESCRIPTION = Pattern.compile(
            "<meta name=\"description\" content=\"[^\"]*\"\\s*/?>",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern OG_TITLE = Pattern.compile(
            "<meta property=\"og:title\" content=\"[^\"]*\"\\s*/?>",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern OG_DESCRIPTION = Pattern.compile(
            "<meta property=\"og:description\" content=\"[^\"]*\"\\s*/?>",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern OG_URL = Pattern.compile(
            "<meta property=\"og:url\" content=\"[^\"]*\"\\s*/?>",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern TWITTER_TITLE = Pattern.compile(
            "<meta name=\"twitter:title\" content=\"[^\"]*\"\\s*/?>",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern TWITTER_DESCRIPTION = Pattern.compile(
            "<meta name=\"twitter:description\" content=\"[^\"]*\"\\s*/?>",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern ROOT_DIV = Pattern.compile(
            "<div id=\"root\">\\s*</div>",
            Pattern.CASE_INSENSITIVE);

    private final String indexHtmlTemplate;
    private final String baseUrl;

    public SpaHtmlRenderer(@Value("${boltreplacer.site.base-url:https://mypdfbolt.shop}") String baseUrl)
            throws IOException {
        this.baseUrl = normalizeBaseUrl(baseUrl);
        this.indexHtmlTemplate = new ClassPathResource("static/app/index.html")
                .getContentAsString(StandardCharsets.UTF_8);
    }

    public ResponseEntity<String> renderPage(String requestPath) {
        SitePageMeta meta = SitePageCatalog.resolve(requestPath);
        String path = normalizePath(requestPath);
        String canonical = baseUrl + path;
        String html = personalize(indexHtmlTemplate, meta, canonical, path);
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    String personalize(String template, SitePageMeta meta, String canonicalUrl, String path) {
        String title = escapeHtml(meta.title());
        String description = escapeHtml(meta.description());
        String html = template;
        html = TITLE.matcher(html).replaceFirst("<title>" + title + "</title>");
        html = META_DESCRIPTION.matcher(html).replaceFirst(
                "<meta name=\"description\" content=\"" + description + "\" />");
        html = OG_TITLE.matcher(html).replaceFirst(
                "<meta property=\"og:title\" content=\"" + title + "\" />");
        html = OG_DESCRIPTION.matcher(html).replaceFirst(
                "<meta property=\"og:description\" content=\"" + description + "\" />");
        if (OG_URL.matcher(html).find()) {
            html = OG_URL.matcher(html).replaceFirst(
                    "<meta property=\"og:url\" content=\"" + escapeHtml(canonicalUrl) + "\" />");
        } else {
            html = html.replaceFirst(
                    "</head>",
                    "    <meta property=\"og:url\" content=\"" + escapeHtml(canonicalUrl) + "\" />\n  </head>");
        }
        if (TWITTER_TITLE.matcher(html).find()) {
            html = TWITTER_TITLE.matcher(html).replaceFirst(
                    "<meta name=\"twitter:title\" content=\"" + title + "\" />");
        } else {
            html = html.replaceFirst(
                    "</head>",
                    "    <meta name=\"twitter:title\" content=\"" + title + "\" />\n  </head>");
        }
        if (TWITTER_DESCRIPTION.matcher(html).find()) {
            html = TWITTER_DESCRIPTION.matcher(html).replaceFirst(
                    "<meta name=\"twitter:description\" content=\"" + description + "\" />");
        } else {
            html = html.replaceFirst(
                    "</head>",
                    "    <meta name=\"twitter:description\" content=\"" + description + "\" />\n  </head>");
        }
        html = injectCanonical(html, canonicalUrl);
        html = injectJsonLd(html, meta, canonicalUrl, baseUrl);
        html = ROOT_DIV.matcher(html).replaceFirst("<div id=\"root\">" + prerenderBody(meta, path) + "</div>");
        return html;
    }

    private static String injectCanonical(String html, String canonicalUrl) {
        String tag = "<link rel=\"canonical\" href=\"" + escapeHtml(canonicalUrl) + "\" />";
        if (html.contains("rel=\"canonical\"")) {
            return html.replaceFirst(
                    "<link rel=\"canonical\" href=\"[^\"]*\"\\s*/?>",
                    tag);
        }
        return html.replaceFirst("</head>", "    " + tag + "\n  </head>");
    }

    private String injectJsonLd(String html, SitePageMeta meta, String canonicalUrl, String siteOrigin) {
        String jsonLd = """
                <script type="application/ld+json">{
                  "@context": "https://schema.org",
                  "@type": "WebPage",
                  "name": %s,
                  "description": %s,
                  "url": %s,
                  "isPartOf": {
                    "@type": "WebSite",
                    "name": "PDFbolt",
                    "url": %s
                  }
                }</script>""".formatted(
                jsonString(meta.title()),
                jsonString(meta.description()),
                jsonString(canonicalUrl),
                jsonString(siteOrigin));
        return html.replaceFirst("</head>", "    " + jsonLd + "\n  </head>");
    }

    private static String jsonString(String value) {
        return "\"" + value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "") + "\"";
    }

    private static String prerenderBody(SitePageMeta meta, String path) {
        String heading = escapeHtml(meta.heading());
        String description = escapeHtml(meta.description());
        StringBuilder body = new StringBuilder();
        body.append("<main id=\"seo-prerender\">");
        body.append("<header><p><a href=\"/\">PDFbolt</a> — Free online PDF tools</p></header>");
        body.append("<h1>").append(heading).append("</h1>");
        body.append("<p>").append(description).append("</p>");
        if (!"/".equals(path) && !path.startsWith("/bolt/")) {
            body.append("<p><a href=\"/directory\">Browse all PDF tools</a></p>");
        } else if (path.startsWith("/bolt/")) {
            body.append("<p><a href=\"/directory\">Browse all PDF tools</a> · ");
            body.append("<a href=\"/\">PDFbolt home</a></p>");
        } else {
            body.append("<p><a href=\"/directory\">Browse all PDF tools</a></p>");
        }
        body.append("<noscript><p>Enable JavaScript to upload files and run this tool in your browser.</p></noscript>");
        body.append("</main>");
        return body.toString();
    }

    private static String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private static String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            return "/";
        }
        String trimmed = path.trim();
        if (trimmed.length() > 1 && trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed.isEmpty() ? "/" : trimmed;
    }

    private static String normalizeBaseUrl(String raw) {
        String trimmed = raw == null ? "" : raw.trim();
        if (trimmed.isEmpty()) {
            return "https://mypdfbolt.shop";
        }
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }
}
