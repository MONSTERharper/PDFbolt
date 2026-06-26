package com.pdfreplace;

import java.util.List;
import java.util.Map;

/**
 * Categorized tool list for the crawlable {@code /tools} HTML index.
 * Keep aligned with {@code new-ui/src/suiteCatalog.ts}.
 */
final class ToolsIndexCatalog {
    private static final Map<String, String> TOOL_ID_TO_SLUG = Map.of("images-to-pdf", "image-to-pdf");

    record ToolRef(String toolId) {}

    record Category(String title, String description, List<ToolRef> tools) {}

    private static final List<Category> CATEGORIES = List.of(
            new Category(
                    "Organize PDF",
                    "Merge, split, reorder, and remove pages.",
                    List.of(
                            tool("merge"),
                            tool("split"),
                            tool("remove-pages"),
                            tool("extract-pages"),
                            tool("organize-pdf"))),
            new Category(
                    "Scan to PDF",
                    "Turn photos and scans into PDFs.",
                    List.of(tool("scan-to-pdf"))),
            new Category(
                    "Optimize PDF",
                    "Make files smaller and fix common PDF problems.",
                    List.of(tool("compress"), tool("repair-pdf"), tool("ocr-pdf"))),
            new Category(
                    "Convert to PDF",
                    "Create PDFs from images, Office files, and HTML.",
                    List.of(
                            tool("images-to-pdf"),
                            tool("word-to-pdf"),
                            tool("powerpoint-to-pdf"),
                            tool("excel-to-pdf"),
                            tool("html-to-pdf"))),
            new Category(
                    "Convert from PDF",
                    "Export PDFs to images, Office formats, CAD (DXF), and PDF/A for archiving.",
                    List.of(
                            tool("pdf-to-jpg"),
                            tool("pdf-to-word"),
                            tool("pdf-to-powerpoint"),
                            tool("pdf-to-excel"),
                            tool("pdf-to-pdfa"),
                            tool("pdf-to-dxf"))),
            new Category(
                    "Edit PDF",
                    "Replace text, rotate pages, add numbers, watermarks, and more.",
                    List.of(
                            tool("replace"),
                            tool("rotate-pdf"),
                            tool("add-page-numbers"),
                            tool("add-watermark"),
                            tool("crop-pdf"),
                            tool("edit-pdf"))),
            new Category(
                    "PDF Forms",
                    "Work with fillable PDF forms.",
                    List.of(tool("pdf-forms"))),
            new Category(
                    "PDF Security",
                    "Passwords, signatures, redaction, and comparison.",
                    List.of(
                            tool("unlock-pdf"),
                            tool("protect-pdf"),
                            tool("sign-pdf"),
                            tool("redact-pdf"),
                            tool("compare-pdf"))));

    private ToolsIndexCatalog() {}

    static List<Category> categories() {
        return CATEGORIES;
    }

    static String slugForToolId(String toolId) {
        return TOOL_ID_TO_SLUG.getOrDefault(toolId, toolId);
    }

    static int toolCount() {
        return CATEGORIES.stream().mapToInt(category -> category.tools().size()).sum();
    }

    private static ToolRef tool(String toolId) {
        return new ToolRef(toolId);
    }
}
