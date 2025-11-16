import {API_KEY, DEFAULT_URL, IMG_DEFAULT_URL, language} from "./apiSettings.js";
let LANG = language();
let mediaType, mediaId;

async function theMedia(mediaType, ID) {
    try {
        const resolve = await fetch(`${DEFAULT_URL}/${mediaType}/${ID}?api_key=${API_KEY}&${LANG}`)
        if (!resolve.ok) throw new Error(`${mediaType} is not loading`);
        const media = await resolve.json();

        const images = await getMediaImages()

        const mediaImage = images.posters;
        const backImage = images.backdrops;

        await mediaList(media, mediaImage, backImage)
    } catch (e) {
        alert(`HATA: ${e}`)
    }
}

async function getMediaImages() {
    const URL = `${DEFAULT_URL}/${mediaType}/${mediaId}/images?api_key=${API_KEY}`;

    try {
        const response = await fetch(URL);
        if (!response.ok) {
            throw new Error('Görseller yüklenemedi.');
        }
        const imageData = await response.json();

        // Gelen veride iki temel dizi bulunur: 'backdrops' ve 'posters'
        return {
            backdrops: imageData.backdrops, // Yatay Arka Plan Görselleri (Slaytlar için ideal)
            posters: imageData.posters      // Dikey Afişler (Galeri için ideal)
        };

    } catch (error) {
        console.error("Görsel Çekme Hatası:", error);
        return { backdrops: [], posters: [] };
    }
}

function getRandomIndex(arrayLength) {
    if (arrayLength <= 0) {
        return 0; // Dizi boşsa veya geçersizse 0 döndür (güvenlik)
    }

    return Math.floor(Math.random() * arrayLength);
}

async function mediaList(mediaDetail, posters, backdrops) {
    const detailTitle = document.getElementById("detail-title");
    const detailPoster = document.getElementById("detail-poster")
    const detailBanner = document.getElementById("detail-banner")
    const detailDate = document.querySelector(`#detail-date span`)
    const detailGenree = document.getElementById("detail-genree")
    const detailOverview = document.getElementById("detail-overview")
    const detailRuntimeSeason =  document.querySelector(`#detail-runtime-season span`)
    const detailRuntimeSeasonIcon =  document.querySelector(`#detail-runtime-season ion-icon`)
    const detailStatus = document.getElementById("detail-status")
    const detailPG = document.getElementById("detail-pg")

    const mediaImage = `${IMG_DEFAULT_URL}original/${posters[0].file_path}`;
    const backImage = `${IMG_DEFAULT_URL}original/${backdrops[getRandomIndex(backdrops.length)].file_path}`;


    if (mediaType === "tv") {
        detailTitle.innerHTML = mediaDetail.name;

        detailRuntimeSeasonIcon.setAttribute("name", "albums-outline")
        detailRuntimeSeason.innerHTML = `${mediaDetail.last_episode_to_air.season_number} Season `

        const episodeIcon = document.createElement("ion-icon")
        const episodeText = document.createElement("span")
        episodeIcon.setAttribute("name", "play-circle-outline")
        episodeText.innerHTML = `${mediaDetail.number_of_episodes} Episode`;

        document.getElementById("detail-runtime-season").appendChild(episodeIcon)
        document.getElementById("detail-runtime-season").appendChild(episodeText)

        detailDate.innerHTML = mediaDetail.first_air_date;

        detailPoster.setAttribute("alt", `${mediaDetail.name} is poster`)

        if (mediaDetail.status === 'Returning Series') {
            detailStatus.innerHTML = 'New Episodes';
            detailStatus.style.display = 'block';
        } else if (mediaDetail.status === 'Ended') {
            detailStatus.innerHTML = 'Series Ended';
            detailStatus.style.display = 'block';
        } else if (mediaDetail.status === 'In Production') {
            detailStatus.innerHTML = 'Coming Soon';
            detailStatus.style.display = 'block';
        } else {
            // Diğer durumlar için veya bilinmiyorsa
            detailStatus.style.display = 'none'; // Veya varsayılan bir metin
        }

    } else {
        detailTitle.innerHTML = mediaDetail.title;
        detailRuntimeSeason.innerHTML = mediaDetail.runtime + " min";
        detailDate.innerHTML = mediaDetail.release_date;
        detailPoster.setAttribute("alt", `${mediaDetail.title} is poster`)

        const releaseYear = new Date(mediaDetail.release_date).getFullYear();
        const currentYear = new Date().getFullYear();

        if (releaseYear === currentYear) {
            detailStatus.innerHTML = 'New Release';
            detailStatus.style.display = 'block';
        } else {
            detailStatus.innerHTML = 'Now Streaming'; // Veya gizle
            detailStatus.style.display = 'block';
        }

    }

    detailPoster.setAttribute("src", `${mediaImage}`) // Poster Image
    detailBanner.style.background = `url("${backImage}") no-repeat center`;

    detailOverview.innerHTML = mediaDetail.overview; // Media Contents

    // Genre Listing
    const genreNames = mediaDetail.genres.map(genre => genre.name);
    genreNames.sort()

    for (let x = 0; x < genreNames.length; x++) {
        if (x === ( genreNames.length - 1 ))
            detailGenree.innerHTML += `<a href="#">${genreNames[x]}</a>`;
        else
            detailGenree.innerHTML += `<a href="#">${genreNames[x]},</a>`;
    }

    // Adult control PG/18+
    const isAdult = mediaDetail.adult;

    if (isAdult) {
        detailPG.innerHTML = '18+';
    } else {
        detailPG.innerHTML = 'PG';
    }



}

document.addEventListener("DOMContentLoaded", () => {
    // URL'deki query string parametrelerini yöneten nesneyi oluştur
    const urlParams = new URLSearchParams(window.location.search);

    // 'id' parametresini yakala
    mediaId = urlParams.get('id');

    // 'type' parametresini yakala (movie veya tv)
    mediaType = urlParams.get('type');

    if (mediaId && mediaType) {
        console.log(`Detaylar için ID: ${mediaId}, Tip: ${mediaType}`);

        theMedia(mediaType, mediaId)
    } else {
        // Parametreler eksikse kullanıcıyı ana sayfaya yönlendir
        console.error("Hatalı URL: Gerekli ID veya Tip bulunamadı.");
        window.location.href = '../../index.html';
    }
});