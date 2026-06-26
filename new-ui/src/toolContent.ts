import { canonicalToolId } from './toolIdAliases';

export interface ToolFaq {
  q: string;
  a: string;
}

/**
 * Editorial, human-written content for each tool page.
 *
 * This exists so every tool URL has genuinely useful, unique reading material
 * (overview, instructions, practical notes, FAQ) instead of being a bare
 * upload form. It also powers per-page meta descriptions and FAQ structured
 * data for search engines.
 */
export interface ToolContent {
  /** Unique <meta name="description"> (~150 chars) for this tool. */
  metaDescription: string;
  /** Short H1-adjacent tagline shown under the heading. */
  tagline: string;
  /** One or two paragraphs explaining what the tool does and when to use it. */
  intro: string[];
  /** Ordered, concrete steps using the real UI labels. */
  steps: string[];
  /** Practical notes, limits, and gotchas. */
  tips: string[];
  /** 3–5 genuine questions and answers. */
  faqs: ToolFaq[];
}

const PRIVACY_NOTE =
  'Files are sent to the PDFbolt server only while the job runs and are removed after you download the result — they are not stored or shared.';

const BROWSER_PRIVACY_NOTE =
  'This tool runs entirely in your browser. Your PDF is never uploaded to a server, so the file never leaves your computer.';

