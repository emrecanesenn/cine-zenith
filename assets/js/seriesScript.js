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

async function onTheAirSection(onTheAir) {
    const seriesList = document.getElementById("on-the-air-list")
    seriesList.innerHTML = "";
    let count = 0;
    try {
        for (const series of onTheAir) {
            if (count >= 5) break;
            const resolve = await fetch(`${DEFAULT_URL}/tv/${series.id}?api_key=${API_KEY}`)
            if (!resolve.ok) throw new Error("Upcoming listing error")
            const seriesDetails = await resolve.json()

            let activeSeasonNumber = seriesDetails.last_episode_to_air?.season_number;

            if (activeSeasonNumber) {
                activeSeasonNumber = `S.${activeSeasonNumber}/Ep.${seriesDetails.last_episode_to_air?.episode_number}`
            } else {
                continue;
            }

            const li = document.createElement("li")
            li.innerHTML = `
                <div class="movie-card">

                      <a href="movie-details.html">
                          <figure class="card-banner">
                              <img src="${IMG_DEFAULT_URL}original/${seriesDetails.poster_path}" alt="${seriesDetails.name} poster">
                          </figure>
                      </a>

                      <div class="title-wrapper">
                          <a href="movie-details.html">
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
        `
            seriesList.appendChild(li)
            count++;
        }
    } catch (error) {
        alert(`HATA: ${error}`)
    }
}

async function topRatedSection(data) {
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