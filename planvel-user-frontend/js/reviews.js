window.addEventListener('DOMContentLoaded', function() {
    const regionSelect = document.getElementById('region-select');
    const regionDropdown = document.getElementById('region-dropdown');
    const reviewList = document.getElementById('review-list');
    const writeReviewBtn = document.getElementById('write-review-btn');
    const reviewModal = document.getElementById('review-modal');
    const reviewEditModal = document.getElementById('review-edit-modal');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const modalClose = document.getElementById('modal-close');
    const editModalClose = document.getElementById('edit-modal-close');
    const deleteModalClose = document.getElementById('delete-modal-close');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const reviewForm = document.getElementById('review-form');
    const reviewEditForm = document.getElementById('review-edit-form');
    const sortLatestBtn = document.getElementById('sort-latest');
    const sortPopularBtn = document.getElementById('sort-popular');
    
    // 전역 변수로 선택된 지역 ID와 이름을 저장
    let selectedRegionId = null;
    let selectedRegionName = '지역 선택 ▼';
    let isLoggedIn = false;
    let currentSortType = 'latest'; // 기본 정렬은 최신순
    let userName = ''; // 로그인한 사용자 이름

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
                } else {
                    document.getElementById('user-info').style.display = 'none';
                    document.getElementById('auth-buttons').style.display = 'flex';
                }
                
                // 리뷰 작성 버튼 상태 업데이트
                updateWriteReviewButton();
            })
            .catch(() => {
                isLoggedIn = false;
                document.getElementById('user-info').style.display = 'none';
                document.getElementById('auth-buttons').style.display = 'flex';
                updateWriteReviewButton();
            });
    }

    // 리뷰 작성 버튼 상태 업데이트
    function updateWriteReviewButton() {
        // 이전 이벤트 리스너 제거 (중복 방지)
        const oldClickHandler = writeReviewBtn.onclick;
        if (oldClickHandler) {
            writeReviewBtn.removeEventListener('click', oldClickHandler);
        }

        if (!isLoggedIn) {
            // 로그인하지 않은 경우 버튼 클릭 시 로그인 페이지로 이동하도록 설정
            writeReviewBtn.onclick = function() {
                alert('리뷰를 작성하려면 로그인이 필요합니다.');
                window.location.href = 'login.html';
            };
        } else if (!selectedRegionId) {
            // 지역이 선택되지 않은 경우
            writeReviewBtn.onclick = function() {
                alert('먼저 지역을 선택해주세요.');
            };
        } else {
            // 로그인 상태이고 지역이 선택된 경우 모달 열기
            writeReviewBtn.onclick = function() {
                // 모달 제목에 지역 이름 표시
                document.querySelector('.modal-title').innerText = `${selectedRegionName} 리뷰 작성하기`;
                reviewModal.style.display = 'flex';
            };
        }
    }

    // 지역 목록 불러오기
    function loadRegions() {
        fetchAPI(API.REGION_LIST)
            .then(data => {
                if (data.success && data.data) {
                    regionDropdown.innerHTML = '';
                    data.data.forEach(region => {
                        const item = document.createElement('div');
                        item.className = 'region-item';
                        item.innerText = region.name;
                        item.addEventListener('click', function() {
                            selectedRegionId = region.id;
                            selectedRegionName = region.name;
                            regionSelect.innerText = region.name + ' ▼';
                            regionDropdown.style.display = 'none';
                            
                            // 선택된 정렬 방식에 따라 리뷰 로드
                            loadReviewsBySortType();
                            
                            // 지역이 선택된 후 버튼 상태 업데이트
                            updateWriteReviewButton();
                        });
                        regionDropdown.appendChild(item);
                    });
                    regionDropdown.style.display = 'block';
                } else {
                    alert('지역 목록을 불러오지 못했습니다.');
                }
            })
            .catch(error => {
                console.error('지역 목록 로드 오류:', error);
                alert('지역 목록을 불러오는 중 오류가 발생했습니다.');
            });
    }

    // 정렬 방식에 따라 리뷰 로드
    function loadReviewsBySortType() {
        if (!selectedRegionId) {
            reviewList.innerHTML = '<div class="empty-msg">지역을 선택해주세요.</div>';
            return;
        }
        
        if (currentSortType === 'latest') {
            // 최신순 로드
            loadReviews(selectedRegionId, false);
        } else {
            // 인기순 로드
            loadReviews(selectedRegionId, true);
        }
    }

    // 날짜 포맷팅 함수
        function formatDate(date) {
            const now = new Date();

            // KST 기준으로 날짜 비교 (로컬타임 기준으로)
            const diffTime = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // 오늘 (시간 표기)
                const hours = date.getHours();
                const minutes = date.getMinutes();
                return `오늘 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            } else if (diffDays === 1) {
                return '어제';
            } else if (diffDays < 7) {
                return `${diffDays}일 전`;
            } else {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                return `${year}.${month}.${day}`;
            }
        }
    
    // 좋아요 버튼 클릭 처리
    function handleLikeClick(e) {
        e.preventDefault();
        
        if (!isLoggedIn) {
            alert('좋아요를 누르려면 로그인이 필요합니다.');
            return;
        }
        
        const button = e.currentTarget;
        const reviewId = button.dataset.reviewId;
        const isLiked = button.dataset.liked === 'true';
        const countElement = button.querySelector('.count');
        const iconElement = button.querySelector('.like-icon-emoji');
        
        // 현재 좋아요 수
        let currentCount = parseInt(countElement.textContent);
        
        // API 호출 URL과 메소드
        const apiUrl = `/api/review/${reviewId}/like`;
        const method = isLiked ? 'DELETE' : 'POST';
        
        // 버튼 비활성화 (중복 클릭 방지)
        button.disabled = true;
        
        // API 호출
        fetchAPI(apiUrl, { method })
            .then(data => {
                // 버튼 다시 활성화
                button.disabled = false;
                
                if (data.success) {
                    // 상태 토글
                    const newIsLiked = !isLiked;
                    button.dataset.liked = newIsLiked.toString();
                    
                    // UI 업데이트
                    if (newIsLiked) {
                        button.classList.add('active');
                        iconElement.textContent = '❤️';
                        
                        // 응답에서 좋아요 수를 가져오거나 없으면 1 증가
                        if (data.data && typeof data.data.likesCount !== 'undefined') {
                            countElement.textContent = data.data.likesCount;
                        } else {
                            countElement.textContent = currentCount + 1;
                        }
                    } else {
                        button.classList.remove('active');
                        iconElement.textContent = '♡';
                        
                        // 응답에서 좋아요 수를 가져오거나 없으면 1 감소
                        if (data.data && typeof data.data.likesCount !== 'undefined') {
                            countElement.textContent = data.data.likesCount;
                        } else {
                            countElement.textContent = Math.max(0, currentCount - 1);
                        }
                    }
                    
                    console.log('좋아요 ' + (newIsLiked ? '추가' : '취소') + ' 성공');
                    
                    // 인기순으로 정렬되어 있는 경우, 정렬 순서가 바뀔 수 있으므로 리스트 새로고침
                    if (currentSortType === 'popular') {
                        setTimeout(() => loadReviews(selectedRegionId, true), 500);
                    }
                } else {
                    alert(data.msg || '좋아요 처리 중 오류가 발생했습니다.');
                    console.error('좋아요 처리 오류:', data.msg);
                }
            })
            .catch(error => {
                // 버튼 다시 활성화
                button.disabled = false;
                console.error('좋아요 API 오류:', error);
                alert('좋아요 처리 중 오류가 발생했습니다.');
            });
    }

    // 리뷰 불러오기 (isPopular: true면 인기순, false면 최신순)
    function loadReviews(regionId, isPopular = false) {
        // 로딩 메시지 표시
        reviewList.innerHTML = '<div class="empty-msg">리뷰를 불러오는 중...</div>';
        
        // API URL 설정 (인기순 또는 최신순)
        const apiUrl = isPopular 
            ? `/api/review/region/${regionId}/popular` 
            : `/api/review/region/${regionId}`;
        
        fetchAPI(apiUrl)
            .then(data => {
                if (data.success && data.data && data.data.length > 0) {
                    reviewList.innerHTML = '';
                    data.data.forEach(review => {
                        // 날짜 포맷팅
                        const createdDate = new Date(review.createdAt);
                        const formattedDate = formatDate(createdDate);
                        
                        // 작성자 프로필 이미지 (기본 이미지 처리)
                        const profileImg = review.userProfileImg || 'images/noProfile.png';
                        
                        // 좋아요 상태 및 아이콘 설정
                        const isLiked = false; // 기본값은 좋아요 안 누른 상태
                        const likeIcon = isLiked ? '❤️' : '♡';
                        const likeClass = isLiked ? 'like-button active' : 'like-button';
                        
                        // 로그인한 사용자가 작성한 리뷰인지 확인
                        const isMyReview = isLoggedIn && userName === review.userName;
                        
                        // 수정/삭제 버튼 HTML (내 리뷰인 경우에만 표시)
                        const actionButtonsHtml = isMyReview 
                            ? `<div class="review-actions-menu">
                                <button class="review-action-btn edit" data-review-id="${review.id}">수정</button>
                                <button class="review-action-btn delete" data-review-id="${review.id}">삭제</button>
                              </div>` 
                            : '';
                        
                        const item = document.createElement('div');
                        item.className = 'review-item';
                        item.dataset.reviewId = review.id;
                        item.innerHTML = `
                            ${actionButtonsHtml}
                            <div class="review-header">
                                <h3 class="review-title">${review.title || review.region}</h3>
                                <span class="review-date">${formattedDate}</span>
                            </div>
                            <p class="review-content">${beautifyPlanLinks(review.content)}</p>
                            <div class="review-footer">
                                <div class="review-author">
                                    <img src="${profileImg}" alt="작성자 프로필" class="author-img">
                                    <span class="author-name">${review.userName || '익명'}</span>
                                </div>
                                <button class="${likeClass}" data-review-id="${review.id}" data-liked="${isLiked}">
                                    <span class="like-icon-emoji">${likeIcon}</span>
                                    <span class="count">${review.likesCount || 0}</span>
                                </button>
                            </div>
                        `;
                        reviewList.appendChild(item);
                        
                        // 좋아요 버튼에 이벤트 리스너 추가
                        const likeButton = item.querySelector('.like-button');
                        likeButton.addEventListener('click', handleLikeClick);
                        
                        // 내 리뷰인 경우 수정/삭제 버튼에 이벤트 리스너 추가
                        if (isMyReview) {
                            const editButton = item.querySelector('.review-action-btn.edit');
                            const deleteButton = item.querySelector('.review-action-btn.delete');
                            
                            editButton.addEventListener('click', function() {
                                openEditModal(review);
                            });
                            
                            deleteButton.addEventListener('click', function() {
                                openDeleteConfirmModal(review.id);
                            });
                        }
                    });
                } else {
                    reviewList.innerHTML = '<div class="empty-msg">리뷰가 없습니다. 첫 리뷰를 작성해보세요!</div>';
                }
            })
            .catch(error => {
                console.error('리뷰 로드 오류:', error);
                reviewList.innerHTML = '<div class="empty-msg">리뷰를 불러오는 중 오류가 발생했습니다.</div>';
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

        function beautifyPlanLinks(text) {
            const planLinkRegex = /http:\/\/localhost:8083\/plan\/([a-zA-Z0-9]+)/g;

            let match = planLinkRegex.exec(text);
            if (!match) return text;  // 없으면 원본 리턴

            // 링크 빼고 본문만 남기기
            const cleanedText = text.replace(planLinkRegex, '').trim();

            // 여행 계획 버튼으로 추가
            const linkHtml = `<a href="/plan/${match[1]}" target="_blank" class="plan-link-preview">여행 계획 보기</a>`;

            // 본문 + 미리보기 버튼
            return `${cleanedText}<div>${linkHtml}</div>`;
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
                
                // 리뷰 목록 새로고침 (현재 정렬 방식 유지)
                loadReviewsBySortType();
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
                
                // 리뷰 목록 새로고침 (현재 정렬 방식 유지)
                loadReviewsBySortType();
            } else {
                alert(data.msg || '리뷰 삭제에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('리뷰 삭제 오류:', error);
            alert('리뷰 삭제 중 오류가 발생했습니다.');
        });
    }

    // 리뷰 작성 제출
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const reviewTitle = document.getElementById('review-title').value;
        const reviewContent = document.getElementById('review-content').value;
        
        if (!selectedRegionId) {
            alert('지역을 선택한 후 리뷰를 작성해주세요.');
            return;
        }
        
        const reviewData = {
            regionId: selectedRegionId,
            title: reviewTitle,
            content: reviewContent
        };
        
        // API 요청
        fetchAPI('/api/review', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        })
        .then(data => {
            if (data.success) {
                alert('리뷰가 성공적으로 등록되었습니다.');
                
                // 모달 닫기 및 폼 초기화
                reviewModal.style.display = 'none';
                reviewForm.reset();
                
                // 리뷰 목록 새로고침 (현재 정렬 방식 유지)
                loadReviewsBySortType();
            } else {
                alert(data.msg || '리뷰 등록에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('리뷰 등록 오류:', error);
            alert('리뷰 등록 중 오류가 발생했습니다.');
        });
    });

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

    // 모달 닫기
    modalClose.addEventListener('click', function() {
        reviewModal.style.display = 'none';
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
    reviewModal.addEventListener('click', function(e) {
        if (e.target === reviewModal) {
            reviewModal.style.display = 'none';
        }
    });

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

    // 지역 선택 버튼 클릭 시
    regionSelect.addEventListener('click', function() {
        if (regionDropdown.style.display === 'block') {
            regionDropdown.style.display = 'none';
        } else {
            loadRegions();
        }
    });

    // 바깥 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (!regionSelect.contains(e.target) && !regionDropdown.contains(e.target)) {
            regionDropdown.style.display = 'none';
        }
    });

    // 정렬 버튼 클릭 이벤트 (최신순)
    sortLatestBtn.addEventListener('click', function() {
        if (currentSortType !== 'latest') {
            currentSortType = 'latest';
            
            // 버튼 활성화 상태 변경
            sortLatestBtn.classList.add('active');
            sortPopularBtn.classList.remove('active');
            
            // 지역이 선택된 경우에만 리로드
            if (selectedRegionId) {
                loadReviews(selectedRegionId, false);
            }
        }
    });

    // 정렬 버튼 클릭 이벤트 (인기순)
    sortPopularBtn.addEventListener('click', function() {
        if (currentSortType !== 'popular') {
            currentSortType = 'popular';
            
            // 버튼 활성화 상태 변경
            sortPopularBtn.classList.add('active');
            sortLatestBtn.classList.remove('active');
            
            // 지역이 선택된 경우에만 리로드
            if (selectedRegionId) {
                loadReviews(selectedRegionId, true);
            }
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
                        window.location.reload(); // 페이지 새로고침
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