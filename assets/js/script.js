'use strict';
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

document.addEventListener("DOMContentLoaded", initializeApp)

const filterListButton = document.getElementById("filterList");

for (let x = 0; x < filterListButton.childElementCount; x++) {
  const listItem = filterList.children[x];

  const buttonElement = listItem.querySelector(".filter-btn");

  if (buttonElement && buttonElement.classList.contains("upcomingOnButton")) {
    buttonElement.style.borderColor = "var(--citrine)";
    buttonElement.style.borderStyle = "solid";

    break;
  }
}