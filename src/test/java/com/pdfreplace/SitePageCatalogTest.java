package com.pdfreplace;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SitePageCatalogTest {
    @Test
    void resolvesStaticPages() {
        SitePageMeta home = SitePageCatalog.resolve("/");
        assertTrue(home.title().contains("PDFbolt"));
        assertEquals("PDFbolt — Free online PDF tools", home.heading());
    }

    @Test
    void resolvesBoltToolBySlug() {
        SitePageMeta merge = SitePageCatalog.resolve("/bolt/merge");
        assertEquals("Merge PDF", merge.heading());
        assertTrue(merge.title().contains("Merge PDF"));
        assertTrue(merge.title().contains("PDFbolt"));
    }

    @Test
    void resolvesSlugOverrideForImagesToPdf() {
        SitePageMeta meta = SitePageCatalog.resolve("/bolt/image-to-pdf");
        assertTrue(meta.title().contains("Image to PDF"));
    }

    @Test
    void resolvesLegacyReplacePath() {
        SitePageMeta meta = SitePageCatalog.resolve("/replace");
        assertTrue(meta.title().contains("Replace Text"));
    }
}
