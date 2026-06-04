package com.pdfreplace;

import java.util.concurrent.TimeUnit;

final class VerapdfConditions {
    private VerapdfConditions() {}

    static boolean isAvailable() {
        String command = System.getenv().getOrDefault("VERAPDF_COMMAND", "verapdf");
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
