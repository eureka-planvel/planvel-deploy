// API 상수 정의 (common.js에 이미 있을 수 있음)
const API = {
    ME: '/api/admin/me',
    LOGOUT: '/api/admin/logout',
    TIMETABLES: '/management/timetables',
    STATIONS: '/management/stations'
};

// 전역 변수
let stations = []; // 역/터미널 목록
let timetables = []; // 시간표 목록
let currentTransportType = 'TRAIN'; // 현재 선택된 교통 유형 (기본값: 기차)
let currentStationType = 'TRAIN'; // 현재 선택된 역/터미널 유형 (기본값: 기차역)
let currentPage = 1;
let itemsPerPage = 10;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 메인 탭 이벤트 등록
    document.querySelectorAll('.main-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchMainTab(tabId);
        });
    });
    
    // 교통 유형 서브탭 이벤트 등록
    document.querySelectorAll('.sub-tab-btn[data-transport-type]').forEach(btn => {
        btn.addEventListener('click', function() {
            const transportType = this.getAttribute('data-transport-type');
            switchTransportType(transportType);
        });
    });
    
    // 역/터미널 유형 서브탭 이벤트 등록
    document.querySelectorAll('.sub-tab-btn[data-station-type]').forEach(btn => {
        btn.addEventListener('click', function() {
            const stationType = this.getAttribute('data-station-type');
            switchStationType(stationType);
        });
    });
    
    // 시간표 추가 버튼 이벤트
    document.getElementById('add-timetable-btn').addEventListener('click', function() {
        showTimetableModal('add');
    });
    
    // 역/터미널 추가 버튼 이벤트
    document.getElementById('add-station-btn').addEventListener('click', function() {
        showStationModal('add');
    });
    
    // 모달 닫기 버튼 이벤트
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // 시간표 모달 취소 버튼
    document.getElementById('cancel-btn').addEventListener('click', function() {
        document.getElementById('timetable-modal').classList.add('hidden');
    });
    
    // 역/터미널 모달 취소 버튼
    document.getElementById('station-cancel-btn').addEventListener('click', function() {
        document.getElementById('station-modal').classList.add('hidden');
    });
    
    // 시간표 폼 제출 이벤트
    document.getElementById('timetable-form').addEventListener('submit', handleTimetableSubmit);
    
    // 역/터미널 폼 제출 이벤트
    document.getElementById('station-form').addEventListener('submit', handleStationSubmit);
    
    // 시간표 검색 폼 제출 이벤트
    document.getElementById('timetable-search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        currentPage = 1;
        searchTimetables();
    });
    
    // 역/터미널 검색 폼 제출 이벤트
    document.getElementById('station-search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        searchStations();
    });
    
    // 초기 데이터 로드 - 먼저 기차역 불러오기
    loadStationsForType('TRAIN');
});

// 특정 유형의 역/터미널 데이터 로드
function loadStationsForType(type) {
    showToast(`${type === 'TRAIN' ? '기차역' : '버스터미널'} 데이터를 불러오는 중...`);
    
    fetchAPI(`${API.STATIONS}?type=${type}`)
        .then(data => {
            if (data && data.success) {
                // 해당 유형의 역/터미널만 저장
                const newStations = data.data;
                
                // 이미 불러온 다른 유형의 역/터미널이 있으면 유지
                stations = stations.filter(s => s.type !== type).concat(newStations);
                
                // 드롭다운 업데이트
                updateStationDropdowns();
                
                // 역/터미널 검색 (해당 유형만)
                searchStations();
                
                // 시간표 검색
                searchTimetables();
                
                // 다른 유형도 로드 (최초 로드 시에만)
                if (type === 'TRAIN' && !stations.some(s => s.type === 'BUS')) {
                    loadStationsForType('BUS');
                }
            } else {
                showToast(`${type === 'TRAIN' ? '기차역' : '버스터미널'} 데이터를 불러오는데 실패했습니다.`, true);
            }
        })
        .catch(error => {
            console.error(`Error loading ${type} stations:`, error);
            showToast(`${type === 'TRAIN' ? '기차역' : '버스터미널'} 데이터를 불러오는데 오류가 발생했습니다.`, true);
        });
}

// 교통 유형에 따라 출발지/도착지 드롭다운 업데이트
function updateStationDropdowns() {
    // 지정된 교통 유형에 맞는 역/터미널만 필터링
    const filteredStations = stations.filter(station => station.type === currentTransportType);
    
    // 검색 폼의 드롭다운 업데이트
    updateDropdown('departure-station', filteredStations, true);
    updateDropdown('arrival-station', filteredStations, true);
    
    // 모달의 드롭다운 업데이트
    updateDropdown('modal-departure-station', filteredStations, false);
    updateDropdown('modal-arrival-station', filteredStations, false);
    
    // 히든 필드 값 설정
    document.getElementById('transport-type').value = currentTransportType;
    document.getElementById('modal-transport-type').value = currentTransportType;
}

