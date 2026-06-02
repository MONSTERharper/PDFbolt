package com.pdfreplace;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class PdfCompressService {
    private final PdfDocumentOpener documentOpener;

    @Value("${boltreplacer.limits.max-pages:250}")
    private int maxPages;

    @Value("${boltreplacer.limits.max-files:10}")
    private int maxFiles;

    @Value("${boltreplacer.limits.max-file-size-bytes:26214400}")
    private long maxFileSizeBytes;

    @Value("${boltreplacer.limits.max-total-upload-bytes:104857600}")
    private long maxTotalUploadBytes;

    public PdfCompressService(PdfDocumentOpener documentOpener) {
        this.documentOpener = documentOpener;
    }

    public CompressOutput compress(
            MultipartFile[] pdfFiles,
            String levelRaw,
            boolean retainMetadata,
            String pdfPassword,
            String pdfPasswordsJson
    ) throws IOException {
        validateUploads(pdfFiles);
        PdfCompressor.Level level = PdfCompressor.Level.parse(levelRaw);

        List<CompressedItem> items = new ArrayList<>();
        for (int i = 0; i < pdfFiles.length; i++) {
            MultipartFile upload = pdfFiles[i];
            String password = PdfPasswordResolver.resolveForUpload(upload, i, pdfPassword, pdfPasswordsJson);
            items.add(compressSingle(upload, level, retainMetadata, password));
        }

        if (items.size() == 1) {
            CompressedItem item = items.get(0);
            return new CompressOutput(
                    item.bytes(),
                    "application/pdf",
                    item.filename(),
                    CompressSummary.from(item.result())
            );
        }

        byte[] zipBytes = zipItems(items);
        CompressSummary summary = summarize(items);
        return new CompressOutput(
                zipBytes,
                "application/zip",
                "bolt_compressed_pdfs.zip",
                summary
        );
    }

    private CompressedItem compressSingle(
            MultipartFile upload,
            PdfCompressor.Level level,
            boolean retainMetadata,
            String pdfPassword
    ) throws IOException {
        Path staged = Files.createTempFile("pdfbolt-compress-", ".pdf");
        try {
            copyUpload(upload, staged);
            ensureLooksLikePdf(staged);
            try (PdfDocumentOpener.PreparedDocument opened = documentOpener.prepare(staged, pdfPassword, false)) {
                PdfCompressor.Result result = PdfCompressor.compress(opened.path(), level, retainMetadata);
                String filename = outputName(upload.getOriginalFilename());
                return new CompressedItem(result, filename);
            }
        } finally {
            Files.deleteIfExists(staged);
        }
    }

    private static CompressSummary summarize(List<CompressedItem> items) {
        long original = 0;
        long compressed = 0;
        int pages = 0;
        int images = 0;
        for (CompressedItem item : items) {
            original += item.result().originalBytes();
            compressed += item.result().pdfBytes().length;
            pages += item.result().pages();
            images += item.result().imagesProcessed();
        }
        return new CompressSummary(original, compressed, pages, images, "batch");
    }

    private static byte[] zipItems(List<CompressedItem> items) throws IOException {
        Set<String> usedNames = new HashSet<>();
        java.io.ByteArrayOutputStream zipStream = new java.io.ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(zipStream)) {
            for (CompressedItem item : items) {
                String entryName = uniqueZipName(item.filename(), usedNames);
                zip.putNextEntry(new ZipEntry(entryName));
                zip.write(item.result().pdfBytes());
                zip.closeEntry();
            }
        }
        return zipStream.toByteArray();
    }

    private void validateUploads(MultipartFile[] pdfFiles) {
        if (pdfFiles == null || pdfFiles.length == 0) {
            throw new IllegalArgumentException("At least one PDF file is required.");
        }
        if (pdfFiles.length > maxFiles) {
            throw new IllegalArgumentException("Too many files. Maximum allowed: " + maxFiles + ".");
        }
        long totalBytes = 0;
        for (MultipartFile file : pdfFiles) {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("One or more uploaded files are empty.");
            }
            if (file.getSize() > maxFileSizeBytes) {
                throw new IllegalArgumentException("File exceeds maximum size of " + maxFileSizeBytes + " bytes.");
            }
            totalBytes += file.getSize();
        }
        if (totalBytes > maxTotalUploadBytes) {
            throw new IllegalArgumentException("Total upload size exceeds the limit of " + maxTotalUploadBytes + " bytes.");
        }
    }

    private static void copyUpload(MultipartFile upload, Path target) throws IOException {
        try (InputStream input = upload.getInputStream()) {
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private static void ensureLooksLikePdf(Path input) throws IOException {
        byte[] header;
        try (InputStream stream = Files.newInputStream(input)) {
            header = stream.readNBytes(5);
        }
        if (header.length < 5 || header[0] != '%' || header[1] != 'P' || header[2] != 'D' || header[3] != 'F' || header[4] != '-') {
            throw new IllegalArgumentException("The uploaded file does not look like a valid PDF.");
        }
    }

    private void enforcePageLimit(Path input) throws IOException {
        try (org.apache.pdfbox.pdmodel.PDDocument document = org.apache.pdfbox.pdmodel.PDDocument.load(input.toFile())) {
            int pages = document.getNumberOfPages();
            if (pages > maxPages) {
                throw new IllegalArgumentException("PDF has " + pages + " pages, exceeding the limit of " + maxPages + ".");
            }
        }
    }

    private static String outputName(String originalName) {
        String base = originalName == null || originalName.isBlank() ? "document" : originalName;
        base = java.nio.file.Path.of(base).getFileName().toString().replaceAll("[\\r\\n\\\\/]+", "_");
        base = base.replaceFirst("(?i)\\.pdf$", "");
        if (base.isBlank()) {
            base = "document";
        }
        return "bolt_" + base + "_compressed.pdf";
    }

    private static String uniqueZipName(String name, Set<String> usedNames) {
        String candidate = name;
        int index = 1;
        while (usedNames.contains(candidate)) {
            int dot = name.lastIndexOf('.');
            candidate = dot > 0 ? name.substring(0, dot) + "-" + index + name.substring(dot) : name + "-" + index;
            index++;
        }
        usedNames.add(candidate);
        return candidate;
    }

    private record CompressedItem(PdfCompressor.Result result, String filename) {
        byte[] bytes() {
            return result.pdfBytes();
        }
    }

    public record CompressOutput(byte[] bytes, String contentType, String filename, CompressSummary summary) {
    }

    public record CompressSummary(long originalBytes, long compressedBytes, int pages, int imagesProcessed, String levelId) {
        static CompressSummary from(PdfCompressor.Result result) {
            return new CompressSummary(
                    result.originalBytes(),
                    result.pdfBytes().length,
                    result.pages(),
                    result.imagesProcessed(),
                    result.level().profile().id()
            );
        }

        public long savedBytes() {
            return Math.max(0, originalBytes - compressedBytes);
        }

        public int savedPercent() {
            if (originalBytes <= 0) {
                return 0;
            }
            return (int) Math.round(100.0 * savedBytes() / originalBytes);
        }
    }
}
