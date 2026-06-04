package com.pdfreplace;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfToolsEngineTest {
    @TempDir
    Path tempDir;

    @Test
    void mergeSplitExtractOrganize() throws Exception {
        Path a = tempDir.resolve("a.pdf");
        Path b = tempDir.resolve("b.pdf");
        PdfTestSupport.createPdfWithText(a, "Alpha");
        PdfTestSupport.createPdfWithPages(b, 2);

        byte[] merged = PdfToolsEngine.merge(List.of(a, b));
        PdfTestSupport.assertPdfMagic(merged);

        Path mergedPath = tempDir.resolve("merged.pdf");
        Files.write(mergedPath, merged);

        byte[] split = PdfToolsEngine.extractPages(mergedPath, "1");
        PdfTestSupport.assertPdfMagic(split);

        byte[] removed = PdfToolsEngine.removePages(mergedPath, "2");
        PdfTestSupport.assertPdfMagic(removed);

        Path twoOnly = tempDir.resolve("two-only.pdf");
        PdfTestSupport.createPdfWithPages(twoOnly, 2);
        byte[] reorganized = PdfToolsEngine.organizePages(twoOnly, "2, 1");
        PdfTestSupport.assertPdfMagic(reorganized);
    }

    @Test
    void rotateWatermarkCropMetadata() throws Exception {
        Path input = tempDir.resolve("doc.pdf");
        PdfTestSupport.createPdfWithText(input, "Bolt");

        byte[] rotated = PdfToolsEngine.rotate(input, 90, "All");
        PdfTestSupport.assertPdfMagic(rotated);

        Path rotatedPath = tempDir.resolve("rotated.pdf");
        Files.write(rotatedPath, rotated);

        byte[] numbered = PdfToolsEngine.addPageNumbers(
                rotatedPath, "Page {X}", 10, "Center");
        PdfTestSupport.assertPdfMagic(numbered);

        byte[] watermarked = PdfToolsEngine.addWatermark(
                rotatedPath, "TEST", 24, 45, 0.3f, "#ff3300");
        PdfTestSupport.assertPdfMagic(watermarked);

        byte[] cropped = PdfToolsEngine.crop(rotatedPath, 10, 10, 10, 10);
        PdfTestSupport.assertPdfMagic(cropped);

        byte[] edited = PdfToolsEngine.editMetadata(
                rotatedPath, "Title", "Author", "Subject", "Creator");
        PdfTestSupport.assertPdfMagic(edited);
    }

    @Test
    void imagesTextRepairProtectUnlockSign() throws Exception {
        Path png = tempDir.resolve("img.png");
        Files.write(png, PdfTestSupport.minimalPngBytes());

        byte[] fromImage = PdfToolsEngine.imagesToPdf(List.of(png));
        PdfTestSupport.assertPdfMagic(fromImage);

        byte[] fromText = PdfToolsEngine.textToPdf("Hello bolt", "Sample");
        PdfTestSupport.assertPdfMagic(fromText);

        Path pdf = tempDir.resolve("plain.pdf");
        Files.write(pdf, fromText);

        byte[] repaired = PdfToolsEngine.repair(pdf, null);
        PdfTestSupport.assertPdfMagic(repaired);

        byte[] protectedPdf = PdfToolsEngine.protect(pdf, "secret", "secret");
        PdfTestSupport.assertPdfMagic(protectedPdf);

        Path protectedPath = tempDir.resolve("protected.pdf");
        Files.write(protectedPath, protectedPdf);

        byte[] unlocked = PdfToolsEngine.unlock(protectedPath, "secret");
        PdfTestSupport.assertPdfMagic(unlocked);

        Path sig = tempDir.resolve("sig.png");
        Files.write(sig, PdfTestSupport.minimalPngBytes());
        byte[] signed = PdfToolsEngine.sign(pdf, sig, 1, 50, 50, 100, 40);
        PdfTestSupport.assertPdfMagic(signed);

        Path sig2 = tempDir.resolve("sig2.png");
        Files.write(sig2, PdfTestSupport.minimalPngBytes());
        byte[] signedTwice = PdfToolsEngine.sign(
                pdf,
                List.of(
                        new PdfToolsEngine.SignatureStamp(sig, 1, 50, 50, 100, 40),
                        new PdfToolsEngine.SignatureStamp(sig2, 1, 200, 50, 100, 40)));
        PdfTestSupport.assertPdfMagic(signedTwice);
    }

    @Test
    void exportFormats() throws Exception {
        Path input = tempDir.resolve("export.pdf");
        PdfTestSupport.createPdfWithText(input, "Export me");

        byte[] zip = PdfToolsEngine.pdfToJpgZip(input, 72);
        PdfTestSupport.assertZipMagic(zip);

        String text = PdfToolsEngine.extractText(input);
        assertTrue(text.contains("Export"));

        String csv = PdfToolsEngine.extractCsv(input);
        assertNotNull(csv);

        // PDF/A conversion is handled by Ghostscript via PdfToPdfaService (see PdfToPdfaServiceTest).
    }

    @Test
    void ocrOverlayAndRedactProducePdf() throws Exception {
        Path input = tempDir.resolve("ocr.pdf");
        PdfTestSupport.createPdfWithText(input, "Scan");

        byte[] ocr = PdfToolsEngine.ocrOverlay(input, "eng");
        PdfTestSupport.assertPdfMagic(ocr);

        byte[] redacted = PdfToolsEngine.redact(input, 1, 50, 50, 120, 40);
        PdfTestSupport.assertPdfMagic(redacted);
    }

    @Test
    void processPdfFormsCanSkipFlattening() throws Exception {
        Path input = tempDir.resolve("forms.pdf");
        PdfTestSupport.createPdfWithText(input, "Form");

        byte[] passthrough = PdfToolsEngine.processPdfForms(input, false);
        PdfTestSupport.assertPdfMagic(passthrough);

        byte[] flattened = PdfToolsEngine.processPdfForms(input, true);
        PdfTestSupport.assertPdfMagic(flattened);
    }

    @Test
    void compareJson() throws Exception {
        Path one = tempDir.resolve("one.pdf");
        Path two = tempDir.resolve("two.pdf");
        PdfTestSupport.createPdfWithText(one, "Same");
        PdfTestSupport.createPdfWithText(two, "Same");

        String json = PdfToolsEngine.compareJson(one, two, "one.pdf", "two.pdf");
        assertTrue(json.contains("overallMatch"));
        assertTrue(json.contains("pageResults"));
    }
}
