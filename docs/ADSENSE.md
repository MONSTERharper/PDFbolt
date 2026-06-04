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
| 7 | Wait for site status past **Getting ready** |

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
