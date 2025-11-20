import { API_KEY, DEFAULT_URL, IMG_DEFAULT_URL, language } from "./apiSettings.js";
import apiList from "./apiList.js";

// Global Değişkenler
let LANG;
let personId;
let allCombinedCredits = { cast: [], crew: [] };
const FACEBOOK_BASE_URL = "https://www.facebook.com/";
const INSTAGRAM_BASE_URL = "https://www.instagram.com/";
const TWITTER_BASE_URL = "https://twitter.com/";

// DOM Elementleri
const filmographyListWrapper = document.getElementById("filmography-list-wrapper");
const personProfileImg = document.getElementById("person-profile-img");
const personName = document.getElementById("person-name");
const personKnownFor = document.getElementById("person-known-for");
const personBirthday = document.getElementById("person-birthday");
const personBirthplace = document.getElementById("person-birthplace");
const personOverview = document.getElementById("person-overview");
const socialLinksContainer = document.getElementById("social-links");
const biographyContainer = document.getElementById("biography");

// ====================================================================
// YARDIMCI FONKSİYONLAR
// ====================================================================

/**
 * Tarih formatını (YYYY-MM-DD) okunabilir hale getirir.
 * @param {string} dateString
 * @returns {string} Okunabilir tarih veya boş dize.
 */
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString(localStorage.getItem("lang") || 'tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}

// ====================================================================
// ANA VERİ ÇEKME VE BAŞLATMA FONKSİYONU
// ====================================================================

async function thePerson(ID) {
    try {
        // Dil ve API listesini yükleme
        const scriptObj = await apiList();
        const langModule = await scriptObj.language(localStorage.getItem("lang"));
        LANG = language();
        const langStrings = langModule; // Dil dizelerini al

        // 1. API Çağrıları (Promise.all ile tüm verileri paralel çekme)
        const [personRes, creditsRes, externalRes] = await Promise.all([
            fetch(`${DEFAULT_URL}/person/${ID}?api_key=${API_KEY}&${LANG}`),
            fetch(`${DEFAULT_URL}/person/${ID}/combined_credits?api_key=${API_KEY}&${LANG}`),
            fetch(`${DEFAULT_URL}/person/${ID}/external_ids?api_key=${API_KEY}`)
        ]);

        if (!personRes.ok) throw new Error("Kişi bilgileri yüklenemedi.");

        const person = await personRes.json();
        const credits = await creditsRes.json();
        const external = await externalRes.json();

        // Veriyi Global Değişkene Kaydet ve Yeniye Göre Sırala
        allCombinedCredits = {
            cast: credits.cast.sort((a, b) => new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date)),
            crew: credits.crew.sort((a, b) => new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date)),
        };

        // 2. DOM Manipülasyonları
        await renderPersonHeader(person, langStrings);
        await renderSocialLinks(external);

        // 3. Filmografiyi Varsayılan Role Göre Yükle (Oynadığı Roller - Cast)
        renderFilmography('cast');

    } catch (e) {
        console.error("Kişi Detay Yükleme Hatası:", e);
        // Hata durumunda kullanıcıya bilgi gösterimi
        personName.textContent = "Hata oluştu";
        personOverview.textContent = "Kişi detayları yüklenirken bir sorun oluştu.";
        document.getElementById("page-loader").classList.remove("active"); // Loader'ı kapat
        alert(`HATA: ${e.message}`);
    }
}

// ====================================================================
// DOM OLUŞTURMA FONKSİYONLARI
// ====================================================================

