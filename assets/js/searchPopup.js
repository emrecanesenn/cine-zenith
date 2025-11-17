"use strict";


import {IMG_DEFAULT_URL} from './apiSettings.js';
import apiList from "./apiList.js";

let scriptObj, lang;

/**
 * Debounce Fonksiyonu (Asansör kapısı)
 * @param {Function} func - Çalıştırılacak fonksiyon (API isteği)
 * @param {number} delay - Bekleme süresi (ms)
 */
function debounce(func, delay) {
    let timeoutId;

    return function(...args) {
        // Eğer bir zamanlayıcı zaten varsa, onu temizle (kullanıcı hala yazıyor)
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Yeni bir zamanlayıcı kur (kullanıcı durdu, beklemeye başla)
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


/**
 * Sonuçları HTML'e döken fonksiyon
 * @param {Array} results - API'den gelen 'results' dizisi
 */
async function displayResults(results) {
    const resultsList = document.getElementById("search-results-list");
    if (!resultsList) return;

    resultsList.innerHTML = ""; // Önceki sonuçları temizle

    // En fazla 10 sonuç göster
    const topResults = results.slice(0, 5);

    // 'person' (oyuncu/yönetmen) tipindeki sonuçları ve posteri olmayanları filtrele
    const relevantResults = topResults.filter(item =>
        (item.media_type === "movie" || item.media_type === "tv") && item.poster_path
    );

    if (relevantResults.length === 0) {
        resultsList.innerHTML = `<li class="search-no-result" data-i18n="notFoundText"></li>`;
        return;
    }

    // HTML oluştur
    relevantResults.forEach(item => {
        const title = item.name || item.title;
        const mediaType = item.media_type === "tv" ? lang.serieText : lang.movieText;

        // Yılı almak için tarihi parse et (eğer varsa)
        const date = item.release_date || item.first_air_date;
        const year = date ? date.split('-')[0] : 'N/A';

        const poster = `${IMG_DEFAULT_URL}w92${item.poster_path}`; // Küçük poster (w92)

        const card = `
      <li class="search-result-card">
        <a href="details.html?id=${item.id}&type=${item.media_type}" class="search-card-link">
          <figure class="search-card-poster">
            <img src="${poster}" alt="${title}">
          </figure>
          <div class="search-card-info">
            <h3 class="search-card-title">${title}</h3>
            <p class="search-card-meta">${year} • ${mediaType}</p>
          </div>
        </a>
      </li>
    `;
        resultsList.innerHTML += card;
        scriptObj.languageLoad(lang);
    });

    resultsList.innerHTML += `
            <li class="search-more-link">
                <a href="#" data-i18n="deepSearchText">DEEP SEARCH</a>
            </li>
        `

    scriptObj.languageLoad(lang);
}

/**
 * API isteğini yapan asıl fonksiyon
 * @param {string} query - Arama metni
 */
async function performSearch(query) {
    const resultsList = document.getElementById("search-results-list");

    // Eğer sorgu boşsa listeyi temizle ve çık
    if (query.trim() === "") {
        resultsList.innerHTML = "";
        return;
    }

    // Yükleniyor... (Opsiyonel)
    resultsList.innerHTML = `<li class="search-loading" data-i18n="loadingText"></li>`;
    const scriptObj = await apiList();
    scriptObj.languageLoad(lang);
    const results = await scriptObj.searchAll(query); // 'searchAll' fonksiyonunu çağır

    displayResults(results); // Sonuçları ekrana bas
}


// --- ANA YÜRÜTME ---

// 1. Debounce edilmiş fonksiyonumuzu yaratıyoruz
// 500ms (yarım saniye) bekleme süresi idealdir
const debouncedSearch = debounce(performSearch, 500);

// 2. Sayfa yüklendiğinde arama input'unu dinlemeye başla
document.addEventListener("DOMContentLoaded", async function()  {
    const searchInput = document.getElementById("search-modal-input");
    scriptObj = await apiList();
    lang = await scriptObj.language(localStorage.getItem("lang"));
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value;
            debouncedSearch(query);
        });
    }
});