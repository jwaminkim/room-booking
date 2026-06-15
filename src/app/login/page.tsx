"use client";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    window.location.replace("/admin");
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
      관리자 페이지로 이동 중...
    </div>
  );
}
