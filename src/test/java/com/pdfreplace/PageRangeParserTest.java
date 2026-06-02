package com.pdfreplace;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PageRangeParserTest {
    @Test
    void allPagesWhenBlank() {
        List<Integer> indices = PageRangeParser.parseZeroBasedIndices(null, 3);
        assertEquals(List.of(0, 1, 2), indices);
    }

    @Test
    void singlePageAndRange() {
        List<Integer> indices = PageRangeParser.parseZeroBasedIndices("1, 3-2", 4);
        assertEquals(List.of(0, 1, 2), indices);
    }

    @Test
    void parseOneBasedOrder() {
        List<Integer> order = PageRangeParser.parseOneBasedOrder("3, 1, 2", 3);
        assertEquals(List.of(2, 0, 1), order);
    }

    @Test
    void rejectsInvalidRangeToken() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> PageRangeParser.parseZeroBasedIndices("1-", 3));
        assertTrue(ex.getMessage().contains("Invalid"));
    }

    @Test
    void rejectsNonNumericPage() {
        assertThrows(
                IllegalArgumentException.class,
                () -> PageRangeParser.parseOneBasedOrder("abc", 3));
    }

    @Test
    void rejectsOutOfRangePageInOrder() {
        assertThrows(
                IllegalArgumentException.class,
                () -> PageRangeParser.parseOneBasedOrder("9", 2));
    }
}
