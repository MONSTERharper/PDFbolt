# Google AdSense — PDFbolt (mypdfbolt.shop)

## Checklist

| Step | Action |
|------|--------|
| 1 | AdSense → **Sites** → add `mypdfbolt.shop` |
| 2 | AdSense → **Ads** → **By ad unit** → create **Display** (horizontal) → copy **slot ID** |
| 3 | On server: `./scripts/configure-adsense.sh` (paste slot) or set `ADSENSE_BANNER_SLOT` in `.env` |
| 4 | Rebuild & restart Docker (see README) |
| 5 | `curl https://mypdfbolt.shop/ads.txt` → must show `pub-3054286166063522` |
| 6 | AdSense → site → **ads.txt** → wait for **Authorised** |
| 7 | **Privacy policy** at `/privacy` must name Google Analytics & AdSense, cookies, opt-out, retention, COPPA — see live page after deploy |
| 8 | **Support email** `support@mypdfbolt.shop` must receive mail (GoDaddy forwarding → your Gmail) |
| 9 | **Google Search Console** — verify `mypdfbolt.shop`, submit `https://mypdfbolt.shop/sitemap.xml` |
| 10 | Wait for site status past **Getting ready**, then **Request review** |

## Server `.env`

```env
ADSENSE_ENABLED=true
ADSENSE_CLIENT=ca-pub-3054286166063522
ADSENSE_BANNER_SLOT=5459265290
```

Restart container after changes (no UI rebuild needed for slot-only updates).

## Verify

```bash
curl -sS http://127.0.0.1:8080/ads.txt
curl -sS http://127.0.0.1:8080/api/public/ads-config
curl -sS https://mypdfbolt.shop/ads.txt
```

## Nginx

If you use nginx, proxy `/ads.txt` to the app — see [deploy/nginx-mypdfbolt.shop.example](../deploy/nginx-mypdfbolt.shop.example).

## Behaviour

- Banner loads config from `GET /api/public/ads-config`.
- If Google does not fill the slot within ~5s, sponsor mock banners show.
- Without `ADSENSE_BANNER_SLOT`, only mocks run (no empty AdSense box).

## If AdSense says “Site down” or policy issues

1. **Site must return 200** (not 500 JSON) on:
   ```bash
   curl -sS -o /dev/null -w "%{http_code}\n" https://mypdfbolt.shop/
   curl -sS -o /dev/null -w "%{http_code}\n" https://mypdfbolt.shop/privacy
   curl -sS -o /dev/null -w "%{http_code}\n" https://mypdfbolt.shop/terms
   curl -sS -o /dev/null -w "%{http_code}\n" https://mypdfbolt.shop/robots.txt
   curl -sS -o /dev/null -w "%{http_code}\n" https://mypdfbolt.shop/ads.txt
   ```
   Expect `200` for all. `/privacy` must return **HTML** mentioning cookies/AdSense.

2. **Redeploy** after `git pull` and `docker build` — an old container can leave `/privacy` and `/robots.txt` broken while `/` still works.

3. **ads.txt** in AdSense → Sites → must show **Authorised** for `pub-3054286166063522`.

4. **Nginx** must proxy the whole site to the app (see `deploy/nginx-mypdfbolt.shop.example`), including `/ads.txt`.

5. After fixes, use AdSense → **Request review**. “Site down” is often from a crawl when the server was stopped or those URLs returned errors.

## Support email (GoDaddy → Gmail)

Google reviewers may email `support@mypdfbolt.shop` from your site and privacy policy. It must deliver to an inbox you read.

1. Log in to **GoDaddy** → **Email & Office** (or **Domain** → **Email forwarding**).
2. Create or edit forwarding: `support@mypdfbolt.shop` → your personal **Gmail** address.
3. Send a test from Gmail: `mail support@mypdfbolt.shop` — confirm it arrives (check spam once).
4. Optional: in Gmail **Settings → Accounts → Send mail as**, add `support@mypdfbolt.shop` so replies come from the public address.

If you use a different registrar, set the same forward there. The app only displays the address; delivery is DNS/hosting.

## Google Search Console

AdSense reviewers often check whether the site is indexed.

1. Open [Google Search Console](https://search.google.com/search-console).
2. **Add property** → URL prefix `https://mypdfbolt.shop`.
3. Verify ownership (HTML file upload, DNS TXT record, or Google Analytics — pick the easiest for your setup).
4. **Sitemaps** → submit `https://mypdfbolt.shop/sitemap.xml`.
5. Use **URL inspection** on `/`, `/privacy`, and one tool page (e.g. `/bolt/merge`) → **Request indexing** after deploy.

`sitemap.xml` and `robots.txt` are served by the app at the site root.
