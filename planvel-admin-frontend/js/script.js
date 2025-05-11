document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authContainer = document.getElementById('auth-container');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const account = document.getElementById('account');
    const adminName = document.getElementById('admin-name');
    const logoutBtn = document.getElementById('logout-btn');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const infoUsername = document.getElementById('info-username');
    const infoName = document.getElementById('info-name');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminRegisterForm = document.getElementById('admin-register-form');
    const navLinks = document.querySelectorAll('.nav-menu a');

    const API = {
    LOGIN: '/admin-api/auth/login',
    REGISTER: '/admin-api/auth/register',
    ME: '/admin-api/auth/me',
    LOGOUT: '/admin-api/auth/logout'
    };


    // Check login status on page load
    checkLoginStatus();

    // Event Listeners
    adminLoginForm.addEventListener('submit', handleLogin);
    adminRegisterForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
    
    // 직접 이벤트 리스너에 디버그 코드 추가
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('회원가입 링크 클릭됨');
        showRegister();
    });
    
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('로그인 링크 클릭됨');
        showLogin();
    });

    // Navigation event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
            
            // Set active class
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Functions
    function checkLoginStatus() {
        fetch(API.ME, {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // User is logged in
                    loginSuccess(data.data);
                } else {
                    // User is not logged in
                    showLogin();
                }
            })
            .catch(error => {
                console.error('Error checking login status:', error);
                showLogin();
            });
    }

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
                
                // Fetch user info after successful login
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
                // Clear the register form
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

    function handleLogout() {
        fetch(API.LOGOUT, {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('로그아웃 성공');
                logoutSuccess();
            } else {
                showToast(data.msg || '로그아웃 실패', true);
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            showToast('로그아웃 중 오류가 발생했습니다.', true);
        });
    }

    function loginSuccess(adminData) {
        // Update UI
        adminName.textContent = adminData.name;
        infoUsername.textContent = adminData.username;
        infoName.textContent = adminData.name;
        
        // Hide auth container, show admin panel
        authContainer.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        
        // Set default active nav
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === 'account') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function logoutSuccess() {
        // Show auth container, hide admin panel
        authContainer.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        
        // Show login form
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }

    function showLogin() {
        console.log('로그인 폼 표시');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }

    function showRegister() {
        console.log('회원가입 폼 표시');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }

    function showPage(page) {
        // Hide all pages
        account.classList.add('hidden');
        
        // Show selected page
        if (page === 'account') {
            account.classList.remove('hidden');
        }
    }

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        
        if (isError) {
            toast.classList.add('error');
        } else {
            toast.classList.remove('error');
        }
        
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
});