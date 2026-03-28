import type { GetServerSideProps } from "next";
import { requireAdminSession } from "../../../lib/admin/auth";
import AdminLayout from "../../../components/admin/AdminLayout";
import RetreatForm from "../../../components/admin/RetreatForm";
import styles from "../../../styles/admin.module.css";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const redirect = await requireAdminSession(ctx);
  if (redirect) return redirect;
  return { props: {} };
};

export default function NewRetreatPage() {
  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>new retreat</h1>
      </div>
      <RetreatForm />
    </AdminLayout>
  );
}
