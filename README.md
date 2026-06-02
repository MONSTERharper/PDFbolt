# PDFbolt

Deterministic PDF tools: **bolt replace** edits real PDF text streams (`Tj` / `TJ`) via PDFBox — not visual overlays.

Hosted suite UI + API (Spring Boot + React).

## Requirements

| | Local dev | EC2 / VPS (`mvn`) | Docker |
|---|-----------|-------------------|--------|
| JDK | 17+ | 17+ JRE | (in image) |
| Maven | yes | yes (build) | (in image) |
| Node | 20+ (UI build) | optional on server | (in image) |
| LibreOffice | optional locally | **required** for HTML/Office→PDF | **in image** |
| RAM | 2 GB+ comfortable | 1 GB + **2 GB swap** recommended | 1 GB+ |

**Full EC2 setup (packages, swap, fonts, LibreOffice):** see [docs/SETUP.md](docs/SETUP.md) and run:

```bash
chmod +x scripts/*.sh
sudo ./scripts/setup-host.sh
cp .env.example .env
./scripts/build.sh
./scripts/run.sh
```

---

## Quick start — local development

```bash
# Terminal 1 — API + built UI at /app/
cp .env.example .env   # optional: SMTP for contact form
mvn spring-boot:run

# Terminal 2 — hot-reload UI (proxies /api → :8080)
cd new-ui && npm install && npm run dev
```

Open `http://localhost:3000/app/` (dev) or `http://localhost:8080/app/` (after `npm run build` in `new-ui/`).

LibreOffice is only required on the machine running the API if you use **bolt html-to-pdf** or **Office → PDF** tools.

---

## Production — EC2 with Maven (no Docker)

1. **Host setup** (once per server):

```bash
git clone <your-repo> PDFbolt && cd PDFbolt
chmod +x scripts/*.sh
sudo SWAP_SIZE_GB=2 ./scripts/setup-host.sh
```

2. **Configure**:

```bash
cp .env.example .env
# Edit SMTP_*, PORT, JAVA_OPTS, LIBREOFFICE_COMMAND
```

3. **Build & run**:

```bash
./scripts/build.sh
./scripts/run.sh
```

4. **Optional systemd**: copy [deploy/pdfbolt.service.example](deploy/pdfbolt.service.example) → `/etc/systemd/system/pdfbolt.service`, adjust paths, `systemctl enable --now pdfbolt`.

Verify LibreOffice: `soffice --version`

---

## Production — Docker

The image ([Dockerfile](Dockerfile)) includes everything PDFbolt needs at runtime:

| Dependency | Used for |
|------------|----------|
| **LibreOffice** (`soffice`) | html-to-pdf, Word/PowerPoint/Excel → PDF |
| **Ghostscript** (`gs`) | pdf-to-pdfa |
| **veraPDF** (`verapdf`, amd64 builds) | optional ISO validation after PDF/A conversion |
| **Font packages** | PDF text replace / rendering fallbacks |
| **JRE 17** | Spring Boot API |

Startup runs [scripts/docker-entrypoint.sh](scripts/docker-entrypoint.sh) and **fails fast** if LibreOffice or Ghostscript is missing. After the container is up, check dependencies:

```bash
curl -s http://localhost:8080/api/health | jq .
# "dependencies": { "libreOffice": true, "ghostscript": true, "verapdf": true, "ready": true }
```

### Pre-deploy check (recommended)

From the repo root on your build machine (needs Node 20+, Maven 17+, optional Docker):

```bash
chmod +x scripts/verify-deploy.sh
./scripts/verify-deploy.sh
```

Runs frontend tests + build, backend tests, JAR package, and (if Docker is installed) builds the image and smoke-tests `/api/health`.

### Build and run (your workflow)

