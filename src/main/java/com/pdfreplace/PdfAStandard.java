package com.pdfreplace;

import java.util.Locale;

public enum PdfAStandard {
    PDF_A_1B(1, "1b"),
    PDF_A_2B(2, "2b"),
    PDF_A_3B(3, "3b");

    private final int ghostscriptLevel;
    private final String conformance;

    PdfAStandard(int ghostscriptLevel, String conformance) {
        this.ghostscriptLevel = ghostscriptLevel;
        this.conformance = conformance;
    }

    public int ghostscriptLevel() {
        return ghostscriptLevel;
    }

    public String conformance() {
        return conformance;
    }

    public static PdfAStandard parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return PDF_A_1B;
        }
        String normalized = raw.trim().toLowerCase(Locale.ROOT);
        if (normalized.contains("2")) {
            return PDF_A_2B;
        }
        if (normalized.contains("3")) {
            return PDF_A_3B;
        }
        return PDF_A_1B;
    }
}
