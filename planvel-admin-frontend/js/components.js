document.addEventListener('DOMContentLoaded', function() {
    loadSidebar();
});

function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    fetchAPI(API.ME)
        .then(data => {
            if (!data || !data.success) {
                window.location.href = '/index.html';
                return;
            }

            const adminData = data.data;
            const currentPath = window.location.pathname;
            let activePage = '';

            if (currentPath.includes('dashboard')) {
                activePage = 'dashboard';
            } else if (currentPath.includes('transport')) {
                activePage = 'transport';
            } else if (currentPath.includes('accommodation-register')) {
                activePage = 'accommodation-register';
            } else if (currentPath.includes('accommodation-list')) {
                activePage = 'accommodation-list';
            } else if (currentPath.includes('account')) {
                activePage = 'account';
            } else if (currentPath.includes('spot-register')) {
                activePage = 'spot-register';
            } else if (currentPath.includes('spot-list')) {
                activePage = 'spot-list';
            }

            const sidebarHTML = `
                <div class="sidebar">
                    <div class="logo">PLANVEL 관리자</div>
                    <nav class="nav-menu">
                        <ul>
                            <li><a href="/dashboard.html" data-page="dashboard" class="${activePage === 'dashboard' ? 'active' : ''}">대시보드</a></li>
                            <li><a href="/transport.html" data-page="transport" class="${activePage === 'transport' ? 'active' : ''}">운송 관리</a></li>
                            <li><a href="/accommodation-register.html" data-page="accommodation-register" class="${activePage === 'accommodation-register' ? 'active' : ''}">숙소 등록</a></li>
                            <li><a href="/accommodation-list.html" data-page="accommodation-list" class="${activePage === 'accommodation-list' ? 'active' : ''}">숙소 조회</a></li>
                            <li><a href="/spot-register.html" data-page="spot-register" class="${activePage === 'spot-register' ? 'active' : ''}">스팟 등록</a></li>
                            <li><a href="/spot-list.html" data-page="spot-list" class="${activePage === 'spot-list' ? 'active' : ''}">스팟 조회</a></li>
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
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
        });
}

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