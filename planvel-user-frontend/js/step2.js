document.addEventListener('DOMContentLoaded', () => {
    const travelInfo = JSON.parse(localStorage.getItem('travelInfo'));

    if (travelInfo) {
        document.getElementById('departure-display').textContent = travelInfo.departure || '출발지';
        document.getElementById('arrival-display').textContent = travelInfo.arrival || '도착지';
        document.getElementById('date-display').textContent = `${travelInfo.startDate || '-'} ~ ${travelInfo.endDate || '-'}`;

        // ✅ 기존 선택 복원 (초기선택 없음 보장)
        document.getElementById('busBtn').classList.remove('selected');
        document.getElementById('trainBtn').classList.remove('selected');
        
        if (travelInfo.transport === '버스') {
            document.getElementById('busBtn').classList.add('selected');
        } else if (travelInfo.transport === '기차') {
            document.getElementById('trainBtn').classList.add('selected');
        }
    } else {
        showAlert('이전 스텝 정보를 먼저 입력하세요.');
        setTimeout(() => {
            window.location.href = 'travel-select.html';
        }, 1500);
    }

    const busBtn = document.getElementById('busBtn');
    const trainBtn = document.getElementById('trainBtn');

    // ✅ 버튼 클릭 시 저장 X → 선택만 처리
    busBtn.addEventListener('click', () => {
        busBtn.classList.add('selected');
        trainBtn.classList.remove('selected');
    });

    trainBtn.addEventListener('click', () => {
        trainBtn.classList.add('selected');
        busBtn.classList.remove('selected');
    });

    // ✅ '다음' 버튼 클릭 시 선택된 것만 저장
    document.querySelector('.next').addEventListener('click', function (e) {
        e.preventDefault();

        let selectedTransport = null;
        if (busBtn.classList.contains('selected')) {
            selectedTransport = '버스';
        } else if (trainBtn.classList.contains('selected')) {
            selectedTransport = '기차';
        }

        if (!selectedTransport) {
            showAlert('이동수단을 선택해주세요.');
            return;
        }

        // 선택 시점에서만 저장
        const updatedTravelInfo = JSON.parse(localStorage.getItem('travelInfo')) || {};
        updatedTravelInfo.transport = selectedTransport;
        localStorage.setItem('travelInfo', JSON.stringify(updatedTravelInfo));

        window.location.href = 'accommodation-select.html';
    });

    // ✅ 공통 alert
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
});