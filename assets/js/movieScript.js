"use strict";
// API-SETTINGS
const API_KEY = 'ef118284aeb4d24b39c622a5c9132db9';
const LANG_TR = '&language=tr-TR';
const DEFAULT_URL = 'https://api.themoviedb.org/3';
const IMG_DEFAULT_URL = 'https://image.tmdb.org/t/p/';

// Essentials List Movies
async function listMovies() {
    try {

        const resolve = await fetch(`${DEFAULT_URL}/movie/upcoming?api_key=${API_KEY}`);
        if (!resolve.ok) throw new Error("Upcoming Movies is not loaded!");

        const data = await resolve.json();

        await heroSection(data.results)
        await upcomingSection(data.results)

    } catch (e) {
        alert(`HATA: ${e}`)
    }

}

// HERO SECTION FIRST UPCOMING FILM
async function heroSection(upcoming) {
    try {

        const resolve = await fetch(`${DEFAULT_URL}/movie/${upcoming[0].id}?api_key=${API_KEY}`)
        if (!resolve.ok) throw new Error(`The movie is not uploading`)
        const firstUpcoming = await resolve.json();

        // DOM Variables
        const title = document.getElementById("hero-title")
        const tagline = document.getElementById("hero-tagline")
        const genres = document.getElementById("hero-genres")
        const releaseDate = document.getElementById("hero-release-date")
        const runtime = document.getElementById("hero-runtime")
        const heroBackground = document.getElementById("heroSection");

        // Hero Displaying Settins
        title.innerHTML = firstUpcoming.title;
        tagline.innerHTML = firstUpcoming.tagline || `This <strong>Movie</strong>, will be released soon.`;
        releaseDate.innerHTML = firstUpcoming.release_date.slice(0, 4);
        runtime.innerHTML = `${firstUpcoming.runtime} min`;

        // Genres Displaying
        genres.innerHTML = "";
        const genreNames = firstUpcoming.genres.map(genre => genre.name);
        genreNames.sort()

        for (let x = 0; x < genreNames.length; x++) {
            if (x === ( genreNames.length - 1 ))
                genres.innerHTML += `<a href="#">${genreNames[x]}</a>`; // Last genre
                else
                    genres.innerHTML += `<a href="#">${genreNames[x]},</a>`;
        }

        // Hero Background Settings
        heroBackground.style.background = `url("${IMG_DEFAULT_URL}original${firstUpcoming.backdrop_path}")`;
        heroBackground.style.backgroundSize = 'cover';
        heroBackground.style.backgroundPosition = 'center';


    } catch (e) {
        alert(`HATA: ${e}`)
    }
}

async function upcomingSection(upcomings) {
    const movieList = document.getElementById("upcoming-movie-list")
    const upcoming =upcomings.slice(0, 5);
    try {
        for (const movie of upcoming) {
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
                          <div class="badge badge-outline">HD</div>

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

document.addEventListener("DOMContentLoaded", () => {
    listMovies();
})
//
