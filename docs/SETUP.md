# PDFbolt — initial server setup

Use this guide for a fresh **EC2 / VPS** (e.g. `t3.micro`, 15 GB disk, 1 GB RAM + **2 GB swap**).

## What the server needs

| Component | Purpose |
|-----------|---------|
| **Java 17** | Spring Boot API (~31 MB JAR) |
| **LibreOffice (`soffice`)** | bolt html-to-pdf, word/powerpoint/excel → PDF |
| **Fonts** | bolt replace glyph substitution |
| **Maven + Node** | Build only (not required at runtime if you deploy a pre-built JAR) |
| **2 GB swap** | Avoid OOM during LibreOffice conversions on 1 GB RAM |

Tools that run **in the browser only** (no LibreOffice): **bolt redact** (forensic download).

---

## One-command host setup (recommended)

On the server, from the repo root:

```bash
chmod +x scripts/*.sh
sudo SWAP_SIZE_GB=2 ./scripts/setup-host.sh
```

Optional: install Node for building the UI on the server:

```bash
sudo INSTALL_NODE=true ./scripts/setup-host.sh
```

---

## Manual steps (Ubuntu / Debian)

```bash
# Swap (2 GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-pdfbolt-swappiness.conf
sudo sysctl -p /etc/sysctl.d/99-pdfbolt-swappiness.conf

# Packages
sudo apt-get update
sudo apt-get install -y --no-install-recommends \
  openjdk-17-jre-headless maven \
  fontconfig fonts-dejavu-core fonts-liberation fonts-noto-core fonts-freefont-ttf \
  libreoffice-writer libreoffice-calc libreoffice-impress libreoffice-core-nogui

soffice --version
java -version
```

## Manual steps (Amazon Linux 2023)

```bash
# Swap — same as above

sudo dnf install -y \
  java-17-amazon-corretto-headless maven \
  fontconfig dejavu-sans-fonts liberation-fonts \
  libreoffice-core libreoffice-writer libreoffice-calc libreoffice-impress

soffice --version
```

---

## Configure environment

```bash
cp .env.example .env
# Edit SMTP_*, MAIL_FROM, PORT, JAVA_OPTS, LIBREOFFICE_COMMAND if needed
```

| Variable | Default | Notes |
|----------|---------|--------|
| `PORT` | `8080` | HTTP port |
| `JAVA_OPTS` | `-Xms128m -Xmx384m` | Keep heap modest on 1 GB RAM |
| `LIBREOFFICE_COMMAND` | `soffice` | Full path if not on PATH |
| `LIBREOFFICE_TIMEOUT_SECONDS` | `120` | Per conversion |
| `SMTP_*` / `MAIL_FROM` | — | Contact form email |

---

## Build and run (Maven deploy)

```bash
./scripts/build.sh
./scripts/run.sh
```

Open: `http://<server-ip>:8080/app/`

### Production: systemd (optional)

```bash
sudo cp deploy/pdfbolt.service.example /etc/systemd/system/pdfbolt.service
# Edit WorkingDirectory and User in the unit file
sudo systemctl daemon-reload
sudo systemctl enable --now pdfbolt
sudo journalctl -u pdfbolt -f
```

---

## Docker deploy (LibreOffice included in image)

```bash
cp .env.example .env
docker compose up --build -d
docker compose logs -f
```

No host LibreOffice install needed when using Docker.

---

## Verify Live tools

| Tool | Needs LibreOffice |
|------|-------------------|
| bolt html-to-pdf | Yes |
| bolt word-to-pdf | Yes |
| bolt powerpoint-to-pdf | Yes |
| bolt excel-to-pdf | Yes |
| bolt replace | No (needs fonts) |
| bolt redact | No (browser-side) |

Quick API smoke test (after `soffice` works):

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -F operation=html-to-pdf \
  -F text='<h1>Test</h1>' \
  -F title=Test \
  http://localhost:8080/api/pdf/tools
# Expect 200
```

---

## Troubleshooting

**`LibreOffice is not installed or not on PATH`**

- Run `soffice --version` on the server.
- Set `LIBREOFFICE_COMMAND=/usr/bin/soffice` in `.env`.

**Process killed during conversion**

- Add swap (`setup-host.sh`).
- Lower `JAVA_OPTS` heap; run one conversion at a time.

**Garbled replace text**

- Install font packages (see setup script).
- Rebuild and restart the app.
