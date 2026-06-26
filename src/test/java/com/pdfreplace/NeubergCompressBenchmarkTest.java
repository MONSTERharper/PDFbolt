package com.pdfreplace;

import org.junit.jupiter.api.Test;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * Prints compression sizes for Neuberg fixtures (run with {@code mvn test -Dtest=NeubergCompressBenchmarkTest}).
 */
class NeubergCompressBenchmarkTest {
    @Test
    void printNeubergCompressionSizes() throws Exception {
        benchmarkFile(new File("src/test/resources/neuberg-sample.pdf"));
        benchmarkFile(new File("/Users/sthapha/Downloads/7338566739.pdf"));
    }

    private static void benchmarkFile(File file) throws Exception {
        assumeTrue(file.isFile(), () -> file.getPath() + " missing");
        Path input = file.toPath();
        long original = Files.size(input);
        System.out.printf("%n=== %s (%s bytes / %.1f KB) ===%n", file.getName(), original, original / 1024.0);
        for (PdfCompressor.Level level : PdfCompressor.Level.values()) {
            PdfCompressor.Result result = PdfCompressor.compress(input, level, true);
            long output = result.pdfBytes().length;
            long delta = output - original;
            int savedPct = original > 0 ? (int) Math.round(100.0 * (original - output) / original) : 0;
            System.out.printf(
                    "  %-9s  %,8d -> %,8d  (%+d bytes, %d%% saved, images=%d)%n",
                    level.name(),
                    original,
                    output,
                    delta,
                    savedPct,
                    result.imagesProcessed()
            );
            assertTrue(output > 100);
            if (file.getName().contains("7338566739")) {
                assertTrue(
                        output <= original,
                        () -> level + " should not return a larger file when no images were recompressed"
                );
            }
        }
    }
}
