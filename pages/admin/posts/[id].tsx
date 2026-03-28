import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { requireAdminSession } from "../../../lib/admin/auth";
import AdminLayout from "../../../components/admin/AdminLayout";
import PostForm from "../../../components/admin/PostForm";
import styles from "../../../styles/admin.module.css";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const redirect = await requireAdminSession(ctx);
  if (redirect) return redirect;
  return { props: {} };
};

export default function EditPostPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/posts/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      });
  }, [id]);

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{data ? data.title : "edit post"}</h1>
      </div>

      {loading && <p className={styles.listItemMeta}>loading…</p>}
      {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}

      {data && (
        <PostForm
          entryId={id}
          initialData={{
            title: data.title,
            slug: data.slug,
            date: data.date,
            summary: data.summary,
            contentMarkdown: data.contentMarkdown,
            authorId: data.authorId ?? "",
            coverImageId: data.coverImageId ?? "",
            coverImageUrl: data.coverImageUrl ?? "",
          }}
        />
      )}
    </AdminLayout>
  );
}