// 드롭다운 업데이트 헬퍼 함수
function updateDropdown(selectId, items, includeAll) {
    const select = document.getElementById(selectId);
    
    // 기존 옵션 초기화
    select.innerHTML = includeAll ? 
        '<option value="">전체</option>' : 
        '<option value="">선택하세요</option>';
    
    // 옵션 추가
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (${item.region})`;
        select.appendChild(option);
    });
}

// 메인 탭 전환 (시간표 관리 / 역/터미널 관리)
function switchMainTab(tabId) {
    // 모든 탭 내용 숨기기
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // 모든 메인 탭 버튼 비활성화
    document.querySelectorAll('.main-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택한 탭 내용 표시 및 버튼 활성화
    document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    document.querySelector(`.main-tabs .tab-btn[data-tab="${tabId}"]`).classList.add('active');
    
    // 탭에 따른 데이터 로드
    if (tabId === 'timetable') {
        searchTimetables();
    } else if (tabId === 'station') {
        searchStations();
    }
}

// 교통 유형 전환 (기차 / 버스)
function switchTransportType(transportType) {
    // 이전과 같은 유형이면 무시
    if (currentTransportType === transportType) return;
    
    // 현재 선택된 교통 유형 업데이트
    currentTransportType = transportType;
    
    // 해당 서브 탭 버튼 활성화
    document.querySelectorAll('.sub-tab-btn[data-transport-type]').forEach(btn => {
        if (btn.getAttribute('data-transport-type') === transportType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 드롭다운 업데이트
    updateStationDropdowns();
    
    // 시간표 검색
    currentPage = 1;
    searchTimetables();
}

// 역/터미널 유형 전환 (기차역 / 버스터미널)
function switchStationType(stationType) {
    // 이전과 같은 유형이면 무시
    if (currentStationType === stationType) return;
    
    // 현재 선택된 역/터미널 유형 업데이트
    currentStationType = stationType;
    
    // 해당 서브 탭 버튼 활성화
    document.querySelectorAll('.sub-tab-btn[data-station-type]').forEach(btn => {
        if (btn.getAttribute('data-station-type') === stationType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 히든 필드 값 설정
    document.getElementById('station-type').value = stationType;
    document.getElementById('modal-station-type').value = stationType;
    
    // 역/터미널 검색
    searchStations();
}

// 시간표 검색 함수
function searchTimetables() {
    // 검색 폼 데이터 가져오기
    const departureStationId = document.getElementById('departure-station').value || 0;
    const arrivalStationId = document.getElementById('arrival-station').value || 0;
    
    // 검색 파라미터 구성 - API 스펙에 맞게 필수 파라미터 전달
    const url = `${API.TIMETABLES}?transportType=${currentTransportType}&departureStationId=${departureStationId}&arrivalStationId=${arrivalStationId}`;
    
    // API 호출
    showToast('시간표를 검색중입니다...');
    fetchAPI(url)
        .then(data => {
            if (data && data.success) {
                timetables = data.data;
                updateTimetableTable(timetables);
                // 서버에서 페이지네이션 정보를 제공하지 않으므로 클라이언트에서 처리
                // updatePagination(Math.ceil(timetables.length / itemsPerPage));
            } else {
                showToast('시간표 검색에 실패했습니다.', true);
            }
        })
        .catch(error => {
            console.error('Error searching timetables:', error);
            showToast('시간표 검색 중 오류가 발생했습니다.', true);
        });
}

// 역/터미널 검색 함수
function searchStations() {
    // 현재 선택된 역 유형에 맞게 필터링
    let filteredStations = stations.filter(station => station.type === currentStationType);
    
    // 검색 폼에서 이름 및 지역 가져오기
    const name = document.getElementById('station-name').value;
    const region = document.getElementById('station-region').value;
    
    // 이름 필터링
    if (name) {
        filteredStations = filteredStations.filter(station => 
            station.name.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    // 지역 필터링
    if (region) {
        filteredStations = filteredStations.filter(station => 
            station.region.toLowerCase().includes(region.toLowerCase())
        );
    }
    
    updateStationTable(filteredStations);
}

// 시간표 테이블 업데이트
function updateTimetableTable(data) {
    const tableBody = document.querySelector('#timetable-table tbody');
    
    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    let html = '';
    
    data.forEach(item => {
        // 출발지, 도착지 이름 찾기
        const departureStation = stations.find(s => s.id === item.departureStationId);
        const arrivalStation = stations.find(s => s.id === item.arrivalStationId);
        
        html += `
            <tr>
                <td>${item.id}</td>
                <td>${item.transportType === 'TRAIN' ? '기차' : '버스'}</td>
                <td>${departureStation ? departureStation.name : '불명'}</td>
                <td>${arrivalStation ? arrivalStation.name : '불명'}</td>
                <td>${formatTime(item.departureTime)}</td>
                <td>${item.durationMin}분</td>
                <td>${item.price.toLocaleString()}원</td>
                <td>${item.transportNumber}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-primary btn-sm edit-btn" data-id="${item.id}">수정</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">삭제</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // 수정 버튼 이벤트 등록
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showTimetableModal('edit', id);
        });
    });
    
    // 삭제 버튼 이벤트 등록
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteTimetable(id);
        });
    });
}

