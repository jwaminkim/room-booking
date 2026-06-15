import styles from "./LoadingSpinner.module.css";

interface Props {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export default function LoadingSpinner({ size = "md", label }: Props) {
  return (
    <div className={styles.wrap}>
      <span className={`${styles.spinner} ${styles[size]}`} />
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );
}
