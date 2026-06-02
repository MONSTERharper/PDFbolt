package com.pdfreplace;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
/**
 * Compares two PDFs: metadata, byte identity, per-page text, and low-DPI visual similarity.
 */
public final class PdfCompareEngine {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final int MAX_COMPARE_PAGES = 50;
    private static final int VISUAL_DPI = 48;
    /** Pixels with channel delta above this count as different. */
    private static final int PIXEL_DIFF_THRESHOLD = 28;
    /** Pages with visual similarity below this are flagged. */
    private static final double VISUAL_MATCH_PERCENT = 98.5;

    private PdfCompareEngine() {}

    public record PageCompareResult(
            int page,
            boolean textMatch,
            double visualSimilarityPercent,
            String note
    ) {}

    public record CompareResult(
            String file1Name,
            String file2Name,
            int file1Pages,
            int file2Pages,
            long file1Size,
            long file2Size,
            String file1Title,
            String file2Title,
            boolean isSamePageCount,
            boolean isSameByteSize,
            boolean bytesIdentical,
            int pagesCompared,
            int pagesWithTextDifferences,
            int pagesWithVisualDifferences,
            boolean overallMatch,
            String summary,
            List<PageCompareResult> pageResults
    ) {}

    public static String compareToJson(Path file1, Path file2, String name1, String name2) throws IOException {
        CompareResult result = compare(file1, file2, name1, name2);
        try {
            return JSON.writerWithDefaultPrettyPrinter().writeValueAsString(result);
        } catch (JsonProcessingException ex) {
            throw new IOException("Failed to encode comparison report.", ex);
        }
    }

    public static CompareResult compare(Path file1, Path file2, String name1, String name2) throws IOException {
        byte[] bytes1 = Files.readAllBytes(file1);
        byte[] bytes2 = Files.readAllBytes(file2);
        boolean bytesIdentical = java.util.Arrays.equals(bytes1, bytes2);

        try (PDDocument doc1 = PDDocument.load(file1.toFile());
             PDDocument doc2 = PDDocument.load(file2.toFile())) {

            String title1 = doc1.getDocumentInformation().getTitle();
            String title2 = doc2.getDocumentInformation().getTitle();
            int pages1 = doc1.getNumberOfPages();
            int pages2 = doc2.getNumberOfPages();
            long size1 = bytes1.length;
            long size2 = bytes2.length;

            int pagesToCompare = Math.min(Math.min(pages1, pages2), MAX_COMPARE_PAGES);
            List<PageCompareResult> pageResults = new ArrayList<>();
            int textDiffs = 0;
            int visualDiffs = 0;

            PDFRenderer renderer1 = pagesToCompare > 0 ? new PDFRenderer(doc1) : null;
            PDFRenderer renderer2 = pagesToCompare > 0 ? new PDFRenderer(doc2) : null;
            PDFTextStripper stripper1 = new PDFTextStripper();
            PDFTextStripper stripper2 = new PDFTextStripper();

            for (int i = 0; i < pagesToCompare; i++) {
                int pageNum = i + 1;
                stripper1.setStartPage(pageNum);
                stripper1.setEndPage(pageNum);
                stripper2.setStartPage(pageNum);
                stripper2.setEndPage(pageNum);

                String text1 = normalizeText(stripper1.getText(doc1));
                String text2 = normalizeText(stripper2.getText(doc2));
                boolean textMatch = text1.equals(text2);
                if (!textMatch) {
                    textDiffs++;
                }

                double visualPercent = 100.0;
                String note = "";
                if (renderer1 != null && renderer2 != null) {
                    try {
                        BufferedImage img1 = renderer1.renderImageWithDPI(i, VISUAL_DPI, ImageType.RGB);
                        BufferedImage img2 = renderer2.renderImageWithDPI(i, VISUAL_DPI, ImageType.RGB);
                        visualPercent = visualSimilarityPercent(img1, img2);
                        if (img1.getWidth() != img2.getWidth() || img1.getHeight() != img2.getHeight()) {
                            note = "Page dimensions differ.";
                        }
                    } catch (Exception ex) {
                        visualPercent = 0;
                        note = "Could not render page for visual compare.";
                    }
                }
                boolean visualMatch = visualPercent >= VISUAL_MATCH_PERCENT;
                if (!visualMatch) {
                    visualDiffs++;
                }
                if (!textMatch && note.isEmpty()) {
                    note = textDiffNote(text1, text2);
                } else if (!textMatch) {
                    note = note + " " + textDiffNote(text1, text2);
                }

                pageResults.add(new PageCompareResult(pageNum, textMatch, round1(visualPercent), note.trim()));
            }

            boolean samePages = pages1 == pages2;
            boolean overallMatch = bytesIdentical
                    || (samePages && textDiffs == 0 && visualDiffs == 0 && pages1 <= MAX_COMPARE_PAGES);

            String summary = buildSummary(
                    bytesIdentical,
                    samePages,
                    pages1,
                    pages2,
                    pagesToCompare,
                    textDiffs,
                    visualDiffs,
                    pages1 > MAX_COMPARE_PAGES || pages2 > MAX_COMPARE_PAGES);

            return new CompareResult(
                    name1,
                    name2,
                    pages1,
                    pages2,
                    size1,
                    size2,
                    blankToNone(title1),
                    blankToNone(title2),
                    samePages,
                    size1 == size2,
                    bytesIdentical,
                    pagesToCompare,
                    textDiffs,
                    visualDiffs,
                    overallMatch,
                    summary,
                    pageResults
            );
        }
    }

