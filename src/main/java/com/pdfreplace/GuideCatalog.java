package com.pdfreplace;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Backend source of truth for long-form guide articles.
 *
 * <p>Provides per-article title, meta description, and crawler-visible summary
 * paragraphs used by the server-rendered SPA shell, the sitemap, and page meta.
 * Keep the slugs and copy aligned with {@code new-ui/src/guidesContent.ts}.
 */
final class GuideCatalog {

    record Guide(String slug, String title, String description, List<String> summary) {}

    private static final Map<String, Guide> BY_SLUG = build();

    private GuideCatalog() {}

    static List<Guide> all() {
        return List.copyOf(BY_SLUG.values());
    }

    static Guide bySlug(String slug) {
        if (slug == null) {
            return null;
        }
        return BY_SLUG.get(slug.trim().toLowerCase());
    }

    private static Map<String, Guide> build() {
        Map<String, Guide> g = new LinkedHashMap<>();

        g.put("merge-pdf-files", new Guide(
                "merge-pdf-files",
                "How to merge PDF files into one document",
                "Combine several PDFs into a single, well-ordered document without losing quality, and learn how"
                        + " to keep large merged files manageable.",
                List.of(
                        "Combining several PDFs into one file is one of the most common document tasks in any office or"
                        + " home. Whether you are assembling a job application from a CV, cover letter, and certificates,"
                        + " putting together an expense report from a dozen receipts, or stitching scanned contract pages"
                        + " into a single signed agreement, merging turns a scattered collection of files into one tidy"
                        + " document that is far easier to send, print, and store.",
                        "This guide explains exactly how merging works, how to control the order of the final document,"
                        + " what happens to quality, and how to keep a large merged file from becoming unwieldy.",
                        "Merging takes two or more PDF files and places their pages end to end inside a single new PDF."
                        + " The first file's pages come first, the second file's pages follow, and so on. Nothing inside"
                        + " the pages is changed: text stays selectable, images keep their resolution, and links and"
                        + " bookmarks are carried across. The result is one continuous document that behaves exactly as if"
                        + " it had been created that way from the start.",
                        "Because the pages are copied rather than rebuilt, merging is fast and lossless. A fifty-page"
                        + " merge takes only a moment, and the combined file is simply the sum of its parts. This is very"
                        + " different from converting or compressing, where the content is re-encoded; merging leaves every"
                        + " page untouched.",
                        "The single most important habit when merging is to arrange your files in the correct order"
                        + " before you combine them, because the final document follows the order of your file list"
                        + " exactly. If you add the cover letter after the CV in the list, the cover letter pages will"
                        + " appear after the CV pages in the result.",
                        "If you realise the order is wrong after merging, you do not have to start over. An organize or"
                        + " reorder tool lets you drag pages into the right sequence afterward, and a remove-pages tool"
                        + " lets you delete anything that slipped in by mistake. Still, ordering the list up front is the"
                        + " quickest path and avoids extra steps.",
                        "Since the combined file is the sum of every source document, merging many image-heavy PDFs can"
                        + " produce a large result. If the final file is too big to email or upload, run it through a"
                        + " compression tool afterward. Because most of the size in a merged document usually comes from"
                        + " scanned images, compression often shrinks it dramatically with no visible change on screen.",
                        "You can also trim before or after merging. Removing blank separator pages, duplicate cover"
                        + " sheets, or pages you no longer need keeps the document lean and professional. A little cleanup"
                        + " makes a noticeable difference in a long bundle.",
                        "Start by gathering every file you want to include in one place and renaming them with a number"
                        + " prefix if order matters \u2014 01-cover, 02-cv, 03-certificate \u2014 so they sort naturally. Add them to"
                        + " the merge tool in that order, combine, and then open the result to confirm the sequence is"
                        + " correct and nothing is missing.",
                        "Finally, if the merged file will be shared widely or stored long term, consider compressing it"
                        + " and giving it a clear, descriptive name. A file called Application-Packet-2026.pdf is far"
                        + " easier to find later than merged-final-v3.pdf.",
                        "The most frequent error is merging before checking the order, then having to redo the whole"
                        + " thing. Spend a moment arranging the list first; it is always faster than fixing the sequence"
                        + " afterward. The second most common mistake is forgetting that the file size adds up \u2014 people"
                        + " merge thirty scanned pages and are surprised when the result will not send by email. Compress"
                        + " afterward if the file is image-heavy.",
                        "Another pitfall is merging documents with mismatched page sizes, such as a mix of A4 and US"
                        + " Letter pages, which can look uneven when printed. If a consistent size matters, make sure your"
                        + " source files share the same dimensions before combining. Finally, always open and review the"
                        + " merged file before sending it \u2014 a quick scroll-through catches missing pages, wrong order, and"
                        + " accidental duplicates that would otherwise reach the recipient."
                )));

        g.put("split-pdf-into-separate-files", new Guide(
                "split-pdf-into-separate-files",
                "How to split a PDF into separate files",
                "Divide a large PDF into smaller documents by page or range, and learn when to split, when to"
                        + " extract, and how to keep your originals safe.",
                List.of(
                        "A single PDF can grow into an unwieldy monster \u2014 a 200-page scanned book, a combined statement"
                        + " covering a whole year, or a report that bundles several unrelated sections together. Splitting"
                        + " breaks that large file into smaller, more focused documents that are easier to share, file, and"
                        + " find later.",
                        "This guide covers how splitting works, the difference between splitting and extracting, and how"
                        + " to choose the right approach for common situations.",
                        "Splitting takes one PDF and produces several smaller PDFs from it. You decide where the cuts"
                        + " happen \u2014 for example, every page becomes its own file, or the document is divided at specific"
                        + " page numbers into logical chunks. Each resulting file is a complete, independent PDF containing"
                        + " only the pages you assigned to it.",
                        "Like merging, splitting copies pages as they are, so nothing is re-compressed or degraded. The"
                        + " pages in the smaller files look identical to the originals; they have simply been separated"
                        + " into different documents.",
                        "Splitting and extracting are closely related but solve slightly different problems. Splitting"
                        + " divides the whole document into multiple output files, which is ideal when you need every"
                        + " section as its own document \u2014 say, turning a combined twelve-month statement into twelve"
                        + " monthly files.",
                        "Extracting, by contrast, pulls out only the specific pages you want into a single new file and"
                        + " leaves the rest behind. Use extraction when you only need one part \u2014 a single signed page, one"
                        + " chapter, or a particular form \u2014 rather than dividing the entire document. Many people reach for"
                        + " split when extract would be quicker, so it is worth knowing both.",
                        "If your document has a natural structure \u2014 chapters, months, or sections \u2014 split at those"
                        + " boundaries so each file is self-contained and clearly named. If you simply need every page on"
                        + " its own, splitting page by page produces one file per page, which is useful when each page is a"
                        + " separate certificate, invoice, or form.",
                        "Before splitting, it helps to note the page numbers where each section begins. A quick look"
                        + " through the document with page numbers visible saves you from having to re-split because a cut"
                        + " landed in the wrong place.",
                        "Always keep the complete original document after splitting. The smaller files are convenient"
                        + " for sharing, but the full version is your master copy and the easiest thing to re-split if you"
                        + " need different sections later.",
                        "Give the split files clear names that reflect their contents \u2014 Statement-January.pdf rather"
                        + " than split-1.pdf \u2014 so they are easy to identify at a glance. A few seconds of naming now saves"
                        + " confusion later.",
                        "Understanding the typical use cases helps you split in the most useful way. Accountants and"
                        + " bookkeepers split combined annual statements into monthly files for easier reconciliation."
                        + " Students and researchers split long reference documents into individual chapters or articles."
                        + " Administrators split a batch of scanned forms \u2014 where each form is one or two pages \u2014 into"
                        + " separate files, one per person or per submission.",
                        "Businesses often split a master document so they can share only the relevant portion with each"
                        + " party: a contract bundle becomes individual agreements, and a combined invoice run becomes one"
                        + " file per customer. In every case the goal is the same \u2014 turn one large, hard-to-handle file"
                        + " into a set of focused documents that each serve a single clear purpose, making them easier to"
                        + " send, store, and find later."
                )));

        g.put("remove-pages-from-pdf", new Guide(
                "remove-pages-from-pdf",
                "How to remove pages from a PDF",
                "Delete unwanted, blank, or duplicate pages from a PDF cleanly, reduce file size, and produce a"
                        + " tidy document ready to share.",
                List.of(
                        "Not every page in a PDF earns its place. Scanned documents pick up blank backs and separator"
                        + " sheets, exported reports include cover pages you do not need, and downloaded files often carry"
                        + " advertising or instruction pages. Removing pages cleans up a document so that what you share"
                        + " contains only what matters.",
                        "This guide explains how to remove pages safely, how it affects file size, and how to avoid the"
                        + " common mistake of deleting the wrong page.",
                        "Removing pages does more than tidy a document \u2014 it makes it smaller, faster to open, and more"
                        + " professional to send. A report with three blank pages and a redundant cover sheet looks"
                        + " careless; the same report trimmed to its essential pages looks deliberate and polished.",
                        "Deleting pages also reduces file size, sometimes substantially if the removed pages contained"
                        + " large scanned images. This can be the quickest way to get a file under an email or upload limit"
                        + " without compressing anything.",
                        "The most important step is confirming exactly which pages you mean to delete. Page numbering is"
                        + " easy to get wrong \u2014 a document's printed page numbers may not match its actual position in the"
                        + " file, especially if it has a cover or front matter. Always work from the real page positions,"
                        + " counting from the first page of the file.",
                        "Before removing anything, scroll through the document and note the positions of every page you"
                        + " want gone. If you are removing a range, double-check both the first and last page of that range"
                        + " so you do not accidentally clip a page you meant to keep.",
                        "If you want to keep most of the document and drop a few pages, removing is the direct approach."
                        + " If instead you only want a small portion and would discard most of the document, extracting the"
                        + " pages you want is faster than removing everything else.",
                        "For documents where you need several separate pieces, splitting may suit better. Choosing the"
                        + " right operation saves effort: removing is for trimming, extracting is for keeping a small part,"
                        + " and splitting is for dividing the whole.",
                        "Keep the original file untouched and work on a copy, so that if you delete the wrong page you"
                        + " can simply start again. After removing, open the result and page through it to confirm the"
                        + " document still reads correctly and nothing essential was lost.",
                        "Once you are satisfied, give the trimmed file a clear name. If it is going to be sent or"
                        + " uploaded, this is also a good moment to compress it, since removing image-heavy pages plus"
                        + " compression can make a dramatic difference to the final size.",
                        "Certain pages turn up again and again as candidates for removal. Scanned documents often"
                        + " include blank reverse sides, separator sheets, and the occasional misfed page. Downloaded forms"
                        + " and reports frequently begin with instruction pages, marketing inserts, or cover sheets you do"
                        + " not need to keep. Exported files sometimes carry a trailing blank page or a redundant summary.",
                        "Bank and utility statements are a common example: people often want to keep only the pages"
                        + " showing the transactions that matter and drop the promotional inserts and terms-and-conditions"
                        + " pages that bulk out the file. Removing these not only tidies the document but can also strip"
                        + " out the heaviest pages, making the result smaller and quicker to share. The key is always to"
                        + " confirm a page is truly unwanted before deleting it, since the change is permanent in the"
                        + " output."
                )));

        g.put("extract-pages-from-pdf", new Guide(
                "extract-pages-from-pdf",
                "How to extract pages from a PDF",
                "Save specific pages from a PDF as a new document, share just what is needed, and keep the full"
                        + " file intact for your records.",
                List.of(
                        "Often you only need a small part of a larger PDF \u2014 a single signed page from a contract, one"
                        + " chapter of a manual, or a particular form buried in a long document. Extracting pulls exactly"
                        + " those pages into a new PDF while leaving the original whole, so you can share precisely what is"
                        + " needed and nothing more.",
                        "This guide explains how extraction works, when it is the right choice, and how it helps with"
                        + " both privacy and file size.",
                        "Extraction copies the pages you select into a brand-new PDF. The pages you choose appear in the"
                        + " new file in the order you specify, and the original document is left completely unchanged. It"
                        + " is the cleanest way to produce a focused document from a larger source without altering the"
                        + " source itself.",
                        "Because extraction copies pages directly, the extracted file keeps the exact quality of the"
                        + " originals. Text remains selectable and images keep their resolution \u2014 nothing is rebuilt or"
                        + " degraded.",
                        "Extraction shines when you want a small portion of a document and would otherwise be deleting"
                        + " almost everything. Pulling out pages 10 to 12 of a hundred-page report is far quicker than"
                        + " removing the other ninety-seven pages.",
                        "If you need the entire document divided into several files, splitting is the better tool. If"
                        + " you want to keep most of the document and only drop a few pages, removing is more direct."
                        + " Extraction is specifically for keeping a small, defined set of pages.",
                        "Extracting is a simple way to share only what someone needs to see. Instead of sending a full"
                        + " account statement when only one transaction page is relevant, you extract that page and share"
                        + " it alone. The rest of the document \u2014 and the private information it contains \u2014 never leaves"
                        + " your hands.",
                        "This is especially useful for sensitive documents. Combined with redaction for anything that"
                        + " must stay hidden on the page itself, extraction lets you control exactly what information you"
                        + " disclose.",
                        "Open the source document with page numbers visible and note the exact pages you need. Enter"
                        + " that range or set of pages into the extract tool, run it, and check that the new file contains"
                        + " precisely the pages you intended and reads correctly.",
                        "Name the extracted file clearly so its purpose is obvious \u2014 Signed-Page.pdf or Chapter-3.pdf \u2014"
                        + " and keep the full original safely stored. If you need a different selection later, you can"
                        + " extract again from the master copy at any time.",
                        "Extraction fits a wide range of everyday needs. You might pull a single signed signature page"
                        + " out of a long contract to return to the other party, lift one chapter from a textbook or manual"
                        + " to study on its own, or take just the relevant page from a multi-page bill to submit as proof"
                        + " of address. In each case you share exactly what is required and nothing more.",
                        "It is also a tidy way to build a new document from parts of a larger one. By extracting several"
                        + " specific ranges \u2014 an introduction here, a results section there \u2014 you can assemble a focused"
                        + " summary without disturbing the original. Combined with merging, extraction lets you reshape"
                        + " long documents into precisely the shorter pieces you and your readers actually need, which is"
                        + " faster and cleaner than copying and pasting content by hand."
                )));

        g.put("reorder-pdf-pages", new Guide(
                "reorder-pdf-pages",
                "How to reorder and organize pages in a PDF",
                "Rearrange pages into the right sequence, fix documents assembled out of order, and produce a"
                        + " logical, easy-to-read PDF.",
                List.of(
                        "A PDF whose pages are in the wrong order is confusing and looks unprofessional, yet it happens"
                        + " constantly \u2014 scans come out reversed, merged files end up jumbled, and exported documents place"
                        + " appendices before the content they support. Reorganizing lets you set the pages into the exact"
                        + " sequence you want.",
                        "This guide explains how reordering works, common situations where it is needed, and how to"
                        + " combine it with other tools for a clean final document.",
                        "Organizing a PDF lets you change the position of pages within the document. You move pages into"
                        + " a new sequence \u2014 bringing a misplaced page forward, sending an appendix to the back, or"
                        + " reversing a batch that scanned in the wrong direction \u2014 and save the result as a corrected"
                        + " file.",
                        "As with other page operations, reordering copies pages without re-rendering them, so quality is"
                        + " preserved. Only the sequence changes; the content of each page stays exactly as it was.",
                        "Double-sided documents scanned on a single-sided scanner often come out interleaved or"
                        + " reversed, with all the fronts followed by all the backs. Reordering puts them back into reading"
                        + " order. Merged files frequently need adjustment too, when the source files were combined in the"
                        + " wrong sequence.",
                        "Reports and submissions sometimes require a specific page order \u2014 a particular cover, then a"
                        + " summary, then the body, then appendices. Reordering lets you match that required structure"
                        + " exactly before submitting.",
                        "Reordering pairs naturally with other tools. After fixing the sequence, you might remove a"
                        + " duplicate page, rotate a page that scanned sideways, or add page numbers so the corrected order"
                        + " is clearly reflected. Doing these together produces a polished document in one pass.",
                        "If your document was assembled from several files in the wrong order, it is sometimes quicker"
                        + " to re-merge the source files in the correct sequence than to reorder page by page. Choose"
                        + " whichever approach involves fewer moves for your particular document.",
                        "Work from a copy and keep the original safe. Plan the target sequence before you start \u2014 know"
                        + " which page should end up where \u2014 so you are not guessing as you go. After reordering, read the"
                        + " document through from start to finish to confirm it now flows logically.",
                        "Once the order is correct, add page numbers if the document needs them, and give the file a"
                        + " clear name. A correctly ordered, numbered document reads professionally and leaves no doubt"
                        + " about the intended sequence.",
                        "Formal documents frequently come with a required page order, and getting it wrong can mean a"
                        + " submission is rejected or a reader gets lost. Grant applications, legal bundles, tender"
                        + " responses, and academic theses often specify an exact sequence: a particular cover sheet, then"
                        + " a contents page, then the body, then appendices in a set order. Reordering lets you assemble"
                        + " the pieces and then arrange them precisely to match that specification before you submit.",
                        "The same applies to reports built from several contributors. When different people supply"
                        + " different sections, the combined file rarely arrives in the right order. Rather than asking"
                        + " everyone to resend their parts, you can merge what you have and reorder the pages into the"
                        + " intended structure in one pass. A final read-through from first page to last confirms the"
                        + " document now tells its story in the right sequence, which is the difference between a polished"
                        + " deliverable and one that looks hastily assembled."
                )));

        g.put("scan-to-pdf", new Guide(
                "scan-to-pdf",
                "How to turn photos and scans into a PDF",
                "Combine phone photos or scanned images into a single, tidy PDF that is easy to email, file, and"
                        + " print.",
                List.of(
                        "Sometimes the document you need exists only as photos on your phone or a stack of scanned"
                        + " images \u2014 a signed form, a handwritten note, a receipt, or a few pages of a contract. Turning"
                        + " those loose images into one clean PDF makes them far easier to email, archive, and print than"
                        + " sending a dozen separate photo files.",
                        "This guide explains how to assemble images into a polished PDF, how to get the best image"
                        + " quality, and how to keep the resulting file a sensible size.",
                        "A single PDF is simply more professional and more practical than a folder of JPEGs. It keeps"
                        + " every page in order, opens the same way on any device, and prints as one job rather than image"
                        + " by image. When you email a PDF, the recipient sees a proper document instead of a confusing"
                        + " burst of photo attachments.",
                        "A PDF also travels better. Image files can be rotated unpredictably, displayed at odd sizes, or"
                        + " stripped of order by email clients. Wrapping them in a PDF locks the layout so what you send is"
                        + " exactly what the other person sees.",
                        "The quality of your PDF depends almost entirely on the quality of the photos that go into it."
                        + " Shoot in good, even light with no harsh shadows across the page, hold the camera parallel to"
                        + " the document so the page is not skewed, and fill the frame with the page so detail is not"
                        + " wasted on the background.",
                        "If you are photographing text you may later want to search or copy, keep the shot sharp and"
                        + " high contrast. A crisp, well-lit capture not only looks better as a PDF page but also"
                        + " recognises far more accurately if you later run OCR to make the text searchable.",
                        "When you add images, they become pages in the order you provide them, so arrange them in"
                        + " reading order before combining. If you photographed a multi-page document, name or sort the"
                        + " images by page number first so they fall into place naturally.",
                        "After creating the PDF, review it page by page. If a page came out sideways you can rotate it,"
                        + " if one is out of sequence you can reorder it, and if you accidentally included a blurry"
                        + " duplicate you can remove it. A minute of cleanup turns a rough capture into a tidy document.",
                        "Phone photos are large \u2014 several megabytes each \u2014 so a PDF made from many images can become"
                        + " surprisingly heavy. If the file is too big to email, compress it afterward. Because the size"
                        + " comes almost entirely from the images, compression usually shrinks it dramatically with no"
                        + " visible difference on screen.",
                        "If the document is purely text and you do not need full photographic detail, a stronger"
                        + " compression level is perfectly safe and produces a much smaller file. Keep the original images"
                        + " if you might need the full-resolution version later.",
                        "A PDF of photos is only an image until you add a text layer. If you want to search the"
                        + " document, copy text from it, or convert it to Word later, run OCR on the finished PDF. This"
                        + " recognises the characters in your photos and adds invisible, selectable text, turning a picture"
                        + " of a page into a working document.",
                        "For anyone digitising paperwork \u2014 receipts for expenses, old letters, forms, or notes \u2014 the"
                        + " combination of capturing clean images, assembling them into one PDF, compressing sensibly, and"
                        + " adding OCR produces an archive that is compact, searchable, and easy to share for years to"
                        + " come."
                )));

        g.put("repair-a-damaged-pdf", new Guide(
                "repair-a-damaged-pdf",
                "How to repair a damaged or corrupted PDF",
                "Understand why PDFs become corrupted, what repair can and cannot recover, and how to rescue a"
                        + " file that will not open.",
                List.of(
                        "Few things are as stressful as double-clicking an important PDF and getting an error instead of"
                        + " your document \u2014 \u201cfile is damaged and could not be repaired,\u201d or a blank window where your pages"
                        + " should be. A corrupted PDF is not always lost, though, and repair can often rescue a file that"
                        + " refuses to open.",
                        "This guide explains how PDFs become corrupted, what a repair tool actually does, and how to"
                        + " give yourself the best chance of recovering the content.",
                        "A PDF is a structured file with an internal table that tells viewers where each page and object"
                        + " lives. Corruption usually means that structure has been damaged \u2014 the index points to the wrong"
                        + " place, part of the file is missing, or bytes were scrambled. The page content may still be"
                        + " intact; the map to it is simply broken.",
                        "Common causes include an interrupted download, a file that was only partly copied from a USB"
                        + " drive or network share, a crash while the document was being saved, or email and storage"
                        + " systems that subtly altered the file in transit. In many of these cases most of the data"
                        + " survives, which is exactly why repair is worth trying.",
                        "A repair tool reads through the file, ignores the broken internal index, and rebuilds the"
                        + " document structure from the page content it can still find. In effect it reconstructs a valid"
                        + " PDF around the surviving data so that viewers can open it again.",
                        "Repair is not magic, however. It can only recover content that is actually present in the file."
                        + " If a download stopped halfway and the second half of the document never arrived, repair can"
                        + " rescue the pages that made it but cannot invent the ones that did not. The more of the original"
                        + " file you have, the more repair can recover.",
                        "Start from the most complete copy of the file you have. If the problem was a failed download,"
                        + " download it again fully before trying anything else \u2014 a complete file may simply open normally."
                        + " If the file came from email or a messaging app that may have altered it, ask the sender to"
                        + " share it again through a different channel such as a cloud link.",
                        "Always work on a copy and keep the damaged original. Repair attempts can have different"
                        + " outcomes, and you want to be able to try more than once without overwriting the only version"
                        + " you have.",
                        "If a file is severely truncated, encrypted with a key you do not have, or was never a valid PDF"
                        + " in the first place \u2014 for example a different file type that was simply renamed with a .pdf"
                        + " extension \u2014 repair will not be able to produce a working document. In those cases the better"
                        + " path is to obtain a fresh copy from the original source.",
                        "It also helps to recognise the difference between a damaged file and a password-protected one."
                        + " A file that asks for a password is not corrupted; it just needs unlocking with the correct"
                        + " password. Repair is for files whose structure is genuinely broken.",
                        "Most corruption is preventable with a few habits. Let downloads finish completely before"
                        + " opening or moving them, eject USB drives properly rather than pulling them out mid-copy, and"
                        + " keep important documents backed up so a single damaged copy is never a disaster.",
                        "When sharing critical PDFs, prefer a cloud link or a tool that preserves the file exactly over"
                        + " channels that may re-encode attachments. And once you have repaired a file successfully, save a"
                        + " fresh, clean copy immediately so you are not relying on the recovered version remaining stable."
                )));

        g.put("images-to-pdf", new Guide(
                "images-to-pdf",
                "How to convert images to a PDF",
                "Turn PNG, JPEG, HEIC, and other images into a single PDF, with tips on order, quality, and file"
                        + " size.",
                List.of(
                        "Images and PDFs serve different purposes. An image is great for a single picture, but when you"
                        + " have several related images \u2014 photos of a document, a set of design mockups, scanned receipts,"
                        + " or screenshots \u2014 a PDF binds them into one ordered, shareable file that looks far more"
                        + " professional than a pile of loose pictures.",
                        "This guide explains how to convert images to PDF, which formats are supported, and how to"
                        + " control order, quality, and size.",
                        "A PDF keeps multiple images together in a fixed order and a consistent layout. It opens"
                        + " identically on any device, prints as a single job, and attaches to an email as one tidy file"
                        + " rather than many. For anything you need to present as a document \u2014 rather than as individual"
                        + " pictures \u2014 a PDF is the right container.",
                        "PDFs also avoid the quirks of image files: photos that rotate unexpectedly, formats a"
                        + " recipient's device cannot open, or images that arrive in a jumbled order. Wrapping them in a"
                        + " PDF locks everything in place.",
                        "Common formats convert directly, including JPEG and PNG \u2014 the two you will meet most often \u2014"
                        + " along with HEIC from modern iPhones, plus GIF, WebP, BMP, and TIFF. This covers virtually every"
                        + " image you are likely to have from a phone, camera, screenshot, or download.",
                        "If you have an unusual format, converting it to JPEG or PNG first will always work. For most"
                        + " people, though, the images straight off a phone or computer convert without any preparation.",
                        "Images become pages in the order you add them, so arrange them in the sequence you want before"
                        + " converting. If they represent numbered pages, sorting the files by name first keeps everything"
                        + " in order automatically.",
                        "After converting, check orientation. A photo taken in portrait or landscape should appear the"
                        + " right way up; if any page is sideways, a rotate tool fixes it in seconds. Reviewing the"
                        + " finished PDF once catches orientation and order problems before you share it.",
                        "Photos are large, so a PDF built from many high-resolution images can become heavy. If you need"
                        + " full detail \u2014 for printing artwork or design proofs \u2014 keep the quality high and accept the"
                        + " larger size. If the document is for reading or emailing, compressing it afterward trims the"
                        + " size substantially with no visible difference on screen.",
                        "There is a balance to strike: enough resolution that the images look crisp, but not so much"
                        + " that the file is impractical to send. For everyday documents, a compressed PDF is almost always"
                        + " the right choice.",
                        "An image-based PDF is, at heart, still pictures \u2014 you cannot search or select the text inside"
                        + " it. If the images contain text you want to use, run OCR on the finished PDF to add a"
                        + " searchable, selectable text layer behind the images.",
                        "This step is what separates a simple photo album from a genuinely useful document. A receipt"
                        + " PDF with OCR can be searched by amount or vendor; a scanned letter with OCR can be copied and"
                        + " quoted. For archives, it is well worth the extra moment."
                )));

        g.put("word-to-pdf", new Guide(
                "word-to-pdf",
                "How to convert Word documents to PDF",
                "Turn .doc and .docx files into PDFs that look the same on every device, with reliable"
                        + " formatting and fonts.",
                List.of(
                        "Word is excellent for writing, but it is a poor format for sharing a finished document. A .docx"
                        + " file can look different on someone else's computer, shift its layout if they lack your fonts,"
                        + " or be edited by accident. Converting to PDF freezes the document exactly as you designed it, so"
                        + " everyone sees the same thing.",
                        "This guide explains why converting Word to PDF matters, what to check before converting, and"
                        + " how to get a clean, faithful result.",
                        "A PDF preserves your layout, fonts, images, and spacing precisely, regardless of the device or"
                        + " software used to open it. The CV you spent an hour formatting will arrive looking the way you"
                        + " intended rather than reflowing on the recipient's screen. This reliability is why PDFs are the"
                        + " standard for sending finished documents \u2014 applications, invoices, reports, and contracts.",
                        "PDFs also discourage casual editing. While they are not uneditable, they signal that the"
                        + " document is final, which is exactly what you want when sending something official. The"
                        + " recipient reads and prints it rather than altering it.",
                        "Because conversion captures the document exactly as it currently looks, finish your editing"
                        + " first. Proofread, set your final fonts and spacing, and confirm images are placed correctly."
                        + " Whatever is on the page when you convert is what the PDF will contain \u2014 there is no separate"
                        + " formatting pass afterward.",
                        "Pay particular attention to fonts. If you used an unusual font, the conversion embeds it so it"
                        + " displays correctly everywhere, but it is still worth confirming the document looks right after"
                        + " converting, especially around headings and special characters.",
                        "A good conversion reproduces your Word document page for page: the same margins, the same page"
                        + " breaks, the same headers and footers. After converting, open the PDF and compare it against the"
                        + " original to make sure nothing shifted \u2014 occasionally a complex layout with text boxes or tables"
                        + " needs a small adjustment in Word before it converts cleanly.",
                        "If your document has a table of contents, internal links, or bookmarks, check that they carried"
                        + " across. Most convert correctly, and they make a long PDF much easier to navigate.",
                        "The most common surprise is a layout that looked fine in Word but breaks slightly in the PDF,"
                        + " usually because of an element that was positioned loosely \u2014 a floating image or a manually"
                        + " spaced table. Tidying these in Word before converting produces a cleaner PDF.",
                        "Another is file size: a Word document full of high-resolution images becomes a large PDF. If"
                        + " the result is too big to email, compress it afterward, which shrinks the embedded images"
                        + " without touching the text.",
                        "Once you have your PDF, you can do things that are awkward in Word \u2014 merge it with other PDFs"
                        + " into a single packet, add a password to protect it, place a signature on it, or add a watermark"
                        + " such as DRAFT or CONFIDENTIAL. The PDF becomes the master version you share and store.",
                        "Keep the editable Word file too. The PDF is for distribution, but if you need to make changes"
                        + " later, editing the original Word document and re-converting is far easier than trying to edit"
                        + " the PDF directly."
                )));

        g.put("powerpoint-to-pdf", new Guide(
                "powerpoint-to-pdf",
                "How to convert PowerPoint to PDF",
                "Turn .ppt and .pptx slide decks into PDFs that share cleanly, print reliably, and keep your"
                        + " design intact.",
                List.of(
                        "A PowerPoint deck is built for presenting, but it is awkward to share. The recipient may not"
                        + " have PowerPoint, your fonts and animations may not survive on their machine, and a .pptx file"
                        + " invites accidental edits. Converting to PDF turns your slides into a clean, fixed document that"
                        + " anyone can open and print exactly as designed.",
                        "This guide explains when to convert a deck to PDF, how slides translate to pages, and how to"
                        + " get the best result.",
                        "A PDF of your deck opens on any device without PowerPoint, preserves your fonts and layout, and"
                        + " prints predictably. It is the ideal format for sharing slides as handouts, attaching them to an"
                        + " email, posting them for download, or submitting them where a fixed document is required.",
                        "Because a PDF cannot run animations or transitions, it represents the final, static state of"
                        + " each slide. That is usually what you want for sharing \u2014 a reader is looking at the content, not"
                        + " watching the show \u2014 but it is worth keeping in mind if your slides rely heavily on builds.",
                        "Each slide becomes one page in the PDF, in the same order as your deck. A twenty-slide"
                        + " presentation produces a twenty-page PDF. The page size matches your slide dimensions, so a"
                        + " widescreen 16:9 deck produces wide pages and a 4:3 deck produces more square ones.",
                        "Anything that is visible on the slide at its final state is captured. If a slide uses animation"
                        + " to reveal points one at a time, the PDF shows the slide with everything revealed, since it"
                        + " captures the end state rather than the sequence.",
                        "Before converting, view your deck in its finished form and check each slide looks right."
                        + " Confirm that text fits within its boxes, images are placed correctly, and nothing overflows the"
                        + " slide edge. The PDF will faithfully reproduce whatever is there, including mistakes, so a final"
                        + " review pays off.",
                        "If your deck includes speaker notes you do not want shared, make sure you are converting the"
                        + " slides rather than the notes pages. The goal is usually a clean set of slide pages for the"
                        + " audience.",
                        "Image-rich decks \u2014 full-bleed photos, detailed charts, embedded logos \u2014 produce larger PDFs. If"
                        + " the file is too big to email or upload, compress it afterward to re-encode the images at a"
                        + " sensible resolution while keeping the slides crisp on screen.",
                        "For decks meant to be printed as handouts, keep quality higher so charts and small text stay"
                        + " legible on paper. For decks shared purely on screen, a compressed version is lighter and"
                        + " perfectly clear.",
                        "Once your deck is a PDF you can combine it with other documents \u2014 attaching an agenda or"
                        + " appendix by merging \u2014 add page numbers for a professional handout, or protect it with a"
                        + " password if the content is confidential. The PDF becomes the version you distribute.",
                        "Keep the original PowerPoint file for future edits. When you need to update the deck, change"
                        + " the slides and re-convert rather than trying to edit the PDF, which is not designed for"
                        + " reworking slide layouts."
                )));

        g.put("excel-to-pdf", new Guide(
                "excel-to-pdf",
                "How to convert Excel spreadsheets to PDF",
                "Turn .xls and .xlsx spreadsheets into clean PDFs that print correctly and share without"
                        + " breaking your layout.",
                List.of(
                        "Sharing a spreadsheet as an Excel file invites trouble: columns shift, formulas can be changed,"
                        + " and the recipient sees a working sheet rather than a finished report. Converting to PDF freezes"
                        + " your data into a clean, fixed document that prints and shares exactly as you intend.",
                        "This guide explains how to convert Excel to PDF well, since spreadsheets need a little more"
                        + " care than other documents to come out looking right.",
                        "A PDF presents your data as a polished report rather than an editable grid. Numbers stay put,"
                        + " formulas are hidden behind their results, and the recipient cannot accidentally alter a cell."
                        + " For sharing financial summaries, schedules, price lists, or any finished spreadsheet, PDF is"
                        + " the safe, professional choice.",
                        "It also guarantees consistent appearance. A spreadsheet can render differently across versions"
                        + " of Excel or other software; a PDF looks identical everywhere, so the report you send is the"
                        + " report they see.",
                        "Spreadsheets are different from documents because they have no fixed page boundaries \u2014 a sheet"
                        + " can be hundreds of columns wide and thousands of rows tall. The main task in converting to PDF"
                        + " is deciding how that potentially enormous grid is divided into printable pages, and this is"
                        + " where most layout problems come from.",
                        "Without preparation, a wide sheet can split awkwardly, scattering columns across many pages so"
                        + " the report becomes impossible to read. A little setup before converting avoids this entirely.",
                        "Before converting, set your print area to just the data you want, and use Excel's page layout"
                        + " options to fit columns sensibly \u2014 scaling the sheet to fit within a page width is often the"
                        + " single most useful setting. Decide on orientation too: wide tables usually look best in"
                        + " landscape.",
                        "It also helps to repeat header rows so column titles appear on every page, and to check that no"
                        + " single column is so wide it forces an awkward break. Spending a moment in Excel's print preview"
                        + " shows you exactly how the pages will divide before you convert.",
                        "After converting, open the PDF and check that the data is grouped logically, headers are"
                        + " present where needed, and nothing important was cut off at a page edge. If the layout split"
                        + " badly, adjust the print area or scaling in Excel and convert again \u2014 it is quicker than trying"
                        + " to fix the PDF.",
                        "For reports that combine several sheets, decide whether you want them all in one PDF or"
                        + " separate files. Converting a whole workbook produces a multi-section document; converting one"
                        + " sheet at a time gives you more control over each.",
                        "Once your spreadsheet is a PDF you can merge it with a cover page or written report, protect it"
                        + " with a password if it contains sensitive figures, or add page numbers for a professional"
                        + " multi-page document. The PDF becomes the shareable version of your data.",
                        "Keep the original Excel file for updates. When the numbers change, edit the spreadsheet and"
                        + " re-convert rather than trying to alter the PDF, which holds only the static results and not"
                        + " your formulas."
                )));

        g.put("html-to-pdf", new Guide(
                "html-to-pdf",
                "How to convert HTML to PDF",
                "Turn an HTML file or pasted markup into a clean PDF, useful for saving web content, invoices,"
                        + " and reports.",
                List.of(
                        "HTML is the language of the web, but a web page is a living thing \u2014 it can change, disappear,"
                        + " or look different depending on the browser. Converting HTML to PDF captures a fixed snapshot"
                        + " you can save, share, and print, which is invaluable for archiving content, generating invoices,"
                        + " or turning a web-based report into a document.",
                        "This guide explains when HTML-to-PDF conversion is useful, how it works, and how to get a clean"
                        + " result from your markup.",
                        "Converting HTML to PDF suits several common needs. You might want to archive a web page or"
                        + " article as it exists today, preserve an online receipt or confirmation, turn an HTML email into"
                        + " a document, or generate a printable report from markup your own system produces. In each case"
                        + " you are freezing dynamic web content into a stable file.",
                        "It is also handy for developers and small businesses that build documents \u2014 invoices,"
                        + " statements, certificates \u2014 as HTML templates and want to hand them to customers as PDFs."
                        + " Writing the layout in familiar HTML and converting to PDF is often simpler than building"
                        + " documents another way.",
                        "You can convert in two ways: by uploading an .html file, or by pasting the markup directly."
                        + " Uploading a file is convenient when you have a complete page saved to disk. Pasting markup is"
                        + " quicker for a snippet, a template, or content you have generated on the fly.",
                        "Either way, the converter renders the HTML much as a browser would and lays it out across PDF"
                        + " pages. The closer your markup is to a clean, self-contained page, the more predictable the"
                        + " result.",
                        "HTML that relies on many external resources \u2014 remote stylesheets, web fonts, and images hosted"
                        + " elsewhere \u2014 may render differently from how it appears in your browser, since those resources"
                        + " are not always available during conversion. For the most faithful output, keep styling inline"
                        + " or self-contained and avoid depending on scripts to build the layout.",
                        "Print-oriented CSS helps a great deal. Defining sensible page margins and using styles intended"
                        + " for printing produces a tidier PDF than relying on the on-screen web layout, which is designed"
                        + " for scrolling rather than paged output.",
                        "Because a web page has no natural page boundaries, content is divided into PDF pages"
                        + " automatically. Long tables or sections can break across pages, so after converting, check that"
                        + " nothing important was split awkwardly. Adjusting your markup \u2014 keeping related content together"
                        + " \u2014 improves how it paginates.",
                        "If precise control over page breaks matters, print-specific CSS rules let you suggest where"
                        + " breaks should and should not happen, giving you a cleaner, more deliberate document.",
                        "Once you have your PDF you can treat it like any other document: merge several converted pages"
                        + " into one report, add a password if it contains private data, or compress it if it includes"
                        + " large images. An HTML invoice converted to PDF can be combined with a cover letter and sent as"
                        + " a single professional file.",
                        "If you generate documents regularly from templates, settling on a clean, self-contained HTML"
                        + " layout once means every future conversion comes out consistent, saving you repeated"
                        + " adjustments."
                )));

        g.put("compress-pdf-for-email", new Guide(
                "compress-pdf-for-email",
                "How to compress a PDF without losing quality",
                "Shrink large PDFs for email and uploads, understand why files get big, and choose a compression"
                        + " level that keeps quality.",
                List.of(
                        "A PDF that is too large to email or that an upload form rejects is one of the most common"
                        + " document frustrations. The good news is that most oversized PDFs can be made dramatically"
                        + " smaller in seconds, and usually without any visible loss of quality once you understand what is"
                        + " making them heavy.",
                        "This guide explains why PDFs grow so large, how compression actually works, and how to choose"
                        + " the right balance between file size and quality for your specific purpose.",
                        "The size of a PDF almost always comes from images, not text. Text and vector graphics are"
                        + " stored as compact instructions \u2014 a hundred pages of pure text can be just a megabyte or two."
                        + " Images are different: scanned pages, photographs, screenshots, and high-resolution logos carry"
                        + " enormous amounts of data.",
                        "Scanners are a frequent culprit. A single colour page scanned at high resolution can be several"
                        + " megabytes on its own, so a twenty-page scanned contract can easily exceed fifty megabytes."
                        + " Duplicated images, embedded fonts, and leftover editing data add a little more on top.",
                        "Compressing a PDF mainly re-encodes its images. The compressor resamples pictures to a sensible"
                        + " resolution for the document's purpose and stores them using more efficient image compression,"
                        + " discarding fine detail that the eye cannot perceive on a normal screen.",
                        "Because the text in a PDF is vector-based, it stays perfectly crisp no matter how much you"
                        + " compress \u2014 only the images change. This is why an image-heavy scan can shrink by eighty percent"
                        + " or more while a text-only report barely changes. If your file is already small and mostly text,"
                        + " compression has little to remove, which is completely normal.",
                        "Match the level to how the file will be used. A stronger level produces the smallest file and"
                        + " is effectively invisible on screen, which is ideal for email attachments and web uploads where"
                        + " size limits bite. A lighter level keeps more detail and is the safer choice when the document"
                        + " will be printed, where fine lines and small text matter more.",
                        "When you are unsure, a balanced setting handles the vast majority of everyday documents well."
                        + " It is worth opening the compressed file to confirm it still looks right for your needs before"
                        + " sending it, particularly if the document contains detailed charts or small print.",
                        "Compression is not the only lever. If you only need part of a document, extracting the relevant"
                        + " pages or removing blank and duplicate pages reduces the size before you compress at all."
                        + " Combining these steps \u2014 trimming unnecessary pages first, then compressing \u2014 often produces a"
                        + " file a fraction of the original size that still looks clean.",
                        "For documents you are scanning yourself, capturing at a sensible resolution rather than the"
                        + " maximum available keeps files manageable from the start. There is rarely a need to scan"
                        + " everyday paperwork at the highest possible quality.",
                        "Compression discards data permanently, so while the smaller file is perfect for sharing, you"
                        + " should keep the original full-quality version for your records. If you later need to print the"
                        + " document at high quality or extract a detailed image, you will be glad to have the uncompressed"
                        + " source.",
                        "A practical routine is to compress only the copies you send and archive the originals"
                        + " untouched. That way every recipient gets a light, fast file while you retain the option to"
                        + " produce a high-quality version whenever it is needed."
                )));

        g.put("ocr-make-pdf-searchable", new Guide(
                "ocr-make-pdf-searchable",
                "How to make a scanned PDF searchable with OCR",
                "Learn what OCR is, why scanned PDFs cannot be searched, and how recognising text turns an image"
                        + " into a usable document.",
                List.of(
                        "If you have ever tried to search a scanned document for a word and found nothing, or copied"
                        + " text from a scan only to get an empty clipboard, you have met the difference between an image"
                        + " and real text. Understanding that difference is the key to turning a useless scan into a fully"
                        + " searchable, professional document.",
                        "This guide explains what OCR is, why scanned PDFs behave the way they do, and how to get the"
                        + " most accurate results when recognising text.",
                        "When you scan or photograph a page, the result is an image \u2014 a grid of coloured dots that, to a"
                        + " human eye, clearly forms letters and words. To a computer, however, it is just a picture. There"
                        + " is no text data inside it whatsoever.",
                        "This is exactly why you cannot search a plain scan, select words in it, or reliably convert it"
                        + " to Word. It is also the single most common reason a PDF-to-Word conversion comes out completely"
                        + " empty: there was never any text for the converter to find in the first place.",
                        "OCR, which stands for optical character recognition, bridges this gap. An OCR engine analyses"
                        + " the image, recognises the shapes of individual characters and words, and then adds an invisible"
                        + " layer of real, selectable text on top of the original picture.",
                        "The page looks exactly the same to you, but underneath it now carries genuine text data. From"
                        + " that moment the document behaves like any born-digital PDF \u2014 you can search it, highlight and"
                        + " copy passages, and convert it accurately to other formats. The original image is preserved, so"
                        + " the visual appearance never changes.",
                        "OCR quality depends heavily on the quality of the input, and a little care at the scanning"
                        + " stage pays off enormously. Scan at around 300 DPI for crisp character shapes, keep the page"
                        + " straight rather than skewed, and make sure it is evenly lit without heavy shadows.",
                        "Clean, high-contrast black text on a white background recognises far more accurately than a"
                        + " faint, crooked, or low-resolution capture. If you are photographing a page rather than scanning"
                        + " it, hold the camera parallel to the page and fill the frame to give the engine the best"
                        + " possible image to work from.",
                        "Telling the OCR engine which language the document is in helps it choose the right character"
                        + " set and dictionary, which improves accuracy and reduces mistakes \u2014 especially for accented"
                        + " characters and non-Latin scripts. If a document mixes languages, recognising the dominant one"
                        + " usually gives the best overall result.",
                        "Handwriting, decorative fonts, and very small print are inherently harder to recognise than"
                        + " clean printed text, so expect lower accuracy on those. For critical documents, always proofread"
                        + " the recognised text against the original, since no OCR is perfect.",
                        "Once a scan has gained a text layer, its value rises sharply. It becomes findable in a search,"
                        + " usable in an archive, accessible to screen readers for people with visual impairments, and"
                        + " ready to feed into other tools that need real text.",
                        "For anyone digitising paperwork \u2014 receipts, contracts, old letters, or records \u2014 OCR is the"
                        + " step that turns a pile of pictures into a genuinely useful library. A folder of scanned"
                        + " documents you cannot search is little better than the paper originals; the same folder with OCR"
                        + " becomes an instantly searchable digital archive."
                )));

        g.put("pdf-to-jpg", new Guide(
                "pdf-to-jpg",
                "How to convert a PDF to JPG images",
                "Turn PDF pages into JPG images for easy sharing on social media, in presentations, or anywhere"
                        + " an image is needed.",
                List.of(
                        "Sometimes you need a PDF page as an image rather than a document \u2014 to post a flyer on social"
                        + " media, drop a diagram into a slide, preview a page as a thumbnail, or include content somewhere"
                        + " that only accepts images. Converting a PDF to JPG turns each page into a standard picture you"
                        + " can use anywhere.",
                        "This guide explains when converting to JPG makes sense, what you gain and lose, and how to get"
                        + " good-looking images from your pages.",
                        "Images go places documents cannot. Social media platforms display JPGs directly in a feed where"
                        + " a PDF would just be a link. Presentation software, image editors, and many web forms accept"
                        + " images but not PDFs. A JPG is also the simplest way to show a single page as a preview or"
                        + " thumbnail.",
                        "If your goal is for people to see a page at a glance \u2014 rather than read, search, or print a"
                        + " full document \u2014 a JPG is often the more practical format. It opens instantly anywhere without a"
                        + " PDF reader.",
                        "Converting to JPG makes a page universally viewable, but it also flattens it. The text becomes"
                        + " part of the image, so it can no longer be searched, selected, or copied, and the file is no"
                        + " longer a multi-page document but a set of separate pictures.",
                        "This trade-off is fine when you want a visual snapshot, but it is the wrong choice if the"
                        + " recipient needs to read a long document or work with its text. For those cases, keep the PDF."
                        + " Think of JPG conversion as producing a picture of a page, not a working copy of the document.",
                        "Converting a multi-page PDF produces one JPG per page, numbered in order. A five-page PDF gives"
                        + " you five images. This is exactly what you want when each page is a standalone item \u2014 a"
                        + " certificate, a poster, or a single diagram \u2014 but means a long document turns into a large set"
                        + " of files.",
                        "If you only need a particular page as an image, extract that page first and then convert just"
                        + " that one, rather than generating images for the entire document and hunting for the one you"
                        + " wanted.",
                        "Image quality depends on the resolution of the conversion. A higher resolution produces"
                        + " sharper, larger images suitable for printing or zooming, while a lower resolution makes smaller"
                        + " files better suited to quick on-screen sharing. For most social media and web uses, a moderate"
                        + " resolution looks crisp and keeps file sizes sensible.",
                        "If the page contains fine detail \u2014 small text, thin lines, or detailed charts \u2014 lean towards a"
                        + " higher resolution so it stays legible. For a simple graphic or photo-heavy page, a moderate"
                        + " setting is usually plenty.",
                        "Conversion runs both ways. If you later want to gather your JPGs back into a single document \u2014"
                        + " perhaps after editing them \u2014 an images-to-PDF tool combines them into one file again. This"
                        + " round trip is useful when you need to touch up pages as images and then reassemble them.",
                        "Keep your original PDF as well as the JPGs. The PDF remains the searchable, printable master,"
                        + " while the images are the convenient visual version for sharing. Having both means you are never"
                        + " stuck with only the flattened copy."
                )));

        g.put("pdf-to-word", new Guide(
                "pdf-to-word",
                "How to convert a PDF to an editable Word document",
                "Turn a PDF into an editable Word file, understand which PDFs convert cleanly, and get the best"
                        + " possible result.",
                List.of(
                        "Converting a PDF back into an editable Word document is one of the most requested PDF tasks,"
                        + " and also one of the most misunderstood. People expect a perfect copy and are surprised when"
                        + " headings shift or tables break. Understanding why this happens makes it much easier to get a"
                        + " clean, usable result.",
                        "This guide explains why conversions vary in quality, which PDFs convert well, and how to set"
                        + " yourself up for the best outcome.",
                        "A PDF records the exact position of every character on the page \u2014 it is essentially a finished"
                        + " print layout. A Word document, by contrast, stores structure: paragraphs, headings, lists, and"
                        + " tables that reflow as you edit.",
                        "To convert one to the other, a converter has to reverse-engineer that structure from nothing"
                        + " but coordinates, deciding where a paragraph begins, whether a row of text is a table, and which"
                        + " lines are headings. That reconstruction is clever but imperfect, which is why results vary.",
                        "Simple, single-column documents \u2014 letters, reports, articles \u2014 convert reliably because their"
                        + " structure is easy to infer. Complex layouts with multiple columns, sidebars, text boxes, and"
                        + " intricate tables are far harder and usually need some cleanup afterward.",
                        "The layout the converter guesses will rarely match an elaborate design perfectly, so set your"
                        + " expectations by the complexity of the original. A plain document will come out close to"
                        + " perfect; a magazine-style layout will need editing.",
                        "The single biggest determinant of success is whether the PDF contains real text at all. If you"
                        + " can open the PDF and select words with your cursor, the text is genuinely there and will"
                        + " convert well. If you cannot select anything \u2014 the whole page behaves like one picture \u2014 then"
                        + " the PDF is a scan or photograph with no text data inside it.",
                        "In that case a converter has nothing to extract, and the result is often an empty or image-only"
                        + " document. Such files need OCR first to add a text layer, after which they convert like any"
                        + " born-digital PDF. This one check \u2014 can you select the text \u2014 predicts the outcome more than"
                        + " anything else.",
                        "Start from a born-digital PDF \u2014 one created directly from Word, Google Docs, or a similar"
                        + " program \u2014 rather than a scan whenever you can. Expect to do light cleanup on spacing and"
                        + " headings afterward, especially on longer documents, and budget a few minutes for it rather than"
                        + " expecting a flawless copy.",
                        "If your document is mostly tables and numbers, consider converting to Excel instead of Word,"
                        + " since a spreadsheet preserves rows and columns far more faithfully than a text document can."
                        + " Choosing the right target format for your content makes a real difference.",
                        "The goal of conversion is to save you from retyping, not to deliver a pixel-perfect clone. A"
                        + " good conversion does ninety percent of the work so you can finish the last ten percent quickly"
                        + " \u2014 fixing a heading here, realigning a table there \u2014 rather than starting from a blank page.",
                        "Judged that way, even an imperfect conversion is a huge time-saver. If you approach it"
                        + " expecting to do a little tidying, you will be satisfied; if you expect perfection from a"
                        + " complex layout, you may be disappointed. The tool turns a locked document back into editable"
                        + " material, which is exactly what most people need."
                )));

        g.put("pdf-to-powerpoint", new Guide(
                "pdf-to-powerpoint",
                "How to convert a PDF to PowerPoint",
                "Turn a PDF into editable PowerPoint slides, understand what converts well, and reuse existing"
                        + " content in a new deck.",
                List.of(
                        "Sometimes the slides you need already exist as a PDF \u2014 a deck someone shared, a brochure, or a"
                        + " report you want to present. Converting that PDF to PowerPoint gives you editable slides you can"
                        + " update and reuse rather than rebuilding from scratch.",
                        "This guide explains how PDF-to-PowerPoint conversion works, what to expect from the result, and"
                        + " how to make the most of the slides you get back.",
                        "Converting to PowerPoint is about reuse. If you have a PDF deck and want to update a few"
                        + " figures, change the branding, or add slides, editing converted slides is far quicker than"
                        + " recreating the whole presentation. It is also useful for turning a PDF report or one-page"
                        + " brochure into a starting point for a talk.",
                        "The aim is to recover editable material, not to reproduce a flawless copy. As with other"
                        + " conversions, what you get is a strong head start that you then refine, rather than a finished"
                        + " deck.",
                        "Each page of the PDF becomes a slide, in order, so a ten-page PDF produces a ten-slide deck."
                        + " The content of each page is placed onto its slide so you can edit it in PowerPoint rather than"
                        + " being stuck with a flat image.",
                        "How editable the result is depends on the source. A PDF that was originally exported from"
                        + " PowerPoint converts back most cleanly, because its content is well structured. A PDF built"
                        + " another way may place content less tidily, needing more adjustment once it is in PowerPoint.",
                        "Clean, simple slides with clear text and straightforward layouts convert best. Heavily designed"
                        + " pages \u2014 overlapping graphics, unusual fonts, intricate diagrams \u2014 are harder to reconstruct and"
                        + " will usually need tidying once the deck is open.",
                        "As with PDF-to-Word, the key factor is whether the PDF contains real text. A scanned or"
                        + " image-only PDF has no text to recover, so the slides will contain pictures rather than editable"
                        + " text boxes; running OCR first helps in that situation.",
                        "Once your slides are in PowerPoint, budget a little time to polish them: realign text boxes,"
                        + " reapply your template or theme for consistent branding, and check that fonts and colours match"
                        + " your standards. This is normally far faster than building the deck from nothing.",
                        "Treat the conversion as scaffolding. It gives you every slide's content in roughly the right"
                        + " place, and your job is to make it look intentional. For decks you present often, doing this"
                        + " cleanup once gives you a reusable master you can update freely.",
                        "With an editable deck in hand you can do all the usual things \u2014 add new slides, merge in"
                        + " content from other presentations, and export back to PDF when you need a fixed version to"
                        + " share. The PDF and PowerPoint versions then serve different roles: one for editing, one for"
                        + " distribution.",
                        "Keep the original PDF too. If a conversion loses some formatting you cannot easily rebuild, the"
                        + " original remains your reference for how the slides were meant to look, and you can always"
                        + " convert again if needed."
                )));

        g.put("pdf-to-excel", new Guide(
                "pdf-to-excel",
                "How to convert a PDF to Excel",
                "Extract tables from a PDF into an editable Excel spreadsheet, and learn which PDFs give the"
                        + " cleanest data.",
                List.of(
                        "Retyping a table of figures out of a PDF is tedious and error-prone, yet it is something people"
                        + " do constantly with bank statements, invoices, price lists, and reports. Converting a PDF to"
                        + " Excel recovers that tabular data into editable cells so you can sort, total, and analyse it"
                        + " instead of copying it by hand.",
                        "This guide explains how PDF-to-Excel conversion works, which documents convert cleanly, and how"
                        + " to get usable data out of your tables.",
                        "When the content you need is numbers in rows and columns, Excel is the right destination. It"
                        + " lets you calculate, sort, filter, and chart the data \u2014 none of which is possible while it is"
                        + " locked inside a PDF. Converting saves the hours that manual re-entry would take and removes the"
                        + " typos that come with it.",
                        "This is particularly valuable for recurring documents. If you receive the same style of"
                        + " statement or report every month, converting each one to Excel turns a pile of read-only PDFs"
                        + " into a dataset you can actually work with.",
                        "Like converting to Word, converting to Excel means reconstructing structure from a PDF that"
                        + " only stores positions. The converter has to recognise which text belongs in which row and"
                        + " column, where one cell ends and the next begins, and which lines are headers. Clean, clearly"
                        + " ruled tables make this straightforward.",
                        "Tables without visible gridlines, with merged cells, or with figures wrapped across several"
                        + " lines are harder to interpret and may need tidying after conversion. The clearer and more"
                        + " regular the original table, the cleaner the spreadsheet you get back.",
                        "As with every conversion, the decisive factor is whether the PDF contains real text. If you can"
                        + " select the numbers in the PDF, they will convert into cells. If the document is a scan and the"
                        + " figures are part of an image, there is no data to extract until you run OCR to recognise the"
                        + " text first.",
                        "OCR on financial documents deserves a careful proofread, because a single misread digit changes"
                        + " a number's meaning entirely. Always check converted figures against the original, especially"
                        + " for anything you will calculate with.",
                        "After converting, open the spreadsheet and check that columns are aligned, numbers are stored"
                        + " as numbers rather than text, and no rows have merged or split incorrectly. A few minutes of"
                        + " cleanup \u2014 fixing a misaligned column, separating a combined cell \u2014 usually turns a good"
                        + " conversion into a perfectly usable one.",
                        "If a document mixes prose and tables, you may get the best result by focusing the conversion on"
                        + " the pages that contain the tables, rather than the whole document. The cleaner the input, the"
                        + " less tidying the output needs.",
                        "Once your figures are in Excel you can do what the PDF never allowed: total a column, sort"
                        + " transactions by date, filter for a category, or build a chart. This is the entire point of the"
                        + " conversion \u2014 turning a static report into live, workable data.",
                        "Keep the original PDF as the authoritative record, since it is what was officially issued. Use"
                        + " the spreadsheet for analysis, and if you produce a summary from it, you can convert that back"
                        + " to PDF to share a clean, fixed version with others."
                )));

        g.put("pdf-to-pdfa-archiving", new Guide(
                "pdf-to-pdfa-archiving",
                "How to convert a PDF to PDF/A for archiving",
                "Understand the PDF/A archiving standard, how it differs from a normal PDF, and when you are"
                        + " required to use it.",
                List.of(
                        "If you have ever been asked to submit a document \u201cin PDF/A format\u201d and were not sure what that"
                        + " meant or why it mattered, you are not alone. PDF/A is a specialised version of PDF built for"
                        + " one specific job: making sure a document still opens and looks exactly the same decades from"
                        + " now.",
                        "This guide explains what PDF/A is in plain terms, how it differs from an ordinary PDF, and"
                        + " exactly when you need to convert.",
                        "An ordinary PDF is allowed to depend on things that live outside the file \u2014 fonts installed on"
                        + " your computer, links to external resources, or interactive features that need specific software"
                        + " to work. Today that is fine, but in twenty or thirty years those fonts and programs may no"
                        + " longer exist.",
                        "When that happens, the document could open with the wrong typeface, missing characters, or"
                        + " broken behaviour. For anything that must remain readable far into the future \u2014 legal records,"
                        + " government archives, academic theses \u2014 that uncertainty is unacceptable. PDF/A removes it.",
                        "PDF/A requires the file to be completely self-contained. Every font the document uses must be"
                        + " embedded inside it, all colour information must be included, and features that could break over"
                        + " time \u2014 such as JavaScript, audio, video, and encryption \u2014 are not allowed.",
                        "Because everything is packed inside, PDF/A files are self-sufficient and tend to be somewhat"
                        + " larger than a normal PDF of the same content. That extra size is the price of guaranteed"
                        + " longevity: the file carries everything it will ever need to display correctly, with no external"
                        + " dependencies.",
                        "You will sometimes see levels such as PDF/A-1b, PDF/A-2b, and PDF/A-3b. These refer to"
                        + " different versions of the standard, each adding capabilities over the last. The letter \u201cb\u201d"
                        + " stands for the basic conformance level, which guarantees that the document will look right when"
                        + " displayed.",
                        "For most submissions, PDF/A-1b is the safest and most widely supported choice unless a specific"
                        + " authority asks for another level. If you are given a requirement, follow it exactly; if you are"
                        + " simply told \u201cPDF/A,\u201d the basic level is usually what is expected.",
                        "PDF/A is required in fairly specific situations: electronic court filings, government and"
                        + " corporate record-keeping, library and museum archives, and many university thesis or"
                        + " dissertation submissions. These institutions need certainty that the documents they store will"
                        + " remain readable far into the future.",
                        "For everyday sharing \u2014 emailing an invoice, sending a report, posting a flyer \u2014 a normal PDF is"
                        + " perfectly fine, and there is no need to convert. Reach for PDF/A only when an archive or"
                        + " submission system specifically calls for it.",
                        "Converting to PDF/A embeds the fonts and colour data and strips out the features the standard"
                        + " prohibits. Start from a clean PDF, convert to the required level, and then \u2014 importantly \u2014"
                        + " confirm that the converted file passes the validation check of whatever system you are"
                        + " submitting to, since requirements can vary between organisations.",
                        "Keep your original working PDF as well. The PDF/A version is for archiving and submission, but"
                        + " the original is easier to edit if you need to make changes and convert again. Treat PDF/A as"
                        + " the final, frozen copy rather than a document you will keep reworking."
                )));

        g.put("pdf-to-dxf-for-cad", new Guide(
                "pdf-to-dxf-for-cad",
                "How to convert a PDF to DXF for CAD",
                "Turn PDF drawings into editable DXF files for AutoCAD and other CAD software, with realistic"
                        + " expectations for architects and engineers.",
                List.of(
                        "Architects, engineers, and drafters regularly receive drawings as PDFs but need them in a CAD"
                        + " program to measure, trace, or modify. Converting a PDF to DXF turns those flat drawings into"
                        + " editable vector geometry that AutoCAD and other CAD tools can open, saving hours of manual"
                        + " redrawing.",
                        "This guide explains what PDF-to-DXF conversion can and cannot do, which PDFs convert well, and"
                        + " how to get the most usable result for technical work.",
                        "A PDF drawing is a picture of a design \u2014 you can view and print it, but you cannot snap to its"
                        + " lines, measure precisely, or edit the geometry. DXF is a CAD interchange format that stores the"
                        + " drawing as actual lines, polylines, arcs, and text, which CAD software can manipulate directly.",
                        "Converting therefore lets you bring an external drawing into your own workflow: trace over it,"
                        + " take accurate measurements, reuse parts of it, or continue a design someone sent only as a PDF."
                        + " For anyone who works in CAD, this is the difference between starting from a reference image and"
                        + " starting from a real drawing.",
                        "The crucial factor is whether the PDF is a vector drawing or a scan. A vector PDF \u2014 one"
                        + " exported directly from CAD software \u2014 contains real geometric lines and shapes that convert"
                        + " into DXF entities cleanly. A scanned drawing, by contrast, is just an image of dots with no"
                        + " geometry inside it, so there is nothing precise to convert.",
                        "For vector PDFs, lines, polylines, shapes, fills, and text all carry across into the DXF. For"
                        + " scans, conversion cannot recover true geometry; you would be tracing over an image manually in"
                        + " CAD instead. Knowing which type you have sets the right expectation before you begin.",
                        "A good conversion produces a DXF in the AutoCAD R2010 format with the drawing's geometry placed"
                        + " on layers, dimensions in millimetres, and text preserved as editable text. Multi-page PDFs are"
                        + " typically delivered as one DXF per page, so a drawing set becomes a set of CAD files you can"
                        + " open individually.",
                        "Because a PDF and a native CAD file store information differently, expect the result to be a"
                        + " faithful geometric copy rather than a perfectly organised CAD model. Layers, line weights, and"
                        + " text will be present and usable, but you may want to reorganise layers or tidy the drawing to"
                        + " match your own CAD standards.",
                        "Start from the original vector PDF rather than a scanned or photographed copy whenever possible"
                        + " \u2014 the cleaner the source geometry, the cleaner the DXF. If the PDF preserves its CAD layers,"
                        + " those often carry through, giving you a head start on organisation.",
                        "After converting, open the DXF in your CAD software and check the scale, the layers, and the"
                        + " text placement. Confirm that dimensions read correctly and that geometry sits where it should."
                        + " A short review at this stage catches anything that needs adjusting before you build on the"
                        + " drawing.",
                        "Commercial PDF-to-DXF tools charge significant annual fees precisely because this conversion is"
                        + " genuinely hard, and no converter produces a flawless native CAD model from a PDF. What you get"
                        + " is accurate, editable geometry that saves the considerable time of redrawing from scratch \u2014"
                        + " invaluable for tracing, measuring, and reusing existing drawings.",
                        "Treat the DXF as a strong, accurate starting point. For most architectural and engineering"
                        + " tasks \u2014 taking off measurements, overlaying a new design, or reworking part of an existing plan"
                        + " \u2014 that is exactly what is needed. Keep the original PDF alongside the DXF as your reference for"
                        + " how the drawing was issued."
                )));

        g.put("replace-text-in-pdf", new Guide(
                "replace-text-in-pdf",
                "How to find and replace text in a PDF",
                "Update text inside a PDF without retyping the whole document, fix typos and details, and keep"
                        + " the file a real, selectable PDF.",
                List.of(
                        "Finding a typo, an outdated date, or a wrong name in a finished PDF used to mean going back to"
                        + " the original document, fixing it, and re-exporting \u2014 or worse, recreating the file from"
                        + " scratch. Replacing text directly in the PDF lets you make those small but important changes in"
                        + " seconds, without touching the source.",
                        "This guide explains how text replacement in a PDF works, what it does well, and how to get"
                        + " reliable results.",
                        "Often the editable original is gone, was made by someone else, or is simply not worth reopening"
                        + " for a one-word change. Replacing text in the PDF itself is the fastest path when you need to"
                        + " correct a typo, update a date or figure, swap a name, or change a reference \u2014 small edits that"
                        + " do not justify rebuilding the document.",
                        "Crucially, this edits the actual text inside the file rather than pasting an image over it. The"
                        + " document stays a real, selectable PDF that can still be searched and copied, not a flattened"
                        + " picture of a page.",
                        "You tell the tool the text to find and the text to replace it with, and it locates every"
                        + " matching occurrence in the document and swaps in the new text. You can usually control whether"
                        + " to replace every match or only specific ones, and whether the match must be exact, which gives"
                        + " you precision when a word appears in several contexts.",
                        "Because it works on the real text, the replacement becomes part of the document just like the"
                        + " original words. The result reads and behaves like an ordinary PDF, with no visible patch or"
                        + " overlay.",
                        "Good replacement tries to keep the new text consistent with the surrounding document \u2014 matching"
                        + " the font and style so the change blends in rather than standing out. When the original and"
                        + " replacement are similar in length, this works smoothly and the edit is invisible.",
                        "Very different lengths can affect spacing, since the new text occupies a different amount of"
                        + " room than the old. For the cleanest result, keep replacements close in length to what they"
                        + " replace where you can, and review the edited area afterward to confirm the layout still looks"
                        + " right.",
                        "Text replacement is ideal for targeted edits: correcting errors, updating recurring details"
                        + " across a document, anonymising a name, or refreshing a date on a reusable form. It is not a"
                        + " full page-layout editor \u2014 it changes text rather than redesigning the page \u2014 so for wholesale"
                        + " rewrites the original source document is still the better starting point.",
                        "Think of it as a precise tool for specific changes. For the common case of needing to fix or"
                        + " update particular words in an otherwise finished document, it is far faster than any"
                        + " alternative.",
                        "After replacing, open the document and look at each changed area. Confirm the new text reads"
                        + " correctly, the spacing around it looks natural, and no unintended matches were changed \u2014 for"
                        + " instance, if you replaced a short word that also appears inside longer words. Using exact"
                        + " matching avoids most surprises.",
                        "Keep the original file until you have confirmed the edit is correct. If a replacement does not"
                        + " look right, you can adjust your find-and-replace terms and run it again on the clean original"
                        + " rather than working from an already-edited copy."
                )));

        g.put("rotate-pdf-pages", new Guide(
                "rotate-pdf-pages",
                "How to rotate pages in a PDF",
                "Fix sideways or upside-down PDF pages so the whole document reads correctly and prints the"
                        + " right way up.",
                List.of(
                        "A PDF with a sideways or upside-down page is awkward to read on screen and embarrassing to"
                        + " print. It happens easily \u2014 a page scanned in the wrong orientation, a landscape table dropped"
                        + " into a portrait document, or a photo captured the wrong way round. Rotating fixes the"
                        + " orientation so the whole document reads correctly.",
                        "This guide explains how rotating works, how to rotate just the pages that need it, and how to"
                        + " make the change stick.",
                        "Orientation problems usually come from how a page was created. Scanners pick up pages in"
                        + " whatever direction they were fed, so a single misplaced sheet comes out sideways. Documents"
                        + " that mix portrait text with a wide landscape table or chart often have that one page turned"
                        + " ninety degrees. Photographed pages inherit whatever rotation the camera recorded.",
                        "Whatever the cause, the fix is the same: turn the affected pages so they sit the right way up"
                        + " relative to how the document will be read and printed.",
                        "Rotating turns pages in ninety-degree steps \u2014 90, 180, or 270 degrees \u2014 which covers every"
                        + " orientation problem. A sideways page needs ninety degrees one way or the other; an upside-down"
                        + " page needs 180. You apply the rotation and save the corrected document.",
                        "Rotation changes only orientation, not content, so nothing is re-rendered or degraded. The page"
                        + " simply sits at the correct angle, and its text and images come along unchanged.",
                        "Sometimes the whole document is rotated the same way \u2014 an entire scan that came out sideways \u2014"
                        + " in which case you rotate every page together. More often only specific pages are affected, so"
                        + " you rotate just those and leave the rest alone.",
                        "Before rotating, page through the document and note exactly which pages need turning and in"
                        + " which direction, since a page that is upside down needs a different rotation than one that is"
                        + " merely sideways. Applying the right rotation to the right pages avoids creating new orientation"
                        + " problems.",
                        "There is an important distinction between temporarily rotating the view in a PDF reader and"
                        + " actually rotating the page in the file. Turning the view only changes what you see on screen"
                        + " for that session; it does not fix the document, and the page will appear rotated again for the"
                        + " next person who opens it, and when it prints.",
                        "Rotating with an editing tool changes the page within the file itself, so the corrected"
                        + " orientation is saved and travels with the document. This is what you want for a file you will"
                        + " share or print \u2014 the fix is built in, not just applied to your current view.",
                        "Rotation often goes hand in hand with other tidying. After fixing orientation you might reorder"
                        + " pages that scanned out of sequence, remove a blank sheet, or add page numbers to the corrected"
                        + " document. Doing these together produces a clean, professional file in one pass.",
                        "Once everything reads the right way up and in the right order, the document is ready to share"
                        + " or print with confidence. A quick final scroll-through confirms every page is correctly"
                        + " oriented before you send it on."
                )));

        g.put("add-page-numbers-to-pdf", new Guide(
                "add-page-numbers-to-pdf",
                "How to add page numbers to a PDF",
                "Add clear, professional page numbers to a PDF so long documents are easy to navigate,"
                        + " reference, and print.",
                List.of(
                        "Page numbers seem like a small detail, but their absence is keenly felt in any long document."
                        + " Without them, readers cannot reference a point, a printed stack cannot be reordered if dropped,"
                        + " and a reviewer cannot say \u201csee page 12.\u201d Adding page numbers turns a loose collection of pages"
                        + " into a properly navigable document.",
                        "This guide explains when to add page numbers, where to place them, and how to make them look"
                        + " professional.",
                        "Page numbers give a document structure and make it usable. They let people cite and discuss"
                        + " specific pages, keep printed documents in order, and signal professionalism in reports,"
                        + " contracts, manuals, and submissions. Many formal documents are simply expected to be numbered.",
                        "They are especially valuable in merged documents, where several files have been combined and no"
                        + " longer carry consistent numbering of their own. Adding a single sequence across the whole"
                        + " merged file ties it together into one coherent document.",
                        "Page numbers usually go in the header or footer \u2014 most commonly the bottom of the page, centred"
                        + " or in a corner. The bottom centre is a safe, traditional choice; bottom corners suit documents"
                        + " that will be bound, where the outer corner stays visible. Pick a position that does not collide"
                        + " with existing content.",
                        "Consistency matters more than the exact spot. Whatever position you choose, applying it"
                        + " uniformly across every page produces a tidy, predictable result that readers can rely on.",
                        "Consider whether every page should be numbered. A cover page or title page is often left"
                        + " unnumbered, with numbering starting on the first content page. Decide how you want the sequence"
                        + " to run before you apply it, so the numbers match readers' expectations.",
                        "For a straightforward document, numbering every page from one is perfectly fine. For something"
                        + " more formal with front matter, you may want the count to begin after the cover. Either way,"
                        + " plan the scheme first so you do not have to redo it.",
                        "Page numbers should be easy to read but unobtrusive \u2014 large enough to see at a glance, small"
                        + " enough not to compete with the content. A clean, plain style that matches the document's"
                        + " overall look keeps them professional. Avoid placing them where they overlap text, images, or"
                        + " existing footers.",
                        "After adding numbers, page through the document to confirm they appear consistently, sit in the"
                        + " same place on every page, and do not clash with anything already on the page. A quick check"
                        + " prevents a number landing awkwardly on a busy page.",
                        "Adding page numbers is usually one of the last steps in preparing a document, after you have"
                        + " merged, reordered, and removed pages so the final sequence is settled. Numbering last ensures"
                        + " the numbers match the final order rather than an arrangement you later changed.",
                        "Once numbered, a long document feels finished and professional. Combined with a clear file name"
                        + " and, where appropriate, a cover page, page numbers signal that the document has been prepared"
                        + " with care \u2014 which matters for anything you submit or share formally."
                )));

        g.put("add-watermark-to-pdf", new Guide(
                "add-watermark-to-pdf",
                "How to add a watermark to a PDF",
                "Stamp text such as DRAFT or CONFIDENTIAL across your PDF pages to mark status, assert"
                        + " ownership, and discourage misuse.",
                List.of(
                        "A watermark is a piece of text laid across the pages of a document \u2014 DRAFT, CONFIDENTIAL, a"
                        + " company name, or a copyright notice. It is a simple, visible way to mark a document's status,"
                        + " assert ownership, or warn against unauthorised use, and it appears on every page so the message"
                        + " cannot be missed.",
                        "This guide explains what watermarks are for, how to make them effective without ruining"
                        + " readability, and when to apply them.",
                        "Watermarks communicate something about the whole document at a glance. A DRAFT stamp prevents"
                        + " an unfinished version from being mistaken for the final one. A CONFIDENTIAL mark reminds every"
                        + " reader to handle the document carefully. A company name or copyright notice asserts ownership"
                        + " and discourages people from passing the work off as their own.",
                        "Because the mark repeats on every page, it travels with the document no matter which page"
                        + " someone prints or screenshots. That ubiquity is the point: the status or ownership is"
                        + " impossible to overlook.",
                        "A good watermark is visible enough to read but faint enough not to obscure the content beneath"
                        + " it. This is usually achieved by making the text semi-transparent and placing it diagonally"
                        + " across the page, often in a large, light grey. The reader sees both the watermark and the text"
                        + " underneath without either getting in the way.",
                        "The wording should be short and clear \u2014 a single word or short phrase reads instantly, while a"
                        + " long sentence becomes cluttered when stamped across a page. DRAFT, CONFIDENTIAL, or a brand"
                        + " name work far better than a paragraph.",
                        "Transparency is the key setting. Too solid and the watermark hides the content; too faint and"
                        + " it fails to register. A moderate opacity that is clearly visible but still lets the text read"
                        + " through is the sweet spot, and it is worth previewing on a typical page to get it right.",
                        "A diagonal placement across the centre is the classic choice because it covers the page evenly"
                        + " and is hard to crop out. For a subtler effect, a smaller mark in a corner or repeated lightly"
                        + " across the page also works, depending on how prominent you want the message to be.",
                        "Apply watermarks to documents whose status or ownership you want to make explicit: drafts"
                        + " circulated for review, confidential materials shared with limited audiences, samples and"
                        + " previews, and creative work you want to protect. The watermark sets expectations the moment"
                        + " someone opens the file.",
                        "Remember that a visible watermark is a deterrent and a label, not a security measure \u2014 it does"
                        + " not prevent copying. For genuine protection of who can open or change a file, combine a"
                        + " watermark with password protection. The two serve different purposes and work well together.",
                        "Keep an unwatermarked original. The watermarked version is for distribution, but you will often"
                        + " need the clean copy later \u2014 to produce the final unmarked document once a draft is approved, or"
                        + " to apply a different mark for a different audience.",
                        "If the watermarked file is going to a wide audience, you might also protect it with a password"
                        + " or compress it before sending. A clear watermark plus a sensible file name leaves no doubt"
                        + " about what the document is and how it should be treated."
                )));

        g.put("crop-pdf-margins", new Guide(
                "crop-pdf-margins",
                "How to crop a PDF to remove margins",
                "Trim white margins or crop a PDF to a smaller area for cleaner printing, better reading on"
                        + " small screens, and tidier documents.",
                List.of(
                        "Wide white margins waste space and make documents harder to read on phones and tablets, where"
                        + " every bit of screen counts. Cropping a PDF trims away unwanted margins or focuses the page on a"
                        + " smaller area, producing a tighter, more readable document that also prints more efficiently.",
                        "This guide explains when cropping helps, how it works, and how to crop without accidentally"
                        + " cutting off content.",
                        "Cropping is about removing what you do not need around the edges of a page. Documents created"
                        + " for print often carry generous margins that look wasteful on a screen; scanned pages frequently"
                        + " include a border of grey or black around the actual content; and sometimes you simply want to"
                        + " focus on one part of a page rather than the whole sheet.",
                        "Trimming those margins makes the content larger relative to the page, which is easier to read"
                        + " on small screens and uses paper more efficiently when printed. The result is a cleaner, more"
                        + " focused document.",
                        "Cropping defines a smaller visible area within each page and trims away everything outside it."
                        + " The content itself is not deleted so much as hidden beyond the new boundary, and the page size"
                        + " shrinks to the cropped area. You set how much to trim from each edge \u2014 top, bottom, left, and"
                        + " right \u2014 to frame the content the way you want.",
                        "Because cropping changes the page boundary rather than the content within it, the text and"
                        + " images inside the crop stay exactly as they were. Only the framing changes.",
                        "The main risk in cropping is trimming too aggressively and clipping content you meant to keep \u2014"
                        + " a page number tucked in a corner, a footnote near the edge, or text that runs closer to the"
                        + " margin than you realised. Crop conservatively at first and check the result before trimming"
                        + " further.",
                        "It helps to look at the busiest pages, not just a typical one, since content sits closest to"
                        + " the edges there. A crop that looks safe on a sparse page might clip a header or a marginal note"
                        + " on a denser one. Verifying against the tightest page protects the whole document.",
                        "For a document where every page has the same layout, applying one consistent crop to all pages"
                        + " keeps things uniform and tidy. For a document where pages differ \u2014 some portrait, some"
                        + " landscape, some with different margins \u2014 you may need to crop pages individually so each is"
                        + " framed correctly.",
                        "Decide which situation you have before starting. A uniform document is quick to crop in one"
                        + " pass; a varied one needs a little more attention so that no page ends up with the wrong frame.",
                        "Once cropped, review the document at the size it will actually be used \u2014 on a phone if it is"
                        + " for mobile reading, or printed if it is for paper \u2014 to confirm the new framing works in"
                        + " practice. Cropping for the wrong context can look fine on a desktop but still feel cramped on a"
                        + " phone.",
                        "Keep the original uncropped file. Cropping is easy to redo from the original if you trim too"
                        + " much or need a different frame later, but recovering content from an over-cropped file is not."
                        + " The original is your safety net."
                )));

        g.put("edit-pdf-metadata", new Guide(
                "edit-pdf-metadata",
                "How to edit PDF metadata and document properties",
                "Update a PDF's title, author, and other properties to improve organisation, searchability, and"
                        + " professionalism.",
                List.of(
                        "Every PDF carries hidden information about itself \u2014 its title, author, subject, and keywords \u2014"
                        + " known as metadata. Most people never see it, yet it quietly shapes how the document appears in"
                        + " search results, how it is listed in document libraries, and what title shows in the browser"
                        + " tab. Editing it makes your documents tidier and more professional.",
                        "This guide explains what PDF metadata is, why it matters, and how to set it correctly.",
                        "Metadata is descriptive information stored inside the file, separate from the visible page"
                        + " content. The main fields are the title, the author, the subject, and keywords, along with"
                        + " automatically recorded details like the creation and modification dates and the software that"
                        + " produced the file.",
                        "You usually see metadata without realising it. When a PDF opens in a browser tab, the title"
                        + " shown is the metadata title, not the file name. When a document management system lists files,"
                        + " it often displays the author and subject from the metadata. It is the document's description of"
                        + " itself.",
                        "Good metadata makes documents findable and organised. A correct title helps the file surface in"
                        + " searches and display sensibly in libraries and browser tabs. A consistent author field groups"
                        + " your documents together. Keywords help search tools match the document to relevant queries.",
                        "Wrong or leftover metadata, by contrast, looks careless and can even leak information. A PDF"
                        + " exported from a template might carry the original author's name or a meaningless title like"
                        + " \u201cDocument1.\u201d Cleaning this up is a small step that noticeably improves how your documents"
                        + " present themselves.",
                        "Focus on the fields people actually see. Set a clear, descriptive title \u2014 the real name of the"
                        + " document, not the file name \u2014 since this is what shows in browser tabs and search results. Set"
                        + " the author to the person or organisation responsible. Add a subject and keywords if the"
                        + " document will live in a searchable library where those help.",
                        "Keep titles concise and meaningful: \u201c2026 Annual Report\u201d rather than \u201cfinal_v3_REAL.\u201d The goal"
                        + " is that anyone seeing the metadata immediately understands what the document is.",
                        "Metadata can carry information you did not intend to share. A document built from someone"
                        + " else's template may still list them as the author; a file exported from internal software may"
                        + " reveal that software or internal naming. Before sending a document externally, it is worth"
                        + " checking the metadata and clearing anything that should not travel with it.",
                        "This is a simple privacy hygiene step. Reviewing and correcting the author and title fields"
                        + " ensures the document reveals only what you mean it to, which matters for anything shared"
                        + " publicly or with clients.",
                        "Editing metadata is usually a finishing touch, done once the document content is final. After"
                        + " you have assembled, edited, and named the file, setting a proper title and author rounds it off"
                        + " professionally. It is especially worthwhile for documents that will be published, archived, or"
                        + " stored in a system where the metadata is displayed.",
                        "For a quick one-off document you are emailing to a colleague, metadata matters less. For"
                        + " anything that represents you or your organisation publicly, a few seconds spent setting the"
                        + " title and author is a small investment in looking polished and being easy to find."
                )));

        g.put("fill-pdf-forms", new Guide(
                "fill-pdf-forms",
                "How to fill in and flatten PDF forms",
                "Complete fillable PDF forms on screen and flatten them so your entries are locked in and"
                        + " display correctly everywhere.",
                List.of(
                        "Fillable PDF forms \u2014 applications, tax documents, registration sheets \u2014 let you type your"
                        + " answers directly into a document instead of printing, writing by hand, and scanning back."
                        + " Filling them on screen is faster and far neater, and flattening them afterward locks your"
                        + " answers in so they cannot be changed or lost.",
                        "This guide explains how to work with PDF forms, the difference between filling and flattening,"
                        + " and how to make sure your completed form displays correctly for whoever receives it.",
                        "A fillable PDF form contains interactive fields \u2014 text boxes, checkboxes, dropdowns \u2014 placed"
                        + " over the document where answers belong. Instead of writing on a printout, you click into each"
                        + " field and type, producing a clean, legible result every time. The form's layout stays fixed"
                        + " while your entries sit neatly in their assigned places.",
                        "These forms are common for official documents because they collect information consistently and"
                        + " are easy to read. Completing one on screen also means you can correct a mistake by simply"
                        + " retyping, rather than starting a fresh printout.",
                        "To fill a form, you enter your information into each field and select the appropriate"
                        + " checkboxes and options. Work through it methodically so nothing is missed, and double-check"
                        + " fields where accuracy matters \u2014 names, dates, reference numbers \u2014 since these are the easiest"
                        + " to mistype and the most important to get right.",
                        "Filling leaves the form interactive, which means the entries can still be edited. That is"
                        + " convenient while you are working, but it has implications for the finished form, which is where"
                        + " flattening comes in.",
                        "Flattening merges your entries permanently into the page, turning the once-interactive fields"
                        + " into fixed content. There are two strong reasons to do this. First, it locks your answers so"
                        + " they cannot be accidentally changed or cleared when someone else opens the form. Second, it"
                        + " ensures the form displays correctly everywhere.",
                        "That second point matters more than people expect. Interactive form fields sometimes render"
                        + " inconsistently across different PDF viewers \u2014 entries can appear misplaced or even invisible in"
                        + " some apps. Flattening eliminates that risk by baking the answers into the page itself, so the"
                        + " completed form looks identical no matter what opens it.",
                        "The reliable workflow for a form you are submitting is to fill it in completely, review every"
                        + " field carefully, and then flatten it before sending. The flattened version is what you submit;"
                        + " it is tamper-resistant and displays consistently for the recipient.",
                        "Keep an unflattened copy if you might need to reuse or amend the form \u2014 for a form you complete"
                        + " regularly, an editable version saves you re-entering everything next time. Submit the flattened"
                        + " copy, but keep the fillable one for yourself.",
                        "Sometimes a document looks like a form but has no interactive fields \u2014 it is just a printed"
                        + " layout, often a scan, with blank lines where answers go. In that case there are no fields to"
                        + " fill electronically in the usual way. You can still complete it by adding text or a signature"
                        + " onto the page, or by printing it.",
                        "If you frequently receive flat forms that should be fillable, it is worth asking the sender for"
                        + " an interactive version. For genuinely fillable forms, though, filling on screen and flattening"
                        + " for submission is the clean, professional approach."
                )));

        g.put("unlock-pdf-password", new Guide(
                "unlock-pdf-password",
                "How to unlock a password-protected PDF",
                "Remove password protection from a PDF you are authorised to open, so a file you access"
                        + " regularly is convenient to use.",
                List.of(
                        "Password-protected PDFs are everywhere \u2014 bank statements, payslips, and official documents"
                        + " often arrive encrypted, requiring the password every single time you open them. When you access"
                        + " such a file regularly and already know the password, repeatedly typing it becomes a chore."
                        + " Unlocking removes the protection so the file opens freely.",
                        "This guide explains how unlocking works, when it is appropriate, and how it differs from other"
                        + " security tools.",
                        "Unlocking removes the password requirement from a PDF you can already open. You supply the"
                        + " password you know, and the tool produces a copy of the document without the encryption, so it"
                        + " opens directly from then on with no password prompt.",
                        "It is important to understand that this works on files you are authorised to access and whose"
                        + " password you possess. It is a convenience step \u2014 turning a file you already have the key to"
                        + " into one that does not keep asking for that key \u2014 not a way to break into documents you cannot"
                        + " otherwise open.",
                        "The classic case is a recurring document you receive encrypted but read often. A monthly bank"
                        + " statement that demands the same password each time is a good candidate: once unlocked, your"
                        + " saved copy opens instantly. The same applies to payslips, utility bills, and other routine"
                        + " protected documents you store for reference.",
                        "Unlocking is also useful before further processing. Many tools cannot work on an encrypted"
                        + " file, so if you want to merge, compress, or convert a protected document, you typically unlock"
                        + " it first using the password, then carry out the operation on the unprotected copy.",
                        "PDFs can have two different passwords. An open password is required just to view the document \u2014"
                        + " this is the one you must know to access the file at all. A permissions password restricts"
                        + " certain actions, such as printing or editing, while still letting the document be opened.",
                        "Unlocking is about removing protection from a document you can already open with the password"
                        + " you hold. Knowing which kind of password a file uses helps set the right expectation for what"
                        + " unlocking will achieve.",
                        "Only unlock documents you are authorised to access. Removing protection from a file is"
                        + " appropriate for your own statements, your own work, or documents you have legitimate permission"
                        + " to handle. It is not a means to bypass protection on someone else's confidential files, and"
                        + " reputable tools require you to supply the correct password rather than circumventing it.",
                        "Once unlocked, remember that the new copy is no longer protected, so handle it with the same"
                        + " care the password was meant to provide. If the document is sensitive, store the unlocked"
                        + " version somewhere secure, or re-protect it with your own password if you need to share it"
                        + " onward.",
                        "Unlocking and protecting are opposites. Unlocking removes a password from a file you can open,"
                        + " making it convenient. Protecting adds a password to a file, making it private. People often use"
                        + " them in sequence: unlock a statement to read it easily, or unlock a document to process it and"
                        + " then re-protect the result before sharing.",
                        "Keeping the original protected file is wise. The unlocked copy is for your convenience, while"
                        + " the original remains the secure version. That way you gain easy access without losing the"
                        + " protected master."
                )));

        g.put("protect-pdf-with-password", new Guide(
                "protect-pdf-with-password",
                "How to password-protect a PDF",
                "Add a password to a PDF to keep sensitive documents private, and learn how to share protected"
                        + " files safely.",
                List.of(
                        "Many documents contain things you would not want a stranger to read \u2014 financial details,"
                        + " personal identifiers, contracts, or confidential business information. Password-protecting a"
                        + " PDF encrypts it so that only someone with the password can open it, giving you a simple,"
                        + " effective way to keep sensitive documents private.",
                        "This guide explains how password protection works, how to choose a strong password, and \u2014"
                        + " crucially \u2014 how to share a protected file without undermining the protection.",
                        "Protecting a PDF encrypts its contents and attaches a password that must be entered to open it."
                        + " Without the password, the document cannot be read \u2014 it is scrambled rather than merely hidden."
                        + " This makes it suitable for genuinely sensitive material, not just a casual deterrent.",
                        "Once protected, the file behaves normally for anyone who knows the password and is inaccessible"
                        + " to anyone who does not. The protection travels with the file, so it stays encrypted wherever it"
                        + " goes \u2014 in an email, on a drive, or in cloud storage.",
                        "The protection is only as strong as the password you choose. A short, obvious password \u2014 a"
                        + " name, a birthday, \u201cpassword123\u201d \u2014 can be guessed and offers little real security. A longer"
                        + " password that mixes words, numbers, and characters is far harder to break.",
                        "Aim for something you can remember but others cannot guess. A passphrase made of several"
                        + " unrelated words is both strong and memorable, which beats a short string of random characters"
                        + " you will forget. Whatever you choose, make sure you can retrieve it, because a protected PDF"
                        + " cannot be opened without it.",
                        "The single most important rule is never to send the password in the same message as the file."
                        + " If you email a protected PDF and put the password in the same email, anyone who intercepts or"
                        + " is forwarded that message gets both the lock and the key \u2014 defeating the entire purpose.",
                        "Instead, share the password through a different channel. Send the file by email and the"
                        + " password by text message or a phone call, for example. Splitting them means that intercepting"
                        + " one does not hand over the other, which is what makes the protection meaningful in practice.",
                        "Protect any PDF whose contents should be seen only by specific people: financial statements,"
                        + " documents containing personal data, confidential contracts, medical or legal records, and"
                        + " internal business materials. The moment a document leaves your control \u2014 by email, upload, or"
                        + " shared drive \u2014 protection ensures only the intended recipient can read it.",
                        "For documents that are not sensitive, protection just adds friction and is unnecessary. Reserve"
                        + " it for material where unauthorised access would actually matter, and apply it consistently to"
                        + " those files.",
                        "Protection pairs well with other steps. You might watermark a document as CONFIDENTIAL and also"
                        + " protect it with a password, combining a visible warning with real encryption. You might protect"
                        + " a file only after you have finished merging, editing, and finalising it, since many tools"
                        + " cannot process an already-encrypted document.",
                        "Keep an unprotected master copy in a secure location for your own use, and distribute the"
                        + " protected version. If you later need to edit the document, working from the unprotected"
                        + " original and re-protecting the result is far simpler than trying to process the encrypted file"
                        + " directly."
                )));

        g.put("sign-a-pdf", new Guide(
                "sign-a-pdf",
                "How to sign a PDF document",
                "Add your signature to a PDF without printing and scanning, so you can return signed documents"
                        + " quickly and cleanly.",
                List.of(
                        "Being asked to \u201cprint, sign, and scan\u201d a document is one of the small frustrations of modern"
                        + " life \u2014 it needs a printer, a scanner, and several minutes you would rather not spend. Signing a"
                        + " PDF directly lets you place your signature on the page on screen and return the document in"
                        + " moments, with no paper involved.",
                        "This guide explains how to sign a PDF, how to place a signature well, and how to handle"
                        + " multi-page agreements.",
                        "Signing on screen removes the entire print-sign-scan cycle. You add your signature to the"
                        + " document and send it straight back, which is faster, produces a cleaner result, and works even"
                        + " when you have no printer or scanner to hand. The signed page looks neat rather than carrying"
                        + " the grey background and slight skew of a scan.",
                        "It is ideal for the everyday agreements that fill an inbox: contracts, consent forms, delivery"
                        + " confirmations, and approvals. Anywhere you would otherwise print something just to add your"
                        + " name, signing the PDF does the job directly.",
                        "To sign, you create a signature \u2014 typically by drawing it \u2014 and then place it on the page where"
                        + " it belongs. You position it over the signature line and size it to fit, so it sits naturally as"
                        + " if signed by hand. Once placed, you export the signed document.",
                        "Take a moment to get the placement right: the signature should sit on or just above the line,"
                        + " at a sensible size, not overlapping other text. A well-placed signature makes the document look"
                        + " properly executed rather than hastily marked.",
                        "Many contracts require a signature or initials on every page, not just the last one, to confirm"
                        + " that the signer has seen each page. For these, you place your signature or initials on each"
                        + " required page rather than only at the end.",
                        "Work through the document page by page so none is missed, paying attention to any page that"
                        + " specifically calls for a full signature versus initials. Returning an agreement with a page"
                        + " unsigned can mean it gets sent back, so a careful pass through every page is worth the minute"
                        + " it takes.",
                        "A signed document often contains sensitive commitments, so handle it with appropriate care."
                        + " Review the completed document before sending to confirm the signature is placed correctly and"
                        + " the rest of the content is as agreed. Once you are satisfied, the signed PDF is ready to"
                        + " return.",
                        "If the signed document is confidential, consider protecting it with a password before sharing,"
                        + " especially if it contains personal or financial details. And keep your own copy of the signed"
                        + " version for your records \u2014 it is the evidence of what you agreed to.",
                        "Signing often fits into a larger sequence. You might fill in a form's fields, sign it, and"
                        + " flatten it before returning; or sign a contract, then merge it with supporting documents into a"
                        + " single package. Doing these steps in order produces a complete, professional submission.",
                        "For documents you sign repeatedly, having a clean signature ready to place each time makes the"
                        + " process quick. The aim is to make returning a signed document as fast as replying to an email \u2014"
                        + " which, once you sign directly in the PDF, it effectively becomes."
                )));

        g.put("redact-sensitive-information", new Guide(
                "redact-sensitive-information",
                "How to redact sensitive information in a PDF",
                "Permanently hide sensitive details in a PDF before sharing, and avoid the common mistake that"
                        + " leaves redacted text recoverable.",
                List.of(
                        "Before sharing a document you often need to hide parts of it \u2014 an account number, an address, a"
                        + " name, a salary figure. Redaction blacks out that sensitive content so it cannot be read. Done"
                        + " properly it is permanent and safe; done carelessly it can leave the supposedly hidden text"
                        + " fully recoverable, which is the single most important thing to understand about it.",
                        "This guide explains how redaction works, the critical mistake to avoid, and how to redact a"
                        + " document safely.",
                        "Redaction is the act of permanently removing specific information from a document while leaving"
                        + " the rest intact, so you can share a document that originally contained things the recipient"
                        + " must not see. It is used constantly with legal filings, financial documents, medical records,"
                        + " and any file being released publicly or to a third party.",
                        "The goal is selective disclosure: keep the document useful and complete except for the precise"
                        + " details that need to stay private, which are removed beyond recovery.",
                        "The most important thing to know about redaction is also the most common error: simply drawing"
                        + " a black box or coloured highlight over text does not remove it. In many cases the original"
                        + " words survive underneath the box and can be copied, selected, or revealed by anyone who knows"
                        + " to try \u2014 a mistake that has caused real and serious information leaks.",
                        "True redaction removes the underlying content itself, not just its appearance, so there is"
                        + " nothing beneath the black mark to recover. When you redact, you must be confident the tool is"
                        + " deleting the content rather than merely covering it. This distinction is the whole point of"
                        + " doing redaction properly.",
                        "Work methodically through the document and mark every piece of information that must be hidden"
                        + " \u2014 not just the obvious ones, but repeated instances and details that appear in headers,"
                        + " footers, or footnotes. A single missed occurrence can defeat the entire effort.",
                        "Pay attention to less obvious places where sensitive data hides: a name in a page header, an"
                        + " account number in a reference line, or details inside an image. Redaction needs to cover every"
                        + " appearance of the information, not just the first one you noticed.",
                        "After redacting, review every page of the document before sharing it. Confirm that each"
                        + " redaction is in place, that nothing sensitive remains visible, and that you have not missed an"
                        + " instance. This final check is essential, because once a document is shared, any oversight is"
                        + " out of your hands.",
                        "It is also worth checking that the redactions have not accidentally removed content you needed"
                        + " to keep. The aim is a document that is complete and useful except for precisely the details"
                        + " that had to go \u2014 no more and no less.",
                        "Redaction often works alongside other tools. You might redact sensitive details and then"
                        + " extract only the relevant pages to share, so the recipient sees a focused, cleaned document."
                        + " For a document containing private information that should also stay confidential as a whole,"
                        + " you might redact specific details and protect the file with a password.",
                        "Keep the original, unredacted document securely for your own records, since redaction is"
                        + " permanent in the shared copy. The redacted version is what you release; the original remains"
                        + " your complete reference, stored where only you can access it."
                )));

        g.put("compare-two-pdfs", new Guide(
                "compare-two-pdfs",
                "How to compare two PDFs and find the differences",
                "Spot changes between two versions of a PDF in text and layout, so you can review edits and"
                        + " catch unexpected alterations.",
                List.of(
                        "When you have two versions of a document \u2014 a contract before and after edits, a report and its"
                        + " revision, your draft and a returned copy \u2014 finding exactly what changed by reading both side by"
                        + " side is slow and unreliable. Comparing the two PDFs highlights the differences for you, so you"
                        + " can review changes quickly and with confidence.",
                        "This guide explains how PDF comparison works, when it is useful, and how to act on what it"
                        + " shows.",
                        "Comparison answers a simple but important question: what is different between these two"
                        + " documents? Reading two long files line by line to spot changes is tedious and easy to get wrong"
                        + " \u2014 a single altered figure or a quietly inserted clause is easy to miss. A comparison surfaces"
                        + " those differences directly.",
                        "This matters most where changes carry consequences. In contracts, a changed number or reworded"
                        + " clause can shift obligations; in reports, a revised figure can change conclusions. Comparing"
                        + " versions ensures no change slips through unnoticed, whether it was expected or not.",
                        "A comparison looks at how two PDFs differ in their text and layout, identifying where content"
                        + " has been added, removed, or altered between the versions. Rather than telling you the documents"
                        + " are simply \u201cdifferent,\u201d it points you to the specific places that changed so you can examine"
                        + " each one.",
                        "This turns reviewing a revision from a hunt into a checklist: you go to each flagged"
                        + " difference, decide whether it is acceptable, and move on. It is far faster and far more"
                        + " reliable than scanning two documents by eye.",
                        "Contract review is the classic case: you send a draft, receive a marked-up version back, and"
                        + " need to confirm exactly what the other party changed before agreeing. Comparison reveals every"
                        + " edit so nothing is accepted blindly.",
                        "It is equally useful for document versioning \u2014 confirming which version is the latest and what"
                        + " was updated \u2014 for checking that a colleague's edits match what was requested, and for verifying"
                        + " that a file you received has not been altered from the version you expected.",
                        "Once the differences are highlighted, work through them deliberately. For each change, decide"
                        + " whether it is expected and acceptable, something to question, or an error to correct. Treating"
                        + " the comparison as a review checklist ensures every change gets a conscious decision rather than"
                        + " slipping by.",
                        "Pay particular attention to changes in numbers, names, dates, and key terms, since these small"
                        + " edits carry the most weight and are the easiest to overlook when reading normally. The"
                        + " comparison's value is greatest precisely on these subtle but significant differences.",
                        "Comparison fits naturally into reviewing and finalising documents. After comparing and agreeing"
                        + " the changes, you might use replace to correct a remaining error, merge the final document with"
                        + " supporting files, or protect the agreed version before circulating it. The comparison is the"
                        + " checkpoint that confirms what you are finalising is correct.",
                        "Keep both versions until the review is complete and the final document is agreed. Having the"
                        + " before and after copies means you can compare again if a question arises, and you retain a"
                        + " clear record of how the document evolved."
                )));

        return Map.copyOf(g);
    }
}
