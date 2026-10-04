"use client";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import type { TickerItem } from "@/data/types";
import { useBoardData } from "@/lib/supabase-provider";
import { createClient } from "@/util/supabase/client";
import { RunningTicker } from "@/components/board/running-ticker";
import { EmptyState } from "@/components/shared/broadcast-ui";
import {
  DeleteButton,
  Field,
  FormActions,
  Modal,
  Notice,
  PageHeading,
  savedMessage,
} from "./admin-ui";

function TickerForm({
  item,
  nextOrder,
  onClose,
  onSaved,
}: {
  item: TickerItem | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: (p: boolean) => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = String(form.get("text")).trim();
    if (!text) {
      setError("Isi teks informasi terlebih dahulu.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    
    if (item) {
      const { error: err } = await supabase.from("running_texts").update({
        text,
        sort_order: Number(form.get("order")),
        is_active: form.get("active") === "on",
      }).eq("id", item.id);
      if (err) setError(err.message);
      else {
        onSaved(true);
        onClose();
      }
    } else {
      const { count, error: countErr } = await supabase
        .from("running_texts")
        .select("id", { count: "exact", head: true });

      if (!countErr && (count ?? 0) >= 10) {
        setError("Batas maksimum 10 Running Text telah tercapai. Hapus salah satu data untuk menambahkan data baru.");
        setLoading(false);
        return;
      }

      const { error: err } = await supabase.from("running_texts").insert({
        text,
        sort_order: Number(form.get("order")),
        is_active: form.get("active") === "on",
      });
      if (err) {
        if (err.message && (err.message.includes("10") || err.message.toLowerCase().includes("maksimum"))) {
          setError("Batas maksimum 10 Running Text telah tercapai. Hapus salah satu data untuk menambahkan data baru.");
        } else {
          setError(err.message);
        }
      } else {
        onSaved(true);
        onClose();
      }
    }
    setLoading(false);
  }
  return (
    <form onSubmit={save} className="form-stack">
      <Field label="Teks informasi">
        <textarea
          name="text"
          defaultValue={item?.text}
          required
          maxLength={500}
          rows={4}
          autoFocus
          disabled={loading}
        />
      </Field>
      <Field label="Urutan">
        <input
          type="number"
          name="order"
          defaultValue={item?.order ?? nextOrder}
          min={1}
          max={999}
          required
          disabled={loading}
        />
      </Field>
      <label className="checkbox-field">
        <input
          type="checkbox"
          name="active"
          defaultChecked={item?.active ?? true}
          disabled={loading}
        />
        Tampilkan di running text
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <FormActions onCancel={onClose} />
    </form>
  );
}

export function TickerManager() {
  const { ticker } = useBoardData();
  const [editing, setEditing] = useState<TickerItem | null | undefined>();
  const [message, setMessage] = useState("");
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const supabase = createClient();

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("running_texts").update({ is_active: active }).eq("id", id);
    if (!error) setMessage(savedMessage(true));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("running_texts").delete().eq("id", id);
    if (!error) setMessage(savedMessage(true));
  };

  const isLimitReached = ticker.length >= 10;

  const handleAddClick = () => {
    if (isLimitReached) {
      setLimitNotice(
        "Batas maksimum 10 Running Text telah tercapai. Hapus salah satu data untuk menambahkan data baru."
      );
    } else {
      setEditing(null);
    }
  };

  return (
    <>
      <PageHeading
        title="Running Text"
        description="Pesan singkat yang mengalir di bagian bawah layar publik."
        action={
          <button className="button primary" onClick={handleAddClick}>
            <Plus size={17} />
            Tambah running text
          </button>
        }
      />
      <Notice message={message} />
      <div className="ticker-preview mb-6">
        <RunningTicker items={ticker} />
      </div>
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>URUTAN</th>
              <th>KONTEN TEKS</th>
              <th>DITAMPILKAN</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {[...ticker]
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <tr key={item.id}>
                  <td className="order-cell">
                    {String(item.order).padStart(2, "0")}
                  </td>
                  <td className="ticker-content-cell">{item.text}</td>
                  <td>
                    <label className="checkbox-field">
                      <input
                        type="checkbox"
                        checked={item.active}
                        aria-label={`Tampilkan ${item.text}`}
                        onChange={(e) => toggleActive(item.id, e.target.checked)}
                      />
                      {item.active ? "Aktif" : "Nonaktif"}
                    </label>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        aria-label={`Edit ${item.text}`}
                        onClick={() => setEditing(item)}
                      >
                        <Pencil size={16} />
                      </button>
                      <DeleteButton
                        title={item.text}
                        onDelete={() => deleteItem(item.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!ticker.length && <EmptyState>Belum ada running text.</EmptyState>}
      </div>
      {editing !== undefined && (
        <Modal
          title={editing ? "Edit running text" : "Tambah running text"}
          onClose={() => setEditing(undefined)}
        >
          <TickerForm
            item={editing}
            nextOrder={Math.max(0, ...ticker.map((t) => t.order)) + 1}
            onClose={() => setEditing(undefined)}
            onSaved={(p) => setMessage(savedMessage(p))}
          />
        </Modal>
      )}
      {limitNotice && (
        <Modal
          title="Batas Maksimum Tercapai"
          onClose={() => setLimitNotice(null)}
        >
          <div className="limit-alert-content">
            <p className="text-secondary" style={{ marginBottom: "1.25rem", lineHeight: 1.5 }}>
              {limitNotice}
            </p>
            <div className="form-actions" style={{ justifyContent: "flex-end" }}>
              <button
                type="button"
                className="button primary"
                onClick={() => setLimitNotice(null)}
                autoFocus
              >
                Mengerti
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
