"use client";
import { useState, useCallback } from "react";
import { createReservation } from "@/services/reservationService";
import type { ReservationFormData, Reservation } from "@/types";

export type BookingStatus = "idle" | "loading" | "success" | "conflict" | "error";

export function useReservation() {
  const [status, setStatus]           = useState<BookingStatus>("idle");
  const [conflictInfo, setConflictInfo] = useState<Reservation | null>(null);
  const [errorMsg, setErrorMsg]         = useState("");

  const book = useCallback(async (data: ReservationFormData) => {
    setStatus("loading");
    setConflictInfo(null);
    setErrorMsg("");

    try {
      const result = await createReservation({
        room:      data.room,
        name:      data.name,
        phone:     data.phone,
        headcount: Number(data.headcount),
        date:      data.date,
        startTime: data.startTime,
        endTime:   data.endTime,
      });

      if (!result.ok) {
        if (result.error === "conflict" && result.conflict) {
          setStatus("conflict");
          setConflictInfo(result.conflict);
        } else {
          setStatus("error");
          setErrorMsg(result.error ?? "예약 중 오류가 발생했습니다.");
        }
        return;
      }

      setStatus("success");
    } catch (e) {
      console.error(e);
      setStatus("error");
      setErrorMsg("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setConflictInfo(null);
    setErrorMsg("");
  }, []);

  return { status, conflictInfo, errorMsg, book, reset };
}
