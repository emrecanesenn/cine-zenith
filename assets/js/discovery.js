"use strict";
import {API_KEY, DEFAULT_URL, IMG_DEFAULT_URL, language} from "./apiSettings.js";
import apiList from "./apiList.js";
let scriptObj, lang;

const LANG = language()

let GENRE_DATA = [], MOVIE_ONLY_GENRES = [], TV_ONLY_GENRES = [];

function getGenreName(id, type) {
    let genre;
    if (type === "movie") {
        genre = MOVIE_ONLY_GENRES.find(g => g.id.toString() === id.toString());
    } else if (type === "tv") {
        genre = TV_ONLY_GENRES.find(g => g.id.toString() === id.toString());
    } else {
        genre = GENRE_DATA.find(g => g.id.toString() === id.toString());
    }

    return genre ? genre.name : 'Bilinmiyor';
}

let genres = [];
let type = sessionStorage.getItem("type") || "all", rating = sessionStorage.getItem("rating");
let searchTimeoutToken = null;

function createCommonGenreData(movieGenres, tvGenres) {
    const combinedGenres = [...movieGenres, ...tvGenres];

    // 2. Map objesi kullanarak ID'ye göre tekilleştirme (En hızlı ve modern yöntem)
    const genreMap = new Map();

    for (const genre of combinedGenres) {
        if (!genreMap.has(genre.id)) {
            genreMap.set(genre.id, genre);
        }
    }

    // 3. Map objesinin değerlerini tekrar dizi (Array) formatına çevirme
    return Array.from(genreMap.values());
}

async function genreData() {
    try {
        const [genreMovieRes, genreTvRes] = await Promise.all([
            fetch(`${DEFAULT_URL}/genre/movie/list?api_key=${API_KEY}&${LANG}`),
            fetch(`${DEFAULT_URL}/genre/tv/list?api_key=${API_KEY}&${LANG}`)
        ])

        if (!genreMovieRes.ok && !genreTvRes.ok) throw new Error("Genre Data Fetch Wrong")

        const genreMovieData = await genreMovieRes.json();
        const genreTvData = await genreTvRes.json();

        GENRE_DATA = createCommonGenreData(genreMovieData.genres, genreTvData.genres)
        MOVIE_ONLY_GENRES = genreMovieData.genres;
        TV_ONLY_GENRES = genreTvData.genres;

    }catch (e) {
        console.error("HATA: " + e)
    }
}

async function filterData() {

    try {
        const searchQuery = document.getElementById("search-input").value.trim();
        if (searchQuery) {
            const resolve = await fetch(`${DEFAULT_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=1&${LANG}`)
            if (!resolve.ok) throw new Error("Input Search Error")

            const resultData = await resolve.json()
            const mediaList = resultData.results;

            document.querySelector(".highlight-count").innerHTML = mediaList.length;
            renderProviders(mediaList, false, "query")

        } else {
            let genreList = genres.join(",");
            const rate = rating !== 0 ? rating : "";

            const [moviesRes, seriesRes] = await Promise.all([
                fetch(`${DEFAULT_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreList}&vote_average.gte=${rate}&sort_by=${document.querySelector(".custom-select").value}&${LANG}`),
                fetch(`${DEFAULT_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreList}&vote_average.gte=${rate}&sort_by=${document.querySelector(".custom-select").value}&${LANG}`)
                // /discover/movie?api_key=...&with_genres=35|18&vote_average.gte=7.0&sort_by=popularity.desc
            ])
            if (!moviesRes.ok && !seriesRes.ok) throw new Error("Fetch Error - Series and Movies");

            const movieData = await moviesRes.json();
            const tvData = await  seriesRes.json();
            const movieList = await movieData.results;
            const tvList = await tvData.results;

            switch (type) {
                case "all" :
                    document.querySelector(".highlight-count").innerHTML = movieList.length + tvList.length
                    renderProviders(movieList, tvList, type)
                    break;
                case "movies" :
                    document.querySelector(".highlight-count").innerHTML = movieList.length
                    renderProviders(movieList, false, type)
                    break;
                case "series" :
                    document.querySelector(".highlight-count").innerHTML = tvList.length
                    renderProviders(tvList, false, type)
                    break;
                default :
                    throw new Error("List type error");
            }

        }

    } catch (e) {
        console.error(`HATA: ${e}`)
    }
}

