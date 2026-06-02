package com.pdfreplace;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class PdfToPdfaService {
    private final PdfUploadValidator uploadValidator;
    private final PdfDocumentOpener documentOpener;
    private final GhostscriptConverter ghostscript;

    public PdfToPdfaService(
            PdfUploadValidator uploadValidator,
            PdfDocumentOpener documentOpener,
            GhostscriptConverter ghostscript
    ) {
        this.uploadValidator = uploadValidator;
        this.documentOpener = documentOpener;
        this.ghostscript = ghostscript;
    }

    public PdfAConversionResult convert(
            MultipartFile file,
            PdfAStandard standard,
            String pdfPassword,
            String pdfPasswordsJson
    ) throws IOException {
        uploadValidator.validateSinglePdf(file);
        Path staged = Files.createTempFile("pdfbolt-pdfa-in-", ".pdf");
        try {
            PdfUploadValidator.copyUpload(file, staged);
            PdfUploadValidator.ensureLooksLikePdf(staged);
            String password = PdfPasswordResolver.resolveForUpload(file, 0, pdfPassword, pdfPasswordsJson);
            try (PdfDocumentOpener.PreparedDocument opened = documentOpener.prepare(staged, password, false)) {
                return ghostscript.convertToPdfA(opened.path(), standard, null);
            }
        } finally {
            Files.deleteIfExists(staged);
        }
    }
}
