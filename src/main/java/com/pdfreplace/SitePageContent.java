package com.pdfreplace;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Crawler-visible editorial content for each public route.
 *
 * <p>This is rendered into the server-side SPA shell so search engines and ad
 * reviewers see substantial, unique content (overview, steps, FAQ) for every
 * page even before any JavaScript runs. The wording is kept aligned with
 * {@code new-ui/src/toolContent.ts}, which renders the same material in the app.
 */
final class SitePageContent {

    record Faq(String question, String answer) {}

    record Content(List<String> paragraphs, String howToHeading, List<String> steps, List<Faq> faqs) {
        static Content of(List<String> paragraphs, String howToHeading, List<String> steps, List<Faq> faqs) {
            return new Content(paragraphs, howToHeading, steps, faqs);
        }
    }

    private static final Map<String, String> SLUG_TO_TOOL_ID = Map.of(
            "image-to-pdf", "images-to-pdf",
            "jpg-to-pdf", "images-to-pdf"
    );

    private static final Map<String, Content> BY_PATH = staticContent();
    private static final Map<String, Content> BY_TOOL_ID = toolContent();

    private SitePageContent() {}

    static Content resolve(String rawPath) {
        String path = normalizePath(rawPath);
        Content direct = BY_PATH.get(path);
        if (direct != null) {
            return direct;
        }
        if (path.startsWith("/guides/")) {
            GuideCatalog.Guide guide = GuideCatalog.bySlug(path.substring("/guides/".length()));
            if (guide == null) {
                return null;
            }
            return Content.of(guide.summary(), null, List.of(), List.of());
        }
        if (path.startsWith("/bolt/")) {
            return resolveTool(path.substring("/bolt/".length()));
        }
        if (path.startsWith("/tools/")) {
            return resolveTool(path.substring("/tools/".length()));
        }
        if ("/replace".equals(path) || "/compress".equals(path)) {
            return BY_TOOL_ID.get(path.substring(1));
        }
        return null;
    }

    private static Content resolveTool(String slug) {
        String toolId = SLUG_TO_TOOL_ID.getOrDefault(slug, slug);
        return BY_TOOL_ID.get(toolId);
    }

