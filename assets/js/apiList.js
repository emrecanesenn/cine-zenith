import {API_KEY, DEFAULT_URL} from "./apiSettings.js";

export default async function apiList() {
    return {
        async upcomingMovies() {
            try {

                const resolve = await fetch(`${DEFAULT_URL}/movie/now_playing?api_key=${API_KEY}`);
                if (!resolve.ok) throw new Error("now_playing Movies is not loaded!");

                const data = await resolve.json();

                return data.results;

            } catch (e) {
                alert(`HATA: ${e}`)
            }
        },

        async onTheAirSeries() {
            try {
                const resolve = await fetch(`${DEFAULT_URL}/tv/on_the_air?api_key=${API_KEY}`);
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

                const resolve = await fetch(`${DEFAULT_URL}/movie/top_rated?api_key=${API_KEY}`);
                if (!resolve.ok) throw new Error("Top Rated Movies is not loaded!");

                const data = await resolve.json();

                return data.results;

            } catch (e) {
                alert(`HATA: ${e}`)
            }
        },

        async topRatedSeries() {
            try {

                const resolve = await fetch(`${DEFAULT_URL}/tv/top_rated?api_key=${API_KEY}`);
                if (!resolve.ok) throw new Error("Top Rated Series is not loaded!");

                const data = await resolve.json();

                return data.results;

            } catch (e) {
                alert(`HATA: ${e}`)
            }
        }
    }
}