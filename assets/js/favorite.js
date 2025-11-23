export default function favorite () {
    let storedDataString = localStorage.getItem("favorite");
    let favoriteCollect;
    if (storedDataString) {
        favoriteCollect = JSON.parse(storedDataString);
    }
    else {
        favoriteCollect = []
    }
    return {
        set(setID, setType, element, mediaName) {
            const favoriteButton = element;
            let index = 0;
            const isHas = favoriteCollect.findIndex(item => {
                index++
                return item.id === setID && item.type === setType
            })

            if(isHas !== -1) {
                favoriteCollect.splice(index-1, 1)
                localStorage.setItem("favorite", JSON.stringify(favoriteCollect))
                if (favoriteButton !== "") favoriteButton.setAttribute("name", "heart-outline");
                console.log(`ID: ${setID}, Type: ${setType} - Favorisi kaldırıldı.`);
                showToast(`${mediaName} - Favorilerden kaldırıldı.`, false)
            } else {
                favoriteCollect.push({id: setID, type: setType})
                localStorage.setItem("favorite", JSON.stringify(favoriteCollect));
                if (favoriteButton !== "") favoriteButton.setAttribute("name", "heart");
                console.log(`ID: ${setID}, Type: ${setType} - Favorilere eklendi..`);
                showToast(`${mediaName} - Favorilere eklendi.`, true)
            }
        },

        getAll() {
            return favoriteCollect;
        },

        get(searchId, searchType, element) {
            const favoriteButton = element;
            let index = 0;
            const isHas = favoriteCollect.findIndex(item => {
                index++
                return item.id === searchId && item.type === searchType;
            })

            if (isHas !== -1) {
                favoriteButton ? favoriteButton.setAttribute("name", "heart") : "";
                return `ID: ${favoriteCollect[index-1].id}, TYPE: ${favoriteCollect[index-1].type}`;

            } else {
                favoriteButton ? favoriteButton.setAttribute("name", "heart-outline") : "";
                return false;
            }
        }
    }
}

function showToast(message, isAdded) {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');

    if (!toast || !toastMessage) return; // Elemanlar yoksa işlemi durdur

    // 1. Metni ayarla
    toastMessage.textContent = message;

    // 2. Renkleri ayarla (Geri bildirim için)
    if (isAdded) {
        // Favorilere eklendi: Başarılı rengi (Örn: Yeşil)
        toast.style.backgroundColor = 'var(--color-success, #34a853)';
        toast.querySelector('ion-icon').name = 'checkmark-circle';
    } else {
        // Favorilerden kaldırıldı: Dikkat rengi (Örn: Kırmızı/Gri)
        toast.style.backgroundColor = 'var(--color-danger, #e53935)';
        toast.querySelector('ion-icon').name = 'heart-dislike';
    }

    // 3. Bildirimi görünür yap
    toast.classList.add('toast-visible');

    // 4. 2.5 saniye (2500ms) sonra gizle
    setTimeout(() => {
        toast.classList.remove('toast-visible');
    }, 2500);
}
