package com.pdfreplace;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ToolUsageServiceTest {
    @TempDir
    Path tempDir;

    @Test
    void recordsAndRanksPopularTools() throws Exception {
        Path stats = tempDir.resolve("usage.json");
        ToolUsageService service = new ToolUsageService(stats.toString());

        service.record("merge");
        service.record("merge");
        service.record("compress");
        service.record("replace");

        var popular = service.popular(3);
        assertEquals(3, popular.size());
        assertEquals("merge", popular.get(0).toolId());
        assertEquals(2L, popular.get(0).count());
    }

    @Test
    void normalizesToolIds() {
        assertEquals("pdf-to-word", ToolUsageService.normalizeToolId("PDF_TO_WORD"));
        assertEquals("images-to-pdf", ToolUsageService.normalizeToolId("jpg-to-pdf"));
        assertNull(ToolUsageService.normalizeToolId("  "));
    }
}
