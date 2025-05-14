// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // URL에서 숙소 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        loadAccommodationDetail(id);
    } else {
        document.getElementById('accommodationDetail').innerHTML = '<p>숙소 ID가 없습니다.</p>';
    }
});

// 숙소 상세 정보 로드 함수
function loadAccommodationDetail(id) {
    fetch(`/admin-api/accommodation/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const acc = data.data;
                const detailDiv = document.getElementById('accommodationDetail');
                
                // 이미지 URL (원본 이미지 사용)
                const imageUrl = acc.imageUrl;
                
                detailDiv.innerHTML = `
                    <h3>${acc.name}</h3>
                    <p><strong>지역 ID:</strong> ${acc.regionId}</p>
                    <p><strong>주소:</strong> ${acc.address}</p>
                    <p><strong>1박 가격:</strong> ${acc.pricePerNight}원</p>
                    <p><strong>타입:</strong> ${acc.type}</p>
                    <div>
                        <img src="${imageUrl}" alt="${acc.name}" style="max-width: 500px;">
                    </div>
                `;
            } else {
                document.getElementById('accommodationDetail').innerHTML = '<p>데이터를 불러오는데 실패했습니다.</p>';
            }
        })
        .catch(error => {
            console.error('상세 정보 로드 오류:', error);
            document.getElementById('accommodationDetail').innerHTML = '<p>오류가 발생했습니다.</p>';
        });
}