document.addEventListener('DOMContentLoaded', function () {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const departureSelect = document.getElementById('departure-select');
    const arrivalSelect = document.getElementById('arrival-select');
    const departureDropdown = document.getElementById('departure-dropdown');
    const arrivalDropdown = document.getElementById('arrival-dropdown');
    const locationWarning = document.getElementById('location-warning');
    const nextButton = document.getElementById('next-button');

    // 전역 변수
    let regions = []; // 지역 데이터 저장
    let selectedDeparture = null;
    let selectedArrival = null;

    // 지역 데이터 로드
    loadRegions();

    // 오늘 날짜 설정
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    endDateInput.min = today;

    // ✅ 시작일 선택 시 종료일 제한 설정
    startDateInput.addEventListener('change', function () {
        const startDate = new Date(startDateInput.value);

        if (!startDateInput.value) return;

        // 최소 1박 2일 (다음 날)
        const minEndDate = new Date(startDate);
        minEndDate.setDate(minEndDate.getDate() + 1);
        endDateInput.min = minEndDate.toISOString().split('T')[0];

        // 최대 10박 11일 (10일 후)
        const maxEndDate = new Date(startDate);
        maxEndDate.setDate(maxEndDate.getDate() + 10);
        endDateInput.max = maxEndDate.toISOString().split('T')[0];

        // 기존 선택 초기화 (실수 방지)
        endDateInput.value = '';
    });

    // 출발지 클릭 이벤트
    departureSelect.addEventListener('click', function () {
        if (departureDropdown.style.display === 'block') {
            departureDropdown.style.display = 'none';
        } else {
            departureDropdown.style.display = 'block';
            arrivalDropdown.style.display = 'none'; // 도착지 드롭다운 닫기
        }
    });

    // 도착지 클릭 이벤트
    arrivalSelect.addEventListener('click', function () {
        if (arrivalDropdown.style.display === 'block') {
            arrivalDropdown.style.display = 'none';
        } else {
            arrivalDropdown.style.display = 'block';
            departureDropdown.style.display = 'none'; // 출발지 드롭다운 닫기
        }
    });

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function (e) {
        if (!departureSelect.contains(e.target) && !departureDropdown.contains(e.target)) {
            departureDropdown.style.display = 'none';
        }
        
        if (!arrivalSelect.contains(e.target) && !arrivalDropdown.contains(e.target)) {
            arrivalDropdown.style.display = 'none';
        }
    });

    // 지역 데이터 로드 함수
    function loadRegions() {
        // 로딩 표시
        departureDropdown.innerHTML = '<div class="location-loading"><div class="loading-spinner"></div></div>';
        arrivalDropdown.innerHTML = '<div class="location-loading"><div class="loading-spinner"></div></div>';
        
        // 지역 API 호출
        fetch('/api/regions')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data) {
                    regions = data.data;
                    populateDropdowns();
                } else {
                    showAlert('지역 정보를 불러오는데 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('지역 데이터 로드 오류:', error);
                showAlert('지역 정보를 불러오는데 실패했습니다.');
            });
    }

    // 드롭다운 메뉴 채우기
    function populateDropdowns() {
        departureDropdown.innerHTML = '';
        arrivalDropdown.innerHTML = '';
        
        regions.forEach(region => {
            // 출발지 드롭다운 아이템
            const departureItem = document.createElement('div');
            departureItem.className = 'location-dropdown-item';
            departureItem.textContent = region.name;
            departureItem.dataset.id = region.id;
            departureItem.addEventListener('click', function() {
                selectDeparture(region);
            });
            departureDropdown.appendChild(departureItem);
            
            // 도착지 드롭다운 아이템
            const arrivalItem = document.createElement('div');
            arrivalItem.className = 'location-dropdown-item';
            arrivalItem.textContent = region.name;
            arrivalItem.dataset.id = region.id;
            arrivalItem.addEventListener('click', function() {
                selectArrival(region);
            });
            arrivalDropdown.appendChild(arrivalItem);
        });
    }

    // 출발지 선택 함수
    function selectDeparture(region) {
        selectedDeparture = region;
        departureSelect.textContent = region.name;
        departureDropdown.style.display = 'none';
        
        // 출발지와 도착지 비교
        checkSameLocations();
    }

    // 도착지 선택 함수
    function selectArrival(region) {
        selectedArrival = region;
        arrivalSelect.textContent = region.name;
        arrivalDropdown.style.display = 'none';
        
        // 출발지와 도착지 비교
        checkSameLocations();
    }

    // 출발지와 도착지가 같은지 확인
    function checkSameLocations() {
        if (selectedDeparture && selectedArrival) {
            if (selectedDeparture.id === selectedArrival.id) {
                locationWarning.classList.add('show');
                return true;
            } else {
                locationWarning.classList.remove('show');
                return false;
            }
        }
        return false;
    }

    // 다음 버튼 클릭
    nextButton.addEventListener('click', function (e) {
        e.preventDefault();

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        // 모든 필드 입력 확인
        if (!selectedDeparture || !selectedArrival || !startDate || !endDate) {
            showAlert('출발지, 도착지, 날짜를 모두 입력해주세요.');
            return;
        }

        // 출발지와 도착지가 같은지 확인
        if (checkSameLocations()) {
            showAlert('출발지와 도착지가 같을 수 없습니다.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = (end - start) / (1000 * 60 * 60 * 24);

        if (start >= end) {
            showAlert('시작일은 종료일보다 빨라야 합니다.');
            return;
        }

        if (diffDays < 1) {
            showAlert('최소 1박 2일 이상 선택해주세요.');
            return;
        }

        if (diffDays > 10) {
            showAlert('최대 10박 11일 이내로 선택해주세요.');
            return;
        }

        // 여행 정보 저장
        const travelData = {
            startDate,
            endDate,
            departureId: selectedDeparture.id,
            departureName: selectedDeparture.name,
            arrivalId: selectedArrival.id,
            arrivalName: selectedArrival.name
        };

        localStorage.setItem('travelInfo', JSON.stringify(travelData));
        window.location.href = 'transport-select.html';
    });

    // 공통 showAlert
    function showAlert(message) {
        let alertBanner = document.getElementById('alert-banner');
        if (!alertBanner) {
            alertBanner = document.createElement('div');
            alertBanner.id = 'alert-banner';
            alertBanner.className = 'alert-banner';
            document.body.appendChild(alertBanner);
        }
        alertBanner.textContent = message;
        alertBanner.classList.add('show');

        setTimeout(() => {
            alertBanner.classList.remove('show');
        }, 2000);
    }

// 로컬 스토리지에서 기존 데이터 복원
function restoreFromLocalStorage() {
    const savedData = localStorage.getItem('travelInfo');
    if (savedData) {
        try {
            const travelInfo = JSON.parse(savedData);
            
            // 날짜 복원
            if (travelInfo.startDate) startDateInput.value = travelInfo.startDate;
            if (travelInfo.endDate) endDateInput.value = travelInfo.endDate;
            
            // 지역 데이터가 로드된 후에 출발지/도착지 복원
            if (regions.length > 0) {
                // 신규 형식 확인 (개별 필드)
                if (travelInfo.departureId !== undefined && travelInfo.departureName) {
                    const departureRegion = regions.find(r => r.id === travelInfo.departureId);
                    if (departureRegion) {
                        selectDeparture(departureRegion);
                    } else {
                        // 지역 데이터에 없는 경우 임시 객체 생성
                        selectDeparture({
                            id: travelInfo.departureId,
                            name: travelInfo.departureName
                        });
                    }
                } 
                // 구 형식 호환성 유지 (객체 형식)
                else if (travelInfo.departure && travelInfo.departure.id) {
                    const departureRegion = regions.find(r => r.id === travelInfo.departure.id);
                    if (departureRegion) selectDeparture(departureRegion);
                }
                
                // 신규 형식 확인 (개별 필드)
                if (travelInfo.arrivalId !== undefined && travelInfo.arrivalName) {
                    const arrivalRegion = regions.find(r => r.id === travelInfo.arrivalId);
                    if (arrivalRegion) {
                        selectArrival(arrivalRegion);
                    } else {
                        // 지역 데이터에 없는 경우 임시 객체 생성
                        selectArrival({
                            id: travelInfo.arrivalId,
                            name: travelInfo.arrivalName
                        });
                    }
                }
                // 구 형식 호환성 유지 (객체 형식)
                else if (travelInfo.arrival && travelInfo.arrival.id) {
                    const arrivalRegion = regions.find(r => r.id === travelInfo.arrival.id);
                    if (arrivalRegion) selectArrival(arrivalRegion);
                }
            }
        } catch (e) {
            console.error('저장된 데이터 복원 오류:', e);
        }
    }
}

    // 지역 데이터 로드 완료 후 저장된 데이터 복원
    document.addEventListener('regionsLoaded', restoreFromLocalStorage);
});