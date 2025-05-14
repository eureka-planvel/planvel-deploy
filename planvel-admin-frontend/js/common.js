// 공통 기능 및 API 함수

// API 엔드포인트
const API = {
    LOGIN: '/admin-api/auth/login',
    REGISTER: '/admin-api/auth/register',
    ME: '/admin-api/auth/me',
    LOGOUT: '/admin-api/auth/logout',
    REGION: '/admin-api/region',
    ACCOMMODATION: '/admin-api/accommodation',
    SPOT : '/admin-api/spot'
};

// API 요청 함수
async function fetchAPI(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    };
    
    const fetchOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(endpoint, fetchOptions);
        
        if (!response.ok) {
            if (response.status === 401) {
                // 인증 실패 시 로그인 페이지로 리다이렉트
                window.location.href = '/index.html';
                return null;
            }
            
            const errorData = await response.json().catch(() => ({}));
            console.error('API 에러:', response.status, errorData);
            return { success: false, msg: errorData.msg || `서버 오류: ${response.status}` };
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API 요청 실패:', error);
        return { success: false, msg: '서버와의 통신에 실패했습니다.' };
    }
}

// 토스트 알림 표시 함수
function showToast(message, isError = false, duration = 3000) {
    const toast = document.getElementById('toast') || createToastElement();
    
    toast.textContent = message;
    toast.className = isError ? 'toast error' : 'toast';
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// 토스트 엘리먼트 생성 함수
function createToastElement() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast hidden';
    document.body.appendChild(toast);
    return toast;
}

// URL 파라미터 가져오기 함수
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 로그인 상태 확인 함수
function checkAuth() {
    return fetchAPI(API.ME)
        .then(data => {
            if (!data || !data.success) {
                window.location.href = '/index.html';
                return null;
            }
            return data.data;
        })
        .catch(error => {
            console.error('인증 확인 중 오류 발생:', error);
            window.location.href = '/index.html';
            return null;
        });
}

// 지역 목록 가져오기 함수
function fetchRegions(callback) {
    fetchAPI(API.REGION)
        .then(data => {
            if (data && data.success) {
                callback(data.data);
            } else {
                showToast('지역 목록 조회 실패', true);
            }
        });
}