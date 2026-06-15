"use client";
import { useState, useEffect, useCallback } from "react";
import { getReservationsByMonth, getReservationsByDate } from "@/services/reservationService";
import { ROOMS, TIME_SLOTS } from "@/types";
import type { Reservation } from "@/types";
import { pad, formatDateKo, diffMinutes, formatDuration } from "@/lib/utils";
import RoomBadge from "@/components/RoomBadge";
import styles from "./page.module.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const TIMELINE_START = 9;   // 09:00
const TIMELINE_END   = 21;  // 21:00
const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START;

function timeToPercent(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return ((h - TIMELINE_START) * 60 + m) / (TIMELINE_HOURS * 60) * 100;
}

const ROOM_ACCENTS: Record<string, string> = {
  A: "var(--accent-a)",
  B: "var(--accent-b)",
  C: "var(--accent-c)",
};

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [monthRsvs, setMonthRsvs]   = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayRsvs, setDayRsvs]   = useState<Reservation[]>([]);
  const [loading, setLoading]   = useState(true);
  const [dayLoading, setDayLoading] = useState(false);

  const fetchMonth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReservationsByMonth(year, month + 1);
      setMonthRsvs(data);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  const handleDayClick = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setDayLoading(true);
    try {
      const data = await getReservationsByDate(dateStr);
      data.sort((a, b) => a.room.localeCompare(b.room) || a.startTime.localeCompare(b.startTime));
      setDayRsvs(data);
    } finally {
      setDayLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };
  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);

  // 날짜별 예약 맵
  const rsvMap: Record<string, Reservation[]> = {};
  monthRsvs.forEach((r) => {
    if (!rsvMap[r.date]) rsvMap[r.date] = [];
    rsvMap[r.date].push(r);
  });

  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  // 룸별 예약 그룹 (타임라인용)
  const rsvByRoom: Record<string, Reservation[]> = { A: [], B: [], C: [] };
  dayRsvs.forEach((r) => rsvByRoom[r.room]?.push(r));

  const timelineLabels = [9, 11, 13, 15, 17, 19, 21];

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>예약 <em>현황</em></h1>
        <p className={styles.heroSub}>날짜를 클릭하면 해당 일의 룸별 예약을 확인할 수 있습니다</p>
      </div>

      <div className={styles.layout}>
        {/* ── 달력 ── */}
        <div className={styles.calendarCard}>
          <div className={styles.calHeader}>
            <button className={styles.navBtn} onClick={prevMonth}>‹</button>
            <div className={styles.calHeaderCenter}>
              <h2 className={styles.monthTitle}>{year}년 {month + 1}월</h2>
              <button className={styles.todayBtn} onClick={goToday}>오늘</button>
            </div>
            <button className={styles.navBtn} onClick={nextMonth}>›</button>
          </div>

          {/* 룸 범례 */}
          <div className={styles.legend}>
            {ROOMS.map((r) => (
              <span key={r.id} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: ROOM_ACCENTS[r.id] }} />
                {r.name}
              </span>
            ))}
          </div>

          <div className={styles.weekdays}>
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={`${styles.weekday} ${i === 0 ? styles.sun : i === 6 ? styles.sat : ""}`}>
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className={styles.calLoading}>
              <span className={styles.spinner} />
            </div>
          ) : (
            <div className={styles.grid}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} className={styles.emptyCell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day      = i + 1;
                const dateStr  = `${year}-${pad(month + 1)}-${pad(day)}`;
                const dayData  = rsvMap[dateStr] || [];
                const isToday  = dateStr === todayStr;
                const isSel    = dateStr === selectedDate;
                const dow      = (firstDay + i) % 7;
                const isPast   = dateStr < todayStr;

                return (
                  <div
                    key={day}
                    className={`${styles.dayCell}
                      ${isToday ? styles.today : ""}
                      ${isSel ? styles.selected : ""}
                      ${isPast ? styles.past : ""}
                    `}
                    onClick={() => handleDayClick(dateStr)}
                  >
                    <span className={`${styles.dayNum} ${dow === 0 ? styles.sun : dow === 6 ? styles.sat : ""}`}>
                      {day}
                    </span>
                    {dayData.length > 0 && (
                      <div className={styles.dots}>
                        {(["A", "B", "C"] as const).map((rid) =>
                          dayData.some((r) => r.room === rid) ? (
                            <span key={rid} className={styles.dot} style={{ background: ROOM_ACCENTS[rid] }} />
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 이번 달 통계 */}
          <div className={styles.monthStats}>
            <span className={styles.monthStatItem}>
              이번 달 전체 <strong>{monthRsvs.length}</strong>건
            </span>
            {ROOMS.map((r) => (
              <span key={r.id} className={styles.monthStatItem}>
                <span style={{ color: ROOM_ACCENTS[r.id] }}>{r.name}</span>{" "}
                <strong>{monthRsvs.filter((rv) => rv.room === r.id).length}</strong>건
              </span>
            ))}
          </div>
        </div>

        {/* ── 상세 패널 ── */}
        <div className={styles.detailPanel}>
          {!selectedDate ? (
            <div className={styles.emptyDetail}>
              <div className={styles.emptyIcon}>📅</div>
              <p>날짜를 선택하면<br />예약 내역을 확인할 수 있습니다</p>
            </div>
          ) : dayLoading ? (
            <div className={styles.emptyDetail}>
              <span className={styles.spinner} />
            </div>
          ) : (
            <div className={styles.detailContent}>
              <div className={styles.detailHead}>
                <h3 className={styles.detailDate}>{formatDateKo(selectedDate)}</h3>
                <span className={styles.detailCount}>{dayRsvs.length}건</span>
              </div>

              {dayRsvs.length === 0 ? (
                <p className={styles.noRsv}>이 날짜에는 예약이 없습니다</p>
              ) : (
                <>
                  {/* 타임라인 */}
                  <div className={styles.timeline}>
                    {/* 시간 눈금 */}
                    <div className={styles.tlLabels}>
                      {timelineLabels.map((h) => (
                        <span key={h} className={styles.tlLabel}
                          style={{ left: `${((h - TIMELINE_START) / TIMELINE_HOURS) * 100}%` }}>
                          {h}시
                        </span>
                      ))}
                    </div>
                    {/* 룸별 트랙 */}
                    {ROOMS.map((room) => (
                      <div key={room.id} className={styles.tlRow}>
                        <span className={styles.tlRoomName} style={{ color: ROOM_ACCENTS[room.id] }}>
                          {room.name}
                        </span>
                        <div className={styles.tlTrack}>
                          {/* 그리드 라인 */}
                          {timelineLabels.map((h) => (
                            <div key={h} className={styles.tlGridLine}
                              style={{ left: `${((h - TIMELINE_START) / TIMELINE_HOURS) * 100}%` }} />
                          ))}
                          {/* 예약 블록 */}
                          {rsvByRoom[room.id].map((rsv) => {
                            const left  = timeToPercent(rsv.startTime);
                            const right = timeToPercent(rsv.endTime);
                            const width = right - left;
                            const dur   = diffMinutes(rsv.startTime, rsv.endTime);
                            return (
                              <div
                                key={rsv.id}
                                className={styles.tlBlock}
                                style={{
                                  left: `${left}%`,
                                  width: `${width}%`,
                                  background: ROOM_ACCENTS[room.id],
                                }}
                                title={`${rsv.name} · ${rsv.startTime}~${rsv.endTime} (${formatDuration(dur)})`}
                              >
                                {width > 8 && (
                                  <span className={styles.tlBlockLabel}>{rsv.name}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 예약 목록 카드 */}
                  <div className={styles.rsvList}>
                    {dayRsvs.map((r) => {
                      const dur = diffMinutes(r.startTime, r.endTime);
                      return (
                        <div key={r.id} className={styles.rsvItem}>
                          <div className={styles.rsvRoomBar} style={{ background: ROOM_ACCENTS[r.room] }} />
                          <div className={styles.rsvInfo}>
                            <div className={styles.rsvTop}>
                              <RoomBadge room={r.room} />
                              <span className={styles.rsvTime}>
                                {r.startTime} ~ {r.endTime}
                                <span className={styles.rsvDur}>{formatDuration(dur)}</span>
                              </span>
                            </div>
                            <p className={styles.rsvName}>{r.name}</p>
                            <p className={styles.rsvMeta}>{r.phone} · {r.headcount}명</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