function renderPersonHeader(personData, langStrings) {

    // 1. Profil Resmi
    const profilePath = personData.profile_path
        ? `${IMG_DEFAULT_URL}w300/${personData.profile_path}`
        : 'assets/images/non-profile-en.png';
    personProfileImg.src = profilePath;
    personProfileImg.alt = personData.name;

    // 2. Temel Bilgiler
    personName.textContent = personData.name;
    personKnownFor.textContent = personData.known_for_department || langStrings.knownForUnknown;

    personBirthday.textContent = personData.birthday
        ? `${langStrings.birthday}: ${formatDate(personData.birthday)}`
        : langStrings.birthdayUnknown;

    personBirthplace.textContent = personData.place_of_birth
        ? `${langStrings.birthPlace}: ${personData.place_of_birth}`
        : langStrings.birthPlaceUnknown;

    // 3. Biyografi
    const biographyText = personData.biography || langStrings.biographyNotFound;

    // Biyografi uzunluğunu kontrol etme (örnek olarak ilk 1000 karakter)
    if (biographyText.length > 1000) {
        // Basit bir 'Daha Fazla Oku' mantığı
        personOverview.textContent = biographyText.substring(0, 1000) + '...';

        const readMoreButton = document.createElement('button');
        readMoreButton.className = 'read-more-btn';
        readMoreButton.textContent = langStrings.readMore;

        readMoreButton.onclick = () => {
            personOverview.textContent = biographyText;
            readMoreButton.style.display = 'none';
        };
        biographyContainer.appendChild(readMoreButton);

    } else {
        personOverview.textContent = biographyText;
    }
}

function renderSocialLinks(externalIds) {
    socialLinksContainer.innerHTML = '';
    const socialPlatforms = [
        { idKey: 'facebook_id', icon: 'logo-facebook', baseUrl: FACEBOOK_BASE_URL },
        { idKey: 'instagram_id', icon: 'logo-instagram', baseUrl: INSTAGRAM_BASE_URL },
        { idKey: 'twitter_id', icon: 'logo-twitter', baseUrl: TWITTER_BASE_URL }
    ];

    let hasLinks = false;

    socialPlatforms.forEach(platform => {
        const id = externalIds[platform.idKey];
        if (id) {
            hasLinks = true;
            const link = document.createElement('a');
            link.href = `${platform.baseUrl}${id}`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.innerHTML = `<ion-icon name="${platform.icon}"></ion-icon>`;
            socialLinksContainer.appendChild(link);
        }
    });

    if (!hasLinks) {
        // Eğer sosyal medya linki yoksa, başlığı gizleyebiliriz
        document.querySelector('.person-socials').style.display = 'none';
    }
}


function renderFilmography(role) {
    filmographyListWrapper.innerHTML = '';
    const data = allCombinedCredits[role].filter(item => item.media_type !== 'person');

    if (data.length === 0) {
        filmographyListWrapper.innerHTML = `<p class="loading-text" style="grid-column: 1 / -1;">${role === 'cast' ? 'Oynadığı yapım bulunamadı.' : 'Ekip üyeliği bulunamadı.'}</p>`;
        return;
    }

    data.forEach(item => {
        const title = item.title || item.name;
        const posterUrl = item.poster_path
            ? `${IMG_DEFAULT_URL}w300/${item.poster_path}`
            : 'assets/images/non-profile-tr.png';
        const year = (item.release_date || item.first_air_date || '----').substring(0, 4);
        const roleDetail = role === 'cast' ? item.character : item.job;

        const card = document.createElement('a');
        card.href = `details.html?type=${item.media_type}&id=${item.id}`;
        card.className = 'career-content-card content-card'; // Hem kariyer hem genel kart stilini kullanın

        card.innerHTML = `
            <div class="card-poster">
                <img src="${posterUrl}" alt="${title} Poster">
            </div>
            <div class="card-title">${title}</div>
            <div class="card-meta">
                <span>${year}</span>
                <span class="role-separator">|</span>
                <span class="role-detail">${roleDetail || 'Bilinmeyen Rol'}</span>
            </div>
        `;

        filmographyListWrapper.appendChild(card);
    });
}

// ====================================================================
// OLAY DİNLEYİCİLERİ VE BAŞLATMA
// ====================================================================

function setupCareerMenuEvents() {
    document.querySelector('.career-menu').addEventListener('click', (event) => {
        const button = event.target.closest('.career-btn');
        if (!button) return;

        // Aktif sınıfı güncelleme
        document.querySelectorAll('.career-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Filmografiyi yükle
        renderFilmography(button.dataset.role);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    // 1. Kariyer Menü Olaylarını Kur
    setupCareerMenuEvents();

    // 2. URL Parametresini Yönet
    const urlParams = new URLSearchParams(window.location.search);
    personId = urlParams.get('id');

    if (personId) {
        thePerson(personId);
    } else {
        console.error("Hatalı URL: Kişi ID'si bulunamadı.");
        // Gerekirse ana sayfaya yönlendirme
    }
});