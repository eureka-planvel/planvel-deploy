document.addEventListener('DOMContentLoaded', () => {
    const travelInfo = JSON.parse(localStorage.getItem('travelInfo'));

    if (!travelInfo) {
        alert('이전 스텝 정보를 먼저 입력하세요.');
        window.location.href = 'travel-select.html';
        return;
    }

    updateInfoPanel();

    const slider = document.getElementById('schedule-slider');
    const startDate = new Date(travelInfo.startDate);
    const endDate = new Date(travelInfo.endDate);

    const scheduleData = JSON.parse(localStorage.getItem('scheduleData')) || {};

    // Store API fetched spot data
    const spotCache = {
        FOOD: {},
        TOURIST: {},
        CAFE: {}
    };

    // Initialize with region ID from travel info (default to 1 if not available)
    const regionId = travelInfo.arrivalId || 1;

    const dayBoxes = [];
    let currentIndex = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];

        const dayBox = document.createElement('div');
        dayBox.className = 'day-box';

        const nav = document.createElement('div');
        nav.className = 'day-navigation';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'nav-btn';
        prevBtn.textContent = '＜';
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                showDay(currentIndex);
            }
        });

        const title = document.createElement('div');
        title.className = 'day-title';
        title.textContent = dateStr;

        const nextBtn = document.createElement('button');
        nextBtn.className = 'nav-btn';
        nextBtn.textContent = '＞';
        nextBtn.addEventListener('click', () => {
            if (currentIndex < dayBoxes.length - 1) {
                currentIndex++;
                showDay(currentIndex);
            }
        });

        nav.appendChild(prevBtn);
        nav.appendChild(title);
        nav.appendChild(nextBtn);

        const typeTab = document.createElement('div');
        typeTab.className = 'spot-type-tab';
        ['FOOD', 'TOURIST', 'CAFE'].forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'spot-type-btn';
            btn.dataset.type = type;
            btn.textContent = type === 'FOOD' ? '음식' : type === 'TOURIST' ? '관광지' : '카페';
            btn.addEventListener('click', () => {
                dayBox.querySelectorAll('.spot-type-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                fetchAndRenderSpotList(spotList, type, 1);
            });
            typeTab.appendChild(btn);
        });

        const spotList = document.createElement('div');
        spotList.className = 'spot-list';

        const scheduleList = document.createElement('ul');
        scheduleList.className = 'schedule-list';

        if (scheduleData[dateStr]) {
            scheduleData[dateStr].forEach(saved => {
                // Assume saved is now an object with necessary spot info
                addSpotToSchedule(scheduleList, saved);
            });
        }

        const scheduleWrapper = document.createElement('div');
        scheduleWrapper.className = 'schedule-wrapper';

        const scheduleHeader = document.createElement('div');
        scheduleHeader.className = 'schedule-header';

        const scheduleTitle = document.createElement('div');
        scheduleTitle.className = 'schedule-title';
        scheduleTitle.textContent = '오늘 일정';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = '저장하기';
        saveBtn.addEventListener('click', () => {
            const spots = Array.from(scheduleList.querySelectorAll('li')).map(li => {
                // Extract the spot data that was stored in dataset
                return JSON.parse(li.dataset.spot);
            });
            scheduleData[dateStr] = spots;
            localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
            updateScheduleSummary();
            alert(`${dateStr} 일정이 저장되었습니다.`);
        });

        scheduleHeader.appendChild(scheduleTitle);
        scheduleHeader.appendChild(saveBtn);

        scheduleWrapper.appendChild(scheduleHeader);
        scheduleWrapper.appendChild(scheduleList);

        dayBox.appendChild(nav);
        dayBox.appendChild(scheduleWrapper);
        dayBox.appendChild(typeTab);
        dayBox.appendChild(spotList);

        dayBoxes.push({ dayBox, spotList, scheduleList });
    }

    function showDay(index) {
        slider.innerHTML = '';
        slider.appendChild(dayBoxes[index].dayBox);
        fetchAndRenderSpotList(dayBoxes[index].spotList, 'FOOD', 1);
        dayBoxes[index].dayBox.querySelector('[data-type="FOOD"]').classList.add('selected');
    }

    // Fetch spots from API and render them
    async function fetchAndRenderSpotList(container, type, page) {
        container.innerHTML = '';
        
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.textContent = '로딩 중...';
        container.appendChild(loadingIndicator);
        
        try {
            // Check if we already have this data cached
            if (!spotCache[type][page]) {
                // Fetch from API
                const response = await fetch(`/api/spot/region/${regionId}?type=${type}&page=${page}`);
                const result = await response.json();
                
                if (result.success) {
                    spotCache[type][page] = result.data;
                } else {
                    throw new Error(result.msg || '데이터를 불러올 수 없습니다.');
                }
            }
            
            // Get spots data from cache
            const spots = spotCache[type][page];
            renderSpotList(container, spots, type, page);
        } catch (error) {
            console.error('Error fetching spots:', error);
            container.innerHTML = `<div>데이터를 불러오는데 실패했습니다: ${error.message}</div>`;
        }
    }

    function renderSpotList(container, spots, type, currentPage) {
        container.innerHTML = '';

        const spotsPerPage = 9;
        const spotGrid = document.createElement('div');
        spotGrid.className = 'spot-grid';

        const navWrapper = document.createElement('div');
        navWrapper.className = 'spot-page-nav';

        // Render spots in the grid
        spots.forEach(spot => {
            const card = document.createElement('div');
            card.className = 'spot-card';

            const imgContainer = document.createElement('div');
            imgContainer.className = 'spot-image';
            imgContainer.style.backgroundImage = `url(${spot.thumbnailUrl})`;

            const spotName = document.createElement('div');
            spotName.className = 'spot-name';
            spotName.textContent = spot.spotName;

            card.appendChild(imgContainer);
            card.appendChild(spotName);

            card.addEventListener('click', () => {
                fetchSpotDetail(spot.id).then(spotDetail => {
                    if (spotDetail) {
                        const scheduleList = container.closest('.day-box').querySelector('.schedule-list');
                        addSpotToSchedule(scheduleList, spotDetail);
                    }
                });
            });

            spotGrid.appendChild(card);
        });

        // Navigation buttons
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '＜';
        prevBtn.className = 'nav-btn';
        prevBtn.disabled = currentPage <= 1;
        prevBtn.addEventListener('click', () => {
            fetchAndRenderSpotList(container, type, currentPage - 1);
        });
        
        const pageIndicator = document.createElement('span');
        pageIndicator.textContent = `${currentPage}`;
        pageIndicator.style.margin = '0 10px';
        
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '＞';
        nextBtn.className = 'nav-btn';
        // Disable next button if we have fewer spots than maximum per page
        nextBtn.disabled = spots.length < spotsPerPage;
        nextBtn.addEventListener('click', () => {
            fetchAndRenderSpotList(container, type, currentPage + 1);
        });
        
        navWrapper.appendChild(prevBtn);
        navWrapper.appendChild(pageIndicator);
        navWrapper.appendChild(nextBtn);

        container.appendChild(spotGrid);
        container.appendChild(navWrapper);
    }

    // Fetch spot details from API
    async function fetchSpotDetail(spotId) {
        try {
            const response = await fetch(`/api/spot/${spotId}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.msg || '상세 정보를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Error fetching spot detail:', error);
            alert(`상세 정보를 불러오는데 실패했습니다: ${error.message}`);
            return null;
        }
    }

    function addSpotToSchedule(scheduleList, spot) {
        const li = document.createElement('li');
        // Store complete spot data as JSON in dataset
        li.dataset.spot = JSON.stringify(spot);
        li.draggable = true;

        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '≡';

        const text = document.createElement('span');
        text.textContent = `(${spot.type === 'FOOD' ? '음식' : spot.type === 'TOURIST' ? '관광지' : '카페'}) ${spot.spotName}`;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.className = 'remove-btn';
        removeBtn.addEventListener('click', () => {
            li.remove();
        });

        li.appendChild(dragHandle);
        li.appendChild(text);
        li.appendChild(removeBtn);

        li.addEventListener('dragstart', (e) => {
            li.classList.add('dragging');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
        });

        scheduleList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(scheduleList, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (!dragging) return;
            if (afterElement == null) {
                scheduleList.appendChild(dragging);
            } else {
                scheduleList.insertBefore(dragging, afterElement);
            }
        });

        scheduleList.appendChild(li);
    }

    function updateScheduleSummary() {
        let summary = document.getElementById('schedule-summary');
        if (!summary) {
            summary = document.createElement('div');
            summary.id = 'schedule-summary';
            summary.className = 'schedule-summary';
            document.querySelector('.info-panel .info-card').appendChild(summary);
        }

        summary.innerHTML = '<div class="summary-title"><b>일정 요약</b></div>';

        const table = document.createElement('table');
        table.className = 'summary-table';

        Object.keys(scheduleData).sort().forEach(date => {
            const row = document.createElement('tr');

            const dateCell = document.createElement('td');
            dateCell.className = 'summary-date';
            dateCell.textContent = date;

            const spotsCell = document.createElement('td');
            spotsCell.className = 'summary-spots';
            
            if (scheduleData[date].length) {
                // Get names from spot objects
                const spotNames = scheduleData[date].map(spot => spot.spotName);
                spotsCell.textContent = spotNames.join(' → ');
            } else {
                spotsCell.textContent = '-';
            }

            row.appendChild(dateCell);
            row.appendChild(spotsCell);
            table.appendChild(row);
        });

        summary.appendChild(table);
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    showDay(currentIndex);
    updateScheduleSummary();

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${year}.${month}.${day}`;
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