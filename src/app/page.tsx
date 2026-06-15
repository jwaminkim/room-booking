"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.replace("/booking");
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0d0d0f",
      color: "#8888a0",
      fontFamily: "sans-serif",
      fontSize: "14px"
    }}>
      이동 중...
    </div>
  );
}
