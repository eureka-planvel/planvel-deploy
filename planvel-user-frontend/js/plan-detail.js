document.addEventListener('DOMContentLoaded', async () => {
    const code = window.location.pathname.split('/').pop();

    try {
        const response = await fetch(`/api/plan/${code}`);
        if (!response.ok) throw new Error('서버 오류');

        const result = await response.json();
        const plan = result.data;

        // 기본 정보 바인딩
        document.getElementById('title').textContent = plan.title;
        document.getElementById('route').textContent = `${plan.departureName} → ${plan.arrivalName}`;
        document.getElementById('date').textContent = `${plan.startDate} ~ ${plan.endDate}`;
        document.getElementById('transport').textContent = `이동수단: ${plan.transport}`;
        document.getElementById('accommodation').textContent = `숙소: ${plan.accommodation}`;

        // 일정 바인딩
        const scheduleContainer = document.getElementById('schedule');
        plan.schedule.forEach(dayPlan => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-section';
            dayDiv.innerHTML = `<h3>${dayPlan.day}일차</h3>`;

            const spotList = document.createElement('div');
            spotList.className = 'spot-list';

            dayPlan.spots.forEach(spot => {
                const spotCard = document.createElement('div');
                spotCard.className = 'spot-card';
                spotCard.innerHTML = `
                    <img src="${spot.imageUrl}" alt="${spot.spotName}" class="spot-img">
                    <div class="spot-info">
                        <div class="spot-name">${spot.spotName}</div>
                        <div class="spot-region">${spot.regionName}</div>
                        <div class="spot-address">${spot.address}</div>
                    </div>
                `;
                spotList.appendChild(spotCard);
            });

            dayDiv.appendChild(spotList);
            scheduleContainer.appendChild(dayDiv);
        });

    } catch (error) {
        console.error('상세조회 실패', error);
        alert('여행 상세정보를 불러올 수 없습니다.');
    }
});