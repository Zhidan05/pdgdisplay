"use client";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { type Schedule } from "@/data/types";
import { channelName, hasStream, isCurrent } from "@/lib/broadcast";
import { useClock } from "@/lib/use-clock";
import { useBoardData } from "@/lib/supabase-provider";
import { createClient } from "@/util/supabase/client";
import {
  BroadcastStatus,
  ChannelBadge,
  EmptyState,
} from "@/components/shared/broadcast-ui";
import {
  DeleteButton,
  Field,
  FormActions,
  Modal,
  Notice,
  PageHeading,
  savedMessage,
} from "./admin-ui";
import { formatDaysOfWeek, findScheduleConflict, normalizeDaysOfWeek } from "@/lib/board/schedule-utils";

function ScheduleForm({
  item,
  onClose,
  onSaved,
}: {
  item: Schedule | null;
  onClose: () => void;
  onSaved: (persisted: boolean) => void;
}) {
  const data = useBoardData();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>(item ? item.daysOfWeek : [1, 2, 3, 4, 5, 6, 7]);

  const toggleDay = (d: number) => {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };
  const setPreset = (preset: number[]) => setSelectedDays(preset);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const program = String(form.get("program")).trim();
    const start = String(form.get("start"));
    const end = String(form.get("end"));
    const channelCode = String(form.get("channel")).toUpperCase();
    
    if (!program || start === end) {
      setError(
        "Isi nama program dan gunakan jam mulai serta selesai yang berbeda.",
      );
      return;
    }
    if (selectedDays.length === 0) {
      setError("Pilih minimal satu hari siaran.");
      return;
    }
    
    setLoading(true);
    const supabase = createClient();
    
    // Get station ID
    const { data: st, error: stErr } = await supabase.from("stations").select("id").eq("code", channelCode).single();
    if (stErr || !st) {
      setError("Stasiun tidak ditemukan.");
      setLoading(false);
      return;
    }
    
    const conflict = findScheduleConflict(data.schedules, {
      id: item?.id,
      channel: st.id,
      daysOfWeek: selectedDays,
      start: start,
      end: end,
      isActive: true
    });

    if (conflict) {
      setError(`Jadwal tidak dapat disimpan karena bentrok dengan program '${conflict.title}' di ${conflict.stationName} pada ${formatDaysOfWeek(conflict.overlappingDays)}. Program yang sudah ada: ${conflict.startTime}–${conflict.endTime} WIB.`);
      setLoading(false);
      return;
    }

    const dbValue = {
      station_id: st.id,
      title: program,
      start_time: start,
      end_time: end,
      presenter: String(form.get("presenter")).trim(),
      days_of_week: normalizeDaysOfWeek(selectedDays),
    };

    const handleErr = (err: Error | { message: string }) => {
      if (err.message.includes("SCHEDULE_CONFLICT|")) {
         const parts = err.message.split("|");
         let days = [];
         try { days = JSON.parse(parts[3] || "[]"); } catch { /* ignore */ }
         setError(`Jadwal tidak dapat disimpan karena bentrok dengan program '${parts[2]}' di saluran ini pada ${formatDaysOfWeek(days)}. Program yang sudah ada: ${parts[4]}–${parts[5]} WIB.`);
      } else {
         setError(err.message);
      }
    };

    if (item) {
      const { error: err } = await supabase.from("schedules").update(dbValue).eq("id", item.id);
      if (err) handleErr(err);
      else {
        onSaved(true);
        onClose();
      }
    } else {
      const { error: err } = await supabase.from("schedules").insert(dbValue);
      if (err) handleErr(err);
      else {
        onSaved(true);
        onClose();
      }
    }
    setLoading(false);
  }
  return (
    <form onSubmit={save} className="form-stack">
      <Field label="Nama program">
        <input
          name="program"
          defaultValue={item?.program}
          required
          maxLength={100}
          autoFocus
          disabled={loading}
        />
      </Field>
      <div className="form-two-columns">
        <Field label="Saluran">
          <select name="channel" defaultValue={item?.channel ?? "pro1"} disabled={loading}>
            {data.stations.map((s) => (
              <option key={s.id} value={s.id}>
                {channelName(s.id)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pilih hari">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <label key={d} className="flex items-center gap-1 bg-surface-container py-1 px-2 rounded cursor-pointer hover:bg-surface-container-high transition-colors text-sm">
                  <input type="checkbox" checked={selectedDays.includes(d)} onChange={() => toggleDay(d)} disabled={loading} className="cursor-pointer" />
                  <span>{["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][d - 1]}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs">
               <span className="text-secondary">Preset:</span>
               <button type="button" className="text-primary hover:underline" onClick={() => setPreset([1,2,3,4,5])}>Senin–Jumat</button>
               <button type="button" className="text-primary hover:underline" onClick={() => setPreset([6,7])}>Akhir Pekan</button>
               <button type="button" className="text-primary hover:underline" onClick={() => setPreset([1,2,3,4,5,6,7])}>Setiap Hari</button>
            </div>
            {selectedDays.length > 0 && (
               <div className="text-xs text-secondary mt-1">Dipilih: <strong>{formatDaysOfWeek(selectedDays)}</strong></div>
            )}
          </div>
        </Field>
        <Field label="Jam mulai">
          <input
            type="time"
            name="start"
            defaultValue={item?.start ?? "08:00"}
            required
            disabled={loading}
          />
        </Field>
        <Field label="Jam selesai">
          <input
            type="time"
            name="end"
            defaultValue={item?.end ?? "09:00"}
            required
            disabled={loading}
          />
        </Field>
      </div>
      <Field label="Penyiar (opsional)">
        <input name="presenter" defaultValue={item?.presenter} maxLength={80} disabled={loading} />
      </Field>
      <p className="text-secondary text-sm">
        Jam selesai yang lebih awal berarti program berakhir pada hari
        berikutnya.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <FormActions onCancel={onClose} />
    </form>
  );
}
export function ScheduleManager() {
  const data = useBoardData();
  const now = useClock();
  const [channel, setChannel] = useState("all");
  const [editing, setEditing] = useState<Schedule | null | undefined>();
  const [message, setMessage] = useState("");
  const supabase = createClient();
  
  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (!error) setMessage(savedMessage(true));
  };

  const items = data.schedules
    .filter((s) => channel === "all" || s.channel === channel)
    .sort(
      (a, b) =>
        a.start.localeCompare(b.start) || a.channel.localeCompare(b.channel),
    );
    
  return (
    <>
      <PageHeading
        title="Jadwal Program"
        description={`Susun program harian untuk seluruh saluran. Zona waktu: ${data.settings.timezone}.`}
        action={
          <button className="button primary" onClick={() => setEditing(null)}>
            <Plus size={17} />
            Tambah jadwal
          </button>
        }
      />
      <Notice message={message} />
      <div className="table-toolbar">
        <select
          aria-label="Filter saluran"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <option value="all">Semua saluran</option>
          {data.stations.map((s) => (
            <option key={s.id} value={s.id}>
              {channelName(s.id)}
            </option>
          ))}
        </select>
        <span>{items.length} program</span>
      </div>
      <div className="table-wrap panel">
        <table>
          <thead>
            <tr>
              <th>SALURAN</th>
              <th>WAKTU</th>
              <th>PROGRAM</th>
              <th>PENYIAR</th>
              <th>HARI</th>
              <th>STATUS</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const current = isCurrent(item, now, data.settings.timezone);
              const available = hasStream(
                data.stations.find((s) => s.id === item.channel)!.streamUrl,
              );
              return (
                <tr key={item.id} className={current ? "current-row" : ""}>
                  <td>
                    <ChannelBadge channel={item.channel} />
                  </td>
                  <td className="tabular-nums whitespace-nowrap">
                    {item.start} – {item.end}
                  </td>
                  <td>
                    <strong>{item.program}</strong>
                  </td>
                  <td>{item.presenter || "—"}</td>
                  <td>
                    {formatDaysOfWeek(item.daysOfWeek)}
                  </td>
                  <td>
                    {current && available ? (
                      <BroadcastStatus available />
                    ) : (
                      <span className="text-secondary">
                        {current ? "Saat ini" : "Terjadwal"}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        aria-label={`Edit ${item.program}`}
                        onClick={() => setEditing(item)}
                      >
                        <Pencil size={16} />
                      </button>
                      <DeleteButton
                        title={item.program}
                        onDelete={() => deleteItem(item.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!items.length && (
          <EmptyState>Belum ada jadwal untuk saluran ini.</EmptyState>
        )}
      </div>
      {editing !== undefined && (
        <Modal
          title={editing ? "Edit jadwal" : "Tambah jadwal"}
          onClose={() => setEditing(undefined)}
        >
          <ScheduleForm
            item={editing}
            onClose={() => setEditing(undefined)}
            onSaved={(p) => setMessage(savedMessage(p))}
          />
        </Modal>
      )}
    </>
  );
}
