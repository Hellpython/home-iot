#!/bin/bash
set -e

# 1. 'postgres' DB에 pg_cron 확장 설치 (관리용)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS pg_cron;
EOSQL

# 2. 'home_iot' DB에 테이블 및 파티션 로직 생성 (데이터용)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE IF NOT EXISTS dumping_events (
        id uuid NOT NULL,
        device_name text NOT NULL,
        detection_type text NOT NULL,
        location text,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        PRIMARY KEY (id, created_at)
    ) PARTITION BY RANGE (created_at);

    CREATE OR REPLACE FUNCTION create_daily_partition(target_date date) RETURNS void AS \$\$
    DECLARE
        partition_name text;
        start_date text;
        end_date text;
    BEGIN
        partition_name := 'dumping_events_' || to_char(target_date, 'YYYY_MM_DD');
        start_date := to_char(target_date, 'YYYY-MM-DD');
        end_date := to_char(target_date + 1, 'YYYY-MM-DD');
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF dumping_events FOR VALUES FROM (%L) TO (%L)', partition_name, start_date, end_date);
    END;
    \$\$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION drop_old_partitions(retention_days integer) RETURNS void AS \$\$
    DECLARE
        row record;
        target_date date;
    BEGIN
        target_date := current_date - retention_days;
        FOR row IN SELECT tablename FROM pg_catalog.pg_tables WHERE tablename LIKE 'dumping_events_%' AND tablename < 'dumping_events_' || to_char(target_date, 'YYYY_MM_DD') LOOP
            EXECUTE format('ALTER TABLE dumping_events DETACH PARTITION %I', row.tablename);
            EXECUTE format('DROP TABLE %I', row.tablename);
        END LOOP;
    END;
    \$\$ LANGUAGE plpgsql;

    -- 초기 파티션 생성
    SELECT create_daily_partition(current_date);
    SELECT create_daily_partition(current_date + 1);
EOSQL

# 3. 'postgres' DB에서 'home_iot' DB의 작업을 스케줄링 (스케줄러 등록)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    -- 90일 파티션 유지 스케줄 등록 (관리 DB에서 데이터 DB로 명령을 내림)
    SELECT cron.schedule('daily_partition_maintenance', '0 2 * * *', 
        format('SELECT public.create_daily_partition(current_date + 1); SELECT public.drop_old_partitions(90);')
    );
EOSQL