/**
 *
 * @param {array} data1 - Eğer dataType "all" ise movie değil ise tv veya movie olabilir
 * @param {array || boolean} data2 - TV Array
 * @param {string} dataType - All - TV - Movie
 */

function renderProviders(data1, data2 = false, dataType) {
    const listElement = document.getElementById("results-grid");
    listElement.innerHTML = "";
    let listText = "";
    try {

        if (dataType === "all") {
            for (let media of data1) {
                const idsArray = media.genre_ids ?? [];

                // ID'leri isme çevir, ilk 3'ü al ve birleştir
                const genreList = idsArray
                    .map(item => {
                        return getGenreName(item, "movie")
                    })
                    .join(', ');
                const posterLink = media.poster_path ? `${IMG_DEFAULT_URL}original/${media.poster_path}` : `assets/images/non-poster.png`
                listText += `
                <article class="media-card">
                    <div class="card-image-wrapper">
                        <img src="${posterLink}" alt="${media.title} poster">
                        <div class="card-overlay">
                            <div class="card-actions">
                                <button class="play-btn"><i class="fa-solid fa-play"></i></button>
                                <button class="fav-btn"><ion-icon name="heart-outline"></ion-icon></button>
                            </div>
                            <div class="card-info">
                                <h3>${media.title}</h3>
                                <div class="meta-data">
                                    <span class="rating"><i class="fa-solid fa-star"></i> ${media.vote_average.toFixed(1)}</span>
                                    <span class="year">${media.release_date.slice(0, 4)} - <b>${lang.movieText}</b></span>
                                </div>
                                <p class="genre">${genreList}</p>
                            </div>
                        </div>
                    </div>
                </article>
                `
            }

            for (let media of data2) {
                const idsArray = media.genre_ids ?? [];

                const genreList = idsArray
                    .map(item => {
                        return getGenreName(item, "tv")
                    })
                    .join(', ');

                const posterLink = media.poster_path ? `${IMG_DEFAULT_URL}original/${media.poster_path}` : `assets/images/non-poster.png`
                listText += `
                <article class="media-card">
                    <div class="card-image-wrapper">
                        <img src="${posterLink}" alt="${media.name} poster">
                        <div class="card-overlay">
                            <div class="card-actions">
                                <button class="play-btn"><i class="fa-solid fa-play"></i></button>
                                <button class="fav-btn"><ion-icon name="heart-outline"></ion-icon></button>
                            </div>
                            <div class="card-info">
                                <h3>${media.name}</h3>
                                <div class="meta-data">
                                    <span class="rating"><i class="fa-solid fa-star"></i> ${media.vote_average.toFixed(1)}</span>
                                    <span class="year">${media.first_air_date.slice(0, 4)} - <b>${lang.serieText}</b></span>
                                </div>
                                <p class="genre">${genreList}</p>
                            </div>
                        </div>
                    </div>
                </article>
                `
            }
        } else if (dataType === "movies") {
            for (let media of data1) {
                const idsArray = media.genre_ids ?? [];

                // ID'leri isme çevir, ilk 3'ü al ve birleştir
                const genreList = idsArray
                    .map(item => {
                        return getGenreName(item, "movie")
                    })
                    .join(', ');
                const posterLink = media.poster_path ? `${IMG_DEFAULT_URL}original/${media.poster_path}` : `assets/images/non-poster.png`
                listText += `
                <article class="media-card">
                    <div class="card-image-wrapper">
                        <img src="${posterLink}" alt="${media.title} poster">
                        <div class="card-overlay">
                            <div class="card-actions">
                                <button class="play-btn"><i class="fa-solid fa-play"></i></button>
                                <button class="fav-btn"><ion-icon name="heart-outline"></ion-icon></button>
                            </div>
                            <div class="card-info">
                                <h3>${media.title}</h3>
                                <div class="meta-data">
                                    <span class="rating"><i class="fa-solid fa-star"></i> ${media.vote_average.toFixed(1)}</span>
                                    <span class="year">${media.release_date.slice(0, 4)} - <b>${lang.movieText}</b></span>
                                </div>
                                <p class="genre">${genreList}</p>
                            </div>
                        </div>
                    </div>
                </article>
                `
            }
        } else if (dataType === "series") {
            for (let media of data1) {
                const idsArray = media.genre_ids ?? [];

                const genreList = idsArray
                    .map(item => {
                        return getGenreName(item, "tv")
                    })
                    .join(', ');
                const posterLink = media.poster_path ? `${IMG_DEFAULT_URL}original/${media.poster_path}` : `assets/images/non-poster.png`
                listText += `
                <article class="media-card">
                    <div class="card-image-wrapper">
                        <img src="${posterLink}" alt="${media.name} poster">
                        <div class="card-overlay">
                            <div class="card-actions">
                                <button class="play-btn"><i class="fa-solid fa-play"></i></button>
                                <button class="fav-btn"><ion-icon name="heart-outline"></ion-icon></button>
                            </div>
                            <div class="card-info">
                                <h3>${media.name}</h3>
                                <div class="meta-data">
                                    <span class="rating"><i class="fa-solid fa-star"></i> ${media.vote_average.toFixed(1)}</span>
                                    <span class="year">${media.first_air_date.slice(0, 4)} - <b>${lang.serieText}</b></span>
                                </div>
                                <p class="genre">${genreList}</p>
                            </div>
                        </div>
                    </div>
                </article>
            `
            }
        } else if(dataType === "query") {
            for (let media of data1) {
                const idsArray = media.genre_ids ?? [];
                const genreList = idsArray
                    .map(item => {
                        return getGenreName(item, "all")
                    })
                    .join(', ');
                const posterLink = media.poster_path ? `${IMG_DEFAULT_URL}original/${media.poster_path}` : `assets/images/non-poster.png`

                if (media.media_type === "tv") {
                    listText += `
                    <article class="media-card">
                        <div class="card-image-wrapper">
                            <img src="${posterLink}" alt="${media.name} poster">
                            <div class="card-overlay">
                                <div class="card-actions">
                                    <button class="play-btn"><i class="fa-solid fa-play"></i></button>
                                    <button class="fav-btn"><ion-icon name="heart-outline"></ion-icon></button>
                                </div>
                                <div class="card-info">
                                    <h3>${media.name}</h3>
                                    <div class="meta-data">
                                        <span class="rating"><i class="fa-solid fa-star"></i> ${media.vote_average.toFixed(1)}</span>
                                        <span class="year">${media.first_air_date.slice(0, 4)} - <b>${lang.serieText}</b></span>
                                    </div>
                                    <p class="genre">${genreList}</p>
                                </div>
                            </div>
                        </div>
                    </article>
                    `
                } else if(media.media_type === "movie") {
                    listText += `
                    <article class="media-card">
                        <div class="card-image-wrapper">
                            <img src="${posterLink}" alt="${media.title} poster">
                            <div class="card-overlay">
                                <div class="card-actions">
                                    <button class="play-btn"><i class="fa-solid fa-play"></i></button>
                                    <button class="fav-btn"><ion-icon name="heart-outline"></ion-icon></button>
                                </div>
                                <div class="card-info">
                                    <h3>${media.title}</h3>
                                    <div class="meta-data">
                                        <span class="rating"><i class="fa-solid fa-star"></i> ${media.vote_average.toFixed(1)}</span>
                                        <span class="year">${media.release_date.slice(0, 4)} - <b>${lang.movieText}</b></span>
                                    </div>
                                    <p class="genre">${genreList}</p>
                                </div>
                            </div>
                        </div>
                    </article>
                    `
                }
            }
        } else throw new Error("Render Providers Error");

        listElement.innerHTML += listText;

    } catch (e) {
        console.error(`HATA: ${e}`)
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    sessionStorage.setItem("type", "all")
    sessionStorage.setItem("genres", JSON.stringify(genres))
    sessionStorage.setItem("rating", JSON.stringify(0))
    scriptObj = await apiList();
    lang = await scriptObj.language(localStorage.getItem("lang"))
    await genreData()
    await listingGenres();
    await filterData()
})

