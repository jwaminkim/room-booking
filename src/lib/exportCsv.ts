import type { Reservation } from "@/types";
import { ROOMS } from "@/types";

export function exportReservationsAsCsv(reservations: Reservation[], filename = "reservations.csv") {
  const headers = ["룸", "날짜", "시작시간", "종료시간", "예약자", "전화번호", "인원", "등록일시"];

  const rows = reservations.map((r) => {
    const roomName = ROOMS.find((rm) => rm.id === r.room)?.name ?? r.room;
    return [
      roomName,
      r.date,
      r.startTime,
      r.endTime,
      r.name,
      r.phone,
      String(r.headcount),
      r.createdAt ? r.createdAt.slice(0, 16).replace("T", " ") : "",
    ];
  });

  const csvContent =
    "\uFEFF" + // BOM for Korean Excel compatibility
    [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
