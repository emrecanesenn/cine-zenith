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

// HOME PAGE - UPCOMING MOVIES(5)
async function onTheAirSection(data) {
    const movieList = document.getElementById("on-the-air-list")
    movieList.innerHTML = "";
    const onTheAir = data.slice(0, 5);
    try {
        for (const movie of onTheAir) {
            const resolve = await fetch(`${DEFAULT_URL}/movie/${movie.id}?api_key=${API_KEY}`)
            if (!resolve.ok) throw new Error("Upcoming listing error")
            const movieDetails = await resolve.json()

            const li = document.createElement("li")
            li.innerHTML = `
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
        `
            movieList.appendChild(li)
        }
    } catch (error) {
        alert(`HATA: ${error}`)
    }
}

async function topRatedSection(data) {
    try{
        const movieList = document.getElementById("toprated-list")
        movieList.innerHTML = "";
        const toprated = data.slice(0, 8);

        for (const movie of toprated) {
            const resolve = await fetch(`${DEFAULT_URL}/movie/${movie.id}?api_key=${API_KEY}`)
            if (!resolve.ok) throw new Error("Upcoming listing error")
            const movieDetails = await resolve.json()

            const li = document.createElement("li")
            li.innerHTML = `
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
            `
            movieList.appendChild(li)
        }

    } catch (e) {
        alert(`HATA: ${e}`)
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