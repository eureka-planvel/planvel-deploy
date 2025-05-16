const API = {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/user/register',
    EMAIL_CHECK: '/api/user/email-check',
    PROFILE: '/api/user/profile',
    UPDATE_NAME: '/api/user/profile/name',
    PROFILE_IMAGE_UPDATE: '/api/user/profile/image',
    CHANGE_PASSWORD: '/api/user/password',
    REGION_LIST: '/api/regions',
    REVIEWS_BY_REGION: '/api/review/region/'
};

// 공통 API 호출 함수
async function fetchAPI(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;

    const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };

    const fetchOptions = {
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include',
        ...options
    };

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