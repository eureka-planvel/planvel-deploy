// common.js - 공통 기능
const API = {
    LOGIN: '/admin-api/auth/login',
    REGISTER: '/admin-api/auth/register',
    ME: '/admin-api/auth/me',
    LOGOUT: '/admin-api/auth/logout',
    TIMETABLES: '/admin-api/management/timetables',
    STATIONS: '/admin-api/management/stations'
};

// 토스트 알림 표시 함수
function showToast(message, isError = false, duration = 3000) {
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
    }, duration);
}

// API 요청 함수
async function fetchAPI(endpoint, options = {}) {
    const url = endpoint;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    };
    
    const fetchOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, fetchOptions);
        const data = await response.json();
        
        if (response.status === 401) {
            // 인증 실패 시 로그인 페이지로 리다이렉트
            window.location.href = '/index.html';
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('API 요청 실패:', error);
        showToast('서버와의 통신에 실패했습니다.', true);
        return null;
    }
}

// 로그인 상태 확인
function checkAuth() {
    return fetchAPI(API.ME)
        .then(data => {
            if (!data || !data.success) {
                window.location.href = '/index.html';
                return null;
            }
            return data.data;
        });
}