    private static String buildSummary(
            boolean bytesIdentical,
            boolean samePages,
            int pages1,
            int pages2,
            int compared,
            int textDiffs,
            int visualDiffs,
            boolean truncated
    ) {
        if (bytesIdentical) {
            return "Files are byte-for-byte identical.";
        }
        if (!samePages) {
            return "Page counts differ (" + pages1 + " vs " + pages2 + "). Compared first "
                    + compared + " page(s) where both exist.";
        }
        if (textDiffs == 0 && visualDiffs == 0) {
            return "All " + compared + " compared page(s) match in text and visual layout.";
        }
        StringBuilder sb = new StringBuilder();
        if (textDiffs > 0) {
            sb.append(textDiffs).append(" of ").append(compared).append(" page(s) differ in extractable text");
        }
        if (visualDiffs > 0) {
            if (sb.length() > 0) {
                sb.append("; ");
            }
            sb.append(visualDiffs).append(" of ").append(compared).append(" page(s) differ visually");
        }
        sb.append(".");
        if (truncated) {
            sb.append(" Only the first ").append(MAX_COMPARE_PAGES).append(" pages were compared.");
        }
        return sb.toString();
    }

    private static String textDiffNote(String a, String b) {
        if (a.isEmpty() && b.isEmpty()) {
            return "";
        }
        if (a.isEmpty()) {
            return "Text only in file B on this page.";
        }
        if (b.isEmpty()) {
            return "Text only in file A on this page.";
        }
        String prefixA = a.length() > 60 ? a.substring(0, 60) + "…" : a;
        String prefixB = b.length() > 60 ? b.substring(0, 60) + "…" : b;
        return "Text differs (A: \"" + sanitize(prefixA) + "\" vs B: \"" + sanitize(prefixB) + "\").";
    }

    private static String sanitize(String value) {
        return value.replace("\"", "'").replace("\n", " ");
    }

    private static String normalizeText(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        return raw.replaceAll("\\s+", " ").trim();
    }

    private static String blankToNone(String value) {
        return value == null || value.isBlank() ? "None" : value;
    }

    private static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private static double visualSimilarityPercent(BufferedImage a, BufferedImage b) {
        int w = Math.min(a.getWidth(), b.getWidth());
        int h = Math.min(a.getHeight(), b.getHeight());
        if (w == 0 || h == 0) {
            return 0;
        }
        if (a.getWidth() != b.getWidth() || a.getHeight() != b.getHeight()) {
            return 0;
        }
        long different = 0;
        long total = (long) w * h;
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int rgb1 = a.getRGB(x, y);
                int rgb2 = b.getRGB(x, y);
                int r1 = (rgb1 >> 16) & 0xff;
                int g1 = (rgb1 >> 8) & 0xff;
                int b1 = rgb1 & 0xff;
                int r2 = (rgb2 >> 16) & 0xff;
                int g2 = (rgb2 >> 8) & 0xff;
                int b2 = rgb2 & 0xff;
                if (Math.abs(r1 - r2) > PIXEL_DIFF_THRESHOLD
                        || Math.abs(g1 - g2) > PIXEL_DIFF_THRESHOLD
                        || Math.abs(b1 - b2) > PIXEL_DIFF_THRESHOLD) {
                    different++;
                }
            }
        }
        return 100.0 * (total - different) / total;
    }
}
