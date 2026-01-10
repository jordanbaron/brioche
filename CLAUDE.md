# Brioche - Project Reference

Document-to-Markdown OCR converter using Mistral's OCR API with local IndexedDB storage.

## Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript
- **Package Manager:** Bun
- **Styling:** Tailwind CSS v4 + @tailwindcss/typography
- **State Management:** React Query (TanStack Query v5)
- **Editor:** Tiptap with StarterKit
- **OCR:** Mistral AI SDK (@mistralai/mistralai)
- **Local Storage:** Dexie.js (IndexedDB wrapper)

## Project Structure

```
brioche/
├── app/
│   ├── api/
│   │   └── ocr/route.ts          # POST /api/ocr - Mistral OCR processing
│   ├── components/
│   │   ├── document-card.tsx     # Document thumbnail card for dashboard
│   │   ├── document-upload.tsx   # File upload with drag-drop
│   │   ├── header.tsx            # Shared navigation header
│   │   ├── markdown-editor.tsx   # Tiptap rich text editor
│   │   └── query-provider.tsx    # React Query provider wrapper
│   ├── dashboard/
│   │   └── page.tsx              # Document grid with thumbnails
│   ├── hooks/
│   │   ├── use-documents.ts      # Document CRUD operations hook
│   │   └── use-ocr.ts            # OCR mutation hook
│   ├── lib/
│   │   ├── db.ts                 # Dexie database schema
│   │   └── utils.ts              # Utility functions (formatDate, formatFileSize)
│   ├── globals.css               # Tailwind imports + CSS custom properties
│   ├── layout.tsx                # Root layout with fonts + QueryProvider
│   └── page.tsx                  # Home page - upload + editor
├── public/                       # Static assets
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## Routes

| Route | Method | File | Purpose |
|-------|--------|------|---------|
| `/` | GET | `app/page.tsx` | Upload page with editor |
| `/?doc={id}` | GET | `app/page.tsx` | Load existing document |
| `/dashboard` | GET | `app/dashboard/page.tsx` | View all documents |
| `/api/ocr` | POST | `app/api/ocr/route.ts` | Process document with Mistral OCR |

## Database Schema (IndexedDB via Dexie)

**Database name:** `brioche`

**Table: `documents`**
| Field | Type | Description |
|-------|------|-------------|
| `id` | number (auto) | Primary key |
| `title` | string | Document title (from filename) |
| `blob` | Blob | Original file data |
| `mimeType` | string | File MIME type |
| `size` | number | File size in bytes |
| `markdown` | string | Generated/edited markdown |
| `uploadedAt` | Date | Upload timestamp |

## Components

### `page.tsx` (Home)
- Client component managing markdown state
- Loads document from `?doc={id}` URL parameter
- Two-column responsive layout (DocumentUpload | MarkdownEditor)
- Persists markdown edits to IndexedDB
- States: `markdown`, `initialPreview`, `currentDocId`

### `dashboard/page.tsx`
- Grid layout displaying all saved documents
- Uses `useLiveQuery` for reactive IndexedDB queries
- Document cards with thumbnails, title, date, size
- Click to open document in editor
- Delete button with confirmation

### `header.tsx`
- Shared navigation component
- Links: Upload (home), Dashboard
- Active state styling based on current route

### `document-card.tsx`
- Thumbnail card for dashboard grid
- Displays image preview, title, date, file size
- Delete button with confirmation
- Props: `doc`, `onDelete`

### `document-upload.tsx`
- File input with drag-and-drop support
- Accepts: `image/*`, `application/pdf`
- Shows image preview before processing
- Saves document to IndexedDB after OCR success
- Props: `onMarkdownGenerated`, `onDocumentSaved`, `initialPreview`
- States: `preview`, `dragActive`, mutation loading/error

### `markdown-editor.tsx`
- Tiptap editor with StarterKit extension
- Syncs content via useEffect when prop changes
- Reports changes via `onContentChange` callback
- Copy-to-clipboard button
- Props: `content`, `onContentChange`

### `query-provider.tsx`
- Wraps app with QueryClientProvider
- Initializes QueryClient

### `lib/db.ts`
- Dexie database class definition
- Document interface and schema
- Exports singleton `db` instance

### `lib/utils.ts`
- `formatFileSize(bytes)` - Human-readable file sizes
- `formatDate(date)` - Formatted date strings

## Hooks

### `hooks/use-ocr.ts`
- OCR mutation hook wrapping the `/api/ocr` endpoint
- Automatically saves documents to IndexedDB on success
- Returns: `process`, `isPending`, `isError`, `error`, `reset`

### `hooks/use-documents.ts`
- Document CRUD operations hook
- Uses `useLiveQuery` for reactive document lists
- Returns: `documents`, `isLoading`, `deleteDocument`, `getDocument`, `updateMarkdown`

## API Route: `/api/ocr`

**Request:** POST with FormData containing `file`

**Processing:**
1. Extract file from FormData
2. Convert to base64 data URL
3. Call `mistral.ocr.process()` with model `mistral-ocr-latest`
4. Join multi-page results with `\n\n---\n\n`

**Response:**
- Success: `{ markdown: string }`
- Error: `{ error: string }` with 400/500 status

## Data Flow

```
User uploads file
    ↓
DocumentUpload validates (image/pdf)
    ↓
Shows preview + triggers OCR mutation
    ↓
POST /api/ocr with FormData
    ↓
Server: file → base64 → Mistral OCR
    ↓
Response: { markdown }
    ↓
onMarkdownGenerated callback → updates state
    ↓
Save to IndexedDB (blob + markdown + metadata)
    ↓
onDocumentSaved callback → updates URL to /?doc={id}
    ↓
MarkdownEditor displays in Tiptap
    ↓
User edits → onContentChange → updates IndexedDB
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MISTRAL_API_KEY` | Required. Mistral AI API key for OCR |

## Styling

- Tailwind CSS v4 with utility-first approach
- Dark mode via `prefers-color-scheme` media query
- Fonts: Geist Sans, Geist Mono (via next/font)
- Color scheme: Zinc palette
- Typography plugin for prose styling in editor

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@mistralai/mistralai` | Mistral OCR API SDK |
| `@tanstack/react-query` | Server state/async data |
| `@tiptap/react` + `@tiptap/starter-kit` | Rich text editor |
| `@tailwindcss/typography` | Prose styling |
| `dexie` + `dexie-react-hooks` | IndexedDB wrapper with React hooks |

## Development

```bash
bun install          # Install dependencies
bun dev              # Start dev server
bun build            # Production build
bun start            # Start production server
bun lint             # Run ESLint
```

## Notes

- Client-side storage only - no server database
- Documents persist in browser's IndexedDB
- Blobs stored directly in IndexedDB (efficient for binary data)
- Server-side OCR processing protects API key
- Supports multi-page documents (joined with horizontal rules)
- Markdown edits auto-save to IndexedDB
