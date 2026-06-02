package com.pdfreplace;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

final class PageRangeParser {
    private PageRangeParser() {
    }

    static List<Integer> parseZeroBasedIndices(String rangeStr, int totalPages) {
        if (rangeStr == null || rangeStr.isBlank() || "all".equalsIgnoreCase(rangeStr.trim())) {
            List<Integer> all = new ArrayList<>(totalPages);
            for (int i = 0; i < totalPages; i++) {
                all.add(i);
            }
            return all;
        }
        Set<Integer> indices = new LinkedHashSet<>();
        for (String part : rangeStr.split(",")) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            if (trimmed.contains("-")) {
                String[] bounds = trimmed.split("-", 2);
                if (bounds.length < 2 || bounds[0].isBlank() || bounds[1].isBlank()) {
                    throw new IllegalArgumentException("Invalid page range: " + trimmed);
                }
                int start = parsePositiveInt(bounds[0].trim(), "page range");
                int end = parsePositiveInt(bounds[1].trim(), "page range");
                int lo = Math.max(1, Math.min(start, totalPages));
                int hi = Math.max(1, Math.min(end, totalPages));
                for (int p = Math.min(lo, hi); p <= Math.max(lo, hi); p++) {
                    indices.add(p - 1);
                }
            } else {
                int page = parsePositiveInt(trimmed, "page number");
                if (page >= 1 && page <= totalPages) {
                    indices.add(page - 1);
                }
            }
        }
        List<Integer> sorted = new ArrayList<>(indices);
        sorted.sort(Integer::compareTo);
        return sorted;
    }

    static List<Integer> parseOneBasedOrder(String orderStr, int totalPages) {
        List<Integer> order = new ArrayList<>();
        if (orderStr == null || orderStr.isBlank()) {
            throw new IllegalArgumentException("No valid page sequence specified. E.g., '3, 2, 1'.");
        }
        for (String part : orderStr.split(",")) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            int page = parsePositiveInt(trimmed, "page number");
            if (page < 1 || page > totalPages) {
                throw new IllegalArgumentException("Page " + page + " is out of range (1-" + totalPages + ").");
            }
            order.add(page - 1);
        }
        if (order.isEmpty()) {
            throw new IllegalArgumentException("No valid page sequence specified. E.g., '3, 2, 1'.");
        }
        return order;
    }

    private static int parsePositiveInt(String raw, String fieldName) {
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid " + fieldName + ": " + raw);
        }
    }
}
