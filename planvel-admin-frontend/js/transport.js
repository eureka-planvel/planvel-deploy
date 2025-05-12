// transport.js - 운송 관리 기능
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkAuth().then(adminData => {
        if (adminData) {
            try {
                // 관리자 정보 표시
                const adminNameElement = document.getElementById('admin-name');
                if (adminNameElement) {
                    adminNameElement.textContent = adminData.name;
                }
                
                // 탭 버튼 이벤트 등록
                const tabBtns = document.querySelectorAll('.tab-btn');
                if (tabBtns.length > 0) {
                    tabBtns.forEach(btn => {
                        btn.addEventListener('click', function() {
                            const tabId = this.getAttribute('data-tab');
                            showTab(tabId);
                        });
                    });
                }
                
                // 시간표 검색 폼 이벤트 등록
                const timetableSearchForm = document.getElementById('timetable-search-form');
                if (timetableSearchForm) {
                    timetableSearchForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        const transportType = document.getElementById('transport-type').value;
                        const departureStationId = document.getElementById('departure-station').value;
                        const arrivalStationId = document.getElementById('arrival-station').value;
                        
                        // 검색 파라미터 구성
                        const searchParams = {
                            transportType: transportType || null,
                            departureStationId: departureStationId || null,
                            arrivalStationId: arrivalStationId || null
                        };
                        
                        // 조회 함수 호출
                        if (!transportType && !departureStationId && !arrivalStationId) {
                            // 검색 조건이 없으면 search API 사용
                            loadTimetablesBySearch({});
                        } else {
                            // 검색 조건이 있으면 해당 조건으로 검색
                            loadTimetables(searchParams);
                        }
                    });
                }
                
                // 역/터미널 검색 폼 이벤트 등록
                const stationSearchForm = document.getElementById('station-search-form');
                if (stationSearchForm) {
                    stationSearchForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        const stationType = document.getElementById('station-type').value;
                        loadStations(stationType || 'TRAIN'); // 기본값은 TRAIN으로 설정
                    });
                }
                
                // 시간표 추가 버튼 이벤트 등록
                const addTimetableBtn = document.getElementById('add-timetable-btn');
                if (addTimetableBtn) {
                    addTimetableBtn.addEventListener('click', function() {
                        openTimetableModal();
                    });
                }
                
                // 모달 닫기 버튼 이벤트 등록
                const modalCloseBtn = document.querySelector('.close-btn');
                if (modalCloseBtn) {
                    modalCloseBtn.addEventListener('click', closeTimetableModal);
                }
                
                // 취소 버튼 이벤트 등록
                const cancelBtn = document.getElementById('cancel-btn');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', closeTimetableModal);
                }
                
                // 시간표 폼 제출 이벤트 등록
                const timetableForm = document.getElementById('timetable-form');
                if (timetableForm) {
                    timetableForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        if (validateTimetableForm()) {
                            saveTimetable();
                        }
                    });
                }
                
                // 초기 데이터 로드
                loadStationsForDropdown();
                
                // 초기 시간표 데이터는 search API를 사용하여 로드
                loadTimetablesBySearch({});
            } catch (error) {
                console.error('초기화 중 오류 발생:', error);
                showToast('페이지 초기화 중 오류가 발생했습니다.', true);
            }
        }
    });
});

// 탭 전환 함수
function showTab(tabId) {
    try {
        const tabContents = document.querySelectorAll('.tab-content');
        const tabBtns = document.querySelectorAll('.tab-btn');
        
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });
        
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            }
        });
        
        const tabContent = document.getElementById(`${tabId}-tab`);
        if (!tabContent) {
            console.error(`Tab content not found: ${tabId}-tab`);
            return;
        }
        
        tabContent.classList.remove('hidden');
        
        // 탭별 초기화
        if (tabId === 'station') {
            loadStations('TRAIN'); // 기본값은 TRAIN으로 설정
        }
    } catch (error) {
        console.error('탭 전환 중 오류 발생:', error);
    }
}

