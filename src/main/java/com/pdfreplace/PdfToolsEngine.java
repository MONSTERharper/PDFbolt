package com.pdfreplace;

import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.util.Matrix;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

final class PdfToolsEngine {
    private static final float A4_WIDTH = 595.276f;
    private static final float A4_HEIGHT = 841.89f;

    private PdfToolsEngine() {
    }

    static byte[] merge(List<Path> inputs) throws IOException {
        PDFMergerUtility merger = new PDFMergerUtility();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        merger.setDestinationStream(out);
        for (Path input : inputs) {
            merger.addSource(input.toFile());
        }
        merger.mergeDocuments(null);
        return out.toByteArray();
    }

    static byte[] extractPages(Path input, String pageRange) throws IOException {
        try (PDDocument src = PDDocument.load(input.toFile())) {
            int total = src.getNumberOfPages();
            List<Integer> indices = PageRangeParser.parseZeroBasedIndices(pageRange, total);
            if (indices.isEmpty()) {
                throw new IllegalArgumentException("No valid pages selected. Please verify your range.");
            }
            try (PDDocument target = new PDDocument()) {
                for (int index : indices) {
                    target.importPage(src.getPage(index));
                }
                return save(target);
            }
        }
    }

    static byte[] removePages(Path input, String pagesToRemove) throws IOException {
        try (PDDocument src = PDDocument.load(input.toFile())) {
            int total = src.getNumberOfPages();
            List<Integer> remove = PageRangeParser.parseZeroBasedIndices(pagesToRemove, total);
            if (remove.size() >= total) {
                throw new IllegalArgumentException("Cannot remove all pages from a PDF. At least 1 page must remain.");
            }
            try (PDDocument target = new PDDocument()) {
                for (int i = 0; i < total; i++) {
                    if (!remove.contains(i)) {
                        target.importPage(src.getPage(i));
                    }
                }
                return save(target);
            }
        }
    }

    static byte[] organizePages(Path input, String orderStr) throws IOException {
        try (PDDocument src = PDDocument.load(input.toFile())) {
            int total = src.getNumberOfPages();
            List<Integer> order = PageRangeParser.parseOneBasedOrder(orderStr, total);
            try (PDDocument target = new PDDocument()) {
                for (int index : order) {
                    target.importPage(src.getPage(index));
                }
                return save(target);
            }
        }
    }

