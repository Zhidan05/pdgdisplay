# DESIGN.md — RRI Padang Info Board

## 1. Overview

Dokumen ini menjadi sumber acuan utama untuk desain ulang **RRI Padang Info Board** yang akan dibangun ulang menggunakan **React + Next.js**.

Fokus dokumen ini adalah **UI/UX dan visual system**.  
Implementasi backend, database, API, authentication, stream detection, dan business logic dibahas di dokumen teknis terpisah.

### Tujuan Rebuild

Rebuild dilakukan untuk:

- memodernisasi UI tanpa kehilangan identitas visual RRI,
- memisahkan dengan jelas fungsi antara **Live Stream**, **Main Poster**, **Info Terbaru**, **Jadwal Hari Ini**, dan **Running Text**,
- menghilangkan kebutuhan pengaturan manual `ON AIR / OFF AIR` pada desain sistem baru,
- menyediakan tampilan fallback yang tetap profesional saat tidak ada siaran,
- membuat admin panel lebih konsisten dan siap dikembangkan menggunakan Next.js,
- mengoptimalkan public board untuk layar TV 16:9.

---

# 2. Design Principles

## 2.1 Broadcast First

Public board harus terlihat seperti sistem informasi siaran televisi, bukan dashboard SaaS biasa.

Prioritas visual:

1. Live Broadcast
2. Main Promotional Poster
3. Jadwal Hari Ini
4. Info Terbaru
5. Running Text

## 2.2 Information Dense, Not Crowded

UI boleh memiliki banyak informasi, tetapi harus tetap:

- mudah dipindai,
- memiliki hierarchy yang jelas,
- tidak menggunakan terlalu banyak box,
- tidak memiliki padding berlebihan.

## 2.3 Image First

Konten visual RRI menjadi elemen utama.

Poster, thumbnail, dan media informasi tidak boleh terasa seperti elemen sekunder.

## 2.4 Desktop / TV First

PUBLIC INFO BOARD CANONICAL TARGET: 1920×1080 fullscreen.

When responsive tradeoffs occur, fullscreen layout takes priority over windowed layout.
- Main Poster container must enforce exact 4:5 ratio based on available height.
- Grid adapts around the poster.
- No letterboxing or blurred backgrounds for new uploads.

Target utama:

- Public board: **1920 × 1080**
- Admin: **1440 px–1920 px**

Mobile bukan prioritas utama.

## 2.5 Consistent RRI Identity

Warna saluran harus konsisten:

- PRO 1 → Orange
- PRO 2 → Cyan / Blue
- PRO 4 → Green

---

# 3. Visual Direction

## 3.1 Style

Gunakan gaya:

- dark navy,
- near-black background,
- clean broadcast interface,
- subtle border,
- minimal shadow,
- medium rounded corners,
- strong typography hierarchy.

Hindari:

- glassmorphism berlebihan,
- blur berlebihan,
- gradient dekoratif berlebihan,
- bentuk pill di semua elemen,
- card sangat besar dengan banyak ruang kosong,
- desain futuristik / sci-fi,
- visual generic SaaS.

---

# 4. Design Tokens

## 4.1 Colors

### Base

```css
--bg-page: #03111F;
--bg-sidebar: #020C17;
--bg-panel: #0B1B2B;
--bg-panel-alt: #102235;
--bg-input: #162A3D;

--border-default: #22384D;
--border-subtle: rgba(255, 255, 255, 0.08);

--text-primary: #F8FAFC;
--text-secondary: #A7B5C6;
--text-muted: #718399;
```

### Brand / Accent

```css
--rri-blue: #0084D6;
--accent-orange: #FF7A00;

--pro1: #FF7A00;
--pro2: #19B5E8;
--pro4: #24C77B;

--status-on-air: #22D99A;
--status-off-air: #7A899A;

--danger: #EF4444;
--warning: #F59E0B;
```

### Usage

- Orange digunakan sebagai accent utama untuk waktu, CTA penting, dan emphasis tertentu.
- Biru RRI digunakan sebagai primary interaction color.
- Hijau hanya digunakan untuk status aktif / `ON AIR`.
- Abu-abu digunakan untuk `OFF AIR` dan status nonaktif.

---

# 5. Typography

Gunakan sans-serif modern dan mudah dibaca dari jauh.

Rekomendasi:

- Inter
- Geist
- Plus Jakarta Sans

Untuk Next.js, preferensi utama:

