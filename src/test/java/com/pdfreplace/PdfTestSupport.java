package com.pdfreplace;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

final class PdfTestSupport {
    /** 1×1 PNG (red pixel). */
    private static final byte[] MINIMAL_PNG = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==");
    private PdfTestSupport() {
    }

    static java.io.File createPdfWithText(Path path, String text) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                stream.beginText();
                stream.setFont(PDType1Font.HELVETICA, 12);
                stream.newLineAtOffset(72, 700);
                stream.showText(text);
                stream.endText();
            }
            document.save(path.toFile());
        }
        return path.toFile();
    }

    /**
     * Like {@link #createPdfWithText(Path, String)} but sets an explicit PDF {@code Tw} operand before drawing.
     */
    static java.io.File createPdfWithWordSpacing(Path path, String text, float wordSpacingPdfUnits) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                stream.beginText();
                stream.setFont(PDType1Font.HELVETICA, 12);
                stream.setWordSpacing(wordSpacingPdfUnits);
                stream.newLineAtOffset(72, 700);
                stream.showText(text);
                stream.endText();
            }
            document.save(path.toFile());
        }
        return path.toFile();
    }

    static java.io.File createPdfWithPages(Path path, int pages) throws IOException {
        try (PDDocument document = new PDDocument()) {
            for (int i = 0; i < pages; i++) {
                PDPage page = new PDPage();
                document.addPage(page);
                try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                    stream.beginText();
                    stream.setFont(PDType1Font.HELVETICA, 12);
                    stream.newLineAtOffset(72, 700);
                    stream.showText("Page " + (i + 1));
                    stream.endText();
                }
            }
            document.save(path.toFile());
        }
        return path.toFile();
    }

    static java.io.File createPdfWithFont(Path path, String text, PDFont font) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                stream.beginText();
                stream.setFont(font, 12);
                stream.newLineAtOffset(72, 700);
                stream.showText(text);
                stream.endText();
            }
            document.save(path.toFile());
        }
        return path.toFile();
    }

    static byte[] readBytes(Path path) throws IOException {
        return Files.readAllBytes(path);
    }

    static byte[] minimalPngBytes() {
        return MINIMAL_PNG.clone();
    }

    static MockMultipartFile mockPdf(String partName, String filename, byte[] content) {
        return new MockMultipartFile(partName, filename, MediaType.APPLICATION_PDF_VALUE, content);
    }

    static MockMultipartFile mockPng(String partName, String filename) {
        return new MockMultipartFile(partName, filename, "image/png", minimalPngBytes());
    }

    static void assertPdfMagic(byte[] body) {
        assertTrue(body.length >= 4, "response too short for PDF");
        assertEquals('%', (char) body[0]);
        assertEquals('P', (char) body[1]);
        assertEquals('D', (char) body[2]);
        assertEquals('F', (char) body[3]);
    }

    static void assertZipMagic(byte[] body) {
        assertTrue(body.length >= 2, "response too short for ZIP");
        assertEquals('P', (char) body[0]);
        assertEquals('K', (char) body[1]);
    }
}
