window.addEventListener('DOMContentLoaded', function() {
    // ✅ 프로필 조회
    fetchAPI(API.PROFILE)
        .then(data => {
            if (data.success) {
                document.getElementById('profileImage').src = data.data.profileImg || '/images/noProfile.png';
                document.getElementById('name').placeholder = data.data.name;
            }
        })
        .catch((error) => {
            console.error('프로필 API 호출 오류:', error);
            alert('오류 발생');
        });

    // ✅ 프로필 이미지 클릭 시 input 열기
    const profileImage = document.getElementById('profileImage');
    if (profileImage) {
        profileImage.addEventListener('click', function() {
            document.getElementById('profileInput').click();
        });
    }

    // ✅ 프로필 이미지 변경
    document.getElementById('profileInput').addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;

        console.log('파일 정보:', file.name, file.type, file.size);

        const formData = new FormData();
        formData.append('profileImage', file);

        fetch('/api/user/profile/image', {
            method: 'PUT',
            body: formData,
            credentials: 'include'
        })
        .then(res => {
            console.log('서버 응답 상태:', res.status);
            return res.json().catch(e => {
                console.error('JSON 파싱 오류:', e);
                return { success: false, msg: '서버 응답 처리 오류' };
            });
        })
        .then(data => {
            console.log('서버 응답 데이터:', data);
            if (data.success) {
                alert('프로필 이미지 변경 성공');
                document.getElementById('profileImage').src = data.data.profileImg;
            } else {
                alert(data.msg || '프로필 이미지 변경 실패');
            }
        })
        .catch((error) => {
            console.error('이미지 업로드 오류:', error);
            alert('프로필 이미지 변경 중 오류 발생');
        });
    });

    // ✅ 이름 변경
    document.getElementById('name-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;

        fetchAPI(API.UPDATE_NAME, {
            method: 'PUT',
            body: JSON.stringify({ name })
        })
        .then(data => {
            if (data.success) {
                alert('이름이 변경되었습니다.');
            } else {
                alert(data.msg || '이름 변경 실패');
            }
        });
    });

    document.getElementById('password-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;

        fetchAPI(API.CHANGE_PASSWORD, {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        })
        .then(data => {
            if (data.success) {
                alert('비밀번호가 변경되었습니다.');
            } else {
                alert(data.msg || '비밀번호 변경 실패');
            }
        });
    });
});