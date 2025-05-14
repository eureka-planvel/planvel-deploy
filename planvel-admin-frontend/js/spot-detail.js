document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        loadSpotDetail(id);
    } else {
        document.getElementById('spotDetail').innerHTML = '<p>스팟 ID가 없습니다.</p>';
    }
});

function loadSpotDetail(id) {
    fetch(`/admin-api/spot/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const spot = data.data;
                const detailDiv = document.getElementById('spotDetail');
                
                const imageUrl = spot.imageUrl;
                
                detailDiv.innerHTML = `
                    <h3>${spot.spotName}</h3>
                    <p><strong>지역 ID:</strong> ${spot.regionId}</p>
                    <p><strong>주소:</strong> ${spot.address}</p>
                    <p><strong>유형:</strong> ${spot.type}</p>
                    <div>
                        <img src="${imageUrl}" alt="${spot.spotName}" style="max-width: 500px;">
                    </div>
                `;
            } else {
                document.getElementById('spotDetail').innerHTML = '<p>데이터를 불러오는데 실패했습니다.</p>';
            }
        })
        .catch(error => {
            console.error('상세 정보 로드 오류:', error);
            document.getElementById('spotDetail').innerHTML = '<p>오류가 발생했습니다.</p>';
        });
}