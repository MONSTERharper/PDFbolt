package com.pdfreplace;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * Compression smoke tests on the Neuberg-style sample PDF.
 */
class NeubergPdfCompressorTest {
    private static final File NEUBERG_SAMPLE = new File("src/test/resources/neuberg-sample.pdf");

    @TempDir
    Path tempDir;

    @Test
    void highLevelCompressesNeubergSample() throws Exception {
        assumeTrue(NEUBERG_SAMPLE.isFile(), "neuberg sample PDF missing");
        Path output = tempDir.resolve("neuberg-high.pdf");
        PdfCompressor.Result result = PdfCompressor.compress(
                NEUBERG_SAMPLE.toPath(),
                PdfCompressor.Level.HIGH,
                true
        );
        Files.write(output, result.pdfBytes());
        assertEquals(PdfCompressor.Level.HIGH, result.level());
        assertValidPdfWithPreservedText(output, "JOHN DOE");
    }

    @Test
    void balancedLevelCompressesNeubergSample() throws Exception {
        assumeTrue(NEUBERG_SAMPLE.isFile(), "neuberg sample PDF missing");
        Path output = tempDir.resolve("neuberg-balanced.pdf");
        PdfCompressor.Result result = PdfCompressor.compress(
                NEUBERG_SAMPLE.toPath(),
                PdfCompressor.Level.BALANCED,
                true
        );
        Files.write(output, result.pdfBytes());
        assertEquals(PdfCompressor.Level.BALANCED, result.level());
        assertTrue(result.pdfBytes().length > 0);
        assertValidPdfWithPreservedText(output, "JOHN DOE");
    }

    @Test
    void strongLevelCompressesNeubergSample() throws Exception {
        assumeTrue(NEUBERG_SAMPLE.isFile(), "neuberg sample PDF missing");
        Path output = tempDir.resolve("neuberg-strong.pdf");
        PdfCompressor.Result result = PdfCompressor.compress(
                NEUBERG_SAMPLE.toPath(),
                PdfCompressor.Level.STRONG,
                false
        );
        Files.write(output, result.pdfBytes());
        assertEquals(PdfCompressor.Level.STRONG, result.level());
        assertTrue(result.pdfBytes().length > 0);
        assertValidPdfWithPreservedText(output, "JOHN DOE");
    }

    @Test
    void parseAcceptsFriendlyAliases() {
        assertEquals(PdfCompressor.Level.STRONG, PdfCompressor.Level.parse("extreme"));
        assertEquals(PdfCompressor.Level.BALANCED, PdfCompressor.Level.parse("recommended"));
        assertEquals(PdfCompressor.Level.HIGH, PdfCompressor.Level.parse("light"));
        assertEquals(PdfCompressor.Level.HIGH, PdfCompressor.Level.parse("less"));
        assertEquals(PdfCompressor.Level.BALANCED, PdfCompressor.Level.parse("balanced"));
    }

    @Test
    void levelProfilesMatchNamingScheme() {
        PdfCompressor.CompressionProfile high = PdfCompressor.Level.HIGH.profile();
        PdfCompressor.CompressionProfile balanced = PdfCompressor.Level.BALANCED.profile();
        PdfCompressor.CompressionProfile strong = PdfCompressor.Level.STRONG.profile();

        assertEquals("high", high.id());
        assertTrue(high.recompressImages());
        assertTrue(high.jpegQuality() > balanced.jpegQuality());

        assertEquals("balanced", balanced.id());
        assertTrue(balanced.recompressImages());

        assertEquals("strong", strong.id());
        assertTrue(strong.recompressImages());
        assertTrue(strong.jpegQuality() < balanced.jpegQuality());
        assertTrue(strong.maxEdgePx() < balanced.maxEdgePx());
    }

    private static void assertValidPdfWithPreservedText(Path pdf, String expectedSnippet) throws Exception {
        try (PDDocument document = PDDocument.load(pdf.toFile())) {
            assertTrue(document.getNumberOfPages() >= 1);
            String text = new PDFTextStripper().getText(document).replace('\n', ' ');
            assertTrue(text.contains(expectedSnippet), () -> "text: " + text);
        }
    }
}