export const TOOL_CONTENT: Record<string, ToolContent> = {
  merge: {
    metaDescription:
      'Combine several PDF files into one document online. Reorder pages before merging, keep the original quality, and download a single PDF.',
    tagline: 'Combine multiple PDFs into one tidy document.',
    intro: [
      'Merging PDFs is the quickest way to turn a pile of separate documents — contracts, scanned receipts, chapters, or exported reports — into a single file that is easy to email, print, or archive. Instead of attaching five PDFs to a message, you send one.',
      'PDFbolt merges files in the exact order you arrange them and keeps each page at its original resolution, so text stays selectable and images stay sharp. Nothing is re-compressed or flattened during a merge.',
    ],
    steps: [
      'Choose the PDF files you want to combine, or drag them onto the upload area.',
      'Drag the files in the list to set the order pages will appear in the final document.',
      'If any file is password protected, enter its password in the banner that appears.',
      'Click the merge button to combine them and download your single PDF.',
    ],
    tips: [
      'You can add at least two PDFs; there is no benefit to merging a single file.',
      'Page order follows the order of the list, top to bottom — rearrange before running the tool.',
      'Very large combined files may hit the per-request size limit shown under the upload area; compress first if needed.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Will merging reduce the quality of my PDFs?',
        a: 'No. Pages are copied as-is into the new document, so text remains selectable and images keep their original resolution.',
      },
      {
        q: 'Can I merge password-protected PDFs?',
        a: 'Yes, as long as you know the password. Enter it in the banner that appears after you add the file so the tool can read it.',
      },
      {
        q: 'Is there a limit to how many PDFs I can merge?',
        a: 'You can merge up to the per-request file count and total size shown under the upload area. For very large sets, merge in batches.',
      },
    ],
  },
  split: {
    metaDescription:
      'Split a PDF into separate files by page or page range online. Pull out single pages or chapters and download the pieces you need.',
    tagline: 'Break one PDF into separate files by page or range.',
    intro: [
      'Splitting a PDF lets you take one large document and carve out exactly the pages you need — a single signed page, one chapter, or a range you want to send on its own. It is the opposite of merging and just as common in everyday paperwork.',
      'You describe which pages or ranges to keep, and PDFbolt produces the resulting file (or files) without changing the content of the pages themselves.',
    ],
    steps: [
      'Select the PDF you want to split.',
      'Enter the page or range to extract — for example "1" for a single page, or "1-3, 5" for a set.',
      'If the PDF is protected, enter its password in the banner shown.',
      'Run the tool and download the split result.',
    ],
    tips: [
      'Use a single number (e.g. 4) for one page, or ranges with hyphens and commas (e.g. 1-2, 5).',
      'Page numbers are 1-based and refer to the document order, not any printed page labels.',
      'If you only need to remove a few pages rather than keep a range, the Remove pages tool may be simpler.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'How do I write a page range?',
        a: 'Use hyphens for ranges and commas to separate them. "1-3, 7" keeps pages 1, 2, 3 and 7.',
      },
      {
        q: 'Does splitting change the remaining pages?',
        a: 'No. The pages you keep are identical to the original — splitting only selects which pages end up in the output.',
      },
      {
        q: 'What if I enter a page number that does not exist?',
        a: 'The tool ignores out-of-range numbers and processes the valid ones; if nothing is valid you will see an error message.',
      },
    ],
  },
  'remove-pages': {
    metaDescription:
      'Delete specific pages from a PDF online. Remove blank, duplicate, or unwanted pages by number and download the cleaned-up document.',
    tagline: 'Delete unwanted pages from a PDF.',
    intro: [
      'Scanned documents often pick up blank pages, cover sheets, or duplicates you never wanted. Removing pages lets you delete those by number and keep everything else exactly as it was.',
      'You list the pages to drop, and PDFbolt returns a new PDF with the rest of the document untouched and renumbered automatically.',
    ],
    steps: [
      'Choose the PDF you want to clean up.',
      'In "Pages to remove", type the page numbers to delete — for example "2, 4".',
      'Enter a password if the PDF is protected.',
      'Run the tool and download the result.',
    ],
    tips: [
      'Separate multiple page numbers with commas, e.g. 1, 3, 8.',
      'Page numbers are 1-based and count document order.',
      'Removing pages cannot be undone in the downloaded file, so keep your original until you have checked the result.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Can I remove a range of pages at once?',
        a: 'List the individual numbers separated by commas. To keep a range instead, use the Split or Extract pages tool.',
      },
      {
        q: 'Will the remaining pages be renumbered?',
        a: 'Yes. After removal the surviving pages flow in their original order and are numbered consecutively.',
      },
    ],
  },
  'extract-pages': {
    metaDescription:
      'Extract selected pages from a PDF into a new file online. Save individual pages or ranges as a separate document in seconds.',
    tagline: 'Pull selected pages out into a new PDF.',
    intro: [
      'Extracting pages is for when you want to keep just part of a document — a single form, an invoice, or a few pages from a long report — as its own PDF. The original file stays intact; you simply get a copy of the pages you chose.',
      'It is ideal for sharing only the relevant section of a contract or manual without sending the whole thing.',
    ],
    steps: [
      'Select your source PDF.',
      'In "Pages to extract", enter the pages or ranges you want — for example "1, 3-5".',
      'Provide a password if the file is protected.',
      'Run the tool and download the extracted pages as a new PDF.',
    ],
    tips: [
      'Combine single pages and ranges freely, e.g. 1, 4-6, 9.',
      'The extracted pages keep their original layout, fonts, and quality.',
      'Use Split if you want to break a document into multiple separate files at once.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'What is the difference between Extract and Split?',
        a: 'Extract pulls a chosen set of pages into one new PDF; Split is geared toward breaking a document into separate pieces.',
      },
      {
        q: 'Does extracting change the original file?',
        a: 'No. Your uploaded file is untouched — the tool produces a new PDF containing only the pages you selected.',
      },
    ],
  },
  'organize-pdf': {
    metaDescription:
      'Reorder PDF pages online. Rearrange, move, and reverse pages by entering a new order, then download the reorganized document.',
    tagline: 'Rearrange the page order in a PDF.',
    intro: [
      'Sometimes pages end up in the wrong order — a scan goes in backwards, or an appendix needs to move to the front. Organizing a PDF lets you set a new page sequence without rebuilding the document.',
      'You type the page numbers in the order you want them, and PDFbolt reassembles the file to match.',
    ],
    steps: [
      'Choose the PDF to reorganize.',
      'In "New page order", list every page number in the order you want — for example "3, 2, 1" reverses a 3-page PDF.',
      'Enter a password if required.',
      'Run the tool and download the reordered PDF.',
    ],
    tips: [
      'Include each page number you want to keep; pages you leave out are dropped from the result.',
      'Reversing a document is as simple as listing the pages from last to first.',
      'Double-check the count — the order list should usually contain every page in the file.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'How do I reverse a PDF?',
        a: 'List the page numbers from highest to lowest, e.g. "5, 4, 3, 2, 1" for a five-page file.',
      },
      {
        q: 'What happens to pages I do not list?',
        a: 'Any page number you omit will not appear in the output, so include every page you want to keep.',
      },
    ],
  },
  'scan-to-pdf': {
    metaDescription:
      'Turn photos and scanned images into a single PDF online. Combine JPG, PNG, and more into one document in the order you choose.',
    tagline: 'Turn photos and scans into a single PDF.',
    intro: [
      'Phone photos of documents, receipts, or whiteboards are convenient to capture but awkward to share. Scan to PDF gathers those images into one clean PDF that opens the same on every device and prints in order.',
      'Add the images, arrange them, and download a single document — no scanner app required.',
    ],
    steps: [
      'Choose the photos or scanned images you want to include.',
      'Drag them into the order you want the pages to appear.',
      'Run the tool to build the PDF.',
      'Download your combined document.',
    ],
    tips: [
      'For the most readable result, crop and straighten photos before uploading.',
      'Good lighting and high-contrast images produce sharper pages.',
      'Each image becomes one page, in the order shown in the list.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Which image formats can I use?',
        a: 'Common formats such as JPG and PNG work well. See the upload area for the full list supported on the server.',
      },
      {
        q: 'Can I make the scanned text searchable?',
        a: 'Scan to PDF creates image pages. To make the text selectable, run OCR on the resulting PDF once that tool is available.',
      },
    ],
  },
  compress: {
    metaDescription:
      'Compress PDF files online to reduce size for email and uploads. Choose a compression level and keep good visual quality.',
    tagline: 'Shrink PDF file size while keeping it readable.',
    intro: [
      'Large PDFs are a nuisance: they bounce off email size limits, upload slowly, and fill storage. Compressing a PDF reduces its file size — mostly by optimizing images — so it stays easy to share while remaining clear enough to read and print.',
      'PDFbolt lets you pick how aggressively to compress, balancing smaller files against visual quality so you can match the result to how the document will be used.',
    ],
    steps: [
      'Select the PDF you want to compress.',
      'Pick a compression level — lighter levels preserve more detail, stronger levels make smaller files.',
      'Optionally keep the original metadata.',
      'Run the tool and download the smaller PDF.',
    ],
    tips: [
      'Image-heavy and scanned PDFs shrink the most; text-only files are already small and may change little.',
      'Use a lighter level for documents you will print, and a stronger level for screen-only sharing.',
      'Compare the downloaded size against the original before deleting your source file.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Why did my file barely get smaller?',
        a: 'PDFs that are mostly text are already compact, so there is little to remove. The biggest savings come from documents full of photos or scans.',
      },
      {
        q: 'Will compression blur my text?',
        a: 'No. Text stays crisp because it is vector-based; compression mainly reduces the size of embedded images.',
      },
      {
        q: 'Which level should I choose?',
        a: 'Start with the standard level. If the file is still too large, step up; if quality drops too much, step down.',
      },
    ],
  },
  'repair-pdf': {
    metaDescription:
      'Repair damaged or corrupt PDF files online. Rebuild a PDF that will not open and try to recover its pages and content.',
    tagline: 'Try to recover a damaged or unopenable PDF.',
    intro: [
      'A PDF can become unreadable after an interrupted download, a storage error, or an export that went wrong — your viewer may report the file is damaged or simply refuse to open it. Repairing the PDF attempts to rebuild its internal structure so the content becomes accessible again.',
      'Repair is a best-effort recovery: it can often restore files with minor structural damage, though severely corrupted documents may only be partially recoverable.',
    ],
    steps: [
      'Choose the PDF that will not open correctly.',
      'Run the repair tool.',
      'Download the rebuilt file and open it to check the result.',
    ],
    tips: [
      'Keep your original file — repair produces a new copy and never overwrites the source.',
      'If a file was never a valid PDF (for example renamed from another format), repair cannot convert it.',
      'Results depend on how much of the original data survived; some pages may be missing in badly damaged files.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Can every broken PDF be fixed?',
        a: 'No tool can guarantee full recovery. Files with light structural damage usually repair well; heavily corrupted files may recover only partially.',
      },
      {
        q: 'Will repair recover a forgotten password?',
        a: 'No. Repair fixes structure, not encryption. Use Unlock PDF if you know the password and need to remove it.',
      },
    ],
  },
  'ocr-pdf': {
    metaDescription:
      'OCR makes scanned PDFs searchable by recognizing text in images. Learn how OCR will work on PDFbolt for selectable, searchable documents.',
    tagline: 'Make scanned PDFs searchable with text recognition.',
    intro: [
      'A scanned page looks like text but is really a picture, so you cannot search, select, or copy from it. OCR (optical character recognition) reads the image, recognizes the letters, and adds a hidden, selectable text layer over the page.',
      'This tool is in progress on PDFbolt. When it goes live, it will turn image-only PDFs into fully searchable documents — which also improves the accuracy of converting scans to Word or Excel.',
    ],
    steps: [
      'Choose the scanned PDF you want to make searchable.',
      'Select the language of the document for the most accurate recognition.',
      'Run OCR to add a searchable text layer.',
      'Download the searchable PDF.',
    ],
    tips: [
      'OCR accuracy depends on scan quality — higher resolution and good contrast help a lot.',
      'Run OCR before converting a scanned PDF to Word or Excel for much better results.',
      'Documents with multiple languages may need the dominant language selected.',
    ],
    faqs: [
      {
        q: 'Is OCR available now?',
        a: 'It is in progress. The tool appears in the directory but cannot be run yet; check back or contact us if you need it soon.',
      },
      {
        q: 'Does OCR change how my document looks?',
        a: 'No. It adds an invisible text layer behind the existing page image, so the document looks identical but becomes searchable.',
      },
    ],
  },
  'images-to-pdf': {
    metaDescription:
      'Convert images to PDF online. Turn PNG, JPEG, HEIC, GIF, WebP, BMP, or TIFF files into one PDF in the order you choose.',
    tagline: 'Combine images into one PDF document.',
    intro: [
      'Converting images to PDF is the easiest way to package pictures — photos, screenshots, scanned forms, or design exports — into a single document that prints predictably and opens anywhere. Unlike loose image files, a PDF keeps everything in one ordered place.',
      'Add your images, arrange the page order, and PDFbolt assembles them into one PDF with each image on its own page.',
    ],
    steps: [
      'Choose the images you want to convert (PNG, JPEG, HEIC, GIF, WebP, BMP, or TIFF).',
      'Drag them into the order you want the pages to appear.',
      'Run the tool to build the PDF.',
      'Download the combined document.',
    ],
    tips: [
      'Each image becomes a single page in the order shown in the list.',
      'High-resolution images produce sharper pages but a larger file — compress afterward if needed.',
      'HEIC support depends on the server; convert to JPG first if a HEIC file is rejected.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'In what order will my images appear?',
        a: 'Pages follow the order of the list. Drag images up or down before running the tool to set the sequence.',
      },
      {
        q: 'Can I mix different image formats?',
        a: 'Yes. You can combine several supported formats in one PDF; each image still becomes one page.',
      },
    ],
  },
  'word-to-pdf': {
    metaDescription:
      'Convert Word documents to PDF online. Turn .doc and .docx files into a fixed, shareable PDF that looks the same everywhere.',
    tagline: 'Convert Word documents to PDF.',
    intro: [
      'Word files can shift their layout from one computer to another depending on installed fonts and software versions. Converting to PDF locks the formatting in place so the document looks identical for everyone who opens it — ideal for résumés, letters, and anything you are sending out for review or print.',
      'PDFbolt converts .doc and .docx files using the same engine as our other Office conversions, preserving text, fonts, and layout as closely as possible.',
    ],
    steps: [
      'Choose your Word file (.doc or .docx).',
      'Run the conversion.',
      'Download the resulting PDF and check the formatting.',
    ],
    tips: [
      'Embedded or common fonts convert best; very unusual fonts may be substituted.',
      'Complex layouts with text boxes and floating images usually convert well but are worth a quick review.',
      'To merge several converted documents, use the Merge tool afterward.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Will my formatting stay the same?',
        a: 'In most cases yes. Standard text, headings, tables, and images convert faithfully; check documents with heavy custom formatting.',
      },
      {
        q: 'Can I convert both .doc and .docx?',
        a: 'Yes, both the older .doc and the modern .docx formats are supported.',
      },
    ],
  },
  'powerpoint-to-pdf': {
    metaDescription:
      'Convert PowerPoint to PDF online. Turn .ppt and .pptx slides into a PDF that is easy to share, print, and view anywhere.',
    tagline: 'Convert PowerPoint slides to PDF.',
    intro: [
      'Sharing a slide deck as PDF means recipients can view it without PowerPoint, on any device, with the layout exactly as you designed it. It is the safest format for handouts, attachments, and printed copies.',
      'PDFbolt converts .ppt and .pptx files into a PDF with one slide per page, keeping text, images, and backgrounds intact.',
    ],
    steps: [
      'Choose your PowerPoint file (.ppt or .pptx).',
      'Run the conversion.',
      'Download the PDF, with each slide as a page.',
    ],
    tips: [
      'Animations and transitions are not preserved — PDF is a static format, so each slide becomes one page.',
      'Speaker notes are not included; the output shows the slides themselves.',
      'For handouts with multiple slides per sheet, arrange that in PowerPoint before converting.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Do animations carry over to the PDF?',
        a: 'No. PDF is static, so each slide is rendered once as a single page without animations or transitions.',
      },
      {
        q: 'Will my fonts and images look right?',
        a: 'Standard fonts and embedded images convert faithfully. Unusual fonts may be substituted, so review the result.',
      },
    ],
  },
  'excel-to-pdf': {
    metaDescription:
      'Convert Excel spreadsheets to PDF online. Turn .xls and .xlsx files into a clean, printable PDF that preserves your tables.',
    tagline: 'Convert Excel spreadsheets to PDF.',
    intro: [
      'Spreadsheets are easy to disturb — one accidental click can shift a column or change a formula. Converting to PDF freezes the data exactly as it is, producing a read-only document that is perfect for reports, invoices, and approvals.',
      'PDFbolt converts .xls and .xlsx files to PDF, keeping your tables, numbers, and formatting in a fixed layout.',
    ],
    steps: [
      'Choose your Excel file (.xls or .xlsx).',
      'Run the conversion.',
      'Download the resulting PDF.',
    ],
    tips: [
      'Wide sheets may split across pages; set a print area or page breaks in Excel first for the cleanest result.',
      'Formulas are converted to their displayed values — the PDF shows results, not live calculations.',
      'Check that no columns are cut off at the page edge after converting.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Why does my spreadsheet span several pages?',
        a: 'Wide or tall sheets do not fit one page. Adjust scaling, print area, or orientation in Excel before converting for tighter output.',
      },
      {
        q: 'Are my formulas preserved?',
        a: 'The PDF captures the calculated values as shown in the sheet; it does not keep live, editable formulas.',
      },
    ],
  },
  'html-to-pdf': {
    metaDescription:
      'Convert HTML to PDF online. Turn an HTML file or pasted markup into a clean, shareable PDF document in seconds.',
    tagline: 'Turn HTML markup or a file into a PDF.',
    intro: [
      'Converting HTML to PDF is handy for saving web content, invoices, receipts, or templated pages as a fixed document. Rather than printing a messy webpage, you get a clean PDF you can store or send.',
      'You can upload an HTML file or paste markup directly, and PDFbolt renders it to a PDF.',
    ],
    steps: [
      'Choose whether to upload an HTML file or paste markup.',
      'Provide your HTML content.',
      'Run the conversion.',
      'Download the rendered PDF.',
    ],
    tips: [
      'Inline or embedded styles render most reliably; external resources may not load during conversion.',
      'Reference images by absolute URLs or embed them so they appear in the output.',
      'Keep layouts reasonably simple for the most predictable pagination.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Can I paste HTML instead of uploading a file?',
        a: 'Yes. Switch the input mode to paste your markup directly, then run the conversion.',
      },
      {
        q: 'Why are some images or styles missing?',
        a: 'Resources loaded from external URLs may not be fetched during conversion. Embed images and CSS for the most reliable result.',
      },
    ],
  },
  'pdf-to-jpg': {
    metaDescription:
      'Convert PDF pages to JPG images online. Save each page as a high-quality JPG and choose the DPI for screen or print.',
    tagline: 'Save each PDF page as a JPG image.',
    intro: [
      'Turning PDF pages into JPG images is useful when you need pictures rather than a document — for slides, thumbnails, website graphics, or pasting a page into another app. Each page becomes its own image file.',
      'You choose the resolution (DPI), and PDFbolt renders every page to a JPG, delivered together so you can grab the ones you need.',
    ],
    steps: [
      'Choose the PDF you want to convert.',
      'Pick an image quality (DPI) — higher DPI for print, lower for smaller files.',
      'Run the tool.',
      'Download the resulting JPG images.',
    ],
    tips: [
      '96 DPI suits on-screen use; 300 DPI is better for printing.',
      'Higher DPI gives sharper images but noticeably larger files.',
      'Each page becomes a separate JPG, so a long PDF produces many images.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'What DPI should I choose?',
        a: 'Use 96–150 DPI for screens and email, and 300 DPI when the images will be printed.',
      },
      {
        q: 'Do I get one image or one per page?',
        a: 'You get one JPG per page, so you can keep only the pages you need.',
      },
    ],
  },
  'pdf-to-word': {
    metaDescription:
      'Convert PDF to Word (.docx) online. Turn text-based PDFs into editable Word documents you can revise, reformat, and reuse.',
    tagline: 'Convert a PDF into an editable Word document.',
    intro: [
      'When you need to edit a PDF that you only have as a finished document, converting it back to Word gives you an editable .docx you can rework — fix a typo, update figures, or reuse the text elsewhere.',
      'Conversion works best on PDFs that already contain real text. Scanned, image-only pages need OCR first, because there is no text for the converter to extract.',
    ],
    steps: [
      'Choose the PDF you want to convert.',
      'Run the conversion.',
      'Download the .docx file and open it in Word or a compatible editor.',
    ],
    tips: [
      'Simple, text-based PDFs convert most accurately; complex multi-column layouts may need cleanup.',
      'Scanned documents convert poorly until OCR adds a text layer.',
      'Always review the result — automated conversion is a strong starting point, not a perfect copy.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Why is my converted document messy?',
        a: 'Complex layouts, columns, and tables are hard to reproduce exactly. Expect to do some light reformatting after converting.',
      },
      {
        q: 'Can I convert a scanned PDF to Word?',
        a: 'Only after OCR. A scan is an image, so without recognized text there is nothing for the converter to turn into editable Word content.',
      },
    ],
  },
  'pdf-to-powerpoint': {
    metaDescription:
      'Convert PDF to PowerPoint (.pptx) online. Turn PDF pages into editable slides you can adjust and present.',
    tagline: 'Convert a PDF into editable PowerPoint slides.',
    intro: [
      'Converting a PDF to PowerPoint is useful when you have a deck that was exported or shared as PDF and you need to edit or re-present it. Each page becomes a slide you can adjust.',
      'As with other conversions, results are best when the PDF contains real text and a slide-like layout rather than dense documents or scans.',
    ],
    steps: [
      'Choose the PDF you want to convert.',
      'Run the conversion.',
      'Download the .pptx file and open it in PowerPoint or a compatible app.',
    ],
    tips: [
      'Decks that started as slides convert better than text-heavy documents.',
      'Expect to tidy up spacing and fonts after converting.',
      'Scanned pages need OCR first to become editable.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Will each PDF page become a slide?',
        a: 'Yes, the converter maps pages to slides so you can edit and present them individually.',
      },
      {
        q: 'Why do I need to fix formatting afterward?',
        a: 'PDFs do not store slide structure, so the converter reconstructs it — minor adjustments to layout and fonts are normal.',
      },
    ],
  },
  'pdf-to-excel': {
    metaDescription:
      'Convert PDF to Excel (.xlsx) online. Extract tables and data from a PDF into an editable spreadsheet for analysis.',
    tagline: 'Convert PDF tables into an editable spreadsheet.',
    intro: [
      'When financial statements, reports, or data tables arrive as PDFs, retyping them is slow and error-prone. Converting to Excel pulls the tabular content into a .xlsx file so you can sort, total, and analyze it.',
      'Conversion is most reliable on PDFs with clear, text-based tables. Heavily styled or scanned tables may need cleanup after converting.',
    ],
    steps: [
      'Choose the PDF you want to convert.',
      'Run the conversion.',
      'Download the .xlsx file and open it in Excel or a compatible app.',
    ],
    tips: [
      'Clean, gridded tables convert best; merged cells and unusual layouts may shift.',
      'Check numbers and column alignment after converting before relying on the data.',
      'Scanned tables require OCR first to be recognized as text.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Will my table structure be preserved?',
        a: 'Clear tables map well to rows and columns. Complex or merged-cell layouts may need adjustment after conversion.',
      },
      {
        q: 'Can it convert a scanned report?',
        a: 'Not directly. The data must be real text, so run OCR on a scanned PDF first.',
      },
    ],
  },
  'pdf-to-pdfa': {
    metaDescription:
      'Convert PDF to PDF/A online for long-term archiving. Produce an ISO-standard PDF/A document suitable for records and compliance.',
    tagline: 'Convert a PDF to archival PDF/A format.',
    intro: [
      'PDF/A is a version of PDF designed for long-term preservation: it embeds everything the file needs to display correctly years from now, which is why courts, governments, and archives often require it. Converting to PDF/A makes a document suitable for those records.',
      'PDFbolt lets you target common PDF/A levels. Because the standard is strict, some documents need adjustments to fully comply — the result message tells you how the conversion went.',
    ],
    steps: [
      'Choose the PDF you want to archive.',
      'Select the PDF/A level you need (for example PDF/A-1b, 2b, or 3b).',
      'Run the conversion.',
      'Download the PDF/A file and read the result message.',
    ],
    tips: [
      'PDF/A embeds fonts and color information, so archival files can be larger than the original.',
      'If strict validation does not fully pass, you may still get a usable file — check the message before relying on it.',
      'For legal or government submissions, verify the output against your specific requirement.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Which PDF/A level should I pick?',
        a: 'PDF/A-1b is the most widely accepted baseline. Choose 2b or 3b only if your archive specifically requires those features.',
      },
      {
        q: 'Why is my PDF/A file larger?',
        a: 'PDF/A embeds fonts and color profiles so the document is self-contained, which can increase the file size.',
      },
    ],
  },
  'pdf-to-dxf': {
    metaDescription:
      'Convert PDF to DXF (AutoCAD) online. Turn vector PDF drawings into editable DXF files — one per page — delivered in a zip.',
    tagline: 'Convert vector PDF drawings to AutoCAD DXF.',
    intro: [
      'CAD drawings are frequently shared as PDFs, but to edit them you need a real CAD format. Converting to DXF turns the vector geometry in a PDF — lines, polylines, and filled shapes — into an AutoCAD-compatible drawing you can open and modify.',
      'PDFbolt exports each PDF page as its own DXF file (R2010), measured in millimetres, and delivers them together in a zip so multi-page sets stay organized.',
    ],
    steps: [
      'Choose the vector PDF drawing you want to convert.',
      'Run the conversion.',
      'Download the zip and extract the DXF files (page_001.dxf, page_002.dxf, …).',
      'Open the DXF in AutoCAD or any compatible CAD application.',
    ],
    tips: [
      'This works on vector PDFs (true CAD exports). Scanned or raster drawings contain no vector geometry and will produce little or nothing.',
      'Each page becomes a separate DXF file inside the zip.',
      'Geometry is converted in millimetres; verify scale against your title block after opening.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Why is my DXF empty or nearly empty?',
        a: 'The source PDF was likely a scan or raster image rather than a vector drawing. Only vector geometry can be converted to DXF.',
      },
      {
        q: 'What DXF version is produced?',
        a: 'Files are exported as AutoCAD R2010 DXF, which opens in modern CAD software.',
      },
      {
        q: 'Why do I get a zip?',
        a: 'Each PDF page is exported as its own DXF, so the zip keeps multi-page drawings together in one download.',
      },
    ],
  },
  replace: {
    metaDescription:
      'Find and replace text in a PDF online. Edit words directly inside the document while keeping it a real, selectable PDF.',
    tagline: 'Find and replace text inside a PDF.',
    intro: [
      'Fixing a typo or updating a date in a PDF usually means going back to the source file — unless you can edit the text directly. Replace text searches the document for words you specify and swaps them for new ones, while the file stays a real, selectable PDF rather than a flattened image.',
      'You can set up several find-and-replace rules at once, control how matches are found, and choose whether to keep the original formatting.',
    ],
    steps: [
      'Choose one or more PDFs to edit (multiple files are processed with the same rules).',
      'Add one or more find/replace rules with the text to search for and its replacement.',
      'Pick a match mode (exact, case-insensitive, or whole word) and the scope of replacements.',
      'Run the tool and download the updated PDF, or a zip when you selected more than one file.',
    ],
    tips: [
      'Turn on same-length replacement when the new text must occupy the same space as the original.',
      'Use whole-word matching to avoid changing text inside larger words.',
      'Very complex PDFs may need small manual touch-ups after replacing.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Does this keep the PDF editable and selectable?',
        a: 'Yes. Replace edits the actual text, so the document remains a true PDF with selectable text, not a flat image.',
      },
      {
        q: 'Can I replace several different phrases at once?',
        a: 'Yes. Add multiple find/replace rules and they are all applied in a single run.',
      },
      {
        q: 'What is "same-length replacement"?',
        a: 'It keeps replacements the same character length as the original text, which helps preserve layout in tightly formatted documents.',
      },
    ],
  },
  'rotate-pdf': {
    metaDescription:
      'Rotate PDF pages online by 90, 180, or 270 degrees. Fix sideways or upside-down scans and download the corrected document.',
    tagline: 'Rotate pages to fix their orientation.',
    intro: [
      'Scans and photos often come out sideways or upside down, making a PDF awkward to read. Rotating pages turns them to the correct orientation so the document displays and prints the right way up.',
      'You can rotate every page or just the odd or even pages — handy when a double-sided scan flipped alternate sheets.',
    ],
    steps: [
      'Choose the PDF you want to rotate.',
      'Pick the rotation angle: 90°, 180°, or 270°.',
      'Choose whether to rotate all pages or only odd or even pages.',
      'Run the tool and download the corrected PDF.',
    ],
    tips: [
      'Use 180° for upside-down pages and 90°/270° for sideways scans.',
      'The odd/even filter fixes double-sided scans where every other page is rotated.',
      'Rotation is saved into the file, so it stays corrected wherever you open it.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Can I rotate only some pages?',
        a: 'Yes. Use the page filter to rotate all pages, or only the odd or even ones.',
      },
      {
        q: 'Is the rotation permanent in the file?',
        a: 'Yes. The new orientation is written into the downloaded PDF, so it displays correctly in any viewer.',
      },
    ],
  },
  'add-page-numbers': {
    metaDescription:
      'Add page numbers to a PDF online. Choose the format, size, and alignment, then download a numbered document.',
    tagline: 'Add page numbers to your PDF.',
    intro: [
      'Page numbers make long documents easier to navigate, reference, and print in order. Adding them to a PDF is far simpler than editing the source and re-exporting.',
      'You control the number format, font size, and alignment, so the numbering matches the look of your document.',
    ],
    steps: [
      'Choose the PDF you want to number.',
      'Set the template pattern, font size, and alignment.',
      'Run the tool.',
      'Download the numbered PDF.',
    ],
    tips: [
      'Pick left, center, or right alignment to suit your layout and binding.',
      'Choose a font size that is readable without overlapping existing content.',
      'Numbering is added on top of the page, so it does not disturb the underlying text.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Where do the page numbers appear?',
        a: 'They are placed according to the alignment you choose — left, center, or right — along the page edge.',
      },
      {
        q: 'Will numbering cover my content?',
        a: 'It is drawn near the margin, but on very full pages choose a smaller size or different alignment to avoid overlap.',
      },
    ],
  },
  'add-watermark': {
    metaDescription:
      'Add a text watermark to a PDF online. Set the text, size, angle, color, and opacity to mark documents as draft or confidential.',
    tagline: 'Stamp a text watermark across your pages.',
    intro: [
      'A watermark labels a document at a glance — "DRAFT", "CONFIDENTIAL", or your company name — and discourages unauthorized reuse. Adding one across every page is a quick way to mark status or ownership.',
      'You control the text, size, rotation, color, and transparency so the watermark is visible without hiding the content underneath.',
    ],
    steps: [
      'Choose the PDF you want to watermark.',
      'Enter the watermark text and set its size, angle, color, and opacity.',
      'Run the tool.',
      'Download the watermarked PDF.',
    ],
    tips: [
      'Lower opacity keeps the underlying text readable while the mark stays visible.',
      'A diagonal angle (around 45°) is the classic, hard-to-remove watermark look.',
      'Pick a color that contrasts with the page but does not overwhelm it.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Will the watermark hide my text?',
        a: 'Not if you keep the opacity low. The watermark sits over the page semi-transparently so content stays readable.',
      },
      {
        q: 'Can I watermark every page at once?',
        a: 'Yes. The watermark is applied across the pages of the document in a single run.',
      },
    ],
  },
  'crop-pdf': {
    metaDescription:
      'Crop PDF pages online. Trim margins or cut to a smaller area by setting precise margins, then download the cropped document.',
    tagline: 'Trim margins or crop pages to a smaller area.',
    intro: [
      'Cropping removes unwanted margins or focuses each page on a smaller region — useful for trimming scanner borders, removing whitespace, or fitting content to a specific size for printing.',
      'You set how much to trim from each edge in points, and PDFbolt applies the crop to the document.',
    ],
    steps: [
      'Choose the PDF you want to crop.',
      'Enter the amount to trim from the left, right, top, and bottom edges (in points).',
      'Run the tool.',
      'Download the cropped PDF.',
    ],
    tips: [
      'Measurements are in points — 72 points equal one inch.',
      'Start with small values and check the result, since over-cropping removes content.',
      'Cropping hides the trimmed area rather than deleting underlying data, so keep the original if you may need it back.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'What unit are the crop values?',
        a: 'Points. There are 72 points per inch, so 36 points trims half an inch from that edge.',
      },
      {
        q: 'Can I crop pages to different sizes?',
        a: 'The crop margins are applied across the document; for per-page sizing, crop sections separately.',
      },
    ],
  },
  'edit-pdf': {
    metaDescription:
      'Edit PDF document properties online. Update the title, author, subject, and creator metadata, then download the updated file.',
    tagline: 'Update a PDF\u2019s title, author, and other properties.',
    intro: [
      'Every PDF carries metadata — the title, author, subject, and creating application — that shows up in file managers, search results, and document libraries. Editing these fields keeps your documents accurate and organized.',
      'This tool updates the document properties without changing the visible content of the pages.',
    ],
    steps: [
      'Choose the PDF you want to edit.',
      'Update the title, author, subject, and creator fields as needed.',
      'Run the tool.',
      'Download the PDF with the new properties.',
    ],
    tips: [
      'A clear title helps the document show up correctly in libraries and search.',
      'Editing metadata does not alter the pages themselves — only the document information.',
      'Leave a field unchanged to keep its existing value.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Does editing properties change the page content?',
        a: 'No. This updates only the document information (title, author, etc.); the pages stay exactly as they were.',
      },
      {
        q: 'Where is this metadata visible?',
        a: 'In your PDF viewer\u2019s document properties, file managers, and sometimes search results.',
      },
    ],
  },
  'pdf-forms': {
    metaDescription:
      'Fill in PDF forms online or flatten form fields into the page. Complete fillable PDFs and download a finished document.',
    tagline: 'Fill in or flatten PDF form fields.',
    intro: [
      'Fillable PDF forms are convenient until you need to lock in the answers or share a clean copy. This tool lets you keep the editable fields or flatten them so the filled-in values become a permanent part of the page.',
      'Flattening is the safe way to finalize a form before sending it, since recipients can no longer change the entries.',
    ],
    steps: [
      'Choose the PDF form.',
      'Decide whether to flatten the fields into the page.',
      'Run the tool.',
      'Download the finished form.',
    ],
    tips: [
      'Flatten when you want a final, non-editable copy to send or archive.',
      'Leave fields editable if the recipient still needs to fill them in.',
      'Once flattened, the answers cannot be edited as form fields again.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'What does flattening a form do?',
        a: 'It merges the filled-in values into the page so they become regular content and can no longer be edited as form fields.',
      },
      {
        q: 'Should I flatten before emailing a form?',
        a: 'Usually yes, if you want to prevent further changes. Keep fields editable only when the recipient must complete them.',
      },
    ],
  },
  'unlock-pdf': {
    metaDescription:
      'Unlock a password-protected PDF online when you know the password. Remove open and printing restrictions and download an unrestricted file.',
    tagline: 'Remove password protection from a PDF you own.',
    intro: [
      'A password on a PDF is helpful until it becomes a hassle to open the file every time. If you know the password, unlocking removes that protection and any printing or copying restrictions, giving you a normal, unrestricted document.',
      'This tool is for files you have the right to access — it does not crack or bypass unknown passwords.',
    ],
    steps: [
      'Choose the protected PDF.',
      'Enter the password if the file requires one to open.',
      'Run the tool.',
      'Download the unlocked PDF.',
    ],
    tips: [
      'You must know the password — unlocking is not password recovery.',
      'It also clears restrictions on printing and copying where present.',
      'Only unlock documents you are authorized to use.',
      BROWSER_PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Can this recover a password I forgot?',
        a: 'No. You need the correct password. The tool removes protection from files you can already open, not ones you are locked out of.',
      },
      {
        q: 'Does it remove printing and copy restrictions too?',
        a: 'Yes, where those restrictions are present the unlocked file becomes unrestricted.',
      },
    ],
  },
  'protect-pdf': {
    metaDescription:
      'Password-protect a PDF online. Add encryption so only people with the password can open the document, then download it.',
    tagline: 'Add a password to protect your PDF.',
    intro: [
      'Sensitive documents — contracts, statements, medical or HR paperwork — should not be readable by anyone who happens to receive the file. Protecting a PDF with a password encrypts it so only people who know the password can open it.',
      'Set a strong password, and PDFbolt produces an encrypted copy you can share with confidence.',
    ],
    steps: [
      'Choose the PDF you want to protect.',
      'Enter the password that will be required to open it.',
      'Run the tool.',
      'Download the password-protected PDF.',
    ],
    tips: [
      'Use a strong, unique password and share it through a separate channel from the file.',
      'There is no way to recover the document if the password is lost, so store it safely.',
      'Protecting does not change the content — it only controls who can open the file.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'What happens if I lose the password?',
        a: 'The document cannot be opened without it, and it cannot be recovered. Keep the password somewhere safe.',
      },
      {
        q: 'How should I share the password?',
        a: 'Send it separately from the file — for example by message or phone — rather than in the same email as the PDF.',
      },
    ],
  },
  'sign-pdf': {
    metaDescription:
      'Sign a PDF online by drawing your signature directly on the page. Place a signature on one page or every page and download.',
    tagline: 'Draw and place your signature on a PDF.',
    intro: [
      'Printing a document just to sign and rescan it is slow and wasteful. Signing a PDF lets you draw your signature and drop it exactly where it belongs, right on the page, then download the signed file.',
      'You can sign a single page or repeat the same signature on every page — useful for initialling each sheet of an agreement.',
    ],
    steps: [
      'Choose the PDF you want to sign.',
      'Draw your signature directly on the page where it should appear.',
      'Choose whether to apply it to that page only or to every page.',
      'Run the tool and download the signed PDF.',
    ],
    tips: [
      'Draw in the signature line or an empty area; switch pages to sign in more than one place.',
      'Choose "every page" to repeat one signature across the whole document.',
      BROWSER_PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Is my document uploaded when I sign it?',
        a: 'No. Signing happens entirely in your browser, so the PDF never leaves your device.',
      },
      {
        q: 'Can I sign every page at once?',
        a: 'Yes. Draw your signature once and choose the option to place it on every page.',
      },
    ],
  },
  'redact-pdf': {
    metaDescription:
      'Redact a PDF online by covering sensitive areas with black boxes. Hide private information before sharing a document.',
    tagline: 'Cover sensitive areas with black redaction boxes.',
    intro: [
      'Before sharing a document publicly or in a filing, you often need to hide names, account numbers, or other private details. Redaction covers those areas with solid black boxes so the information is not visible.',
      'You draw boxes over the regions to hide, and the redaction is applied right in your browser for privacy.',
    ],
    steps: [
      'Choose the PDF you want to redact.',
      'Draw black boxes over each area you want to hide.',
      'Review every page to make sure nothing sensitive is missed.',
      'Download the redacted PDF.',
    ],
    tips: [
      'Check the whole document — sensitive data can appear in headers, footers, and later pages.',
      'Redaction here covers the area visually; for the highest-security needs, verify the output meets your requirements.',
      BROWSER_PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'Is my file uploaded to redact it?',
        a: 'No. Redaction runs in your browser, so the PDF stays on your device the whole time.',
      },
      {
        q: 'Can I add boxes on multiple pages?',
        a: 'Yes. Move through the pages and draw boxes wherever sensitive content appears.',
      },
    ],
  },
  'compare-pdf': {
    metaDescription:
      'Compare two PDFs online side by side. Spot differences in text and layout between two versions of a document.',
    tagline: 'See how two PDF versions differ.',
    intro: [
      'When you have two versions of a contract, report, or design, finding what changed by eye is tedious and error-prone. Comparing PDFs highlights the differences so you can review edits quickly and confidently.',
      'Load both files and PDFbolt shows them together, drawing attention to where the text and layout differ.',
    ],
    steps: [
      'Choose the first PDF (version A).',
      'Choose the second PDF (version B).',
      'Review the side-by-side comparison and the highlighted differences.',
    ],
    tips: [
      'Comparison works best on text-based PDFs; scanned pages have no text to diff.',
      'Use it to confirm what changed between drafts before approving a final version.',
      'Both files are read only to produce the comparison.',
      PRIVACY_NOTE,
    ],
    faqs: [
      {
        q: 'What kinds of differences does it show?',
        a: 'It highlights changes in text and layout between the two documents so you can see what was added, removed, or moved.',
      },
      {
        q: 'Can I compare two scanned PDFs?',
        a: 'Text comparison needs real text. Scanned, image-only pages would need OCR first to compare their content.',
      },
    ],
  },
};

export function getToolContent(toolId: string): ToolContent | null {
  const id = canonicalToolId(toolId);
  return TOOL_CONTENT[id] ?? null;
}

export function toolMetaDescription(toolId: string, fallback: string): string {
  return getToolContent(toolId)?.metaDescription ?? fallback;
}
