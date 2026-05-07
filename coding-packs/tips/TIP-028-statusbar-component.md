# TIP-028: Create StatusBar Component

## HEADER
- **TIP-ID**: TIP-028
- **Project**: OCR Gemini UI/UX Redesign
- **Module**: Components / StatusBar
- **Priority**: P0
- **Depends on**: TIP-027 (Tailwind design tokens)
- **Estimated**: S (1 hour)

## CONTEXT
- **Working dir**: `D:/scripts/ocr_gemini/ocr-mobile-web`
- **Tech stack**: React 19, Tailwind CSS 3.4, Lucide React 1.x
- **Key files to read first**: `src/components/ui/StatusBar.tsx` (new), `design/ui-spec.md`
- **Patterns to follow**: Existing UI components in `src/components/ui/`

## TASK
Create a new `StatusBar` component — a semi-transparent status bar for mobile that shows time/date and system indicators. Used across all screens (Camera, History, Analytics) on dark mode surfaces.

## SPECIFICATIONS

### Component Specs
- **Height**: 62px
- **Background**: Semi-transparent dark (`bg-slate-900/80`)
- **Position**: Fixed top, full width
- **Content**:
  - Left: Current time (e.g., "9:41")
  - Right: System indicators (signal, wifi, battery icons)
- **Safe area**: Account for `env(safe-area-inset-top)`

### Implementation
```tsx
// src/components/ui/StatusBar.tsx
import { useEffect, useState } from 'react';

export function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-[62px] bg-slate-900/80"
      style={{ paddingTop: `env(safe-area-inset-top)` }}
    >
      {/* Time */}
      <span className="text-white text-sm font-medium">
        {formatTime(time)}
      </span>

      {/* System indicators */}
      <div className="flex items-center gap-1.5 text-white">
        {/* Signal icon */}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.5 9.137a5.5 5.5 0 017.778 0M12 2.13v10" />
        </svg>
        {/* Wifi icon */}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.5 9.137a5.5 5.5 0 017.778 0M12 2.13v10" />
        </svg>
        {/* Battery icon */}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
}
```

### Usage Example
```tsx
import { StatusBar } from '@/components/ui/StatusBar';

function CameraPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <StatusBar />
      {/* Camera content */}
    </div>
  );
}
```

## ACCEPTANCE CRITERIA
- Given StatusBar component When rendered Then height is 62px with semi-transparent dark background
- Given StatusBar component When rendered Then shows current time on left
- Given StatusBar component When rendered Then shows system indicators on right
- Given StatusBar component When rendered Then accounts for safe area inset
- Given StatusBar component When used in dark screens Then blends with dark background seamlessly

## CONSTRAINTS
- **DO NOT**: Add interactive functionality beyond time display
- **DO NOT**: Use inline styles — use Tailwind utilities only
- **DO NOT**: Include confidence badges or status text
- **REUSE**: Use Lucide icons if available, or inline SVG

## FILES TO CREATE
- `src/components/ui/StatusBar.tsx` — New StatusBar component

---

*TIP-028 | Components | P0 | 1h | Depends on TIP-027*