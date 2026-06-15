import type { Reservation, RoomId } from "@/types";

const BASE = "/api/reservations";

// ── 예약 생성 (서버에서 중복체크까지 처리) 주석테스트
export async function createReservation(
  data: Omit<Reservation, "id" | "createdAt">
): Promise<{ ok: true; data: Reservation } | { ok: false; conflict?: Reservation; error: string }> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.status === 409) {
    const json = await res.json() as { error: string; conflict: Reservation };
    return { ok: false, conflict: json.conflict, error: "conflict" };
  }
  if (!res.ok) {
    const json = await res.json() as { error: string };
    return { ok: false, error: json.error ?? "Unknown error" };
  }

  const reservation = await res.json() as Reservation;
  return { ok: true, data: reservation };
}

// ── 특정 룸 + 날짜 예약 조회 (클라이언트측 중복체크용 - 현재는 서버에서 처리)
export async function getReservationsByRoomAndDate(
  room: RoomId,
  date: string
): Promise<Reservation[]> {
  const res = await fetch(`${BASE}?room=${room}&date=${date}`);
  if (!res.ok) return [];
  return res.json() as Promise<Reservation[]>;
}

// ── 특정 날짜 전체 룸 예약 (달력 상세용)
export async function getReservationsByDate(date: string): Promise<Reservation[]> {
  const res = await fetch(`${BASE}?date=${date}`);
  if (!res.ok) return [];
  return res.json() as Promise<Reservation[]>;
}

// ── 월별 예약 (달력 전체용)
export async function getReservationsByMonth(
  year: number,
  month: number
): Promise<Reservation[]> {
  const res = await fetch(`${BASE}?year=${year}&month=${month}`);
  if (!res.ok) return [];
  return res.json() as Promise<Reservation[]>;
}

// ── 전체 예약 (관리자용)
export async function getAllReservations(): Promise<Reservation[]> {
  const res = await fetch(BASE);
  if (!res.ok) return [];
  return res.json() as Promise<Reservation[]>;
}

// ── 예약 삭제 (관리자용)
export async function deleteReservation(id: string): Promise<void> {
  await fetch(`${BASE}/${id}`, { method: "DELETE" });
}

// ── 시간 중복 체크 (로컬 유틸)
export function hasTimeConflict(
  existing: Reservation[],
  newStart: string,
  newEnd: string
): Reservation | null {
  for (const r of existing) {
    if (newStart < r.endTime && newEnd > r.startTime) return r;
  }
  return null;
}
