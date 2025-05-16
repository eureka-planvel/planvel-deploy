document.addEventListener('DOMContentLoaded', async () => {
    const travelListContainer = document.querySelector('.main-content');
    const emptyMsg = document.querySelector('.empty-msg');

    try {
        const response = await fetch('/api/plan/my-travels');
        if (!response.ok) throw new Error('서버 오류');

        const result = await response.json();
        const travels = result.data || [];

        if (travels.length === 0) {
            emptyMsg.style.display = 'block';
        } else {
            emptyMsg.style.display = 'none';

            // 타이틀 추가
            const title = document.createElement('h1');
            title.className = 'section-title';
            title.textContent = '내 여행';
            travelListContainer.insertBefore(title, emptyMsg);

            travels.forEach(travel => {
                const card = document.createElement('div');
                card.className = 'travel-card';
                card.innerHTML = `
                    <div class="travel-title">${travel.title}</div>
                    <div class="travel-actions">
                        <button onclick="location.href='/plan/${travel.code}'">상세 보기</button>
                        <button onclick="copyShareLink('${travel.code}')">공유</button>
                    </div>
                `;
                travelListContainer.appendChild(card);
            });
        }
    } catch (error) {
        console.error('여행 조회 실패:', error);
        alert('여행 목록을 불러오지 못했습니다.');
    }
});

// 공유 링크 복사 함수
function copyShareLink(code) {
    const url = `${window.location.origin}/plan/${code}`;
    navigator.clipboard.writeText(url)
        .then(() => alert('공유 링크가 복사되었습니다!'))
        .catch(() => alert('복사 실패...'));
}

/**
 *                   <div class="travel-route">${travel.departureName} → ${travel.arrivalName}</div>
                    <div class="travel-date">${travel.startDate} ~ ${travel.endDate}</div>
 */