package com.pdfreplace;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Resolves per-file PDF passwords from a shared password, ordered list, or JSON map.
 */
public final class PdfPasswordResolver {
    private static final ObjectMapper JSON = new ObjectMapper();

    private PdfPasswordResolver() {
    }

    public record FilePassword(String name, String password) {
    }

    public static String resolveForUpload(
            MultipartFile upload,
            int index,
            String fallbackPassword,
            String passwordsJson
    ) {
        String name = PdfUploadValidator.safeFilename(upload.getOriginalFilename());
        Map<String, String> byName = parsePasswordMap(passwordsJson);
        if (byName.containsKey(normalizeName(name))) {
            return byName.get(normalizeName(name));
        }
        List<String> ordered = parseOrderedPasswords(passwordsJson);
        if (index >= 0 && index < ordered.size()) {
            String entry = ordered.get(index);
            if (entry != null && !entry.isBlank()) {
                return entry;
            }
        }
        return fallbackPassword;
    }

    public static String resolveForFilename(
            String filename,
            int index,
            String fallbackPassword,
            String passwordsJson
    ) {
        String name = PdfUploadValidator.safeFilename(filename);
        Map<String, String> byName = parsePasswordMap(passwordsJson);
        if (byName.containsKey(normalizeName(name))) {
            return byName.get(normalizeName(name));
        }
        List<String> ordered = parseOrderedPasswords(passwordsJson);
        if (index >= 0 && index < ordered.size()) {
            String entry = ordered.get(index);
            if (entry != null && !entry.isBlank()) {
                return entry;
            }
        }
        return fallbackPassword;
    }

    public static Map<String, String> parsePasswordMap(String passwordsJson) {
        if (passwordsJson == null || passwordsJson.isBlank()) {
            return Collections.emptyMap();
        }
        String trimmed = passwordsJson.trim();
        try {
            if (trimmed.startsWith("[")) {
                List<FilePassword> entries = JSON.readValue(trimmed, new TypeReference<>() {});
                Map<String, String> map = new LinkedHashMap<>();
                for (FilePassword entry : entries) {
                    if (entry.name() != null && entry.password() != null) {
                        map.put(normalizeName(entry.name()), entry.password());
                    }
                }
                return map;
            }
            if (trimmed.startsWith("{")) {
                Map<String, String> raw = JSON.readValue(trimmed, new TypeReference<>() {});
                Map<String, String> map = new LinkedHashMap<>();
                for (Map.Entry<String, String> entry : raw.entrySet()) {
                    if (entry.getKey() != null && entry.getValue() != null) {
                        map.put(normalizeName(entry.getKey()), entry.getValue());
                    }
                }
                return map;
            }
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid pdfPasswordsJson payload.");
        }
        return Collections.emptyMap();
    }

    @SuppressWarnings("unchecked")
    private static List<String> parseOrderedPasswords(String passwordsJson) {
        if (passwordsJson == null || passwordsJson.isBlank()) {
            return List.of();
        }
        String trimmed = passwordsJson.trim();
        try {
            if (trimmed.startsWith("[")) {
                Object raw = JSON.readValue(trimmed, Object.class);
                if (raw instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof String) {
                    return list.stream().map(String::valueOf).toList();
                }
            }
        } catch (Exception ignored) {
            // not an ordered string array
        }
        return List.of();
    }

    private static String normalizeName(String name) {
        return name.trim().toLowerCase(Locale.ROOT);
    }
}
