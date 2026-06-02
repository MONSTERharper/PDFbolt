package com.pdfreplace;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

@Service
public class OfficeToPdfService {
    private final LibreOfficeConverter libreOffice;
    private final PdfUploadValidator uploadValidator;

    public OfficeToPdfService(LibreOfficeConverter libreOffice, PdfUploadValidator uploadValidator) {
        this.libreOffice = libreOffice;
        this.uploadValidator = uploadValidator;
    }

    public PdfToolsService.ToolOutput convert(MultipartFile file, OfficeDocumentType type) throws IOException {
        uploadValidator.validateOfficeFile(file, type);
        String safeName = PdfUploadValidator.safeFilename(file.getOriginalFilename());
        type.ensureFilename(safeName);

        String suffix = extensionOf(safeName, type.preferredExtension());
        Path input = Files.createTempFile("pdfbolt-office-", suffix);
        try {
            PdfUploadValidator.copyUpload(file, input);
            byte[] pdfBytes = libreOffice.convertToPdf(input);

            Path pdfPath = Files.createTempFile("pdfbolt-office-out-", ".pdf");
            try {
                Files.write(pdfPath, pdfBytes);
                PdfUploadValidator.ensureLooksLikePdf(pdfPath);
                uploadValidator.enforcePageLimit(pdfPath);
            } finally {
                Files.deleteIfExists(pdfPath);
            }

            String outputName = PdfUploadValidator.boltOutputName(safeName, "converted", ".pdf");
            return PdfToolsService.ToolOutput.pdf(pdfBytes, outputName);
        } finally {
            Files.deleteIfExists(input);
        }
    }

    private static String extensionOf(String filename, String fallback) {
        int dot = filename.lastIndexOf('.');
        if (dot > 0 && dot < filename.length() - 1) {
            return filename.substring(dot).toLowerCase(Locale.ROOT);
        }
        return fallback;
    }
}
