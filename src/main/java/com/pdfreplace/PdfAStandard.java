package com.pdfreplace;

import java.util.Locale;

public enum PdfAStandard {
    PDF_A_1B(1, "1b"),
    PDF_A_2B(2, "2b"),
    PDF_A_3B(3, "3b");

    private final int ghostscriptLevel;
    private final String verapdfFlavour;

    PdfAStandard(int ghostscriptLevel, String verapdfFlavour) {
        this.ghostscriptLevel = ghostscriptLevel;
        this.verapdfFlavour = verapdfFlavour;
    }

    public int ghostscriptLevel() {
        return ghostscriptLevel;
    }

    /** veraPDF {@code --flavour} argument ({@code 1b}, {@code 2b}, {@code 3b}). */
    public String verapdfFlavour() {
        return verapdfFlavour;
    }

    /** @deprecated use {@link #verapdfFlavour()} */
    public String conformance() {
        return verapdfFlavour;
    }

    /**
     * Parses UI labels such as {@code PDF/A-2b (ISO 19005-2)} without matching ISO revision digits in 1b strings.
     */
    public static PdfAStandard parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return PDF_A_1B;
        }
        String normalized = raw.trim().toLowerCase(Locale.ROOT);
        if (normalized.contains("pdf/a-3") || normalized.contains("pdf/a3") || normalized.contains("19005-3")) {
            return PDF_A_3B;
        }
        if (normalized.contains("pdf/a-2") || normalized.contains("pdf/a2") || normalized.contains("19005-2")) {
            return PDF_A_2B;
        }
        return PDF_A_1B;
    }
}
