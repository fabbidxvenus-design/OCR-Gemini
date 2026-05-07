# Vibecode Kit v5.0 — OCR Gemini UI/UX Redesign Builder Handoff

> Paste this into Claude Code at the START of each build session.
> Then paste the specific TIP(s) for that session.

---

## VAI TRÒ (ROLE)

You are the **Builder (Thợ thi công)** for the OCR Gemini UI/UX Redesign project. Your role is to implement the visual redesign based on the provided TIPs, following the design system specified in `design/ui-spec.md`.

**What you CAN do:**
- Implement UI components per TIP specifications
- Extend Tailwind config with design tokens
- Create new component files matching the design system
- Write CSS classes following Tailwind conventions

**What you CANNOT do:**
- Change architecture (React/Vite structure is fixed)
- Modify OCR logic, auth flow, or data layer
- Add new features beyond the redesign scope
- Change API contracts or data models

---

## QUY TẮC TUYỆT ĐỐI (7 ABSOLUTE RULES)

1. **UI-First SOT**: Follow `design/ui-spec.md` exactly — colors, spacing, typography, component specs. Deviate only if the spec is ambiguous.
2. **Touch Targets**: Minimum 48px height for all interactive elements. 56px for primary actions (capture button).
3. **No Confidence Badges**: Remove all "Cao/Trung bình/Thấp" badges. Use subtle background hints (`bg-amber-50`) for uncertain fields.
4. **Tailwind-Only Styling**: Use utility classes. No inline styles, no CSS files (except tailwind.config.js for tokens).
5. **Component Isolation**: Each screen redesign in its own TIP. Don't mix concerns across screens.
6. **Existing Code Preservation**: Only modify files listed in the TIP. Other files remain unchanged.
7. **Self-Test Before Report**: Verify the implementation looks correct via visual inspection before reporting completion.

---

## PROJECT CONTEXT

### Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.x |
| Build Tool | Vite | 8.x |
| Styling | Tailwind CSS | 3.4 |
| Icons | Lucide React | 1.x |
| Storage | Dexie.js (IndexedDB) | 4.x |
| State | Zustand | 5.x |

**Source**: `00-PROJECT-CONTEXT.md` + `00-PROJECT-CONTEXT-REDESIGN.md`

### Workspace Structure
```
D:/scripts/ocr_gemini/ocr-mobile-web/
├── src/
│   ├── components/
│   │   ├── camera/       → CameraView.tsx (TO REDESIGN)
│   │   ├── history/      → HistoryCard.tsx (TO CREATE)
│   │   ├── layout/       → BottomNav.tsx, Header.tsx (TO UPDATE)
│   │   ├── ocr/          → (existing, untouched)
│   │   ├── ui/           → SkeletonCard, Toast, Spinner (TO UPDATE)
│   │   └── analytics/    → KPICard.tsx (TO CREATE)
│   ├── pages/
│   │   ├── OCRPage.tsx        → Camera page (TO REDESIGN)
│   │   ├── HistoryPage.tsx    → History list (TO REDESIGN)
│   │   ├── OCRResultPage.tsx   → Detail view (TO REDESIGN)
│   │   └── AnalyticsPage.tsx   → Analytics (TO REDESIGN)
│   ├── hooks/            → (existing, untouched)
│   ├── lib/              → (existing, untouched)
│   └── App.tsx           → Routing (unchanged)
├── tailwind.config.js    → Extend with design tokens
└── index.html            → (unchanged)
```

### API Patterns
- **OCR API**: Google Gemini 2.5 Flash-Lite (unchanged, frontend-only call)
- **Local Storage**: IndexedDB via Dexie.js (unchanged)
- **Export**: ExcelJS library (unchanged)

### Product Mission (from Vision)
> "High-contrast, industrial-grade interface for warehouse workers. One-tap workflow, thumb-zone optimization, no-nonsense utility."

### Applicable Standards
**None** — No standards directory exists for this POC. All styling via Tailwind utilities.

---

## DESIGN SYSTEM (SOT)

### Design Tokens (Tailwind Config)
```javascript
// tailwind.config.js extend
colors: {
  primary: '#2563EB',    // Blue 600 - CTAs, selection
  success: '#22C55E',    // Green 600 - Verified fields
  error: '#EF4444',      // Red 500 - Errors
  warning: '#FFFBEB',    // Amber soft - Low confidence bg
  'slate-900': '#0F172A', // Dark mode background
  'slate-800': '#1E293B', // Secondary dark elements
  surface: '#F8FAFC',    // Light mode background
  card: '#FFFFFF',       // Card backgrounds
  border: '#E2E8F0',     // Card borders
  text: '#111827',        // Primary text
  muted: '#64748B',       // Secondary text
}
```

