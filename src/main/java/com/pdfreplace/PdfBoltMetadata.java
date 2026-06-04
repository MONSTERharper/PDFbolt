package com.pdfreplace;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;

import java.util.Calendar;

/**
 * PDF document Info dictionary values written when original metadata is not retained.
 */
public final class PdfBoltMetadata {
    static final String TITLE = "PDFbolt - PDF Workflow Suite";
    static final String AUTHOR = "PDFbolt";
    static final String CREATOR = "PDFbolt (mypdfbolt.shop)";
    static final String KEYWORDS = "PDFbolt, Ultimate PDF Workflow Suite";
    static final String SUBJECT = "PDF Suite";

    private PdfBoltMetadata() {
    }

    public static void applyBranding(PDDocument document) {
        PDDocumentInformation info = document.getDocumentInformation();
        if (info == null) {
            info = new PDDocumentInformation();
            document.setDocumentInformation(info);
        }
        info.setTitle(TITLE);
        info.setAuthor(AUTHOR);
        info.setCreator(CREATOR);
        info.setKeywords(KEYWORDS);
        info.setProducer("PDFbolt PDF Engine v" + PdfBoltVersion.get());
        info.setSubject(SUBJECT);
        info.setModificationDate(Calendar.getInstance());
        document.getDocumentCatalog().setMetadata(null);
    }
}
