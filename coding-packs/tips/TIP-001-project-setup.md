# TIP-001: Project Setup + Folder Structure

## HEADER
- **TIP-ID**: TIP-001
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Foundation
- **Priority**: P0
- **Depends on**: None
- **Estimated**: 4 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\` (to be created)
- **Tech stack**: React 18 + Vite 5 + TypeScript 5 + Tailwind CSS 3 + Zustand 4 + Dexie.js 4 + React Router 6 + React Hook Form 7 + Headless UI 2 + Lucide React + Sonner + ExcelJS 4 + browser-image-compression 2
- **Key files to read first**: 
  - `D:\scripts\ocr_gemini\.coding_space\coding-packs\BUILDER-HANDOFF.md` (absolute rules)
  - `D:\scripts\ocr_gemini\.coding_space\coding-packs\00-PROJECT-CONTEXT.md` (vision + tech stack)
- **Patterns to follow**: Standard Vite + React + TypeScript project structure

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet. This TIP establishes the foundation for future standards.

---

## TASK

Initialize a new React + Vite + TypeScript project with Tailwind CSS and all required dependencies. Create the complete folder structure as specified in BUILDER-HANDOFF.md. Configure TypeScript strict mode, Tailwind, and environment variables. Set up the project so subsequent TIPs can immediately start building features without any configuration changes.

---

## SPECIFICATIONS

### Business Rules

1. **Project location**: Create new folder `ocr-mobile-web` inside `D:\scripts\ocr_gemini\`
2. **Package manager**: Use `npm` (consistent with existing Python project using pip)
3. **TypeScript strict mode**: Must be enabled in `tsconfig.json`
4. **Tailwind configuration**: Mobile-first, custom colors from Vision document
5. **Environment variables**: API key must be in `.env.local` (gitignored), with `.env.example` template
6. **Git**: Initialize repository with `.gitignore` for Node.js + React

### Folder Structure (MANDATORY)

```
ocr-mobile-web/
├── public/
│   └── manifest.json          # PWA manifest (placeholder for P1)
├── src/
│   ├── main.tsx               # Entry point
│   ├── App.tsx                # Root component + Router placeholder
│   ├── pages/                 # Page components (empty folders for now)
│   │   ├── .gitkeep
│   ├── components/            # Reusable components
│   │   ├── layout/
│   │   │   └── .gitkeep
│   │   ├── camera/
│   │   │   └── .gitkeep
│   │   ├── ocr/
│   │   │   └── .gitkeep
│   │   ├── history/
│   │   │   └── .gitkeep
│   │   ├── analytics/
│   │   │   └── .gitkeep
│   │   └── common/
│   │       └── .gitkeep
│   ├── lib/                   # Business logic
│   │   └── .gitkeep
│   ├── store/                 # Zustand stores
│   │   └── .gitkeep
│   ├── db/                    # Dexie database
│   │   └── .gitkeep
│   ├── types/                 # TypeScript types
│   │   └── .gitkeep
│   ├── hooks/                 # Custom React hooks
│   │   └── .gitkeep
│   └── styles/
│       └── globals.css        # Tailwind imports + custom CSS
├── .env.example               # Environment variables template
├── .env.local                 # Local env (gitignored, create this)
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── README.md
```

### Dependencies to Install

**Core**:
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "typescript": "^5.5.0",
  "vite": "^5.4.0",
  "@vitejs/plugin-react": "^4.3.0"
}
```

**Styling**:
```json
{
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0"
}
```

**State & Storage**:
```json
{
  "zustand": "^4.5.0",
  "dexie": "^4.0.0",
  "dexie-react-hooks": "^1.1.0"
}
```

**Routing & Forms**:
```json
{
  "react-router-dom": "^6.26.0",
  "react-hook-form": "^7.53.0"
}
```

**UI Components**:
```json
{
  "@headlessui/react": "^2.1.0",
  "lucide-react": "^0.446.0",
  "sonner": "^1.5.0"
}
```

**Utilities**:
```json
{
  "exceljs": "^4.4.0",
  "browser-image-compression": "^2.0.0",
  "bcryptjs": "^2.4.3"
}
```

