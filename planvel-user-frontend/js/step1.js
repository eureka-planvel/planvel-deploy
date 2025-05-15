document.addEventListener('DOMContentLoaded', function () {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const departureSelect = document.getElementById('departure-select');
    const arrivalSelect = document.getElementById('arrival-select');
    const nextButton = document.querySelector('.next');

    // 출발지 선택
    departureSelect.addEventListener('click', function () {
        const selected = prompt('출발지를 입력하세요', '서울');
        if (selected) departureSelect.textContent = selected;
    });

    // 도착지 선택
    arrivalSelect.addEventListener('click', function () {
        const selected = prompt('도착지를 입력하세요', '부산');
        if (selected) arrivalSelect.textContent = selected;
    });

    // ✅ 시작일 선택 시 종료일 제한 설정
    startDateInput.addEventListener('change', function () {
        const startDate = new Date(startDateInput.value);

        if (!startDateInput.value) return;

        // 최소 1박 2일 (다음 날)
        const minEndDate = new Date(startDate);
        minEndDate.setDate(minEndDate.getDate() + 1);
        endDateInput.min = minEndDate.toISOString().split('T')[0];

        // 최대 10박 11일 (10일 후)
        const maxEndDate = new Date(startDate);
        maxEndDate.setDate(maxEndDate.getDate() + 10);
        endDateInput.max = maxEndDate.toISOString().split('T')[0];

        // 기존 선택 초기화 (실수 방지)
        endDateInput.value = '';
    });

    // 다음 버튼 클릭
    nextButton.addEventListener('click', function (e) {
        e.preventDefault();

        const departure = departureSelect.textContent.trim();
        const arrival = arrivalSelect.textContent.trim();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!departure || !arrival || !startDate || !endDate || departure === '출발지 선택' || arrival === '도착지 선택') {
            showAlert('출발지, 도착지, 날짜를 모두 입력해주세요.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = (end - start) / (1000 * 60 * 60 * 24);

        if (start >= end) {
            showAlert('시작일은 종료일보다 빨라야 합니다.');
            return;
        }

        if (diffDays < 1) {
            showAlert('최소 1박 2일 이상 선택해주세요.');
            return;
        }

        if (diffDays > 10) {
            showAlert('최대 10박 11일 이내로 선택해주세요.');
            return;
        }

        const travelData = {
            startDate,
            endDate,
            departure,
            arrival
        };

        localStorage.setItem('travelInfo', JSON.stringify(travelData));
        window.location.href = 'transport-select.html';
    });

    // 공통 showAlert
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