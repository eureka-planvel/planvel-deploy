window.addEventListener('DOMContentLoaded', function() {
    fetchAPI(API.PROFILE)
        .then(data => {
            if (data.success) {
                document.getElementById('profileImage').src = data.data.profileImg || 'images/noProfile.png';
                document.getElementById('userName').innerText = data.data.name;
                document.getElementById('userEmail').innerText = data.data.email;
            }
        })
        .catch((error) => {
            console.error('프로필 API 호출 오류:', error);
            alert('오류 발생');
        });
});