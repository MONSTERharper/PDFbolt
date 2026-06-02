package com.pdfreplace;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class PdfToOfficeService {
    private final PdfUploadValidator uploadValidator;
    private final PdfDocumentOpener documentOpener;
    private final LibreOfficeConverter libreOffice;

    public PdfToOfficeService(
            PdfUploadValidator uploadValidator,
            PdfDocumentOpener documentOpener,
            LibreOfficeConverter libreOffice
    ) {
        this.uploadValidator = uploadValidator;
        this.documentOpener = documentOpener;
        this.libreOffice = libreOffice;
    }

    public PdfToolsService.ToolOutput convert(
            MultipartFile file,
            PdfOfficeExportFormat format,
            String pdfPassword,
            String pdfPasswordsJson
    ) throws IOException {
        uploadValidator.validateSinglePdf(file);
        Path staged = Files.createTempFile("pdfbolt-pdf-office-in-", ".pdf");
        try {
            PdfUploadValidator.copyUpload(file, staged);
            PdfUploadValidator.ensureLooksLikePdf(staged);
            String password = PdfPasswordResolver.resolveForUpload(file, 0, pdfPassword, pdfPasswordsJson);
            try (PdfDocumentOpener.PreparedDocument opened = documentOpener.prepare(staged, password, false)) {
                byte[] bytes = libreOffice.convertFromPdf(opened.path(), format);
                String filename = PdfUploadValidator.boltOutputName(
                        file.getOriginalFilename(),
                        format.outputSuffix(),
                        format.extension());
                return PdfToolsService.ToolOutput.office(bytes, filename, format.contentType());
            }
        } finally {
            Files.deleteIfExists(staged);
        }
    }
}
