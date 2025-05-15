document.addEventListener('DOMContentLoaded', () => {
    const travelInfo = JSON.parse(localStorage.getItem('travelInfo'));

    if (travelInfo) {
        document.getElementById('departure-display').textContent = travelInfo.departure || '출발지';
        document.getElementById('arrival-display').textContent = travelInfo.arrival || '도착지';
        document.getElementById('date-display').textContent = `${travelInfo.startDate || '-'} ~ ${travelInfo.endDate || '-'}`;
        document.getElementById('transport-display').textContent = travelInfo.transport || '-';
    } else {
        showAlert('이전 스텝 정보를 먼저 입력하세요.');
        setTimeout(() => {
            window.location.href = 'travel-select.html';
        }, 1500);
    }

    const hotelFilterBtn = document.getElementById('hotelFilterBtn');
    const accommodationCards = document.querySelectorAll('.accommodation-card');
    const nextBtn = document.querySelector('.next');

    hotelFilterBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        const hotelOnly = this.classList.contains('active');
        accommodationCards.forEach(card => {
            card.style.display = (!hotelOnly || card.dataset.isHotel === 'true') ? 'flex' : 'none';
        });
    });

    // ✅ 숙소 카드 클릭 시 selected 토글
    accommodationCards.forEach(card => {
        card.addEventListener('click', () => {
            accommodationCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // ✅ '완료' 버튼 클릭 시 선택 검증
    nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const selectedCard = document.querySelector('.accommodation-card.selected');
        if (!selectedCard) {
            showAlert('숙소를 선택해주세요.');
            return;
        }

        // 선택된 숙소 id 등 저장 가능
        console.log('선택된 숙소:', selectedCard.textContent);

        // 다음 페이지 이동
        window.location.href = 'spot-select.html';
    });

    function showAlert(message) {
        let alertBanner = document.getElementById('alert-banner');
        if (!alertBanner) {
            alertBanner = document.createElement('div');
            alertBanner.id = 'alert-banner';
            alertBanner.className = 'alert-banner';
            document.body.appendChild(alertBanner);
        }
        alertBanner.textContent = message;
        alertBanner.classList.add('show');

        setTimeout(() => {
            alertBanner.classList.remove('show');
        }, 2000);
    }

    nextBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const selectedCard = document.querySelector('.accommodation-card.selected');
    if (!selectedCard) {
        showAlert('숙소를 선택해주세요.');
        return;
    }

    const updatedTravelInfo = JSON.parse(localStorage.getItem('travelInfo')) || {};
    updatedTravelInfo.accommodation = selectedCard.textContent.trim();
    localStorage.setItem('travelInfo', JSON.stringify(updatedTravelInfo));

    window.location.href = 'spot-select.html';
});
});