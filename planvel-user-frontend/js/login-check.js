window.addEventListener('DOMContentLoaded', function() {
    fetchAPI(API.PROFILE)
        .then(data => {
            if (!data.success) {
                alert('로그인이 필요한 페이지입니다.');
                window.location.href = 'login.html';
            }
        })
        .catch(() => {
            alert('로그인이 필요한 페이지입니다.');
            window.location.href = 'login.html';
        });
});