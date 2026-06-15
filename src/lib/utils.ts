/**
 * 날짜 문자열을 한국어 형식으로 변환
 * "2024-07-15" → "2024년 7월 15일 (월)"
 */
export function formatDateKo(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dow = days[date.getDay()];
  return `${y}년 ${m}월 ${d}일 (${dow})`;
}

/**
 * 전화번호 자동 포맷 (숫자만 입력 받아 010-0000-0000 형식으로)
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

/**
 * 두 시간 문자열 사이의 분(minute) 차이 계산
 */
export function diffMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

/**
 * 분 → "X시간 Y분" 텍스트
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

/**
 * 날짜 패딩 (1 → "01")
 */
export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환
 */
export function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
