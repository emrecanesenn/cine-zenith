import {API_KEY, DEFAULT_URL, IMG_DEFAULT_URL, language} from "./apiSettings.js";
import apiList from "./apiList.js";

// ====================================================================
// GLOBAL VE SLIDER DEĞİŞKENLERİ
// ====================================================================
let LANG = language();
let mediaType, mediaId, langLoad, menu;

let allBackdrops = []; // Tüm görselleri tutacak dizi
let currentImageIndex = 0; // Şu an gösterilen görselin indeksi

// DOM Elementleri (Global scope'da tanımlanır, böylece her yerden erişilebilir)
const mainBackdropImage = document.getElementById('main-backdrop-image');
const prevImageBtn = document.getElementById('prev-image-btn');
const nextImageBtn = document.getElementById('next-image-btn');
const thumbnailNavigationWrapper = document.querySelector('.thumbnail-navigation-wrapper');

// Lightbox DOM Elementleri (HTML'in en altında eklenmiş varsayılır)
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImage = document.getElementById('lightbox-image');
const closeLightboxBtn = document.querySelector('.close-lightbox');
const lightboxPrevBtn = document.querySelector('.lightbox-prev');
const lightboxNextBtn = document.querySelector('.lightbox-next');


// ====================================================================
// ANA VERİ ÇEKME VE BAŞLATMA FONKSİYONU
// ====================================================================
async function theMedia(mediaType, ID) {
    try {
        const scriptObj = await apiList();
        const lang = await scriptObj.language(localStorage.getItem("lang"));
        langLoad = scriptObj.languageLoad;

        // Promise.all ile paralel veri çekme mantığına geçiş (Performans için)
        const [provRes, mediaRes, mediaResTR, actorRes, imagesData, similarRes] = await Promise.all([
            fetch(`${DEFAULT_URL}/${mediaType}/${ID}/watch/providers?api_key=${API_KEY}&${LANG}`),
            fetch(`${DEFAULT_URL}/${mediaType}/${ID}?api_key=${API_KEY}&${LANG}`),
            fetch(`${DEFAULT_URL}/${mediaType}/${ID}?api_key=${API_KEY}`),
            fetch(`${DEFAULT_URL}/${mediaType}/${ID}/credits?api_key=${API_KEY}`),
            getMediaImages(mediaType, ID),
            getSimilarContent(mediaType, ID)
        ]);

        if (!mediaRes.ok) throw new Error(`${mediaType} is not loading`);
        if (!actorRes.ok) throw new Error("actorList is not loaded");

        const providers = await provRes.json();
        const media = await mediaRes.json();
        const mediaTR = await mediaResTR.json();
        const actors = await actorRes.json();
        const similarContentData = similarRes;

        // Medya Görsellerini Global Diziye Kaydet
        allBackdrops = imagesData.backdrops;

        await actorList(actors, lang);

        // Sayfa Yüklendiğinde tüm sekmeleri gizle ve sadece ilkini aç (Credits)
        document.querySelector(".details-more .container .media").style.display = "none";
        document.querySelector(".details-more .container .similarContent").style.display = "none";
        document.querySelector(".details-more .container .seasons").style.display = "none";

        // TV ise Sezonlar menüsünü hazırla ve varsayılan olarak ilk sezonu yükle
        if (mediaType === "tv") {
            // seasons içeriğini doldur
            createSeasonCards(media.seasons, lang);
            setupSeasonSelection(mediaId, lang);
            // Varsayılan olarak ilk sezonu yükle (Genellikle Sezon 1, Season 0'ı atlar)
            const firstSeason = media.seasons.find(s => s.season_number > 0);
            if(firstSeason) {
                await loadEpisodes(mediaId, firstSeason.season_number, lang);
            }
        }

        // Medya Galerisini Kur
        createMediaGallery(imagesData);
        setupMediaGalleryClickEvents(); // Lightbox ve slider olaylarını kur
        createSimilarContentCards(similarContentData, lang);

        // Menu router'ı kur
        menu = detailsMenu(lang);

        const mediaImage = `${IMG_DEFAULT_URL}original/${media.poster_path}`;
        const backImage = `${IMG_DEFAULT_URL}original/${media.backdrop_path}`;
        await mediaList(media, mediaTR, mediaImage, backImage, providers ,lang);

    } catch (e) {
        alert(`HATA: ${e}`);
        console.error(e);
    }
}

