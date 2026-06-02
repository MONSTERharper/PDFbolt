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

@RestController
@RequestMapping("/api")
public class PdfCompressController {
    private final PdfCompressService service;
    private final ToolUsageService toolUsageService;

    public PdfCompressController(PdfCompressService service, ToolUsageService toolUsageService) {
        this.service = service;
        this.toolUsageService = toolUsageService;
    }

    @PostMapping(value = "/compress", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ByteArrayResource> compress(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "level", defaultValue = "balanced") String level,
            @RequestParam(value = "retainMetadata", defaultValue = "true") boolean retainMetadata,
            @RequestParam(value = "pdfPassword", required = false) String pdfPassword,
            @RequestParam(value = "pdfPasswordsJson", required = false) String pdfPasswordsJson
    ) throws Exception {
        PdfCompressService.CompressOutput output = service.compress(
                mergeFiles(file, files),
                level,
                retainMetadata,
                pdfPassword,
                pdfPasswordsJson);
        toolUsageService.record("compress");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(output.contentType()))
                .contentLength(output.bytes().length)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(output.filename()).build().toString())
                .header("X-Bolt-Compress-Original-Bytes", String.valueOf(output.summary().originalBytes()))
                .header("X-Bolt-Compress-Output-Bytes", String.valueOf(output.summary().compressedBytes()))
                .header("X-Bolt-Compress-Saved-Bytes", String.valueOf(output.summary().savedBytes()))
                .header("X-Bolt-Compress-Saved-Percent", String.valueOf(output.summary().savedPercent()))
                .header("X-Bolt-Compress-Pages", String.valueOf(output.summary().pages()))
                .header("X-Bolt-Compress-Images-Processed", String.valueOf(output.summary().imagesProcessed()))
                .header("X-Bolt-Compress-Level", output.summary().levelId())
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
