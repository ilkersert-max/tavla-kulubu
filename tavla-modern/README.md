# Tavla Modern — ayrı Cloudflare denemesi

Bu klasör önceki çalışan Tavla Kulübü'nden bağımsızdır. Orijinal ana oyunu değiştirmez.

## Özellikler
- Bilgisayara karşı: Beyaz insan, Siyah bot (ayrı rastgele oda)
- İki arkadaş: masa aç, kodla katıl, davet bağlantısını kopyala
- WebSocket ile aynı masada gerçek zamanlı durum
- Zar atma ve hamlelerin Cloudflare Durable Object sunucusunda doğrulanması
- Ayrı oyuncu perspektifleri, yatay telefonlara sığan CSS tahta
- Kurallar için `node --test tests/*.test.mjs`

## Yayın
GitHub Actions iş akışı `.github/workflows/tavla-modern.yml` mevcut Cloudflare GitHub secrets/vars değerleriyle ayrı `tavla-modern` Worker'ını yayınlar.

Beklenen adres: https://tavla-modern.ilkersert.workers.dev/

**Önemli:** Adres yalnızca GitHub Actions dağıtımı başarılı olduktan sonra çalışır. Canlı tarayıcı ve iki farklı cihaz testi ayrıca gereklidir.

## Esin kaynağı ve lisans
Kurallar tasarımında quasoft/backgammonjs projesinin standart tavla ayrımı ve modelleri analiz edilmiştir:
https://github.com/quasoft/backgammonjs

Bu sürüm o projenin eski Express/Socket.IO/MongoDB uygulamasını veya kaynak modüllerini birebir içermemektedir; aynı standart hamle kurallarını ayrı ve basitleştirilmiş bir Cloudflare kurallar motorunda uygular. Quasoft kaynak kodları içe aktarılmamıştır.
