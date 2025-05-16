window.addEventListener('DOMContentLoaded', function() {
    const reviewList = document.getElementById('review-list');
    const reviewEditModal = document.getElementById('review-edit-modal');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const editModalClose = document.getElementById('edit-modal-close');
    const deleteModalClose = document.getElementById('delete-modal-close');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const reviewEditForm = document.getElementById('review-edit-form');
    const sortLatestBtn = document.getElementById('sort-latest');
    const sortPopularBtn = document.getElementById('sort-popular');
    
    // 전역 변수
    let isLoggedIn = false;
    let userName = ''; // 로그인한 사용자 이름
    let currentSortType = 'latest'; // 기본 정렬은 최신순
    let myReviews = []; // 내 리뷰 목록을 저장하는 배열

    // 로그인 상태 확인
    function checkLoginStatus() {
        fetchAPI(API.PROFILE)
            .then(data => {
                isLoggedIn = data.success;
                
                // 로그인 상태에 따른 UI 업데이트
                if (isLoggedIn) {
                    document.getElementById('auth-buttons').style.display = 'none';
                    document.getElementById('user-info').style.display = 'flex';
                    userName = data.data.name; // 사용자 이름 저장
                    document.getElementById('username').innerText = `${userName}님`;
                    
                    // 프로필 이미지 설정 (있는 경우에만)
                    if (data.data.profileImg) {
                        document.querySelector('#user-info .profile-img').src = data.data.profileImg;
                    }
                    
                    // 내 리뷰 로드
                    loadMyReviews();
                } else {
                    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
                    alert('로그인이 필요한 페이지입니다.');
                    window.location.href = 'login.html';
                }
            })
            .catch(() => {
                // 오류 발생 시 로그인 페이지로 리다이렉트
                alert('로그인이 필요한 페이지입니다.');
                window.location.href = 'login.html';
            });
    }

    // 내 리뷰 불러오기
    function loadMyReviews() {
        // 로딩 메시지 표시
        reviewList.innerHTML = '<div class="empty-msg">리뷰를 불러오는 중...</div>';
        
        // API 호출
        fetchAPI('/api/review/my')
            .then(data => {
                if (data.success && data.data && data.data.length > 0) {
                    myReviews = data.data; // 전역 변수에 내 리뷰 저장
                    
                    // 현재 정렬 방식에 따라 리뷰 정렬 및 표시
                    if (currentSortType === 'latest') {
                        sortByLatest();
                    } else {
                        sortByPopular();
                    }
                } else {
                    // 리뷰가 없는 경우 빈 상태 표시
                    showEmptyState();
                }
            })
            .catch(error => {
                console.error('리뷰 로드 오류:', error);
                reviewList.innerHTML = '<div class="empty-msg">리뷰를 불러오는 중 오류가 발생했습니다.</div>';
            });
    }

    // 빈 상태 표시
    function showEmptyState() {
        reviewList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">아직 작성한 리뷰가 없습니다.</div>
                <a href="region-reviews.html" class="go-explore-btn">리뷰 작성하러 가기</a>
            </div>
        `;
    }

    // 날짜 포맷팅 함수
    function formatDate(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // 오늘
            const hours = date.getHours();
            const minutes = date.getMinutes();
            return `오늘 ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
        } else if (diffDays === 1) {
            // 어제
            return '어제';
        } else if (diffDays < 7) {
            // 일주일 이내
            return `${diffDays}일 전`;
        } else {
            // 일주일 이상
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}.${month < 10 ? '0' + month : month}.${day < 10 ? '0' + day : day}`;
        }
    }
    
    // 최신순 정렬
    function sortByLatest() {
        // 날짜순으로 정렬 (최신이 먼저)
        const sortedReviews = [...myReviews].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // 정렬된 리뷰 표시
        displayReviews(sortedReviews);
    }
    
    // 인기순 정렬
    function sortByPopular() {
        // 좋아요 수로 정렬 (많은 순)
        const sortedReviews = [...myReviews].sort((a, b) => {
            return (b.likesCount || 0) - (a.likesCount || 0);
        });
        
        // 정렬된 리뷰 표시
        displayReviews(sortedReviews);
    }
    
    // 리뷰 표시
    function displayReviews(reviews) {
        reviewList.innerHTML = '';
        
        reviews.forEach(review => {
            // 날짜 포맷팅
            const createdDate = new Date(review.createdAt);
            const formattedDate = formatDate(createdDate);
            
            // 작성자 프로필 이미지 (기본 이미지 처리)
            const profileImg = review.userProfileImg || 'images/noProfile.png';
            
            // 좋아요 상태 및 아이콘 설정
            const isLiked = false; // 기본값은 좋아요 안 누른 상태
            const likeIcon = isLiked ? '❤️' : '♡';
            const likeClass = isLiked ? 'like-button active' : 'like-button';
            
            const item = document.createElement('div');
            item.className = 'review-item';
            item.dataset.reviewId = review.id;
            item.innerHTML = `
                <div class="review-actions-menu">
                    <button class="review-action-btn edit" data-review-id="${review.id}">수정</button>
                    <button class="review-action-btn delete" data-review-id="${review.id}">삭제</button>
                </div>
                <span class="region-tag">${review.region}</span>
                <div class="review-header">
                    <h3 class="review-title">${review.title || review.region}</h3>
                    <span class="review-date">${formattedDate}</span>
                </div>
                <p class="review-content">${review.content}</p>
                <div class="review-footer">
                    <div class="review-author">
                        <img src="${profileImg}" alt="프로필" class="author-img">
                        <span class="author-name">${review.userName || '익명'}</span>
                    </div>
                    <div class="like-button" data-review-id="${review.id}" data-liked="${isLiked}">
                        <span class="like-icon-emoji">${likeIcon}</span>
                        <span class="count">${review.likesCount || 0}</span>
                    </div>
                </div>
            `;
            reviewList.appendChild(item);
            
            // 수정/삭제 버튼에 이벤트 리스너 추가
            const editButton = item.querySelector('.review-action-btn.edit');
            const deleteButton = item.querySelector('.review-action-btn.delete');
            
            editButton.addEventListener('click', function() {
                openEditModal(review);
            });
            
            deleteButton.addEventListener('click', function() {
                openDeleteConfirmModal(review.id);
            });
        });
    }

    // 리뷰 수정 모달 열기
    function openEditModal(review) {
        // 모달 폼에 리뷰 정보 채우기
        document.getElementById('edit-review-id').value = review.id;
        document.getElementById('edit-review-title').value = review.title || '';
        document.getElementById('edit-review-content').value = review.content || '';
        
        // 모달 제목 설정
        document.querySelector('#review-edit-modal .modal-title').innerText = '리뷰 수정하기';
        
        // 모달 표시
        document.getElementById('review-edit-modal').style.display = 'flex';
    }

    // 리뷰 삭제 확인 모달 열기
    function openDeleteConfirmModal(reviewId) {
        // 삭제할 리뷰 ID 기억
        document.getElementById('confirm-delete-btn').dataset.reviewId = reviewId;
        
        // 모달 표시
        document.getElementById('delete-confirm-modal').style.display = 'flex';
    }

    // 리뷰 수정 함수
    function updateReview(reviewId, title, content) {
        // API 요청 데이터
        const updateData = {
            title: title,
            content: content
        };
        
        // API 호출
        fetchAPI(`/api/review/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        })
        .then(data => {
            if (data.success) {
                alert('리뷰가 성공적으로 수정되었습니다.');
                
                // 모달 닫기
                document.getElementById('review-edit-modal').style.display = 'none';
                
                // 리뷰 목록 새로고침
                loadMyReviews();
            } else {
                alert(data.msg || '리뷰 수정에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('리뷰 수정 오류:', error);
            alert('리뷰 수정 중 오류가 발생했습니다.');
        });
    }

    // 리뷰 삭제 함수
    function deleteReview(reviewId) {
        // API 호출
        fetchAPI(`/api/review/${reviewId}`, {
            method: 'DELETE'
        })
        .then(data => {
            if (data.success) {
                alert('리뷰가 성공적으로 삭제되었습니다.');
                
                // 모달 닫기
                document.getElementById('delete-confirm-modal').style.display = 'none';
                
                // 리뷰 목록 새로고침
                loadMyReviews();
            } else {
                alert(data.msg || '리뷰 삭제에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('리뷰 삭제 오류:', error);
            alert('리뷰 삭제 중 오류가 발생했습니다.');
        });
    }

    // 리뷰 수정 제출
    reviewEditForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const reviewId = document.getElementById('edit-review-id').value;
        const reviewTitle = document.getElementById('edit-review-title').value;
        const reviewContent = document.getElementById('edit-review-content').value;
        
        // 리뷰 수정 함수 호출
        updateReview(reviewId, reviewTitle, reviewContent);
    });

    // 리뷰 삭제 확인 버튼 클릭
    confirmDeleteBtn.addEventListener('click', function() {
        const reviewId = this.dataset.reviewId;
        
        // 리뷰 삭제 함수 호출
        deleteReview(reviewId);
    });

    // 수정 모달 닫기
    editModalClose.addEventListener('click', function() {
        reviewEditModal.style.display = 'none';
    });

    // 삭제 확인 모달 닫기
    deleteModalClose.addEventListener('click', function() {
        deleteConfirmModal.style.display = 'none';
    });

    // 삭제 취소 버튼 클릭
    cancelDeleteBtn.addEventListener('click', function() {
        deleteConfirmModal.style.display = 'none';
    });

    // 모달 외부 클릭 시 닫기
    reviewEditModal.addEventListener('click', function(e) {
        if (e.target === reviewEditModal) {
            reviewEditModal.style.display = 'none';
        }
    });

    deleteConfirmModal.addEventListener('click', function(e) {
        if (e.target === deleteConfirmModal) {
            deleteConfirmModal.style.display = 'none';
        }
    });

    // 정렬 버튼 클릭 이벤트 (최신순)
    sortLatestBtn.addEventListener('click', function() {
        if (currentSortType !== 'latest') {
            currentSortType = 'latest';
            
            // 버튼 활성화 상태 변경
            sortLatestBtn.classList.add('active');
            sortPopularBtn.classList.remove('active');
            
            // 최신순으로 정렬
            sortByLatest();
        }
    });

    // 정렬 버튼 클릭 이벤트 (인기순)
    sortPopularBtn.addEventListener('click', function() {
        if (currentSortType !== 'popular') {
            currentSortType = 'popular';
            
            // 버튼 활성화 상태 변경
            sortPopularBtn.classList.add('active');
            sortLatestBtn.classList.remove('active');
            
            // 인기순으로 정렬
            sortByPopular();
        }
    });

    // 로그아웃 버튼 이벤트 핸들러
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // 이벤트 버블링 방지
            
            fetchAPI(API.LOGOUT, { method: 'POST' })
                .then(data => {
                    if (data.success) {
                        alert('로그아웃 되었습니다.');
                        window.location.href = 'index.html'; // 메인 페이지로 리다이렉트
                    } else {
                        alert(data.msg || '로그아웃 실패');
                    }
                })
                .catch(() => alert('로그아웃 중 오류 발생'));
        });
    }

    // 팝업 메뉴 토글 이벤트 추가
    const userInfo = document.getElementById('user-info');
    const popupMenu = document.getElementById('popupMenu');

    if (userInfo && popupMenu) {
        userInfo.addEventListener('click', function (e) {
            e.stopPropagation(); // 이벤트 버블링 방지
            popupMenu.style.display = popupMenu.style.display === 'block' ? 'none' : 'block';
        });

        // 문서 클릭 시 팝업 닫기
        document.addEventListener('click', function () {
            popupMenu.style.display = 'none';
        });
    }

    // 초기화 함수 실행
    checkLoginStatus();
});