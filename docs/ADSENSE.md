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
