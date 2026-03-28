import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../../styles/admin.module.css";

const NAV_LINKS = [
  { href: "/admin", label: "dashboard", exact: true },
  { href: "/admin/posts", label: "posts" },
  { href: "/admin/retreats", label: "retreats" },
  { href: "/admin/sections", label: "sections" },
];

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div className={styles.shell}>
      {/* ── Top bar ── */}
      <div className={styles.topbar}>
        <span className={styles.topbarBrand}>
          yoga by gigi<span className={styles.topbarBrandDot}>.</span> studio
        </span>
        <div className={styles.topbarRight}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.viewSiteLink}
          >
            view site ↗
          </a>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            sign out
          </button>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className={styles.nav}>
        {NAV_LINKS.map(({ href, label, exact }) => {
          const isActive = exact
            ? router.pathname === href
            : router.pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink}${isActive ? " " + styles.active : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Page area ── */}
      <main className={styles.page}>{children}</main>
    </div>
  );
}