```bash
cp .env.example .env
# Edit SMTP_*, MAIL_FROM, JAVA_OPTS for instance size

sudo docker build -t pdfbolt:1.1.0 -t pdfbolt:latest .
sudo docker run -d \
  --restart always \
  --env-file .env \
  -p 8080:8080 \
  --name pdfbolt \
  pdfbolt:latest

sudo docker logs pdfbolt   # should show LibreOffice + Ghostscript OK
```

Open `http://localhost:8080/app/`

### Compose (equivalent)

```bash
cp .env.example .env
docker compose up --build -d
docker compose logs -f
```

Rebuild after code changes:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

**Notes**

- On **ARM64** hosts (e.g. Apple Silicon), veraPDF is not installed in the image; set `PDFA_VALIDATE=false` in `.env` or accept Ghostscript-only PDF/A (validation skipped).
- `JAVA_OPTS` in `.env` overrides the image default heap (see `.env.example`).

---

## Environment variables

See [.env.example](.env.example). Main keys:

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `8080`) |
| `JAVA_OPTS` | JVM heap, e.g. `-Xms128m -Xmx384m` on small instances |
| `LIBREOFFICE_COMMAND` | Path to `soffice` (default `soffice`) |
| `LIBREOFFICE_TIMEOUT_SECONDS` | Office/HTML conversion timeout |
| `GHOSTSCRIPT_COMMAND` | Path to `gs` (default `gs`) |
| `VERAPDF_COMMAND` | Path to `verapdf` (default `verapdf`) |
| `PDFA_VALIDATE` | Run veraPDF after pdf-to-pdfa (default `true`) |
| `SMTP_*`, `MAIL_FROM` | Contact form email |
| `CONTACT_LOG_ONLY` | `true` = log contact messages, no SMTP |

---

## Suite tools (summary)

| Status | Tools |
|--------|--------|
| **Live** | merge, split, compress, replace, rotate, watermark, protect, unlock, sign, redact (browser), **compare-pdf**, **pdf-to-pdfa** (Ghostscript; optional veraPDF validation), pdf-to-jpg, **pdf-to-word/ppt/excel**, jpg-to-pdf, **html-to-pdf**, **word/powerpoint/excel ↔ PDF**, … |
| **WIP** | ocr-pdf |

**LibreOffice required:** html-to-pdf, word/powerpoint/excel ↔ PDF, pdf-to-word/ppt/excel.

---

## bolt replace — CLI (no server)

```bash
mvn exec:java \
  -Dexec.mainClass=com.pdfreplace.TruePdfReplaceApp \
  -Dexec.args="input.pdf output.pdf 'Invoice Number' 'Bill Number'"
```

Strict mode (same-length replacement):

```bash
mvn exec:java \
  -Dexec.mainClass=com.pdfreplace.TruePdfReplaceApp \
  -Dexec.args="input.pdf output.pdf 'ABC123' 'XYZ789' --strict"
```

## Audit & accuracy

```bash
mvn exec:java -Dexec.mainClass=com.pdfreplace.PdfTextAudit -Dexec.args="input.pdf"
mvn exec:java -Dexec.mainClass=com.pdfreplace.AccuracyCheckApp \
  -Dexec.args="input.pdf output.pdf 'Invoice Number' 'Bill Number'"
```

---

## EC2 troubleshooting

**Garbled replace text** — install fonts (`setup-host.sh`), rebuild app, ensure logs show `Injected substitute font switch FSubPdfReplace`.

**LibreOffice errors** — `soffice --version` must work; set `LIBREOFFICE_COMMAND` in `.env`.

**OOM on conversions** — add 2 GB swap; use `JAVA_OPTS=-Xmx384m`; avoid parallel Office jobs.

---

## What bolt replace supports

- Real content-stream replacement
- `Tj` / `TJ` operators, split matches, font-aware encoding where possible
- See [docs/SETUP.md](docs/SETUP.md) for deploy details

## Known limits

- Replacement text must be encodable by the original font; `--strict` for same-length values
- LibreOffice HTML/CSS ≠ Chrome; complex layouts may differ
- bolt redact (forensic) rasterizes pages — no selectable text in output
