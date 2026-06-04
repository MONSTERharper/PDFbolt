package com.pdfreplace;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Route → SEO metadata for server-rendered SPA shells (crawler-visible HTML).
 * Keep tool copy aligned with {@code new-ui/src/suiteCatalog.ts}.
 */
final class SitePageCatalog {
    private static final Map<String, String> SLUG_TO_TOOL_ID = Map.of(
            "image-to-pdf", "images-to-pdf",
            "jpg-to-pdf", "images-to-pdf"
    );

    private static final Map<String, SitePageMeta> BY_TOOL_ID = toolCatalog();
    private static final Map<String, SitePageMeta> BY_PATH = staticPages();

    private SitePageCatalog() {}

    static SitePageMeta resolve(String rawPath) {
        String path = normalizePath(rawPath);
        SitePageMeta direct = BY_PATH.get(path);
        if (direct != null) {
            return direct;
        }
        if (path.startsWith("/bolt/")) {
            String slug = path.substring("/bolt/".length());
            return resolveBoltSlug(slug);
        }
        if (path.startsWith("/tools/")) {
            String segment = path.substring("/tools/".length());
            String toolId = SLUG_TO_TOOL_ID.getOrDefault(segment, segment);
            return BY_TOOL_ID.getOrDefault(toolId, notFound());
        }
        if ("/replace".equals(path) || "/compress".equals(path)) {
            return BY_TOOL_ID.getOrDefault(path.substring(1), notFound());
        }
        return notFound();
    }

    private static SitePageMeta resolveBoltSlug(String slug) {
        String toolId = SLUG_TO_TOOL_ID.getOrDefault(slug, slug);
        return BY_TOOL_ID.getOrDefault(toolId, notFound());
    }