```txt
Geist Sans
```

## Scale

```txt
12 px → metadata kecil
13 px → secondary label
14 px → body kecil
16 px → standard UI text
18 px → section title
20–24 px → program title
28–36 px → clock / primary visual number
```

### Weight

```txt
400 → body
500 → metadata penting
600 → button / section heading
700 → program title / primary label
```

---

# 6. Spacing

Gunakan spacing scale:

```txt
4 px
8 px
12 px
16 px
20 px
24 px
32 px
```

Default panel gap:

```txt
12–16 px
```

Default card padding:

```txt
16 px
```

---

# 7. Border Radius

Gunakan radius sedang.

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
```

Jangan menggunakan radius 20–32 px pada komponen utama.

---

# 8. Public Info Board

## 8.1 Target Display

Primary target:

```txt
1920 × 1080
16:9
```

Public board harus sebisa mungkin tampil penuh tanpa vertical scrolling.

Struktur utama:

```txt
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├─────────────────────┬───────────────────┬───────────────────┤
│                     │                   │                   │
│ LIVE STREAM         │ MAIN POSTER       │ JADWAL HARI INI  │
│                     │                   │                   │
├─────────────────────┤                   │                   │
│ INFO TERBARU        │                   │                   │
├─────────────────────┴───────────────────┴───────────────────┤
│ RUNNING TEXT                                              │
└─────────────────────────────────────────────────────────────┘
```

Approximate column proportions:

```txt
Left   : 44%
Center : 34%
Right  : 22%
```

Proporsi boleh disesuaikan selama visual balance tetap terjaga.

---

# 9. Public Header

Header harus compact.

## Isi

Urutan kiri ke kanan:

Urutan kiri ke kanan:

1. RRI logo
2. Alamat baris 1
3. Alamat baris 2
4. Hari, Tanggal (Blok Kiri)
5. Jam digital, Zona waktu (Blok Kanan)
6. Broadcast status
7. PRO 1
8. PRO 2
9. PRO 4
10. Utility actions bila diperlukan

Date & Time Layout: DUA block sibling dengan ukuran visual sama. 
Hari + tanggal: LEFT. 
Jam: RIGHT. 
Equal width, equal height, aligned vertically.
Pemisah mengandalkan spacing, alignment, atau 1px subtle divider.
TIDAK MENGGUNAKAN panel background tambahan, border, card, atau rounded rectangle.

Contoh:

```txt
[RRI LOGO] | Jl. Jenderal Sudirman No. 12
             Padang, Sumatera Barat
