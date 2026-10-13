# Tavla Kulübü v2

Mobil ve masaüstü tarayıcılar için tek dosyalık tavla oyunu.

## Kullanım
`index.html` dosyasını açın. Bilgisayara karşı veya aynı cihazda iki kişi oynama modu internetsiz çalışır.

- **Zar at:** İki zarın atılışı animasyonla gösterilir; çift zarda dört hamle açılır.
- **Hamle:** Sıradaki oyuncunun puluna dokunun, ardından yeşil vurgulanmış hedefe dokunun. Hamle geçmişi sağ panelde görünür.
- **Hamleyi bitir:** Yasal hamle kalmadığında etkinleşir.
- **Yeni oyun:** Mevcut eli yeniden başlatır.
- **Online:** GitHub Pages gibi HTTPS barındırma ve PeerJS'in sinyal altyapısına erişim gerektirir. Farklı cihazlar ve bağlantı kayıpları için tam uçtan uca testi henüz yapılmadı. Üretim ölçekli hesap/kalıcı maç yönetimi bulunmuyor.

## GitHub Pages
1. GitHub hesabınızda `tavla-kulubu` adında **public** yeni depo açın.
2. `index.html` (ve bu README'yi) deponun köküne yükleyin.
3. Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.
4. Adres `https://ilkersert-max.github.io/tavla-kulubu/` şeklindedir (Pages etkinleştikten sonra).

## Testler
- JavaScript sözdizimi: `node --check game.js`
- Chromium üzerinde 1280x850 ve 390x844 görünüm: sayfa yüklemesi, mod geçişi, zar atma, JavaScript hata kontrolü geçti.
- Online eşleşme ve tam maç sonu **henüz doğrulanmadı**.

## Gizlilik
Giriş sistemi ve veritabanı kullanılmıyor. PeerJS dış servisi online eşleştirme için yalnızca online modda indirilir/çalıştırılır. Oyun gerçek para/bahis içermez.
