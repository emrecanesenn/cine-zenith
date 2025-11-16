// API-SETTINGS
export const API_KEY = 'ef118284aeb4d24b39c622a5c9132db9';
export const DEFAULT_URL = 'https://api.themoviedb.org/3';
export const IMG_DEFAULT_URL = 'https://image.tmdb.org/t/p/';

export const language = () => {
    // Eğer localStorage'da 'lang' yoksa 'tr_TR' varsayılanını kullanalım.
    const currentLang = localStorage.getItem("lang");
    return `language=${currentLang}`; // Başına '&' eklemek işinizi kolaylaştırır.
};