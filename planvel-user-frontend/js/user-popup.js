document.addEventListener('DOMContentLoaded', function() {
    const userInfo = document.querySelector('.user-info');
    const popupMenu = document.getElementById('popupMenu');

    userInfo.addEventListener('click', function (e) {
        popupMenu.style.display = popupMenu.style.display === 'block' ? 'none' : 'block';
        e.stopPropagation(); // 다른 클릭 전파 막기
    });

    document.addEventListener('click', function () {
        popupMenu.style.display = 'none';
    });
});