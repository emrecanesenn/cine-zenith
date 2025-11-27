"use strict";
import {API_KEY, DEFAULT_URL, IMG_DEFAULT_URL, language} from "./apiSettings.js";
import apiList from "./apiList.js";
let scriptObj, lang;

const LANG = language()

let GENRE_DATA = [], MOVIE_ONLY_GENRES = [], TV_ONLY_GENRES = [];
let genres = [];
let type = sessionStorage.getItem("type") || "movies";
let rating = sessionStorage.getItem("rating");
let currentPage = 1;
let totalPages = 1;

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

        GENRE_DATA = createCommonGenreData(genreMovieData.genres, genreTvData.genres) // Kapsayıcı kategori listesi
        MOVIE_ONLY_GENRES = genreMovieData.genres;
        TV_ONLY_GENRES = genreTvData.genres;

    }catch (e) {
        console.error("HATA: " + e)
    }
}

async function filterData(page = 1) {
    let pageData = page;
    let text = "";
    try {
        const searchQuery = document.getElementById("search-input").value.trim();

        if (searchQuery) {
            if(type === "cast") {
                const resolve = await fetch(`${DEFAULT_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageData}&${LANG}`)
                if (!resolve.ok) throw new Error("Input Cast Search Error")

                const resultData = await resolve.json()
                const personList = resultData.results;

                renderPagination(resultData.total_pages, pageData);

                text = `
                Total ${resultData.total_results} results -
                Listing <span class="highlight-count">${personList.length}</span> results
                `
                document.querySelector(".results-header h3").innerHTML = text;
                renderProviders(personList, "queryCast")
            } else {
                const resolve = await fetch(`${DEFAULT_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageData}&${LANG}`)
                if (!resolve.ok) throw new Error("Input Search Error")

                const resultData = await resolve.json()
                const mediaList = resultData.results;

                renderPagination(resultData.total_pages, pageData);

                text = `
                Total ${resultData.total_results} results -
                Listing <span class="highlight-count">${mediaList.length}</span> results
                `
                document.querySelector(".results-header h3").innerHTML = text;
                renderProviders(mediaList, "queryMedia")
            }

        } else {
            let genreList = genres.join(",");
            const rate = rating !== 0 ? rating : "";

            const [moviesRes, seriesRes] = await Promise.all([
                fetch(`${DEFAULT_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreList}&vote_average.gte=${rate}&sort_by=${document.querySelector(".custom-select").value}&page=${pageData}&${LANG}`),
                fetch(`${DEFAULT_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreList}&vote_average.gte=${rate}&sort_by=${document.querySelector(".custom-select").value}&page=${pageData}&${LANG}`)
            ])
            if (!moviesRes.ok && !seriesRes.ok) throw new Error("Fetch Error - Series and Movies");

            const movieData = await moviesRes.json();
            const tvData = await  seriesRes.json();
            const movieList = await movieData.results;
            const tvList = await tvData.results;


            if (type !== "movies" && type !== "series") type = "movies";
            switch (type) {
                case "movies" :
                    renderPagination(movieData.total_pages, pageData);
                    text = `
                    Total ${movieData.total_results} results -
                    Listing <span class="highlight-count">${movieList.length}</span> results
                    `
                    document.querySelector(".results-header h3").innerHTML = text;
                    renderProviders(movieList, type)
                    break;
                case "series" :
                    renderPagination(tvData.total_pages, pageData);
                    text = `
                    Total ${tvData.total_results} results -
                    Listing <span class="highlight-count">${tvList.length}</span> results
                    `
                    document.querySelector(".results-header h3").innerHTML = text;
                    renderProviders(tvList, type)
                    break;
                default:
                    throw new Error("List type error");
            }

        }

    } catch (e) {
        console.error(`HATA: ${e}`)
    }
}

/**
 *
 * @param {array} data TV - Movie
 * @param {string} dataType TV - Movie
 */

