// DOM이 준비되면 실행
document.addEventListener('DOMContentLoaded', function() {
    // 지역 select 채우기
    fetchRegions(regions => {
        const select = document.getElementById('regionSelect');
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region.id;
            option.text = region.name;
            select.appendChild(option);
        });
    });

    // 조회 버튼 클릭 이벤트 등록
    document.getElementById('loadBtn').addEventListener('click', () => {
        const regionId = document.getElementById('regionSelect').value;
        if (!regionId) {
            alert('지역을 선택하세요.');
            return;
        }

        fetchAPI(`/admin-api/accommodation/region/${regionId}`)
            .then(data => {
                if (!data || !data.success) {
                    alert(data?.msg || '조회 실패');
                    return;
                }
                
                const listDiv = document.getElementById('accommodationList');
                listDiv.innerHTML = '';
                
                if (!data.data || data.data.length === 0) {
                    listDiv.innerHTML = '<p>조회된 숙소가 없습니다.</p>';
                    return;
                }
                
                data.data.forEach(acc => {
                    const div = document.createElement('div');
                    div.className = 'accommodation-item';
                    
                    const imageUrl = acc.thumbnailUrl || acc.imageUrl;
                    
                    div.innerHTML = `
                        <h4>${acc.name}</h4>
                        <p>주소: ${acc.address}</p>
                        <p>1박 가격: ${acc.pricePerNight}</p>
                        <p>호텔 여부: ${acc.isHotel ? '호텔' : '기타'}</p>
                        <img src="${imageUrl}" width="200">
                        <button onclick="viewDetail(${acc.id})">상세보기</button>
                        <hr>
                    `;
                    listDiv.appendChild(div);
                });
            })
            .catch(error => {
                console.error('조회 중 오류 발생:', error);
                alert('조회 중 오류가 발생했습니다.');
            });
    });
});

// 상세보기 함수 추가
function viewDetail(id) {
    window.location.href = `accommodation-detail.html?id=${id}`;
}