```

```txt
RABU             | 19:40:25
30 SEPTEMBER 2026| WIB
```

## Channel State

Channel aktif memiliki:

- border lebih terang,
- subtle outer glow,
- warna identitas saluran.

Status:

```txt
ON AIR  → green
OFF AIR → gray
```

Header tidak boleh terlalu tinggi.

Target tinggi:

```txt
72–92 px
```

---

# 10. Live Stream Panel

Live stream merupakan konten utama di kolom kiri atas.

## 10.1 State: Stream Available

Tampilkan:

- video stream,
- logo PRO aktif,
- current program,
- presenter,
- optional time range,
- ON AIR badge.

Overlay tidak boleh menutupi terlalu banyak video.

### Overlay layout

Top-left:

```txt
[PRO 1]
LIVE
MUSIK NUSANTARA
Penyiar: Rina
```

Top-right:

```txt
ON AIR
```

---

# 11. Stream Offline State

Pada sistem baru, tidak ada lagi toggle manual `ON AIR / OFF AIR`.

Secara visual, desain harus mempersiapkan state:

```txt
stream URL tersedia     → ON AIR
stream URL tidak ada    → OFF AIR
```

> Catatan: logic tersebut tidak termasuk dalam tahap desain Stitch.

Jika tidak ada stream:

- jangan tampilkan player kosong,
- jangan tampilkan error YouTube,
- jangan tampilkan black screen,
- tampilkan gambar statis **Gedung RRI Padang**.

Contoh:

```txt
┌─────────────────────────────────────┐
│                                     │
│        [GEDUNG RRI PADANG]          │
│                                     │
│          SIARAN OFF AIR             │
│                                     │
└─────────────────────────────────────┘
```

Text boleh menggunakan:

```txt
SIARAN SEDANG TIDAK TERSEDIA
```

atau:

```txt
OFF AIR
```

Fallback harus terlihat seperti intentional broadcast state, bukan error page.

---

# 12. Main Poster

Panel tengah bukan lagi area informasi lengkap.

Namanya secara internal:

```txt
Main Poster
```

Tidak perlu menampilkan heading di public board.

## Fungsi

Menampilkan poster promosi utama.

Default ratio:

```txt
4:5
1080 × 1350
```

Contoh penggunaan:

- poster event,
- kampanye RRI,
- announcement,
- program khusus,
- promosi komunitas.

## Rules

HILANGKAN:

HILANGKAN:

- label `INFO TERBARU`,
- judul di bawah poster,
- caption,
- deskripsi,
- kategori,
- tanggal,
- metadata lainnya,
- blurred backdrop,
- duplicate blurred image.

Poster harus menjadi elemen visual utama.

Container Gambar Utama WAJIB:
```css
aspect-ratio: 4 / 5;
```

Image WAJIB:
```css
width: 100%;
height: 100%;
object-fit: cover;
```

Tidak boleh ada: letterbox, pillarbox, atau blank space. Display menggunakan `object-fit: cover` sebagai fallback.
Upload admin mewajibkan cropping 4:5 jika rasio awal tidak sesuai.

Container harus menggunakan area sebanyak mungkin.

Bila ada beberapa poster:

- tampilkan carousel,
- pagination menggunakan dots kecil,
- dots tidak boleh terlalu dominan.

---

# 13. Info Terbaru

Section lama:

```txt
ACARA UNGGULAN
```

diubah menjadi:

```txt
INFO TERBARU
```

Info Terbaru menjadi area visual multi-format.

## 13.1 Supported Ratios

Media dapat menggunakan:

```txt
16:9
4:3
1:1
4:5
3:4
```

Jangan memaksa semua gambar menjadi ratio yang sama.

## 13.2 Content

Satu item dapat memiliki:

- image,
- title,
- description,
- category,
- publication date.

Namun gambar tetap harus menjadi focal point.

## 13.3 Layout

Contoh horizontal:

```txt
┌──────────────────────────────────────────────┐
│ INFO TERBARU                                 │
├──────────────────┬───────────────────────────┤
│                  │ Judul Informasi           │
│      IMAGE       │                           │
│                  │ Deskripsi singkat         │
│                  │                           │
│                  │ Kategori • 29 Sep 2026    │
└──────────────────┴───────────────────────────┘
```

Untuk gambar portrait:

```txt
┌────────────────┬─────────────────────────────┐
│                │                             │
│                │ Judul                       │
│   PORTRAIT     │                             │
│    IMAGE       │ Deskripsi                   │
│                │                             │
│                │ Metadata                    │
└────────────────┴─────────────────────────────┘
```

Carousel boleh menggunakan:

- dots,
- arrows,
- auto rotation.

---

## 14. Jadwal Hari Ini

Kolom kanan digunakan untuk program hari ini.

Tampilkan TIGA section jadwal secara bersamaan: 
- PRO 1
- PRO 2
- PRO 4

Setiap section menampilkan MAKSIMAL 2 JADWAL (1 Current + 1 Next, atau 2 Next).
Tidak ada scrolling/overflow pada jadwal.
Navigasi channel atas tetap berfungsi TAPI hanya untuk mengubah target live stream (audio), tidak mengubah section Jadwal Hari Ini.

Heading:

```txt
JADWAL HARI INI
```

Setiap schedule item menampilkan:

- jam mulai,
- nama program,
- penyiar,
- rentang waktu.

Identitas stasiun pada panel jadwal (PRO 1, PRO 2, PRO 4) ditampilkan langsung menggunakan logo dan frekuensi, TANPA background kotak putih/card/container. Navigasi channel di Header utama TETAP mempertahankan gaya tombol/box-nya.

Contoh:

```txt
[PRO 1 LOGO] 95.9 FM
---------------------
14:00
Musik Nusantara
Penyiar: Rina
14:00 – 16:00 WIB
ON AIR

