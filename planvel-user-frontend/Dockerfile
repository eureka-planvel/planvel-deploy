# nginx 기반 이미지 사용
FROM nginx:alpine

# build된 파일 복사 (VSCode LiveServer 쓰던 폴더 기준으로 조정)
COPY . /usr/share/nginx/html

# 캐시 비활성화 및 CORS 대비
RUN rm /etc/nginx/conf.d/default.conf