"use strict";

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
    if (eventDetail === "ontheair") {
        if (isOnTheAir) {
            await heroSection(cacheApi.ontheair)
            await onTheAirSection(cacheApi.ontheair)
        } else {
            const ontheair = await scriptObj.onTheAirMovies()
            await heroSection(ontheair)
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

// HERO SECTION FIRST ON THE AIR FILM
async function heroSection(data) {
    try {

        const resolve = await fetch(`${DEFAULT_URL}/movie/${data[0].id}?api_key=${API_KEY}`)
        if (!resolve.ok) throw new Error(`The movie is not uploading`)
        const firstOnTheAir = await resolve.json();

        // DOM Variables
        const title = document.getElementById("hero-title")
        const tagline = document.getElementById("hero-tagline")
        const genres = document.getElementById("hero-genres")
        const releaseDate = document.getElementById("hero-release-date")
        const runtime = document.getElementById("hero-runtime")
        const heroBackground = document.getElementById("heroSection");

        // Hero Displaying Settins
        title.innerHTML = firstOnTheAir.title;
        tagline.innerHTML = firstOnTheAir.tagline || `This <strong>Movie</strong>, will be released soon.`;
        releaseDate.innerHTML = firstOnTheAir.release_date.slice(0, 4);
        runtime.innerHTML = `${firstOnTheAir.runtime} min`;

        // Genres Displaying
        genres.innerHTML = "";
        const genreNames = firstOnTheAir.genres.map(genre => genre.name);
        genreNames.sort()

        for (let x = 0; x < genreNames.length; x++) {
            if (x === ( genreNames.length - 1 ))
                genres.innerHTML += `<a href="#">${genreNames[x]}</a>`; // Last genre
                else
                    genres.innerHTML += `<a href="#">${genreNames[x]},</a>`;
        }

        // Hero Background Settings
        heroBackground.style.background = `url("${IMG_DEFAULT_URL}original${firstOnTheAir.backdrop_path}")`;
        heroBackground.style.backgroundSize = 'cover';
        heroBackground.style.backgroundPosition = 'center';


    } catch (e) {
        alert(`HATA: ${e}`)
    }
}

// HOME PAGE - ON THE AIR MOVIES(5)
async function onTheAirSection(data) {
    const movieList = document.getElementById("on-the-air-list")
    movieList.innerHTML = "";
    const onTheAir = data.slice(0, 5);

    const MINIMUM_DURATION = 250;
    const startTime = Date.now();

    movieList.innerHTML = generateSkeletonCards(5);

    try {

        const movieDetailPromises = onTheAir.map(movie =>
            fetch(`${DEFAULT_URL}/movie/${movie.id}?api_key=${API_KEY}`)
                .then(res => res.json())
        );

        const allMovieDetails = await Promise.all(movieDetailPromises);

        const movieHTML = allMovieDetails.map(movieDetails => `
            <li>
                <div class="movie-card">
                    <a href="movie-details.html">
                        <figure class="card-banner">
                            <img src="${IMG_DEFAULT_URL}original/${movieDetails.poster_path}" alt="${movieDetails.title} poster">
                        </figure>
                    </a>
                    <div class="title-wrapper">
                        <a href="movie-details.html">
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

// 'topRatedSection' olarak gönderdiğin fonksiyonu,
// script dosya'ndaki adıyla 'topRated' olarak düzenledim.
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
            fetch(`${DEFAULT_URL}/movie/${movie.id}?api_key=${API_KEY}`)
                .then(res => res.json())
        );

        // Tüm isteklerin bitmesini bekle
        const allMovieDetails = await Promise.all(movieDetailPromises);

        // 4. ADIM: Gelen verilerle HTML'i oluştur
        const movieHTML = allMovieDetails.map(movieDetails => `
            <li>
                <div class="movie-card">
                    <a href="movie-details.html">
                      <figure class="card-banner">
                        <img src="${IMG_DEFAULT_URL}original${movieDetails.poster_path}" alt="${movieDetails.title} poster">
                      </figure>
                    </a>
                    <div class="title-wrapper">
                      <a href="movie-details.html">
                        <h3 class="card-title">${movieDetails.title}</h3>
                      </a>
                      <span>${movieDetails.release_date.slice(0, 4)}</span>
                    </div>
                    <div class="card-meta">
                      <div class="badge badge-outline">2K</div>
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

async function trendingSection(data) {
    // index.html'deki statik listeyi bul.
    // ID'sini sen belirle, ben 'trending-list' diyorum.
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
            return fetch(`${DEFAULT_URL}/${mediaType}/${itemId}?api_key=${API_KEY}`)
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
                    <div class="badge badge-outline">TV</div>
                    <div class="duration">
                        <ion-icon name="bookmark-outline"></ion-icon>
                        <span>${details.number_of_seasons} Seasons</span>
                    </div>
                    <div class="rating">
                        <ion-icon name="flame-outline"></ion-icon> <data>${item.popularity.toFixed(0)}</data> </div>
                `;
                // EĞER FİLM İSE (MOVIE)
            } else if (mediaType === 'movie') {
                cardMetaHTML = `
                    <div class="badge badge-outline">MOVIE</div>
                    <div class="duration">
                        <ion-icon name="time-outline"></ion-icon>
                        <span>${details.runtime} min</span>
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
                        <a href="movie-details.html">
                            <figure class="card-banner">
                                <img src="${IMG_DEFAULT_URL}original${details.poster_path}" alt="${title} poster">
                            </figure>
                        </a>
                        <div class="title-wrapper">
                            <a href="movie-details.html">
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
    scriptList("toprated")
    scriptList("ontheair")
    scriptList("trending")
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