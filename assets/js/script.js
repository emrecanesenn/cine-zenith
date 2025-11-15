'use strict';

import apiList from "./apiList.js";

async function language() {
  const apiScript = await apiList()
  const lang = await apiScript.language()

  document.querySelector(".header-actions .favoriteButton").innerHTML = lang.menuFavoritesButton;
  document.querySelector(".navbar-list .home").innerHTML = lang.menuHome;
  document.querySelector(".navbar-list .movies").innerHTML = lang.menuMovies;
  document.querySelector(".navbar-list .series").innerHTML = lang.menuSeries;
  document.querySelector(".navbar-list .webSeries").innerHTML = lang.menuWebSeries;
  document.querySelector(".navbar-list .about").innerHTML = lang.menuAbout;
}

/**
 * Components Fetching
 */

async function compFetch(sectionID, filePath) {

  try {

    const section = document.getElementById(sectionID)

    const resolve = await fetch(filePath)
    if (!resolve.ok) throw new Error("Dosya düzgün yüklenemedi!");

    section.innerHTML = await resolve.text();

  } catch (err) {
    console.error(`HATA: ${err}`);
    alert(`HATA: ${err}`);
  }
}

async function initializeApp() {
  const loader = document.getElementById('page-loader');

  await Promise.all([
    compFetch("footer", `assets/components/footer.html`),
    compFetch("header", `assets/components/header.html`),
    compFetch("menu", `assets/components/menu.html`)
  ]);


  /**
   * navbar variables
   */
  const navOpenBtn = document.getElementById("data-menu-open-btn");
  const navCloseBtn = document.getElementById("data-menu-close-btn");
  const navbar = document.getElementById("data-navbar");
  const overlay = document.getElementById("data-overlay");
  const navElemArr = [navOpenBtn, navCloseBtn, overlay];

  for (let i = 0; i < navElemArr.length; i++) {

    navElemArr[i].addEventListener("click", function () {

      navbar.classList.toggle("active");
      overlay.classList.toggle("active");
      document.body.classList.toggle("active");

    });

  }

  /**
   * header sticky
   */
  const header = document.getElementById("menu");

  window.addEventListener("scroll", function () {

    window.scrollY >= 10 ? header.classList.add("active") : header.classList.remove("active");

  });


  /**
   * search modal (pop-up) logic
   */
      // Ana Pop-up Elementleri
  const searchModal = document.getElementById("search-modal");
  const searchOverlay = document.getElementById("search-overlay");
  const modalCloseBtn = document.getElementById("search-modal-close-btn");

// Pop-up'ı Açacak Butonlar
  const headerSearchBtn = document.getElementById("header-search-open-btn");
  const ctaSearchBtn = document.getElementById("cta-search-open-btn");

// Hepsini bir diziye toplayalım
  const searchTriggers = [headerSearchBtn, ctaSearchBtn];
  const searchClosers = [modalCloseBtn, searchOverlay];

// Açma Fonksiyonu
  const openSearchModal = function () {
    if (searchModal) searchModal.classList.add("active");
    if (searchOverlay) searchOverlay.classList.add("active");
    // Arka planın kaymasını engelle
    document.body.classList.add("active");
  }

// Kapatma Fonksiyonu
  const closeSearchModal = function () {
    if (searchModal) searchModal.classList.remove("active");
    if (searchOverlay) searchOverlay.classList.remove("active");
    document.body.classList.remove("active");
  }

// Açma Butonlarına tıklama olayı ekle
  for (let i = 0; i < searchTriggers.length; i++) {
    // Butonun var olup olmadığını kontrol et (header dinamik yüklendiği için)
    if (searchTriggers[i]) {
      searchTriggers[i].addEventListener("click", openSearchModal);
    }
  }

// Kapatma Elementlerine tıklama olayı ekle
  for (let i = 0; i < searchClosers.length; i++) {
    if (searchClosers[i]) {
      searchClosers[i].addEventListener("click", () => {
        closeSearchModal()
        setTimeout(() => {
          document.getElementById("search-modal-input").value = "";
          document.getElementById("search-results-list").innerHTML = "";
        }, 250)
      });
    }
  }


  /**
   * go top
   */

  const goTopBtn = document.getElementById("data-go-top");

  window.addEventListener("scroll", function () {

    window.scrollY >= 500 ? goTopBtn.classList.add("active") : goTopBtn.classList.remove("active");

  });


  // 3. Yükleyiciyi Gizle
  setTimeout(() => {
    if (loader) {
      loader.classList.add('hidden'); // DOM'dan tamamen kaldırarak sayfa düzenini optimize et
    }
  }, 500);

  // 4. Ana Uygulama Mantığını Başlat
  console.log("Cine-Zenith hazır ve çalışıyor!");
}

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  language()
})
