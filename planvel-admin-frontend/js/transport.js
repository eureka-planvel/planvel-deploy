// transport.js - 운송 관리 기능
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkAuth().then(adminData => {
        if (adminData) {
            // 관리자 정보 표시
            document.getElementById('admin-name').textContent = adminData.name;
            
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
                    
                    loadTimetables({
                        transportType: transportType || null,
                        departureStationId: departureStationId || null,
                        arrivalStationId: arrivalStationId || null
                    });
                });
            }
            
            // 역/터미널 검색 폼 이벤트 등록
            const stationSearchForm = document.getElementById('station-search-form');
            if (stationSearchForm) {
                stationSearchForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const stationType = document.getElementById('station-type').value;
                    loadStations(stationType);
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
                    saveTimetable();
                });
            }
            
            // 초기 데이터 로드
            loadStationsForDropdown();
            loadTimetables();
        }
    });
});

// 탭 전환 함수
function showTab(tabId) {
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
    
    document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    
    // 탭별 초기화
    if (tabId === 'station') {
        loadStations();
    }
}

// 시간표 목록 로드 함수
async function loadTimetables(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.transportType) {
        queryParams.append('transportType', params.transportType);
    }
    
    if (params.departureStationId) {
        queryParams.append('departureStationId', params.departureStationId);
    }
    
    if (params.arrivalStationId) {
        queryParams.append('arrivalStationId', params.arrivalStationId);
    }
    
    const endpoint = `${API.TIMETABLES}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    fetchAPI(endpoint)
        .then(data => {
            if (data && data.success) {
                renderTimetableTable(data.data);
            } else {
                showToast(data?.msg || '시간표 로드에 실패했습니다.', true);
            }
        });
}

// 시간표 테이블 렌더링 함수
function renderTimetableTable(timetables) {
    const tableBody = document.querySelector('#timetable-table tbody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (timetables.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">등록된 시간표가 없습니다.</td>
            </tr>
        `;
        return;
    }
    
    timetables.forEach(timetable => {
        const row = document.createElement('tr');
        
        // 시간 형식 변환
        const departureTime = new Date(`2000-01-01T${timetable.departureTime}`);
        const formattedTime = departureTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        
        row.innerHTML = `
            <td>${timetable.id}</td>
            <td>${timetable.transportType === 'TRAIN' ? '기차' : '버스'}</td>
            <td>${timetable.departureStationName}</td>
            <td>${timetable.arrivalStationName}</td>
            <td>${formattedTime}</td>
            <td>${timetable.durationMin}분</td>
            <td>${timetable.price.toLocaleString()}원</td>
            <td>${timetable.transportNumber}</td>
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
}

// 역/터미널 목록 로드 함수
async function loadStations(type = '') {
    const queryParams = new URLSearchParams();
    
    if (type) {
        queryParams.append('type', type);
    }
    
    const endpoint = `${API.STATIONS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    fetchAPI(endpoint)
        .then(data => {
            if (data && data.success) {
                renderStationTable(data.data);
            } else {
                showToast(data?.msg || '역/터미널 로드에 실패했습니다.', true);
            }
        });
}

// 역/터미널 테이블 렌더링 함수
function renderStationTable(stations) {
    const tableBody = document.querySelector('#station-table tbody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (stations.length === 0) {
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
            <td>${station.id}</td>
            <td>${station.name}</td>
            <td>${station.regionName}</td>
            <td>${station.type === 'TRAIN' ? '기차역' : '버스터미널'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 드롭다운용 역/터미널 목록 로드 함수
async function loadStationsForDropdown() {
    // 기차역 목록 로드
    fetchAPI(`${API.STATIONS}?type=TRAIN`)
        .then(data => {
            if (data && data.success) {
                const trainStations = data.data;
                
                // 출발지 드롭다운 옵션 생성
                const departureSelect = document.getElementById('departure-station');
                const modalDepartureSelect = document.getElementById('modal-departure-station');
                
                if (departureSelect) {
                    trainStations.forEach(station => {
                        const option = document.createElement('option');
                        option.value = station.id;
                        option.textContent = station.name;
                        departureSelect.appendChild(option);
                    });
                }
                
                if (modalDepartureSelect) {
                    trainStations.forEach(station => {
                        const option = document.createElement('option');
                        option.value = station.id;
                        option.textContent = station.name;
                        modalDepartureSelect.appendChild(option);
                    });
                }
                
                // 도착지 드롭다운 옵션 생성
                const arrivalSelect = document.getElementById('arrival-station');
                const modalArrivalSelect = document.getElementById('modal-arrival-station');
                
                if (arrivalSelect) {
                    trainStations.forEach(station => {
                        const option = document.createElement('option');
                        option.value = station.id;
                        option.textContent = station.name;
                        arrivalSelect.appendChild(option);
                    });
                }
                
                if (modalArrivalSelect) {
                    trainStations.forEach(station => {
                        const option = document.createElement('option');
                        option.value = station.id;
                        option.textContent = station.name;
                        modalArrivalSelect.appendChild(option);
                    });
                }
            }
        });
    
    // 버스터미널 목록 로드
    fetchAPI(`${API.STATIONS}?type=BUS`)
        .then(data => {
            if (data && data.success) {
                // 버스터미널 처리 로직 (필요 시)
            }
        });
}

// 시간표 수정 함수
async function editTimetable(id) {
    fetchAPI(`${API.TIMETABLES}/${id}`)
        .then(data => {
            if (data && data.success) {
                const timetable = data.data;
                
                document.getElementById('timetable-id').value = timetable.id;
                document.getElementById('modal-transport-type').value = timetable.transportType;
                document.getElementById('modal-departure-station').value = timetable.departureStationId;
                document.getElementById('modal-arrival-station').value = timetable.arrivalStationId;
                
                // 시간 형식 처리
                const timeString = timetable.departureTime.split(':');
                document.getElementById('modal-departure-time').value = `${timeString[0]}:${timeString[1]}`;
                
                document.getElementById('modal-duration').value = timetable.durationMin;
                document.getElementById('modal-price').value = timetable.price;
                document.getElementById('modal-transport-number').value = timetable.transportNumber;
                
                document.getElementById('modal-title').textContent = '시간표 수정';
                document.getElementById('timetable-modal').classList.remove('hidden');
            } else {
                showToast(data?.msg || '시간표 정보를 불러오는데 실패했습니다.', true);
            }
        });
}

// 시간표 삭제 함수
async function deleteTimetable(id) {
    if (!confirm('정말 이 시간표를 삭제하시겠습니까?')) {
        return;
    }
    
    fetchAPI(`${API.TIMETABLES}/${id}`, { method: 'DELETE' })
        .then(data => {
            if (data && data.success) {
                showToast('시간표가 삭제되었습니다.');
                loadTimetables();
            } else {
                showToast(data?.msg || '시간표 삭제에 실패했습니다.', true);
            }
        });
}

// 시간표 모달 열기 함수
function openTimetableModal() {
    // 폼 초기화
    document.getElementById('timetable-form').reset();
    document.getElementById('timetable-id').value = '0';
    document.getElementById('modal-title').textContent = '시간표 추가';
    
    document.getElementById('timetable-modal').classList.remove('hidden');
}

// 시간표 모달 닫기 함수
function closeTimetableModal() {
    document.getElementById('timetable-modal').classList.add('hidden');
}

// 시간표 저장 함수
async function saveTimetable() {
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
    
    fetchAPI(endpoint, {
        method,
        body: JSON.stringify(formData)
    })
    .then(data => {
        if (data && data.success) {
            showToast(`시간표가 ${isNew ? '추가' : '수정'}되었습니다.`);
            closeTimetableModal();
            loadTimetables();
        } else {
            showToast(data?.msg || `시간표 ${isNew ? '추가' : '수정'}에 실패했습니다.`, true);
        }
    });
}