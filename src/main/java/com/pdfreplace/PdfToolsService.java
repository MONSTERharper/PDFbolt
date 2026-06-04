package com.pdfreplace;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class PdfToolsService {
    private static final ObjectMapper JSON = new ObjectMapper();

    private final PdfUploadValidator uploadValidator;
    private final OfficeToPdfService officeToPdfService;
    private final HtmlToPdfService htmlToPdfService;
    private final PdfDocumentOpener documentOpener;
    private final PdfToPdfaService pdfToPdfaService;
    private final PdfToOfficeService pdfToOfficeService;
    private final PdfToDxfService pdfToDxfService;

    public PdfToolsService(
            PdfUploadValidator uploadValidator,
            OfficeToPdfService officeToPdfService,
            HtmlToPdfService htmlToPdfService,
            PdfDocumentOpener documentOpener,
            PdfToPdfaService pdfToPdfaService,
            PdfToOfficeService pdfToOfficeService,
            PdfToDxfService pdfToDxfService
    ) {
        this.uploadValidator = uploadValidator;
        this.officeToPdfService = officeToPdfService;
        this.htmlToPdfService = htmlToPdfService;
        this.documentOpener = documentOpener;
        this.pdfToPdfaService = pdfToPdfaService;
        this.pdfToOfficeService = pdfToOfficeService;
        this.pdfToDxfService = pdfToDxfService;
    }

    public ToolOutput execute(
            String operationRaw,
            MultipartFile file,
            MultipartFile[] files,
            MultipartFile signature,
            MultipartFile[] signatures,
            ToolParams params
    ) throws IOException {
        PdfToolOperation operation = PdfToolOperation.parse(operationRaw);

        return switch (operation) {
            case MERGE -> merge(files, params);
            case SPLIT -> split(file, params, params.pageRange());
            case REMOVE_PAGES -> removePages(file, params, params.pageRange());
            case EXTRACT_PAGES -> extractPages(file, params, params.pageRange());
            case ORGANIZE_PDF -> organize(file, params, params.pageOrder());
            case IMAGES_TO_PDF -> imagesToPdf(files);
            case REPAIR_PDF -> repair(file, params);
            case OCR_PDF -> ocr(file, params, params.ocrLang());
            case WORD_TO_PDF -> officeToPdf(file, OfficeDocumentType.WORD);
            case POWERPOINT_TO_PDF -> officeToPdf(file, OfficeDocumentType.POWERPOINT);
            case EXCEL_TO_PDF -> officeToPdf(file, OfficeDocumentType.EXCEL);
            case HTML_TO_PDF -> htmlToPdf(file, params.text(), params.title());
            case TEXT_TO_PDF -> textToPdf(params.text(), params.title());
            case PDF_TO_JPG -> pdfToJpg(file, params, params.dpi());
            case PDF_TO_WORD -> pdfToOffice(file, params, PdfOfficeExportFormat.DOCX);
            case PDF_TO_POWERPOINT -> pdfToOffice(file, params, PdfOfficeExportFormat.PPTX);
            case PDF_TO_EXCEL -> pdfToOffice(file, params, PdfOfficeExportFormat.XLSX);
            case PDF_TO_TEXT -> pdfToText(file, params, params.exportFormat());
            case PDF_TO_CSV -> pdfToCsv(file, params);
            case PDF_TO_PDFA -> pdfToPdfa(file, params);
            case PDF_TO_DXF -> pdfToDxf(file, params);
            case ROTATE_PDF -> rotate(file, params, params.angle(), params.rotationScope());
            case ADD_PAGE_NUMBERS -> pageNumbers(file, params);
            case ADD_WATERMARK -> watermark(file, params);
            case CROP_PDF -> crop(file, params);
            case EDIT_PDF -> editMetadata(file, params);
            case PDF_FORMS -> flattenForms(file, params);
            case UNLOCK_PDF -> unlock(file, params);
            case PROTECT_PDF -> protect(file, params, params.password(), params.ownerPassword());
            case SIGN_PDF -> sign(file, signature, signatures, params);
            case REDACT_PDF -> redact(file, params);
            case COMPARE_PDF -> compare(file, files, params);
        };
    }

    private ToolOutput merge(MultipartFile[] files, ToolParams params) throws IOException {
        uploadValidator.validatePdfBatch(files, true);
        List<PreparedPdfInput> inputs = new ArrayList<>();
        try {
            for (int i = 0; i < files.length; i++) {
                inputs.add(stagePdf(files[i], params, PdfToolOperation.MERGE, i));
            }
            List<Path> paths = inputs.stream().map(PreparedPdfInput::processingPath).toList();
            byte[] bytes = PdfToolsEngine.merge(paths);
            String name = PdfUploadValidator.boltOutputName(
                    files[0].getOriginalFilename(), "merged", ".pdf");
            return ToolOutput.pdf(bytes, name);
        } finally {
            closeAll(inputs);
        }
    }

    private ToolOutput split(MultipartFile file, ToolParams params, String pageRange) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.SPLIT)) {
            byte[] bytes = PdfToolsEngine.extractPages(input.processingPath(), pageRange);
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "split", ".pdf"));
        }
    }

    private ToolOutput removePages(MultipartFile file, ToolParams params, String pageRange) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.REMOVE_PAGES)) {
            byte[] bytes = PdfToolsEngine.removePages(input.processingPath(), pageRange);
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "excised", ".pdf"));
        }
    }

    private ToolOutput extractPages(MultipartFile file, ToolParams params, String pageRange) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.EXTRACT_PAGES)) {
            byte[] bytes = PdfToolsEngine.extractPages(input.processingPath(), pageRange);
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "extracted", ".pdf"));
        }
    }

    private ToolOutput organize(MultipartFile file, ToolParams params, String pageOrder) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.ORGANIZE_PDF)) {
            byte[] bytes = PdfToolsEngine.organizePages(input.processingPath(), pageOrder);
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "reorganized", ".pdf"));
        }
    }

    private ToolOutput imagesToPdf(MultipartFile[] images) throws IOException {
        uploadValidator.validateImageBatch(images);
        List<Path> paths = new ArrayList<>();
        try {
            for (MultipartFile image : images) {
                Path path = Files.createTempFile("pdfbolt-img-", suffix(image.getOriginalFilename()));
                PdfUploadValidator.copyUpload(image, path);
                paths.add(path);
            }
            byte[] bytes = PdfToolsEngine.imagesToPdf(paths);
            return ToolOutput.pdf(bytes, "bolt_images_compiled.pdf");
        } finally {
            deleteAll(paths);
        }
    }

    private ToolOutput repair(MultipartFile file, ToolParams params) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.REPAIR_PDF)) {
            byte[] bytes = PdfToolsEngine.repair(input.processingPath(), null);
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "repaired", ".pdf"));
        }
    }

    private ToolOutput ocr(MultipartFile file, ToolParams params, String lang) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.OCR_PDF)) {
            byte[] bytes = PdfToolsEngine.ocrOverlay(input.processingPath(), lang);
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "ocr", ".pdf"));
        }
    }

    private ToolOutput officeToPdf(MultipartFile file, OfficeDocumentType type) throws IOException {
        return officeToPdfService.convert(file, type);
    }

    private ToolOutput htmlToPdf(MultipartFile file, String html, String title) throws IOException {
        if (file != null && !file.isEmpty()) {
            return htmlToPdfService.convertFile(file, title);
        }
        return htmlToPdfService.convert(html, title);
    }

    private ToolOutput textToPdf(String text, String title) throws IOException {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text content is required.");
        }
        byte[] bytes = PdfToolsEngine.textToPdf(text, title);
        return ToolOutput.pdf(bytes, "bolt_compiled.pdf");
    }

    private ToolOutput pdfToJpg(MultipartFile file, ToolParams params, int dpi) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.PDF_TO_JPG)) {
            int resolvedDpi = dpi > 0 ? dpi : 150;
            byte[] bytes = PdfToolsEngine.pdfToJpgZip(input.processingPath(), resolvedDpi);
            String base = PdfUploadValidator.safeFilename(file.getOriginalFilename());
            if (base.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
                base = base.substring(0, base.length() - 4);
            }
            return new ToolOutput(bytes, "application/zip", "bolt_" + base + "_pages.zip", null, java.util.Map.of());
        }
    }

    private ToolOutput pdfToOffice(
            MultipartFile file,
            ToolParams params,
            PdfOfficeExportFormat format
    ) throws IOException {
        return pdfToOfficeService.convert(
                file,
                format,
                params.pdfPassword(),
                params.pdfPasswordsJson());
    }

    private ToolOutput pdfToText(MultipartFile file, ToolParams params, String exportFormat) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.PDF_TO_TEXT)) {
            String text = PdfToolsEngine.extractText(input.processingPath());
            if ("presentation".equalsIgnoreCase(exportFormat)) {
                text = "[SLIDES PRESENTATION FROM PDF]\n\n" + text;
            }
            String base = PdfUploadValidator.safeFilename(file.getOriginalFilename());
            if (base.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
                base = base.substring(0, base.length() - 4);
            }
            String filename = "presentation".equalsIgnoreCase(exportFormat)
                    ? "bolt_" + base + "_slides.txt"
                    : "bolt_" + base + "_extracted.txt";
            return ToolOutput.text(text, filename);
        }
    }

    private ToolOutput pdfToCsv(MultipartFile file, ToolParams params) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.PDF_TO_CSV)) {
            String csv = PdfToolsEngine.extractCsv(input.processingPath());
            String base = PdfUploadValidator.safeFilename(file.getOriginalFilename());
            if (base.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
                base = base.substring(0, base.length() - 4);
            }
            return ToolOutput.csv(csv, "bolt_" + base + "_tabular.csv");
        }
    }

    private ToolOutput pdfToPdfa(MultipartFile file, ToolParams params) throws IOException {
        PdfAStandard standard = PdfAStandard.parse(params.pdfaStandard());
        PdfAConversionResult result = pdfToPdfaService.convert(file, standard, params.pdfPassword(), params.pdfPasswordsJson());
        java.util.Map<String, String> headers = new java.util.LinkedHashMap<>();
        headers.put("X-Bolt-Pdfa-Validated", String.valueOf(result.validated()));
        if (result.validationNote() != null) {
            headers.put("X-Bolt-Pdfa-Validation-Note", result.validationNote());
        }
        return ToolOutput.pdfWithHeaders(
                result.pdfBytes(),
                PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "pdfa", ".pdf"),
                headers);
    }

    private ToolOutput pdfToDxf(MultipartFile file, ToolParams params) throws IOException {
        return pdfToDxfService.convert(file, params.pdfPassword(), params.pdfPasswordsJson());
    }

    private ToolOutput rotate(MultipartFile file, ToolParams params, int angle, String scope) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.ROTATE_PDF)) {
            byte[] bytes = PdfToolsEngine.rotate(input.processingPath(), angle, scope);
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "rotated", ".pdf"));
        }
    }

    private ToolOutput pageNumbers(MultipartFile file, ToolParams params) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.ADD_PAGE_NUMBERS)) {
            byte[] bytes = PdfToolsEngine.addPageNumbers(
                    input.processingPath(),
                    params.pageNumberFormat(),
                    params.pageNumberSize(),
                    params.pageNumberAlignment());
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "paginated", ".pdf"));
        }
    }

    private ToolOutput watermark(MultipartFile file, ToolParams params) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.ADD_WATERMARK)) {
            byte[] bytes = PdfToolsEngine.addWatermark(
                    input.processingPath(),
                    params.watermarkText(),
                    params.watermarkSize(),
                    params.watermarkRotation(),
                    params.watermarkOpacity(),
                    params.watermarkColor());
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "watermarked", ".pdf"));
        }
    }

    private ToolOutput crop(MultipartFile file, ToolParams params) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.CROP_PDF)) {
            byte[] bytes = PdfToolsEngine.crop(
                    input.processingPath(),
                    params.cropLeft(),
                    params.cropRight(),
                    params.cropTop(),
                    params.cropBottom());
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "cropped", ".pdf"));
        }
    }

    private ToolOutput editMetadata(MultipartFile file, ToolParams params) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.EDIT_PDF)) {
            byte[] bytes = PdfToolsEngine.editMetadata(
                    input.processingPath(),
                    params.metadataTitle(),
                    params.metadataAuthor(),
                    params.metadataSubject(),
                    params.metadataCreator());
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "metadata", ".pdf"));
        }
    }

    private ToolOutput flattenForms(MultipartFile file, ToolParams params) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.PDF_FORMS)) {
            byte[] bytes = PdfToolsEngine.processPdfForms(input.processingPath(), params.formsFlatten());
            String suffix = params.formsFlatten() ? "forms-flat" : "forms";
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), suffix, ".pdf"));
        }
    }

    private ToolOutput unlock(MultipartFile file, ToolParams params) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.UNLOCK_PDF)) {
            String password = resolvePdfPassword(file, params, PdfToolOperation.UNLOCK_PDF, 0);
            byte[] bytes = PdfToolsEngine.unlock(input.processingPath(), password);
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "unlocked", ".pdf"));
        }
    }

    private ToolOutput protect(MultipartFile file, ToolParams params, String userPass, String ownerPass) throws IOException {
        if (userPass == null || userPass.isBlank()) {
            throw new IllegalArgumentException("A password is required to protect the PDF.");
        }
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.PROTECT_PDF)) {
            byte[] bytes = PdfToolsEngine.protect(input.processingPath(), userPass, ownerPass);
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "protected", ".pdf"));
        }
    }

    private ToolOutput sign(
            MultipartFile file,
            MultipartFile signature,
            MultipartFile[] signatures,
            ToolParams params
    ) throws IOException {
        List<ResolvedSignature> resolved = resolveSignatures(signature, signatures, params);
        List<Path> tempPaths = new ArrayList<>();
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.SIGN_PDF)) {
            List<PdfToolsEngine.SignatureStamp> stamps = new ArrayList<>();
            for (ResolvedSignature resolvedSignature : resolved) {
                Path sigPath = Files.createTempFile("pdfbolt-sig-", ".png");
                tempPaths.add(sigPath);
                PdfUploadValidator.copyUpload(resolvedSignature.image(), sigPath);
                stamps.add(new PdfToolsEngine.SignatureStamp(
                        sigPath,
                        resolvedSignature.pageNum(),
                        resolvedSignature.x(),
                        resolvedSignature.y(),
                        resolvedSignature.width(),
                        resolvedSignature.height()));
            }
            byte[] bytes = PdfToolsEngine.sign(input.processingPath(), stamps);
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "signed", ".pdf"));
        } finally {
            for (Path tempPath : tempPaths) {
                Files.deleteIfExists(tempPath);
            }
        }
    }

    private record ResolvedSignature(
            MultipartFile image,
            int pageNum,
            float x,
            float y,
            float width,
            float height
    ) {}

    private record SignaturePlacementDto(int pageNum, float x, float y, float width, float height) {}

    private List<ResolvedSignature> resolveSignatures(
            MultipartFile signature,
            MultipartFile[] signatures,
            ToolParams params
    ) throws IOException {
        if (signatures != null
                && signatures.length > 0
                && params.signaturesJson() != null
                && !params.signaturesJson().isBlank()) {
            List<SignaturePlacementDto> placements = JSON.readValue(
                    params.signaturesJson(),
                    new TypeReference<>() {});
            if (placements.size() != signatures.length) {
                throw new IllegalArgumentException("Signature count does not match placement data.");
            }
            List<ResolvedSignature> resolved = new ArrayList<>();
            for (int i = 0; i < placements.size(); i++) {
                MultipartFile image = signatures[i];
                if (image == null || image.isEmpty()) {
                    throw new IllegalArgumentException("Draw a signature before signing.");
                }
                SignaturePlacementDto placement = placements.get(i);
                resolved.add(new ResolvedSignature(
                        image,
                        placement.pageNum(),
                        placement.x(),
                        placement.y(),
                        placement.width(),
                        placement.height()));
            }
            return resolved;
        }
        if (signature == null || signature.isEmpty()) {
            throw new IllegalArgumentException("Draw a signature before signing.");
        }
        return List.of(new ResolvedSignature(
                signature,
                params.sigPage(),
                params.sigX(),
                params.sigY(),
                params.sigWidth(),
                params.sigHeight()));
    }

    private ToolOutput redact(MultipartFile file, ToolParams params) throws IOException {
        try (PreparedPdfInput input = stagePdf(file, params, PdfToolOperation.REDACT_PDF)) {
            byte[] bytes = PdfToolsEngine.redact(
                    input.processingPath(),
                    params.redactPage(),
                    params.redactX(),
                    params.redactY(),
                    params.redactWidth(),
                    params.redactHeight());
            return ToolOutput.pdf(bytes, PdfUploadValidator.boltOutputName(file.getOriginalFilename(), "redacted", ".pdf"));
        }
    }

    private ToolOutput compare(MultipartFile file, MultipartFile[] files, ToolParams params) throws IOException {
        MultipartFile first;
        MultipartFile second;
        if (files != null && files.length >= 2) {
            first = files[0];
            second = files[1];
        } else if (file != null && files != null && files.length == 1) {
            first = file;
            second = files[0];
        } else {
            throw new IllegalArgumentException("Upload two PDF files to compare.");
        }
        uploadValidator.validatePdfBatch(new MultipartFile[]{first, second}, true);
        try (PreparedPdfInput path1 = stagePdf(first, params, PdfToolOperation.COMPARE_PDF, 0);
             PreparedPdfInput path2 = stagePdf(second, params, PdfToolOperation.COMPARE_PDF, 1)) {
            String json = PdfToolsEngine.compareJson(
                    path1.processingPath(),
                    path2.processingPath(),
                    PdfUploadValidator.safeFilename(first.getOriginalFilename()),
                    PdfUploadValidator.safeFilename(second.getOriginalFilename()));
            return ToolOutput.json(json);
        }
    }

    private PreparedPdfInput stagePdf(MultipartFile file, ToolParams params, PdfToolOperation operation)
            throws IOException {
        return stagePdf(file, params, operation, 0);
    }

    private PreparedPdfInput stagePdf(
            MultipartFile file,
            ToolParams params,
            PdfToolOperation operation,
            int fileIndex
    ) throws IOException {
        uploadValidator.validateSinglePdf(file);
        Path staged = toTempPdf(file);
        PdfUploadValidator.ensureLooksLikePdf(staged);
        boolean forUnlock = operation == PdfToolOperation.UNLOCK_PDF;
        PdfDocumentOpener.PreparedDocument opened = documentOpener.prepare(
                staged,
                resolvePdfPassword(file, params, operation, fileIndex),
                forUnlock);
        return new PreparedPdfInput(staged, opened);
    }

    private static String resolvePdfPassword(
            MultipartFile file,
            ToolParams params,
            PdfToolOperation operation,
            int fileIndex
    ) {
        String resolved = PdfPasswordResolver.resolveForUpload(
                file,
                fileIndex,
                params.pdfPassword(),
                params.pdfPasswordsJson());
        if (resolved != null && !resolved.isBlank()) {
            return resolved;
        }
        if (operation == PdfToolOperation.UNLOCK_PDF || operation == PdfToolOperation.REPAIR_PDF) {
            return params.password();
        }
        return null;
    }

    private static void closeAll(List<PreparedPdfInput> inputs) {
        for (PreparedPdfInput input : inputs) {
            input.close();
        }
    }

    private static final class PreparedPdfInput implements AutoCloseable {
        private final Path staged;
        private final PdfDocumentOpener.PreparedDocument opened;

        private PreparedPdfInput(Path staged, PdfDocumentOpener.PreparedDocument opened) {
            this.staged = staged;
            this.opened = opened;
        }

        Path processingPath() {
            return opened.path();
        }

        @Override
        public void close() {
            opened.close();
            try {
                Files.deleteIfExists(staged);
            } catch (IOException ignored) {
                // best effort
            }
        }
    }

    private static Path toTempPdf(MultipartFile upload) throws IOException {
        Path path = Files.createTempFile("pdfbolt-tool-", ".pdf");
        PdfUploadValidator.copyUpload(upload, path);
        return path;
    }

    private static String suffix(String filename) {
        if (filename == null) {
            return ".img";
        }
        String lower = filename.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".png")) {
            return ".png";
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return ".jpg";
        }
        return ".img";
    }

    private static void deleteAll(List<Path> paths) {
        for (Path path : paths) {
            try {
                Files.deleteIfExists(path);
            } catch (IOException ignored) {
                // best effort
            }
        }
    }

    public record ToolParams(
            String pageRange,
            String pageOrder,
            String pdfPassword,
            String pdfPasswordsJson,
            String pdfaStandard,
            String password,
            String ownerPassword,
            String ocrLang,
            String text,
            String title,
            int dpi,
            String exportFormat,
            int angle,
            String rotationScope,
            String pageNumberFormat,
            int pageNumberSize,
            String pageNumberAlignment,
            String watermarkText,
            int watermarkSize,
            int watermarkRotation,
            float watermarkOpacity,
            String watermarkColor,
            float cropLeft,
            float cropRight,
            float cropTop,
            float cropBottom,
            String metadataTitle,
            String metadataAuthor,
            String metadataSubject,
            String metadataCreator,
            int sigPage,
            float sigX,
            float sigY,
            float sigWidth,
            float sigHeight,
            String signaturesJson,
            int redactPage,
            float redactX,
            float redactY,
            float redactWidth,
            float redactHeight,
            boolean formsFlatten
    ) {
        static ToolParams fromRequest(
                String pageRange,
                String pageOrder,
                String pdfPassword,
                String pdfPasswordsJson,
                String pdfaStandard,
                String password,
                String ownerPassword,
                String ocrLang,
                String text,
                String title,
                Integer dpi,
                String exportFormat,
                Integer angle,
                String rotationScope,
                String pageNumberFormat,
                Integer pageNumberSize,
                String pageNumberAlignment,
                String watermarkText,
                Integer watermarkSize,
                Integer watermarkRotation,
                Float watermarkOpacity,
                String watermarkColor,
                Float cropLeft,
                Float cropRight,
                Float cropTop,
                Float cropBottom,
                String metadataTitle,
                String metadataAuthor,
                String metadataSubject,
                String metadataCreator,
                Integer sigPage,
                Float sigX,
                Float sigY,
                Float sigWidth,
                Float sigHeight,
                String signaturesJson,
                Integer redactPage,
                Float redactX,
                Float redactY,
                Float redactWidth,
                Float redactHeight,
                Boolean formsFlatten
        ) {
            return new ToolParams(
                    pageRange,
                    pageOrder,
                    pdfPassword,
                    pdfPasswordsJson,
                    pdfaStandard,
                    password,
                    ownerPassword,
                    ocrLang,
                    text,
                    title,
                    dpi == null ? 150 : dpi,
                    exportFormat,
                    angle == null ? 90 : angle,
                    rotationScope == null ? "All" : rotationScope,
                    pageNumberFormat == null ? "Page {X} of {Y}" : pageNumberFormat,
                    pageNumberSize == null ? 10 : pageNumberSize,
                    pageNumberAlignment == null ? "Center" : pageNumberAlignment,
                    watermarkText == null ? "CONFIDENTIAL" : watermarkText,
                    watermarkSize == null ? 48 : watermarkSize,
                    watermarkRotation == null ? 45 : watermarkRotation,
                    watermarkOpacity == null ? 0.3f : watermarkOpacity,
                    watermarkColor == null ? "#ff3300" : watermarkColor,
                    cropLeft == null ? 20f : cropLeft,
                    cropRight == null ? 20f : cropRight,
                    cropTop == null ? 20f : cropTop,
                    cropBottom == null ? 20f : cropBottom,
                    metadataTitle,
                    metadataAuthor,
                    metadataSubject,
                    metadataCreator,
                    sigPage == null ? 1 : sigPage,
                    sigX == null ? 100f : sigX,
                    sigY == null ? 100f : sigY,
                    sigWidth == null ? 150f : sigWidth,
                    sigHeight == null ? 50f : sigHeight,
                    signaturesJson,
                    redactPage == null ? 1 : redactPage,
                    redactX == null ? 40f : redactX,
                    redactY == null ? 40f : redactY,
                    redactWidth == null ? 200f : redactWidth,
                    redactHeight == null ? 40f : redactHeight,
                    formsFlatten == null || formsFlatten
            );
        }
    }

    public record ToolOutput(
            byte[] bytes,
            String contentType,
            String filename,
            String jsonBody,
            java.util.Map<String, String> responseHeaders
    ) {
        static ToolOutput pdf(byte[] bytes, String filename) {
            return pdfWithHeaders(bytes, filename, java.util.Map.of());
        }

        static ToolOutput pdfWithHeaders(byte[] bytes, String filename, java.util.Map<String, String> headers) {
            return new ToolOutput(bytes, "application/pdf", filename, null, headers);
        }

        static ToolOutput text(String text, String filename) {
            return new ToolOutput(text.getBytes(java.nio.charset.StandardCharsets.UTF_8), "text/plain", filename, null, java.util.Map.of());
        }

        static ToolOutput csv(String csv, String filename) {
            return new ToolOutput(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8), "text/csv", filename, null, java.util.Map.of());
        }

        static ToolOutput office(byte[] bytes, String filename, String contentType) {
            return new ToolOutput(bytes, contentType, filename, null, java.util.Map.of());
        }

        static ToolOutput dxf(byte[] bytes, String filename) {
            return new ToolOutput(bytes, "application/dxf", filename, null, java.util.Map.of());
        }

        static ToolOutput zip(byte[] bytes, String filename) {
            return new ToolOutput(bytes, "application/zip", filename, null, java.util.Map.of());
        }

        static ToolOutput json(String json) {
            return new ToolOutput(null, "application/json", null, json, java.util.Map.of());
        }
    }
}
