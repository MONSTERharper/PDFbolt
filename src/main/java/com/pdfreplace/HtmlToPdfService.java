package com.pdfreplace;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

@Service
public class HtmlToPdfService {
    private final LibreOfficeConverter libreOffice;
    private final PdfUploadValidator uploadValidator;

    public HtmlToPdfService(LibreOfficeConverter libreOffice, PdfUploadValidator uploadValidator) {
        this.libreOffice = libreOffice;
        this.uploadValidator = uploadValidator;
    }

    public PdfToolsService.ToolOutput convertFile(MultipartFile file, String title) throws IOException {
        uploadValidator.validateHtmlFile(file);
        String safeName = PdfUploadValidator.safeFilename(file.getOriginalFilename());

        Path input = Files.createTempFile("pdfbolt-html-", suffixOf(safeName, ".html"));
        try {
            PdfUploadValidator.copyUpload(file, input);
            String raw = Files.readString(input, StandardCharsets.UTF_8);
            uploadValidator.validateHtmlContent(raw);
            String document = HtmlDocumentBuilder.toFullDocument(raw, title);
            if (!document.equals(raw.strip())) {
                Files.writeString(input, document, StandardCharsets.UTF_8);
            }

            byte[] pdfBytes = libreOffice.convertToPdf(input);
            return finishOutput(pdfBytes, safeName);
        } finally {
            Files.deleteIfExists(input);
        }
    }

    public PdfToolsService.ToolOutput convert(String html, String title) throws IOException {
        uploadValidator.validateHtmlContent(html);
        String document = HtmlDocumentBuilder.toFullDocument(html, title);

        Path input = Files.createTempFile("pdfbolt-html-", ".html");
        try {
            Files.writeString(input, document, StandardCharsets.UTF_8);
            byte[] pdfBytes = libreOffice.convertToPdf(input);
            return finishOutput(pdfBytes, "bolt_html.html");
        } finally {
            Files.deleteIfExists(input);
        }
    }

    private PdfToolsService.ToolOutput finishOutput(byte[] pdfBytes, String sourceName) throws IOException {
        Path pdfPath = Files.createTempFile("pdfbolt-html-out-", ".pdf");
        try {
            Files.write(pdfPath, pdfBytes);
            PdfUploadValidator.ensureLooksLikePdf(pdfPath);
            uploadValidator.enforcePageLimit(pdfPath);
        } finally {
            Files.deleteIfExists(pdfPath);
        }
        String outputName = PdfUploadValidator.boltOutputName(sourceName, "html", ".pdf");
        return PdfToolsService.ToolOutput.pdf(pdfBytes, outputName);
    }

    private static String suffixOf(String filename, String fallback) {
        int dot = filename.lastIndexOf('.');
        if (dot > 0 && dot < filename.length() - 1) {
            return filename.substring(dot).toLowerCase(Locale.ROOT);
        }
        return fallback;
    }
}
