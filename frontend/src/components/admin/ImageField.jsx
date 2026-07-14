import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { api, resolveImg, formatApiErrorDetail } from "@/lib/adminApi";
import { Input } from "@/components/ui/input";

export const ImageField = ({ value, onChange, testId }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd);
      onChange(data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <img src={resolveImg(value)} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-zinc-800 bg-black" />
      ) : (
        <div className="w-14 h-14 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 text-xs">none</div>
      )}
      <div className="flex-1 space-y-2">
        <Input
          data-testid={`${testId}-url-input`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or upload →"
          className="bg-[#121212] border-zinc-800 text-white h-10 text-xs"
        />
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        data-testid={`${testId}-upload-btn`}
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 px-3 py-2.5 text-xs font-semibold transition-colors disabled:opacity-50"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        Upload
      </button>
    </div>
  );
};
