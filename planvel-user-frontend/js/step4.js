document.addEventListener('DOMContentLoaded', () => {
    const travelInfo = JSON.parse(localStorage.getItem('travelInfo'));

    if (!travelInfo) {
        alert('이전 스텝 정보를 먼저 입력하세요.');
        window.location.href = 'travel-select.html';
        return;
    }

    document.getElementById('departure-display').textContent = travelInfo.departure || '-';
    document.getElementById('arrival-display').textContent = travelInfo.arrival || '-';
    document.getElementById('date-display').textContent = `${travelInfo.startDate || '-'} ~ ${travelInfo.endDate || '-'}`;
    document.getElementById('transport-display').textContent = travelInfo.transport || '-';
    document.getElementById('accommodation-display').textContent = travelInfo.accommodation || '-';

    const slider = document.getElementById('schedule-slider');
    const startDate = new Date(travelInfo.startDate);
    const endDate = new Date(travelInfo.endDate);

    const scheduleData = JSON.parse(localStorage.getItem('scheduleData')) || {};

    const spotData = {
        FOOD: ["김밥천국", "맛집1", "맛집2"],
        TOURIST: ["광안리", "해운대", "부산타워"],
        CAFE: ["스타벅스", "커피빈", "로컬카페"]
    };

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
                renderSpotList(spotList, type);
            });
            typeTab.appendChild(btn);
        });

        const spotList = document.createElement('div');
        spotList.className = 'spot-list';

        const scheduleList = document.createElement('ul');
        scheduleList.className = 'schedule-list';

        // 기존 데이터 복원
        if (scheduleData[dateStr]) {
            scheduleData[dateStr].forEach(saved => {
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
            const spots = Array.from(scheduleList.querySelectorAll('li')).map(li => li.dataset.spot);
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
        dayBox.appendChild(scheduleWrapper);  // ⬅ 여기서 리스트랑 저장 버튼을 같이 포함
        dayBox.appendChild(typeTab);
        dayBox.appendChild(spotList);

        dayBoxes.push({ dayBox, spotList, scheduleList });
    }

    function showDay(index) {
        slider.innerHTML = '';
        slider.appendChild(dayBoxes[index].dayBox);
        // 초기 FOOD 렌더링
        renderSpotList(dayBoxes[index].spotList, 'FOOD');
        dayBoxes[index].dayBox.querySelector('[data-type="FOOD"]').classList.add('selected');
    }

    function renderSpotList(container, type) {
        container.innerHTML = '';

        const spots = spotData[type];
        let currentPage = 0;
        const spotsPerPage = 9;

        const spotGrid = document.createElement('div');
        spotGrid.className = 'spot-grid';

        const navWrapper = document.createElement('div');
        navWrapper.className = 'spot-page-nav';

        function renderPage(page) {
            spotGrid.innerHTML = '';
            const start = page * spotsPerPage;
            const end = start + spotsPerPage;
            const pageSpots = spots.slice(start, end);

        pageSpots.forEach(spot => {
            const card = document.createElement('div');
            card.className = 'spot-card';
            card.textContent = spot;
            // ✅ 여기 수정!
            card.addEventListener('click', () => {
                const scheduleList = container.closest('.day-box').querySelector('.schedule-list');
                addSpotToSchedule(scheduleList, spot);
            });
            spotGrid.appendChild(card);
        });
        }

        function renderNav() {
            navWrapper.innerHTML = '';
            const totalPages = Math.ceil(spots.length / spotsPerPage);

            if (currentPage > 0) {
                const prev = document.createElement('button');
                prev.textContent = '＜';
                prev.addEventListener('click', () => {
                    currentPage--;
                    renderPage(currentPage);
                    renderNav();
                });
                navWrapper.appendChild(prev);
            }

            if (currentPage < totalPages - 1) {
                const next = document.createElement('button');
                next.textContent = '＞';
                next.addEventListener('click', () => {
                    currentPage++;
                    renderPage(currentPage);
                    renderNav();
                });
                navWrapper.appendChild(next);
            }
        }

        container.appendChild(spotGrid);
        container.appendChild(navWrapper);
        renderPage(currentPage);
        renderNav();
    }

    function getSpotType(spot) {
    if (spotData.FOOD.includes(spot)) return 'FOOD';
    if (spotData.TOURIST.includes(spot)) return 'TOURIST';
    if (spotData.CAFE.includes(spot)) return 'CAFE';
    return 'UNKNOWN';
}

    function addSpotToSchedule(scheduleList, spot) {
        const type = getSpotType(spot);
        const li = document.createElement('li');
        li.dataset.spot = spot;
        li.draggable = true;

        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '≡';

        const text = document.createElement('span');
        text.textContent = `(${type === 'FOOD' ? '음식' : type === 'TOURIST' ? '관광지' : '카페'}) ${spot}`;

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
            spotsCell.textContent = scheduleData[date].length ? scheduleData[date].join(' → ') : '-';

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
});