document.addEventListener('DOMContentLoaded', function() {
    // 지역 select 채우기
    fetchRegions(regions => {
        const select = document.getElementById('regionId');
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region.id;
            option.text = region.name;
            select.appendChild(option);
        });
    });

    // 이미지 업로드 설정
    setupImageUpload();

    // 스팟 등록 submit 처리
    document.getElementById('spot-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        fetch(API.SPOT, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.msg || '등록 실패'); });
            }
            return response.json();
        })
        .then(data => {
            showToast('스팟 등록 성공');
            form.reset();
            document.getElementById('previewContainer').style.display = 'none';
            document.getElementById('imagePreview').src = '';
        })
        .catch(error => {
            console.error('스팟 등록 오류:', error);
            showToast(error.message || '스팟 등록 중 오류 발생', true);
        });
    });
});

// 이미지 업로드 기능 재사용
function setupImageUpload() {
    const dropArea = document.getElementById('imageDropArea');
    const fileInput = document.getElementById('image');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeButton = document.getElementById('removeImage');

    document.addEventListener('paste', function(e) {
        if (document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'text') {
            return;
        }
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                handleImageFile(blob);
                e.preventDefault();
                break;
            }
        }
    });

    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropArea.classList.add('active');
    });

    dropArea.addEventListener('dragleave', function() {
        dropArea.classList.remove('active');
    });

    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        dropArea.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                handleImageFile(file);
            } else {
                showToast('이미지 파일만 업로드 가능합니다', true);
            }
        }
    });

    dropArea.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleImageFile(this.files[0]);
        }
    });

    removeButton.addEventListener('click', function() {
        fileInput.value = '';
        previewContainer.style.display = 'none';
        imagePreview.src = '';
    });

    function handleImageFile(file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}