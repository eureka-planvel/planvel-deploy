document.addEventListener('DOMContentLoaded', () => {
    const travelInfo = JSON.parse(localStorage.getItem('travelInfo'));
    const scheduleData = JSON.parse(localStorage.getItem('scheduleData'));

    if (!travelInfo) {
        alert('여정 정보가 없습니다. 처음부터 다시 진행해주세요.');
        window.location.href = 'travel-select.html';
        return;
    }

    // 출발역, 도착역
    const departureStation = travelInfo.departureStation?.name || '-';
    const arrivalStation = travelInfo.arrivalStation?.name || '-';

    // 가는편, 오는편 시간표
    const departureSchedule = travelInfo.departureSchedule
        ? `${travelInfo.departureSchedule.departureTime.substring(0, 5)} (${travelInfo.departureSchedule.transportNumber})`
        : '-';
    const returnSchedule = travelInfo.returnSchedule
        ? `${travelInfo.returnSchedule.departureTime.substring(0, 5)} (${travelInfo.returnSchedule.transportNumber})`
        : '-';

    // 숙소 이름 + 타입
    const accommodationText = travelInfo.accommodation
        ? `${travelInfo.accommodation.name} (${travelInfo.accommodation.isHotel ? '호텔' : '기타'})`
        : '-';

    // 출발지, 도착지, 기간, 교통수단 등
    document.getElementById('departure-display').textContent = travelInfo.departureName || '-';
    document.getElementById('arrival-display').textContent = travelInfo.arrivalName || '-';
    document.getElementById('date-display').textContent = `${travelInfo.startDate || '-'} ~ ${travelInfo.endDate || '-'}`;
    document.getElementById('transport-display').textContent = travelInfo.transport || '-';
    document.getElementById('accommodation-display').textContent = accommodationText;

    updateScheduleSummary(scheduleData);
});

function updateScheduleSummary(scheduleData) {
    const summary = document.getElementById('schedule-summary');
    summary.innerHTML = '';

    if (!scheduleData || Object.keys(scheduleData).length === 0) {
        summary.innerHTML = '<div>등록된 일정이 없습니다.</div>';
        return;
    }

    Object.keys(scheduleData).sort().forEach(date => {
        const line = document.createElement('div');
        const spots = scheduleData[date].length
            ? scheduleData[date].map(spot => spot.spotName).join(' → ')
            : '-';
        line.innerHTML = `<b>${date}</b> ${spots}`;
        summary.appendChild(line);
    });
}