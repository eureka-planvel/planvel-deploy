document.addEventListener('DOMContentLoaded', () => {
    const travelInfo = JSON.parse(localStorage.getItem('travelInfo'));
    if (!travelInfo) {
        alert('여행 정보를 먼저 입력해주세요.');
        window.location.href = 'transport-select.html';
        return;
    }

    updateInfoPanel();

    const accommodationList = document.getElementById('accommodation-list');
    const hotelFilterBtn = document.getElementById('hotelFilterBtn');
    const nextButton = document.querySelector('.next');

    let page = 0;
    const size = 3;
    let lastPageReached = false;
    let isHotelOnly = false;

    const regionId = travelInfo.arrivalId;

    loadAccommodations();

    hotelFilterBtn.addEventListener('click', () => {
        isHotelOnly = !isHotelOnly;
        hotelFilterBtn.classList.toggle('active', isHotelOnly);
        page = 0;
        lastPageReached = false;
        accommodationList.innerHTML = '';
        loadAccommodations();
    });

    function loadAccommodations() {
        if (lastPageReached) return;

        fetch(`/api/accommodation/region/${regionId}?page=${page}&size=${size}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && data.data.content) {
                    const content = data.data.content;
                    if (content.length === 0 && page === 0) {
                        accommodationList.innerHTML = '<div>숙소가 없습니다.</div>';
                        lastPageReached = true;
                        return;
                    }

                    renderAccommodationCards(content);

                    if (data.data.last) {
                        lastPageReached = true;
                        removeLoadMoreButton();
                    } else {
                        addLoadMoreButton();
                    }

                    page += 1;
                } else {
                    alert('숙소 목록을 불러오는데 실패했습니다.');
                }
            })
            .catch(err => {
                console.error(err);
                alert('숙소 목록을 불러오는데 실패했습니다.');
            });
    }

    function renderAccommodationCards(list) {
        list.forEach(acc => {
            if (isHotelOnly && !acc.hotel) return;

            const card = document.createElement('div');
            card.className = 'accommodation-card';
            card.dataset.id = acc.id;
            card.innerHTML = `
                <img src="${acc.thumbnailUrl}" alt="${acc.name}" style="width: 100%; height: 70%; object-fit: cover;">
                <div style="padding: 8px;">${acc.name} <span style="font-size: 12px; color: #888;">(${acc.hotel ? '호텔' : '기타'})</span></div>
            `;

            card.addEventListener('click', () => selectAccommodation(acc));

            accommodationList.appendChild(card);
        });
    }

    function selectAccommodation(accSummary) {
        fetch(`/api/accommodation/${accSummary.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const acc = data.data;
                    travelInfo.accommodation = {
                        id: acc.id,
                        name: acc.name,
                        address: acc.address,
                        pricePerNight: acc.pricePerNight,
                        isHotel: acc.hotel,
                        imageUrl: acc.imageUrl,
                        thumbnailUrl: acc.thumbnailUrl
                    };
                    localStorage.setItem('travelInfo', JSON.stringify(travelInfo));

                    document.querySelectorAll('.accommodation-card').forEach(card => {
                        if (parseInt(card.dataset.id) === acc.id) {
                            card.classList.add('selected');
                        } else {
                            card.classList.remove('selected');
                        }
                    });

                    showModal(acc);
                } else {
                    alert('숙소 상세 조회 실패');
                }
            })
            .catch(err => {
                console.error(err);
                alert('숙소 상세 조회 실패');
            });
    }

    function showModal(acc) {
        let modal = document.getElementById('accommodation-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'accommodation-modal';
            modal.className = 'accommodation-modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <img src="${acc.imageUrl}" alt="${acc.name}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;">
                <h2>${acc.name}</h2>
                <p>${acc.address}</p>
                <p>가격: ${acc.pricePerNight}</p>
                <p>숙소 타입: ${acc.hotel ? '호텔' : '기타 숙소'}</p>
            </div>
        `;
        modal.classList.add('show');

        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    nextButton.addEventListener('click', (e) => {
        e.preventDefault();

        if (!travelInfo.accommodation || !travelInfo.accommodation.id) {
            alert('숙소를 선택해주세요.');
            return;
        }

        window.location.href = 'spot-select.html';
    });

    function addLoadMoreButton() {
        removeLoadMoreButton();

        const btn = document.createElement('button');
        btn.id = 'loadMoreBtn';
        btn.textContent = '더보기';
        btn.className = 'load-more-btn';
        btn.addEventListener('click', loadAccommodations);

        accommodationList.appendChild(btn);
    }

    function removeLoadMoreButton() {
        const btn = document.getElementById('loadMoreBtn');
        if (btn) btn.remove();
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    }

    function updateInfoPanel() {
        const travelInfo = JSON.parse(localStorage.getItem('travelInfo'));
        if (!travelInfo) return;

        const departureStation = travelInfo.departureStation?.name || '-';
        const arrivalStation = travelInfo.arrivalStation?.name || '-';
        const departureSchedule = travelInfo.departureSchedule
            ? `${travelInfo.departureSchedule.departureTime.substring(0, 5)} (${travelInfo.departureSchedule.transportNumber})`
            : '-';
        const returnSchedule = travelInfo.returnSchedule
            ? `${travelInfo.returnSchedule.departureTime.substring(0, 5)} (${travelInfo.returnSchedule.transportNumber})`
            : '-';

        const accommodationText = travelInfo.accommodation
            ? `${travelInfo.accommodation.name} (${travelInfo.accommodation.isHotel ? '호텔' : '기타'})`
            : '-';

        const infoCard = document.querySelector('.info-card');
        infoCard.innerHTML = `
            <div class="note-line"><span class="label">출발지</span><span class="value">${travelInfo.departureName || '-'}</span></div>
            <div class="note-line"><span class="label">도착지</span><span class="value">${travelInfo.arrivalName || '-'}</span></div>
            <div class="note-line"><span class="label">여행기간</span><span class="value">${formatDate(travelInfo.startDate)} ~ ${formatDate(travelInfo.endDate)}</span></div>
            <div class="note-line"><span class="label">이동수단</span><span class="value">${travelInfo.transport ?? '-'}</span></div>
            <div class="note-line"><span class="label">출발역</span><span class="value">${departureStation}</span></div>
            <div class="note-line"><span class="label">도착역</span><span class="value">${arrivalStation}</span></div>
            <div class="note-line"><span class="label">가는편</span><span class="value">${departureSchedule}</span></div>
            <div class="note-line"><span class="label">오는편</span><span class="value">${returnSchedule}</span></div>
            <div class="note-line"><span class="label">숙소</span><span class="value">${accommodationText}</span></div>
        `;
    }
});