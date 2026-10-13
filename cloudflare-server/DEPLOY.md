# Tavla Kulübü Cloudflare Worker

Bu klasör GitHub Actions üzerinden `tavla-kulubu-server` Worker ve Durable Object olarak yayınlanır.

Gerekli GitHub Actions yapılandırması:
- Variable: `CLOUDFLARE_ACCOUNT_ID`
- Secret: `CLOUDFLARE_API_TOKEN`

Dağıtım: `.github/workflows/deploy-cloudflare.yml`.

Durum kontrolü için sunucu yayınlandıktan sonra `https://<workers-host>/health` adresi kullanılabilir.
