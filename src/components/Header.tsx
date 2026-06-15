"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();

  const tabs = [
    { href: "/booking", label: "예약하기" },
    { href: "/calendar", label: "예약현황" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/booking" className={styles.logo}>
          <span className={styles.logoIcon}>▣</span>
          <span className={styles.logoText}>ROOM<em>BOOK</em></span>
        </Link>

        <nav className={styles.nav}>
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${styles.tab} ${pathname.startsWith(tab.href) ? styles.active : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <Link href="/admin" className={styles.adminBtn}>
          관리자
        </Link>
      </div>
    </header>
  );
}
