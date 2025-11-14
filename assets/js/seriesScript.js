"use strict"

import {API_KEY, DEFAULT_URL, IMG_DEFAULT_URL, LANG_TR} from './apiSettings.js';
import apiList from "./apiList.js";

const cacheApi = {
    ontheair: null,
    toprated: null
}

async function scriptList (eventDetail) {
    const scriptObj = await apiList();
    const isOnTheAir = cacheApi.ontheair;
    const isTopRated = cacheApi.toprated;
    if (eventDetail === "toprated") {
        if (isTopRated) {
            await topRatedSection(cacheApi.toprated)
        } else {
            const topRatedSeries = await scriptObj.topRatedSeries();
            await topRatedSection(topRatedSeries)
            cacheApi.toprated = topRatedSeries;
        }
    }
    if (eventDetail === "ontheair") {
        if (isOnTheAir) {
            await onTheAirSection(cacheApi.ontheair)
        } else {
            const onTheAirSeries = await scriptObj.onTheAirSeries()
            await onTheAirSection(onTheAirSeries)
            cacheApi.ontheair = onTheAirSeries;
        }
    }
}

function generateSkeletonCards(count) {
    let skeletons = "";
    for (let i = 0; i < count; i++) {
        skeletons += `
            <li>
                <div class="movie-card skeleton-card">
                    <div class="card-banner skeleton-banner"></div>
                    <div class="title-wrapper">
                         <div class="skeleton-title"></div>
                    </div>
                    <div class="card-meta">
                        <div class="skeleton-meta"></div>
                    </div>
                </div>
            </li>
        `;
    }
    return skeletons;
}

async function onTheAirSection(onTheAir) {
    const seriesList = document.getElementById("on-the-air-list");

    // Minimum süre ve başlangıç zamanı
    const MINIMUM_DURATION = 250;
    const startTime = Date.now();

    // 1. İskeletleri bas (5 tane)
    seriesList.innerHTML = generateSkeletonCards(8);

    // 2. Orijinal kodunda 8 adet bulana kadar devam ediyordun.
    // Hız için ilk 15'ini paralel çekip, 8 geçerli olanı alacağız.
    const seriesToFetch = onTheAir.slice(0, 15);

    try {
        // 3. 10 dizinin detayını AYNI ANDA (Paralel) iste
        const seriesDetailPromises = seriesToFetch.map(series =>
            fetch(`${DEFAULT_URL}/tv/${series.id}?api_key=${API_KEY}`)
                .then(res => res.json())
        );

        const allSeriesDetails = await Promise.all(seriesDetailPromises);

        // 4. Gelen veriyi filtrele ve ilk 8 geçerli dizi için HTML oluştur
        let validCount = 0;
        const seriesHTML = allSeriesDetails
            .map(seriesDetails => {
                if (validCount >= 8) return ""; // 8 tane bulduysak dur

                let activeSeasonNumber = seriesDetails.last_episode_to_air?.season_number;

                if (activeSeasonNumber) {
                    activeSeasonNumber = `S.${activeSeasonNumber}/Ep.${seriesDetails.last_episode_to_air?.episode_number}`;
                    validCount++;
                    // Geçerli HTML'i döndür
                    return `
                        <li>
                            <div class="movie-card">
                                  <a href="details.html">
                                      <figure class="card-banner">
                                          <img src="${IMG_DEFAULT_URL}original/${seriesDetails.poster_path}" alt="${seriesDetails.name} poster">
                                      </figure>
                                  </a>
                                  <div class="title-wrapper">
                                      <a href="details.html">
                                          <h3 class="card-title">${seriesDetails.name}</h3>
                                      </a>
                                      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px;"> ${seriesDetails.number_of_seasons} Seasons</span>
                                  </div>
                                  <div class="card-meta">
                                      <div class="badge badge-outline">TV</div>
                                      <div class="duration">
                                          <ion-icon name="tv-outline"></ion-icon>
                                          <span>${activeSeasonNumber} is on air</span>
                                      </div>
                                      <div class="rating">
                                          <ion-icon name="star"></ion-icon>
                                          <data>${seriesDetails.vote_average.toFixed(1)}</data>
                                      </div>
                                  </div>
                              </div>
                        </li>
                    `;
                }
                return ""; // Geçerli değilse boş string döndür
            })
            .join(''); // Tüm HTML'leri birleştir

        // 5. SÜRE KONTROLÜ
        const elapsedTime = Date.now() - startTime;
        const delay = Math.max(0, MINIMUM_DURATION - elapsedTime); // 1 saniyeden azsa farkı al, uzunsa 0 al

        setTimeout(() => {
            seriesList.innerHTML = seriesHTML || "<li>Yayında olan dizi bulunamadı.</li>";
        }, delay);

    } catch (error) {
        alert(`HATA: ${error}`);
        // Hata durumunda da bekle
        const errorElapsedTime = Date.now() - startTime;
        const errorDelay = Math.max(0, MINIMUM_DURATION - errorElapsedTime);

        setTimeout(() => {
            seriesList.innerHTML = "<li>Veriler yüklenemedi.</li>";
        }, errorDelay);
    }
}

