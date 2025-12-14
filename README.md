# 🎬 Cine-Zenith

<div align="center">
  <img src="assets/images/cineafisEn.png" alt="Cine-Zenith Banner" width="800" />
</div>

> **Vanilla JavaScript Yetenek Gösterimi & Bitirme Projesi**

Cine-Zenith, modern web teknolojileri ve **%100 Vanilla JavaScript** kullanılarak geliştirilmiş, dinamik bir film ve dizi keşif platformudur. Bu proje, herhangi bir framework (React, Vue vb.) kullanmadan, saf JavaScript ile kapsamlı bir uygulamanın nasıl kurgulanabileceğini göstermek amacıyla hazırlanmıştır.

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=for-the-badge&logo=javascript)
![TMDb API](https://img.shields.io/badge/API-TMDb-blue?style=for-the-badge&logo=themoviedb)
![HTML5](https://img.shields.io/badge/HTML5-Semantic-orange?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-Responsive-blue?style=for-the-badge&logo=css3)

</div>

---

## 🎯 Projenin Amacı

Bu repo, **JavaScript bitirme projem** olarak geliştirilmiştir. Temel amaç; hazır bir HTML/CSS şablonunu alıp, aşağıdaki konulardaki yetkinliğimi saf JavaScript ile sınamaktır:
* DOM Manipülasyonu
* Asenkron Programlama (Fetch API / Async-Await)
* Modüler Mimari (ES6 Modules)
* Client-Side State Yönetimi

---

## ✨ Temel Özellikler

Proje şu an **%90** tamamlanma aşamasındadır ve geliştirilmeye devam edilmektedir.

* ⚡ **Frameworksüz Yapı:** Tamamen saf JavaScript ile yazılmıştır.
* 🌍 **Dinamik İçerik:** Tüm veriler (Filmler, Diziler, Kişiler) anlık olarak **TMDb API** üzerinden çekilmektedir.
* 🔍 **Gelişmiş Keşif:**
    * Debounce tekniği ile optimize edilmiş canlı arama (Search Popup).
    * Detaylı filtreleme (Tür, Puan, Sıralama) ve sayfalama sistemi.
* ❤️ **Favori Sistemi:** `LocalStorage` kullanılarak geliştirilmiş, kalıcı favorilere ekleme/çıkarma özelliği.
* 🗣️ **Çoklu Dil Desteği:** Türkçe ve İngilizce dil seçenekleri arasında anlık geçiş.
* 📱 **Responsive Tasarım:** Mobil uyumlu modern arayüz.

---

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için şu adımları izleyebilirsiniz:

1.  **Repoyu klonlayın:**
    ```bash
    git clone [https://github.com/emrecanesenn/cine-zenith.git](https://github.com/emrecanesenn/cine-zenith.git)
    ```

2.  **Proje klasörüne gidin:**
    ```bash
    cd cine-zenith
    ```

3.  **Projeyi Çalıştırın:**
    Proje ES6 modülleri (`type="module"`) kullandığı için HTML dosyalarını doğrudan açmak yerine bir yerel sunucu kullanmalısınız.
    * VS Code kullanıyorsanız **Live Server** eklentisi ile `index.html` dosyasını açın.

### 🔑 API Anahtarı Ayarı
Proje varsayılan olarak bir API anahtarı ile gelir ancak limitlere takılmamak için `assets/js/apiSettings.js` dosyasındaki `API_KEY` alanına kendi TMDb API anahtarınızı girmeniz önerilir.

```javascript
// assets/js/apiSettings.js
export const API_KEY = 'YOUR_TMDB_API_KEY';

Haklısın, kusura bakma. Yanlış anlaşılma oldu. İsteğini şimdi çok daha net anladım.

Aşağıdaki kod bloğunun tamamını kopyalayıp README.md dosyanın içine yapıştırırsan; hem görsel ortalanmış ve boyutlandırılmış olacak hem de linkler tam istediğin gibi tıklanabilir şekilde çalışacaktır.

Markdown

# 🎬 Cine-Zenith

<div align="center">
  <img src="assets/images/cineafisEn.png" alt="Cine-Zenith Banner" width="800" />
</div>

> **Vanilla JavaScript Yetenek Gösterimi & Bitirme Projesi**

Cine-Zenith, modern web teknolojileri ve **%100 Vanilla JavaScript** kullanılarak geliştirilmiş, dinamik bir film ve dizi keşif platformudur. Bu proje, herhangi bir framework (React, Vue vb.) kullanmadan, saf JavaScript ile kapsamlı bir uygulamanın nasıl kurgulanabileceğini göstermek amacıyla hazırlanmıştır.

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=for-the-badge&logo=javascript)
![TMDb API](https://img.shields.io/badge/API-TMDb-blue?style=for-the-badge&logo=themoviedb)
![HTML5](https://img.shields.io/badge/HTML5-Semantic-orange?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-Responsive-blue?style=for-the-badge&logo=css3)

</div>

---

## 🎯 Projenin Amacı

Bu repo, **JavaScript bitirme projem** olarak geliştirilmiştir. Temel amaç; hazır bir HTML/CSS şablonunu alıp, aşağıdaki konulardaki yetkinliğimi saf JavaScript ile sınamaktır:
* DOM Manipülasyonu
* Asenkron Programlama (Fetch API / Async-Await)
* Modüler Mimari (ES6 Modules)
* Client-Side State Yönetimi

---

## ✨ Temel Özellikler

Proje şu an **%90** tamamlanma aşamasındadır ve geliştirilmeye devam edilmektedir.

* ⚡ **Frameworksüz Yapı:** Tamamen saf JavaScript ile yazılmıştır.
* 🌍 **Dinamik İçerik:** Tüm veriler (Filmler, Diziler, Kişiler) anlık olarak **TMDb API** üzerinden çekilmektedir.
* 🔍 **Gelişmiş Keşif:**
    * Debounce tekniği ile optimize edilmiş canlı arama (Search Popup).
    * Detaylı filtreleme (Tür, Puan, Sıralama) ve sayfalama sistemi.
* ❤️ **Favori Sistemi:** `LocalStorage` kullanılarak geliştirilmiş, kalıcı favorilere ekleme/çıkarma özelliği.
* 🗣️ **Çoklu Dil Desteği:** Türkçe ve İngilizce dil seçenekleri arasında anlık geçiş.
* 📱 **Responsive Tasarım:** Mobil uyumlu modern arayüz.

---

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için şu adımları izleyebilirsiniz:

1.  **Repoyu klonlayın:**
    ```bash
    git clone [https://github.com/emrecanesenn/cine-zenith.git](https://github.com/emrecanesenn/cine-zenith.git)
    ```

2.  **Proje klasörüne gidin:**
    ```bash
    cd cine-zenith
    ```

3.  **Projeyi Çalıştırın:**
    Proje ES6 modülleri (`type="module"`) kullandığı için HTML dosyalarını doğrudan açmak yerine bir yerel sunucu kullanmalısınız.
    * VS Code kullanıyorsanız **Live Server** eklentisi ile `index.html` dosyasını açın.

### 🔑 API Anahtarı Ayarı
Proje varsayılan olarak bir API anahtarı ile gelir ancak limitlere takılmamak için `assets/js/apiSettings.js` dosyasındaki `API_KEY` alanına kendi TMDb API anahtarınızı girmeniz önerilir.

```javascript
// assets/js/apiSettings.js
export const API_KEY = 'YOUR_TMDB_API_KEY';
```
🎨 Tasarım ve Kaynakça (Credits)
Bu projenin Front-End tasarımı (HTML/CSS Şablonu) bana ait değildir. Şablon, harika tasarımlar yapan codewithsadee tarafından hazırlanmıştır.

Ben bu statik şablonu alarak; tüm işlevselliği, API entegrasyonlarını, dinamik veri akışını, yönlendirme (routing) mantığını ve JavaScript mimarisini sıfırdan yazdım.

Tema Tasarımcısı: [@Codewithsadee](https://github.com/codewithsadee)

Kullanılan Orijinal Tema:  [@Filmlane](https://github.com/codewithsadee/filmlane)

⚠️ Proje Durumu
🚧 Work in Progress (%90)

Proje büyük ölçüde tamamlanmış olsa da, bitirme projesi kapsamında olduğu için bazı hatalar (bugs) veya eksik özellikler olabilir. Geliştirme süreci ve kod iyileştirme işlemleri devam etmektedir.