16:00
Pro 1 RRI — Sore Ini
```

## Current Program

Program aktif memiliki:

- orange accent bar,
- stronger background,
- ON AIR badge.

Program berikutnya lebih neutral.

UI harus padat karena menampilkan jadwal untuk ketiga PRO channel tanpa scrolling.

---

# 15. Running Text

Running text selalu berada di bagian paling bawah.

Layout:

```txt
┌──────────────┬───────────────────────────────────────────────┐
│ RUNNING TEXT │ Selamat datang ... | Informasi terkini ...   │
└──────────────┴───────────────────────────────────────────────┘
```

Label kiri memiliki background accent.

Text bergerak horizontal dari kanan ke kiri.

Separator:

```txt
|
```

atau vertical divider tipis.

Running text harus menyerupai broadcast lower-third.

---

# 16. Admin Panel

Admin tetap menggunakan struktur:

```txt
SIDEBAR + MAIN CONTENT
```

## Sidebar

Header:

```txt
RRI Logo

INFO BOARD RRI
ADMIN PANEL
```

Navigation:

```txt
MENU UTAMA

Dashboard
Streaming
Jadwal Program
Info Terbaru
Status Siaran
Running Text

KONFIGURASI

Pengaturan
```

Hapus menu:

```txt
Acara Unggulan
```

karena fungsi tersebut sudah digabung ke:

```txt
Info Terbaru
```

---

# 17. Admin Dashboard

Dashboard menampilkan overview sistem.

## Statistic Cards

```txt
Status Siaran
Jadwal Hari Ini
Info Terbaru
Active Streams
```

Contoh:

```txt
Status Siaran
1 / 3 ON

Jadwal Hari Ini
28 Program

Info Terbaru
8 Post

Active Streams
1 Channel
```

---

# 18. Realtime Channel Cards

Tampilkan:

```txt
PRO 1
PRO 2
PRO 4
```

Setiap card berisi:

- status,
- frequency,
- current program,
- presenter,
- current time range,
- next program.

Contoh:

```txt
PRO 1
95.9 FM

ON AIR

Musik Nusantara
Penyiar: Rina
14:00 – 16:00

Berikutnya:
Pro 1 RRI — Sore Ini
16:00
```

---

# 19. Quick Actions

Quick action yang tersedia:

```txt
Update Streaming
Tambah Jadwal
Kelola Info Terbaru
Running Text
Pengaturan
```

Gunakan icon + label.

Jangan membuat card terlalu besar.

---

# 20. Admin — Streaming

Streaming page terdiri dari tiga card:

```txt
PRO 1
PRO 2
PRO 4
```

Setiap card berisi:

- station badge,
- frequency,
- stream preview,
- stream URL field,
- nama stasiun,
- frequency field,
- save button.

## Tidak Ada Toggle Manual

Jangan tampilkan:

```txt
ON AIR / OFF AIR switch
```

Status dianggap berasal dari stream availability.

Preview state:

### Stream Available

```txt
[ VIDEO PREVIEW ]

Stream detected
```

### Stream Missing

```txt
[ RRI PADANG OFFICE IMAGE ]

No stream detected
```

---

# 21. Admin — Jadwal Program

Page menggunakan data table.

Filter:

```txt
Semua Saluran
PRO 1
PRO 2
PRO 4
```

Columns:

```txt
Saluran
Waktu
Nama Program
Penyiar
Hari / Tanggal
Status
Aksi
```

Action utama:

```txt
+ Tambah Jadwal Baru
```

Row actions:

```txt
Edit
Delete
```

Table harus compact.

---

# 22. Admin — Info Terbaru

Page ini menggabungkan fungsi:

```txt
Info Terbaru lama
+
Acara Unggulan lama
```

## Content Fields

Item memiliki:

- image,
- title,
- optional description,
- category,
- publication date,
- status,
- order,
- display placement.

## Placement

```txt
Main Poster
Info Carousel
Both
```

## Image Ratio

Supported ratio:

```txt
16:9
4:3
1:1
4:5
3:4
```

Admin harus dapat melihat thumbnail tanpa distorsi.

Suggested table:

```txt
Thumbnail
Judul
Kategori
Ratio
Placement
Tanggal
Status
Urutan
Aksi
```

---

# 23. Admin — Status Siaran

Halaman ini bersifat monitoring.

Jangan gunakan editable switch.

Setiap channel card:

```txt
PRO 1
95.9 FM

ON AIR

Stream Detected
Current Program
Stream Source
Last Status Update
```

atau:

```txt
PRO 1
95.9 FM

OFF AIR

No Stream Detected
Fallback Image Active
```

Status harus terasa otomatis dan read-only.

---

# 24. Admin — Running Text

Table:

```txt
Urutan
Konten Teks
Status
Aksi
```

Action:

```txt
+ Tambah Running Text
Edit
Delete
Activate / Deactivate
```

---

# 25. Admin — Pengaturan

Fields minimum:

```txt
Nama Stasiun Penyiaran

