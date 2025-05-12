// dashboard.js - 대시보드 기능
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkAuth().then(adminData => {
        if (adminData) {
            // 관리자 정보 표시
            document.getElementById('admin-name').textContent = adminData.name;
            
            // 대시보드 데이터 로드
            loadDashboardData();
        }
    });
});

// dashboard.js 수정
async function loadDashboardData() {
    // 시간표 개수 조회 (검색 파라미터 추가)
    fetchAPI(`${API.TIMETABLES}/search`)
        .then(data => {
            if (data && data.success) {
                document.getElementById('timetable-count').textContent = data.data.length || 0;
            }
        });
    
    // 역/터미널 개수 조회 (모든 타입 조회)
    fetchAPI(`${API.STATIONS}?type=`)
        .then(data => {
            if (data && data.success) {
                document.getElementById('station-count').textContent = data.data.length || 0;
            }
        });
}