package com.pdfreplace;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class PdfToDxfService {
    private final PdfUploadValidator uploadValidator;
    private final PdfDocumentOpener documentOpener;
    private final PdfToDxfConverter pdfToDxf;

    public PdfToDxfService(
            PdfUploadValidator uploadValidator,
            PdfDocumentOpener documentOpener,
            PdfToDxfConverter pdfToDxf
    ) {
        this.uploadValidator = uploadValidator;
        this.documentOpener = documentOpener;
        this.pdfToDxf = pdfToDxf;
    }

    public PdfToolsService.ToolOutput convert(
            MultipartFile file,
            String pdfPassword,
            String pdfPasswordsJson
    ) throws IOException {
        uploadValidator.validateSinglePdf(file);
        Path staged = Files.createTempFile("pdfbolt-dxf-in-", ".pdf");
        try {
            PdfUploadValidator.copyUpload(file, staged);
            PdfUploadValidator.ensureLooksLikePdf(staged);
            String password = PdfPasswordResolver.resolveForUpload(file, 0, pdfPassword, pdfPasswordsJson);
            try (PdfDocumentOpener.PreparedDocument opened = documentOpener.prepare(staged, password, false)) {
                uploadValidator.enforcePageLimit(opened.path());
                byte[] zipBytes = pdfToDxf.convertToZip(opened.path(), password);
                String base = PdfUploadValidator.safeFilename(file.getOriginalFilename());
                if (base.toLowerCase(java.util.Locale.ROOT).endsWith(".pdf")) {
                    base = base.substring(0, base.length() - 4);
                }
                return PdfToolsService.ToolOutput.zip(zipBytes, "bolt_" + base + "_dxf_pages.zip");
            }
        } finally {
            Files.deleteIfExists(staged);
        }
    }
}
