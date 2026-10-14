# 🏴‍☠️ Pirate Battle — 2D Naval Shooter

An action-packed 2D top-down naval combat shooter built with **React 19**, **TypeScript (Strict Mode)**, **PixiJS v8**, **Tailwind CSS v4**, **MSW v2**, **TanStack Query v5**, and **Playwright**.

Navigate treacherous seas between five tropical islands, evade enemy cannonballs, fire broadsides, and sink rival pirate ships to secure your name in the Captain's Log!

---

## 🛠️ Tech Stack

| Responsibility | Technology | Description |
| :--- | :--- | :--- |
| **UI & Menus** | React 19 | Responsive HUD, Modals, Options, Captain's Log |
| **Type Safety** | TypeScript (Strict) | Zero `any`, strict null checks, full interface typing |
| **Game Engine & Rendering** | PixiJS v8 | WebGL / Canvas hardware-accelerated 2D rendering |
| **Styling** | Tailwind CSS v4 | Modern styling with 16:9 responsive aspect ratio |
| **Remote State & Cache** | TanStack Query v5 | Data fetching, caching, retries, and optimistic invalidation |
| **HTTP Client** | Axios | REST client consuming ranking and match history APIs |
| **API Mocking** | MSW v2 (Mock Service Worker)| Network-level REST mocking with real Service Worker |
| **E2E Testing** | Playwright | Full end-to-end automation across Desktop and Mobile |

---

## 🎮 Game Controls

### Desktop Keyboard Controls
| Action | Key(s) | Description |
| :--- | :--- | :--- |
| **Accelerate** | `W` or `Arrow Up` | Propel ship forward |
| **Turn Left / Right** | `A` / `D` or `Arrow Left` / `Arrow Right` | Rotate ship rudder |
| **Front Cannon Fire** | `Space` | Fire 1 high-velocity cannonball forward |
| **Port Broadside (Left)** | `Q` | Fire 3 cannonballs in parallel to the left |
| **Starboard Broadside (Right)**| `E` | Fire 3 cannonballs in parallel to the right |
| **Pause / Resume** | `Escape` or `P` | Pause active combat and simulation |

### Mobile Touch Controls
When accessed on a mobile device or tablet in **Landscape mode**, an on-screen touch overlay automatically appears:
- **Left Virtual Controls**: Steering buttons (Turn Left, Forward, Turn Right).
- **Right Virtual Controls**: Combat buttons (Front Fire, Left Broadside, Right Broadside).
- **Portrait Orientation Blocker**: If held vertically, a polite "Rotate Your Device" screen appears to ensure optimal visibility of the 16:9 arena.

---

## ⚙️ Gameplay Options & Limits

Options are accessible from the Main Menu and Pause Menu, and are persisted to `localStorage`:
- **Game Session Time**: Configurable between **60s and 180s** (default: 120s, step: 30s). Plus/Minus buttons disable when hitting boundaries.
- **Enemy Spawn Interval**: Configurable between **1s and 5s** (default: 3s, step: 1s).
- **Match Isolation**: Alterations during an active match do not modify the running session; they take effect upon launching the next game.

---

## 🌐 Network Simulation (MSW)

A discrete Network Simulator pill is located in the **bottom-left corner** (`🌐 MSW: <state>`). Click it to test backend resilience scenarios:
- **Success**: Normal REST responses (200 OK).
- **Slow Network**: Simulates high-latency connections (2-second delay).
- **Server Error (500)**: Simulates backend server failures; Captain's Log and Game Over screens display error states with a **"Try Again"** button.
- **Network Timeout**: Simulates dropped packets; triggers offline saving to `'pirate_pending_score'`.
- **Empty State**: Simulates zero records; displays the pirate-themed *"No Captains on the Board"* empty state.
- **Reset All Data**: Clears local match history and restores default state.

> **Data Boundary**: Only genuine battles played locally on the current device are stored. No synthetic or hardcoded fake captains appear on the ranking board.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or yarn

### Installation
```bash
git clone https://github.com/your-username/pirate-battle.git
cd pirate-battle
npm install
```

### Running Locally
```bash
# Start development server on http://localhost:5173
npm run dev
```

### Building for Production
```bash
# TypeScript verification + Vite production build
npm run build

# Preview production build locally
npm run preview
```

### Running E2E Tests (Playwright)
```bash
# Run all tests across Desktop and Mobile Chromium
npx playwright test

# Run tests with interactive UI
npx playwright test --ui

# Show HTML test report
npx playwright show-report
```

---

## 🚢 Deployment (Vercel / Netlify / Cloudflare Pages)

The project is pre-configured for static single-page application (SPA) deployment.

### Deploying to Vercel
1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/).
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Click **Deploy**.

### Deploying to Netlify
1. Connect your repository on [Netlify](https://www.netlify.com/).
2. Build Command: `npm run build`.
3. Publish Directory: `dist`.
4. Deploy!

> **Service Worker Note**: MSW uses `/mockServiceWorker.js` in the `public/` directory, which is automatically included in the `dist/` root and operates seamlessly in production.

---

## 📖 Architecture & Design Decisions

For in-depth documentation on the PixiJS v8 ticker lifecycle, mathematical collision models, React-PixiJS decoupling, and state machine transitions, refer to [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 📊 Performance & Profiling Benchmarks

Detailed empirical benchmarks, frame-time percentiles ($p95$, $p99$), entity stress loads, and 5-cycle memory leak analysis are documented in [PERFORMANCE.md](PERFORMANCE.md).
