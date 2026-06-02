package com.pdfreplace;

import java.util.concurrent.TimeUnit;

/**
 * JUnit 5 {@code @EnabledIf} condition — true when {@code soffice} responds on PATH.
 */
final class LibreOfficeConditions {
    private LibreOfficeConditions() {}

    static boolean isAvailable() {
        String command = System.getenv().getOrDefault("LIBREOFFICE_COMMAND", "soffice");
        try {
            Process process = new ProcessBuilder(command, "--version")
                    .redirectErrorStream(true)
                    .start();
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
}
