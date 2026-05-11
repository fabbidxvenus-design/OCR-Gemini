# TIP-052: Layout + Header Responsive Update

## HEADER
- TIP-ID: TIP-052
- Project: OCR Gemini Mobile Web
- Module: UI/Frontend
- Priority: P1
- Depends on: TIP-050, TIP-051
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS, React Router
- Key files to read first:
    - `src/components/layout/Layout.tsx`
    - `src/components/layout/Header.tsx`
    - `src/components/layout/BottomNav.tsx`

## TASK
Cập nhật Layout và Header components để hỗ trợ responsive layout với sidebar trên tablet+.

## SPECIFICATIONS

### 1. Layout Component Updates
```tsx
// Responsive layout structure
// Mobile (base): Header + Content + BottomNav
// Tablet+ (md:): Sidebar + Header + Content (no BottomNav)

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBottomNav?: boolean;
  showBack?: boolean;
}

export default function Layout({ children, ... }) {
  const isTablet = useIsTablet();

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar: tablet+ only */}
      {isTablet && <Sidebar />}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} showBack={showBack} />

        {/* Content with max-width constraint */}
        <main className={`flex-1 overflow-y-auto ${isTablet ? 'p-screen-md' : 'pb-16'}`}>
          <div className={`max-w-content mx-auto ${isTablet ? 'px-screen-md py-section-md' : 'p-screen space-y-section'}`}>
            {children}
          </div>
        </main>

        {/* BottomNav: mobile only */}
        {!isTablet && showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
```

### 2. Header Updates
- Add hamburger menu icon on tablet for potential mobile menu toggle (future)
- On tablet: hamburger icon left of title
- On mobile: back button left, no hamburger

### 3. CSS Classes for Responsive Spacing
```css
/* Add to tailwind or use arbitrary values */
.md:px-screen-sm { padding-left: 24px; padding-right: 24px; }
.lg:px-screen-md { padding-left: 32px; padding-right: 32px; }
```

## ACCEPTANCE CRITERIA
- **Given** Layout component **When** on tablet+ **Then** renders Sidebar on left
- **Given** Layout component **When** on mobile **Then** renders BottomNav at bottom
- **Given** Header **When** on tablet **Then** shows hamburger menu icon
- **Given** content **When** on tablet+ **Then** max-width constrained to 1280px

## CONSTRAINTS
- DO NOT: Show BottomNav on tablet+ (use Sidebar instead)
- DO NOT: Change Header component behavior significantly
- REUSE: Sidebar component from TIP-051, useMediaQuery from TIP-050