    private static SitePageMeta notFound() {
        return SitePageMeta.staticPage(
                "Page not found — PDFbolt",
                "Page not found",
                "This PDFbolt page could not be found. Browse our free online PDF tools from the home page.");
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

    private static Map<String, SitePageMeta> staticPages() {
        Map<String, SitePageMeta> pages = new LinkedHashMap<>();
        pages.put("/", SitePageMeta.staticPage(
                "PDFbolt — Online PDF tools",
                "PDFbolt — Free online PDF tools",
                "Free online PDF tools — merge, split, compress, convert, replace text, and more. "
                        + "Files are processed securely and not stored after download."));
        pages.put("/directory", SitePageMeta.staticPage(
                "All tools — PDFbolt",
                "All PDF tools",
                "Browse every PDFbolt tool — merge, split, compress, convert, sign, redact, and more."));
        pages.put("/about", SitePageMeta.staticPage(
                "About — PDFbolt",
                "About PDFbolt",
                "Learn about PDFbolt — free online PDF tools for merge, split, compress, convert, and edit."));
        pages.put("/contact", SitePageMeta.staticPage(
                "Contact — PDFbolt",
                "Contact PDFbolt",
                "Get in touch with the PDFbolt team for support, feedback, or partnership inquiries."));
        pages.put("/privacy", SitePageMeta.staticPage(
                "Privacy policy — PDFbolt",
                "Privacy policy",
                "How PDFbolt handles your files, cookies, analytics, advertising, and contact form data."));
        pages.put("/terms", SitePageMeta.staticPage(
                "Terms of use — PDFbolt",
                "Terms of use",
                "Terms and conditions for using PDFbolt online PDF tools."));
        pages.put("/faq", SitePageMeta.staticPage(
                "Help & FAQ — PDFbolt",
                "Help & FAQ",
                "Answers to common questions about PDFbolt tools, file limits, privacy, and supported formats."));
        pages.put("/status", SitePageMeta.staticPage(
                "Service status — PDFbolt",
                "Service status",
                "Current PDFbolt service status and uptime information."));
        return Map.copyOf(pages);
    }

    private static Map<String, SitePageMeta> toolCatalog() {
        Map<String, SitePageMeta> tools = new LinkedHashMap<>();
        tools.put("merge", SitePageMeta.tool("Merge PDF", "Combine multiple PDFs into one file."));
        tools.put("split", SitePageMeta.tool("Split PDF", "Split a PDF into separate files by page or range."));
        tools.put("remove-pages", SitePageMeta.tool("Remove pages", "Delete selected pages from your PDF."));
        tools.put("extract-pages", SitePageMeta.tool("Extract pages", "Save chosen pages as a new PDF."));
        tools.put("organize-pdf", SitePageMeta.tool("Organize PDF", "Change the order of pages in a PDF."));
        tools.put("scan-to-pdf", SitePageMeta.tool("Scan to PDF", "Create a PDF from photos or uploaded images."));
        tools.put("compress", SitePageMeta.tool("Compress PDF", "Reduce file size while keeping readable quality."));
        tools.put("repair-pdf", SitePageMeta.tool("Repair PDF", "Fix PDFs that will not open or look corrupted."));
        tools.put("ocr-pdf", SitePageMeta.tool("OCR PDF", "Make scanned PDFs searchable (coming soon)."));
        tools.put("images-to-pdf", SitePageMeta.tool(
                "Image to PDF",
                "Turn PNG, JPEG, HEIC, GIF, WebP, BMP, or TIFF images into one PDF."));
        tools.put("word-to-pdf", SitePageMeta.tool("WORD to PDF", "Convert Word (.doc, .docx) to PDF."));
        tools.put("powerpoint-to-pdf", SitePageMeta.tool("POWERPOINT to PDF", "Convert PowerPoint (.ppt, .pptx) to PDF."));
        tools.put("excel-to-pdf", SitePageMeta.tool("EXCEL to PDF", "Convert Excel (.xls, .xlsx) to PDF."));
        tools.put("html-to-pdf", SitePageMeta.tool("HTML to PDF", "Turn HTML into a PDF."));
        tools.put("pdf-to-jpg", SitePageMeta.tool("PDF to JPG", "Save each page as a JPG image."));
        tools.put("pdf-to-word", SitePageMeta.tool(
                "PDF to WORD",
                "Export to Word .docx (works best on simple, text-based PDFs)."));
        tools.put("pdf-to-powerpoint", SitePageMeta.tool("PDF to POWERPOINT", "Export to PowerPoint .pptx."));
        tools.put("pdf-to-excel", SitePageMeta.tool("PDF to EXCEL", "Export to Excel .xlsx."));
        tools.put("pdf-to-pdfa", SitePageMeta.tool(
                "PDF to PDF/A",
                "Convert to PDF/A for long-term archiving (checked when validation is available)."));
        tools.put("pdf-to-dxf", SitePageMeta.tool(
                "PDF to DXF",
                "Export each page as its own AutoCAD DXF file (R2010), delivered in a zip."));
        tools.put("replace", SitePageMeta.tool(
                "Replace Text",
                "Find and replace text in a PDF without retyping the whole document."));
        tools.put("rotate-pdf", SitePageMeta.tool("Rotate PDF", "Rotate pages 90°, 180°, or 270°."));
        tools.put("add-page-numbers", SitePageMeta.tool("Add page numbers", "Add page numbers to the header or footer."));
        tools.put("add-watermark", SitePageMeta.tool("Add watermark", "Add a text watermark across your pages."));
        tools.put("crop-pdf", SitePageMeta.tool("Crop PDF", "Trim margins or crop to a smaller area."));
        tools.put("edit-pdf", SitePageMeta.tool("Edit PDF", "Update title, author, and other document properties."));
        tools.put("pdf-forms", SitePageMeta.tool("PDF Forms", "Fill in form fields or flatten them into the page."));
        tools.put("unlock-pdf", SitePageMeta.tool(
                "Unlock PDF",
                "Remove password protection when you know the password."));
        tools.put("protect-pdf", SitePageMeta.tool("Protect PDF", "Add a password to open or change the file."));
        tools.put("sign-pdf", SitePageMeta.tool("Sign PDF", "Place a drawn signature on the page."));
        tools.put("redact-pdf", SitePageMeta.tool("Redact PDF", "Cover sensitive areas with black boxes."));
        tools.put("compare-pdf", SitePageMeta.tool("Compare PDF", "See how two PDFs differ in text and layout."));
        return Map.copyOf(tools);
    }

    static Optional<String> publicToolIdForSlug(String slug) {
        String toolId = SLUG_TO_TOOL_ID.getOrDefault(slug, slug);
        return BY_TOOL_ID.containsKey(toolId) ? Optional.of(toolId) : Optional.empty();
    }
}
