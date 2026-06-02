package com.pdfreplace;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfEncryptionInspectorTest {
    @TempDir
    Path tempDir;

    @Test
    void openPdfIsNotPasswordRequired() throws Exception {
        Path pdf = tempDir.resolve("open.pdf");
        PdfTestSupport.createPdfWithText(pdf, "Hello");
        PdfEncryptionInspector.EncryptionStatus status = PdfEncryptionInspector.inspect(pdf);
        assertFalse(status.encrypted());
        assertFalse(status.passwordRequired());
    }

    @Test
    void encryptedPdfRequiresPassword() throws Exception {
        Path pdf = tempDir.resolve("locked.pdf");
        PdfTestSupport.createPdfWithText(pdf, "Secret");
        try (PDDocument doc = PDDocument.load(pdf.toFile())) {
            StandardProtectionPolicy policy = new StandardProtectionPolicy("owner", "user-secret", new AccessPermission());
            policy.setEncryptionKeyLength(128);
            doc.protect(policy);
            doc.save(pdf.toFile());
        }
        PdfEncryptionInspector.EncryptionStatus status = PdfEncryptionInspector.inspect(pdf);
        assertTrue(status.encrypted());
        assertTrue(status.passwordRequired());
        assertTrue(PdfEncryptionInspector.verifyPassword(pdf, "user-secret"));
        assertFalse(PdfEncryptionInspector.verifyPassword(pdf, "wrong"));
    }
}