RRI PADANG
```

```txt
Judul Info Board

INFO BOARD — Radio Republik Indonesia
```

```txt
Zona Waktu

Asia/Jakarta (WIB)
```

Optional:

```txt
Fallback Image

RRI Padang Office Building
```

Primary action:

```txt
Simpan Pengaturan
```

---

# 26. UI States

Semua komponen harus mempertimbangkan state berikut.

## Loading

Gunakan skeleton yang mengikuti bentuk komponen.

Jangan menggunakan spinner besar di tengah layar kecuali diperlukan.

## Empty

Gunakan icon sederhana + text.

Contoh:

```txt
Belum ada jadwal hari ini.
```

## Error

Error tidak boleh merusak layout.

Gunakan compact inline alert.

## Disabled

Kurangi opacity tetapi tetap readable.

---

# 27. Buttons

## Primary

```txt
Blue background
White text
```

## Secondary

```txt
Dark background
Subtle border
White text
```

## Danger

```txt
Dark red tint
Red icon
```

## Icon Button

Default size:

```txt
36 × 36
```

---

# 28. Form Inputs

Input style:

```txt
dark background
1 px border
8 px radius
high contrast text
```

Focus:

```txt
blue border
subtle glow
```

Label menggunakan uppercase hanya bila sesuai.

---

# 29. Tables

Tables harus:

- compact,
- readable,
- sticky header bila list panjang,
- memiliki subtle row separator,
- tidak menggunakan zebra striping yang terlalu terang.

Row hover:

```txt
slightly lighter background
```

---

# 30. Icons

Gunakan satu icon library secara konsisten.

Recommended:

```txt
Lucide React
```

Hindari campuran banyak library icon.

---

# 31. Public Board Component Structure

Rekomendasi struktur komponen:

```txt
PublicBoard
├── BroadcastHeader
│   ├── RriBrand
│   ├── DateDisplay
│   ├── DigitalClock
│   ├── BroadcastStatus
│   └── ChannelSelector
│
├── PublicBoardGrid
│   ├── LeftColumn
│   │   ├── LiveStreamPanel
│   │   └── LatestInfoCarousel
│   │
│   ├── MainPoster
│   │
│   └── TodaySchedule
│
└── RunningTicker
```

---

# 32. Admin Component Structure

```txt
AdminLayout
├── AdminSidebar
├── AdminTopbar
└── AdminContent
```

Pages:

```txt
/admin
/admin/streaming
/admin/schedules
/admin/info
/admin/broadcast-status
/admin/running-text
/admin/settings
```

---

# 33. Suggested Next.js Route Structure

```txt
app/
├── page.tsx
│
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── streaming/
│   │   └── page.tsx
│   │
│   ├── schedules/
│   │   └── page.tsx
│   │
│   ├── info/
│   │   └── page.tsx
│   │
│   ├── broadcast-status/
│   │   └── page.tsx
│   │
│   ├── running-text/
│   │   └── page.tsx
│   │
│   └── settings/
│       └── page.tsx
│
└── api/
```

---

# 34. Responsive Behavior

## Public Board

Primary:

```txt
1920 × 1080
```

Secondary:

```txt
1366 × 768
```

Layout public board tidak perlu berubah drastis menjadi mobile layout.

Gunakan responsive scaling untuk:

- typography,
- panel gap,
- padding,
- poster size.

## Admin

Desktop:

```txt
>= 1280 px
```

Tablet:

```txt
768–1279 px
```

Mobile:

```txt
< 768 px
```

Mobile admin boleh menggunakan collapsible sidebar, tetapi bukan prioritas utama.

---

# 35. Accessibility

Minimum requirements:

- contrast ratio cukup tinggi,
- button memiliki focus state,
- form mempunyai label,
- jangan mengandalkan warna saja untuk status,
- `ON AIR` harus memiliki text selain green indicator,
- interactive element memiliki hover dan focus state,
- gunakan semantic HTML.

---

# 36. Motion

Motion harus subtle.

Allowed:

```txt
fade
small slide
pulse for ON AIR indicator
carousel transition
ticker movement
```

Avoid:

```txt
large bounce
aggressive zoom
3D card movement
constant background animation
```

---

# 37. ON AIR Animation

Indicator:

```txt
● ON AIR
```

Dot boleh menggunakan subtle pulse.

Durasi:

```txt
1.5–2 seconds
```

Jangan membuat seluruh card berkedip.

---

# 38. Main Poster Rotation

Jika lebih dari satu poster aktif:

```txt
rotation interval: 8–15 seconds
```

Transition:

```txt
fade
```

Tidak perlu slide agresif.

---

# 39. Latest Info Rotation

Info carousel dapat menggunakan:

```txt
8–12 seconds
```

User/admin tetap dapat berpindah manual bila tersedia.

---

# 40. Running Text Motion

Ticker harus bergerak konsisten.

Speed harus cukup lambat untuk dibaca dari TV.

Jangan reset dengan jump yang terasa kasar.

---

# 41. Future Broadcast Logic

Bagian ini menjadi arahan desain untuk implementasi selanjutnya.

## Expected Behavior

```txt
IF stream source exists
AND stream is considered available
THEN
    status = ON AIR
    show live player
