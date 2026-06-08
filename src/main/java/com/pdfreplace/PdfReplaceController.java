package com.pdfreplace;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PdfReplaceController {
    private final PdfReplaceService service;
    private final ToolUsageService toolUsageService;

    public PdfReplaceController(PdfReplaceService service, ToolUsageService toolUsageService) {
        this.service = service;
        this.toolUsageService = toolUsageService;
    }

    @PostMapping(value = "/replace", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ByteArrayResource> replace(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam("search") List<String> search,
            @RequestParam(value = "replacement", required = false) List<String> replacement,
            @RequestParam(value = "strict", defaultValue = "false") boolean strict,
            @RequestParam(value = "matchMode", defaultValue = "exact") String matchMode,
            @RequestParam(value = "replaceScope", defaultValue = "all") String replaceScope,
            @RequestParam(value = "occurrenceIndex", required = false) Integer occurrenceIndex,
            @RequestParam(value = "preserveStyle", defaultValue = "true") boolean preserveStyle,
            @RequestParam(value = "retainMetadata", defaultValue = "true") boolean retainMetadata,
            @RequestParam(value = "pdfPassword", required = false) String pdfPassword,
            @RequestParam(value = "pdfPasswordsJson", required = false) String pdfPasswordsJson
    ) throws Exception {
        PdfReplaceService.BatchReplacementOutput output = service.replaceBatch(
                mergeFiles(file, files),
                search,
                replacement == null ? List.of() : replacement,
                strict,
                matchMode,
                replaceScope,
                occurrenceIndex,
                preserveStyle,
                retainMetadata,
                pdfPassword,
                pdfPasswordsJson
        );
        toolUsageService.record("replace");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(output.contentType()))
                .contentLength(output.bytes().length)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(output.filename()).build().toString())
                .header("X-Bolt-Replacer-Matches", String.valueOf(output.summary().matchesReplaced()))
                .header("X-Bolt-Replacer-Matches-Found", String.valueOf(output.summary().matchesFound()))
                .header("X-Bolt-Replacer-Style-Preserved", String.valueOf(output.summary().stylePreservedCount()))
                .header("X-Bolt-Replacer-Style-Fallback", String.valueOf(output.summary().fallbackStyleCount()))
                .header("X-Bolt-Replacer-Validation", output.validation().passed() ? "passed" : "failed")
                .header("X-Bolt-Replacer-Rules-Validated", String.valueOf(output.validation().rulesValidated()))
                .header("X-Bolt-Replacer-Validation-Warnings", String.valueOf(output.validation().warnings().size()))
                .body(new ByteArrayResource(output.bytes()));
    }

    private static MultipartFile[] mergeFiles(MultipartFile file, MultipartFile[] files) {
        if (files != null && files.length > 0) {
            return files;
        }
        if (file != null) {
            return new MultipartFile[]{file};
        }
        return new MultipartFile[0];
    }
}