**Dev Dependencies**:
```json
{
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "@types/bcryptjs": "^2.4.0",
  "eslint": "^9.0.0",
  "eslint-plugin-react-hooks": "^5.0.0",
  "eslint-plugin-react-refresh": "^0.4.0"
}
```

### TypeScript Configuration

**tsconfig.json** must include:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Tailwind Configuration

**tailwind.config.js** must include custom colors from Vision:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        neutral: '#6B7280',
        surface: '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### Environment Variables

**.env.example**:
```
# Google Gemini API
VITE_GEMINI_API_KEY=your_api_key_here

# App Config
VITE_APP_NAME=OCR Gemini Mobile Web
VITE_MAX_IMAGE_SIZE_MB=5
```

**.env.local** (create this, gitignored):
```
VITE_GEMINI_API_KEY=AIzaSyAw4xFLjpC8QOO9jkieQECjYAc9xihxk40
VITE_APP_NAME=OCR Gemini Mobile Web
VITE_MAX_IMAGE_SIZE_MB=5
```

### Vite Configuration

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true, // Allow access from mobile devices on local network
  },
})
```

### Initial Files

**src/main.tsx**:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**src/App.tsx**:
```typescript
function App() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            OCR Gemini Mobile Web
          </h1>
          <p className="text-neutral">
            Project setup complete. Ready for TIP-002.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
```

**src/styles/globals.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-white text-gray-900 font-sans;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Mobile-first touch targets */
@layer utilities {
  .touch-target {
    @apply min-h-[44px] min-w-[44px];
  }
}
```

### README.md

```markdown
# OCR Gemini Mobile Web POC

Mobile web application for scanning Vietnamese invoice labels using Gemini 2.5 Flash-Lite OCR.

## Tech Stack

- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS 3
- Zustand 4 (state management)
- Dexie.js 4 (IndexedDB)
- React Router 6
- ExcelJS 4 (Excel export)
- Google Gemini API (OCR)

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. Add your Gemini API key to `.env.local`

4. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open on mobile device:
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Access: `http://[YOUR_IP]:3000`
   - Note: Camera API requires HTTPS in production

## Project Structure

See `BUILDER-HANDOFF.md` in `.coding_space/coding-packs/` for complete structure and rules.

## Development

- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## Vibecode Kit

This project uses Vibecode Kit v5.0 for structured development. See `.coding_space/coding-packs/` for:
- Project context and vision
- Requirements matrix
- Task graph (TIPs)
- Builder instructions

---

*Generated: 2026-05-05 | Framework: Vibecode Kit v5.0*
```

### Git Configuration

**.gitignore**:
```
# Dependencies
node_modules/

# Build output
dist/
dist-ssr/
*.local

