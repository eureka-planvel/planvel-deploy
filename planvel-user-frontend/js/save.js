document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save-plan-btn');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
        const travelInfo = JSON.parse(localStorage.getItem('travelInfo'));
        const scheduleData = JSON.parse(localStorage.getItem('scheduleData'));

        if (!travelInfo || !scheduleData) {
            alert('저장할 데이터가 없습니다.');
            return;
        }

        const requestData = {
            travelInfo,
            scheduleData
        };

        try {
            const response = await fetch('/api/plan/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                alert('저장 성공! 🎉');
                // ✅ 저장 성공 시 로컬스토리지 초기화
                localStorage.removeItem('travelInfo');
                localStorage.removeItem('scheduleData');
                window.location.href = 'my-travels.html';
            } else {
                alert('저장 실패... 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('저장 중 오류 발생:', error);
            alert('서버와 연결할 수 없습니다.');
        }
    });
});