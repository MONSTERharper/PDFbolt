package com.pdfreplace;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    private final LibreOfficeConverter libreOffice;
    private final GhostscriptConverter ghostscript;
    private final boolean pdfaValidate;

    public HealthController(
            LibreOfficeConverter libreOffice,
            GhostscriptConverter ghostscript,
            @Value("${boltreplacer.pdfa.validate:true}") boolean pdfaValidate
    ) {
        this.libreOffice = libreOffice;
        this.ghostscript = ghostscript;
        this.pdfaValidate = pdfaValidate;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "ok");
        body.put("version", PdfBoltVersion.get());
        body.put("suite", "PDFBolt");
        body.put("tool", "bolt-replace");
        body.put("timestamp", Instant.now().toString());
        body.put("dependencies", dependencyStatus());
        return body;
    }

    private Map<String, Object> dependencyStatus() {
        boolean libreOfficeOk = libreOffice.isAvailable();
        boolean ghostscriptOk = ghostscript.isAvailable();
        boolean verapdfOk = !pdfaValidate || ghostscript.isVerapdfAvailable();

        Map<String, Object> deps = new LinkedHashMap<>();
        deps.put("libreOffice", libreOfficeOk);
        deps.put("ghostscript", ghostscriptOk);
        deps.put("verapdf", verapdfOk);
        deps.put("pdfaValidationEnabled", pdfaValidate);
        deps.put("ready", libreOfficeOk && ghostscriptOk);
        return deps;
    }
}
