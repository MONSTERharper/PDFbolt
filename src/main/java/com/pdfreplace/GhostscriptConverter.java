package com.pdfreplace;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class GhostscriptConverter {
    private static final Logger LOGGER = LoggerFactory.getLogger(GhostscriptConverter.class);

    private final String command;
    private final long timeoutSeconds;
    private final boolean validateWithVerapdf;
    private final String verapdfCommand;

    public GhostscriptConverter(
            @Value("${boltreplacer.ghostscript.command:gs}") String command,
            @Value("${boltreplacer.ghostscript.timeout-seconds:120}") long timeoutSeconds,
            @Value("${boltreplacer.pdfa.validate:true}") boolean validateWithVerapdf,
            @Value("${boltreplacer.verapdf.command:verapdf}") String verapdfCommand
    ) {
        this.command = command;
        this.timeoutSeconds = Math.max(30, timeoutSeconds);
        this.validateWithVerapdf = validateWithVerapdf;
        this.verapdfCommand = verapdfCommand;
    }

    public boolean isAvailable() {
        return commandExists(command);
    }

    public PdfAConversionResult convertToPdfA(Path input, PdfAStandard standard, String pdfPassword) throws IOException {
        if (!Files.isRegularFile(input)) {
            throw new IllegalArgumentException("PDF input file is missing.");
        }
        if (!isAvailable()) {
            throw new IllegalStateException(
                    "Ghostscript is not installed or not on PATH (gs). "
                            + "Install on the server, e.g. sudo apt-get install -y ghostscript, "
                            + "or set boltreplacer.ghostscript.command to the full path.");
        }

        Path workDir = Files.createTempDirectory("pdfbolt-gs-");
        try {
            Path output = workDir.resolve("output.pdf");
            runGhostscript(input, output, standard, pdfPassword);
            if (!Files.isRegularFile(output) || Files.size(output) < 5) {
                throw new IOException("Ghostscript did not produce a PDF/A output file.");
            }
            boolean validated = false;
            String validationNote;
            String flavour = verapdfFlavour(standard);
            if (validateWithVerapdf && isVerapdfAvailable()) {
                try {
                    validateWithVerapdf(output, flavour);
                    validated = true;
                    validationNote = "Passed PDF/A-" + flavour + " validation check.";
                } catch (IOException ex) {
                    validationNote = "Converted to PDF/A-" + flavour + ", but the archive check did not pass. "
                            + trimLog(ex.getMessage());
                    LOGGER.warn("veraPDF validation failed for {}: {}", flavour, ex.getMessage());
                }
            } else if (validateWithVerapdf) {
                validationNote = "Converted to PDF/A; compliance was not checked on this server.";
                LOGGER.warn("veraPDF not found on PATH — returning Ghostscript PDF/A output without validation.");
            } else {
                validationNote = "Converted to PDF/A; validation is turned off on this server.";
            }
            return new PdfAConversionResult(Files.readAllBytes(output), validated, validationNote);
        } finally {
            deleteTree(workDir);
        }
    }

    private void runGhostscript(Path input, Path output, PdfAStandard standard, String pdfPassword)
            throws IOException {
        List<String> cmd = new ArrayList<>();
        cmd.add(command);
        cmd.add("-dNOPAUSE");
        cmd.add("-dBATCH");
        cmd.add("-sDEVICE=pdfwrite");
        cmd.add("-dPDFA=" + standard.ghostscriptLevel());
        cmd.add("-dPDFACompatibilityPolicy=1");
        cmd.add("-sColorConversionStrategy=UseDeviceIndependentColor");
        cmd.add("-sProcessColorModel=DeviceRGB");
        if (pdfPassword != null && !pdfPassword.isBlank()) {
            cmd.add("-sPDFPassword=" + pdfPassword);
        }
        cmd.add("-sOutputFile=" + output.toAbsolutePath());
        cmd.add(input.toAbsolutePath().toString());

        ProcessBuilder builder = new ProcessBuilder(cmd);
        builder.redirectErrorStream(true);
        Process process = builder.start();
        String outputLog = readStream(process.getInputStream());

        boolean finished;
        try {
            finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            throw new IOException("Ghostscript conversion was interrupted.", ex);
        }

        if (!finished) {
            process.destroyForcibly();
            throw new IOException("Ghostscript timed out after " + timeoutSeconds + " seconds.");
        }

        if (process.exitValue() != 0) {
            throw new IOException("Ghostscript PDF/A conversion failed: " + trimLog(outputLog));
        }
    }

    private static String verapdfFlavour(PdfAStandard standard) {
        return standard.verapdfFlavour();
    }

    private void validateWithVerapdf(Path pdf, String flavour) throws IOException {
        List<String> cmd = List.of(
                verapdfCommand,
                "--flavour",
                flavour,
                pdf.toAbsolutePath().toString()
        );
        ProcessBuilder builder = new ProcessBuilder(cmd);
        builder.redirectErrorStream(true);
        Process process = builder.start();
        String log = readStream(process.getInputStream());

        boolean finished;
        try {
            finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            throw new IOException("veraPDF validation was interrupted.", ex);
        }

        if (!finished) {
            process.destroyForcibly();
            throw new IOException("veraPDF validation timed out.");
        }

        if (process.exitValue() != 0) {
            throw new IOException(trimLog(log));
        }
    }

    public boolean isVerapdfAvailable() {
        return commandExists(verapdfCommand);
    }

    private static boolean commandExists(String cmd) {
        try {
            Process process = new ProcessBuilder(cmd, "--version")
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

    private static String trimLog(String log) {
        if (log == null || log.isBlank()) {
            return "no output";
        }
        String trimmed = log.trim();
        return trimmed.length() > 500 ? trimmed.substring(0, 500) + "…" : trimmed;
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
