package com.pdfreplace;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;

import java.io.IOException;
import java.nio.file.Path;

/**
 * Detects whether a PDF is encrypted and whether a password can open it.
 */
public final class PdfEncryptionInspector {
    private PdfEncryptionInspector() {
    }

    public record EncryptionStatus(boolean encrypted, boolean passwordRequired) {
        public static EncryptionStatus open() {
            return new EncryptionStatus(false, false);
        }

        public static EncryptionStatus protectedDocument() {
            return new EncryptionStatus(true, true);
        }

        public static EncryptionStatus encryptedOpenable() {
            return new EncryptionStatus(true, false);
        }

        /** none | user_password | restricted */
        public String encryptionKind() {
            if (!encrypted) {
                return "none";
            }
            return passwordRequired ? "user_password" : "restricted";
        }
    }

    public static EncryptionStatus inspect(Path pdfPath) throws IOException {
        try (PDDocument document = PDDocument.load(pdfPath.toFile())) {
            if (document.isEncrypted()) {
                return EncryptionStatus.encryptedOpenable();
            }
            return EncryptionStatus.open();
        } catch (InvalidPasswordException ex) {
            return EncryptionStatus.protectedDocument();
        }
    }

    public static boolean verifyPassword(Path pdfPath, String password) {
        if (password == null) {
            return false;
        }
        try (PDDocument ignored = PDDocument.load(pdfPath.toFile(), password)) {
            return true;
        } catch (IOException ex) {
            return false;
        }
    }
}
