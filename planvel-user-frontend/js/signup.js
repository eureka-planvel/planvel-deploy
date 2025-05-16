document.getElementById('checkEmailBtn').addEventListener('click', function() {
    const email = document.getElementById('email').value;
    if (!email) {
        alert('이메일을 입력하세요.');
        return;
    }

    fetchAPI(`${API.EMAIL_CHECK}?email=${encodeURIComponent(email)}`)
        .then(data => {
            if (data.success) {
                alert('사용 가능한 이메일입니다.');
            } else {
                alert(data.msg || '이미 사용 중인 이메일입니다.');
            }
        })
        .catch(error => {
            console.error('중복 확인 오류:', error);
            alert('중복 확인 중 오류 발생');
        });
});

document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    fetchAPI(API.REGISTER, {
        method: 'POST',
        body: JSON.stringify(formData)
    })
    .then(data => {
        if (data.success) {
            alert('회원가입 성공');
            window.location.href = 'login.html';
        } else {
            alert(data.msg || '회원가입 실패');
        }
    })
    .catch(error => {
        console.error('회원가입 오류:', error);
        alert('회원가입 중 오류 발생');
    });
});