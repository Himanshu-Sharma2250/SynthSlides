# SynthSlides

> **AI-powered presentation generator** — describe your idea in plain text, pick a template & tone, and get a complete slide deck in seconds.

SynthSlides is a full-stack web application that turns natural-language prompts into structured, professionally designed PowerPoint-ready presentations. It uses **Google Gemini AI** to generate slide content, processes generation jobs asynchronously with **Inngest**, and lets users preview, present, and export their decks — all from a monospace-forward, terminal-inspired interface.

---

## What It Does

| Capability | Description |
|---|---|
| **Prompt-to-Deck** | Type a topic or paste raw notes — SynthSlides generates a complete slide deck (title, content, bullets, speaker notes) using Google Gemini. |
| **Template Selection** | Choose from 6 curated visual templates: *Minimal Mono*, *Corporate Blue*, *Warm Earth*, *Dark Hacker*, *Soft Pastel*, and *Bold Contrast*. |
| **Tone Control** | Set the tone of the generated content — Professional, Casual, Academic, Creative, or Technical. |
| **Slide Count** | Pick how many slides you want (5, 8, 10, 15, or 20). |
| **Live Preview** | View each slide in a responsive, styled preview panel. Navigate between slides with a sidebar thumbnail list. |
| **Slideshow Mode** | Present your deck in a full-screen slideshow modal with keyboard navigation (arrow keys, Escape). |
| **Export to PPTX** | Download your presentation as a `.pptx` file (PowerPoint) using PptxGenJS. |
| **Real-Time Status** | While Gemini generates your slides, the UI polls for updates and shows a live `Generating → Complete` status badge. |
| **Auth & Multi-User** | Email/password authentication via Better Auth. Each user only sees and manages their own presentations. |
| **Dark / Light Mode** | Full dark mode support with OKLCH color tokens and system preference detection. |

---

## How It Works

```
┌─────────────┐      ┌──────────────────┐      ┌───────────────┐
│   Browser    │─────▶│  TanStack Start  │─────▶│   PostgreSQL  │
│  (React 19)  │◀─────│  (SSR + API)     │◀─────│   (Neon DB)   │
└─────────────┘      └────────┬─────────┘      └───────────────┘
                              │
                              │ Inngest event
                              ▼
                     ┌──────────────────┐      ┌───────────────┐
                     │     Inngest      │─────▶│  Google Gemini │
                     │  (Background Job)│◀─────│  (AI Model)   │
                     └──────────────────┘      └───────────────┘
```

### Step-by-Step Flow

1. **User signs in** — Better Auth handles email/password authentication. Sessions are stored in PostgreSQL via Prisma.

2. **User enters a prompt** — On the home page, the user types a topic (e.g. *"Quarterly sales review for Q2 2026"*), selects a template, tone, and slide count.

3. **Presentation record created** — A server function creates a `Presentation` row in PostgreSQL with status `GENERATING` and fires an Inngest event (`presentation/generate-slides`).

4. **Inngest picks up the job** — The `generatePresentationSlides` function runs in the background:
   - Fetches the presentation details from the database.
   - Calls **Google Gemini 2.0 Flash** via Vercel AI SDK's `generateObject()` with a Zod schema, ensuring structured output (title, content, bullets, speaker notes per slide).
   - Saves the generated slides to the `Slide` table and marks the presentation as `COMPLETED`.

5. **UI polls for completion** — The frontend uses TanStack Query with a 3-second `refetchInterval` while status is `GENERATING`. Once complete, slides appear instantly.

6. **User previews & presents** — The detail page shows a slide navigator (left), a live preview (center), and slide outline (right). Users can enter full-screen slideshow mode or export to `.pptx`.

### Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) (React 19 SSR + server functions) |
| **Routing** | [TanStack Router](https://tanstack.com/router) (file-based, type-safe) |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) (caching, polling, mutations) |
| **Database** | PostgreSQL on [Neon](https://neon.tech) |
| **ORM** | [Prisma](https://prisma.io) v7 with `pg` driver adapter |
| **Auth** | [Better Auth](https://better-auth.com) (email/password, session-based) |
| **AI** | [Google Gemini 2.0 Flash](https://ai.google.dev) via [Vercel AI SDK](https://sdk.vercel.ai) |
| **Background Jobs** | [Inngest](https://inngest.com) (event-driven, durable functions) |
| **PPTX Export** | [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) components |
| **Typography** | [Geist Mono Variable](https://vercel.com/font) (monospace-only design system) |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) (dark/light/system) |
| **Build Tool** | [Vite 8](https://vite.dev) |
| **Language** | TypeScript 6 (strict mode) |

---

## Folder Structure

```
ppt-generator-ai/
├── prisma/
│   ├── schema.prisma              # Database schema (User, Session, Account, Presentation, Slide)
│   ├── seed.ts                    # Database seed script
│   └── migrations/                # Prisma migration files
├── prisma.config.ts               # Prisma config (early access features)
├── public/                        # Static assets (favicon, logos, manifest)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Top navigation bar with branding & user menu
│   │   ├── ThemeToggle.tsx        # Light/Dark/System theme switcher
│   │   ├── auth/
│   │   │   └── login_form.tsx     # Email/password login & sign-up form
│   │   └── ui/                    # 55 shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── features/
│   │   └── presentations/
│   │       ├── actions/
│   │       │   ├── presentation-mutation.ts   # Server fns: create & delete presentations
│   │       │   └── presentation-query.ts      # Server fns: fetch presentations & details
│   │       ├── components/
│   │       │   ├── generation-status.tsx       # Generating/Complete/Failed status badge
│   │       │   ├── presentation-card.tsx       # Presentation card for the grid/list view
│   │       │   ├── presentation-list-section.tsx  # Grid layout of presentation cards
│   │       │   ├── slide-card.tsx              # Slide thumbnail card in the sidebar
│   │       │   ├── slide-preview.tsx           # Main slide preview (title, content, bullets)
│   │       │   └── slideshow-modal.tsx         # Full-screen slideshow with keyboard nav
│   │       ├── constants/
│   │       │   ├── presentation-options.ts     # Tone & slide count option lists
│   │       │   └── presentation-template.ts    # 6 template definitions with preview colors
│   │       ├── hooks/
│   │       │   ├── query-keys.ts              # TanStack Query key factories
│   │       │   ├── use-fullscreen.ts          # Fullscreen API hook
│   │       │   └── usePresentation-detail.ts  # Presentation detail query with auto-polling
│   │       ├── lib/
│   │       │   └── export-pptx.ts             # PPTX file generation & download
│   │       ├── types/
│   │       │   ├── presentation.types.ts      # Prisma-derived Presentation type
│   │       │   └── schema.ts                  # Zod schemas for Slide & Presentation
│   │       └── utils/
│   │           └── thumbnail-url.ts           # Template thumbnail URL helper
│   ├── generated/
│   │   └── prisma/                # Auto-generated Prisma client (gitignored)
│   ├── hooks/
│   │   └── use-mobile.ts         # Mobile viewport detection hook
│   ├── integrations/
│   │   ├── better-auth/
│   │   │   └── header-user.tsx    # User avatar & dropdown for the navbar
│   │   ├── inngest/
│   │   │   ├── client.ts         # Inngest client instance
│   │   │   └── function.ts       # AI slide generation background function
│   │   └── tanstack-query/
│   │       ├── devtools.tsx       # React Query devtools
│   │       └── root-provider.tsx  # QueryClientProvider wrapper
│   ├── lib/
│   │   ├── auth-client.ts        # Better Auth React client
│   │   ├── auth.functions.ts     # Server-side session helpers
│   │   ├── auth.ts               # Better Auth server config
│   │   ├── auth_paths.ts         # Public & protected route definitions
│   │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
│   ├── middleware/
│   │   └── auth.middleware.ts     # Auth middleware for route protection
│   ├── providers/
│   │   └── theme_provider.tsx     # Theme context provider (next-themes)
│   ├── routes/
│   │   ├── __root.tsx             # Root layout (HTML shell, providers, devtools)
│   │   ├── index.tsx              # Home page (create presentations, view list)
│   │   ├── presentations.$presentationId.tsx  # Presentation detail & slide viewer
│   │   ├── _auth/
│   │   │   ├── route.tsx          # Auth layout wrapper
│   │   │   └── login.tsx          # Login page
│   │   └── api/
│   │       ├── auth/
│   │       │   └── $.ts           # Better Auth API catch-all handler
│   │       └── inngest.ts         # Inngest webhook endpoint (GET/POST/PUT)
│   ├── db.ts                      # Prisma client with pg adapter
│   ├── router.tsx                 # TanStack Router factory
│   ├── routeTree.gen.ts           # Auto-generated route tree
│   └── styles.css                 # Global styles, Tailwind config, OKLCH tokens
├── .env                           # Environment variables (not committed)
├── .gitignore
├── components.json                # shadcn/ui configuration
├── eslint.config.js
├── package.json
├── prettier.config.js
├── tsconfig.json
└── vite.config.ts                 # Vite + Tailwind + TanStack Start plugins
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** (comes with Node.js)
- **PostgreSQL** database (or a free [Neon](https://neon.tech) instance)
- **Google Gemini API Key** — get one at [ai.google.dev](https://ai.google.dev)
- **Inngest** account (free) — for background job processing ([inngest.com](https://inngest.com))

### Clone & Run

```bash
# 1. Clone the repository
git clone https://github.com/Himanshu-Sharma2250/SynthSlides.git
cd SynthSlides

# 2. Install dependencies
npm install

# 3. Set up environment variables
#    Copy the example and fill in your values:
cp .env .env.local
```

Edit `.env.local` with your credentials:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
BETTER_AUTH_SECRET="your-secret-key-here"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"
```

```bash
# 4. Generate the Prisma client
npm run db:generate

# 5. Push the database schema (creates tables)
npm run db:push

# 6. Start the Inngest dev server (in a separate terminal)
npx inngest-cli@latest dev

# 7. Start the development server
npm run dev
```

The app will be running at **[http://localhost:3000](http://localhost:3000)**.

> **Note:** The Inngest dev server must be running alongside the app for AI slide generation to work. It listens for events on a local webhook and executes the background functions.

---

## Things You Can Add

1. **Slide Editor** — Add an inline rich-text editor so users can manually edit slide titles, content, and bullet points after AI generation, with drag-and-drop slide reordering.

2. **Team Collaboration** — Implement workspace/team support where multiple users can share, comment on, and co-edit presentations in real time using WebSockets.

3. **Image Generation per Slide** — Integrate an image generation API (like Google Imagen or DALL·E) to auto-generate relevant visuals or diagrams for each slide based on its content.

4. **Version History & Regeneration** — Store previous versions of each presentation and let users regenerate individual slides with different prompts or tones without losing the rest of the deck.

5. **PDF Export & Custom Branding** — Add PDF export alongside PPTX, and let users upload their company logo, set brand colors, and apply custom fonts that persist across all their presentations.

---

## License

This project is open source. Feel free to fork, modify, and build upon it.
