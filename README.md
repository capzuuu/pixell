# 🎬 Pixell — Modern Cinematic Streaming Platform MVP

**Pixell** is a full-stack, scalable, modern commercial-grade streaming platform for movies, TV series, episodes, and original video content. Designed with a dark cinematic aesthetic, responsive design, full video playback infrastructure, continue watching progress tracking, user watchlists, watch history, and an administrative management dashboard.

---

## 🌟 Key Features

### 🍿 Viewer & Streaming Experience
- **Cinematic Hero Carousel**: Dynamic featured hero banners with high-definition backdrops, title synopses, genre badges, age ratings, direct play buttons, trailer preview modals, and watchlist toggles.
- **Dedicated Custom Video Player (`/watch/movie/:id` & `/watch/episode/:id`)**:
  - Fullscreen custom video player overlay that auto-hides during playback.
  - Play, Pause, 10s Rewind, 10s Fast-Forward, Interactive Seek Timeline with timestamp indicators.
  - Smooth Volume Slider & Mute Toggle.
  - Playback Speed Selector (`0.5x`, `0.75x`, `1x`, `1.25x`, `1.5x`, `2x`).
  - Series Episodes Drawer for instant switching between episodes while watching.
  - Next Episode auto-advance for TV series.
  - Keyboard shortcuts (`Space`/`k`, `j`/`l` seek, `m` mute, `f` fullscreen, `Esc`).
  - Automatic watch progress synchronization every 5 seconds.
  - Auto-Resume playback from exact saved position when returning.
- **Home Feed (`/`)**:
  - **Continue Watching** row with live percentage progress bar.
  - **Trending Now**, **Popular Movies**, **Popular TV Series**, **Recently Added Series**.
  - **Browse by Genre** pills for quick navigation.
- **Movies Catalog (`/movies`)**:
  - Multi-faceted filter bar: Genre, Release Year, Age Rating, Sort (Popular, Newest, Oldest, Highest Rated, Title A-Z).
  - Responsive cards with poster hover zoom, rating badge, and quick play/watchlist actions.
- **TV Series Catalog (`/series`)**:
  - Complete TV series explorer with season badges and genre filtering.
- **Movie Details (`/movie/:slug`)**:
  - Full-bleed backdrop, trailer preview modal, storyline synopsis, release specifications, and similar recommendations.
- **TV Series Details (`/series/:slug`)**:
  - Interactive Season selector dropdown (`Season 1`, `Season 2`...).
  - Episode list with thumbnails, durations, air dates, plot synopses, and direct stream buttons.
- **Live Search (`/search`)**:
  - Real-time debounced global search across titles, genres, descriptions, and actors.
  - Grouped into distinct Movies and TV Series result sections with result counts.
- **My Saved List (`/my-list`)**:
  - Personal watchlist with filters (`All`, `Movies`, `Series`) and empty states.
- **Watch History (`/history`)**:
  - Chronological timeline of streamed content with timestamps, progress bars, and single/bulk clear options.

### 🛡️ Administrator Management Dashboard (`/admin`)
- **Overview Dashboard (`/admin`)**:
  - Real-time platform metrics: Total Users, Total Movies, Total Series, Total Episodes, Total Watch Streams.
  - Live viewer stream telemetry with completion percentages.
- **Movie Management (`/admin/movies`)**:
  - Create, Edit, Delete movies with full metadata, video stream URLs, poster/backdrop URLs, duration, and genres.
  - 1-click Publish/Unpublish toggle and Hero Featured toggle.
- **Series Management (`/admin/series`)**:
  - Create, Edit, Delete TV series, toggle publication, and jump directly to episode managers.
- **Season & Episode Management (`/admin/episodes`)**:
  - Create Seasons, Add/Edit/Delete Episodes with video URLs, thumbnails, duration, and episode numbering.
- **Genre Management (`/admin/genres`)**:
  - Manage categories, taxonomy, and URL slugs.
- **User Management (`/admin/users`)**:
  - Search registered users, change roles (`USER` <-> `ADMIN`), delete accounts.

---

## 🏗️ Architecture & Tech Stack

```text
pixell/
├── client/                      # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/          # Reusable UI components (VideoPlayer, HeroBanner, Cards, Modals, etc.)
│   │   ├── pages/               # Views (Home, Movies, Series, Detail, Player, Search, MyList, History, Admin)
│   │   ├── layouts/             # MainLayout, AdminLayout
│   │   ├── store/               # Context Providers (AuthContext, WatchlistContext, ToastContext)
│   │   ├── services/            # Frontend API client services
│   │   └── types/               # TypeScript interfaces
├── server/                      # Node.js + Express + TypeScript API Server
│   ├── src/
│   │   ├── controllers/         # Request handling & HTTP response formatting
│   │   ├── services/            # Core business logic layer
│   │   ├── routes/              # Modular REST API endpoints
│   │   ├── middleware/          # JWT Auth, Admin Authorization, Error Handlers
│   │   ├── config/              # Database manager (PostgreSQL + Embedded Fallback Adapter)
│   │   └── server.ts            # Application bootstrap
├── database/                    # SQL Database Layer
│   ├── migrations/              # 001_init_schema.sql (Complete PostgreSQL DDL)
│   └── seed/                    # seed_data.sql & seed_data.json
└── package.json                 # Root monorepo orchestration
```

---

## ⚡ Quick Start & Running Locally

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **npm**: v9+
- *(Optional)* **PostgreSQL** running locally on port 5432 (The application automatically connects to PostgreSQL when available, or seamlessly uses the high-speed local data adapter if Postgres is not started).

### 2. Start Application (Server + Client concurrently)
From the root directory:

```bash
# Start both Backend (Port 5000) and Frontend (Port 5173)
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Pre-seeded Demo Accounts

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@pixell.tv` | `Admin123!` | Full Admin Console, Content CRUD, Metrics, Users |
| **Demo User** | `demo@pixell.tv` | `User123!` | Watchlist, Progress Tracking, History, Player |
| **Viewer 2** | `sarah@pixell.tv` | `User123!` | Standard Streaming Access |

*(Note: The login page includes **Instant 1-Click Demo Buttons** to log in as either Demo User or Administrator immediately without typing).*

---

## 🧪 Automated End-to-End Test Suite

Run the full automated E2E test suite covering 15 complete user and admin API scenarios:

```bash
cd server
npx tsx src/scripts/test_e2e.ts
```

---

## 🔥 Firebase Backend & Real-time Live Stream Radar Setup

Pixell supports **Firebase Cloud Firestore** as the backend database and **real-time sub-second Live Stream Radar telemetry**:

### 1. Backend Setup (Firestore)
1. In your Firebase Console, create a Firebase project and enable **Cloud Firestore**.
2. Go to **Project Settings** > **Service accounts** > **Generate new private key**, and download your `serviceAccountKey.json`.
3. Place `serviceAccountKey.json` in the `/server` folder (or root directory), OR add the credentials to `.env`:
   ```env
   USE_FIREBASE=true
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   ```
4. Seed your catalog to Firestore:
   ```bash
   npm run seed:firebase
   ```

### 2. Client Setup (Admin Live Stream Radar)
Add your Firebase Web App credentials to `.env` or `client/.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:...
```
When configured, `/admin/streams` automatically switches from 10-second polling to **0ms WebSocket push notifications** via `onSnapshot()`, displaying live viewer scrubbers and playback positions in real time!

