package com.pdfreplace;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

/**
 * Decodes HEIC/HEIF via ImageMagick or {@code heif-convert} when installed (Docker image includes both).
 */
public final class HeicSupport {
    private static final String MAGICK = probeCommand("magick");
    private static final String HEIF_CONVERT = MAGICK == null ? probeCommand("heif-convert") : null;

    private HeicSupport() {}

    public static boolean isHeicFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return false;
        }
        String lower = filename.trim().toLowerCase(Locale.ROOT);
        return lower.endsWith(".heic") || lower.endsWith(".heif");
    }

    public static boolean isAvailable() {
        return MAGICK != null || HEIF_CONVERT != null;
    }

    public static BufferedImage decode(Path heicPath) throws IOException {
        if (!isHeicFilename(heicPath.getFileName().toString())) {
            throw new IllegalArgumentException("Not a HEIC file: " + heicPath.getFileName());
        }
        if (!isAvailable()) {
            throw new IllegalArgumentException(
                    "HEIC is not supported on this server. Save the image as JPEG or PNG and try again.");
        }
        Path png = Files.createTempFile("pdfbolt-heic-", ".png");
        try {
            if (MAGICK != null) {
                runConverter(MAGICK, heicPath, png);
            } else {
                runConverter(HEIF_CONVERT, heicPath, png);
            }
            BufferedImage image = ImageIO.read(png.toFile());
            if (image == null) {
                throw new IllegalArgumentException("Could not decode HEIC image: " + heicPath.getFileName());
            }
            return image;
        } finally {
            Files.deleteIfExists(png);
        }
    }

    private static void runConverter(String command, Path input, Path output) throws IOException {
        String[] cmd = {command, input.toString(), output.toString()};
        Process process = new ProcessBuilder(cmd)
                .redirectErrorStream(true)
                .start();
        try {
            boolean finished = process.waitFor(60, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new IllegalArgumentException("HEIC conversion timed out.");
            }
            if (process.exitValue() != 0) {
                throw new IllegalArgumentException("HEIC conversion failed. Try JPEG or PNG instead.");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("HEIC conversion interrupted.", e);
        }
    }

    private static String probeCommand(String name) {
        try {
            Process process = new ProcessBuilder(name, "-version")
                    .redirectErrorStream(true)
                    .start();
            if (process.waitFor(5, TimeUnit.SECONDS) && process.exitValue() == 0) {
                return name;
            }
        } catch (Exception ignored) {
            // command not on PATH
        }
        return null;
    }
}
