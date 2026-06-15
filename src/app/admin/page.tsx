"use client";
import { useState, useEffect } from "react";
import { getAllReservations, deleteReservation } from "@/services/reservationService";
import { ROOMS } from "@/types";
import type { Reservation } from "@/types";
import { formatDateKo, formatDuration, diffMinutes } from "@/lib/utils";
import { exportReservationsAsCsv } from "@/lib/exportCsv";
import RoomBadge from "@/components/RoomBadge";
import styles from "./page.module.css";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin1234";

type SortKey = "date" | "room" | "name" | "createdAt";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw]         = useState("");
  const [pwError, setPwError] = useState(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading]           = useState(false);
  const [filterRoom, setFilterRoom]     = useState<string>("ALL");
  const [filterDate, setFilterDate]     = useState("");
  const [searchName, setSearchName]     = useState("");
  const [sortKey, setSortKey]           = useState<SortKey>("date");
  const [sortAsc, setSortAsc]           = useState(true);
  const [deleteId, setDeleteId]         = useState<string | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); }
    else { setPwError(true); setPw(""); }
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    getAllReservations().then(setReservations).finally(() => setLoading(false));
  }, [authed]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteReservation(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const ROOM_ACCENTS: Record<string, string> = {
    A: "var(--accent-a)",
    B: "var(--accent-b)",
    C: "var(--accent-c)",
  };

  const filtered = reservations
    .filter((r) => filterRoom === "ALL" || r.room === filterRoom)
    .filter((r) => !filterDate || r.date === filterDate)
    .filter((r) => !searchName || r.name.includes(searchName) || r.phone.includes(searchName))
    .sort((a, b) => {
      const va = String(a[sortKey] ?? "");
      const vb = String(b[sortKey] ?? "");
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? <span className={styles.sortIcon}>{sortAsc ? "↑" : "↓"}</span>
      : <span className={styles.sortIconMuted}>↕</span>;

  /* ── 로그인 화면 ── */
  if (!authed) {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginCard}>
          <div className={styles.loginLogo}>▣</div>
          <h1 className={styles.loginTitle}>관리자</h1>
          <p className={styles.loginSub}>예약 현황을 조회·관리합니다</p>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(false); }}
              placeholder="비밀번호를 입력하세요"
              className={`${styles.pwInput} ${pwError ? styles.pwError : ""}`}
              autoFocus
            />
            {pwError && <p className={styles.pwErrorMsg}>비밀번호가 올바르지 않습니다</p>}
            <button type="submit" className={styles.loginBtn}>로그인 →</button>
          </form>
        </div>
      </div>
    );
  }

  /* ── 관리자 대시보드 ── */
  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>
            <span className={styles.adminBadge}>ADMIN</span>
            예약 관리
          </h1>
          <p className={styles.pageSub}>전체 {reservations.length}건의 예약 데이터</p>
        </div>
        <div className={styles.topActions}>
          <button
            className={styles.exportBtn}
            onClick={() => exportReservationsAsCsv(filtered, `reservations_${new Date().toISOString().slice(0,10)}.csv`)}
            disabled={filtered.length === 0}
          >
            CSV 내보내기
          </button>
          <button className={styles.logoutBtn} onClick={() => setAuthed(false)}>
            로그아웃
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsRow}>
        {ROOMS.map((room) => {
          const count = reservations.filter((r) => r.room === room.id).length;
          return (
            <div key={room.id} className={styles.statCard} style={{ "--stat-accent": ROOM_ACCENTS[room.id] } as React.CSSProperties}>
              <span className={styles.statRoom} style={{ color: ROOM_ACCENTS[room.id] }}>{room.name}</span>
              <div className={styles.statBottom}>
                <span className={styles.statCount}>{count}</span>
                <span className={styles.statLabel}>건</span>
              </div>
              <div
                className={styles.statBar}
                style={{
                  width: reservations.length > 0 ? `${(count / reservations.length) * 100}%` : "0%",
                  background: ROOM_ACCENTS[room.id],
                }}
              />
            </div>
          );
        })}
        <div className={styles.statCard}>
          <span className={styles.statRoom} style={{ color: "var(--text-secondary)" }}>전체</span>
          <div className={styles.statBottom}>
            <span className={styles.statCount}>{reservations.length}</span>
            <span className={styles.statLabel}>건</span>
          </div>
          <div className={styles.statBar} style={{ width: "100%", background: "var(--border-active)" }} />
        </div>
      </div>

      {/* 필터 */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <select className={styles.filterSelect} value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}>
            <option value="ALL">모든 룸</option>
            {ROOMS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <input
            type="date"
            className={styles.filterSelect}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <input
            type="text"
            className={styles.filterSearch}
            placeholder="이름 또는 전화번호 검색"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          {(filterRoom !== "ALL" || filterDate || searchName) && (
            <button
              className={styles.clearBtn}
              onClick={() => { setFilterRoom("ALL"); setFilterDate(""); setSearchName(""); }}
            >
              필터 초기화
            </button>
          )}
        </div>
        <span className={styles.resultCount}>{filtered.length}건 표시</span>
      </div>

      {/* 테이블 */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <span className={styles.spinner} />
          <p>예약 데이터를 불러오는 중...</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort("room")} className={styles.th}>룸 <SortIcon k="room" /></th>
                <th onClick={() => handleSort("date")} className={styles.th}>날짜 <SortIcon k="date" /></th>
                <th className={styles.th}>시간 / 이용시간</th>
                <th onClick={() => handleSort("name")} className={styles.th}>예약자 <SortIcon k="name" /></th>
                <th className={styles.th}>전화번호</th>
                <th className={styles.th}>인원</th>
                <th onClick={() => handleSort("createdAt")} className={styles.th}>등록일시 <SortIcon k="createdAt" /></th>
                <th className={styles.th}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>
                    {reservations.length === 0 ? "예약 내역이 없습니다" : "조건에 맞는 예약이 없습니다"}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const dur = diffMinutes(r.startTime, r.endTime);
                  return (
                    <tr key={r.id} className={styles.tr}>
                      <td className={styles.td}>
                        <RoomBadge room={r.room} />
                      </td>
                      <td className={styles.td}>
                        <span className={styles.dateCell}>{r.date}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.timeTag}>
                          {r.startTime} ~ {r.endTime}
                        </span>
                        <span className={styles.durTag}>{formatDuration(dur)}</span>
                      </td>
                      <td className={styles.tdBold}>{r.name}</td>
                      <td className={styles.td}>{r.phone}</td>
                      <td className={styles.td}>{r.headcount}명</td>
                      <td className={styles.tdMuted}>
                        {r.createdAt ? r.createdAt.slice(0, 16).replace("T", " ") : "-"}
                      </td>
                      <td className={styles.td}>
                        <button className={styles.deleteBtn} onClick={() => setDeleteId(r.id!)}>
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteId && (
        <div className={styles.modalOverlay} onClick={() => !deleting && setDeleteId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>⚠</div>
            <h3 className={styles.modalTitle}>예약을 삭제하시겠습니까?</h3>
            <p className={styles.modalDesc}>
              {(() => {
                const r = reservations.find((rv) => rv.id === deleteId);
                if (!r) return "이 작업은 되돌릴 수 없습니다.";
                return `${r.date} ${r.startTime}~${r.endTime} · ${r.name} 님 예약을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`;
              })()}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setDeleteId(null)} disabled={deleting}>취소</button>
              <button className={styles.modalConfirm} onClick={() => handleDelete(deleteId)} disabled={deleting}>
                {deleting ? <span className={styles.spinnerSm} /> : "삭제 확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
