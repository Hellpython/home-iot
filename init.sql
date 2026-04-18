-- 1. pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. 무단투기 감지 테이블 (파티셔닝 적용)
CREATE TABLE IF NOT EXISTS dumping_events (
    id uuid NOT NULL,
    device_name text NOT NULL,
    detection_type text NOT NULL, -- 'lidar', 'vision'
    location text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 3. 일일 파티션 생성 함수
CREATE OR REPLACE FUNCTION create_daily_partition(target_date date) RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- 4. 오래된 파티션 분리 및 삭제 함수 (90일 유지 정책)
CREATE OR REPLACE FUNCTION drop_old_partitions(retention_days integer) RETURNS void AS $$
DECLARE
    row record;
    target_date date;
BEGIN
    target_date := current_date - retention_days;
    
    FOR row IN 
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE tablename LIKE 'dumping_events_%' 
        AND tablename < 'dumping_events_' || to_char(target_date, 'YYYY_MM_DD')
    LOOP
        -- 2단계 안전 삭제: 먼저 연결 해제(DETACH) 후 삭제(DROP)
        EXECUTE format('ALTER TABLE dumping_events DETACH PARTITION %I', row.tablename);
        EXECUTE format('DROP TABLE %I', row.tablename);
        RAISE NOTICE 'Partition % detached and dropped.', row.tablename;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. 스케줄링 등록: 매일 새벽 2시 실행
SELECT cron.schedule('daily_partition_maintenance', '0 2 * * *', $$
    SELECT create_daily_partition(current_date + 1);
    SELECT drop_old_partitions(90);
$$);

-- 초기 파티션 생성 (오늘, 내일)
SELECT create_daily_partition(current_date);
SELECT create_daily_partition(current_date + 1);
