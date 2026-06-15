import type { RoomId } from "@/types";
import { ROOMS } from "@/types";
import styles from "./RoomBadge.module.css";

const ACCENTS: Record<RoomId, string> = {
  A: "var(--accent-a)",
  B: "var(--accent-b)",
  C: "var(--accent-c)",
};

interface Props {
  room: RoomId;
  size?: "sm" | "md";
}

export default function RoomBadge({ room, size = "sm" }: Props) {
  const info = ROOMS.find((r) => r.id === room)!;
  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{
        color: ACCENTS[room],
        borderColor: ACCENTS[room],
        background: `color-mix(in srgb, ${ACCENTS[room]} 10%, transparent)`,
      }}
    >
      {info.name}
    </span>
  );
}
