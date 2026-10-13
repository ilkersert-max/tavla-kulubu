# Tavla Kulübü — Geliştirme planı (13.10.2026)

Korunacak akış: **Masa Aç / Oyuna Katıl / Bilgisayara Karşı**. Önceki ana sürüm yedeği: `backup-before-roadmap-20261013`.

## Faz 1 — Oyun güvenilirliği (en yüksek öncelik)
- [x] Kuralların kaynak kodunu gözden geçir: kırık pul girişi, iki zar zorunluluğu, pul toplama, turun bitişi.
- [x] Canlı WebSocket koptuktan sonra sınırlı yeniden bağlanma denemesi.
- [ ] Yeniden bağlantıda host/misafir oyun durumu senkronunun iki cihazda doğrulanması.
- [ ] Otomatik senaryo testleri: kırık pul bloke olması, yüksek zar, çift zar, mars, toplama, hamlesiz tur.
- [ ] Yenileme sırasında rol ve masa kimliğini güvenli geri yükleme.
- [ ] İki telefon ve PC–telefon uçtan uca testleri.
- [ ] Sunucu tarafında sıra, zar ve hamle doğrulamasını güçlendirme.

## Faz 2 — Görsel koleksiyonlar
- [x] 6 desenli pul stili: mermer, ahşap, halkalı, karbon, sedef, geometrik.
- [x] 7 yeni zar stili: yakut, zümrüt, safir, altın, obsidyen, kristal, ahşap.
- [x] 6 canlı tabla teması: zümrüt, yakut, safir, turkuaz, mor, ceviz.
- [x] Her iki oyuncunun açık/koyu pullarla ayırt edilebilir kalması; stil yerel.
- [ ] Ayarlarda küçük canlı önizleme kartları.
- [ ] Kontrast/erişilebilirlik ve 60 FPS mobil çizim kontrolü.

## Faz 3 — Arkadaşlık ve davetler
- [x] Kişisel arkadaş listeleri.
- [x] Görünürlük: son 75 saniyelik yoklamaya göre yaklaşık çevrimiçi durumu.
- [x] Arkadaş listesinden masa daveti oluşturma ve gönderme.
- [x] Oyun açıkken gelen davetler için Kabul/Reddet.
- [ ] Arkadaşlık isteği için karşılıklı onay ve engelleme.
- [ ] Oyunda meşgul durumunu gösterme.
- [ ] Kalıcı hesap kurtarma / Google OAuth, tercih edilirse daha sonra.
- [ ] Tarayıcı kapalıyken push bildirimi; izin, PWA ve platform desteği gerekli.

Not: Kodun sözdizimsel kontrolü, gerçek cihaz ve uçtan uca doğrulamanın yerine geçmez. Sunucudaki isim/arkadaş kimliği bugün bir tarayıcıda saklanan token'a bağlıdır.
