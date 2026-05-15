# Film Ara — OMDB SPA

OMDB API kullanan tek sayfalık film arama uygulaması. Ödev şablonundan oluşturulan kendi deposunuz için hazırlanmıştır.

## Canlı demo (GitHub Pages)

**https://kubradmrgc.github.io/omdb-project/**

> GitHub Pages’i aşağıdaki adımlarla etkinleştirdikten sonra bu adres çalışır.
## Özellikler

- Film adı ile arama (Enter veya Ara butonu)
- Bonus filtreler: tür (film / dizi / bölüm) ve yıl
- Arama sonuçları grid’i, film detay sayfası ve “film bulunamadı” ekranı
- Hata yönetimi (film bulunamadı, ağ hatası, boş arama)
- Sayfa yenilemeden çoklu arama
- Son aramanın URL ve `localStorage` ile korunması
- Responsive tasarım

## Kurulum

### 1. OMDB API anahtarı

1. [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) adresinden ücretsiz anahtar alın.
2. `js/config.example.js` dosyasını `js/config.js` olarak kopyalayın (veya mevcut `config.js` dosyasını düzenleyin).
3. `YOUR_API_KEY_HERE` değerini kendi anahtarınızla değiştirin.

```js
export const API_KEY = "abc12345";
```

> `js/config.js` `.gitignore` içindedir. Pages’te sitenin çalışması için deploy öncesi `config.js` içine anahtarınızı ekleyip tek seferlik commit/push gerekebilir (statik sitede anahtar tarayıcıda görünür).

### 2. Yerel çalıştırma

```bash
npx serve .
```

Tarayıcıda sunucunun verdiği adresi açın (örn. `http://localhost:3000`).

## GitHub Pages

1. Depo → **Settings** → **Pages**
2. **Source:** Deploy from a branch → Branch: **`main`** → Folder: **`/ (root)`** → **Save**
3. Birkaç dakika sonra: `https://kubradmrgc.github.io/omdb-project/`

## SSH ile klon / push

```bash
git clone git@github.com:kubradmrgc/omdb-project.git
```

## Proje yapısı

```
├── index.html
├── css/styles.css
├── js/
│   ├── app.js, api.js, state.js, ui.js
│   ├── detail-render.js, error-render.js
│   └── config.js          # anahtar (gitignore — yerelde oluşturun)
├── assets/
└── README.md
```

## Test kontrol listesi

- Boş arama → uyarı
- Geçerli film → sonuçlar ve detay
- Olmayan film → özelleştirilmiş hata ekranı
- Sayfa yenile → son arama korunur
- GitHub Pages URL’si açılıyor

## Lisans

Eğitim / değerlendirme amaçlı proje.