// 시간표 목록 로드 함수
async function loadTimetables(params = {}) {
    try {
        // 필수 파라미터가 없으면 search API 사용
        if (!params.transportType || !params.departureStationId || !params.arrivalStationId) {
            return loadTimetablesBySearch(params);
        }
        
        const queryParams = new URLSearchParams();
        queryParams.append('transportType', params.transportType);
        queryParams.append('departureStationId', params.departureStationId);
        queryParams.append('arrivalStationId', params.arrivalStationId);
        
        const endpoint = `${API.TIMETABLES}?${queryParams.toString()}`;
        console.log('시간표 조회 API 호출:', endpoint);
        
        fetchAPI(endpoint)
            .then(data => {
                if (data && data.success) {
                    renderTimetableTable(data.data);
                } else {
                    showToast(data?.msg || '시간표 로드에 실패했습니다.', true);
                }
            })
            .catch(error => {
                console.error('시간표 조회 중 오류 발생:', error);
                showToast('시간표 로드 중 오류가 발생했습니다.', true);
            });
    } catch (error) {
        console.error('시간표 로드 함수 실행 중 오류 발생:', error);
        showToast('시간표 로드 중 오류가 발생했습니다.', true);
    }
}

// 검색 조건으로 시간표 로드 (필수 파라미터가 없을 때 사용)
async function loadTimetablesBySearch(params = {}) {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.transportType) {
            queryParams.append('transportType', params.transportType);
        }
        
        if (params.timeFrom) {
            queryParams.append('timeFrom', params.timeFrom);
        }
        
        if (params.timeTo) {
            queryParams.append('timeTo', params.timeTo);
        }
        
        if (params.transportNumber) {
            queryParams.append('transportNumber', params.transportNumber);
        }
        
        const endpoint = `${API.TIMETABLES}/search?${queryParams.toString()}`;
        console.log('시간표 검색 API 호출:', endpoint);
        
        fetchAPI(endpoint)
            .then(data => {
                if (data && data.success) {
                    renderTimetableTable(data.data);
                } else {
                    showToast(data?.msg || '시간표 로드에 실패했습니다.', true);
                }
            })
            .catch(error => {
                console.error('시간표 검색 중 오류 발생:', error);
                showToast('시간표 검색 중 오류가 발생했습니다.', true);
            });
    } catch (error) {
        console.error('시간표 검색 함수 실행 중 오류 발생:', error);
        showToast('시간표 검색 중 오류가 발생했습니다.', true);
    }
}

// 시간표 테이블 렌더링 함수
function renderTimetableTable(timetables) {
    try {
        const tableBody = document.querySelector('#timetable-table tbody');
        
        if (!tableBody) {
            console.error('시간표 테이블 본문 요소를 찾을 수 없습니다.');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (!timetables || timetables.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">등록된 시간표가 없습니다.</td>
                </tr>
            `;
            return;
        }
        
        timetables.forEach(timetable => {
            const row = document.createElement('tr');
            
            // 시간 형식 변환 - 에러 처리 추가
            let formattedTime = '';
            try {
                if (timetable.departureTime) {
                    // ISO 형식인 경우와 HH:MM 형식인 경우 모두 처리
                    const departureTime = timetable.departureTime.includes('T') ? 
                        new Date(timetable.departureTime) : 
                        new Date(`2000-01-01T${timetable.departureTime}`);
                    
                    formattedTime = departureTime.toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                }
            } catch (e) {
                console.error('시간 형식 변환 오류:', e);
                formattedTime = timetable.departureTime || '';
            }
            
            // 데이터 검증 및 기본값 설정
            const transportType = timetable.transportType === 'TRAIN' ? '기차' : 
                                timetable.transportType === 'BUS' ? '버스' : 
                                timetable.transportType || '알 수 없음';
                                
            const price = timetable.price != null ? timetable.price.toLocaleString() : '0';
            
            row.innerHTML = `
                <td>${timetable.id || ''}</td>
                <td>${transportType}</td>
                <td>${timetable.departureStationName || ''}</td>
                <td>${timetable.arrivalStationName || ''}</td>
                <td>${formattedTime}</td>
                <td>${timetable.durationMin || '0'}분</td>
                <td>${price}원</td>
                <td>${timetable.transportNumber || ''}</td>
                <td class="action-btns">
                    <button class="action-btn edit-btn" data-id="${timetable.id}">수정</button>
                    <button class="action-btn delete-btn" data-id="${timetable.id}">삭제</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // 수정 버튼 이벤트 등록
        const editBtns = document.querySelectorAll('.edit-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editTimetable(id);
            });
        });
        
        // 삭제 버튼 이벤트 등록
        const deleteBtns = document.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteTimetable(id);
            });
        });
    } catch (error) {
        console.error('시간표 테이블 렌더링 중 오류 발생:', error);
        showToast('시간표 표시 중 오류가 발생했습니다.', true);
    }
}

