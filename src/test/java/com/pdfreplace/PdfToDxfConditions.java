package com.pdfreplace;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

/**
 * JUnit 5 {@code @EnabledIf} condition — true when pdf_to_dxf.py and Python deps are available.
 */
final class PdfToDxfConditions {
    private PdfToDxfConditions() {}

    static boolean isAvailable() {
        String python = System.getenv().getOrDefault("PDF_DXF_PYTHON", "python3");
        String gs = System.getenv().getOrDefault("GHOSTSCRIPT_COMMAND", "gs");
        String script = System.getenv().getOrDefault("PDF_DXF_SCRIPT", "scripts/pdf_to_dxf.py");
        Path scriptPath = Path.of(script);
        if (!Files.isRegularFile(scriptPath)) {
            scriptPath = Path.of(System.getProperty("user.dir", ".")).resolve(script);
        }
        if (!Files.isRegularFile(scriptPath)) {
            return false;
        }
        if (!commandResponds(python, "--version")) {
            return false;
        }
        if (!commandResponds(gs, "--version")) {
            return false;
        }
        try {
            Process process = new ProcessBuilder(python, "-c", "import ezdxf, fitz")
                    .redirectErrorStream(true)
                    .start();
            boolean finished = process.waitFor(20, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return false;
            }
            return process.exitValue() == 0;
        } catch (Exception ex) {
            return false;
        }
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
}