# Environment variables
.env.local
.env.*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
```

### Validation

1. **TypeScript compiles**: `npm run build` must succeed with zero errors
2. **Dev server runs**: `npm run dev` must start without errors
3. **Tailwind works**: Custom colors (`text-primary`, `bg-success`) must render
4. **Environment variables**: `import.meta.env.VITE_GEMINI_API_KEY` must be accessible
5. **Folder structure**: All folders from specification must exist

### Error Handling

- **Port 3000 in use**: Vite will auto-increment to 3001, 3002, etc.
- **Missing dependencies**: Run `npm install` again
- **TypeScript errors**: Check `tsconfig.json` matches specification
- **Tailwind not working**: Verify `postcss.config.js` exists and `globals.css` imports are correct

---

## ACCEPTANCE CRITERIA

### AC-001: Project Initialization
- **Given**: Empty workspace at `D:\scripts\ocr_gemini\`
- **When**: TIP-001 is executed
- **Then**: 
  - New folder `ocr-mobile-web` exists
  - `package.json` contains all specified dependencies
  - `npm install` completes successfully

### AC-002: Folder Structure
- **Given**: Project is initialized
- **When**: Checking folder structure
- **Then**:
  - All folders from specification exist (pages/, components/, lib/, store/, db/, types/, hooks/, styles/)
  - Each subfolder contains `.gitkeep` file
  - No extra folders beyond specification

### AC-003: TypeScript Configuration
- **Given**: Project is initialized
- **When**: Running `npm run build`
- **Then**:
  - TypeScript compiles with zero errors
  - Strict mode is enabled
  - Path alias `@/*` resolves to `./src/*`

### AC-004: Tailwind CSS
- **Given**: Project is initialized
- **When**: Running dev server and viewing `http://localhost:3000`
- **Then**:
  - Custom colors render correctly (blue primary, green success)
  - Inter font loads
  - Responsive design works (test at 375px viewport)

### AC-005: Environment Variables
- **Given**: `.env.local` is created with API key
- **When**: Accessing `import.meta.env.VITE_GEMINI_API_KEY` in code
- **Then**:
  - API key value is accessible
  - `.env.example` exists with template
  - `.env.local` is gitignored

### AC-006: Development Server
- **Given**: All setup is complete
- **When**: Running `npm run dev`
- **Then**:
  - Server starts on port 3000
  - App displays "OCR Gemini Mobile Web" heading
  - No console errors
  - Hot reload works when editing `App.tsx`

### AC-007: Git Repository
- **Given**: Project is initialized
- **When**: Running `git status`
- **Then**:
  - Git repository is initialized
  - `.gitignore` excludes `node_modules/`, `.env.local`, `dist/`
  - Initial commit includes all setup files

### AC-008: Mobile Access
- **Given**: Dev server is running with `--host` flag
- **When**: Accessing from mobile device on same network
- **Then**:
  - App loads on mobile browser
  - No CORS errors
  - Viewport is responsive (no horizontal scroll)

---

## CONSTRAINTS

### DO NOT:
- ❌ Use Create React App (CRA) — must use Vite
- ❌ Use JavaScript — must use TypeScript with strict mode
- ❌ Use CSS-in-JS libraries (styled-components, emotion) — must use Tailwind
- ❌ Add extra dependencies not in specification
- ❌ Create components or pages yet — only folder structure
- ❌ Implement routing yet — just placeholder App.tsx
- ❌ Hardcode API key in source code — must use environment variable

### REUSE:
- ✅ Standard Vite + React + TypeScript template as starting point
- ✅ Tailwind CSS default configuration (extend, don't replace)
- ✅ Inter font from Google Fonts CDN (add to `index.html`)

### SKIP (out of scope for TIP-001):
- ⏭️ Implementing any features (auth, camera, OCR, etc.)
- ⏭️ Creating actual components (only folder structure)
- ⏭️ Setting up routing (React Router will be in TIP-005)
- ⏭️ IndexedDB schema (will be in TIP-004)
- ⏭️ API integration (will be in TIP-007)
- ⏭️ Testing setup (not required for POC)

---

## COMPLETION CHECKLIST

Before marking this TIP as DONE, verify:

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts server successfully
- [ ] `npm run build` compiles TypeScript with zero errors
- [ ] App displays in browser at `http://localhost:3000`
- [ ] Custom Tailwind colors work (`text-primary` renders blue)
- [ ] All folders from specification exist
- [ ] `.env.local` exists with API key (gitignored)
- [ ] `.env.example` exists with template
- [ ] `.gitignore` excludes `node_modules/`, `.env.local`, `dist/`
- [ ] `README.md` has setup instructions
- [ ] Git repository initialized with initial commit
- [ ] No TypeScript errors in editor
- [ ] No console errors in browser

---

## NOTES FOR BUILDER

1. **Vite initialization**: Use `npm create vite@latest ocr-mobile-web -- --template react-ts` as starting point, then customize
2. **Tailwind setup**: Follow official Vite + Tailwind guide: https://tailwindcss.com/docs/guides/vite
3. **Path alias**: Requires both `tsconfig.json` and `vite.config.ts` configuration
4. **Mobile testing**: Use `npm run dev -- --host` to allow mobile device access
5. **API key**: Copy from existing Python script (`ocr_gemini.py` line 14) to `.env.local`
6. **Inter font**: Add to `index.html` head: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">`

---

*TIP-001 | Generated: 2026-05-05 | Vibecode Kit v5.0*