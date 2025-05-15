const API = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/user/register',
    LOGOUT: '/api/auth/logout',
    EMAIL_CHECK: '/api/user/email-check'
};

// 공통 API 호출 함수
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
            const errorData = await response.json().catch(() => ({}));
            return { success: false, msg: errorData.msg || `서버 오류: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error('API 요청 실패:', error);
        return { success: false, msg: '서버와의 통신에 실패했습니다.' };
    }
}

// (선택) 토스트 알림 함수 (필요 시)
function showToast(message, isError = false) {
    alert(message);
}