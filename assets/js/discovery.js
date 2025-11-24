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

let keywords = [], genres = [];
let type = sessionStorage.getItem("type"), rating = sessionStorage.getItem("rating");

function createCommonGenreData(movieGenres, tvGenres) {
    return movieGenres.filter(movieGenre => {
        return tvGenres.some(tvGenre => tvGenre.id === movieGenre.id);
    });
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
    let page = 1;
    try {
        const [moviesRes, seriesRes] = await Promise.all([
            fetch(`${DEFAULT_URL}/movie/popular?api_key=${API_KEY}&page=${page}&${LANG}`),
            fetch(`${DEFAULT_URL}/tv/popular?api_key=${API_KEY}&page=${page}&${LANG}`)
        ])

        if (!moviesRes.ok && !seriesRes.ok) throw new Error("Fetch Error - Series and Movies");

        const movieData = await moviesRes.json();
        const tvData = await  seriesRes.json();
        const movieList = await movieData.results;
        const tvList = await tvData.results;

        if (type === "all") {
            document.querySelector(".highlight-count").innerHTML = movieList.length + tvList.length
            renderProviders(movieList, tvList, type)
        } else if (type === "movies") {
            document.querySelector(".highlight-count").innerHTML = movieList.length + tvList.length
            renderProviders(movieList, tvList, type)
        } else if (type === "series") {
            document.querySelector(".highlight-count").innerHTML = movieList.length + tvList.length
            renderProviders(movieList, tvList, type)
        } else throw new Error("List type error");



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
    if (dataType === "all") {
        for (let media of data1) {
            const idsArray = media.genre_ids ?? [];

            // ID'leri isme çevir, ilk 3'ü al ve birleştir
            const genreList = idsArray
                .map(item => {
                    return getGenreName(item, "movie")
                })
                .join(', ');

            listText += `
            <article class="media-card">
                <div class="card-image-wrapper">
                    <img src="${IMG_DEFAULT_URL}original/${media.poster_path}" alt="${media.title} poster">
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

            listText += `
            <article class="media-card">
                <div class="card-image-wrapper">
                    <img src="${IMG_DEFAULT_URL}original/${media.poster_path}" alt="${media.name} poster">
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
        listElement.innerHTML += listText;
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    sessionStorage.setItem("keyword", JSON.stringify(keywords))
    sessionStorage.setItem("type", "all")
    sessionStorage.setItem("genres", JSON.stringify(genres))
    sessionStorage.setItem("rating", JSON.stringify(0))
    scriptObj = await apiList();
    lang = await scriptObj.language(localStorage.getItem("lang"))
    await genreData()
    await filterData()
})

document.getElementById("apply-btn").addEventListener("click", filterData) // APPLY BUTTON EVENT


/*
 *  SEARCH INPUT - KEYWORDS SETTINGS SECTION
 */
document.getElementById("search-input").addEventListener("input", (event) => {
    keywords = event.target.value
        .split(",")
        .map(key => key.trim())
        .filter(key => key !== "")

    sessionStorage.setItem("keyword", JSON.stringify(keywords))
})


/*
 *  GENRES LIST SECTION
 */

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

function genreSet(selected, isAdd) {
    if (isAdd) {
        if (!genres.includes(selected)) {
            genres.push(selected);
        }
    } else {
        const index = genres.indexOf(selected);
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
