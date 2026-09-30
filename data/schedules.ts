import type { Schedule, ChannelId } from "./types";
const programs: Record<ChannelId, string[]> = {
  pro1: [
    "Teman Malam",
    "Selamat Pagi Ranah Minang",
    "Dialog Padang Pagi",
    "Pesona Indonesia",
    "Musik Nusantara",
    "Sore di Ranah Minang",
    "Warta Berita",
    "Ruang Cerita",
  ],
  pro2: [
    "Pro 2 Night Session",
    "Morning Vibes",
    "Ruang Kreatif",
    "Siang Bareng Pro 2",
    "Pro 2 Hits Minang",
    "Youth Beats",
    "Indie Lokal",
    "Cerita Malam",
  ],
  pro4: [
    "Gendang Ranah Minang",
    "Pagi Berbudaya",
    "Kaba Minangkabau",
    "Warisan Nusantara",
    "Dendang Minang",
    "Ranah Bundo",
    "Saluang & Randai",
    "Cerita dari Nagari",
  ],
};
const times = [
  "00:00",
  "06:00",
  "09:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
  "00:00",
];
export const schedules: Schedule[] = (
  Object.keys(programs) as ChannelId[]
).flatMap((channel) =>
  programs[channel].map((program, i) => ({
    id: `${channel}-${i}`,
    channel,
    start: times[i],
    end: times[i + 1],
    program,
    presenter: [
      "Tim RRI Padang",
      "Fajar Putra",
      "Nadia Putri",
      "Dika Pratama",
      "Rina Octavia",
      "Syafruddin K.",
      "Tim Redaksi",
      "Bella & Dika",
    ][i],
    day: "daily",
  })),
);