ELSE
    status = OFF AIR
    show RRI Padang office fallback image
```

Tidak ada manual toggle pada UI final.

Admin hanya memonitor status.

---

# 42. Content Relationship

Struktur konten final:

```txt
LIVE STREAM
    ↓
stream broadcast

MAIN POSTER
    ↓
4:5 promotional poster
    ↓
no caption on public board

INFO TERBARU
    ↓
mixed-ratio media
    ↓
can contain title + description

JADWAL HARI INI
    ↓
daily broadcast schedule

RUNNING TEXT
    ↓
continuous ticker
```

---

# 43. Removed Concepts

Tidak digunakan lagi pada desain baru:

```txt
Acara Unggulan
```

Digabung ke:

```txt
Info Terbaru
```

Tidak digunakan lagi:

```txt
Manual ON AIR / OFF AIR toggle
```

Tidak digunakan pada Main Poster:

```txt
Info Terbaru heading
caption
category
publication date
long metadata
```

---

# 44. Stitch Reference Requirements

Saat membuat desain di Stitch:

- gunakan screenshot sistem lama sebagai structural reference,
- jangan redesign total hingga kehilangan layout asli,
- pertahankan RRI visual identity,
- prioritaskan desktop / TV,
- public board harus terlihat seperti actual broadcast signage,
- admin harus terlihat seperti broadcast control dashboard.

Stitch hanya digunakan untuk:

```txt
UI reference
visual exploration
layout reference
component styling reference
```

Stitch tidak bertanggung jawab untuk:

```txt
database
backend
API
authentication
stream validation
auto ON AIR logic
data persistence
```

---

# 45. Implementation Philosophy

Saat desain diterapkan ke Next.js:

- jangan menyalin hasil Stitch secara buta,
- gunakan reusable components,
- gunakan design tokens,
- hindari hardcoded style per page,
- gunakan layout primitives,
- pisahkan visual state dari business logic.

Recommended stack:

```txt
Next.js
TypeScript
Tailwind CSS
Lucide React
```

Optional:

```txt
shadcn/ui
```

Gunakan shadcn hanya bila komponen tetap dapat mengikuti identitas desain ini.

---

# 46. Definition of Done — UI

UI dianggap sesuai desain jika:

- public board dapat tampil penuh pada TV 16:9,
- Main Poster tampil 4:5 tanpa caption,
- Acara Unggulan sudah tidak ada,
- Info Terbaru mendukung berbagai ratio image,
- jadwal aktif terlihat jelas,
- live stream memiliki clean overlay,
- fallback OFF AIR menggunakan gambar Gedung RRI Padang,
- admin tidak memiliki manual ON/OFF toggle,
- Status Siaran bersifat monitoring,
- seluruh halaman menggunakan visual system yang konsisten,
- RRI PRO 1, PRO 2, dan PRO 4 tetap mudah dibedakan.

---

# 47. Summary

Final public architecture:

```txt
HEADER
+
LIVE STREAM
+
MAIN POSTER
+
INFO TERBARU
+
JADWAL HARI INI
+
RUNNING TEXT
```

Final admin architecture:

```txt
Dashboard
Streaming
Jadwal Program
Info Terbaru
Status Siaran
Running Text
Pengaturan
```

Prinsip terpenting:

> **Public board adalah media broadcast visual, bukan dashboard administrasi.**
>
> **Admin panel mengelola konten, sementara status siaran pada sistem baru diperlakukan sebagai status otomatis berdasarkan ketersediaan stream.**
