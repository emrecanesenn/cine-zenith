import {API_KEY, IMG_DEFAULT_URL, DEFAULT_URL, language} from "./apiSettings.js";
import apiList from "./apiList.js";
let LANG = language(), langLoad;

async function heroAndTrending() {
    const scriptObj = await apiList();
    const lang = await scriptObj.language(localStorage.getItem("lang"))
    const trendData = await scriptObj.trendingAllWeek();
    const heroData = await scriptObj.heroSectionData()
    await trendingSection(trendData, lang)
    await heroSection(heroData)
    langLoad = await scriptObj.languageLoad
}

function generateSkeletonCards(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        // Basit bir placeholder (iskelet) kartı döndürün
        html += `
            <li>
                <div class="movie-card skeleton">
                    <div class="card-banner"></div>
                    <div class="title-wrapper">
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line smallest"></div>
                    </div>
                </div>
            </li>
        `;
    }
    return html;
}

// HERO SECTION FIRST ON THE AIR FILM

let count = 0, heroData;
async function heroSection(data) {
    const heroSectionEl = document.getElementById("heroSection");
    const heroContentEl = heroSectionEl.querySelector('.hero-content');

    try {
        let movieData;
        if (!heroData) {heroData = data}

        // 1. GEÇİŞ BAŞLANGICI: Yüklenirken içeriği gizle (Fade-out)
        heroSectionEl.classList.add('is-loading');
        heroContentEl.classList.add('is-loading');

        // --- API Verisi Çekme Bloğu ---
        if (count >= heroData.length) {
            count = 0;
            return;
        } else {
            const resolve = await fetch(`${DEFAULT_URL}/movie/${heroData[count].id}?api_key=${API_KEY}&${LANG}`)
            if (!resolve.ok) throw new Error(`The movie is not uploading`)
            movieData = await resolve.json();
            count++;
        }
        // -------------------------------

        // DOM Değişkenleri
        const titleEl = document.getElementById("hero-title")
        const taglineEl = document.getElementById("hero-tagline")
        const genresEl = document.getElementById("hero-genres")
        const releaseDateEl = document.getElementById("hero-release-date")
        const runtimeEl = document.getElementById("hero-runtime")

        // 2. DOM'u Yeni Verilerle Güncelle (Gizli durumda yapılır)

        // Slogan (Tagline) ve Özet (Overview) Güncellemesi
        const defaultMessage = `A trending cinematic masterpiece.`;

        if (movieData.tagline) {
            taglineEl.innerHTML = movieData.tagline;
        } else {
            taglineEl.innerHTML = defaultMessage;
        }

        // Diğer DOM Güncellemeleri
        titleEl.innerHTML = `<a style="text-decoration: none; outline: none; color: var(--citrine)" href="details.html?id=${movieData.id}&type=movie">${movieData.title}</a>`;
        releaseDateEl.innerHTML = movieData.release_date.slice(0, 4);
        runtimeEl.innerHTML = `${movieData.runtime} <i data-i18n="minuteShort"></i>`;

        // Adult control PG/18+
        const isAdult = movieData.adult;
        const ratingBadgeEl = document.querySelector('.badge-fill');

        if (isAdult) {
            ratingBadgeEl.innerHTML = '18+';
        } else {
            ratingBadgeEl.innerHTML = 'PG';
        }

        // Vote Average Display
        const ratingEl = document.getElementById("hero-rating");
        ratingEl.innerHTML = movieData.vote_average.toFixed(1);


        // Genres Displaying (Tür Listeleme)
        genresEl.innerHTML = "";
        const genreNames = movieData.genres.map(genre => genre.name);
        genreNames.sort()

        for (let x = 0; x < genreNames.length; x++) {
            if (x === ( genreNames.length - 1 ))
                genresEl.innerHTML += `<a href="#">${genreNames[x]}</a>`;
            else
                genresEl.innerHTML += `<a href="#">${genreNames[x]},</a>`;
        }

        // 3. Arka Plan Resmini ÖNCE Yükle (Görselin tamamen inmesini bekle)
        const newImageUrl = `${IMG_DEFAULT_URL}original${movieData.backdrop_path}`;

        await new Promise((resolve, reject) => {
            const img = new Image();
            img.src = newImageUrl;
            img.onload = resolve;
            img.onerror = reject;
        });

        // 4. Resim yüklendikten SONRA DOM'a uygula
        heroSectionEl.style.backgroundImage = `url("${newImageUrl}")`;
        heroSectionEl.style.backgroundSize = 'cover';
        heroSectionEl.style.backgroundPosition = 'center';

        // 5. GEÇİŞ BİTİŞİ: Yükleme sınıfını kaldır (Fade-in)
        heroSectionEl.classList.remove('is-loading');
        heroContentEl.classList.remove('is-loading');

    } catch (e) {
        heroSectionEl.classList.remove('is-loading');
        heroContentEl.classList.remove('is-loading');
        alert(`HATA: ${e}`)
    }
}

