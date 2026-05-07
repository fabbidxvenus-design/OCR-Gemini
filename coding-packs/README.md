# ocr_gemini Coding Packs — Vibecode Kit v5.0

> AI Quality Command Center — Coding Packs for ocr_gemini
> Generated from Vibecode Kit v5.0 framework

## How to Use

### Power Triangle

```
CON NGUOI (Chu nha)          ← You: Approve, decide, relay
      |
  ----+----
  |        |
CLAUDE CHAT               CLAUDE CODE
(Chu thau)                (Tho thi cong)
Design, interview         Implement TIPs
Orchestrate              Self-test, report
```

### Workflow

1. **Read `00-PROJECT-CONTEXT.md`** — Understand project context
2. **Read `02-TASK-GRAPH.md`** — See task dependencies + sequence
3. **Pick a TIP** from `tips/` folder (follow dependency order)
4. **Paste TIP into Claude Code** — Builder implements it
5. **Builder returns Completion Report** — Relay to Architect
6. **Repeat** until all TIPs done

## File Structure

```
coding-packs/
├── README.md                         # This file
├── 00-PROJECT-CONTEXT.md             # Scan Report + Vision
├── 01-REQUIREMENTS-MATRIX.md         # Requirements traceability
├── 02-TASK-GRAPH.md                  # Task dependency graph
├── BUILDER-HANDOFF.md                # Builder instructions
├── plans/                            # Implementation plans
├── reports/                          # Verify/completion reports
├── research/                         # Research outputs
├── standards/                        # Tribal knowledge (by --standards)
│   ├── README.md
│   └── [area]/
└── tips/                             # TIP files (by /vibecode:tip)
    ├── TIP-001-xxx.md
    └── ...
```

## Tech Stack

### Mobile Web App (React 19 + Vite 8)
| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.x |
| Build | Vite | 8.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4 |
| Icons | Lucide React | 1.x |
| Storage | Dexie.js | 4.x |
| State | Zustand | 5.x |
| AI | Google Gemini API | 2.5-flash-lite |
| Excel | ExcelJS | 4.x |

## TIP Execution Order

### Week 1: Foundation + Camera (16h)
1. TIP-027: Extend Tailwind config (design tokens) (1h)
2. TIP-028: Create StatusBar component (1h) ← depends on TIP-027
3. TIP-029: Redesign Camera page (HUD style) (4h) ← depends on TIP-028
4. TIP-030: Create HistoryCard component (2h) ← depends on TIP-027
5. TIP-033: Create KPICard component (1h) ← depends on TIP-027

### Week 2: History + Detail (10h)
6. TIP-031: Redesign HistoryPage (multi-select + batch export) (4h) ← depends on TIP-030
7. TIP-032: Redesign OCRResultPage (light mode cards) (2h) ← depends on TIP-027
8. TIP-034: Redesign AnalyticsPage (dark mode + date tabs) (2h) ← depends on TIP-033

### Week 3: Polish (2h)
9. TIP-035: Update BottomNav styling (1h)
10. TIP-036: Update UI components (Skeleton, Toast) (1h)

**Total: 15 hours** (3 weeks for 1 developer)

## Source Documents

| Document | Purpose |
|----------|---------|
| `00-PROJECT-CONTEXT-REDESIGN.md` | Vision + Problem Statement |
| `design/ui-spec.md` | UI Specifications (from Pencil design) |
| `02-TASK-GRAPH-REDESIGN.md` | Task dependency graph |
| `BUILDER-HANDOFF.md` | Builder instructions |

---

*Updated: 2026-05-06 | Framework: Vibecode Kit v5.0 | Project: ocr_gemini UI/UX Redesign*