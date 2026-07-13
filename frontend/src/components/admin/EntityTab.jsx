import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api, resolveImg, formatApiErrorDetail } from "@/lib/adminApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageField } from "./ImageField";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

const buildSubtitle = (item, fields, titleKey) =>
  fields
    .filter((f) => f.key !== titleKey && f.type !== "image")
    .slice(0, 2)
    .map((f) => item[f.key])
    .filter(Boolean)
    .join(" · ");

const ItemRow = ({ item, index, collection, imageField, titleKey, subtitle, onEdit, onDelete }) => (
  <div data-testid={`${collection}-item-${index}`} className="flex items-center gap-4 rounded-xl bg-[#0A0A0A] border border-zinc-800 p-4">
    {imageField && item[imageField.key] && (
      <img src={resolveImg(item[imageField.key])} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-zinc-100 truncate">{item[titleKey]}</p>
      <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
    </div>
    <button data-testid={`${collection}-edit-btn-${index}`} onClick={onEdit} className="p-2 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
      <Pencil className="w-4 h-4" />
    </button>
    <button data-testid={`${collection}-delete-btn-${index}`} onClick={onDelete} className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const FieldEditor = ({ field, value, collection, onChange }) => {
  if (field.type === "image") return <ImageField value={value} onChange={onChange} testId={`${collection}-${field.key}`} />;
  if (field.type === "textarea")
    return <Textarea data-testid={`${collection}-${field.key}-input`} value={value || ""} onChange={(e) => onChange(e.target.value)} className="bg-[#121212] border-zinc-800 text-white" />;
  return (
    <Input
      data-testid={`${collection}-${field.key}-input`}
      type={field.type === "number" ? "number" : "text"}
      value={value ?? ""}
      onChange={(e) => onChange(field.type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
      className="bg-[#121212] border-zinc-800 text-white h-11"
    />
  );
};

export const EntityTab = ({ collection, fields, titleKey, label }) => {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get(`/admin/${collection}`).then((res) => setItems(res.data));
  }, [collection]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      if (editing.id) await api.put(`/admin/${collection}/${editing.id}`, editing);
      else await api.post(`/admin/${collection}`, editing);
      toast.success("Saved");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed");
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/admin/${collection}/${id}`);
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (!items) return <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mt-10" />;

  const imageField = fields.find((f) => f.type === "image");

  return (
    <div data-testid={`${collection}-tab`}>
      <button
        data-testid={`${collection}-add-btn`}
        onClick={() => setEditing(Object.fromEntries(fields.map((f) => [f.key, f.type === "number" ? items.length + 1 : ""])))}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 text-sm transition-colors mb-5"
      >
        <Plus className="w-4 h-4" /> Add {label}
      </button>
      <div className="space-y-3">
        {items.map((item, i) => (
          <ItemRow
            key={item.id}
            item={item}
            index={i}
            collection={collection}
            imageField={imageField}
            titleKey={titleKey}
            subtitle={buildSubtitle(item, fields, titleKey)}
            onEdit={() => setEditing(item)}
            onDelete={() => remove(item.id)}
          />
        ))}
        {items.length === 0 && <p className="text-sm text-zinc-500">Nothing here yet — add one.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent data-testid={`${collection}-edit-modal`} className="bg-[#0A0A0A] border-zinc-800 text-white sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-left">{editing?.id ? "Edit" : "Add"} {label}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-zinc-300">{f.label}</Label>
                  <FieldEditor field={f} value={editing[f.key]} collection={collection} onChange={(v) => setEditing({ ...editing, [f.key]: v })} />
                </div>
              ))}
              <button data-testid={`${collection}-save-btn`} onClick={save} disabled={saving} className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
