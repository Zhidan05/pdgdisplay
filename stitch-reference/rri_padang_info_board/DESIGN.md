---
name: RRI Padang Info Board
colors:
  surface: '#041424'
  surface-dim: '#041424'
  surface-bright: '#2b3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1d2d'
  surface-container: '#112131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#bfc7d3'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233242'
  outline: '#8a919d'
  outline-variant: '#404751'
  surface-tint: '#9ccaff'
  primary: '#9ccaff'
  on-primary: '#003256'
  primary-container: '#2e96e9'
  on-primary-container: '#002b4c'
  inverse-primary: '#0062a0'
  secondary: '#ffb68b'
  on-secondary: '#522300'
  secondary-container: '#ff7f1c'
  on-secondary-container: '#602a00'
  tertiary: '#6dd2ff'
  on-tertiary: '#003547'
  tertiary-container: '#009cca'
  on-tertiary-container: '#002e3e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d0e4ff'
  primary-fixed-dim: '#9ccaff'
  on-primary-fixed: '#001d35'
  on-primary-fixed-variant: '#00497a'
  secondary-fixed: '#ffdbc8'
  secondary-fixed-dim: '#ffb68b'
  on-secondary-fixed: '#321200'
  on-secondary-fixed-variant: '#753400'
  tertiary-fixed: '#bfe9ff'
  tertiary-fixed-dim: '#6dd2ff'
  on-tertiary-fixed: '#001f2a'
  on-tertiary-fixed-variant: '#004d65'
  background: '#041424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
  bg-page: '#03111F'
  bg-sidebar: '#020C17'
  bg-panel-alt: '#102235'
  bg-input: '#162A3D'
  border-default: '#22384D'
  border-subtle: rgba(255, 255, 255, 0.08)
  text-primary: '#F8FAFC'
  text-secondary: '#A7B5C6'
  text-muted: '#718399'
  pro1: '#FF7A00'
  pro2: '#19B5E8'
  pro4: '#24C77B'
  status-on-air: '#22D99A'
  status-off-air: '#7A899A'
  danger: '#EF4444'
  warning: '#F59E0B'
typography:
  display-clock:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-clock-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.02em
  title-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  body-default:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  ticker-text:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.75rem
  margin: 1.5rem
  margin-signage: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies an authoritative, mission-critical broadcast aesthetic engineered specifically for high-visibility public information displays and technical broadcast control environments. The emotional response is centered on institutional trust, live immediacy, and calm operational precision. The design eliminates decorative noise to guarantee high-contrast legibility across wide distances on 16:9 digital signage hardware as well as operational clarity in desktop control consoles.

The visual style blends **Corporate Modern** structure with **Broadcast Master Control** functionalism:
- Dark navy canvas surfaces provide an ink-dense foundation that reduces panel backlight bleed on large format screens.
- Strict chromatic channel identities (PRO 1, PRO 2, PRO 4) anchor information architecture instantaneously.
- Minimalist heads-up display (HUD) micro-elements and live status indicators convey transmission fidelity without intruding upon media content.
- Restrained, crisp 1px borders define structure instead of ambient shadows or skeuomorphic elevation.

## Colors

The design system operates exclusively in a calibrated dark broadcast mode; light mode surfaces are disallowed to maintain legibility on commercial display panels and ensure contrast longevity in ambient viewing conditions.

### Surface Tiers
- **Canvas Base (`bg-page` / `#03111F`)**: Deepest near-black navy, acting as the root viewport surface.
- **Sidebar Surface (`bg-sidebar` / `#020C17`)**: Dense foundation for fixed admin navigation rails.
- **Primary Panel (`neutral_color_hex` / `bg-panel` / `#0B1B2B`)**: Standard background for cards, schedule containers, and module shells.
- **Alternate Panel (`bg-panel-alt` / `#102235`)**: Elevated card variant, active list row selection, and hover state background.
- **Interactive Input Surface (`bg-input` / `#162A3D`)**: Background fill for forms, time selectors, and search fields.

### Brand & Channel Semantics
- **Interactive Action (`primary_color_hex` / `#0084D6`)**: RRI institutional blue, reserved for primary CTA buttons, active tab indicators, and input focus outlines.
- **Display Accent (`secondary_color_hex` / `#FF7A00`)**: Broadcast orange utilized for high-urgency temporal cues, the digital clock display, and PRO 1 channel signatures.
- **Channel Identifiers**:
  - `pro1` (`#FF7A00`): Orange branding bar and metadata tags for PRO 1.
  - `pro2` (`#19B5E8`): Vivid cyan branding tags for PRO 2.
  - `pro4` (`#24C77B`): Fresh emerald branding tags for PRO 4.

