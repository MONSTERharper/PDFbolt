package com.pdfreplace;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tools")
public class ToolUsageController {
    private final ToolUsageService toolUsageService;

    public ToolUsageController(ToolUsageService toolUsageService) {
        this.toolUsageService = toolUsageService;
    }

    @GetMapping("/popular")
    public ResponseEntity<Map<String, Object>> popular(
            @RequestParam(value = "limit", defaultValue = "8") int limit
    ) {
        List<ToolUsageService.ToolUsageEntry> tools = toolUsageService.popular(limit);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("tools", tools.stream()
                .map(entry -> Map.of("toolId", entry.toolId(), "count", entry.count()))
                .toList());
        return ResponseEntity.ok(body);
    }

    /** Optional beacon for client-only tools (e.g. redact) after a successful run. */
    @PostMapping("/usage")
    public ResponseEntity<Map<String, String>> record(@RequestParam("toolId") String toolId) {
        toolUsageService.record(toolId);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
