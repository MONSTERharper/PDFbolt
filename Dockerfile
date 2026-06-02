FROM node:22-bookworm-slim AS frontend
WORKDIR /build
COPY pom.xml .
COPY src ./src
COPY new-ui/package.json new-ui/package-lock.json ./new-ui/
RUN cd new-ui && npm ci
COPY new-ui/ ./new-ui/
RUN cd new-ui && npm run build

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY --from=frontend /build/src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app

# PDFbolt runtime: LibreOffice (Office/HTML→PDF), Ghostscript (PDF/A), fonts (replace/compress).
# veraPDF is installed on amd64 for optional ISO validation (pdf-to-pdfa).
ARG TARGETARCH=amd64
ARG VERAPDF_VERSION=1.28.2

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    fontconfig \
    fonts-dejavu-core \
    fonts-noto-core \
    fonts-liberation \
    fonts-urw-base35 \
    fonts-freefont-ttf \
    fonts-open-sans \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    libreoffice-core-nogui \
    ghostscript \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /tmp/.config /tmp/.cache

# veraPDF greenfield (amd64 only — arm64 images still convert PDF/A via Ghostscript)
RUN if [ "${TARGETARCH}" = "amd64" ]; then \
      apt-get update \
      && apt-get install -y --no-install-recommends wget unzip \
      && ( wget -q "https://software.verapdf.org/releases/${VERAPDF_VERSION%.*}/verapdf-greenfield-${VERAPDF_VERSION}-installer.zip" -O /tmp/verapdf.zip \
           && unzip -q /tmp/verapdf.zip -d /tmp/verapdf-install \
           && java -jar /tmp/verapdf-install/verapdf-greenfield-*-installer.jar -dir /opt/verapdf -installType standard -installSilent \
           && ln -sf /opt/verapdf/verapdf /usr/local/bin/verapdf ) \
      || echo "veraPDF install skipped (pdf-to-pdfa will use Ghostscript only)" \
      && rm -rf /tmp/verapdf.zip /tmp/verapdf-install \
      && apt-get purge -y wget unzip \
      && apt-get autoremove -y \
      && rm -rf /var/lib/apt/lists/*; \
    fi

ENV HOME=/tmp
ENV SAL_USE_VCLPLUGIN=gen
ENV JAVA_OPTS="-Xms128m -Xmx512m"
ENV LIBREOFFICE_COMMAND=soffice
ENV GHOSTSCRIPT_COMMAND=gs
ENV VERAPDF_COMMAND=verapdf
ENV PDFA_VALIDATE=true

COPY --from=build /app/target/*.jar app.jar
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY scripts/docker-healthcheck.sh /usr/local/bin/docker-healthcheck.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-healthcheck.sh

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD ["/usr/local/bin/docker-healthcheck.sh"]

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