// 역/터미널 테이블 업데이트
function updateStationTable(data) {
    const tableBody = document.querySelector('#station-table tbody');
    
    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    let html = '';
    
    data.forEach(item => {
        html += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.region}</td>
                <td>${item.type === 'TRAIN' ? '기차역' : '버스터미널'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-primary btn-sm edit-station-btn" data-id="${item.id}">수정</button>
                        <button class="btn btn-danger btn-sm delete-station-btn" data-id="${item.id}">삭제</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // 수정 버튼 이벤트 등록
    document.querySelectorAll('.edit-station-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showStationModal('edit', id);
        });
    });
    
    // 삭제 버튼 이벤트 등록
    document.querySelectorAll('.delete-station-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteStation(id);
        });
    });
}

// 시간표 모달 표시
function showTimetableModal(mode, id = null) {
    const modal = document.getElementById('timetable-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('timetable-form');
    
    // 모달 초기화
    form.reset();
    
    // 교통 유형 히든 필드 값 설정
    document.getElementById('modal-transport-type').value = currentTransportType;
    
    if (mode === 'add') {
        modalTitle.textContent = '시간표 추가';
        document.getElementById('timetable-id').value = '0';
        
        // 교통 유형에 따른 출발지/도착지 드롭다운 업데이트
        updateStationDropdowns();
    } else if (mode === 'edit') {
        modalTitle.textContent = '시간표 수정';
        
        // ID로 시간표 정보 가져오기
        fetchAPI(`${API.TIMETABLES}/${id}`)
            .then(response => {
                if (response && response.success) {
                    const timetable = response.data;
                    
                    // 수정하려는 시간표의 교통 유형이 현재 선택된 탭과 다르면 경고
                    if (timetable.transportType !== currentTransportType) {
                        showToast(`이 시간표는 ${timetable.transportType === 'TRAIN' ? '기차' : '버스'} 유형입니다. 해당 탭으로 이동합니다.`, true);
                        switchTransportType(timetable.transportType);
                    }
                    
                    document.getElementById('timetable-id').value = timetable.id;
                    document.getElementById('modal-transport-type').value = timetable.transportType;
                    
                    // 출발지/도착지 드롭다운 업데이트 후 값 설정
                    updateStationDropdowns();
                    document.getElementById('modal-departure-station').value = timetable.departureStationId;
                    document.getElementById('modal-arrival-station').value = timetable.arrivalStationId;
                    
                    // 시간 포맷팅 (HH:MM)
                    document.getElementById('modal-departure-time').value = formatTimeForInput(timetable.departureTime);
                    document.getElementById('modal-duration').value = timetable.durationMin;
                    document.getElementById('modal-price').value = timetable.price;
                    document.getElementById('modal-transport-number').value = timetable.transportNumber;
                } else {
                    showToast('시간표 정보를 불러오는데 실패했습니다.', true);
                    closeAllModals();
                }
            })
            .catch(error => {
                console.error('Error loading timetable:', error);
                showToast('시간표 정보를 불러오는데 오류가 발생했습니다.', true);
                closeAllModals();
            });
    }
    
    modal.classList.remove('hidden');
}

// 역/터미널 모달 표시
function showStationModal(mode, id = null) {
    const modal = document.getElementById('station-modal');
    const modalTitle = document.getElementById('station-modal-title');
    const form = document.getElementById('station-form');
    
    // 모달 초기화
    form.reset();
    
    // 역/터미널 유형 히든 필드 값 설정
    document.getElementById('modal-station-type').value = currentStationType;
    
    if (mode === 'add') {
        modalTitle.textContent = '역/터미널 추가';
        document.getElementById('station-id').value = '0';
    } else if (mode === 'edit') {
        modalTitle.textContent = '역/터미널 수정';
        
        // ID로 역/터미널 정보 가져오기
        const station = stations.find(s => s.id === parseInt(id));
        
        if (station) {
            // 수정하려는 역/터미널의 유형이 현재 선택된 탭과 다르면 경고
            if (station.type !== currentStationType) {
                showToast(`이 역/터미널은 ${station.type === 'TRAIN' ? '기차역' : '버스터미널'} 유형입니다. 해당 탭으로 이동합니다.`, true);
                switchStationType(station.type);
            }
            
            document.getElementById('station-id').value = station.id;
            document.getElementById('modal-station-name').value = station.name;
            document.getElementById('modal-station-region').value = station.region;
        }
    }
    
    modal.classList.remove('hidden');
}

// 모든 모달 닫기
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// 시간표 폼 제출 처리
function handleTimetableSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const id = parseInt(formData.get('id'));
    
    // JSON 데이터 구성
    const data = {
        transportType: formData.get('transportType'),
        departureStationId: parseInt(formData.get('departureStationId')),
        arrivalStationId: parseInt(formData.get('arrivalStationId')),
        departureTime: formData.get('departureTime'),
        durationMin: parseInt(formData.get('durationMin')),
        price: parseInt(formData.get('price')),
        transportNumber: formData.get('transportNumber')
    };
    
    // API 호출 (추가 또는 수정)
    const url = id === 0 ? API.TIMETABLES : `${API.TIMETABLES}/${id}`;
    const method = id === 0 ? 'POST' : 'PUT';
    
    fetchAPI(url, {
        method: method,
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response && response.success) {
                showToast(id === 0 ? '시간표가 추가되었습니다.' : '시간표가 수정되었습니다.');
                document.getElementById('timetable-modal').classList.add('hidden');
                searchTimetables();
            } else {
                showToast(response.msg || '처리 중 오류가 발생했습니다.', true);
            }
        })
        .catch(error => {
            console.error('Error submitting timetable:', error);
            showToast('요청 처리 중 오류가 발생했습니다.', true);
        });
}

