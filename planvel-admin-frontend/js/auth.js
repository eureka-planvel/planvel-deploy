// auth.js - 인증 관련 기능
document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소
    const authContainer = document.getElementById('auth-container');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminRegisterForm = document.getElementById('admin-register-form');
    
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 로그인/회원가입 폼 전환
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('회원가입 링크 클릭됨');
            showRegister();
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('로그인 링크 클릭됨');
            showLogin();
        });
    }
    
    // 로그인 폼 제출
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleLogin);
    }
    
    // 회원가입 폼 제출
    if (adminRegisterForm) {
        adminRegisterForm.addEventListener('submit', handleRegister);
    }
    
    // 로그인 상태 확인 함수
    function checkLoginStatus() {
        fetch(API.ME, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 로그인 상태
                loginSuccess(data.data);
            } else {
                // 비로그인 상태
                showLogin();
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            showLogin();
        });
    }
    
    // 로그인 처리 함수
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showToast('아이디와 비밀번호를 입력해주세요.', true);
            return;
        }
        
        const loginData = {
            username: username,
            password: password
        };
        
        fetch(API.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('로그인 성공');
                
                // 로그인 성공 후 사용자 정보 조회
                return fetch(API.ME, {
                    credentials: 'include'
                });
            } else {
                showToast(data.msg || '로그인 실패', true);
                throw new Error(data.msg || '로그인 실패');
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loginSuccess(data.data);
            }
        })
        .catch(error => {
            console.error('Login error:', error);
        });
    }
    
    // 회원가입 처리 함수
    function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const name = document.getElementById('reg-name').value;
        
        if (!username || !password || !name) {
            showToast('모든 필드를 입력해주세요.', true);
            return;
        }
        
        const registerData = {
            username: username,
            password: password,
            name: name
        };
        
        fetch(API.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('계정 등록 성공');
                showLogin();
                // 회원가입 폼 초기화
                adminRegisterForm.reset();
            } else {
                showToast(data.msg || '등록 실패', true);
            }
        })
        .catch(error => {
            console.error('Register error:', error);
            showToast('등록 중 오류가 발생했습니다.', true);
        });
    }
    
    // 로그인 성공 처리 함수
    function loginSuccess(adminData) {
        // 페이지 이동
        window.location.href = './dashboard.html';
    }
    
    // 로그인 폼 표시 함수
    function showLogin() {
        console.log('로그인 폼 표시');
        authContainer.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }
    
    // 회원가입 폼 표시 함수
    function showRegister() {
        console.log('회원가입 폼 표시');
        authContainer.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
});