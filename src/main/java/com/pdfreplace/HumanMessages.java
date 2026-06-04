package com.pdfreplace;

/**
 * Customer-facing phrasing for limits and sizes (shared by validators and API responses).
 */
final class HumanMessages {
    private HumanMessages() {}

    static String formatBytes(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        }
        if (bytes < 1024 * 1024) {
            return (bytes / 1024) + " KB";
        }
        long mb = Math.round(bytes / (1024.0 * 1024.0));
        return mb + " MB";
    }

    static String fileTooLarge(long maxFileSizeBytes) {
        return "File is too large (maximum " + formatBytes(maxFileSizeBytes) + " per file).";
    }

    static String totalUploadTooLarge(long maxTotalUploadBytes) {
        return "Total upload is too large (maximum " + formatBytes(maxTotalUploadBytes) + " combined).";
    }

    static String tooManyFiles(int maxFiles) {
        return "Too many files (maximum " + maxFiles + ").";
    }

    static String tooManyPages(int pages, int maxPages) {
        return "PDF has " + pages + " pages. Maximum allowed is " + maxPages + " pages.";
    }
}