// 역/터미널 폼 제출 처리
function handleStationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const id = parseInt(formData.get('id'));
    
    // JSON 데이터 구성
    const data = {
        type: formData.get('type'),
        name: formData.get('name'),
        region: formData.get('region')
    };
    
    // API 호출 (추가 또는 수정)
    const url = id === 0 ? API.STATIONS : `${API.STATIONS}/${id}`;
    const method = id === 0 ? 'POST' : 'PUT';
    
    fetchAPI(url, {
        method: method,
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response && response.success) {
                showToast(id === 0 ? '역/터미널이 추가되었습니다.' : '역/터미널이 수정되었습니다.');
                document.getElementById('station-modal').classList.add('hidden');
                // 역/터미널 데이터 다시 로드
                loadStationsForType(currentStationType);
            } else {
                showToast(response.msg || '처리 중 오류가 발생했습니다.', true);
            }
        })
        .catch(error => {
            console.error('Error submitting station:', error);
            showToast('요청 처리 중 오류가 발생했습니다.', true);
        });
}

// 시간표 삭제
function deleteTimetable(id) {
    if (!confirm('정말로 이 시간표를 삭제하시겠습니까?')) {
        return;
    }
    
    fetchAPI(`${API.TIMETABLES}/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response && response.success) {
                showToast('시간표가 삭제되었습니다.');
                searchTimetables();
            } else {
                showToast(response.msg || '삭제 중 오류가 발생했습니다.', true);
            }
        })
        .catch(error => {
            console.error('Error deleting timetable:', error);
            showToast('삭제 중 오류가 발생했습니다.', true);
        });
}

// 역/터미널 삭제
function deleteStation(id) {
    if (!confirm('정말로 이 역/터미널을 삭제하시겠습니까?')) {
        return;
    }
    
    fetchAPI(`${API.STATIONS}/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response && response.success) {
                showToast('역/터미널이 삭제되었습니다.');
                // 역/터미널 데이터 다시 로드
                loadStationsForType(currentStationType);
            } else {
                showToast(response.msg || '삭제 중 오류가 발생했습니다.', true);
            }
        })
        .catch(error => {
            console.error('Error deleting station:', error);
            showToast('삭제 중 오류가 발생했습니다.', true);
        });
}

// 시간 포맷팅 (HH:MM 형식으로)
function formatTime(timeString) {
    if (!timeString) return '';
    
    // HH:MM 또는 HH:MM:SS 형식 처리
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
}

// 시간 포맷팅 (input type="time"용)
function formatTimeForInput(timeString) {
    if (!timeString) return '';
    
    // HH:MM 또는 HH:MM:SS 형식 처리
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
}