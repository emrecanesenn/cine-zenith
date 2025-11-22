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
        set(setID, setType, element) {
            const favoriteButton = element;
            let index = 0;
            const isHas = favoriteCollect.findIndex(item => {
                index++
                return item.id === setID && item.type === setType
            })

            if(isHas !== -1) {
                favoriteCollect.splice(index-1, 1)
                localStorage.setItem("favorite", JSON.stringify(favoriteCollect))
                favoriteButton.setAttribute("name", "heart-outline")
                console.log(`ID: ${setID}, Type: ${setType} - Favorisi kaldırıldı.`);
            } else {
                favoriteCollect.push({id: setID, type: setType})
                localStorage.setItem("favorite", JSON.stringify(favoriteCollect));
                favoriteButton.setAttribute("name", "heart")
                console.log(`ID: ${setID}, Type: ${setType} - Favorilere eklendi..`);
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
                favoriteButton.setAttribute("name", "heart")
                return `ID: ${favoriteCollect[index-1].id}, TYPE: ${favoriteCollect[index-1].type}`;

            } else {
                favoriteButton.setAttribute("name", "heart-outline")
                return false;
            }
        }
    }
}

const favoriteSystem = favorite();
