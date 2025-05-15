document.addEventListener('DOMContentLoaded', () => {
    const travelInfo = JSON.parse(localStorage.getItem('travelInfo'));
    const scheduleData = JSON.parse(localStorage.getItem('scheduleData'));

    if (!travelInfo) {
        alert('여정 정보가 없습니다. 처음부터 다시 진행해주세요.');
        window.location.href = 'travel-select.html';
        return;
    }

    document.getElementById('departure-display').textContent = travelInfo.departure || '-';
    document.getElementById('arrival-display').textContent = travelInfo.arrival || '-';
    document.getElementById('date-display').textContent = `${travelInfo.startDate || '-'} ~ ${travelInfo.endDate || '-'}`;
    document.getElementById('transport-display').textContent = travelInfo.transport || '-';
    document.getElementById('accommodation-display').textContent = travelInfo.accommodation || '-';

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
        const spots = scheduleData[date].length ? scheduleData[date].join(' → ') : '-';
        line.innerHTML = `<b>${date}</b> ${spots}`;
        summary.appendChild(line);
    });
}