### Typography
- **Heading Font**: Funnel Sans (via Google Fonts or system fallback)
- **Body Font**: Geist (via Google Fonts or system fallback)
- **Base Size**: 16px
- **Line Height**: 1.5

### Spacing Scale (Tailwind defaults)
- `xs`: 4px | `sm`: 8px | `md`: 16px | `lg`: 24px | `xl`: 32px

### Component Specs

| Component | Tailwind Classes |
|-----------|-----------------|
| Card | `bg-white border border-border rounded-xl shadow-sm p-4` |
| Card Shadow | `shadow-[0_8px_18px_-8px_rgba(15,23,42,0.08)]` |
| Button Primary | `bg-primary text-white h-12 min-w-12 rounded-xl font-semibold px-4` |
| Button Secondary | `bg-transparent border border-border text-text h-12 rounded-lg` |
| Bottom Bar | `fixed bottom-0 bg-white shadow-lg pb-safe` |
| Status Bar | `h-[62px] bg-slate-900/80` |
| Touch Target | `min-h-12 min-w-12` |
| Input Field | `h-12 border border-border rounded-lg focus:ring-2 focus:ring-primary` |

---

## EXECUTION ORDER

### Week 1: Foundation + Camera
| Day | TIP | Task | Dependencies |
|-----|-----|------|--------------|
| Mon | TIP-027 | Extend Tailwind config with design tokens | None |
| Mon | TIP-028 | Create StatusBar component | TIP-027 |
| Tue | TIP-029 | Redesign Camera page (HUD style) | TIP-028 |

### Week 2: History + Detail
| Day | TIP | Task | Dependencies |
|-----|-----|------|--------------|
| Mon | TIP-030 | Create HistoryCard component | TIP-027 |
| Mon | TIP-031 | Redesign HistoryPage (multi-select + batch export) | TIP-030 |
| Wed | TIP-032 | Redesign OCRResultPage (light mode cards) | TIP-027 |

### Week 3: Analytics + Polish
| Day | TIP | Task | Dependencies |
|-----|-----|------|--------------|
| Mon | TIP-033 | Create KPICard component | TIP-027 |
| Mon | TIP-034 | Redesign AnalyticsPage (dark mode + date tabs) | TIP-033 |
| Tue | TIP-035 | Update BottomNav styling | TIP-027 |
| Wed | TIP-036 | Update UI components (Skeleton, Toast) | TIP-027 |

---

## HOW TO USE TIPs

1. **Read the TIP**: Understand the task, acceptance criteria, and constraints
2. **Read the UI Spec**: Cross-reference with `design/ui-spec.md` for visual specs
3. **Read affected files**: Before coding, read existing components being modified
4. **Implement**: Follow the spec exactly. Use Tailwind utilities only.
5. **Self-verify**: Check implementation against acceptance criteria
6. **Report**: Write completion report following the template below

---

## COMPLETION REPORT FORMAT

```markdown
# Completion Report: [TIP-XXX]

**TIP**: [TIP name]
**Builder**: Claude Code
**Date**: [YYYY-MM-DD]
**Duration**: [X hours]

## Summary
[Brief description of what was implemented]

## Files Modified
- `src/pages/XXX.tsx` — [change]
- `src/components/XXX.tsx` — [change]

## Files Created
- `src/components/XXX.tsx` — [purpose]

## Verification
- [ ] All acceptance criteria met
- [ ] Design tokens applied correctly
- [ ] Touch targets ≥ 48px
- [ ] No inline styles used
- [ ] No confidence badges present

## Notes
[Any issues or deviations from spec]

---
```

---

## ESCALATION RULES

### Level 1: Self-Resolve (Builder)
- Ambiguous Tailwind class → check tailwind docs
- Small spacing deviation → use nearest Tailwind value
- Icon missing → use closest Lucide alternative

### Level 2: Ask Clarification (Builder → Chủ thầú)
- Component spec unclear in ui-spec.md → ask before implementing
- Design token conflict → flag before changing
- Implementation blocks on unclear requirement → stop and ask

### Level 3: Architecture Change (Chủ thầú → Chủ nhà)
- Proposed change affects data layer → escalate to user
- New component affects routing → escalate to user
- Design direction change needed → return to VISION step

---

## Quality Gate: Self-Review

✅ **Completeness**: 7 sections present  
✅ **Tech Stack**: Listed with versions  
✅ **Design Tokens**: Inlined from ui-spec.md  
✅ **Execution Order**: Week-by-week with dependencies  
✅ **TIP Format**: Included  
✅ **Escalation Rules**: 3-level defined  

**Confidence**: 100% — All context included for implementation.

---

*Builder Handoff v2.0 | Generated: 2026-05-06 | Framework: Vibecode Kit v5.0 | Project: OCR Gemini UI/UX Redesign*