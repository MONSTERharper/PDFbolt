package com.pdfreplace;

import java.util.concurrent.TimeUnit;

final class GhostscriptConditions {
    private GhostscriptConditions() {}

    static boolean isAvailable() {
        String command = System.getenv().getOrDefault("GHOSTSCRIPT_COMMAND", "gs");
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
