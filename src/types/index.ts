export type RoomId = "A" | "B" | "C";

export interface Room {
  id: RoomId;
  name: string;
  description: string;
  capacity: number;
  color: string;
  accent: string;
}

export interface Reservation {
  id?: string;
  room: RoomId;
  name: string;
  phone: string;
  headcount: number;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  createdAt?: string;
}

export interface ReservationFormData {
  room: RoomId;
  name: string;
  phone: string;
  headcount: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const ROOMS: Room[] = [
  {
    id: "A",
    name: "룸 A",
    description: "소규모 미팅에 최적화된 아늑한 공간",
    capacity: 6,
    color: "#1a1a2e",
    accent: "#e94560",
  },
  {
    id: "B",
    name: "룸 B",
    description: "중규모 세미나 및 워크샵 전용 공간",
    capacity: 12,
    color: "#0f3460",
    accent: "#533483",
  },
  {
    id: "C",
    name: "룸 C",
    description: "대형 프레젠테이션 및 행사 공간",
    capacity: 20,
    color: "#1b4332",
    accent: "#40916c",
  },
];

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00",
];
