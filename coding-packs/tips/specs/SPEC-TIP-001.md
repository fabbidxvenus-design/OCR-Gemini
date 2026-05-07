# SPEC: TIP-001 Project Setup

## Context
- **TIP**: TIP-001
- **Phase**: Project Setup + Folder Structure
- **Location**: `D:\scripts\ocr_gemini\ocr-mobile-web\`

## Acceptance Criteria

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

## Implementation Tasks

### Task 1: Install All Dependencies
- [ ] Install core: react, react-dom, typescript, vite, @vitejs/plugin-react
- [ ] Install styling: tailwindcss, postcss, autoprefixer
- [ ] Install state & storage: zustand, dexie, dexie-react-hooks
- [ ] Install routing & forms: react-router-dom, react-hook-form
- [ ] Install UI: @headlessui/react, lucide-react, sonner
- [ ] Install utilities: exceljs, browser-image-compression, bcryptjs
- [ ] Install dev: @types/react, @types/react-dom, @types/bcryptjs, eslint

### Task 2: Create Folder Structure
- [ ] Create src/pages/ with .gitkeep
- [ ] Create src/components/layout/ with .gitkeep
- [ ] Create src/components/camera/ with .gitkeep
- [ ] Create src/components/ocr/ with .gitkeep
- [ ] Create src/components/history/ with .gitkeep
- [ ] Create src/components/analytics/ with .gitkeep
- [ ] Create src/components/common/ with .gitkeep
- [ ] Create src/lib/ with .gitkeep
- [ ] Create src/store/ with .gitkeep
- [ ] Create src/db/ with .gitkeep
- [ ] Create src/types/ with .gitkeep
- [ ] Create src/hooks/ with .gitkeep
- [ ] Create src/styles/globals.css

### Task 3: Configure TypeScript
- [ ] Update tsconfig.json with strict mode
- [ ] Add path alias `@/*` -> `./src/*`
- [ ] Verify build passes

### Task 4: Configure Tailwind
- [ ] Create tailwind.config.js with custom colors
- [ ] Create postcss.config.js
- [ ] Add custom colors: primary, success, warning, error, neutral, surface

### Task 5: Configure Vite
- [ ] Update vite.config.ts with path alias
- [ ] Enable host for mobile access

### Task 6: Create Environment Files
- [ ] Create .env.example with template
- [ ] Create .env.local with API key (gitignored)
- [ ] Update .gitignore

### Task 7: Update Global CSS
- [ ] Add Tailwind imports
- [ ] Add custom utilities (.touch-target)
- [ ] Add Inter font

### Task 8: Initialize Git
- [ ] Create initial commit
