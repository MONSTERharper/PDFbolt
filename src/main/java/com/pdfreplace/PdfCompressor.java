package com.pdfreplace;

import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

/**
 * Rewrites a PDF with smaller streams. Levels: {@code high}, {@code balanced}, {@code strong}.
 */
public final class PdfCompressor {
    /**
     * @param jpegQuality          JPEG quality when re-encoding photos (ignored when {@code recompressImages} is false)
     * @param maxEdgePx            longest image edge in pixels after scaling
     * @param minPixelsToReencode  skip small images below this pixel count when dimensions unchanged
     * @param recompressImages     when false, only security removal and resave apply
     */
    public record CompressionProfile(
            String id,
            String title,
            String description,
            float jpegQuality,
            int maxEdgePx,
            int minPixelsToReencode,
            boolean recompressImages
    ) {
    }

    public enum Level {
        HIGH(new CompressionProfile(
                "high",
                "Less compression",
                "High quality, less compression — high JPEG quality; only large photos are resampled.",
                0.90f,
                2800,
                500_000,
                true
        )),
        BALANCED(new CompressionProfile(
                "balanced",
                "Recommended compression",
                "Good quality, good compression — moderate image resampling.",
                0.82f,
                2200,
                250_000,
                true
        )),
        STRONG(new CompressionProfile(
                "strong",
                "High compression",
                "Smallest file size — stronger JPEG and smaller max image size.",
                0.65f,
                1400,
                100_000,
                true
        ));

        private final CompressionProfile profile;

        Level(CompressionProfile profile) {
            this.profile = profile;
        }

        public CompressionProfile profile() {
            return profile;
        }

        public static Level parse(String raw) {
            if (raw == null || raw.isBlank()) {
                return BALANCED;
            }
            return switch (raw.trim().toLowerCase(Locale.ROOT)) {
                case "strong", "extreme", "maximum", "max" -> STRONG;
                case "high", "light", "less", "highquality" -> HIGH;
                case "balanced", "recommended", "medium" -> BALANCED;
                default -> BALANCED;
            };
        }
    }

    public record Result(
            long originalBytes,
            byte[] pdfBytes,
            int pages,
            int imagesProcessed,
            Level level
    ) {
        public int savedBytes() {
            return (int) Math.max(0, originalBytes - pdfBytes.length);
        }

        public int savedPercent() {
            if (originalBytes <= 0) {
                return 0;
            }
            return (int) Math.round(100.0 * savedBytes() / originalBytes);
        }
    }

    private PdfCompressor() {
    }

    public static Result compress(Path input, Level level, boolean retainMetadata) throws IOException {
        long originalBytes = Files.size(input);
        CompressionProfile profile = level.profile();
        try (PDDocument document = PDDocument.load(input.toFile())) {
            document.setAllSecurityToBeRemoved(true);
            if (!retainMetadata) {
                stripMetadata(document);
            }

            int imagesProcessed = 0;
            if (profile.recompressImages()) {
                imagesProcessed = recompressImages(
                        document,
                        profile.jpegQuality(),
                        profile.maxEdgePx(),
                        profile.minPixelsToReencode()
                );
            }

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            document.save(output);
            byte[] pdfBytes = output.toByteArray();

            // Text-only / already-optimized PDFs often grow on resave when no images were touched.
            if (imagesProcessed == 0 && pdfBytes.length >= originalBytes) {
                pdfBytes = Files.readAllBytes(input);
            }

            return new Result(
                    originalBytes,
                    pdfBytes,
                    document.getNumberOfPages(),
                    imagesProcessed,
                    level
            );
        }
    }

    private static void stripMetadata(PDDocument document) {
        PDDocumentInformation info = document.getDocumentInformation();
        if (info != null) {
            info.setTitle(null);
            info.setAuthor(null);
            info.setSubject(null);
            info.setKeywords(null);
            info.setCreator(null);
            info.setProducer(null);
            info.setCreationDate(null);
            info.setModificationDate(null);
        }
    }

    private static int recompressImages(
            PDDocument document,
            float jpegQuality,
            int maxEdgePx,
            int minPixelsToReencode
    ) throws IOException {
        int processed = 0;
        for (PDPage page : document.getPages()) {
            processed += recompressResources(document, page.getResources(), jpegQuality, maxEdgePx, minPixelsToReencode);
        }
        return processed;
    }

    private static int recompressResources(
            PDDocument document,
            PDResources resources,
            float jpegQuality,
            int maxEdgePx,
            int minPixelsToReencode
    ) throws IOException {
        if (resources == null) {
            return 0;
        }
        int processed = 0;
        for (COSName name : resources.getXObjectNames()) {
            PDXObject xObject = resources.getXObject(name);
            if (xObject instanceof PDImageXObject image) {
                PDImageXObject replacement = replaceImage(
                        document,
                        image,
                        jpegQuality,
                        maxEdgePx,
                        minPixelsToReencode
                );
                if (replacement != null) {
                    resources.put(name, replacement);
                    processed++;
                }
            }
        }
        return processed;
    }

    private static PDImageXObject replaceImage(
            PDDocument document,
            PDImageXObject source,
            float jpegQuality,
            int maxEdgePx,
            int minPixelsToReencode
    ) throws IOException {
        BufferedImage buffered = source.getImage();
        if (buffered == null) {
            return null;
        }
        BufferedImage scaled = scaleToMaxEdge(buffered, maxEdgePx);
        if (scaled.getWidth() == buffered.getWidth() && scaled.getHeight() == buffered.getHeight()) {
            long pixels = (long) buffered.getWidth() * buffered.getHeight();
            if (pixels < minPixelsToReencode) {
                return null;
            }
        }
        if (scaled.getColorModel().hasAlpha()) {
            return LosslessFactory.createFromImage(document, scaled);
        }
        return JPEGFactory.createFromImage(document, scaled, jpegQuality);
    }

    private static BufferedImage scaleToMaxEdge(BufferedImage source, int maxEdgePx) {
        if (maxEdgePx <= 0) {
            return source;
        }
        int width = source.getWidth();
        int height = source.getHeight();
        int longest = Math.max(width, height);
        if (longest <= maxEdgePx) {
            return source;
        }
        float scale = maxEdgePx / (float) longest;
        int targetW = Math.max(1, Math.round(width * scale));
        int targetH = Math.max(1, Math.round(height * scale));
        int imageType = source.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
        BufferedImage scaled = new BufferedImage(targetW, targetH, imageType);
        Graphics2D graphics = scaled.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.drawImage(source, 0, 0, targetW, targetH, null);
        graphics.dispose();
        return scaled;
    }
}
