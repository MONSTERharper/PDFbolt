package com.pdfreplace;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
public class PdfInspectController {
    private final PdfUploadValidator uploadValidator;

    public PdfInspectController(PdfUploadValidator uploadValidator) {
        this.uploadValidator = uploadValidator;
    }

    @PostMapping(value = "/inspect", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> inspect(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "pdfPassword", required = false) String pdfPassword,
            @RequestParam(value = "pdfPasswordsJson", required = false) String pdfPasswordsJson
    ) throws IOException {
        List<MultipartFile> uploads = mergeUploads(file, files);
        if (uploads.isEmpty()) {
            throw new IllegalArgumentException("Upload at least one PDF file to inspect.");
        }
        uploadValidator.validatePdfBatch(uploads.toArray(new MultipartFile[0]), true);

        List<Map<String, Object>> results = new ArrayList<>();
        boolean anyPasswordRequired = false;
        boolean allAccepted = true;

        for (int i = 0; i < uploads.size(); i++) {
            MultipartFile upload = uploads.get(i);
            Path staged = Files.createTempFile("pdfbolt-inspect-", ".pdf");
            try {
                PdfUploadValidator.copyUpload(upload, staged);
                PdfUploadValidator.ensureLooksLikePdf(staged);
                PdfEncryptionInspector.EncryptionStatus status = PdfEncryptionInspector.inspect(staged);
                String name = PdfUploadValidator.safeFilename(upload.getOriginalFilename());
                boolean passwordRequired = status.passwordRequired();
                String password = PdfPasswordResolver.resolveForUpload(upload, i, pdfPassword, pdfPasswordsJson);
                boolean passwordAccepted = !passwordRequired;
                if (passwordRequired) {
                    anyPasswordRequired = true;
                    passwordAccepted = password != null
                            && !password.isBlank()
                            && PdfEncryptionInspector.verifyPassword(staged, password);
                    if (!passwordAccepted) {
                        allAccepted = false;
                    }
                }

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("name", name);
                item.put("encrypted", status.encrypted());
                item.put("passwordRequired", passwordRequired);
                item.put("encryptionKind", status.encryptionKind());
                item.put("passwordAccepted", passwordAccepted);
                results.add(item);
            } finally {
                Files.deleteIfExists(staged);
            }
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("files", results);
        body.put("anyPasswordRequired", anyPasswordRequired);
        body.put("allPasswordsAccepted", !anyPasswordRequired || allAccepted);
        return ResponseEntity.ok(body);
    }

    private static List<MultipartFile> mergeUploads(MultipartFile file, MultipartFile[] files) {
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
        return merged;
    }
}