### Broadcast Status
- **ON AIR (`status-on-air` / `#22D99A`)**: Signals an active, verified audio/video stream transmission.
- **OFF AIR (`status-off-air` / `#7A899A`)**: Muted slate gray denoting an inactive broadcast, fallback visual trigger, or idle channel state.
- **Destructive & Warning**: `#EF4444` (`danger`) for live stream termination or data deletion; `#F59E0B` (`warning`) for system warnings and signal anomalies.

## Typography

Typography prioritizes technical precision, variable tabular sizing for timecodes, and optimal legibility across distance. Geist is used for all numerals, display clocks, section headers, and HUD data tags due to its mechanical geometry and precise letterform spacing. Inter serves as the utilitarian body engine for descriptions, news tickers, and administrative forms.

### Hierarchy & Usage
- **Display Clock (`display-clock`)**: Monospaced tabular numeral configuration used exclusively for system time and countdown timers to eliminate layout jitter.
- **Section Headers (`headline-md`)**: Rendered in uppercase with slight positive tracking (`0.02em`) for institutional panel demarcations (e.g., `JADWAL HARI INI`, `INFO TERBARU`).
- **Body & Captions (`body-sm`, `label-sm`)**: Secondary parameters, timestamps, channel frequencies (e.g., `97.5 FM`), and presenter names set with high legibility against dark slate surfaces.
- **Ticker Text (`ticker-text`)**: Fluid text rendered at medium weight to ensure horizontal scrolling motion remains flicker-free on 60Hz and 50Hz signage hardware.

## Layout & Spacing

The design system enforces two strict operational viewport paradigms:
1. **Public Digital Signage Board (Fixed 16:9 Display)**: Zero page-level scroll. All content conforms entirely to viewport boundaries at `1920 × 1080` (fallback `1366 × 768`), using dynamic flex and CSS Grid spanning.
2. **Desktop Broadcast Admin Console**: A responsive management interface adapting between fluid multi-column desktop environments (`≥1280px`), tablets (`768px - 1279px`), and mobile inspection panes (`<768px`).

### Public Board Grid Blueprint (16:9 Landscape)
- **Header**: Fixed height between `72px` and `92px`, containing live station branding, real-time clock, transmission status, and active channel toggles.
- **Body Grid**: Three-column asymmetric layout structured as:
  - **Left Column (~44%)**: Vertically split container housing the primary 16:9 Live Stream Player / Fallback Card stacked above the Info Terbaru multi-format carousel.
  - **Center Column (~34%)**: Full-height promotional poster container optimized for 4:5 vertical artwork.
  - **Right Column (~22%)**: Compact schedule feed (`Jadwal Hari Ini`) highlighting the current on-air program and subsequent schedules.
- **Footer**: Fixed `44px` to `48px` full-width running text ticker pinned flush to the bottom edge.

### Rhythm & Alignment
Spacing adheres to a strict 4px grid. Inter-panel spacing is anchored at `gutter-compact` (`12px`) or `gutter` (`16px`) to maximize data density while preserving distinct panel separation. Outer display margin is set to `margin-signage` (`16px`) on public boards to prevent overscan issues on commercial TV monitors.

## Elevation & Depth

Visual hierarchy relies on structured tonal layering, crisp micro-borders, and targeted optical glows rather than standard fuzzy drop shadows or glassy blurs.

### Tonal Hierarchy
- **Canvas Base Layer (`#03111F`)**: Lowest z-index foundation.
- **Card Tier 1 (`#0B1B2B`)**: Baseline interactive container, framed by a `1px` border of `rgba(255, 255, 255, 0.08)` (`--border-subtle`).
- **Active / Accent Tier 2 (`#102235`)**: Elevated card variant utilized for the current on-air program segment, highlighted carousel items, and active table rows.

### Outlines and Focus Glows
- Standard panel elevation uses ghost outlines: `1px solid rgba(255, 255, 255, 0.08)`.
- Interactive inputs and active controls shift their border to `#0084D6` with an accompanying subtle field aura (`box-shadow: 0 0 0 2px rgba(0, 132, 214, 0.25)`).
- Active channel identifiers utilize a channel-tinted glow (e.g., `0 0 12px rgba(255, 122, 0, 0.3)` for PRO 1) to convey hardware-like backlighting.