async function getMediaImages(mediaType, ID) {
    const URL = `${DEFAULT_URL}/${mediaType}/${ID}/images?api_key=${API_KEY}`;
    try {
        const response = await fetch(URL);
        if (!response.ok) {
            throw new Error('Görseller yüklenemedi.');
        }
        const imageData = await response.json();
        return {
            backdrops: imageData.backdrops,
            posters: imageData.posters
        };
    } catch (error) {
        console.error("Görsel Çekme Hatası:", error);
        return { backdrops: [], posters: [] };
    }
}
// Diğer fonksiyonlar (getRandomIndex, mediaList, renderProviders, actorList) buraya devam eder
// ====================================================================

function getRandomIndex(arrayLength) {
    if (arrayLength <= 0) {
        return 0; // Dizi boşsa veya geçersizse 0 döndür (güvenlik)
    }

    return Math.floor(Math.random() * arrayLength);
}

async function mediaList(mediaDetail, mediaDetailTR, posters, backdrops, providers,lang) {
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

    detailOverview.innerHTML = mediaDetail.overview || mediaDetailTR.overview; // Media Contents

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
    const providerListElem = document.querySelector('.provider-list');
    const targetCountry = 'TR'; // Türkiye'yi hedef alıyoruz
    providerListElem.innerHTML = ''; // Listeyi temizle

    // 1. Ülke verisinin mevcut olup olmadığını kontrol et
    const countryData = providers.results[targetCountry];

    if (!countryData) {
        provideElem.innerHTML = `<strong data-i18n="providerNotFoundText"></strong>`;
        return;
    }

    // 2. Abonelik (flatrate) servislerini çek
    const streamingServices = countryData.flatrate;

    if (!streamingServices || streamingServices.length === 0) {
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
    providerListElem.innerHTML += providerHTML;
}

async function getSimilarContent(mediaType, ID) {
    const URL = `${DEFAULT_URL}/${mediaType}/${ID}/similar?api_key=${API_KEY}&${LANG}`;
    try {
        const response = await fetch(URL);
        if (!response.ok) {
            throw new Error('Benzer içerikler yüklenemedi.');
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Benzer içerik çekme hatası:", error);
        return [];
    }
}

function createSimilarContentCards(similarMediaData, lang) {
    const similarListWrapper = document.querySelector('.similar-list-wrapper');
    similarListWrapper.innerHTML = ''; // Önceki içeriği temizle
    if (!similarMediaData || similarMediaData.length === 0) {
        similarListWrapper.innerHTML = `<p style="color: #aaa; text-align: center;">${lang.similarContentNotFound}</p>`;
        document.querySelector(".details-similarContent").style.display = "none";
        return;
    }

    // İlk 15-20 içeriği gösterebiliriz
    similarMediaData.slice(0, 20).forEach(item => {
        const title = item.title || item.name;
        const posterUrl = item.poster_path
            ? `${IMG_DEFAULT_URL}w300/${item.poster_path}`
            : 'assets/images/no-poster-available.png'; // Varsayılan görsel
        const itemType = item.media_type || mediaType; // item.media_type bazen döner, dönmezse ana tipi kullan

        // Detay sayfasına yönlendirecek linki oluştur (Örn: /details.html?type=movie&id=123)
        const detailLink = `details.html?type=${itemType}&id=${item.id}`;

        const card = document.createElement('a');
        card.className = 'content-card';
        card.href = detailLink;
        card.title = title; // Hover için tam başlık

        card.innerHTML = `
            <div class="card-poster">
                <img src="${posterUrl}" alt="${title} Poster">
            </div>
            <div class="card-title">${title}</div>
            <div class="card-rating">
                <ion-icon style="color: var(--citrine)" name="star"></ion-icon>
                <span style="color: #b1b3ae">${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
        `;

        similarListWrapper.appendChild(card);
    });
}

async function actorList(actors, lang) {
    document.querySelector(".actor-title").innerHTML = lang.credits.actorTitle;
    document.querySelector(".crew-title").innerHTML = lang.credits.crewTitle;
    const actorList = document.getElementById("actorsList")
    let actorItem = "";
    let count = 0;
    // Cast Listing
    for (let person of actors.cast) {
        if (count >= 15) { break; } // İlk 15 kişi
        const actorImage = person.profile_path ? `${IMG_DEFAULT_URL}original/${person.profile_path}` : lang.crewListNonProfile;
        actorItem += `
            <li class="actor-item">
                <a href="personDetail.html?id=${person.id}">
                <img src="${actorImage}" alt="${person.name} profile picture">
                </a>
                <span class="actor-in-name">${person.character}</span>
                <span class="actor-real-name">${person.name}</span>
            </li>
        `
        count++;
    }
    if (actors.cast.length > 15) {
        actorItem += `
            <button class="actor-more">${lang.sectionMoreButton}</button>
        `
    }
    actorList.innerHTML = actorItem;


    /**
     * Crew Listing
     */
    count = 0;
    const crewList = document.getElementById("crewsList")
    let crewItem = "";
    if (!actors.crew.length) {
        document.querySelector(".crew-title").style.display = "none";
        return;
    }

    for (let person of actors.crew) {
        if (count >= 15) { break; } // İlk 15 kişi
        const crewImage = person.profile_path ? `${IMG_DEFAULT_URL}original/${person.profile_path}` : lang.crewListNonProfile;
        crewItem += `
            <li class="actor-item">
                <a href="personDetail.html?id=${person.id}">
                    <img src="${crewImage}" alt="${person.name} profile picture">
                </a>
                <span class="actor-in-name">${person.job}</span>
                <span class="actor-real-name">${person.name}</span>
            </li>
        `
        count++;
    }

    if (actors.crew.length > 15) {
        crewItem += `
        <button class="actor-more">${lang.sectionMoreButton}</button>
    `
    }

    crewList.innerHTML = crewItem;
}

function createSeasonCards(seasonsData, lang) {
    const seasonListWrapper = document.querySelector('.season-list-wrapper');
    seasonListWrapper.innerHTML = ''; // Önceki içeriği temizle

    seasonsData.forEach(season => {
        // Özel Bölümler (Season 0) genellikle gösterilmez, kontrol edebilirsiniz.
        if (season.season_number === 0) return;

        const posterUrl = season.poster_path
            ? `${IMG_DEFAULT_URL}w300/${season.poster_path}`
            : 'assets/images/non-profile-tr.png'; // Kendi varsayılan görseliniz

        const card = document.createElement('div');
        card.className = 'season-card';
        card.dataset.seasonId = season.season_number; // Tıklamada kullanmak için

        card.innerHTML = `
            <img src="${posterUrl}" alt="${season.name} Poster">
            <div class="season-info">
                <h4>${season.name}</h4>
                <p data-i18n-key="episodes_count" 
                   data-i18n-value="${season.episode_count}">
                   ${season.episode_count} ${lang.episode}
                </p>
            </div>
        `;

        seasonListWrapper.appendChild(card);
    });
}

function setupSeasonSelection(tvId, lang) {
    const seasonListWrapper = document.querySelector('.season-list-wrapper');

    // Olay delegasyonu ile tüm kartları dinle
    seasonListWrapper.addEventListener('click', async (event) => {
        const card = event.target.closest('.season-card');
        if (!card) return; // Kart değilse çık

        const seasonNumber = card.dataset.seasonId;

        // 1. Görsel Değişiklik: Aktif sınıfı güncelle
        document.querySelectorAll('.season-card').forEach(s => s.classList.remove('active'));
        card.classList.add('active');

        // 2. API Çağrısı
        await loadEpisodes(tvId, seasonNumber, lang);
    });
}

async function loadEpisodes(tvId, seasonNumber, lang) {
    const episodesContainer = document.getElementById('episodes-container');
    episodesContainer.innerHTML = `<p style="color: #fff;">Bölümler yükleniyor...</p>`;

    const EPISODE_URL = `${DEFAULT_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&${LANG}`;

    try {
        const response = await fetch(EPISODE_URL);
        if (!response.ok) throw new Error(lang.seasonsLoadWrongTitle);

        const data = await response.json();

        // Bölüm listesini oluştur
        const episodesHtml = data.episodes.map(episode => `
            <div class="episode-item">
                <span class="episode-number">${episode.episode_number}</span>
                <div class="episode-details">
                    <h5>${episode.name}</h5>
                    <p>${episode.overview || lang.seasonsEpisodeNoSummary}</p>
                    <div class="episode-meta">
                        ${lang.seasonsReleaseDate}: ${episode.air_date || lang.seasonsUnknownDate} 
                        ${episode.vote_average ? `| ${lang.seasonsRateText}: ${episode.vote_average.toFixed(1)}` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        episodesContainer.innerHTML = episodesHtml;

    } catch (e) {
        episodesContainer.innerHTML = `<p style="color: red;">${lang.seasonsLoadWrong}: ${e.message}</p>`;
        console.error("Bölüm yükleme hatası:", e);
    }
}

// ====================================================================
// MEDYA GALERİSİ (SLIDER VE LIGHTBOX) FONKSİYONLARI
// ====================================================================

// Fonksiyon: Ana Görseli ve Thumbnail'ları Güncelle
function updateMediaDisplay(index) {
    if (allBackdrops.length === 0) {
        if(mainBackdropImage) {
            mainBackdropImage.src = 'assets/images/no-image-available.png'; // Varsayılan görsel
            mainBackdropImage.alt = 'Görsel yok';
        }
        return;
    }

    currentImageIndex = (index + allBackdrops.length) % allBackdrops.length; // Döngüsel indeks

    const currentImage = allBackdrops[currentImageIndex];
    if(mainBackdropImage) {
        mainBackdropImage.src = `${IMG_DEFAULT_URL}w1280/${currentImage.file_path}`; // Ana görsel
        mainBackdropImage.alt = `Görsel ${currentImageIndex + 1}`;
    }


    // Aktif thumbnail'ı vurgula
    document.querySelectorAll('.thumbnail-item').forEach((thumb, i) => {
        if (i === currentImageIndex) {
            thumb.classList.add('active');
            // Aktif thumbnail'ı kaydırılabilir alanda görünür yap (opsiyonel)
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            thumb.classList.remove('active');
        }
    });
}

// Fonksiyon: Thumbnail Galeri Oluştur
function createMediaGallery(imagesData) {
    if(!thumbnailNavigationWrapper) return; // Element yoksa fonksiyonu durdur

    thumbnailNavigationWrapper.innerHTML = ''; // Önceki içeriği temizle
    allBackdrops = imagesData.backdrops; // Tüm görselleri kaydet

    if (!allBackdrops || allBackdrops.length === 0) {
        thumbnailNavigationWrapper.innerHTML = '<p style="color: #aaa; text-align: center;">Bu içeriğe ait görsel bulunamadı.</p>';
        return;
    }

    allBackdrops.forEach((image, index) => {
        const thumbnailUrl = `${IMG_DEFAULT_URL}w300/${image.file_path}`;

        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail-item';
        thumbnail.dataset.index = index; // Hangi görsel olduğunu tutmak için

        thumbnail.innerHTML = `<img src="${thumbnailUrl}" alt="Thumbnail ${index + 1}">`;
        thumbnailNavigationWrapper.appendChild(thumbnail);
    });

    // İlk görseli varsayılan olarak göster
    updateMediaDisplay(0);
}

// Fonksiyon: Lightbox'ı Aç
function openLightbox(index) {
    if(!lightboxModal) return;
    currentImageIndex = index;
    lightboxModal.style.display = 'flex'; // Flex ile ortalama
    lightboxImage.src = `${IMG_DEFAULT_URL}original/${allBackdrops[currentImageIndex].file_path}`;
}

// Fonksiyon: Lightbox'ı Kapat
function closeLightbox() {
    if(lightboxModal) {
        lightboxModal.style.display = 'none';
    }
}

// Fonksiyon: Lightbox ve Slider Olaylarını Kur
function setupMediaGalleryClickEvents() {
    // 1. Ana Görsel Navigasyon Okları
    if(prevImageBtn) prevImageBtn.addEventListener('click', () => updateMediaDisplay(currentImageIndex - 1));
    if(nextImageBtn) nextImageBtn.addEventListener('click', () => updateMediaDisplay(currentImageIndex + 1));

    // 2. Thumbnail Tıklamaları
    if(thumbnailNavigationWrapper) thumbnailNavigationWrapper.addEventListener('click', (event) => {
        const thumbnail = event.target.closest('.thumbnail-item');
        if (!thumbnail) return;
        const index = parseInt(thumbnail.dataset.index);
        updateMediaDisplay(index);
    });

    // 3. Ana Görsele Tıklayınca Lightbox Aç
    if(mainBackdropImage) mainBackdropImage.addEventListener('click', () => {
        openLightbox(currentImageIndex);
    });

    // 4. Lightbox Kapatma Butonu
    if(closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);

    // 5. Lightbox Okları (Gezinme)
    if(lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + allBackdrops.length) % allBackdrops.length;
        lightboxImage.src = `${IMG_DEFAULT_URL}original/${allBackdrops[currentImageIndex].file_path}`;
    });

    if(lightboxNextBtn) lightboxNextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % allBackdrops.length;
        lightboxImage.src = `${IMG_DEFAULT_URL}original/${allBackdrops[currentImageIndex].file_path}`;
    });

    // 6. Klavye Kontrolleri
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal) return;

        if (e.key === 'Escape' && lightboxModal.style.display === 'flex') {
            closeLightbox();
        }
        if (lightboxModal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                if(lightboxPrevBtn) lightboxPrevBtn.click();
            } else if (e.key === 'ArrowRight') {
                if(lightboxNextBtn) lightboxNextBtn.click();
            }
        }
    });
}


// ====================================================================
// MENU VE ROUTER FONKSİYONLARI
// ====================================================================

function detailsMenu(lang) {
    const credits = document.getElementById("details-credits")
    credits.innerHTML = lang.detailsMenu.detailsCredits;
    const seasons = document.getElementById("details-seasons")
    seasons.innerHTML = lang.detailsMenu.detailsSeasons;
    const media = document.getElementById("details-media")
    media.innerHTML = lang.detailsMenu.detailsMedia;
    const similarContent = document.getElementById("details-similarContent")
    similarContent.innerHTML = lang.detailsMenu.detailsSimilarContent;

    // Movie ise Sezonlar menüsünü gizle ve içeriği DOM'dan kaldır
    if (mediaType !== "tv") {
        const seasonsLink = document.getElementById('details-seasons');
        if (seasonsLink) {
            seasonsLink.closest('li').style.display = 'none'; // li etiketini gizle
        }
        const seasonsContent = document.querySelector('.seasons');
        if(seasonsContent) {
            seasonsContent.remove(); // İçeriği DOM'dan kaldır (boşluk kalmaması için)
        }
    }

    return {
        activeSelect(menuId, menuItems) {
            let select, beforeSelect;
            menuItems.forEach(item => {
                // Sadece görünür menü öğelerini kontrol et
                if(item.closest('li').style.display !== 'none') {
                    if (item.id === menuId) {
                        if (!item.classList.contains("active")) {
                            item.classList.add("active")
                        }
                        select = item.id.slice(8, item.id.length);
                    } else {
                        if(item.classList.contains("active")) {
                            item.classList.remove("active");
                            beforeSelect = item.id.slice(8, item.id.length);
                        }
                    }
                }
            })
            // İlk açılışta beforeSelect boş gelebilir, bu yüzden kontrol edin
            if(select && beforeSelect) {
                detailsMenuRouter(select, beforeSelect)
            } else if (select) {
                // İlk seçimde sadece seçilen menüyü göster (ilk menü Credits olduğu varsayılıyor)
                document.querySelector(`.${select}`).style.display = "block";
            }
        }
    }
}

function detailsMenuRouter(selectMenu, beforeSelect) {

    const select = document.querySelector(`.${selectMenu}`)
    const before = document.querySelector(`.${beforeSelect}`)
    before.style.display = "none";
    select.style.display = "block";

}

// ====================================================================
// BAŞLATMA VE OLAY DİNLEYİCİLERİ
// ====================================================================

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    mediaId = urlParams.get('id');
    mediaType = urlParams.get('type');

    if (mediaId && mediaType) {
        theMedia(mediaType, mediaId)
    } else {
        console.error("Hatalı URL: Gerekli ID veya Tip bulunamadı.");
        window.location.href = '../../index.html';
    }
});

// Kaydırma olayları
const provider = document.getElementById("providers")
if(provider) {
    provider.addEventListener("mouseleave", ()=> {
        provider.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    })
}


const storyline = document.getElementById("storyline")
if(storyline) {
    storyline.addEventListener("mouseleave", ()=> {
        storyline.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    })
}


// Menü Tıklama Olayı
const menuLinks = document.querySelectorAll(".details-menu-item a")

menuLinks.forEach(menuItem => {
    menuItem.addEventListener("click", event => {

        event.preventDefault();

        const selectId = event.currentTarget.id;

        // Menu değişkeni theMedia içinde kurulduğu için, kurulduğundan emin olmak için kontrol ekleyin
        if(menu) {
            menu.activeSelect(selectId, menuLinks)
        } else {
            console.error("Menu object not initialized.");
        }
    })
})