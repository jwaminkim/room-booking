// ============================================================
// /api/reservations
//   GET    : 예약 목록 조회 (필터: room, date, year+month)
//   POST   : 예약 생성 (서버측 중복 체크 포함)
// ============================================================

interface Env {
  DB: D1Database;
}

interface ReservationRow {
  id: string;
  room: string;
  name: string;
  phone: string;
  headcount: number;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

// GET /api/reservations?room=A&date=2024-07-01
// GET /api/reservations?date=2024-07-01
// GET /api/reservations?year=2024&month=7
// GET /api/reservations  (전체, 관리자용)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const room = url.searchParams.get("room");
  const date = url.searchParams.get("date");
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (room) {
    conditions.push("room = ?");
    params.push(room);
  }
  if (date) {
    conditions.push("date = ?");
    params.push(date);
  }
  if (year && month) {
    const m = String(month).padStart(2, "0");
    conditions.push("date >= ? AND date <= ?");
    params.push(`${year}-${m}-01`, `${year}-${m}-31`);
  }

  let sql = "SELECT * FROM reservations";
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY date ASC, startTime ASC";

  try {
    const stmt = env.DB.prepare(sql).bind(...params);
    const { results } = await stmt.all<ReservationRow>();
    return Response.json(results ?? []);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
};

// POST /api/reservations
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Partial<ReservationRow>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { room, name, phone, headcount, date, startTime, endTime } = body;

  if (!room || !name || !phone || !date || !startTime || !endTime || !headcount) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (startTime >= endTime) {
    return Response.json({ error: "Invalid time range" }, { status: 400 });
  }

  try {
    // 서버측 중복(시간 겹침) 체크
    const { results: existing } = await env.DB.prepare(
      "SELECT * FROM reservations WHERE room = ? AND date = ?"
    )
      .bind(room, date)
      .all<ReservationRow>();

    const conflict = (existing ?? []).find(
      (r) => startTime! < r.endTime && endTime! > r.startTime
    );

    if (conflict) {
      return Response.json({ error: "conflict", conflict }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO reservations (id, room, name, phone, headcount, date, startTime, endTime, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(id, room, name, phone, Number(headcount), date, startTime, endTime, createdAt)
      .run();

    const created: ReservationRow = {
      id,
      room,
      name,
      phone,
      headcount: Number(headcount),
      date,
      startTime,
      endTime,
      createdAt,
    };

    return Response.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create reservation" }, { status: 500 });
  }
};
