// components.js - 재사용 컴포넌트
document.addEventListener('DOMContentLoaded', function() {
    // 사이드바 로드
    loadSidebar();
});

// 사이드바 로드 함수
function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (!sidebarContainer) return;
    
    // 사용자 정보 가져오기
    fetchAPI(API.ME)
        .then(data => {
            if (!data || !data.success) {
                window.location.href = '/index.html';
                return;
            }
            
            const adminData = data.data;
            
            // 현재 페이지 경로 확인
            const currentPath = window.location.pathname;
            let activePage = '';
            
            if (currentPath.includes('dashboard')) {
                activePage = 'dashboard';
            } else if (currentPath.includes('transport')) {
                activePage = 'transport';
            } else if (currentPath.includes('account')) {
                activePage = 'account';
            }
            
            // 사이드바 HTML 생성
            const sidebarHTML = `
                <div class="sidebar">
                    <div class="logo">PLANVEL 관리자</div>
                    <nav class="nav-menu">
                        <ul>
                            <li><a href="/dashboard.html" data-page="dashboard" class="${activePage === 'dashboard' ? 'active' : ''}">대시보드</a></li>
                            <li><a href="/transport.html" data-page="transport" class="${activePage === 'transport' ? 'active' : ''}">운송 관리</a></li>
                            <li><a href="/account.html" data-page="account" class="${activePage === 'account' ? 'active' : ''}">계정 관리</a></li>
                        </ul>
                    </nav>
                    <div class="user-info">
                        <span id="admin-name">${adminData.name || '관리자'}</span>
                        <button id="logout-btn">로그아웃</button>
                    </div>
                </div>
            `;
            
            sidebarContainer.innerHTML = sidebarHTML;
            
            // 로그아웃 버튼 이벤트 등록
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
            
            // 네비게이션 이벤트 등록
            const navLinks = document.querySelectorAll('.nav-menu a');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    const page = this.getAttribute('data-page');
                    
                    // 같은 페이지인 경우 기본 동작 막기
                    if (page === activePage) {
                        e.preventDefault();
                        return;
                    }
                });
            });
        });
}

// 로그아웃 처리 함수
function handleLogout() {
    fetch(API.LOGOUT, {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('로그아웃 성공');
            window.location.href = '/index.html';
        } else {
            showToast(data.msg || '로그아웃 실패', true);
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        showToast('로그아웃 중 오류가 발생했습니다.', true);
    });
}