async function trendingSection(data, lang) {
    const trendingList = document.getElementById("trending-list");
    const trends = data.slice(0, 8); // İlk 8 popüler öğeyi al

    const MINIMUM_DURATION = 1000;
    const startTime = Date.now();

    // 1. İskeletleri bas (8 tane)
    trendingList.innerHTML = generateSkeletonCards(8);

    try {
        // 2. Trend listesindeki HER BİR öğenin detayını çek
        // media_type'a göre URL değişecek!
        const detailPromises = trends.map(item => {
            const mediaType = item.media_type;
            const itemId = item.id;
            // Film ise film API'sine, dizi ise dizi API'sine istek at
            return fetch(`${DEFAULT_URL}/${mediaType}/${itemId}?api_key=${API_KEY}&${LANG}`)
                .then(res => res.json());
        });

        const allDetails = await Promise.all(detailPromises);

        // 3. HTML'i oluştur
        const trendingHTML = allDetails.map((details, index) => {
            const item = trends[index]; // Orijinal trend verisi
            const mediaType = item.media_type;
            let cardMetaHTML = "";

            // 4. EĞER DİZİ İSE (TV)
            if (mediaType === 'tv') {
                cardMetaHTML = `
                    <div class="badge badge-outline" data-i18n="serieText"></div>
                    <div class="duration">
                        <ion-icon name="bookmark-outline"></ion-icon>
                        <span>${details.number_of_seasons} <b data-i18n="season"></b></span>
                    </div>
                    <div class="rating">
                        <ion-icon name="flame-outline"></ion-icon> <data>${item.popularity.toFixed(0)}</data> </div>
                `;
                // EĞER FİLM İSE (MOVIE)
            } else if (mediaType === 'movie') {
                cardMetaHTML = `
                    <div class="badge badge-outline" data-i18n="movieText"></div>
                    <div class="duration">
                        <ion-icon name="time-outline"></ion-icon>
                        <span>${details.runtime} <i data-i18n="minuteShort"></i></span>
                    </div>
                    <div class="rating">
                        <ion-icon name="flame-outline"></ion-icon> <data>${item.popularity.toFixed(0)}</data> </div>
                `;
            }

            // 'name' diziler için, 'title' filmler için kullanılır
            const title = details.name || details.title;
            const releaseDate = (details.first_air_date || details.release_date || "").slice(0, 4);

            return `
                <li>
                    <div class="movie-card">
                        <a href="details.html?id=${item.id}&type=${item.media_type}">
                            <figure class="card-banner">
                                <img src="${IMG_DEFAULT_URL}original${details.poster_path}" alt="${title} poster">
                            </figure>
                        </a>
                        <div class="title-wrapper">
                            <a href="details.html?id=${details.id}&type=${details.media_type}">
                                <h3 class="card-title">${title}</h3>
                            </a>
                            <span>${releaseDate}</span>
                        </div>
                        <div class="card-meta">
                            ${cardMetaHTML}
                        </div>
                    </div>
                </li>
            `;
        }).join('');

        // 5. SÜRE KONTROLÜ
        const elapsedTime = Date.now() - startTime;
        const delay = Math.max(0, MINIMUM_DURATION - elapsedTime);

        setTimeout(() => {
            trendingList.innerHTML = trendingHTML;
            langLoad(lang)
        }, delay);

    } catch (e) {
        alert(`HATA: ${e}`);
        // Hata durumunda da bekle
        const errorElapsedTime = Date.now() - startTime;
        const errorDelay = Math.max(0, MINIMUM_DURATION - errorElapsedTime);

        setTimeout(() => {
            trendingList.innerHTML = "<li>Trendler yüklenemedi.</li>";
        }, errorDelay);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    heroAndTrending()
    setInterval(heroSection, 12000)
})

