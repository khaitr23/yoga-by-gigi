import { useRef, useState } from "react";
import styles from "../../styles/admin.module.css";

interface Props {
  currentUrl?: string | null;
  onUploaded: (assetId: string, url: string) => void;
}

export default function ImageUpload({ currentUrl, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [progress, setProgress] = useState("");

  async function handleFile(file: File) {
    setProgress("reading file…");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      setProgress("uploading…");
      try {
        const res = await fetch("/api/admin/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, fileName: file.name, contentType: file.type }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "upload failed");
        setProgress("");
        onUploaded(data.id, data.url);
      } catch (err: any) {
        setProgress("error: " + err.message);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={styles.imageUpload}>
      <div
        className={styles.imagePreview}
        onClick={() => inputRef.current?.click()}
        style={{ cursor: "pointer" }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" />
        ) : (
          <span className={styles.imagePlaceholder}>click to upload image</span>
        )}
      </div>
      {progress && <span className={styles.uploadProgress}>{progress}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
