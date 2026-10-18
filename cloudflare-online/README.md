# Tavla Kulübü – Cloudflare

Cloudflare Worker + Durable Object ve statik HTML/CSS/JS.

```sh
cd cloudflare-online
npx wrangler login
npx wrangler deploy
```

Worker ve Durable Object Cloudflare üzerinde dağıtılmadan statik GitHub Pages sayfası iki oyuncuyu eşleştiremez. Yayın adresini Wrangler çıktısından açın.

Durable Object üzerinde iki oyuncu, durum paylaşımı, zar ve hamle doğrulaması. Yerel test: `npx wrangler dev`.