### Overlays
HUD elements sitting on top of live video (such as station bug marks and `ON AIR` badges) employ high-density solid slate containers with `0.85` alpha backing (`rgba(11, 27, 43, 0.85)`) and `1px` subtle borders, ensuring legibility without masking underlying video feeds.

## Shapes

The design system uses precise, controlled corner radii to maintain an architectural, technical aesthetic. Deep pill shapes and exaggerated consumer radii are strictly avoided.

### Radii Tokens
- **Micro / Badge Radius (`6px` / `rounded-sm`)**: Status indicators, live pill tags, stream bit-rate chips, and carousel dot indicators.
- **Component Radius (`8px` / `rounded-md`)**: Interactive action buttons, input fields, dropdown trigger buttons, and audio player controls.
- **Panel / Frame Radius (`12px` / `rounded-lg`)**: Primary structural panels, live video viewports, schedule containers, and promotional poster enclosures.

### Geometry Constraints
All media containers must enforce `overflow: hidden` to preserve the outer `12px` frame. Sharp zero-radius edges are reserved solely for full-bleed viewport boundaries and the bottom ticker tape.

## Components

### Buttons & Interactive Triggers
- **Primary Button**: Solid fill `#0084D6`, text `#F8FAFC`, radius `8px`. Hover: `#0572B7`. Focus: 2px offset glow.
- **Secondary / Neutral Button**: Solid fill `#0B1B2B`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#A7B5C6`. Hover: background `#102235`, text `#F8FAFC`.
- **Destructive Button**: Fill `rgba(239, 68, 68, 0.15)`, border `1px solid #EF4444`, text `#EF4444`. Hover: fill `rgba(239, 68, 68, 0.25)`.
- **Icon Buttons**: Fixed `36 × 36px` bounding box, flex-centered, supporting Lucide React SVG assets at `18px` scale.

### Status Indicators & HUD Badges
- **`ON AIR` Badge**: Contained HUD chip (`radius-sm`), background `rgba(34, 217, 154, 0.12)`, border `1px solid #22D99A`, text `#22D99A`, font Geist `12px` bold. Preceded by an `8px` circular green indicator pulsing continuously (`1.5s` linear fade cycle).
- **`OFF AIR` Badge**: Background `rgba(122, 137, 154, 0.12)`, border `1px solid #7A899A`, text `#7A899A`, static without pulse.
- **Channel Identity Badges**: Muted tinted background with high-contrast text and a left-aligned solid vertical bar (`3px`) tinted with the respective channel token (`--pro1`, `--pro2`, `--pro4`).

### Cards & Panels
- **Standard Panel**: Background `#0B1B2B`, border `1px solid rgba(255, 255, 255, 0.08)`, internal padding `16px`, radius `12px`.
- **Active Schedule Card**: Background `#102235`, left border accent `4px solid #FF7A00` (or active channel hue), radius `8px`, displaying live program title (`title-sm`), presenter metadata (`label-sm`), and time range.
- **Upcoming Schedule Item**: Background `transparent`, bottom border `1px solid rgba(255, 255, 255, 0.05)`, padded vertically by `8px`.

### Media Containers
- **Main Poster Frame**: Fixed `4:5` aspect ratio (`1080 × 1350` native scale), `object-fit: contain`, background `#020C17`, framed with a `1px solid #22384D` perimeter.
- **Live Stream Player Frame**: Fixed `16:9` ratio container. If the stream URL is absent or offline, automatically render the deterministic fallback graphic (*Gedung RRI Padang*) overlaid with an informational status modal.

### Form Inputs & Selectors
- **Input Fields**: Background `#162A3D`, border `1px solid #22384D`, text `#F8FAFC`, placeholder `#718399`, height `40px`, padding `0 12px`, radius `8px`.
- **Active / Focused Input**: Border `#0084D6`, outer ring `0 0 0 2px rgba(0, 132, 214, 0.2)`.

### Running Lower-Third Ticker
- **Structure**: Full-width container pinned to bottom screen edge, height `44px`, background `#020C17`, top border `1px solid #22384D`.
- **Prefix Header**: Solid `#FF7A00` block reading `INFO TERKINI` or `RRI UPDATE`, font Geist `13px` bold, text `#020C17`.
- **Text Rail**: Right-to-left linear seamless translation, font Inter `15px`, color `#F8FAFC`, items separated by vertical rule symbols (`|`) in `#718399`.