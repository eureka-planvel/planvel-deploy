document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const loginData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    fetchAPI(API.LOGIN, {
        method: 'POST',
        body: JSON.stringify(loginData)
    })
    .then(data => {
        if (data.success) {
            alert('로그인 성공');
            window.location.href = 'index.html';
        } else {
            alert(data.msg || '로그인 실패');
        }
    })
    .catch(error => {
        console.error('로그인 오류:', error);
        alert('로그인 중 오류 발생');
    });
});