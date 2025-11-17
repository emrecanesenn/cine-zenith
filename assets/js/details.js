import {API_KEY, DEFAULT_URL, IMG_DEFAULT_URL, language} from "./apiSettings.js";
import apiList from "./apiList.js";
let LANG = language();
let mediaType, mediaId, langLoad;

async function theMedia(mediaType, ID) {
    try {
        const scriptObj = await apiList();
        const lang = await scriptObj.language(localStorage.getItem("lang"));
        langLoad = scriptObj.languageLoad
        const prov = await fetch(`${DEFAULT_URL}/${mediaType}/${ID}/watch/providers?api_key=${API_KEY}&${LANG}`);
        const providers = await prov.json();
        const resolve = await fetch(`${DEFAULT_URL}/${mediaType}/${ID}?api_key=${API_KEY}&${LANG}`)
        if (!resolve.ok) throw new Error(`${mediaType} is not loading`);
        const media = await resolve.json();

        const images = await getMediaImages()

        const mediaImage = `${IMG_DEFAULT_URL}original/${media.poster_path}`;
        const backImage = `${IMG_DEFAULT_URL}original/${media.backdrop_path}`;

        await mediaList(media, mediaImage, backImage, providers ,lang)
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
            backdrops: imageData.backdrops // Yatay Arka Plan Görselleri (Slaytlar için ideal)// Dikey Afişler (Galeri için ideal)
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

async function mediaList(mediaDetail, posters, backdrops, providers,lang) {
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

    const mediaImage = `${IMG_DEFAULT_URL}original/${posters}`;
    const backImage = `${IMG_DEFAULT_URL}original/${backdrops}`;


    if (mediaType === "tv") {
        detailTitle.innerHTML = mediaDetail.name;

        detailRuntimeSeasonIcon.setAttribute("name", "albums-outline")
        detailRuntimeSeason.innerHTML = `${mediaDetail.last_episode_to_air.season_number} ${lang.season} `

        const episodeIcon = document.createElement("ion-icon")
        const episodeText = document.createElement("span")
        episodeIcon.setAttribute("name", "play-circle-outline")
        episodeText.innerHTML = `${mediaDetail.number_of_episodes} ${lang.episode}`;

        document.getElementById("detail-runtime-season").appendChild(episodeIcon)
        document.getElementById("detail-runtime-season").appendChild(episodeText)

        detailDate.innerHTML = mediaDetail.first_air_date;

        detailPoster.setAttribute("alt", `${mediaDetail.name} is poster`)

        if (mediaDetail.status === 'Returning Series') {
            detailStatus.innerHTML = lang.statusReturningSeries;
            detailStatus.style.display = 'block';
        } else if (mediaDetail.status === 'Ended') {
            detailStatus.innerHTML = lang.statusEnded;
            detailStatus.style.display = 'block';
        } else if (mediaDetail.status === 'In Production') {
            detailStatus.innerHTML = lang.statusInProduction;
            detailStatus.style.display = 'block';
        } else {
            detailStatus.style.display = lang.statusDefault; // Veya varsayılan bir metin
        }

    } else {
        detailTitle.innerHTML = mediaDetail.title;
        detailRuntimeSeason.innerHTML = mediaDetail.runtime + " " + lang.minute;
        detailDate.innerHTML = mediaDetail.release_date;
        detailPoster.setAttribute("alt", `${mediaDetail.title} is poster`)

        const releaseYear = new Date(mediaDetail.release_date).getFullYear();
        const currentYear = new Date().getFullYear();

        if (releaseYear === currentYear) {
            detailStatus.innerHTML = lang.statusNewRelease;
            detailStatus.style.display = 'block';
        } else {
            detailStatus.innerHTML = lang.statusNowStreaming; // Veya gizle
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

    renderProviders(providers, (mediaDetail.title || mediaDetail.name))
    langLoad(lang)
}

function renderProviders(providers, mediaName) {
    const provideElem = document.getElementById("isProvide");
    const targetCountry = 'TR'; // Türkiye'yi hedef alıyoruz

    // 1. Ülke verisinin mevcut olup olmadığını kontrol et
    const countryData = providers.results[targetCountry];

    if (!countryData) {
        console.log("Bu içerik için Türkiye'de izleme bilgisi bulunamadı.");
        provideElem.innerHTML = `<strong data-i18n="providerNotFoundText"></strong>`;
        return;
    }

    // 2. Abonelik (flatrate) servislerini çek
    const streamingServices = countryData.flatrate;

    if (!streamingServices || streamingServices.length === 0) {
        console.log("Türkiye'de abonelikle izleme seçeneği yok.");
        provideElem.innerHTML = `<strong data-i18n="providerNotFoundText"></strong>`;
        return;
    }

    // 3. Verileri HTML'e dönüştür ve ekle
    let providerHTML = '';

    provideElem.innerHTML = `<i data-i18n="provideTitle"></i> (${streamingServices.length})`;
    streamingServices.forEach(provider => {
        // API'den gelen verileri kullanarak dinamik HTML oluştur
        const query = encodeURIComponent(`${mediaName} ${provider.provider_name}`);
        const searchUrl = `https://www.google.com/search?q=${query}`;
        providerHTML += `
            <li class="provider-item">
                <img src="${IMG_DEFAULT_URL}w45/${provider.logo_path}" 
                     alt="${provider.provider_name} logo" 
                     class="provider-logo">
                     
                <div class="provider-info">
                    <strong>${provider.provider_name}</strong>
                    <span data-i18n="providerSubsText"></span> 
                </div>
                
                
                <a href="${searchUrl}" target="_blank" class="watch-btn" data-i18n="providerSearch"></a>
            </li>
        `;
    });

    // HTML'i DOM'a yerleştirme
    document.querySelector('.provider-list').innerHTML += providerHTML;
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

const provider = document.getElementById("providers")
provider.addEventListener("mouseleave", ()=> {
    provider.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
})

const storyline = document.getElementById("storyline")
storyline.addEventListener("mouseleave", ()=> {
    storyline.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
})