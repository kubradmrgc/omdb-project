<div align="center">

![Film Ara — OMDB Movie Search](assets/readme-banner.svg)

<br/>

[![Live Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-e040a0?style=for-the-badge&logo=github&logoColor=white)](https://kubradmrgc.github.io/omdb-project/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![OMDB API](https://img.shields.io/badge/OMDB-API-7c52aa?style=for-the-badge)](https://www.omdbapi.com/)

**OMDB veritabanından film arayan, modern ve responsive tek sayfalık web uygulaması.**

[Canlı siteyi aç](https://kubradmrgc.github.io/omdb-project/) · [Kaynak kod](https://github.com/kubradmrgc/omdb-project)

</div>

---

## Önizleme

| Arama & filtreler | Sonuçlar & detay |
|:---:|:---:|
| Grid arama, tür/yıl filtreleri, CineCandy arayüzü | Film kartları, hero detay sayfası, hata ekranı |

---

## Özellikler

- **Arama** — Film adı + Enter veya Ara butonu  
- **Filtreler** — Tür (film / dizi / bölüm), yıl aralığı, tür etiketleri  
- **Sonuç grid’i** — Poster, puan, yıl ve tür rozetleri  
- **Detay sayfası** — Başlık, yıl, tür, yönetmen, poster, özet, IMDb linki  
- **Hata ekranı** — Film bulunamadığında özel tasarım + öneriler  
- **Kalıcılık** — URL parametreleri + `localStorage` (sayfa yenilemede son arama)  
- **Responsive** — Mobil ve masaüstü uyumlu  

---

## Canlı demo

**https://kubradmrgc.github.io/omdb-project/**

---

## Hızlı başlangıç

### 1. Depoyu klonlayın

```bash
git clone git@github.com:kubradmrgc/omdb-project.git
cd omdb-project
```

### 2. OMDB API anahtarı

1. Ücretsiz anahtar: [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)  
2. `js/config.example.js` → `js/config.js` kopyalayın  
3. Anahtarınızı yazın:

```js
export const API_KEY = "sizin_anahtariniz";
```

### 3. Yerel çalıştırma

```bash
npx serve .
```

Tarayıcıda sunucunun verdiği adresi açın.

---

## GitHub Pages

1. **Settings** → **Pages**  
2. **Source:** Deploy from a branch → **`main`** → **`/ (root)`**  
3. **Custom domain** — boş bırakın (ödev için gerekmez)  
4. Yayın adresi: `https://kubradmrgc.github.io/omdb-project/`

---

## Proje yapısı

```
omdb-project/
├── index.html
├── css/styles.css
├── js/
│   ├── app.js              # Uygulama akışı
│   ├── api.js              # OMDB istekleri
│   ├── state.js            # URL + localStorage
│   ├── ui.js               # Arayüz güncellemeleri
│   ├── detail-render.js    # Detay sayfası şablonu
│   ├── error-render.js     # Hata / bulunamadı ekranı
│   └── config.js           # API anahtarı
├── assets/
│   ├── readme-banner.svg
│   └── poster-placeholder.svg
└── README.md
```

---

## Test kontrol listesi

- [ ] Boş arama → uyarı  
- [ ] Geçerli film (ör. `inception`) → sonuçlar + detay  
- [ ] Olmayan film → özelleştirilmiş hata ekranı  
- [ ] Sayfa yenile → son arama korunur  
- [ ] GitHub Pages URL’si çalışıyor  

---

## Geliştirici

**kubradmrgc** — Web geliştirme ödevi · OMDB SPA

---

<p align="center">
  <sub>Veriler <a href="https://www.omdbapi.com/">OMDB API</a> üzerinden sağlanır.</sub>
</p>
