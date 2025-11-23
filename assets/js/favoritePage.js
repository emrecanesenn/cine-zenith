"use strict";
import {API_KEY, DEFAULT_URL, IMG_DEFAULT_URL, language} from "./apiSettings.js";
import favorite from "./favorite.js";
const favoriteSystem = favorite();
const LANG = language();
let globalType = "all", IDList = [], TypeList = [];


async function listLoad(listType) {
    const favList = favoriteSystem.getAll();
    const listElement = document.getElementById("favorite-media-grid")
    listElement.innerHTML = "";
    let list = "";
    IDList.length = 0;
    TypeList.length = 0;
    for (let item of favList) {
        let favID = item.id;
        let favType = item.type;
        let favItem;
        let favIMG;
        if (listType === "all") {
            const resolve = await fetch(`${DEFAULT_URL}/${favType}/${favID}?api_key=${API_KEY}&${LANG}`);
            if (!resolve.ok) throw new Error("Favori listesi yüklenmedi - all")
            favItem = await resolve.json();
        }

        if (listType === "series" && favType === "tv") {
            const resolve = await fetch(`${DEFAULT_URL}/${favType}/${favID}?api_key=${API_KEY}&${LANG}`);
            if (!resolve.ok) throw new Error("Favori listesi yüklenmedi - all")
            favItem = await resolve.json();
        }

        if (listType === "movies" && favType === "movie") {
            const resolve = await fetch(`${DEFAULT_URL}/${favType}/${favID}?api_key=${API_KEY}&${LANG}`);
            if (!resolve.ok) throw new Error("Favori listesi yüklenmedi - all")
            favItem = await resolve.json();
        }

        if (!favItem) continue;

        IDList.push(item.id)
        TypeList.push(item.type);

        const favName = favType === "tv" ? favItem.name : favItem.title;
        const favDate = favType === "tv" ? favItem.first_air_date : favItem.release_date;

        const genreNames = favItem.genres.map(genre => genre.name);
        genreNames.sort()
        let genreList = "";
        for (let x = 0; x < genreNames.length; x++) {
            if (x === ( genreNames.length - 1 ))
                genreList += genreNames[x];
            else
                genreList += genreNames[x] + ", ";
        }
        list = `
            <article class="media-card">
              <div class="card-image-wrapper">
                <img src="${IMG_DEFAULT_URL}original${favItem.poster_path}" alt="${favName} Poster">
                <div class="card-overlay">
                  <div class="card-actions">
                    <button class="play-btn"><i class="fa-solid fa-play"></i></button>
                    <button class="remove-btn" title="Remove from favorites"><i class="fa-solid fa-xmark"></i></button>
                  </div>
                  <div class="card-info">
                    <h3>${favName}</h3>
                    <div class="meta-data">
                      <span class="quality">HD</span>
                      <span class="rating"><i class="fa-solid fa-star"></i> ${favItem.vote_average.toFixed(1)}</span>
                      <span class="year">${favDate}</span>
                    </div>
                    <p class="genre">${genreList}</p>
                  </div>
                </div>
              </div>
            </article>
        `
        listElement.innerHTML += list;
    }
    removeFav(globalType)
}

function removeFav(type = globalType) {
    const listElement = document.getElementById("favorite-media-grid")
    const favList = listElement.querySelectorAll("article")
    for (let x = 0; x < favList.length; x++) {
        let favButtonList = favList[x].querySelector(".remove-btn")
        let favName = favList[x].querySelector("h3")
        favButtonList.addEventListener("click", async function () {
            favoriteSystem.set(IDList[x], TypeList[x], "", favName.innerHTML)
            await listLoad(type)
        })
    }
}


document.addEventListener("DOMContentLoaded", async function(){
    await listLoad("all")
})

const menuItems = document.querySelectorAll("#fav-filter-tabs button")

menuItems.forEach(item => {
    switch (item.id) {
        case "fav-all":
            item.addEventListener("click", () => {
                listLoad("all")
                item.classList.add("active")
                menuItems.forEach(anotherItem => {
                    if (anotherItem.id !== item.id) anotherItem.classList.remove("active")
                })
                globalType = "all";
            })

            break;
        case "fav-movies":
            item.addEventListener("click", () => {
                listLoad("movies")
                item.classList.add("active")
                menuItems.forEach(anotherItem => {
                    if (anotherItem.id !== item.id) anotherItem.classList.remove("active")
                })
                globalType = "movies";
            })

            break;
        case "fav-series":
            item.addEventListener("click", () => {
                listLoad("series")
                item.classList.add("active")
                menuItems.forEach(anotherItem => {
                    if (anotherItem.id !== item.id) anotherItem.classList.remove("active")
                })
                globalType = "series";
            })
            break;
        default:
            break;
    }
})