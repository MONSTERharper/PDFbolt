package com.pdfreplace;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HeicSupportTest {
    @Test
    void detectsHeicExtensions() {
        assertTrue(HeicSupport.isHeicFilename("photo.HEIC"));
        assertTrue(HeicSupport.isHeicFilename("scan.heif"));
        assertFalse(HeicSupport.isHeicFilename("scan.jpg"));
        assertFalse(HeicSupport.isHeicFilename(""));
    }
}
