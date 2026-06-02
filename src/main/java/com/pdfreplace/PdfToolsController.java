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

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/pdf")
public class PdfToolsController {
    private final PdfToolsService toolsService;
    private final ToolUsageService toolUsageService;

    public PdfToolsController(PdfToolsService toolsService, ToolUsageService toolUsageService) {
        this.toolsService = toolsService;
        this.toolUsageService = toolUsageService;
    }

    @PostMapping(value = "/tools", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> execute(
            @RequestParam("operation") String operation,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "signature", required = false) MultipartFile signature,
            @RequestParam(value = "pageRange", required = false) String pageRange,
            @RequestParam(value = "pageOrder", required = false) String pageOrder,
            @RequestParam(value = "pdfPassword", required = false) String pdfPassword,
            @RequestParam(value = "pdfPasswordsJson", required = false) String pdfPasswordsJson,
            @RequestParam(value = "pdfaStandard", required = false) String pdfaStandard,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "ownerPassword", required = false) String ownerPassword,
            @RequestParam(value = "ocrLang", required = false) String ocrLang,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "dpi", required = false) Integer dpi,
            @RequestParam(value = "exportFormat", required = false) String exportFormat,
            @RequestParam(value = "angle", required = false) Integer angle,
            @RequestParam(value = "rotationScope", required = false) String rotationScope,
            @RequestParam(value = "pageNumberFormat", required = false) String pageNumberFormat,
            @RequestParam(value = "pageNumberSize", required = false) Integer pageNumberSize,
            @RequestParam(value = "pageNumberAlignment", required = false) String pageNumberAlignment,
            @RequestParam(value = "watermarkText", required = false) String watermarkText,
            @RequestParam(value = "watermarkSize", required = false) Integer watermarkSize,
            @RequestParam(value = "watermarkRotation", required = false) Integer watermarkRotation,
            @RequestParam(value = "watermarkOpacity", required = false) Float watermarkOpacity,
            @RequestParam(value = "watermarkColor", required = false) String watermarkColor,
            @RequestParam(value = "cropLeft", required = false) Float cropLeft,
            @RequestParam(value = "cropRight", required = false) Float cropRight,
            @RequestParam(value = "cropTop", required = false) Float cropTop,
            @RequestParam(value = "cropBottom", required = false) Float cropBottom,
            @RequestParam(value = "metadataTitle", required = false) String metadataTitle,
            @RequestParam(value = "metadataAuthor", required = false) String metadataAuthor,
            @RequestParam(value = "metadataSubject", required = false) String metadataSubject,
            @RequestParam(value = "metadataCreator", required = false) String metadataCreator,
            @RequestParam(value = "sigPage", required = false) Integer sigPage,
            @RequestParam(value = "sigX", required = false) Float sigX,
            @RequestParam(value = "sigY", required = false) Float sigY,
            @RequestParam(value = "sigWidth", required = false) Float sigWidth,
            @RequestParam(value = "sigHeight", required = false) Float sigHeight,
            @RequestParam(value = "redactPage", required = false) Integer redactPage,
            @RequestParam(value = "redactX", required = false) Float redactX,
            @RequestParam(value = "redactY", required = false) Float redactY,
            @RequestParam(value = "redactWidth", required = false) Float redactWidth,
            @RequestParam(value = "redactHeight", required = false) Float redactHeight
    ) throws Exception {
        MultipartFile[] mergedFiles = mergeFiles(file, files);
        PdfToolsService.ToolParams params = PdfToolsService.ToolParams.fromRequest(
                pageRange,
                pageOrder,
                pdfPassword,
                pdfPasswordsJson,
                pdfaStandard,
                password,
                ownerPassword,
                ocrLang,
                text,
                title,
                dpi,
                exportFormat,
                angle,
                rotationScope,
                pageNumberFormat,
                pageNumberSize,
                pageNumberAlignment,
                watermarkText,
                watermarkSize,
                watermarkRotation,
                watermarkOpacity,
                watermarkColor,
                cropLeft,
                cropRight,
                cropTop,
                cropBottom,
                metadataTitle,
                metadataAuthor,
                metadataSubject,
                metadataCreator,
                sigPage,
                sigX,
                sigY,
                sigWidth,
                sigHeight,
                redactPage,
                redactX,
                redactY,
                redactWidth,
                redactHeight
        );

        PdfToolsService.ToolOutput output = toolsService.execute(
                operation,
                file,
                mergedFiles,
                signature,
                params
        );
        toolUsageService.record(operation);

        if (output.jsonBody() != null) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(output.jsonBody());
        }

        String filename = output.filename() == null ? "bolt_output" : output.filename();
        var response = ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(output.contentType()))
                .contentLength(output.bytes().length)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString());
        if (output.responseHeaders() != null) {
            for (var entry : output.responseHeaders().entrySet()) {
                response = response.header(entry.getKey(), entry.getValue());
            }
        }
        return response.body(new ByteArrayResource(output.bytes()));
    }

    private static MultipartFile[] mergeFiles(MultipartFile file, MultipartFile[] files) {
        List<MultipartFile> merged = new ArrayList<>();
        if (file != null && !file.isEmpty()) {
            merged.add(file);
        }
        if (files != null) {
            for (MultipartFile upload : files) {
                if (upload != null && !upload.isEmpty()) {
                    merged.add(upload);
                }
            }
        }
        return merged.toArray(new MultipartFile[0]);
    }
}
