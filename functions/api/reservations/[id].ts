// ============================================================
// /api/reservations/[id]
//   DELETE : 예약 삭제 (관리자용)
// ============================================================

interface Env {
  DB: D1Database;
}

export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id as string;

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const { meta } = await env.DB.prepare(
      "DELETE FROM reservations WHERE id = ?"
    )
      .bind(id)
      .run();

    if (meta.changes === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to delete reservation" }, { status: 500 });
  }
};