document.getElementById("apply-btn").addEventListener("click", filterData) // APPLY BUTTON EVENT


/*
 *  SEARCH INPUT
 */

document.getElementById("search-input").addEventListener("input", (event) => {
    let typeList = document.querySelectorAll(".type-selector input")
    let genreList = document.querySelectorAll(".genre-grid input")
    let range = document.getElementById("rating-range")
    let customSelect = document.querySelector(".custom-select")
    let container = document.getElementById("discoverFilter")
    if (!event.target.value.trim()) {
        container.style.opacity = "1";
        for (let item of typeList) {
            item.disabled = false;
        }
        for (let item of genreList) {
            item.disabled = false;
        }
        range.disabled = false;
        customSelect.disabled = false;
    } else {
        container.style.opacity = "0.4";
        for (let item of typeList) {
            item.disabled = true;
        }
        for (let item of genreList) {
            item.disabled = true;
        }
        range.disabled = true;
        customSelect.disabled = true;

    }
});

/*
 *  GENRES LIST SECTION
 */

async function listingGenres() {
    try {
        const dataType = sessionStorage.getItem("type");
        const filterGenresList = document.querySelector(".genre-grid")
        filterGenresList.innerHTML = "";
        let text = "";
        switch (dataType) {
            case "all" :
                for (let genreItem of GENRE_DATA) {
                    text += `
                        <label class="genre-tag">
                            <input type="checkbox" value="${genreItem.id}">
                            <span>${genreItem.name}</span>
                        </label>
                    `
                }
                break;
            case "movies" :
                for (let genreItem of MOVIE_ONLY_GENRES) {
                    text += `
                        <label class="genre-tag">
                            <input type="checkbox" value="${genreItem.id}">
                            <span>${genreItem.name}</span>
                        </label>
                    `
                }
                break;
            case "series":
                for (let genreItem of TV_ONLY_GENRES) {
                    text += `
                        <label class="genre-tag">
                            <input type="checkbox" value="${genreItem.id}">
                            <span>${genreItem.name}</span>
                        </label>
                    `
                }
                break;
            default: throw new Error("Filter Genres Listing Error")
        }
        filterGenresList.innerHTML = text;

        const genreList = document.querySelectorAll(".genre-grid input")

        for (let genre of genreList) {
            genre.addEventListener("change", (event) => {
                if (event.target.checked) {
                    genreSet(event.target.value, true)
                }
                else {
                    genreSet(event.target.value, false)
                }
            })
        }
    } catch (e) {
        console.error(`HATA: ${e}`)
    }
}

function genreSet(selected, isAdd) {
    const idToProcess = parseInt(selected)
    if (isAdd) {
        if (!genres.includes(idToProcess)) {
            genres.push(idToProcess);
        }
    } else {
        const index = genres.indexOf(idToProcess);
        if (index > -1) {
            genres.splice(index, 1);
        }
    }

    sessionStorage.setItem("genres", JSON.stringify(genres));
}

/*
 *  TYPE LIST SECTION
 */

const typeList = document.querySelectorAll(".type-selector input")

for (let typeItem of typeList) {
    typeItem.addEventListener("click", (event) => {
        type = event.target.value;
        sessionStorage.setItem("type", type)
        genres.length = 0;
        sessionStorage.setItem("genres", JSON.stringify(genres))
        listingGenres()
    })
}


/*
 *  RATING RANGE SETTING SECTION
 */

document.getElementById("rating-range").addEventListener("input", (event) => {
    const ratingValue = document.getElementById("rating-value")
    ratingValue.innerHTML = event.target.value;
    rating = ratingValue.innerHTML;
    sessionStorage.setItem("rating", rating)
})
