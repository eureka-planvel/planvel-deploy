// common.js - 공통 기능
const API = {
    LOGIN: '/admin-api/auth/login',
    REGISTER: '/admin-api/auth/register',
    ME: '/admin-api/auth/me',
    LOGOUT: '/admin-api/auth/logout',
    TIMETABLES: '/admin-api/management/timetables',
    STATIONS: '/admin-api/management/stations'
};

// 기본 경로 설정 (Nginx 설정에 맞춤)
const BASE_PATH = '/admin-frontend/';

// 토스트 알림 표시 함수
function showToast(message, isError = false, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.error('토스트 엘리먼트를 찾을 수 없습니다.');
        return;
    }
    
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
        console.log('API 요청:', url, fetchOptions); // 디버깅용
        
        const response = await fetch(url, fetchOptions);
        
        // HTTP 상태 코드 체크
        if (!response.ok) {
            if (response.status === 401) {
                // 인증 실패 시 로그인 페이지로 리다이렉트
                console.log('인증 실패, 로그인 페이지로 리다이렉트');
                window.location.href = BASE_PATH + 'index.html';
                return null;
            }
            
            const errorData = await response.json().catch(() => ({}));
            console.error('API 에러:', response.status, errorData);
            showToast(`서버 오류: ${errorData.msg || response.statusText}`, true);
            return { success: false, msg: errorData.msg || `서버 오류: ${response.status}` };
        }
        
        const data = await response.json();
        console.log('API 응답:', data); // 디버깅용
        
        return data;
    } catch (error) {
        console.error('API 요청 실패:', error);
        showToast('서버와의 통신에 실패했습니다.', true);
        return { success: false, msg: '서버와의 통신에 실패했습니다.' };
    }
}

// 로그인 상태 확인
function checkAuth() {
    return fetchAPI(API.ME)
        .then(data => {
            if (!data || !data.success) {
                console.log('인증되지 않은 사용자, 로그인 페이지로 리다이렉트');
                window.location.href = BASE_PATH + 'index.html';
                return null;
            }
            return data.data;
        })
        .catch(error => {
            console.error('인증 확인 중 오류 발생:', error);
            window.location.href = BASE_PATH + 'index.html';
            return null;
        });
}

// 페이지 이동 함수 (리다이렉트 표준화)
function navigateTo(page) {
    window.location.href = BASE_PATH + page;
}

// 현재 페이지 확인 함수
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    return filename;
}

// URL 파라미터 가져오기 함수
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 로그아웃 함수
function logout() {
    fetchAPI(API.LOGOUT, { method: 'POST' })
        .then(() => {
            navigateTo('index.html');
        })
        .catch(error => {
            console.error('로그아웃 중 오류 발생:', error);
            // 오류 발생해도 로그인 페이지로 이동
            navigateTo('index.html');
        });
}