async function topRatedSection(data) {
    const seriesList = document.getElementById("toprated-list");
    const toprated = data.slice(0, 8); // 8 tane al

    // Minimum süre ve başlangıç zamanı
    const MINIMUM_DURATION = 250;
    const startTime = Date.now();

    // 1. İskeletleri bas (8 tane)
    seriesList.innerHTML = generateSkeletonCards(8);

    try{
        // 2. 8 dizinin detayını AYNI ANDA (Paralel) iste
        const seriesDetailPromises = toprated.map(series =>
            fetch(`${DEFAULT_URL}/tv/${series.id}?api_key=${API_KEY}`)
                .then(res => res.json())
        );

        const allSeriesDetails = await Promise.all(seriesDetailPromises);

        // 3. Gelen verilerle HTML'i oluştur
        const seriesHTML = allSeriesDetails.map(seriesDetails => `
            <li>
                <div class="movie-card">
                    <a href="details.html">
                      <figure class="card-banner">
                        <img src="${IMG_DEFAULT_URL}original${seriesDetails.poster_path}" alt="${seriesDetails.name} poster">
                      </figure>
                    </a>
                    <div class="title-wrapper">
                      <a href="details.html">
                        <h3 class="card-title">${seriesDetails.name}</h3>
                      </a>
                      <span>${seriesDetails.first_air_date.slice(0, 4)}</span>
                    </div>
                    <div class="card-meta">
                      <div class="badge badge-outline">TV</div>
                      <div class="duration">
                        <ion-icon name="bookmark-outline"></ion-icon>
                        <span>${seriesDetails.number_of_seasons} Seasons</span>
                      </div>
                      <div class="rating">
                        <ion-icon name="star"></ion-icon>
                        <data>${seriesDetails.vote_average.toFixed(1)}</data>
                      </div>
                    </div>
                  </div>
            </li>
        `).join(''); // Tüm HTML'leri birleştir

        // 4. SÜRE KONTROLÜ
        const elapsedTime = Date.now() - startTime;
        const delay = Math.max(0, MINIMUM_DURATION - elapsedTime);

        setTimeout(() => {
            seriesList.innerHTML = seriesHTML;
        }, delay);

    } catch (e) {
        alert(`HATA: ${e}`);
        // Hata durumunda da bekle
        const errorElapsedTime = Date.now() - startTime;
        const errorDelay = Math.max(0, MINIMUM_DURATION - errorElapsedTime);

        setTimeout(() => {
            seriesList.innerHTML = "<li>Veriler yüklenemedi.</li>";
        }, errorDelay);
    }
}

const topRatedSeriesButton = document.getElementById("top-rated-series");
const topRatedMoviesButton = document.getElementById("top-rated-movies");
topRatedSeriesButton.addEventListener("click", () => {
    if (topRatedSeriesButton.classList.contains("onTopRated")) return;
    topRatedSeriesButton.classList.add("onTopRated");
    topRatedMoviesButton.classList.remove("onTopRated");
    document.getElementById("tprated-movie-series").innerHTML = "Series";
    scriptList("toprated");
})

const ontheairSeriesButton = document.getElementById("on-the-air-series");
const ontheairMoviesButton = document.getElementById("on-the-air-movies");
ontheairSeriesButton.addEventListener("click", () => {
    if (ontheairSeriesButton.classList.contains("onTheAir")) return;
    ontheairSeriesButton.classList.add("onTheAir");
    ontheairMoviesButton.classList.remove("onTheAir");
    document.getElementById("ontheair-movie-series").innerHTML = "Series";
    scriptList("ontheair")
})