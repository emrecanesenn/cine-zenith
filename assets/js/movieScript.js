"use strict";

import {API_KEY, DEFAULT_URL, IMG_DEFAULT_URL, language} from './apiSettings.js';
import apiList from "./apiList.js";
let LANG = language();

const cacheApi = {
    ontheair: null,
    toprated: null
}

async function scriptList (eventDetail) {
    const scriptObj = await apiList();
    const isOnTheAir = cacheApi.ontheair;
    const isTopRated = cacheApi.toprated;
    if (eventDetail === "ontheair") {
        if (isOnTheAir) {
            await onTheAirSection(cacheApi.ontheair)
        } else {
            const ontheair = await scriptObj.onTheAirMovies()
            await onTheAirSection(ontheair)
            cacheApi.ontheair = ontheair;
        }
    }

    if (eventDetail === "toprated") {
        if (isTopRated) {
            await topRatedSection(cacheApi.toprated)
        } else {
            const toprateds = await scriptObj.topRatedMovies();
            await topRatedSection(toprateds)
            cacheApi.toprated = toprateds;
        }
    }

    if (eventDetail === "trending") {
        const trendlist = await scriptObj.trendingAllWeek();
        await trendingSection(trendlist)
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

// HOME PAGE - ON THE AIR MOVIES(8)
async function onTheAirSection(data) {
    const movieList = document.getElementById("on-the-air-list")
    movieList.innerHTML = "";
    const onTheAir = data.slice(0, 8);

    const MINIMUM_DURATION = 250;
    const startTime = Date.now();

    movieList.innerHTML = generateSkeletonCards(5);

    try {

        const movieDetailPromises = onTheAir.map(movie =>
            fetch(`${DEFAULT_URL}/movie/${movie.id}?api_key=${API_KEY}&${LANG}`)
                .then(res => res.json())
        );

        const allMovieDetails = await Promise.all(movieDetailPromises);

        const movieHTML = allMovieDetails.map(movieDetails => `
            <li>
                <div class="movie-card">
                    <a href="details.html?id=${movieDetails.id}&type=movie">
                        <figure class="card-banner">
                            <img src="${IMG_DEFAULT_URL}original/${movieDetails.poster_path}" alt="${movieDetails.title} poster">
                        </figure>
                    </a>
                    <div class="title-wrapper">
                        <a href="details.html?id=${movieDetails.id}&type=movie">
                            <h3 class="card-title">${movieDetails.title}</h3>
                        </a>
                        <span>${movieDetails.release_date.slice(0, 4)}</span>
                    </div>
                    <div class="card-meta">
                        <div class="badge badge-outline">MOVIE</div>
                        <div class="duration">
                            <ion-icon name="time-outline"></ion-icon>
                            <span>${movieDetails.runtime} min</span>
                        </div>
                        <div class="rating">
                            <ion-icon name="star"></ion-icon>
                            <data>${movieDetails.vote_average.toFixed(1)}</data>
                        </div>
                    </div>
                </div>
            </li>
        `).join(''); // Tüm HTML'leri birleştir

        const endTime = Date.now();
        const elapsedTime = endTime - startTime;

        if (elapsedTime < MINIMUM_DURATION) {
            // Eğer 1 saniyeden hızlı yüklendiyse, aradaki fark kadar bekle
            const delay = MINIMUM_DURATION - elapsedTime;

            setTimeout(() => {
                movieList.innerHTML = movieHTML;
            }, delay);

        } else {
            // Zaten 1 saniyeden uzun sürdüyse, hemen göster
            movieList.innerHTML = movieHTML;
        }

    } catch (error) {
        alert(`HATA: ${error}`)
        const errorElapsedTime = Date.now() - startTime;
        const errorDelay = Math.max(0, MINIMUM_DURATION - errorElapsedTime);

        setTimeout(() => {
            movieList.innerHTML = "<li>Veriler yüklenemedi.</li>";
        }, errorDelay);
    }
}

// TOP RATED SECTION
async function topRatedSection(data) {
    const movieList = document.getElementById("toprated-list");
    const toprated = data.slice(0, 8); // İlk 8 filmi al

    // 1. ADIM: Minimum süre (1 saniye) ve başlangıç zamanını ayarla
    const MINIMUM_DURATION = 250;
    const startTime = Date.now();

    // 2. ADIM: Hemen 8 tane iskelet loader'ı bas (Top Rated listesi 8'li)
    // (generateSkeletonCards fonksiyonunun movieScript.js içinde olduğunu varsayıyorum)
    movieList.innerHTML = generateSkeletonCards(8);

    try {
        // 3. ADIM: 8 filmin detayını AYNI ANDA (Paralel) iste
        const movieDetailPromises = toprated.map(movie =>
            fetch(`${DEFAULT_URL}/movie/${movie.id}?api_key=${API_KEY}&${LANG}`)
                .then(res => res.json())
        );

        // Tüm isteklerin bitmesini bekle
        const allMovieDetails = await Promise.all(movieDetailPromises);

        // 4. ADIM: Gelen verilerle HTML'i oluştur
        const movieHTML = allMovieDetails.map(movieDetails => `
            <li>
                <div class="movie-card">
                    <a href="details.html?id=${movieDetails.id}&type=movie">
                      <figure class="card-banner">
                        <img src="${IMG_DEFAULT_URL}original${movieDetails.poster_path}" alt="${movieDetails.title} poster">
                      </figure>
                    </a>
                    <div class="title-wrapper">
                      <a href="details.html?id=${movieDetails.id}&type=movie">
                        <h3 class="card-title">${movieDetails.title}</h3>
                      </a>
                      <span>${movieDetails.release_date.slice(0, 4)}</span>
                    </div>
                    <div class="card-meta">
                      <div class="badge badge-outline">MOVIE</div>
                      <div class="duration">
                        <ion-icon name="time-outline"></ion-icon>
                        <span>${movieDetails.runtime} min</span>
                      </div>
                      <div class="rating">
                        <ion-icon name="star"></ion-icon>
                        <data>${movieDetails.vote_average.toFixed(1)}</data>
                      </div>
                    </div>
                </div>
            </li>
        `).join(''); // Tüm HTML'leri birleştir

        // 5. ADIM: SÜRE KONTROLÜ
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;

        if (elapsedTime < MINIMUM_DURATION) {
            // Eğer 1 saniyeden hızlı yüklendiyse, aradaki fark kadar bekle
            const delay = MINIMUM_DURATION - elapsedTime;

            setTimeout(() => {
                movieList.innerHTML = movieHTML;
            }, delay);

        } else {
            // Zaten 1 saniyeden uzun sürdüyse, hemen göster
            movieList.innerHTML = movieHTML;
        }

    } catch (e) {
        alert(`HATA: ${e}`);
        // Hata durumunda da minimum süreyi bekle
        const errorElapsedTime = Date.now() - startTime;
        const errorDelay = Math.max(0, MINIMUM_DURATION - errorElapsedTime);

        setTimeout(() => {
            movieList.innerHTML = "<li>Veriler yüklenemedi.</li>";
        }, errorDelay);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    scriptList("toprated")
    scriptList("ontheair")
})

const topRatedSeriesButton = document.getElementById("top-rated-series");
const topRatedMoviesButton = document.getElementById("top-rated-movies");
topRatedMoviesButton.addEventListener("click", () => {
    if (topRatedMoviesButton.classList.contains("onTopRated")) return;
    topRatedMoviesButton.classList.add("onTopRated");
    topRatedSeriesButton.classList.remove("onTopRated");
    document.getElementById("tprated-movie-series").innerHTML = "Movies";
    scriptList("toprated")
})

const ontheairSeriesButton = document.getElementById("on-the-air-series");
const ontheairMoviesButton = document.getElementById("on-the-air-movies");
ontheairMoviesButton.addEventListener("click", () => {
    if (ontheairMoviesButton.classList.contains("onTheAir")) return;
    ontheairMoviesButton.classList.add("onTheAir");
    ontheairSeriesButton.classList.remove("onTheAir");
    document.getElementById("ontheair-movie-series").innerHTML = "Movies";
    scriptList("ontheair")
})
//