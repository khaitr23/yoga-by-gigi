import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import ImageUpload from "./ImageUpload";
import styles from "../../styles/admin.module.css";

interface Author {
  id: string;
  name: string;
}

interface PostFormData {
  title: string;
  slug: string;
  date: string;
  summary: string;
  contentMarkdown: string;
  authorId: string;
  coverImageId: string;
  coverImageUrl: string;
}

interface Props {
  initialData?: Partial<PostFormData>;
  entryId?: string; // present when editing
  onSaved?: (id: string) => void;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function PostForm({ initialData, entryId, onSaved }: Props) {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState<PostFormData>({
    title: "",
    slug: "",
    date: new Date().toISOString().slice(0, 10),
    summary: "",
    contentMarkdown: "",
    authorId: "",
    coverImageId: "",
    coverImageUrl: "",
    ...initialData,
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/authors")
      .then((r) => r.json())
      .then((data) => {
        setAuthors(data.authors ?? []);
        if (!form.authorId && data.authors?.length) {
          setForm((f) => ({ ...f, authorId: data.authors[0].id }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(key: keyof PostFormData, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleTitleChange(val: string) {
    setForm((f) => ({
      ...f,
      title: val,
      slug: entryId ? f.slug : slugify(val), // auto-slug only on new
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    const payload = {
      title: form.title,
      slug: form.slug,
      date: form.date,
      summary: form.summary,
      content: form.contentMarkdown,
      authorId: form.authorId,
      assetId: form.coverImageId || undefined,
    };

    try {
      let res: Response;
      if (entryId) {
        res = await fetch(`/api/admin/posts/${entryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "save failed");
      setAlert({ type: "success", msg: "Saved and published." });
      if (onSaved) onSaved(data.id ?? entryId!);
      else router.push("/admin/posts");
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {alert && (
        <div className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          {alert.msg}
        </div>
      )}

      {/* Cover image */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>cover image</label>
        <ImageUpload
          currentUrl={form.coverImageUrl || null}
          onUploaded={(id, url) => setForm((f) => ({ ...f, coverImageId: id, coverImageUrl: url }))}
        />
      </div>

      {/* Title + Slug */}
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="title">title</label>
          <input
            id="title"
            className={styles.input}
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="slug">slug</label>
          <input
            id="slug"
            className={styles.input}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            required
          />
          <span className={styles.hint}>/blogs/{form.slug || "…"}</span>
        </div>
      </div>

      {/* Date + Author */}
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="date">date</label>
          <input
            id="date"
            type="date"
            className={styles.input}
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="author">author</label>
          <select
            id="author"
            className={styles.select}
            value={form.authorId}
            onChange={(e) => set("authorId", e.target.value)}
          >
            {authors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="summary">summary</label>
        <textarea
          id="summary"
          className={styles.textarea}
          rows={2}
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
      </div>

      {/* Content */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="content">content (markdown)</label>
        <textarea
          id="content"
          className={styles.textarea}
          rows={18}
          value={form.contentMarkdown}
          onChange={(e) => set("contentMarkdown", e.target.value)}
          placeholder={"# Heading\n\nYour content here…\n\n> Blockquote\n\n- List item"}
        />
        <span className={styles.hint}>supports: # headings, **bold**, *italic*, `code`, &gt; blockquote, - list, ---</span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          type="submit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={saving}
        >
          {saving ? "saving…" : entryId ? "save & publish" : "create & publish"}
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => router.push("/admin/posts")}
        >
          cancel
        </button>
      </div>
    </form>
  );
}
