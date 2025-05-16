// step2.js - 교통수단 선택 페이지
document.addEventListener('DOMContentLoaded', () => {
    // 로컬스토리지에서 여행 정보 가져오기
    const travelInfo = JSON.parse(localStorage.getItem('travelInfo')) || {};
    let departureBusStations = []; // 출발지 버스 정류장 목록
    let arrivalBusStations = []; // 도착지 버스 정류장 목록
    let departureTrainStations = []; // 출발지 기차역 목록
    let arrivalTrainStations = []; // 도착지 기차역 목록
    let selectedTransportType = 'BUS'; // 기본값 버스
    let selectedDepartureStation = null; // 선택된 출발 역
    let selectedArrivalStation = null; // 선택된 도착 역
    let timetableData = []; // 시간표 데이터

    // 정보 표시 요소들
    const departureDisplay = document.getElementById('departure-display');
    const arrivalDisplay = document.getElementById('arrival-display');
    const dateDisplay = document.getElementById('date-display');
    const transportDisplay = document.getElementById('transport-display');
    const departureStationDisplay = document.getElementById('departure-station-display');
    const arrivalStationDisplay = document.getElementById('arrival-station-display');
    const departureScheduleDisplay = document.getElementById('departure-schedule-display');
    const returnScheduleDisplay = document.getElementById('return-schedule-display');
    
    const busBtn = document.getElementById('busBtn');
    const trainBtn = document.getElementById('trainBtn');
    const nextButton = document.querySelector('.next');

    // 여행 정보 표시 및 검증
    if (travelInfo) {
        // 출발지 표시 (신규 형식 및 구 형식 모두 지원)
        if (travelInfo.departureName) {
            departureDisplay.textContent = travelInfo.departureName;
        } else if (travelInfo.departure && travelInfo.departure.name) {
            departureDisplay.textContent = travelInfo.departure.name;
        } else {
            departureDisplay.textContent = '출발지';
        }

        // 도착지 표시 (신규 형식 및 구 형식 모두 지원)
        if (travelInfo.arrivalName) {
            arrivalDisplay.textContent = travelInfo.arrivalName;
        } else if (travelInfo.arrival && travelInfo.arrival.name) {
            arrivalDisplay.textContent = travelInfo.arrival.name;
        } else {
            arrivalDisplay.textContent = '도착지';
        }

        // 날짜 형식 변환 및 표시
        if (travelInfo.startDate && travelInfo.endDate) {
            // 날짜 형식 변환 (YYYY-MM-DD → YYYY.MM.DD)
            const formatDateStr = (dateStr) => {
                const date = new Date(dateStr);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}.${month}.${day}`;
            };
            
            const formattedStartDate = formatDateStr(travelInfo.startDate);
            const formattedEndDate = formatDateStr(travelInfo.endDate);
            
            dateDisplay.textContent = `${formattedStartDate} ~ ${formattedEndDate}`;
        } else {
            dateDisplay.textContent = '-';
        }

        // 출발지/도착지 ID 확인
        const departureId = travelInfo.departureId || (travelInfo.departure && travelInfo.departure.id);
        const arrivalId = travelInfo.arrivalId || (travelInfo.arrival && travelInfo.arrival.id);

        if (departureId && arrivalId) {
            // 역 정보 로드
            loadStations(departureId, arrivalId);
        } else {
            showAlert('출발지와 도착지 정보가 없습니다.');
        }

        // 기존 선택 복원 (초기선택 없음 보장)
        busBtn.classList.remove('selected');
        trainBtn.classList.remove('selected');
        
        if (travelInfo.transport === '버스') {
            busBtn.classList.add('selected');
            selectedTransportType = 'BUS';
            transportDisplay.textContent = '버스';
        } else if (travelInfo.transport === '기차') {
            trainBtn.classList.add('selected');
            selectedTransportType = 'TRAIN';
            transportDisplay.textContent = '기차';
        } else {
            // 기본값으로 버스 선택
            busBtn.classList.add('selected');
            transportDisplay.textContent = '버스';
        }
        
        // 이미 선택된 역 정보 있으면 표시
        if (travelInfo.departureStation) {
            selectedDepartureStation = travelInfo.departureStation;
            departureStationDisplay.textContent = travelInfo.departureStation.name;
        }
        
        if (travelInfo.arrivalStation) {
            selectedArrivalStation = travelInfo.arrivalStation;
            arrivalStationDisplay.textContent = travelInfo.arrivalStation.name;
        }
        
        // 이미 선택된 시간표 정보 있으면 표시
        if (travelInfo.departureSchedule) {
            departureScheduleDisplay.textContent = `${travelInfo.departureSchedule.departureTime.substring(0, 5)} (${travelInfo.departureSchedule.transportNumber})`;
        }
        
        if (travelInfo.returnSchedule) {
            returnScheduleDisplay.textContent = `${travelInfo.returnSchedule.departureTime.substring(0, 5)} (${travelInfo.returnSchedule.transportNumber})`;
        }
    } else {
        showAlert('이전 스텝 정보를 먼저 입력하세요.');
        setTimeout(() => {
            window.location.href = 'travel-select.html';
        }, 1500);
    }

    // 역 정보 로드 함수
    function loadStations(departureRegionId, arrivalRegionId) {
        // 출발지 역 정보 로드
        fetch(`/api/timetable/stations/region/${departureRegionId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data) {
                    // 버스와 기차 역 분리
                    departureBusStations = data.data.filter(station => station.type === 'BUS');
                    departureTrainStations = data.data.filter(station => station.type === 'TRAIN');
                    
                    // 역 선택 UI 업데이트
                    updateStationSelectionUI();
                } else {
                    showAlert('출발지 역 정보를 불러오는데 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('출발지 역 정보 로드 오류:', error);
                showAlert('출발지 역 정보를 불러오는데 실패했습니다.');
                
                // 개발 중에는 더미 데이터로 테스트 (실제 배포 시 삭제)
                departureBusStations = [
                    { id: 1, name: '서울 고속터미널', type: 'BUS' },
                    { id: 2, name: '동서울터미널', type: 'BUS' },
                    { id: 3, name: '상봉터미널', type: 'BUS' }
                ];
                departureTrainStations = [
                    { id: 4, name: '서울역', type: 'TRAIN' },
                    { id: 5, name: '용산역', type: 'TRAIN' }
                ];
                updateStationSelectionUI();
            });

        // 도착지 역 정보 로드
        fetch(`/api/timetable/stations/region/${arrivalRegionId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data) {
                    // 버스와 기차 역 분리
                    arrivalBusStations = data.data.filter(station => station.type === 'BUS');
                    arrivalTrainStations = data.data.filter(station => station.type === 'TRAIN');
                    
                    // 역 선택 UI 업데이트
                    updateStationSelectionUI();
                } else {
                    showAlert('도착지 역 정보를 불러오는데 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('도착지 역 정보 로드 오류:', error);
                showAlert('도착지 역 정보를 불러오는데 실패했습니다.');
                
                // 개발 중에는 더미 데이터로 테스트 (실제 배포 시 삭제)
                arrivalBusStations = [
                    { id: 6, name: '부산종합터미널', type: 'BUS' },
                    { id: 7, name: '대전복합터미널', type: 'BUS' }
                ];
                arrivalTrainStations = [
                    { id: 8, name: '부산역', type: 'TRAIN' },
                    { id: 9, name: '대전역', type: 'TRAIN' }
                ];
                updateStationSelectionUI();
            });
            
        // 이미 선택된 역이 있고 유효한 경우, 시간표 로드
        if (selectedDepartureStation && selectedArrivalStation) {
            loadTimetable();
        }
    }

    // 역 선택 UI 업데이트 함수
    function updateStationSelectionUI() {
        // 현재 선택된 교통수단에 따라 역 목록 표시
        const departureStations = selectedTransportType === 'BUS' ? departureBusStations : departureTrainStations;
        const arrivalStations = selectedTransportType === 'BUS' ? arrivalBusStations : arrivalTrainStations;
        
        const departureStationSelect = document.getElementById('departure-station-select');
        const arrivalStationSelect = document.getElementById('arrival-station-select');
        
        if (departureStationSelect && arrivalStationSelect) {
            // 기존 옵션 제거
            departureStationSelect.innerHTML = '<option value="">출발 역 선택</option>';
            arrivalStationSelect.innerHTML = '<option value="">도착 역 선택</option>';
            
            // 출발 역 옵션 추가
            departureStations.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = station.name;
                departureStationSelect.appendChild(option);
                
                // 이전에 선택한 역이 있으면 선택 상태로 설정
                if (selectedDepartureStation && selectedDepartureStation.id === station.id) {
                    option.selected = true;
                }
            });
            
            // 도착 역 옵션 추가
            arrivalStations.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = station.name;
                arrivalStationSelect.appendChild(option);
                
                // 이전에 선택한 역이 있으면 선택 상태로 설정
                if (selectedArrivalStation && selectedArrivalStation.id === station.id) {
                    option.selected = true;
                }
            });
            
            // 역 선택 이벤트 추가
            departureStationSelect.addEventListener('change', function() {
                const selectedId = parseInt(this.value);
                if (selectedId) {
                    selectedDepartureStation = departureStations.find(s => s.id === selectedId);
                    
                    // 패널 정보 업데이트
                    if (selectedDepartureStation) {
                        departureStationDisplay.textContent = selectedDepartureStation.name;
                        
                        // 로컬 스토리지에 선택 정보 저장
                        travelInfo.departureStation = {
                            id: selectedDepartureStation.id,
                            name: selectedDepartureStation.name,
                            type: selectedDepartureStation.type
                        };
                        localStorage.setItem('travelInfo', JSON.stringify(travelInfo));
                    }
                    
                    if (selectedDepartureStation && selectedArrivalStation) {
                        loadTimetable();
                    }
                } else {
                    // 선택 취소 시
                    selectedDepartureStation = null;
                    departureStationDisplay.textContent = '-';
                    delete travelInfo.departureStation;
                    localStorage.setItem('travelInfo', JSON.stringify(travelInfo));
                }
            });
            
            arrivalStationSelect.addEventListener('change', function() {
                const selectedId = parseInt(this.value);
                if (selectedId) {
                    selectedArrivalStation = arrivalStations.find(s => s.id === selectedId);
                    
                    // 패널 정보 업데이트
                    if (selectedArrivalStation) {
                        arrivalStationDisplay.textContent = selectedArrivalStation.name;
                        
                        // 로컬 스토리지에 선택 정보 저장
                        travelInfo.arrivalStation = {
                            id: selectedArrivalStation.id,
                            name: selectedArrivalStation.name,
                            type: selectedArrivalStation.type
                        };
                        localStorage.setItem('travelInfo', JSON.stringify(travelInfo));
                    }
                    
                    if (selectedDepartureStation && selectedArrivalStation) {
                        loadTimetable();
                    }
                } else {
                    // 선택 취소 시
                    selectedArrivalStation = null;
                    arrivalStationDisplay.textContent = '-';
                    delete travelInfo.arrivalStation;
                    localStorage.setItem('travelInfo', JSON.stringify(travelInfo));
                }
            });
        }
    }

    // 시간표 로드 함수
    function loadTimetable() {
        if (!selectedDepartureStation || !selectedArrivalStation) {
            showAlert('출발역과 도착역을 모두 선택해주세요.');
            return;
        }
        
        // 시간표 API 호출
        fetch(`/api/timetable/round-trip?departureStationId=${selectedDepartureStation.id}&arrivalStationId=${selectedArrivalStation.id}&transportType=${selectedTransportType}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data) {
                    timetableData = data.data;
                    displayTimetable(timetableData);
                } else {
                    showAlert('시간표를 불러오는데 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('시간표 로드 오류:', error);
                showAlert('시간표를 불러오는데 실패했습니다.');
                
                // 개발 중에는 더미 데이터로 테스트 (실제 배포 시 삭제)
                const dummyTimetable = [];
                
                // 가는 편 더미 데이터
                for (let i = 0; i < 5; i++) {
                    const hour = 8 + Math.floor(i * 2);
                    const min = (i % 2) * 30;
                    dummyTimetable.push({
                        id: 100 + i,
                        departureStationName: selectedDepartureStation.name,
                        arrivalStationName: selectedArrivalStation.name,
                        departureTime: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
                        arrivalTime: `${(hour + 3).toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
                        transportNumber: `${selectedTransportType === 'BUS' ? '버스' : '열차'} ${100 + i}`,
                        durationMin: 180,
                        price: 15000 + i * 1000
                    });
                }
                
                // 오는 편 더미 데이터
                for (let i = 0; i < 5; i++) {
                    const hour = 9 + Math.floor(i * 2);
                    const min = ((i + 1) % 2) * 30;
                    dummyTimetable.push({
                        id: 200 + i,
                        departureStationName: selectedArrivalStation.name,
                        arrivalStationName: selectedDepartureStation.name,
                        departureTime: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
                        arrivalTime: `${(hour + 3).toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
                        transportNumber: `${selectedTransportType === 'BUS' ? '버스' : '열차'} ${200 + i}`,
                        durationMin: 180,
                        price: 15000 + i * 1000
                    });
                }
                
                timetableData = dummyTimetable;
                displayTimetable(timetableData);
            });
    }

    // 시간표 표시 함수
    function displayTimetable(timetableData) {
        const timetableContainer = document.getElementById('timetable-container');
        if (!timetableContainer) return;
        
        // 기존 시간표 제거
        timetableContainer.innerHTML = '';
        
        // 시간표 헤더
        const header = document.createElement('div');
        header.className = 'timetable-header';
        header.innerHTML = `
            <div class="time-col">출발 시각</div>
            <div class="transport-col">운행 정보</div>
            <div class="duration-col">소요 시간</div>
            <div class="price-col">가격</div>
            <div class="select-col">선택</div>
        `;
        timetableContainer.appendChild(header);
        
        // 출발 시간표 (가는 편)
        const departureTable = document.createElement('div');
        departureTable.className = 'timetable-section';
        
        const departureTitle = document.createElement('h3');
        departureTitle.textContent = '가는 편';
        departureTable.appendChild(departureTitle);
        
        // 출발지에서 도착지로 가는 시간표 필터링
        const departureSchedules = timetableData.filter(item => 
            item.departureStationName === selectedDepartureStation.name && 
            item.arrivalStationName === selectedArrivalStation.name
        );
        
        if (departureSchedules.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = '가는 편 시간표가 없습니다.';
            departureTable.appendChild(emptyMsg);
        } else {
            departureSchedules.forEach(schedule => {
                const item = document.createElement('div');
                item.className = 'timetable-item';
                
                // 이전에 선택한 시간표와 일치하면 선택된 상태로 표시
                if (travelInfo.departureSchedule && travelInfo.departureSchedule.id === schedule.id) {
                    item.classList.add('selected-schedule');
                }
                
                item.innerHTML = `
                    <div class="time-col">${schedule.departureTime.substring(0, 5)}</div>
                    <div class="transport-col">${schedule.transportNumber}</div>
                    <div class="duration-col">${Math.floor(schedule.durationMin / 60)}시간 ${schedule.durationMin % 60}분</div>
                    <div class="price-col">${schedule.price.toLocaleString()}원</div>
                    <div class="select-col">
                        <input type="radio" name="departure" value="${schedule.id}" data-schedule='${JSON.stringify(schedule)}'
                            ${travelInfo.departureSchedule && travelInfo.departureSchedule.id === schedule.id ? 'checked' : ''}>
                    </div>
                `;
                departureTable.appendChild(item);
            });
        }
        
        timetableContainer.appendChild(departureTable);
        
        // 귀환 시간표 (오는 편)
        const returnTable = document.createElement('div');
        returnTable.className = 'timetable-section';
        
        const returnTitle = document.createElement('h3');
        returnTitle.textContent = '오는 편';
        returnTable.appendChild(returnTitle);
        
        // 도착지에서 출발지로 오는 시간표 필터링
        const returnSchedules = timetableData.filter(item => 
            item.departureStationName === selectedArrivalStation.name && 
            item.arrivalStationName === selectedDepartureStation.name
        );
        
        if (returnSchedules.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = '오는 편 시간표가 없습니다.';
            returnTable.appendChild(emptyMsg);
        } else {
            returnSchedules.forEach(schedule => {
                const item = document.createElement('div');
                item.className = 'timetable-item';
                
                // 이전에 선택한 시간표와 일치하면 선택된 상태로 표시
                if (travelInfo.returnSchedule && travelInfo.returnSchedule.id === schedule.id) {
                    item.classList.add('selected-schedule');
                }
                
                item.innerHTML = `
                    <div class="time-col">${schedule.departureTime.substring(0, 5)}</div>
                    <div class="transport-col">${schedule.transportNumber}</div>
                    <div class="duration-col">${Math.floor(schedule.durationMin / 60)}시간 ${schedule.durationMin % 60}분</div>
                    <div class="price-col">${schedule.price.toLocaleString()}원</div>
                    <div class="select-col">
                        <input type="radio" name="return" value="${schedule.id}" data-schedule='${JSON.stringify(schedule)}'
                            ${travelInfo.returnSchedule && travelInfo.returnSchedule.id === schedule.id ? 'checked' : ''}>
                    </div>
                `;
                returnTable.appendChild(item);
            });
        }
        
        timetableContainer.appendChild(returnTable);
        
        // 라디오 버튼 이벤트 추가
        document.querySelectorAll('input[name="departure"], input[name="return"]').forEach(radio => {
            radio.addEventListener('change', function() {
                // 선택된 시간표 정보 저장
                const scheduleData = JSON.parse(this.dataset.schedule);
                
                if (this.name === 'departure') {
                    travelInfo.departureSchedule = scheduleData;
                    
                    // 선택된 아이템 스타일 변경
                    document.querySelectorAll('.timetable-item').forEach(item => {
                        if (item.querySelector('input[name="departure"]') === this) {
                            item.classList.add('selected-schedule');
                        } else if (item.querySelector('input[name="departure"]')) {
                            item.classList.remove('selected-schedule');
                        }
                    });
                    
                    // 패널 정보 업데이트
                    departureScheduleDisplay.textContent = `${scheduleData.departureTime.substring(0, 5)} (${scheduleData.transportNumber})`;
                } else {
                    travelInfo.returnSchedule = scheduleData;
                    
                    // 선택된 아이템 스타일 변경
                    document.querySelectorAll('.timetable-item').forEach(item => {
                        if (item.querySelector('input[name="return"]') === this) {
                            item.classList.add('selected-schedule');
                        } else if (item.querySelector('input[name="return"]')) {
                            item.classList.remove('selected-schedule');
                        }
                    });
                    
                    // 패널 정보 업데이트
                    returnScheduleDisplay.textContent = `${scheduleData.departureTime.substring(0, 5)} (${scheduleData.transportNumber})`;
                }
                
                // 로컬 스토리지에 선택 정보 저장
                localStorage.setItem('travelInfo', JSON.stringify(travelInfo));
            });
        });
    }

    // 버스 버튼 클릭 시
    busBtn.addEventListener('click', () => {
        if (selectedTransportType !== 'BUS') {
            busBtn.classList.add('selected');
            trainBtn.classList.remove('selected');
            selectedTransportType = 'BUS';
            
            // 패널 정보 업데이트
            transportDisplay.textContent = '버스';
            
            // 교통수단 정보 저장
            travelInfo.transport = '버스';
            localStorage.setItem('travelInfo', JSON.stringify(travelInfo));
            
            // 선택된 역 초기화
            selectedDepartureStation = null;
            selectedArrivalStation = null;
            departureStationDisplay.textContent = '-';
            arrivalStationDisplay.textContent = '-';
            departureScheduleDisplay.textContent = '-';
            returnScheduleDisplay.textContent = '-';
            
            // 시간표 선택 초기화
            delete travelInfo.departureStation;
            delete travelInfo.arrivalStation;
            delete travelInfo.departureSchedule;
            delete travelInfo.returnSchedule;
            localStorage.setItem('travelInfo', JSON.stringify(travelInfo));
            
            // 역 선택 UI 업데이트
            updateStationSelectionUI();
        }
    });

    // 기차 버튼 클릭 시
    trainBtn.addEventListener('click', () => {
        if (selectedTransportType !== 'TRAIN') {
            trainBtn.classList.add('selected');
            busBtn.classList.remove('selected');
            selectedTransportType = 'TRAIN';
            
            // 패널 정보 업데이트
            transportDisplay.textContent = '기차';
            
            // 교통수단 정보 저장
            travelInfo.transport = '기차';
            localStorage.setItem('travelInfo', JSON.stringify(travelInfo));
            
            // 선택된 역 초기화
            selectedDepartureStation = null;
            selectedArrivalStation = null;
            departureStationDisplay.textContent = '-';
            arrivalStationDisplay.textContent = '-';
            departureScheduleDisplay.textContent = '-';
            returnScheduleDisplay.textContent = '-';
            
            // 시간표 선택 초기화
            delete travelInfo.departureStation;
            delete travelInfo.arrivalStation;
            delete travelInfo.departureSchedule;
            delete travelInfo.returnSchedule;
            localStorage.setItem('travelInfo', JSON.stringify(travelInfo));
            
            // 역 선택 UI 업데이트
            updateStationSelectionUI();
        }
    });

    // 다음 버튼 클릭 시
    nextButton.addEventListener('click', function (e) {
        e.preventDefault();

        // 교통수단과 역, 시간표가 선택되었는지 확인
        if (!selectedTransportType) {
            showAlert('이동수단을 선택해주세요.');
            return;
        }
        
        if (!selectedDepartureStation || !selectedArrivalStation) {
            showAlert('출발역과 도착역을 선택해주세요.');
            return;
        }
        
        if (!travelInfo.departureSchedule || !travelInfo.returnSchedule) {
            showAlert('가는 편과 오는 편 시간표를 모두 선택해주세요.');
            return;
        }

        // 이미 로컬 스토리지에 저장됨 (선택 시점마다 저장)
        
        // 다음 페이지로 이동
        window.location.href = 'accommodation-select.html';
    });

    // 공통 showAlert 함수
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
});