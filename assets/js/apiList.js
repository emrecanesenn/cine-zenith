import {API_KEY, DEFAULT_URL, LANG} from "./apiSettings.js";

export default async function apiList() {
    return {
        /**
         * LANGUAGES CHOICE
         */

        async language() {
            try {
                const resolve = await fetch("assets/lang/en_EN.json")
                if (!resolve.ok) throw new Error("Language Files is not loading");
                const language = await resolve.json()
                return language;

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