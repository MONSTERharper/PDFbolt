package com.pdfreplace;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

@Component
public class LibreOfficeConverter {
    private static final Logger LOGGER = LoggerFactory.getLogger(LibreOfficeConverter.class);
    private static final ReentrantLock CONVERSION_LOCK = new ReentrantLock();

    private final String command;
    private final Duration timeout;

    public LibreOfficeConverter(
            @Value("${boltreplacer.libreoffice.command:soffice}") String command,
            @Value("${boltreplacer.libreoffice.timeout-seconds:120}") long timeoutSeconds
    ) {
        this.command = command;
        this.timeout = Duration.ofSeconds(Math.max(30, timeoutSeconds));
    }

    public boolean isAvailable() {
        try {
            Process process = new ProcessBuilder(command, "--version")
                    .redirectErrorStream(true)
                    .start();
            boolean finished = process.waitFor(10, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return false;
            }
            return process.exitValue() == 0;
        } catch (Exception ex) {
            return false;
        }
    }

    /**
     * Converts an Office document on disk to PDF bytes using LibreOffice headless.
     */
    public byte[] convertToPdf(Path inputFile) throws IOException {
        return convert(inputFile, "pdf", ".pdf");
    }

    /**
     * Exports a PDF on disk to Word, PowerPoint, or Excel via LibreOffice headless.
     */
    public byte[] convertFromPdf(Path pdfFile, PdfOfficeExportFormat format) throws IOException {
        if (format == null) {
            throw new IllegalArgumentException("Office export format is required.");
        }
        return convert(pdfFile, format.convertTo(), format.extension());
    }

    private byte[] convert(Path inputFile, String convertTo, String expectedExtension) throws IOException {
        if (!Files.isRegularFile(inputFile)) {
            throw new IllegalArgumentException("Input file is missing.");
        }
        if (!isAvailable()) {
            throw new IllegalStateException(
                    "LibreOffice is not installed or not on PATH (soffice). "
                            + "Install on the server, e.g. Ubuntu/Debian: "
                            + "sudo apt-get install -y libreoffice-core-nogui libreoffice-writer-nogui "
                            + "libreoffice-calc-nogui libreoffice-impress-nogui; "
                            + "Amazon Linux: sudo dnf install -y libreoffice-core libreoffice-writer. "
                            + "Or set boltreplacer.libreoffice.command to the full path of soffice.");
        }

        CONVERSION_LOCK.lock();
        try {
            return convertLocked(inputFile, convertTo, expectedExtension);
        } finally {
            CONVERSION_LOCK.unlock();
        }
    }

    private byte[] convertLocked(Path inputFile, String convertTo, String expectedExtension) throws IOException {
        Path workDir = Files.createTempDirectory("pdfbolt-lo-");
        try {
            Path profileDir = workDir.resolve("profile");
            Files.createDirectories(profileDir);

            String inputName = inputFile.getFileName().toString();
            Path stagedInput = workDir.resolve(inputName);
            Files.copy(inputFile, stagedInput);

            String userInstallation = profileDir.toUri().toString();
            if (!userInstallation.endsWith("/")) {
                userInstallation = userInstallation + "/";
            }

            List<String> cmd = List.of(
                    command,
                    "--headless",
                    "--invisible",
                    "--nologo",
                    "--nofirststartwizard",
                    "-env:UserInstallation=" + userInstallation,
                    "--convert-to",
                    convertTo,
                    "--outdir",
                    workDir.toAbsolutePath().toString(),
                    stagedInput.toAbsolutePath().toString()
            );

            ProcessBuilder builder = new ProcessBuilder(cmd);
            builder.redirectErrorStream(true);
            Process process = builder.start();
            String processOutput = readProcessOutput(process);

            boolean finished;
            try {
                finished = process.waitFor(timeout.toSeconds(), TimeUnit.SECONDS);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new IOException("LibreOffice conversion was interrupted.", ex);
            }

            if (!finished) {
                process.destroyForcibly();
                throw new IOException(
                        "LibreOffice conversion timed out after " + timeout.toSeconds() + " seconds.");
            }

            if (process.exitValue() != 0) {
                LOGGER.warn("LibreOffice failed (exit {}): {}", process.exitValue(), truncate(processOutput));
                throw new IOException(
                        "LibreOffice could not convert this file. "
                                + summarizeOutput(processOutput));
            }

            String extLower = expectedExtension.toLowerCase(Locale.ROOT);
            Path expectedOutput = workDir.resolve(stripExtension(inputName) + expectedExtension);
            if (!Files.isRegularFile(expectedOutput)) {
                Path discovered = findFileWithExtension(workDir, extLower);
                if (discovered == null) {
                    throw new IOException(
                            "LibreOffice did not produce " + expectedExtension + " output. "
                                    + summarizeOutput(processOutput));
                }
                expectedOutput = discovered;
            }

            return Files.readAllBytes(expectedOutput);
        } finally {
            deleteRecursively(workDir);
        }
    }

    private static Path findFileWithExtension(Path dir, String extensionLower) throws IOException {
        String suffix = extensionLower.startsWith(".") ? extensionLower : "." + extensionLower;
        try (var stream = Files.list(dir)) {
            return stream
                    .filter(path -> Files.isRegularFile(path)
                            && path.getFileName().toString().toLowerCase(Locale.ROOT).endsWith(suffix))
                    .findFirst()
                    .orElse(null);
        }
    }

    private static String stripExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot <= 0) {
            return filename;
        }
        return filename.substring(0, dot);
    }

    private static String readProcessOutput(Process process) throws IOException {
        try (InputStream stream = process.getInputStream()) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static String summarizeOutput(String output) {
        if (output == null || output.isBlank()) {
            return "Check that the document is not corrupted or password-protected.";
        }
        String trimmed = output.strip();
        if (trimmed.length() > 240) {
            trimmed = trimmed.substring(0, 240) + "…";
        }
        return trimmed;
    }

    private static String truncate(String value) {
        if (value == null || value.length() <= 500) {
            return value;
        }
        return value.substring(0, 500) + "…";
    }

    private static void deleteRecursively(Path root) {
        if (root == null || !Files.exists(root)) {
            return;
        }
        try {
            Files.walkFileTree(root, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    Files.deleteIfExists(file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                    Files.deleteIfExists(dir);
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException ex) {
            LOGGER.debug("Failed to clean LibreOffice temp dir {}: {}", root, ex.getMessage());
        }
    }
}
