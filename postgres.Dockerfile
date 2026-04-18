FROM postgres:16

# pg_cron 설치 (Debian 패키지 매니저 사용)
RUN apt-get update && \
    apt-get install -y postgresql-16-cron && \
    rm -rf /var/lib/apt/lists/*

# 초기화 쉘 스크립트 복사 및 실행 권한 부여
COPY init.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init.sh
