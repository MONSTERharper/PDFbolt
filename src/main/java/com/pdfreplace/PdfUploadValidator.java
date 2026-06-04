package com.pdfreplace;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;

@Component
public class PdfUploadValidator {
    @Value("${boltreplacer.limits.max-pages:250}")
    private int maxPages;

    @Value("${boltreplacer.limits.max-files:10}")
    private int maxFiles;

    @Value("${boltreplacer.limits.max-file-size-bytes:26214400}")
    private long maxFileSizeBytes;

    @Value("${boltreplacer.limits.max-total-upload-bytes:104857600}")
    private long maxTotalUploadBytes;

    @Value("${boltreplacer.limits.max-html-content-bytes:5242880}")
    private long maxHtmlContentBytes;

    public void validatePdfBatch(MultipartFile[] files, boolean requireAtLeastOne) {
        if (files == null || files.length == 0) {
            if (requireAtLeastOne) {
                throw new IllegalArgumentException("Upload at least one PDF file.");
            }
            return;
        }
        if (files.length > maxFiles) {
            throw new IllegalArgumentException(HumanMessages.tooManyFiles(maxFiles));
        }
        long totalBytes = 0;
        for (MultipartFile file : files) {
            validateSinglePdf(file);
            totalBytes += file.getSize();
        }
        if (totalBytes > maxTotalUploadBytes) {
            throw new IllegalArgumentException(HumanMessages.totalUploadTooLarge(maxTotalUploadBytes));
        }
    }

    public void validateSinglePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload a valid PDF file.");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException(HumanMessages.fileTooLarge(maxFileSizeBytes));
        }
        String filename = file.getOriginalFilename();
        if (filename != null && !filename.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are supported for this operation.");
        }
    }

    public void validateHtmlFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload an HTML file (.html or .htm).");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException("HTML file is too large (maximum " + HumanMessages.formatBytes(maxFileSizeBytes) + ").");
        }
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("HTML file must have a filename ending in .html or .htm.");
        }
        String lower = filename.toLowerCase(Locale.ROOT);
        if (!lower.endsWith(".html") && !lower.endsWith(".htm")) {
            throw new IllegalArgumentException("Only .html and .htm files are supported.");
        }
    }

    public void validateHtmlContent(String html) {
        if (html == null || html.isBlank()) {
            throw new IllegalArgumentException("HTML content is required.");
        }
        long bytes = html.getBytes(StandardCharsets.UTF_8).length;
        if (bytes > maxHtmlContentBytes) {
            throw new IllegalArgumentException(
                    "HTML content is too large (maximum " + HumanMessages.formatBytes(maxHtmlContentBytes) + ").");
        }
    }

    public void validateOfficeFile(MultipartFile file, OfficeDocumentType type) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload a Word, PowerPoint, or Excel file.");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException(HumanMessages.fileTooLarge(maxFileSizeBytes));
        }
        type.ensureFilename(file.getOriginalFilename());
    }

    public void validateImageBatch(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException(
                    "Upload at least one image (PNG, JPEG, GIF, WebP, BMP, or TIFF).");
        }
        if (files.length > maxFiles) {
            throw new IllegalArgumentException(HumanMessages.tooManyFiles(maxFiles));
        }
        long totalBytes = 0;
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Upload a valid image file.");
            }
            if (file.getSize() > maxFileSizeBytes) {
                throw new IllegalArgumentException(HumanMessages.fileTooLarge(maxFileSizeBytes));
            }
            totalBytes += file.getSize();
        }
        if (totalBytes > maxTotalUploadBytes) {
            throw new IllegalArgumentException(HumanMessages.totalUploadTooLarge(maxTotalUploadBytes));
        }
    }

    public void enforcePageLimit(Path pdfPath) throws IOException {
        enforcePageLimit(pdfPath, null);
    }

    public void enforcePageLimit(Path pdfPath, String password) throws IOException {
        try (PDDocument document = openForPageCount(pdfPath, password)) {
            int pages = document.getNumberOfPages();
            if (pages > maxPages) {
                throw new IllegalArgumentException(HumanMessages.tooManyPages(pages, maxPages));
            }
        }
    }

    private static PDDocument openForPageCount(Path pdfPath, String password) throws IOException {
        if (password != null && !password.isBlank()) {
            return PDDocument.load(pdfPath.toFile(), password);
        }
        return PDDocument.load(pdfPath.toFile());
    }

    public static void ensureLooksLikePdf(Path input) throws IOException {
        byte[] header;
        try (InputStream stream = Files.newInputStream(input)) {
            header = stream.readNBytes(5);
        }
        if (header.length < 5 || header[0] != '%' || header[1] != 'P' || header[2] != 'D' || header[3] != 'F' || header[4] != '-') {
            throw new IllegalArgumentException("The uploaded file does not look like a valid PDF.");
        }
    }

    public static void copyUpload(MultipartFile upload, Path target) throws IOException {
        try (InputStream input = upload.getInputStream()) {
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    public static String safeFilename(String name) {
        if (name == null || name.isBlank()) {
            return "document.pdf";
        }
        return Path.of(name).getFileName().toString().replaceAll("[\\r\\n\\\\/]+", "_");
    }

    public static String boltOutputName(String originalName, String role, String extension) {
        String base = safeFilename(originalName);
        if (base.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            base = base.substring(0, base.length() - 4);
        }
        return "bolt_" + base + "_" + role + extension;
    }
}
