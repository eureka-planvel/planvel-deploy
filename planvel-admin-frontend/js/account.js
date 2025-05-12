// account.js - 계정 관리 기능
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkAuth().then(adminData => {
        if (adminData) {
            // 관리자 정보 표시
            document.getElementById('admin-name').textContent = adminData.name;
            displayAccountInfo(adminData);
        }
    });
});

// 계정 정보 표시 함수
function displayAccountInfo(adminData) {
    document.getElementById('info-username').textContent = adminData.username || '';
    document.getElementById('info-name').textContent = adminData.name || '';
}