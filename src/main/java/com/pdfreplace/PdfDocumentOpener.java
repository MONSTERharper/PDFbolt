package com.pdfreplace;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Opens uploaded PDFs for processing, decrypting to a temp file when needed.
 */
@Component
public class PdfDocumentOpener {
    private final PdfUploadValidator uploadValidator;

    public PdfDocumentOpener(PdfUploadValidator uploadValidator) {
        this.uploadValidator = uploadValidator;
    }

    /**
     * @param forUnlock when true, keeps the encrypted file on disk for {@link PdfToolsEngine#unlock}
     */
    public PreparedDocument prepare(Path stagedPdf, String pdfPassword, boolean forUnlock) throws IOException {
        PdfEncryptionInspector.EncryptionStatus status = PdfEncryptionInspector.inspect(stagedPdf);
        if (!status.encrypted()) {
            uploadValidator.enforcePageLimit(stagedPdf, null);
            return new PreparedDocument(stagedPdf, false);
        }

        if (status.passwordRequired()) {
            if (pdfPassword == null || pdfPassword.isBlank()) {
                throw new PdfPasswordRequiredException(
                        "This PDF is password-protected. Enter the document password to continue.");
            }
            if (!PdfEncryptionInspector.verifyPassword(stagedPdf, pdfPassword)) {
                throw new IllegalArgumentException("Incorrect PDF password.");
            }
        }

        if (forUnlock) {
            uploadValidator.enforcePageLimit(stagedPdf, pdfPassword);
            return new PreparedDocument(stagedPdf, false);
        }

        Path decrypted = Files.createTempFile("pdfbolt-open-", ".pdf");
        try {
            String openPassword = status.passwordRequired() ? pdfPassword : "";
            try (PDDocument document = openPassword == null || openPassword.isBlank()
                    ? PDDocument.load(stagedPdf.toFile())
                    : PDDocument.load(stagedPdf.toFile(), openPassword)) {
                document.setAllSecurityToBeRemoved(true);
                document.save(decrypted.toFile());
            }
            uploadValidator.enforcePageLimit(decrypted, null);
            return new PreparedDocument(decrypted, true);
        } catch (InvalidPasswordException ex) {
            Files.deleteIfExists(decrypted);
            throw new IllegalArgumentException("Incorrect PDF password.");
        } catch (IOException ex) {
            Files.deleteIfExists(decrypted);
            throw ex;
        }
    }

    public record PreparedDocument(Path path, boolean temporary) implements AutoCloseable {
        @Override
        public void close() {
            if (temporary) {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {
                    // best effort
                }
            }
        }
    }
}
