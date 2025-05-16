window.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인 및 UI 제어
    fetchAPI(API.PROFILE)
        .then(data => {
            if (data.success) {
                document.getElementById('auth-buttons').style.display = 'none';
                document.getElementById('user-info').style.display = 'flex';
                document.getElementById('username').innerText = `${data.data.name}님`;
                
                // 프로필 이미지 설정 (있는 경우에만)
                if (data.data.profileImg) {
                    document.querySelector('#user-info .profile-img').src = data.data.profileImg;
                }
            }
        })
        .catch(() => {
            // 로그인 안된 경우 그대로 버튼 유지
            document.getElementById('user-info').style.display = 'none';
            document.getElementById('auth-buttons').style.display = 'flex';
        });

    // 유저 팝업 메뉴 토글 - 수정된 버전
    const userInfo = document.getElementById('user-info');
    const popupMenu = document.getElementById('popupMenu');

    if (userInfo && popupMenu) {
        // 기존 이벤트 리스너 제거 (중복 방지)
        const oldClickHandler = userInfo.onclick;
        if (oldClickHandler) {
            userInfo.removeEventListener('click', oldClickHandler);
        }

        // 새 이벤트 리스너 추가
        userInfo.addEventListener('click', function (e) {
            e.stopPropagation(); // 이벤트 버블링 방지
            
            // 현재 상태 확인
            const isVisible = popupMenu.style.display === 'block';
            
            // 토글
            popupMenu.style.display = isVisible ? 'none' : 'block';
            
            console.log('팝업 메뉴 상태:', popupMenu.style.display);
        });

        // 문서 클릭 시 팝업 닫기
        document.addEventListener('click', function (e) {
            // 이미 팝업이 열려있고, 클릭된 요소가 팝업 내부가 아닌 경우에만 닫기
            if (popupMenu.style.display === 'block' && !popupMenu.contains(e.target)) {
                popupMenu.style.display = 'none';
            }
        });
    }

    // 로그아웃
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // 이벤트 버블링 방지
            
            fetchAPI(API.LOGOUT, { method: 'POST' })
                .then(data => {
                    if (data.success) {
                        alert('로그아웃 되었습니다.');
                        window.location.href = 'index.html';
                    } else {
                        alert(data.msg || '로그아웃 실패');
                    }
                })
                .catch(() => alert('로그아웃 중 오류 발생'));
        });
    }
});