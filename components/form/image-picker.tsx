import { api } from "@/utils/http";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export function ImagePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: { id?: string; url?: string } | null;
  onChange: (v: { id?: string; url?: string } | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const pick = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const { data } = await api.post("/media/image", form);
      const id = data?.data?._id;
      const url = data?.data?.url;
      if (!id) throw new Error("Upload response missing _id");
      onChange({ id, url });
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center overflow-hidden relative">
        {value?.url ? (
          <Image
            src={value.url}
            alt={label}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-xs text-white/50">No img</span>
        )}
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-white/60">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pick(f);
            }}
            className="block text-sm file:mr-2 file:px-3 file:py-1.5 file:rounded-md file:bg-white/10 file:text-white file:border-0 file:hover:bg-white/20"
          />
          {uploading && (
            <span className="text-xs text-white/60">Uploading…</span>
          )}
          {value?.id && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"
            >
              Remove
            </button>
          )}
        </div>
        {value?.id && (
          <span className="text-[10px] text-white/40">_id: {value.id}</span>
        )}
      </div>
    </div>
  );
}
