package com.pdfreplace;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class PdfBoltVersionTest {
    @Test
    void exposesMavenFilteredVersion() {
        String version = PdfBoltVersion.get();
        assertFalse(version.isBlank());
        assertFalse(version.contains("@"));
        assertEquals("1.1.0", version);
    }
}
