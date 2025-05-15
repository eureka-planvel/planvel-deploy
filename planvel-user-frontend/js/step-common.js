export function saveToStorage(data) {
    localStorage.setItem('planvel-data', JSON.stringify(data));
}

export function getFromStorage() {
    const data = localStorage.getItem('planvel-data');
    return data ? JSON.parse(data) : {};
}