package com.pdfreplace;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Path;

/** Loads raster images for PDF tools (ImageIO + optional HEIC). */
final class RasterImageLoader {
    private RasterImageLoader() {}

    static BufferedImage read(Path imagePath) throws IOException {
        String name = imagePath.getFileName().toString();
        if (HeicSupport.isHeicFilename(name)) {
            return HeicSupport.decode(imagePath);
        }
        BufferedImage buffered = ImageIO.read(imagePath.toFile());
        if (buffered == null) {
            throw new IllegalArgumentException("Could not read image: " + name);
        }
        return buffered;
    }
}
