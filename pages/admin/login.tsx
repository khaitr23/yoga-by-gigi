import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { isAuthenticated } from "../../lib/admin/auth";
import styles from "../../styles/admin.module.css";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (isAuthenticated(ctx.req as any)) {
    return { redirect: { destination: "/admin", permanent: false } };
  }
  return { props: {} };
};

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error ?? "incorrect password");
      }
    } catch {
      setError("network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginShell}>
      <div className={styles.loginCard}>
        <div className={styles.loginBrand}>
          <p className={styles.loginBrandName}>yoga by gigi.</p>
          <span className={styles.loginBrandSub}>studio</span>
        </div>

        {error && <div className={styles.loginError}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={loading}
          >
            {loading ? "signing in…" : "sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
