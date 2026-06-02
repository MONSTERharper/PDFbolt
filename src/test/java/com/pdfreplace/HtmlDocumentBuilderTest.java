package com.pdfreplace;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HtmlDocumentBuilderTest {
    @Test
    void wrapsFragmentInHtmlDocument() {
        String doc = HtmlDocumentBuilder.toFullDocument("<p>Hello bolt</p>", "My page");
        assertTrue(doc.contains("<!DOCTYPE html>"));
        assertTrue(doc.contains("<p>Hello bolt</p>"));
        assertTrue(doc.contains("<title>My page</title>"));
    }

    @Test
    void leavesFullHtmlUnchanged() {
        String input = "<!DOCTYPE html><html><body><h1>Hi</h1></body></html>";
        assertEquals(input, HtmlDocumentBuilder.toFullDocument(input, "ignored"));
    }

    @Test
    void rejectsBlankHtml() {
        assertThrows(IllegalArgumentException.class, () -> HtmlDocumentBuilder.toFullDocument("  ", "t"));
    }
}