// 역/터미널 목록 로드 함수
async function loadStations(type = 'TRAIN') { // 기본값 설정
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('type', type); // 항상 type 파라미터 추가
        
        const endpoint = `${API.STATIONS}?${queryParams.toString()}`;
        console.log('역/터미널 조회 API 호출:', endpoint);
        
        fetchAPI(endpoint)
            .then(data => {
                if (data && data.success) {
                    renderStationTable(data.data);
                } else {
                    showToast(data?.msg || '역/터미널 로드에 실패했습니다.', true);
                }
            })
            .catch(error => {
                console.error('역/터미널 조회 중 오류 발생:', error);
                showToast('역/터미널 로드 중 오류가 발생했습니다.', true);
            });
    } catch (error) {
        console.error('역/터미널 로드 함수 실행 중 오류 발생:', error);
        showToast('역/터미널 로드 중 오류가 발생했습니다.', true);
    }
}

// 역/터미널 테이블 렌더링 함수
function renderStationTable(stations) {
    try {
        const tableBody = document.querySelector('#station-table tbody');
        
        if (!tableBody) {
            console.error('역/터미널 테이블 본문 요소를 찾을 수 없습니다.');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (!stations || stations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">등록된 역/터미널이 없습니다.</td>
                </tr>
            `;
            return;
        }
        
        stations.forEach(station => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${station.id || ''}</td>
                <td>${station.name || ''}</td>
                <td>${station.regionName || ''}</td>
                <td>${station.type === 'TRAIN' ? '기차역' : '버스터미널'}</td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('역/터미널 테이블 렌더링 중 오류 발생:', error);
        showToast('역/터미널 표시 중 오류가 발생했습니다.', true);
    }
}

// 드롭다운용 역/터미널 목록 로드 함수
async function loadStationsForDropdown() {
    try {
        // 기차역 목록 로드
        fetchAPI(`${API.STATIONS}?type=TRAIN`)
            .then(data => {
                if (data && data.success) {
                    const trainStations = data.data;
                    
                    // 출발지 드롭다운 옵션 생성
                    populateDropdown('departure-station', trainStations);
                    populateDropdown('modal-departure-station', trainStations);
                    
                    // 도착지 드롭다운 옵션 생성
                    populateDropdown('arrival-station', trainStations);
                    populateDropdown('modal-arrival-station', trainStations);
                } else {
                    showToast(data?.msg || '기차역 목록 로드에 실패했습니다.', true);
                }
            })
            .catch(error => {
                console.error('기차역 목록 로드 중 오류 발생:', error);
                showToast('기차역 목록 로드 중 오류가 발생했습니다.', true);
            });
        
        // 버스터미널 목록 로드
        fetchAPI(`${API.STATIONS}?type=BUS`)
            .then(data => {
                if (data && data.success) {
                    // 버스터미널 처리 로직 (필요 시)
                    const busStations = data.data;
                    console.log('버스터미널 목록 로드 성공:', busStations.length);
                }
            })
            .catch(error => {
                console.error('버스터미널 목록 로드 중 오류 발생:', error);
            });
    } catch (error) {
        console.error('역/터미널 드롭다운 로드 함수 실행 중 오류 발생:', error);
        showToast('역/터미널 목록 로드 중 오류가 발생했습니다.', true);
    }
}

// 드롭다운 채우기 헬퍼 함수
function populateDropdown(elementId, stations) {
    const selectElement = document.getElementById(elementId);
    if (!selectElement) return;
    
    // 기존 옵션 초기화 (첫 번째 "전체" 옵션 유지)
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // 새 옵션 추가
    stations.forEach(station => {
        const option = document.createElement('option');
        option.value = station.id;
        option.textContent = station.name;
        selectElement.appendChild(option);
    });
}

// 시간표 폼 유효성 검사 함수
function validateTimetableForm() {
    try {
        const transportType = document.getElementById('modal-transport-type').value;
        const departureStationId = document.getElementById('modal-departure-station').value;
        const arrivalStationId = document.getElementById('modal-arrival-station').value;
        const departureTime = document.getElementById('modal-departure-time').value;
        const durationMin = document.getElementById('modal-duration').value;
        const price = document.getElementById('modal-price').value;
        const transportNumber = document.getElementById('modal-transport-number').value;
        
        // 필수 필드 검증
        if (!transportType) {
            showToast('교통 유형을 선택해주세요.', true);
            return false;
        }
        
        if (!departureStationId) {
            showToast('출발지를 선택해주세요.', true);
            return false;
        }
        
        if (!arrivalStationId) {
            showToast('도착지를 선택해주세요.', true);
            return false;
        }
        
        if (departureStationId === arrivalStationId) {
            showToast('출발지와 도착지가 같을 수 없습니다.', true);
            return false;
        }
        
        if (!departureTime) {
            showToast('출발 시간을 입력해주세요.', true);
            return false;
        }
        
        if (!durationMin || parseInt(durationMin) <= 0) {
            showToast('유효한 소요 시간을 입력해주세요.', true);
            return false;
        }
        
        if (!price || parseInt(price) < 0) {
            showToast('유효한 가격을 입력해주세요.', true);
            return false;
        }
        
        if (!transportNumber) {
            showToast('운행 번호를 입력해주세요.', true);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('폼 유효성 검사 중 오류 발생:', error);
        showToast('폼 검증 중 오류가 발생했습니다.', true);
        return false;
    }
}

// 시간표 수정 함수
async function editTimetable(id) {
    try {
        if (!id) {
            showToast('유효하지 않은 시간표 ID입니다.', true);
            return;
        }
        
        fetchAPI(`${API.TIMETABLES}/${id}`)
            .then(data => {
                if (data && data.success) {
                    const timetable = data.data;
                    
                    // 모달 폼 필드 채우기
                    document.getElementById('timetable-id').value = timetable.id || '';
                    document.getElementById('modal-transport-type').value = timetable.transportType || 'TRAIN';
                    document.getElementById('modal-departure-station').value = timetable.departureStationId || '';
                    document.getElementById('modal-arrival-station').value = timetable.arrivalStationId || '';
                    
                    // 시간 형식 처리
                    try {
                        if (timetable.departureTime) {
                            const timeString = timetable.departureTime.split(':');
                            document.getElementById('modal-departure-time').value = 
                                `${timeString[0].padStart(2, '0')}:${timeString[1].padStart(2, '0')}`;
                        } else {
                            document.getElementById('modal-departure-time').value = '';
                        }
                    } catch (e) {
                        console.error('시간 형식 처리 오류:', e);
                        document.getElementById('modal-departure-time').value = '';
                    }
                    
                    document.getElementById('modal-duration').value = timetable.durationMin || '';
                    document.getElementById('modal-price').value = timetable.price || '';
                    document.getElementById('modal-transport-number').value = timetable.transportNumber || '';
                    
                    document.getElementById('modal-title').textContent = '시간표 수정';
                    document.getElementById('timetable-modal').classList.remove('hidden');
                } else {
                    showToast(data?.msg || '시간표 정보를 불러오는데 실패했습니다.', true);
                }
            })
            .catch(error => {
                console.error('시간표 정보 조회 중 오류 발생:', error);
                showToast('시간표 정보를 불러오는데 실패했습니다.', true);
            });
    } catch (error) {
        console.error('시간표 수정 함수 실행 중 오류 발생:', error);
        showToast('시간표 수정 중 오류가 발생했습니다.', true);
    }
}

// 시간표 삭제 함수
async function deleteTimetable(id) {
    try {
        if (!id) {
            showToast('유효하지 않은 시간표 ID입니다.', true);
            return;
        }
        
        if (!confirm('정말 이 시간표를 삭제하시겠습니까?')) {
            return;
        }
        
        fetchAPI(`${API.TIMETABLES}/${id}`, { method: 'DELETE' })
            .then(data => {
                if (data && data.success) {
                    showToast('시간표가 삭제되었습니다.');
                    loadTimetablesBySearch({}); // 삭제 후 목록 새로고침
                } else {
                    showToast(data?.msg || '시간표 삭제에 실패했습니다.', true);
                }
            })
            .catch(error => {
                console.error('시간표 삭제 중 오류 발생:', error);
                showToast('시간표 삭제 중 오류가 발생했습니다.', true);
            });
    } catch (error) {
        console.error('시간표 삭제 함수 실행 중 오류 발생:', error);
        showToast('시간표 삭제 중 오류가 발생했습니다.', true);
    }
}

// 시간표 모달 열기 함수
function openTimetableModal() {
    try {
        // 폼 초기화
        document.getElementById('timetable-form').reset();
        document.getElementById('timetable-id').value = '0';
        document.getElementById('modal-title').textContent = '시간표 추가';
        
        document.getElementById('timetable-modal').classList.remove('hidden');
    } catch (error) {
        console.error('시간표 모달 열기 중 오류 발생:', error);
        showToast('모달 창을 여는 중 오류가 발생했습니다.', true);
    }
}

// 시간표 모달 닫기 함수
function closeTimetableModal() {
    try {
        document.getElementById('timetable-modal').classList.add('hidden');
    } catch (error) {
        console.error('시간표 모달 닫기 중 오류 발생:', error);
    }
}

// 시간표 저장 함수
async function saveTimetable() {
    try {
        const formData = {
            id: parseInt(document.getElementById('timetable-id').value) || 0,
            transportType: document.getElementById('modal-transport-type').value,
            departureStationId: parseInt(document.getElementById('modal-departure-station').value),
            arrivalStationId: parseInt(document.getElementById('modal-arrival-station').value),
            departureTime: document.getElementById('modal-departure-time').value,
            durationMin: parseInt(document.getElementById('modal-duration').value),
            price: parseInt(document.getElementById('modal-price').value),
            transportNumber: document.getElementById('modal-transport-number').value
        };
        
        const isNew = formData.id === 0;
        const method = isNew ? 'POST' : 'PUT';
        const endpoint = isNew ? API.TIMETABLES : `${API.TIMETABLES}/${formData.id}`;
        
        // PUT 메서드인 경우 백엔드에서 요구하는 형태로 변경
        // 백엔드 컨트롤러에서 RequestBody Timetable 객체를 받지만 id만 사용
        const body = isNew ? formData : { id: formData.id };
        
        console.log(`${isNew ? '추가' : '수정'} API 호출:`, endpoint, body);
        
        fetchAPI(endpoint, {
            method,
            body: JSON.stringify(body)
        })
        .then(data => {
            if (data && data.success) {
                showToast(`시간표가 ${isNew ? '추가' : '수정'}되었습니다.`);
                closeTimetableModal();
                loadTimetablesBySearch({}); // 저장 후 목록 새로고침
            } else {
                showToast(data?.msg || `시간표 ${isNew ? '추가' : '수정'}에 실패했습니다.`, true);
            }
        })
        .catch(error => {
            console.error('시간표 저장 중 오류 발생:', error);
            showToast(`시간표 ${isNew ? '추가' : '수정'} 중 오류가 발생했습니다.`, true);
        });
    } catch (error) {
        console.error('시간표 저장 함수 실행 중 오류 발생:', error);
        showToast('시간표 저장 중 오류가 발생했습니다.', true);
    }
}