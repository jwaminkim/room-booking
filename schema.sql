-- ============================================================
-- 룸 대관 서비스 - D1 데이터베이스 스키마
-- 적용 방법:
--   로컬: wrangler d1 execute room-booking-db --local --file=./schema.sql
--   운영: wrangler d1 execute room-booking-db --remote --file=./schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS reservations (
  id         TEXT PRIMARY KEY,
  room       TEXT NOT NULL,              -- 'A' | 'B' | 'C'
  name       TEXT NOT NULL,              -- 예약자 이름
  phone      TEXT NOT NULL,              -- 전화번호
  headcount  INTEGER NOT NULL,           -- 인원
  date       TEXT NOT NULL,              -- 'YYYY-MM-DD'
  startTime  TEXT NOT NULL,              -- 'HH:MM'
  endTime    TEXT NOT NULL,              -- 'HH:MM'
  createdAt  TEXT NOT NULL               -- ISO datetime
);

-- 조회 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_reservations_room_date
  ON reservations (room, date);

CREATE INDEX IF NOT EXISTS idx_reservations_date
  ON reservations (date);
