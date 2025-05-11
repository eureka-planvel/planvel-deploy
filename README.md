# planvel-deploy

**PLANVEL** 프로젝트의 전체 서비스 구성을 위한 Docker Compose 기반 배포 리포지토리입니다.  
프론트엔드, 백엔드, 프록시(Nginx), 데이터베이스(MySQL)를 포함한 **멀티 컨테이너 환경**을 구성합니다.

---

## 구성 요소

| 서비스 이름           | 설명                         | 관련 레포 링크 |
|------------------------|------------------------------|----------------|
| `planvel-admin`        | 관리자용 백오피스 API 서버   | *(별도 레포)* [`eureka-planvel/planvel-admin`](https://github.com/eureka-planvel/planvel-admin) |
| `planvel-backend`      | 사용자 서비스 API 서버       | *(별도 레포)* [`eureka-planvel/planvel-backend`](https://github.com/eureka-planvel/planvel-backend) |
| `planvel-admin-frontend` | 관리자용 정적 프론트엔드     | 현재 레포 내 포함 |
| `planvel-user-frontend`  | 사용자용 정적 프론트엔드     | 현재 레포 내 포함 |
| `nginx`                | 리버스 프록시 + 라우팅 설정  | 현재 레포 내 포함 |
| `mysql`                | MySQL 8.0 DB (컨테이너 기반) | 현재 레포 내 포함 |

---

## 🚀 실행 방법

```bash
# 첫 실행 시
docker compose up --build

# 이후
docker compose up
```

### structure

```bash
.
├── docker-compose.yml
├── nginx/
│   └── default.conf
├── planvel-admin-frontend/
│   ├── index.html
│   ├── css/
│   └── js/
├── planvel-user-frontend/
│   └── Dockerfile
├── planvel-admin/          # 서브레포
├── planvel-backend/        # 서브레포
├── uploads/
└── .gitignore
```