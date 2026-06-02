package com.pdfreplace;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Persists per-tool run counts in a JSON file (no database required).
 */
@Service
public class ToolUsageService {
    private static final Logger LOGGER = LoggerFactory.getLogger(ToolUsageService.class);
    private static final ObjectMapper JSON = new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT);

    private final Path statsPath;
    private final ReentrantLock lock = new ReentrantLock();

    public ToolUsageService(
            @Value("${boltreplacer.usage.stats-path:${java.io.tmpdir}/pdfbolt-tool-usage.json}") String statsPath
    ) {
        this.statsPath = Path.of(statsPath).toAbsolutePath().normalize();
    }

    public void record(String toolIdRaw) {
        String toolId = normalizeToolId(toolIdRaw);
        if (toolId == null) {
            return;
        }
        lock.lock();
        try {
            Map<String, Long> counts = new LinkedHashMap<>(loadCounts());
            counts.merge(toolId, 1L, Long::sum);
            saveCounts(counts);
        } catch (IOException ex) {
            LOGGER.warn("Could not persist tool usage for {}: {}", toolId, ex.getMessage());
        } finally {
            lock.unlock();
        }
    }

    public List<ToolUsageEntry> popular(int limit) {
        int capped = Math.max(1, Math.min(limit, 32));
        lock.lock();
        try {
            return loadCounts().entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder())
                            .thenComparing(Map.Entry::getKey))
                    .limit(capped)
                    .map(entry -> new ToolUsageEntry(entry.getKey(), entry.getValue()))
                    .toList();
        } catch (IOException ex) {
            LOGGER.warn("Could not read tool usage stats: {}", ex.getMessage());
            return List.of();
        } finally {
            lock.unlock();
        }
    }

    public record ToolUsageEntry(String toolId, long count) {
    }

    private Map<String, Long> loadCounts() throws IOException {
        if (!Files.isRegularFile(statsPath)) {
            return new LinkedHashMap<>();
        }
        byte[] bytes = Files.readAllBytes(statsPath);
        if (bytes.length == 0) {
            return new LinkedHashMap<>();
        }
        Map<String, Object> root = JSON.readValue(bytes, new TypeReference<>() {});
        Object raw = root.get("counts");
        if (!(raw instanceof Map<?, ?> map)) {
            return new LinkedHashMap<>();
        }
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) {
                continue;
            }
            String id = normalizeToolId(String.valueOf(entry.getKey()));
            if (id == null) {
                continue;
            }
            long value = entry.getValue() instanceof Number number
                    ? number.longValue()
                    : Long.parseLong(String.valueOf(entry.getValue()));
            counts.put(id, value);
        }
        return counts;
    }

    private void saveCounts(Map<String, Long> counts) throws IOException {
        Path parent = statsPath.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("updatedAt", Instant.now().toString());
        root.put("counts", counts);
        Path parentDir = statsPath.getParent() != null ? statsPath.getParent() : Path.of(".");
        Path temp = parentDir.resolve(statsPath.getFileName().toString() + ".tmp");
        JSON.writeValue(temp.toFile(), root);
        try {
            Files.move(temp, statsPath, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException ex) {
            Files.move(temp, statsPath, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    static String normalizeToolId(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return raw.trim().toLowerCase(Locale.ROOT).replace('_', '-');
    }
}