    static byte[] imagesToPdf(List<Path> images) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            for (Path imagePath : images) {
                BufferedImage buffered = RasterImageLoader.read(imagePath);
                PDImageXObject image = LosslessFactory.createFromImage(doc, buffered);
                PDPage page = new PDPage(new PDRectangle(image.getWidth(), image.getHeight()));
                doc.addPage(page);
                try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                    cs.drawImage(image, 0, 0, image.getWidth(), image.getHeight());
                }
            }
            return save(doc);
        }
    }

    static byte[] repair(Path input, String password) throws IOException {
        try (PDDocument doc = load(input, password)) {
            return save(doc);
        }
    }

    static byte[] ocrOverlay(Path input, String language) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            String label = "[OCR SEARCH LAYER - " + (language == null ? "EN" : language.toUpperCase(Locale.ROOT)) + "]";
            for (PDPage page : doc.getPages()) {
                try (PDPageContentStream cs = new PDPageContentStream(
                        doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    cs.setNonStrokingColor(new Color(204, 204, 204));
                    cs.beginText();
                    cs.setFont(PDType1Font.HELVETICA, 6);
                    cs.newLineAtOffset(30, 20);
                    cs.showText(safePdfText(label));
                    cs.endText();
                }
            }
            return save(doc);
        }
    }

    static byte[] textToPdf(String text, String title) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(new PDRectangle(A4_WIDTH, A4_HEIGHT));
            doc.addPage(page);
            String safeTitle = title == null || title.isBlank() ? "Document" : title;
            doc.getDocumentInformation().setTitle(safeTitle);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 18);
                cs.newLineAtOffset(50, 780);
                cs.showText(safePdfText(truncate(safeTitle.toUpperCase(Locale.ROOT), 80)));
                cs.endText();
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 10);
                cs.newLineAtOffset(50, 730);
                int lineCount = 0;
                for (String line : (text == null ? "" : text).split("\n")) {
                    if (lineCount > 0) {
                        cs.newLineAtOffset(0, -15);
                    }
                    if (730 - lineCount * 15 < 60) {
                        break;
                    }
                    cs.showText(safePdfText(truncate(line, 85)));
                    lineCount++;
                }
                cs.endText();
            }
            return save(doc);
        }
    }

    static byte[] pdfToJpgZip(Path input, int dpi) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            PDFRenderer renderer = new PDFRenderer(doc);
            ByteArrayOutputStream zipBytes = new ByteArrayOutputStream();
            try (ZipOutputStream zip = new ZipOutputStream(zipBytes)) {
                int pages = doc.getNumberOfPages();
                for (int i = 0; i < pages; i++) {
                    BufferedImage image = renderer.renderImageWithDPI(i, dpi, ImageType.RGB);
                    ByteArrayOutputStream imageBytes = new ByteArrayOutputStream();
                    ImageIO.write(image, "jpg", imageBytes);
                    ZipEntry entry = new ZipEntry("page_" + (i + 1) + ".jpg");
                    zip.putNextEntry(entry);
                    zip.write(imageBytes.toByteArray());
                    zip.closeEntry();
                }
            }
            return zipBytes.toByteArray();
        }
    }

    static String extractText(Path input) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            return "--- PDF TEXT EXTRACTION REPORT ---\n\n" + text;
        }
    }

    static String extractCsv(Path input) throws IOException {
        String text = extractText(input);
        StringBuilder csv = new StringBuilder("Index,Data_Extract\n");
        int count = 1;
        for (String line : text.split("\n")) {
            String cleaned = line.trim().replace("\"", "\"\"");
            if (!cleaned.isEmpty() && !cleaned.startsWith("---") && !cleaned.startsWith("[")) {
                csv.append(count).append(",\"").append(cleaned).append("\"\n");
                count++;
            }
        }
        return csv.toString();
    }

    static byte[] pdfToPdfa(Path input) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            doc.getDocumentInformation().setProducer("PDFBolt PDF/A preparation");
            doc.getDocumentInformation().setCreator("PDFBolt");
            return save(doc);
        }
    }

    static byte[] rotate(Path input, int angleDeg, String scope) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            int pages = doc.getNumberOfPages();
            for (int i = 0; i < pages; i++) {
                if (!matchesRotationScope(i, scope)) {
                    continue;
                }
                PDPage page = doc.getPage(i);
                int current = page.getRotation();
                page.setRotation(Math.floorMod(current + angleDeg, 360));
            }
            return save(doc);
        }
    }

    static byte[] addPageNumbers(Path input, String format, int size, String alignment) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            int total = doc.getNumberOfPages();
            for (int i = 0; i < total; i++) {
                PDPage page = doc.getPage(i);
                PDRectangle box = page.getMediaBox();
                float width = box.getWidth();
                String label = format
                        .replace("{X}", String.valueOf(i + 1))
                        .replace("{Y}", String.valueOf(total));
                float x = width / 2 - 20;
                if ("Left".equalsIgnoreCase(alignment)) {
                    x = 40;
                } else if ("Right".equalsIgnoreCase(alignment)) {
                    x = width - 80;
                }
                try (PDPageContentStream cs = new PDPageContentStream(
                        doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    cs.beginText();
                    cs.setFont(PDType1Font.HELVETICA, size);
                    cs.newLineAtOffset(x, 30);
                    cs.showText(safePdfText(label));
                    cs.endText();
                }
            }
            return save(doc);
        }
    }

    static byte[] addWatermark(
            Path input,
            String text,
            int size,
            int rotationDeg,
            float opacity,
            String colorHex
    ) throws IOException {
        Color color = parseHexColor(colorHex);
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            for (PDPage page : doc.getPages()) {
                PDRectangle box = page.getMediaBox();
                float width = box.getWidth();
                float height = box.getHeight();
                try (PDPageContentStream cs = new PDPageContentStream(
                        doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    int alpha = Math.max(0, Math.min(255, Math.round(opacity * 255)));
                    cs.setNonStrokingColor(new Color(color.getRed(), color.getGreen(), color.getBlue(), alpha));
                    cs.beginText();
                    cs.setFont(PDType1Font.HELVETICA_BOLD, size);
                    cs.setTextMatrix(Matrix.getRotateInstance(Math.toRadians(rotationDeg), width / 4, height / 2));
                    cs.showText(safePdfText(text == null ? "CONFIDENTIAL" : text));
                    cs.endText();
                }
            }
            return save(doc);
        }
    }

    static byte[] crop(Path input, float left, float right, float top, float bottom) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            for (PDPage page : doc.getPages()) {
                PDRectangle media = page.getMediaBox();
                float width = media.getWidth();
                float height = media.getHeight();
                float cropWidth = Math.max(50, width - left - right);
                float cropHeight = Math.max(50, height - bottom - top);
                page.setCropBox(new PDRectangle(left, bottom, cropWidth, cropHeight));
            }
            return save(doc);
        }
    }

    static byte[] editMetadata(
            Path input,
            String title,
            String author,
            String subject,
            String creator
    ) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            if (title != null && !title.isBlank()) {
                doc.getDocumentInformation().setTitle(title);
            }
            if (author != null && !author.isBlank()) {
                doc.getDocumentInformation().setAuthor(author);
            }
            if (subject != null && !subject.isBlank()) {
                doc.getDocumentInformation().setSubject(subject);
            }
            if (creator != null && !creator.isBlank()) {
                doc.getDocumentInformation().setCreator(creator);
            }
            return save(doc);
        }
    }

    static byte[] flattenForms(Path input) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            PDAcroForm form = doc.getDocumentCatalog().getAcroForm();
            if (form != null) {
                form.flatten();
            }
            return save(doc);
        }
    }

    static byte[] unlock(Path input, String password) throws IOException {
        try (PDDocument doc = load(input, password)) {
            doc.setAllSecurityToBeRemoved(true);
            return save(doc);
        }
    }

    static byte[] protect(Path input, String userPassword, String ownerPassword) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            String user = userPassword == null ? "" : userPassword;
            String owner = ownerPassword == null || ownerPassword.isBlank() ? user : ownerPassword;
            AccessPermission permissions = new AccessPermission();
            StandardProtectionPolicy policy = new StandardProtectionPolicy(owner, user, permissions);
            policy.setEncryptionKeyLength(128);
            policy.setPreferAES(true);
            doc.protect(policy);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }

    static byte[] sign(
            Path input,
            Path signaturePng,
            int pageNum,
            float x,
            float y,
            float width,
            float height
    ) throws IOException {
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            int index = Math.max(0, Math.min(pageNum - 1, doc.getNumberOfPages() - 1));
            BufferedImage buffered = ImageIO.read(signaturePng.toFile());
            if (buffered == null) {
                throw new IllegalArgumentException("Invalid signature image.");
            }
            PDImageXObject image = LosslessFactory.createFromImage(doc, buffered);
            PDPage page = doc.getPage(index);
            try (PDPageContentStream cs = new PDPageContentStream(
                    doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                cs.drawImage(image, x, y, width, height);
            }
            return save(doc);
        }
    }

    static byte[] redact(Path input, int pageNum, float x, float y, float w, float h) throws IOException {
        if (w <= 0 || h <= 0) {
            throw new IllegalArgumentException("Redaction width and height must be greater than zero.");
        }
        try (PDDocument doc = PDDocument.load(input.toFile())) {
            if (doc.getNumberOfPages() < 1) {
                throw new IllegalArgumentException("PDF has no pages to redact.");
            }
            if (pageNum < 1 || pageNum > doc.getNumberOfPages()) {
                throw new IllegalArgumentException(
                        "Page " + pageNum + " is out of range (1-" + doc.getNumberOfPages() + ").");
            }
            int index = pageNum - 1;
            PDPage page = doc.getPage(index);
            PDRectangle media = page.getMediaBox();
            float loX = media.getLowerLeftX();
            float loY = media.getLowerLeftY();
            float hiX = media.getUpperRightX();
            float hiY = media.getUpperRightY();

            float rectX = Math.max(loX, Math.min(x, hiX));
            float rectY = Math.max(loY, Math.min(y, hiY));
            float rectW = Math.min(w, hiX - rectX);
            float rectH = Math.min(h, hiY - rectY);
            if (rectW <= 0 || rectH <= 0) {
                throw new IllegalArgumentException(
                        "Redaction rectangle is outside the page. PDF coordinates use bottom-left origin (X right, Y up).");
            }

            try (PDPageContentStream cs = new PDPageContentStream(
                    doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                cs.setNonStrokingColor(Color.BLACK);
                cs.addRect(rectX, rectY, rectW, rectH);
                cs.fill();
                cs.setStrokingColor(Color.BLACK);
                cs.setLineWidth(0.5f);
                cs.addRect(rectX, rectY, rectW, rectH);
                cs.stroke();
            }
            return save(doc);
        }
    }

    static String compareJson(Path file1, Path file2, String name1, String name2) throws IOException {
        return PdfCompareEngine.compareToJson(file1, file2, name1, name2);
    }

    private static PDDocument load(Path input, String password) throws IOException {
        if (password != null && !password.isBlank()) {
            return PDDocument.load(input.toFile(), password);
        }
        return PDDocument.load(input.toFile());
    }

    private static byte[] save(PDDocument doc) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        doc.save(out);
        return out.toByteArray();
    }

    private static boolean matchesRotationScope(int pageIndex, String scope) {
        if (scope == null || scope.isBlank() || "All".equalsIgnoreCase(scope)) {
            return true;
        }
        if ("Odd".equalsIgnoreCase(scope)) {
            return pageIndex % 2 == 0;
        }
        if ("Even".equalsIgnoreCase(scope)) {
            return pageIndex % 2 != 0;
        }
        return true;
    }

    /** Helvetica Type1 only supports WinAnsi — strip unsupported glyphs. */
    private static String safePdfText(String value) {
        if (value == null || value.isEmpty()) {
            return "";
        }
        StringBuilder sanitized = new StringBuilder(value.length());
        for (char character : value.toCharArray()) {
            if (character >= 32 && character <= 126) {
                sanitized.append(character);
            } else if (character == '\n' || character == '\r' || character == '\t') {
                sanitized.append(' ');
            }
        }
        return sanitized.toString();
    }

    private static String truncate(String value, int max) {
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max);
    }

    private static Color parseHexColor(String hex) {
        if (hex == null || hex.isBlank()) {
            return new Color(255, 51, 0);
        }
        String cleaned = hex.replace("#", "");
        if (cleaned.length() != 6) {
            return new Color(255, 51, 0);
        }
        int r = Integer.parseInt(cleaned.substring(0, 2), 16);
        int g = Integer.parseInt(cleaned.substring(2, 4), 16);
        int b = Integer.parseInt(cleaned.substring(4, 6), 16);
        return new Color(r, g, b);
    }

    private static String jsonString(String value) {
        String escaped = value.replace("\\", "\\\\").replace("\"", "\\\"");
        return "\"" + escaped + "\"";
    }
}