    private static String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            return "/";
        }
        String trimmed = path.trim();
        if (trimmed.length() > 1 && trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed.isEmpty() ? "/" : trimmed;
    }

    private static Map<String, Content> staticContent() {
        Map<String, Content> pages = new LinkedHashMap<>();

        pages.put("/", Content.of(
                List.of(
                        "PDFbolt is a free suite of online tools for the PDF tasks that come up every day \u2014 "
                                + "merging documents, converting files to and from PDF, compressing large files, "
                                + "replacing text, signing, redacting, and protecting documents with passwords. "
                                + "Everything runs in your browser, with no software to install and no account to create.",
                        "Each tool is built to do one job well and finish in seconds. Most tools process your file on "
                                + "our server for a single job and remove it afterward; a few, such as Sign, Redact, and "
                                + "Unlock, run entirely in your browser so the file never leaves your device."),
                null, List.of(),
                List.of(
                        new Faq("Is PDFbolt free?",
                                "Yes. The tools are free to use in your browser. The site is supported by advertising."),
                        new Faq("Do I need an account?",
                                "No. You can open any tool, upload a file, and download the result without signing up."),
                        new Faq("Are my files kept?",
                                "No. Server-side tools remove your file after the job; several tools run fully in your browser."))));

        pages.put("/directory", Content.of(
                List.of(
                        "Browse every PDFbolt tool in one place. The suite is organized into clear categories so you can "
                                + "quickly find what you need: organize pages, convert to and from PDF, optimize, edit, work "
                                + "with forms, and secure documents.",
                        "Organize covers merge, split, extract, remove, and reorder. Convert handles images, Word, Excel, "
                                + "PowerPoint, HTML, JPG, and CAD/DXF. Optimize includes compress and repair. Edit covers "
                                + "replace text, rotate, watermark, page numbers, crop, and metadata. Security covers passwords, "
                                + "signatures, redaction, and document comparison."),
                null, List.of(), List.of()));

        pages.put("/guides", Content.of(
                List.of(
                        "Practical, plain-English articles on working with PDFs \u2014 how to compress, convert, merge, "
                                + "secure, and archive documents, and why these tasks behave the way they do.",
                        "Each guide stands on its own, explaining the concepts behind common PDF problems so you can solve "
                                + "them confidently and pick the right tool for the job."),
                null, List.of(), List.of()));

        pages.put("/about", Content.of(
                List.of(
                        "PDFbolt is a collection of online tools for everyday PDF work, built and maintained by an "
                                + "independent developer rather than a large company. The goal is simple: cover the document "
                                + "jobs people actually need, do each one well, and keep the experience fast and free of clutter.",
                        "It is actively maintained \u2014 tools are tested, fixed, and improved over time, and new ones are "
                                + "added based on what people ask for. If a tool is missing or could work better, the Contact "
                                + "page is the quickest way to reach us, and we aim to reply within a few business days.",
                        "The tools are free to use. To cover hosting and development, PDFbolt shows advertising provided by "
                                + "Google. Ads are clearly labelled and kept separate from the tools, and your documents are "
                                + "never used for ad targeting \u2014 file processing and advertising are completely independent.",
                        "Most tools upload your file to our server, process it, and return a download. The file is used only "
                                + "for that single job and removed afterward \u2014 it is not stored or shared. A few tools, "
                                + "including Sign, Redact, and Unlock, run entirely in your browser, so those files never leave "
                                + "your device at all."),
                null, List.of(),
                List.of(
                        new Faq("Who makes PDFbolt?",
                                "It is built and maintained by an independent developer. Use the Contact page to send feedback "
                                        + "or request a feature."),
                        new Faq("What does \u201ccoming soon\u201d mean on a tool?",
                                "That tool is work in progress \u2014 visible in the directory but not runnable yet."))));

        pages.put("/faq", Content.of(
                List.of(
                        "Answers to the questions we hear most about PDFbolt \u2014 how files are handled, what the upload "
                                + "limits are, which formats are supported, and how individual tools behave.",
                        "If something is not covered here, the Contact page is the best way to reach us and we aim to reply "
                                + "within a few business days."),
                null, List.of(),
                List.of(
                        new Faq("Are my files stored?",
                                "Most tools upload your file only while the job runs and remove it after you download the "
                                        + "result. Some tools run entirely in your browser."),
                        new Faq("What are the upload limits?",
                                "Typically up to 25 MB per file, 100 MB per request, 10 files at once, and 250 pages per PDF. "
                                        + "Exact limits are shown under each tool."),
                        new Faq("Which browsers are supported?",
                                "Current versions of Chrome, Edge, Firefox, and Safari on desktop and mobile."))));

        pages.put("/privacy", Content.of(
                List.of(
                        "This page explains how PDFbolt handles your files, cookies, analytics, advertising, and any "
                                + "information you send through the contact form.",
                        "In short: files processed on the server are used only for the requested job and removed afterward, "
                                + "and several tools never upload your file at all because they run in your browser."),
                null, List.of(), List.of()));

        pages.put("/terms", Content.of(
                List.of(
                        "These terms cover acceptable use of PDFbolt, the absence of warranty for conversion accuracy, "
                                + "limitations of liability, and the third-party components and services the site relies on.",
                        "By using the site you agree to use it lawfully and to keep backups of important documents, since "
                                + "results can vary with file type, fonts, and complexity."),
                null, List.of(), List.of()));

        pages.put("/contact", Content.of(
                List.of(
                        "Have a question, found a bug, or want to request a tool? Send us a message through the contact form "
                                + "and we will get back to you.",
                        "We aim to reply within a few business days. For help with a specific tool, the Help & FAQ page may "
                                + "answer your question right away."),
                null, List.of(), List.of()));

        pages.put("/status", Content.of(
                List.of(
                        "This page shows the current PDFbolt service status, including the running version and the most "
                                + "recent health check.",
                        "If a tool is not responding, check here first \u2014 the status reflects whether the processing "
                                + "service is online."),
                null, List.of(), List.of()));

        return Map.copyOf(pages);
    }

    private static Map<String, Content> toolContent() {
        Map<String, Content> t = new LinkedHashMap<>();

        t.put("merge", Content.of(
                List.of(
                        "Merging PDFs is the quickest way to turn several separate documents \u2014 contracts, scanned "
                                + "receipts, chapters, or reports \u2014 into a single file that is easy to email, print, or "
                                + "archive. Instead of attaching five PDFs, you send one.",
                        "PDFbolt merges files in the exact order you arrange them and keeps each page at its original "
                                + "resolution, so text stays selectable and images stay sharp."),
                "How to merge PDF files",
                List.of(
                        "Choose the PDF files you want to combine, or drag them onto the upload area.",
                        "Drag the files in the list to set the order pages will appear.",
                        "Enter a password for any protected file when prompted.",
                        "Click merge to combine them and download a single PDF."),
                List.of(
                        new Faq("Will merging reduce quality?",
                                "No. Pages are copied as-is, so text stays selectable and images keep their resolution."),
                        new Faq("Can I merge protected PDFs?",
                                "Yes, if you know the password. Enter it in the banner that appears after adding the file."))));

        t.put("split", Content.of(
                List.of(
                        "Splitting a PDF lets you take one large document and carve out exactly the pages you need \u2014 a "
                                + "single signed page, one chapter, or a range you want to send on its own.",
                        "You describe which pages or ranges to keep, and PDFbolt produces the result without changing the "
                                + "content of the pages themselves."),
                "How to split a PDF",
                List.of(
                        "Select the PDF you want to split.",
                        "Enter the page or range to extract, for example \u201c1\u201d or \u201c1-3, 5\u201d.",
                        "Enter the password if the PDF is protected.",
                        "Run the tool and download the split result."),
                List.of(
                        new Faq("How do I write a page range?",
                                "Use hyphens for ranges and commas to separate them. \u201c1-3, 7\u201d keeps pages 1, 2, 3 and 7."),
                        new Faq("Does splitting change the pages?",
                                "No. The pages you keep are identical to the original."))));

        t.put("remove-pages", Content.of(
                List.of(
                        "Scanned documents often pick up blank pages, cover sheets, or duplicates. Removing pages lets you "
                                + "delete those by number and keep everything else exactly as it was.",
                        "You list the pages to drop, and PDFbolt returns a new PDF with the rest of the document untouched "
                                + "and renumbered automatically."),
                "How to remove pages from a PDF",
                List.of(
                        "Choose the PDF you want to clean up.",
                        "In \u201cPages to remove\u201d, type the page numbers to delete, for example \u201c2, 4\u201d.",
                        "Enter a password if the PDF is protected.",
                        "Run the tool and download the result."),
                List.of(
                        new Faq("Will remaining pages be renumbered?",
                                "Yes. Surviving pages flow in their original order and are numbered consecutively."),
                        new Faq("Can I remove a whole range?",
                                "List the numbers separated by commas, or use Split or Extract to keep a range instead."))));

        t.put("extract-pages", Content.of(
                List.of(
                        "Extracting pages is for when you want to keep just part of a document \u2014 a single form, an "
                                + "invoice, or a few pages from a long report \u2014 as its own PDF.",
                        "The original file stays intact; you simply get a copy of the pages you chose, with their layout and "
                                + "quality preserved."),
                "How to extract pages from a PDF",
                List.of(
                        "Select your source PDF.",
                        "Enter the pages or ranges to extract, for example \u201c1, 3-5\u201d.",
                        "Provide a password if the file is protected.",
                        "Run the tool and download the extracted pages."),
                List.of(
                        new Faq("How is Extract different from Split?",
                                "Extract pulls a chosen set of pages into one new PDF; Split breaks a document into separate pieces."),
                        new Faq("Does it change the original?",
                                "No. The uploaded file is untouched; you get a new PDF with only the selected pages."))));

        t.put("organize-pdf", Content.of(
                List.of(
                        "Sometimes pages end up in the wrong order \u2014 a scan goes in backwards, or an appendix needs to "
                                + "move to the front. Organizing a PDF lets you set a new page sequence.",
                        "You type the page numbers in the order you want them, and PDFbolt reassembles the file to match."),
                "How to reorder PDF pages",
                List.of(
                        "Choose the PDF to reorganize.",
                        "In \u201cNew page order\u201d, list page numbers in order, for example \u201c3, 2, 1\u201d to reverse.",
                        "Enter a password if required.",
                        "Run the tool and download the reordered PDF."),
                List.of(
                        new Faq("How do I reverse a PDF?",
                                "List the page numbers from highest to lowest, e.g. \u201c5, 4, 3, 2, 1\u201d."),
                        new Faq("What happens to pages I omit?",
                                "Any page you leave out will not appear, so include every page you want to keep."))));

        t.put("scan-to-pdf", Content.of(
                List.of(
                        "Phone photos of documents and receipts are easy to capture but awkward to share. Scan to PDF gathers "
                                + "those images into one clean PDF that opens the same on every device.",
                        "Add the images, arrange them, and download a single document \u2014 no scanner app required."),
                "How to turn scans into a PDF",
                List.of(
                        "Choose the photos or scanned images to include.",
                        "Drag them into the order you want the pages to appear.",
                        "Run the tool to build the PDF.",
                        "Download your combined document."),
                List.of(
                        new Faq("Which formats can I use?",
                                "Common image formats such as JPG and PNG work well; see the upload area for the full list."),
                        new Faq("Can I make the text searchable?",
                                "Scan to PDF creates image pages; run OCR afterward to make the text selectable."))));

        t.put("compress", Content.of(
                List.of(
                        "Large PDFs bounce off email limits, upload slowly, and fill storage. Compressing a PDF reduces its "
                                + "size \u2014 mostly by optimizing images \u2014 so it stays easy to share while remaining "
                                + "clear enough to read and print.",
                        "You pick how aggressively to compress, balancing smaller files against visual quality to match how "
                                + "the document will be used."),
                "How to compress a PDF",
                List.of(
                        "Select the PDF you want to compress.",
                        "Pick a compression level: lighter keeps more detail, stronger makes smaller files.",
                        "Optionally keep the original metadata.",
                        "Run the tool and download the smaller PDF."),
                List.of(
                        new Faq("Why did my file barely shrink?",
                                "Text-only PDFs are already compact. The biggest savings come from documents full of photos or scans."),
                        new Faq("Will text become blurry?",
                                "No. Text stays crisp; compression mainly reduces the size of embedded images."))));

        t.put("repair-pdf", Content.of(
                List.of(
                        "A PDF can become unreadable after an interrupted download, a storage error, or a bad export. "
                                + "Repairing the PDF attempts to rebuild its internal structure so the content becomes "
                                + "accessible again.",
                        "Repair is a best-effort recovery: it often restores files with minor damage, though severely "
                                + "corrupted documents may only be partially recoverable."),
                "How to repair a PDF",
                List.of(
                        "Choose the PDF that will not open correctly.",
                        "Run the repair tool.",
                        "Download the rebuilt file and open it to check the result."),
                List.of(
                        new Faq("Can every broken PDF be fixed?",
                                "No tool can guarantee full recovery. Lightly damaged files usually repair well."),
                        new Faq("Does repair recover a password?",
                                "No. Repair fixes structure, not encryption. Use Unlock PDF if you know the password."))));

        t.put("ocr-pdf", Content.of(
                List.of(
                        "A scanned page looks like text but is really a picture, so you cannot search or copy from it. OCR "
                                + "(optical character recognition) reads the image and adds a hidden, selectable text layer.",
                        "This tool is in progress on PDFbolt. When it goes live it will turn image-only PDFs into searchable "
                                + "documents and improve the accuracy of converting scans to Word or Excel."),
                "How OCR will work",
                List.of(
                        "Choose the scanned PDF you want to make searchable.",
                        "Select the document language for accurate recognition.",
                        "Run OCR to add a searchable text layer.",
                        "Download the searchable PDF."),
                List.of(
                        new Faq("Is OCR available now?",
                                "It is in progress \u2014 visible in the directory but not runnable yet."),
                        new Faq("Does OCR change how the page looks?",
                                "No. It adds an invisible text layer behind the existing image."))));

        t.put("images-to-pdf", Content.of(
                List.of(
                        "Converting images to PDF is the easiest way to package pictures \u2014 photos, screenshots, scanned "
                                + "forms, or design exports \u2014 into a single document that prints predictably and opens "
                                + "anywhere.",
                        "Add your images, arrange the page order, and PDFbolt assembles them into one PDF with each image on "
                                + "its own page."),
                "How to convert images to PDF",
                List.of(
                        "Choose your images (PNG, JPEG, HEIC, GIF, WebP, BMP, or TIFF).",
                        "Drag them into the order you want the pages.",
                        "Run the tool to build the PDF.",
                        "Download the combined document."),
                List.of(
                        new Faq("In what order will images appear?",
                                "Pages follow the list order; drag images before running the tool."),
                        new Faq("Can I mix formats?",
                                "Yes. You can combine several supported formats; each image becomes one page."))));

        t.put("word-to-pdf", Content.of(
                List.of(
                        "Word files can shift their layout from one computer to another. Converting to PDF locks the "
                                + "formatting in place so the document looks identical for everyone who opens it.",
                        "PDFbolt converts .doc and .docx files, preserving text, fonts, and layout as closely as possible."),
                "How to convert Word to PDF",
                List.of(
                        "Choose your Word file (.doc or .docx).",
                        "Run the conversion.",
                        "Download the resulting PDF and check the formatting."),
                List.of(
                        new Faq("Will my formatting stay the same?",
                                "In most cases yes. Standard text, tables, and images convert faithfully."),
                        new Faq("Can I convert both .doc and .docx?",
                                "Yes, both the older and modern Word formats are supported."))));

        t.put("powerpoint-to-pdf", Content.of(
                List.of(
                        "Sharing a slide deck as PDF means recipients can view it without PowerPoint, on any device, with the "
                                + "layout exactly as you designed it.",
                        "PDFbolt converts .ppt and .pptx files into a PDF with one slide per page."),
                "How to convert PowerPoint to PDF",
                List.of(
                        "Choose your PowerPoint file (.ppt or .pptx).",
                        "Run the conversion.",
                        "Download the PDF, with each slide as a page."),
                List.of(
                        new Faq("Do animations carry over?",
                                "No. PDF is static, so each slide is rendered once as a single page."),
                        new Faq("Will fonts and images look right?",
                                "Standard fonts and embedded images convert faithfully; unusual fonts may be substituted."))));

        t.put("excel-to-pdf", Content.of(
                List.of(
                        "Converting a spreadsheet to PDF freezes the data exactly as it is, producing a read-only document "
                                + "that is perfect for reports, invoices, and approvals.",
                        "PDFbolt converts .xls and .xlsx files, keeping your tables, numbers, and formatting in a fixed layout."),
                "How to convert Excel to PDF",
                List.of(
                        "Choose your Excel file (.xls or .xlsx).",
                        "Run the conversion.",
                        "Download the resulting PDF."),
                List.of(
                        new Faq("Why does my sheet span several pages?",
                                "Wide or tall sheets do not fit one page. Set a print area or scaling in Excel first."),
                        new Faq("Are formulas preserved?",
                                "The PDF captures calculated values as shown, not live formulas."))));

        t.put("html-to-pdf", Content.of(
                List.of(
                        "Converting HTML to PDF is handy for saving web content, invoices, receipts, or templated pages as a "
                                + "fixed document instead of printing a messy webpage.",
                        "You can upload an HTML file or paste markup directly, and PDFbolt renders it to a PDF."),
                "How to convert HTML to PDF",
                List.of(
                        "Choose whether to upload an HTML file or paste markup.",
                        "Provide your HTML content.",
                        "Run the conversion.",
                        "Download the rendered PDF."),
                List.of(
                        new Faq("Can I paste HTML instead of a file?",
                                "Yes. Switch the input mode to paste markup directly."),
                        new Faq("Why are some images missing?",
                                "Resources loaded from external URLs may not be fetched; embed images and CSS for reliable results."))));

        t.put("pdf-to-jpg", Content.of(
                List.of(
                        "Turning PDF pages into JPG images is useful when you need pictures rather than a document \u2014 for "
                                + "slides, thumbnails, website graphics, or pasting a page into another app.",
                        "You choose the resolution (DPI), and PDFbolt renders every page to a JPG so you can grab the ones "
                                + "you need."),
                "How to convert PDF to JPG",
                List.of(
                        "Choose the PDF you want to convert.",
                        "Pick an image quality (DPI): higher for print, lower for smaller files.",
                        "Run the tool.",
                        "Download the resulting JPG images."),
                List.of(
                        new Faq("What DPI should I choose?",
                                "Use 96\u2013150 DPI for screens and email, and 300 DPI for printing."),
                        new Faq("Do I get one image per page?",
                                "Yes, one JPG per page, so you can keep only the pages you need."))));

        t.put("pdf-to-word", Content.of(
                List.of(
                        "Converting a PDF back to Word gives you an editable .docx you can rework \u2014 fix a typo, update "
                                + "figures, or reuse the text elsewhere.",
                        "Conversion works best on PDFs that already contain real text. Scanned, image-only pages need OCR "
                                + "first."),
                "How to convert PDF to Word",
                List.of(
                        "Choose the PDF you want to convert.",
                        "Run the conversion.",
                        "Download the .docx file and open it in Word or a compatible editor."),
                List.of(
                        new Faq("Why is my document messy?",
                                "Complex layouts and tables are hard to reproduce exactly; expect light reformatting."),
                        new Faq("Can I convert a scanned PDF?",
                                "Only after OCR, since a scan has no text for the converter to extract."))));

        t.put("pdf-to-powerpoint", Content.of(
                List.of(
                        "Converting a PDF to PowerPoint is useful when you have a deck shared as PDF and need to edit or "
                                + "re-present it. Each page becomes a slide you can adjust.",
                        "Results are best when the PDF contains real text and a slide-like layout rather than dense documents."),
                "How to convert PDF to PowerPoint",
                List.of(
                        "Choose the PDF you want to convert.",
                        "Run the conversion.",
                        "Download the .pptx file and open it in PowerPoint."),
                List.of(
                        new Faq("Will each page become a slide?",
                                "Yes, the converter maps pages to slides you can edit individually."),
                        new Faq("Why fix formatting afterward?",
                                "PDFs do not store slide structure, so the converter reconstructs it."))));

        t.put("pdf-to-excel", Content.of(
                List.of(
                        "When financial statements or data tables arrive as PDFs, retyping them is slow and error-prone. "
                                + "Converting to Excel pulls the tabular content into a .xlsx file so you can sort and total it.",
                        "Conversion is most reliable on PDFs with clear, text-based tables."),
                "How to convert PDF to Excel",
                List.of(
                        "Choose the PDF you want to convert.",
                        "Run the conversion.",
                        "Download the .xlsx file and open it in Excel."),
                List.of(
                        new Faq("Will my table structure be preserved?",
                                "Clear tables map well to rows and columns; complex layouts may need adjustment."),
                        new Faq("Can it convert a scanned report?",
                                "Not directly \u2014 run OCR first so the data is real text."))));

        t.put("pdf-to-pdfa", Content.of(
                List.of(
                        "PDF/A is a version of PDF designed for long-term preservation: it embeds everything the file needs "
                                + "to display correctly years from now, which is why archives often require it.",
                        "PDFbolt targets common PDF/A levels. Because the standard is strict, some documents need adjustment "
                                + "to fully comply \u2014 the result message explains how the conversion went."),
                "How to convert PDF to PDF/A",
                List.of(
                        "Choose the PDF you want to archive.",
                        "Select the PDF/A level you need (for example PDF/A-1b, 2b, or 3b).",
                        "Run the conversion.",
                        "Download the PDF/A file and read the result message."),
                List.of(
                        new Faq("Which PDF/A level should I pick?",
                                "PDF/A-1b is the most widely accepted baseline; choose 2b or 3b only if required."),
                        new Faq("Why is my PDF/A file larger?",
                                "PDF/A embeds fonts and color profiles so the document is self-contained."))));

        t.put("pdf-to-dxf", Content.of(
                List.of(
                        "CAD drawings are frequently shared as PDFs, but to edit them you need a real CAD format. Converting "
                                + "to DXF turns the vector geometry in a PDF into an AutoCAD-compatible drawing you can modify.",
                        "PDFbolt exports each PDF page as its own DXF file (R2010), measured in millimetres, and delivers "
                                + "them together in a zip."),
                "How to convert PDF to DXF",
                List.of(
                        "Choose the vector PDF drawing you want to convert.",
                        "Run the conversion.",
                        "Download the zip and extract the DXF files (page_001.dxf, page_002.dxf, \u2026).",
                        "Open the DXF in AutoCAD or any compatible CAD application."),
                List.of(
                        new Faq("Why is my DXF empty?",
                                "The source was likely a scan or raster image; only vector geometry converts to DXF."),
                        new Faq("What DXF version is produced?",
                                "Files are exported as AutoCAD R2010 DXF, which opens in modern CAD software."))));

        t.put("replace", Content.of(
                List.of(
                        "Fixing a typo or updating a date in a PDF usually means going back to the source file \u2014 unless "
                                + "you can edit the text directly. Replace text searches the document and swaps words while "
                                + "the file stays a real, selectable PDF rather than a flattened image.",
                        "You can set up several find-and-replace rules at once, control how matches are found, and choose "
                                + "whether to keep the original formatting."),
                "How to replace text in a PDF",
                List.of(
                        "Choose one or more PDFs to edit (multiple files use the same rules).",
                        "Add one or more find/replace rules.",
                        "Pick a match mode and the scope of replacements.",
                        "Run the tool and download the updated PDF, or a zip for multiple files."),
                List.of(
                        new Faq("Does this keep the PDF selectable?",
                                "Yes. Replace edits the actual text, so the document stays a true, selectable PDF."),
                        new Faq("Can I replace several phrases at once?",
                                "Yes. Add multiple rules and they are all applied in one run."))));

        t.put("rotate-pdf", Content.of(
                List.of(
                        "Scans and photos often come out sideways or upside down. Rotating pages turns them to the correct "
                                + "orientation so the document displays and prints the right way up.",
                        "You can rotate every page or only the odd or even pages \u2014 handy when a double-sided scan "
                                + "flipped alternate sheets."),
                "How to rotate a PDF",
                List.of(
                        "Choose the PDF you want to rotate.",
                        "Pick the rotation angle: 90\u00b0, 180\u00b0, or 270\u00b0.",
                        "Choose all pages or only odd or even pages.",
                        "Run the tool and download the corrected PDF."),
                List.of(
                        new Faq("Can I rotate only some pages?",
                                "Yes. Use the page filter to rotate all, odd, or even pages."),
                        new Faq("Is the rotation permanent?",
                                "Yes. The new orientation is written into the downloaded PDF."))));

        t.put("add-page-numbers", Content.of(
                List.of(
                        "Page numbers make long documents easier to navigate, reference, and print in order. Adding them to "
                                + "a PDF is far simpler than editing the source and re-exporting.",
                        "You control the number format, font size, and alignment so the numbering matches your document."),
                "How to add page numbers to a PDF",
                List.of(
                        "Choose the PDF you want to number.",
                        "Set the template pattern, font size, and alignment.",
                        "Run the tool.",
                        "Download the numbered PDF."),
                List.of(
                        new Faq("Where do the numbers appear?",
                                "According to the alignment you choose \u2014 left, center, or right \u2014 along the page edge."),
                        new Faq("Will numbering cover my content?",
                                "It sits near the margin; on full pages choose a smaller size or different alignment."))));

        t.put("add-watermark", Content.of(
                List.of(
                        "A watermark labels a document at a glance \u2014 \u201cDRAFT\u201d, \u201cCONFIDENTIAL\u201d, or your "
                                + "company name \u2014 and discourages unauthorized reuse.",
                        "You control the text, size, rotation, color, and transparency so the watermark is visible without "
                                + "hiding the content underneath."),
                "How to add a watermark to a PDF",
                List.of(
                        "Choose the PDF you want to watermark.",
                        "Enter the text and set size, angle, color, and opacity.",
                        "Run the tool.",
                        "Download the watermarked PDF."),
                List.of(
                        new Faq("Will the watermark hide my text?",
                                "Not if you keep opacity low; the mark sits over the page semi-transparently."),
                        new Faq("Can I watermark every page?",
                                "Yes. The watermark is applied across the document in one run."))));

        t.put("crop-pdf", Content.of(
                List.of(
                        "Cropping removes unwanted margins or focuses each page on a smaller region \u2014 useful for "
                                + "trimming scanner borders, removing whitespace, or fitting content for printing.",
                        "You set how much to trim from each edge in points, and PDFbolt applies the crop to the document."),
                "How to crop a PDF",
                List.of(
                        "Choose the PDF you want to crop.",
                        "Enter the amount to trim from each edge (in points).",
                        "Run the tool.",
                        "Download the cropped PDF."),
                List.of(
                        new Faq("What unit are the crop values?",
                                "Points. There are 72 points per inch, so 36 points trims half an inch."),
                        new Faq("Can I crop pages to different sizes?",
                                "The margins apply across the document; crop sections separately for per-page sizing."))));

        t.put("edit-pdf", Content.of(
                List.of(
                        "Every PDF carries metadata \u2014 the title, author, subject, and creating application \u2014 that "
                                + "shows up in file managers, search results, and document libraries.",
                        "Editing these fields keeps your documents accurate and organized without changing the visible page "
                                + "content."),
                "How to edit PDF properties",
                List.of(
                        "Choose the PDF you want to edit.",
                        "Update the title, author, subject, and creator fields.",
                        "Run the tool.",
                        "Download the PDF with the new properties."),
                List.of(
                        new Faq("Does editing properties change the pages?",
                                "No. Only the document information is updated; the pages stay the same."),
                        new Faq("Where is this metadata visible?",
                                "In your viewer's document properties, file managers, and sometimes search results."))));

        t.put("pdf-forms", Content.of(
                List.of(
                        "Fillable PDF forms are convenient until you need to lock in the answers or share a clean copy. This "
                                + "tool lets you keep the editable fields or flatten them so the values become part of the page.",
                        "Flattening is the safe way to finalize a form before sending it, since recipients can no longer "
                                + "change the entries."),
                "How to fill or flatten a PDF form",
                List.of(
                        "Choose the PDF form.",
                        "Decide whether to flatten the fields into the page.",
                        "Run the tool.",
                        "Download the finished form."),
                List.of(
                        new Faq("What does flattening do?",
                                "It merges the filled-in values into the page so they can no longer be edited as fields."),
                        new Faq("Should I flatten before emailing?",
                                "Usually yes, to prevent further changes \u2014 unless the recipient must still fill it in."))));

        t.put("unlock-pdf", Content.of(
                List.of(
                        "A password on a PDF is helpful until it becomes a hassle to open the file every time. If you know "
                                + "the password, unlocking removes that protection and any printing or copying restrictions.",
                        "This tool is for files you have the right to access \u2014 it does not crack or bypass unknown "
                                + "passwords."),
                "How to unlock a PDF",
                List.of(
                        "Choose the protected PDF.",
                        "Enter the password if the file requires one to open.",
                        "Run the tool.",
                        "Download the unlocked PDF."),
                List.of(
                        new Faq("Can this recover a forgotten password?",
                                "No. You need the correct password; unlocking is not password recovery."),
                        new Faq("Does it remove printing restrictions too?",
                                "Yes, where those restrictions are present the unlocked file becomes unrestricted."))));

        t.put("protect-pdf", Content.of(
                List.of(
                        "Sensitive documents should not be readable by anyone who happens to receive the file. Protecting a "
                                + "PDF with a password encrypts it so only people who know the password can open it.",
                        "Set a strong password, and PDFbolt produces an encrypted copy you can share with confidence."),
                "How to password-protect a PDF",
                List.of(
                        "Choose the PDF you want to protect.",
                        "Enter the password that will be required to open it.",
                        "Run the tool.",
                        "Download the password-protected PDF."),
                List.of(
                        new Faq("What if I lose the password?",
                                "The document cannot be opened or recovered without it, so store it safely."),
                        new Faq("How should I share the password?",
                                "Send it separately from the file, for example by message or phone."))));

        t.put("sign-pdf", Content.of(
                List.of(
                        "Printing a document just to sign and rescan it is slow and wasteful. Signing a PDF lets you draw "
                                + "your signature and drop it exactly where it belongs, right on the page.",
                        "You can sign a single page or repeat the same signature on every page \u2014 useful for initialling "
                                + "each sheet of an agreement."),
                "How to sign a PDF",
                List.of(
                        "Choose the PDF you want to sign.",
                        "Draw your signature directly on the page.",
                        "Choose this page only or every page.",
                        "Run the tool and download the signed PDF."),
                List.of(
                        new Faq("Is my document uploaded when I sign?",
                                "No. Signing happens entirely in your browser, so the PDF never leaves your device."),
                        new Faq("Can I sign every page at once?",
                                "Yes. Draw your signature once and choose to place it on every page."))));

        t.put("redact-pdf", Content.of(
                List.of(
                        "Before sharing a document publicly or in a filing, you often need to hide names, account numbers, or "
                                + "other private details. Redaction covers those areas with solid black boxes.",
                        "You draw boxes over the regions to hide, and the redaction is applied right in your browser for "
                                + "privacy."),
                "How to redact a PDF",
                List.of(
                        "Choose the PDF you want to redact.",
                        "Draw black boxes over each area to hide.",
                        "Review every page so nothing sensitive is missed.",
                        "Download the redacted PDF."),
                List.of(
                        new Faq("Is my file uploaded to redact it?",
                                "No. Redaction runs in your browser, so the PDF stays on your device."),
                        new Faq("Can I add boxes on multiple pages?",
                                "Yes. Move through the pages and draw boxes wherever needed."))));

        t.put("compare-pdf", Content.of(
                List.of(
                        "When you have two versions of a contract, report, or design, finding what changed by eye is tedious "
                                + "and error-prone. Comparing PDFs highlights the differences so you can review edits quickly.",
                        "Load both files and PDFbolt shows them together, drawing attention to where the text and layout "
                                + "differ."),
                "How to compare two PDFs",
                List.of(
                        "Choose the first PDF (version A).",
                        "Choose the second PDF (version B).",
                        "Review the side-by-side comparison and highlighted differences."),
                List.of(
                        new Faq("What differences does it show?",
                                "Changes in text and layout between the two documents \u2014 what was added, removed, or moved."),
                        new Faq("Can I compare two scanned PDFs?",
                                "Text comparison needs real text; scanned pages would need OCR first."))));

        return Map.copyOf(t);
    }
}