function renderProviders(data,  dataType) {
    const listElement = document.getElementById("results-grid");
    listElement.innerHTML = "";
    let listText = "";
    try {

        if (dataType === "movies") {
            for (let media of data) {
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
                            <a href="details.html?id=${media.id}&type=movie">
                                <h3>${media.title}</h3>
                                <div class="meta-data">
                                    <span class="rating"><i class="fa-solid fa-star"></i> ${media.vote_average.toFixed(1)}</span>
                                    <span class="year">${media.release_date.slice(0, 4)} - <b>${lang.movieText}</b></span>
                                </div>
                                <p class="genre">${genreList}</p>
                            </a>
                            </div>
                        </div>
                        
                    </div>
                </article>
                `
            }
        } else if (dataType === "series") {
            for (let media of data) {
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
                            <a href="details.html?id=${media.id}&type=tv">
                                <h3>${media.name}</h3>
                                <div class="meta-data">
                                    <span class="rating"><i class="fa-solid fa-star"></i> ${media.vote_average.toFixed(1)}</span>
                                    <span class="year">${media.first_air_date.slice(0, 4)} - <b>${lang.serieText}</b></span>
                                </div>
                                <p class="genre">${genreList}</p>
                            </a>
                            </div>
                        </div>
                    </div>
                </article>
            `
            }
        } else if(dataType === "queryMedia") {
            for (let media of data) {
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
                                <a href="details.html?id=${media.id}&type=tv">
                                    <h3>${media.name}</h3>
                                    <div class="meta-data">
                                        <span class="rating"><i class="fa-solid fa-star"></i> ${media.vote_average.toFixed(1)}</span>
                                        <span class="year">${media.first_air_date.slice(0, 4)} - <b>${lang.serieText}</b></span>
                                    </div>
                                    <p class="genre">${genreList}</p>
                                </a>
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
                                <a href="details.html?id=${media.id}&type=movie">
                                    <h3>${media.title}</h3>
                                    <div class="meta-data">
                                        <span class="rating"><i class="fa-solid fa-star"></i> ${media.vote_average.toFixed(1)}</span>
                                        <span class="year">${media.release_date.slice(0, 4)} - <b>${lang.movieText}</b></span>
                                    </div>
                                    <p class="genre">${genreList}</p>
                                </a>
                                </div>
                            </div>
                        </div>
                    </article>
                    `
                }
            }
        } else if(dataType === "queryCast") {

            for (let person of data) {
                const profileLink = person.profile_path ? `${IMG_DEFAULT_URL}original/${person.profile_path}` : `assets/images/non-profile.png`

                const departmentKey = person.known_for_department;
                let translatedDepartment;

                if (!departmentKey) {
                    translatedDepartment = lang.knownForUnknown;

                } else if (localStorage.getItem("lang") === 'tr-TR') {
                    translatedDepartment = lang.department[departmentKey] || departmentKey;

                } else {
                    translatedDepartment = departmentKey;
                }

                listText += `
                    <article class="media-card">
                        <div class="card-image-wrapper">
                            <img src="${profileLink}" alt="${person.name} poster">
                            <div class="card-overlay">
                                <div class="card-actions">
                                    <button class="play-btn"><i class="fa-solid fa-play"></i></button>
                                    <button class="fav-btn"><ion-icon name="heart-outline"></ion-icon></button>
                                </div>
                                <div class="card-info">
                                <a href="personDetail.html?id=${person.id}">
                                    <h3>${person.name}</h3>
                                    <p class="genre">${translatedDepartment}</p>
                                </a>
                                </div>
                            </div>
                        </div>
                    </article>
                    `
            }

        } else throw new Error("Render Providers Error");

        listElement.innerHTML += listText;

    } catch (e) {
        console.error(`HATA: ${e}`)
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    sessionStorage.setItem("type", "movies")
    sessionStorage.setItem("genres", JSON.stringify(genres))
    sessionStorage.setItem("rating", JSON.stringify(0))
    scriptObj = await apiList();
    lang = await scriptObj.language(localStorage.getItem("lang"))
    await genreData()
    await listingGenres();
    await filterData()
})

document.getElementById("apply-btn").addEventListener("click", () => {
    filterData(1);
}) // APPLY BUTTON EVENT


/*
 *  SEARCH INPUT
 */

document.getElementById("search-input").addEventListener("input", (event) => {
    let typeList = document.querySelectorAll(".type-selector input")
    let genreList = document.querySelectorAll(".genre-grid input")
    let range = document.getElementById("rating-range")
    let customSelect = document.querySelector(".custom-select")
    let container = document.getElementById("discoverFilter")

    if (type !== "cast") {
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
    } else {
        if (!event.target.value.trim())
        document.getElementById("apply-btn").addEventListener("click", (e) => {
            e.preventDefault()
        })
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
        let castType = document.getElementById("displayCastType")
        if (type !== "cast") {
            castType.style.display = "block";
            genres.length = 0;
            sessionStorage.setItem("genres", JSON.stringify(genres))
            listingGenres()
        } else {
            castType.style.display = "none";
        }
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


/**
 * Pagination
 */

function renderPagination(total, current) {
    const paginationList = document.getElementById("pagination");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    paginationList.innerHTML = ""; // Listeyi temizle
    totalPages = total; // Global değişkeni güncelle
    currentPage = current; // Global değişkeni güncelle

    // --- ÖNCEKİ / SONRAKİ BUTON AYARLARI ---

    // Önceki buton mantığı
    prevBtn.onclick = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            filterData(currentPage - 1);
            window.scrollTo(0, 0); // Sayfa değişince yukarı kaydır
        }
    };
    // Eğer ilk sayfadaysak butonu pasif yap (görsel olarak)
    prevBtn.style.opacity = currentPage === 1 ? "0.5" : "1";
    prevBtn.style.pointerEvents = currentPage === 1 ? "none" : "auto";


    // Sonraki buton mantığı
    nextBtn.onclick = (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            filterData(currentPage + 1);
            window.scrollTo(0, 0);
        }
    };
    // Eğer son sayfadaysak butonu pasif yap
    nextBtn.style.opacity = currentPage === totalPages ? "0.5" : "1";
    nextBtn.style.pointerEvents = currentPage === totalPages ? "none" : "auto";


    // --- SAYFA NUMARALARI ALGORİTMASI ---
    // Çok fazla sayfa varsa hepsini gösterme (Örn: 1 2 3 4 5 ... 99)
    // Sadece aktif sayfanın etrafındaki 2 sayfayı ve en son sayfayı gösterelim.

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // İlk sayfa her zaman görünsün
    if (startPage > 1) {
        createPageItem(1);
        if (startPage > 2) {
            // Araya "..." koymak için boş bir li
            const dots = document.createElement("li");
            dots.innerHTML = `<span style="padding: 5px;">...</span>`;
            paginationList.appendChild(dots);
        }
    }

    // Orta kısımdaki sayfalar
    for (let i = startPage; i <= endPage; i++) {
        createPageItem(i);
    }

    // Son sayfa her zaman görünsün
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement("li");
            dots.innerHTML = `<span style="padding: 5px;">...</span>`;
            paginationList.appendChild(dots);
        }
        createPageItem(totalPages);
    }
}

// Tek bir sayfa numarası (li) oluşturan yardımcı fonksiyon
function createPageItem(pageNum) {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = "#";
    a.textContent = pageNum;
    a.style.padding = "5px 10px";
    a.style.border = "1px solid #ccc"; // CSS'ini projene göre düzeltebilirsin
    a.style.textDecoration = "none";
    a.style.color = "white";

    // Aktif sayfa ise stili farklı olsun
    if (pageNum === currentPage) {
        li.classList.add("current");
        a.style.backgroundColor = "#e50914"; // Netflix kırmızısı gibi bir renk
        a.style.border = "1px solid #e50914";
    }

    a.addEventListener("click", (e) => {
        e.preventDefault();
        if (pageNum !== currentPage) {
            filterData(pageNum);
            window.scrollTo(0, 0);
        }
    });

    li.appendChild(a);
    document.getElementById("pagination").appendChild(li);
}