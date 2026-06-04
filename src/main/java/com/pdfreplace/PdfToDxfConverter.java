package com.pdfreplace;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Component
public class PdfToDxfConverter {
    private static final Logger LOGGER = LoggerFactory.getLogger(PdfToDxfConverter.class);
    private static final ReentrantLock CONVERSION_LOCK = new ReentrantLock();

    private final String pythonCommand;
    private final String ghostscriptCommand;
    private final Path scriptPath;
    private final long timeoutSeconds;

    public PdfToDxfConverter(
            @Value("${boltreplacer.pdf-dxf.python-command:python3}") String pythonCommand,
            @Value("${boltreplacer.pdf-dxf.ghostscript-command:gs}") String ghostscriptCommand,
            @Value("${boltreplacer.pdf-dxf.script-path:scripts/pdf_to_dxf.py}") String scriptPath,
            @Value("${boltreplacer.pdf-dxf.timeout-seconds:120}") long timeoutSeconds
    ) {
        this.pythonCommand = pythonCommand;
        this.ghostscriptCommand = ghostscriptCommand;
        this.scriptPath = resolveScript(scriptPath);
        this.timeoutSeconds = Math.max(30, timeoutSeconds);
    }

    public boolean isAvailable() {
        if (!Files.isRegularFile(scriptPath)) {
            return false;
        }
        if (!commandResponds(pythonCommand, "--version")) {
            return false;
        }
        if (!commandResponds(ghostscriptCommand, "--version")) {
            return false;
        }
        return pythonImportsReady();
    }

    /**
     * Converts each PDF page to its own DXF file, returned as a zip archive.
     */
    public byte[] convertToZip(Path inputPdf, String pdfPassword) throws IOException {
        if (!Files.isRegularFile(inputPdf)) {
            throw new IllegalArgumentException("PDF input file is missing.");
        }
        if (!isAvailable()) {
            throw new IllegalStateException(
                    "PDF to DXF is not available on this server. "
                            + "Install Python 3 with ezdxf and PyMuPDF, Ghostscript (gs), "
                            + "and set boltreplacer.pdf-dxf.script-path to pdf_to_dxf.py. "
                            + "The Docker image includes these dependencies.");
        }

        CONVERSION_LOCK.lock();
        try {
            return convertLocked(inputPdf, pdfPassword);
        } finally {
            CONVERSION_LOCK.unlock();
        }
    }

    Path scriptLocation() {
        return scriptPath;
    }

    private byte[] convertLocked(Path inputPdf, String pdfPassword) throws IOException {
        Path workDir = Files.createTempDirectory("pdfbolt-dxf-");
        try {
            Path outputDir = workDir.resolve("pages");
            Files.createDirectories(outputDir);

            List<String> cmd = new ArrayList<>();
            cmd.add(pythonCommand);
            cmd.add(scriptPath.toAbsolutePath().toString());
            cmd.add("--ghostscript");
            cmd.add(ghostscriptCommand);
            if (pdfPassword != null && !pdfPassword.isBlank()) {
                cmd.add("--password");
                cmd.add(pdfPassword);
            }
            cmd.add(inputPdf.toAbsolutePath().toString());
            cmd.add(outputDir.toAbsolutePath().toString());

            ProcessBuilder builder = new ProcessBuilder(cmd);
            builder.redirectErrorStream(true);
            Process process = builder.start();
            String output = readStream(process.getInputStream());

            boolean finished;
            try {
                finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                process.destroyForcibly();
                throw new IOException("PDF to DXF conversion was interrupted.", ex);
            }

            if (!finished) {
                process.destroyForcibly();
                throw new IOException("PDF to DXF conversion timed out after " + timeoutSeconds + " seconds.");
            }

            if (process.exitValue() != 0) {
                LOGGER.warn("pdf_to_dxf failed (exit {}): {}", process.exitValue(), truncate(output));
                throw new IOException("PDF to DXF conversion failed. " + summarizeOutput(output));
            }

            List<Path> dxfFiles;
            try (Stream<Path> stream = Files.list(outputDir)) {
                dxfFiles = stream
                        .filter(path -> Files.isRegularFile(path)
                                && path.getFileName().toString().toLowerCase().endsWith(".dxf"))
                        .sorted(Comparator.comparing(path -> path.getFileName().toString()))
                        .toList();
            }

            if (dxfFiles.isEmpty()) {
                throw new IOException(
                        "PDF to DXF did not produce any page files. " + summarizeOutput(output));
            }

            return zipDxfFiles(dxfFiles);
        } finally {
            deleteTree(workDir);
        }
    }

    private static byte[] zipDxfFiles(List<Path> dxfFiles) throws IOException {
        ByteArrayOutputStream zipBytes = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(zipBytes)) {
            for (Path dxf : dxfFiles) {
                ZipEntry entry = new ZipEntry(dxf.getFileName().toString());
                zip.putNextEntry(entry);
                zip.write(Files.readAllBytes(dxf));
                zip.closeEntry();
            }
        }
        return zipBytes.toByteArray();
    }

    private boolean pythonImportsReady() {
        try {
            Process process = new ProcessBuilder(
                    pythonCommand,
                    "-c",
                    "import ezdxf, fitz"
            ).redirectErrorStream(true).start();
            boolean finished = process.waitFor(15, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return false;
            }
            return process.exitValue() == 0;
        } catch (Exception ex) {
            return false;
        }
    }

    private static Path resolveScript(String configured) {
        Path direct = Path.of(configured);
        if (Files.isRegularFile(direct)) {
            return direct.toAbsolutePath().normalize();
        }
        Path fromUserDir = Path.of(System.getProperty("user.dir", ".")).resolve(configured);
        if (Files.isRegularFile(fromUserDir)) {
            return fromUserDir.toAbsolutePath().normalize();
        }
        Path dockerDefault = Path.of("/app/scripts/pdf_to_dxf.py");
        if (Files.isRegularFile(dockerDefault)) {
            return dockerDefault;
        }
        return direct.toAbsolutePath().normalize();
    }

    private static boolean commandResponds(String command, String flag) {
        try {
            Process process = new ProcessBuilder(command, flag)
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

    private static String readStream(InputStream stream) throws IOException {
        return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
    }

    private static String truncate(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String trimmed = text.trim();
        return trimmed.length() > 500 ? trimmed.substring(0, 500) + "…" : trimmed;
    }

    private static String summarizeOutput(String output) {
        String trimmed = truncate(output);
        return trimmed.isBlank() ? "No details from converter." : trimmed;
    }

    private static void deleteTree(Path root) {
        try {
            if (!Files.exists(root)) {
                return;
            }
            Files.walk(root)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                            // best effort
                        }
                    });
        } catch (IOException ignored) {
            // best effort
        }
    }
}
