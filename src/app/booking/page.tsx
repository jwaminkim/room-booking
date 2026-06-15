"use client";
import { useState } from "react";
import { ROOMS, TIME_SLOTS } from "@/types";
import type { RoomId, ReservationFormData } from "@/types";
import { useReservation } from "@/hooks/useReservation";
import { formatPhone, formatDateKo, diffMinutes, formatDuration, todayString } from "@/lib/utils";
import styles from "./page.module.css";

const today = todayString();

export default function BookingPage() {
  const { status, conflictInfo, errorMsg, book, reset } = useReservation();

  const [form, setForm] = useState<ReservationFormData>({
    room: "A",
    name: "",
    phone: "",
    headcount: "",
    date: today,
    startTime: "09:00",
    endTime: "10:00",
  });

  const selectedRoom = ROOMS.find((r) => r.id === form.room)!;
  const duration = diffMinutes(form.startTime, form.endTime);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (status !== "idle") reset();

    if (name === "phone") {
      setForm((prev) => ({ ...prev, phone: formatPhone(value) }));
      return;
    }
    if (name === "startTime") {
      const endTimeSlots = TIME_SLOTS.filter((t) => t > value);
      const newEnd =
        form.endTime > value ? form.endTime : endTimeSlots[1] ?? endTimeSlots[0];
      setForm((prev) => ({ ...prev, startTime: value, endTime: newEnd }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomSelect = (room: RoomId) => {
    setForm((prev) => ({ ...prev, room }));
    if (status !== "idle") reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0) return;
    await book(form);
  };

  const handleReset = () => {
    reset();
    setForm({
      room: "A",
      name: "",
      phone: "",
      headcount: "",
      date: today,
      startTime: "09:00",
      endTime: "10:00",
    });
  };

  const endTimeSlots = TIME_SLOTS.filter((t) => t > form.startTime);

  const roomAccents: Record<string, string> = {
    A: "var(--accent-a)",
    B: "var(--accent-b)",
    C: "var(--accent-c)",
  };

  if (status === "success") {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>예약이 완료되었습니다!</h2>
          <p className={styles.successSub}>{formatDateKo(form.date)}</p>
          <div className={styles.successDetails}>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>룸</span>
              <span
                className={styles.detailValue}
                style={{ color: roomAccents[form.room] }}
              >
                {selectedRoom.name}
              </span>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>예약자</span>
              <span className={styles.detailValue}>{form.name}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>연락처</span>
              <span className={styles.detailValue}>{form.phone}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>시간</span>
              <span className={styles.detailValue}>
                {form.startTime} ~ {form.endTime}
                <span className={styles.durationBadge}>
                  {formatDuration(duration)}
                </span>
              </span>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>인원</span>
              <span className={styles.detailValue}>{form.headcount}명</span>
            </div>
          </div>
          <button className={styles.resetBtn} onClick={handleReset}>
            새 예약하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          <em>Room</em> Booking
        </h1>
        <p className={styles.heroSub}>원하는 룸을 선택하고 예약 정보를 입력하세요</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* ── 룸 선택 ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>룸 선택</h3>
          <div className={styles.roomGrid}>
            {ROOMS.map((room) => (
              <button
                key={room.id}
                type="button"
                className={`${styles.roomCard} ${form.room === room.id ? styles.roomSelected : ""}`}
                onClick={() => handleRoomSelect(room.id)}
                style={{ "--room-accent": room.accent } as React.CSSProperties}
              >
                <span className={styles.roomBadge}>{room.name}</span>
                <p className={styles.roomDesc}>{room.description}</p>
                <span className={styles.roomCap}>최대 {room.capacity}인</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── 날짜 & 시간 ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>날짜 및 시간</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>날짜</label>
              <input
                type="date"
                name="date"
                value={form.date}
                min={today}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>시작 시간</label>
              <select
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className={styles.input}
              >
                {TIME_SLOTS.slice(0, -1).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                종료 시간
                {duration > 0 && (
                  <span className={styles.durationHint}>
                    {formatDuration(duration)}
                  </span>
                )}
              </label>
              <select
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className={styles.input}
              >
                {endTimeSlots.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── 예약자 정보 ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>예약자 정보</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>이름</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="홍길동"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>전화번호</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="010-0000-0000"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                인원
                <span className={styles.capHint}>최대 {selectedRoom.capacity}명</span>
              </label>
              <input
                type="number"
                name="headcount"
                value={form.headcount}
                onChange={handleChange}
                placeholder="0"
                min="1"
                max={selectedRoom.capacity}
                required
                className={styles.input}
              />
            </div>
          </div>
        </section>

        {/* ── 알림 ── */}
        {status === "conflict" && conflictInfo && (
          <div className={styles.conflictAlert}>
            <span className={styles.alertIcon}>⚠</span>
            <div>
              <p className={styles.alertTitle}>이미 예약이 완료된 시간대입니다</p>
              <p className={styles.alertDesc}>
                {conflictInfo.date} {conflictInfo.startTime}~{conflictInfo.endTime}에{" "}
                <strong>{conflictInfo.name}</strong> 님의 예약이 있습니다.
                다른 시간을 선택해주세요.
              </p>
            </div>
          </div>
        )}
        {status === "error" && (
          <div className={styles.errorAlert}>
            <span className={styles.alertIcon}>✕</span>
            <p>{errorMsg}</p>
          </div>
        )}

        {/* ── 예약 요약 바 ── */}
        {form.name && form.date && duration > 0 && status !== "conflict" && (
          <div className={styles.summaryBar}>
            <span
              className={styles.summaryRoom}
              style={{ color: roomAccents[form.room] }}
            >
              {selectedRoom.name}
            </span>
            <span className={styles.summarySep}>·</span>
            <span>{form.date}</span>
            <span className={styles.summarySep}>·</span>
            <span>{form.startTime} ~ {form.endTime}</span>
            <span className={styles.summarySep}>·</span>
            <span>{formatDuration(duration)}</span>
          </div>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <span className={styles.spinner} />
          ) : (
            "예약 신청하기 →"
          )}
        </button>
      </form>
    </div>
  );
}
