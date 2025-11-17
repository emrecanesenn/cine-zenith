import {API_KEY, DEFAULT_URL, language} from "./apiSettings.js";

export default async function apiList() {
    let LANG = language();
    return {
        /**
         * LANGUAGES CHOICE
         */

        languageLoad(lang, disableWord) {
            try {
                document.querySelectorAll('[data-i18n]').forEach(element => {
                    const key = element.getAttribute('data-i18n');
                    if (disableWord === key) return;
                    const translation = lang[key]; // Çeviri metni

                    if (translation) {

                        // 2. Hangi özelliğin hedeflendiğini kontrol et
                        const targetAttr = element.getAttribute('data-i18n-attr');

                        if (targetAttr) {
                            // Eğer data-i18n-attr varsa (Örn: "placeholder")
                            // Elementin o özelliğini (placeholder) çeviri metniyle güncelle
                            element.setAttribute(targetAttr, translation);

                        } else {
                            // Varsayılan: Eğer data-i18n-attr yoksa, iç içeriği (innerHTML) güncelle
                            element.innerHTML = translation;
                        }
                    }
                });
            } catch (e) {
                console.error("Language Load Error: " + e)
            }
        },

        async language(langFiles) {
            try {
                const resolve = await fetch(`assets/lang/${langFiles}.json`)
                if (!resolve.ok) throw new Error("Language Files is not loading");
                return await resolve.json();

            } catch (e) {
                alert("Error: " + e)
            }

        },

        /**
         *
         * @returns Functions
         */
        async onTheAirMovies() {
            try {

                const resolve = await fetch(`${DEFAULT_URL}/movie/now_playing?api_key=${API_KEY}&${LANG}`);
                if (!resolve.ok) throw new Error("now_playing Movies is not loaded!");

                const data = await resolve.json();

                return data.results;

            } catch (e) {
                alert(`HATA: ${e}`)
            }
        },

        async onTheAirSeries() {
            try {
                const resolve = await fetch(`${DEFAULT_URL}/tv/on_the_air?api_key=${API_KEY}&${LANG}`);
                if (!resolve.ok) throw new Error("on_the_air Series is not loaded!");
                const data = await resolve.json();
                console.log("on_the_air Series Datası işlendi");

                return data.results
            } catch (e) {
                alert(`HATA: ${e}`)
            }

        },

        async topRatedMovies() {
            try {

                const resolve = await fetch(`${DEFAULT_URL}/movie/top_rated?api_key=${API_KEY}&${LANG}`);
                if (!resolve.ok) throw new Error("Top Rated Movies is not loaded!");

                const data = await resolve.json();

                return data.results;

            } catch (e) {
                alert(`HATA: ${e}`)
            }
        },

        async topRatedSeries() {
            try {

                const resolve = await fetch(`${DEFAULT_URL}/tv/top_rated?api_key=${API_KEY}&${LANG}`);
                if (!resolve.ok) throw new Error("Top Rated Series is not loaded!");

                const data = await resolve.json();

                return data.results;

            } catch (e) {
                alert(`HATA: ${e}`)
            }
        },

        async trendingAllWeek() {
            try {
                // 'all' -> film ve dizileri karıştırır
                // 'week' -> haftalık trendi çeker
                const resolve = await fetch(`${DEFAULT_URL}/trending/all/week?api_key=${API_KEY}&${LANG}`);
                if (!resolve.ok) throw new Error("Trending All Week is not loaded!");
                const data = await resolve.json();
                return data.results; // Popüler listesini döndür
            } catch (e) {
                alert(`HATA: ${e}`);
            }
        },

        async heroSectionData() {
            try {
                // 'week' -> haftalık trendi çeker
                const resolve = await fetch(`${DEFAULT_URL}/trending/movie/week?api_key=${API_KEY}&${LANG}`);
                if (!resolve.ok) throw new Error("Trending Hero Movie is not loaded!");
                const data = await resolve.json();
                return data.results; // Popüler listesini döndür
            } catch (e) {
                alert(`HATA: ${e}`);
            }
        },

        async searchAll(query) {
            try {
                const encodedQuery = encodeURIComponent(query);

                const resolve = await fetch(`${DEFAULT_URL}/search/multi?api_key=${API_KEY}&query=${encodedQuery}&${LANG}`);
                if (!resolve.ok) throw new Error("Search results could not be loaded!");

                const data = await resolve.json();
                return data.results; // Arama sonuçlarını (film, dizi, kişi) döndür

            } catch (e) {
                alert(`HATA: ${e}`);
            }
        }
    }
}