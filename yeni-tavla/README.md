# Yeni Tavla — Ayrı uygulama

Bu sürüm eski Tavla Kulübü oyunundan **ayrı bir klasörde** geliştirilir. Eski kök `index.html`, Cloudflare Worker ve oyun ayarları değiştirilmez.

- Web görünümü: https://ilkersert-max.github.io/tavla-kulubu/yeni-tavla/
- Kod klasörü: https://github.com/ilkersert-max/tavla-kulubu/tree/main/yeni-tavla
- Oyun tasarımı yüklenen sade HTML esas alınarak korunmuştur.
- Pulun alta taşmasını azaltan CSS düzenlemesi eklendi.
- Bilgisayara karşı ve aynı cihazda iki kişilik oyun tarayıcıda çalışır.

## İnternet üzerinden iki oyuncu

Aynı masa koduna bağlanan iki oyuncu için **WebSocket sunucusu** gereklidir. GitHub Pages yalnızca statik HTML yayımlar; Node.js sunucusunu **çalıştırmaz**.

```sh
cd yeni-tavla
npm install
npm test
npm start
```

Sunucu: http://localhost:3000 (WebSocket: ws://localhost:3000/ws).

Aynı Wi-Fi içindeki iki cihazda sunucuyu çalıştıran bilgisayarın yerel IP adresini ve portunu kullanın. İnternet üzerinden oynamak için bu Node.js uygulamasını WebSocket destekleyen, sürekli çalışan bir sunucuya dağıtın ve TLS ile `wss://…/ws` adresi tanımlayın. HTML'deki **Sunucu bağlantısı** alanına bu adresi yazın; bu tercih tarayıcıda kaydedilir. Uygulama GitHub Pages'te `https` üzerinden açıldığında `ws://` kullanılamaz, `wss://` gereklidir.

Oyuncu 1: **İnternetten iki oyuncu → Masa aç → 6 haneli kodu paylaş**.
Oyuncu 2: **İnternetten iki oyuncu → Kodla katıl**.

Zarlar sunucuda güvenli rastgele sayı ile üretilir; geçerli hamleler sunucuda doğrulanır; rakibin sırası dışında hamle engellenir. Sunucu bellekte masa tutar: yeniden başlatılırsa masalar kaybolur. Kimlik sistemi, kalıcı oyun geçmişi ve gerçek internet ortamında yük testi henüz bulunmaz.

## Test durumu

`node --test tests/*.test.cjs`: 5 temel kural testi. Tarayıcıda iki cihaz üzerinden canlı internet testi ayrıca yapılmalıdır.
