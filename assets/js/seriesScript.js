"use strict"

import {API_KEY, DEFAULT_URL, IMG_DEFAULT_URL, LANG_TR} from './apiSettings.js';
import apiList from "./apiList.js";

async function scriptList () {
    const scriptObj = await apiList();
    const topRatedSeries = await scriptObj.topRatedSeries();
    await topRated(topRatedSeries)
}

async function topRated(data) {
    try{
        const seriesList = document.getElementById("toprated-list")
        seriesList.innerHTML = "";
        const toprated = data.slice(0, 8);

        for (const series of toprated) {
            const resolve = await fetch(`${DEFAULT_URL}/tv/${series.id}?api_key=${API_KEY}`)
            if (!resolve.ok) throw new Error("Upcoming listing error");
            const seriesDetails = await resolve.json()

            const li = document.createElement("li")
            li.innerHTML = `
            <div class="movie-card">

                <a href="movie-details.html">
                  <figure class="card-banner">
                    <img src="${IMG_DEFAULT_URL}original${seriesDetails.poster_path}" alt="${seriesDetails.name} poster">
                  </figure>
                </a>

                <div class="title-wrapper">
                  <a href="movie-details.html">
                    <h3 class="card-title">${seriesDetails.name}</h3>
                  </a>

                  <span>${seriesDetails.first_air_date.slice(0, 4)}</span>
                </div>

                <div class="card-meta">
                  <div class="badge badge-outline">2K</div>

                  <div class="duration">
                    <ion-icon name="time-outline"></ion-icon>

                    <span>${seriesDetails.number_of_seasons} Seasons</span>
                  </div>

                  <div class="rating">
                    <ion-icon name="star"></ion-icon>

                    <data>${seriesDetails.vote_average.toFixed(1)}</data>
                  </div>
                </div>

              </div>
            `
            seriesList.appendChild(li)
        }

    } catch (e) {
        alert(`HATA: ${e}`)
    }
}

const topRatedSeriesButton = document.getElementById("top-rated-series");
const topRatedMoviesButton = document.getElementById("top-rated-movies");
topRatedSeriesButton.addEventListener("click", () => {
    if (topRatedSeriesButton.classList.contains("onTopRated")) return;
    topRatedSeriesButton.classList.add("onTopRated");
    topRatedMoviesButton.classList.remove("onTopRated");
    scriptList();
})