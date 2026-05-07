# TIP-037: Settings Page - Model Selector

## HEADER
- TIP-ID: TIP-037
- Project: OCR Mobile Web
- Module: Settings
- Priority: P1
- Depends on: TIP-004 (IndexedDB), TIP-005 (Routing)
- Estimated: M (6-8 hours)

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18 + TypeScript + Vite + Tailwind CSS + Dexie (IndexedDB)
- Key files to read first:
  - `src/lib/gemini.ts` - Current API integration
  - `src/db/schema.ts` - Database schema
  - `src/pages/AnalyticsPage.tsx` - Reference for KPI display
  - `src/components/layout/Layout.tsx` - Layout pattern
- Patterns to follow:
  - Mobile-first responsive design (375px base)
  - Tailwind utility classes for styling
  - Custom hooks for data fetching
  - IndexedDB via Dexie for persistence

## APPLICABLE STANDARDS
none

## TASK
Create a Settings page that allows users to select between 3 model tiers (Free, Default, High) for OCR processing. Each tier uses different OpenRouter models with varying quality/cost tradeoffs. Display token usage statistics per tier to show cost differences.

## SPECIFICATIONS

### Business Rules
1. **Three Model Tiers**:
   - **Free**: `openrouter/auto` (free tier, lower quality)
   - **Default**: `google/gemini-2.5-flash-image` (current, balanced)
   - **High**: `google/gemini-2.0-flash-exp` or `anthropic/claude-3.5-sonnet` (premium, highest quality)

2. **Model Selection**:
   - User can switch between tiers at any time
   - Selection persists in IndexedDB
   - New scans use the selected model
   - Existing scans retain their original model info

3. **Token Usage Display**:
   - Show total tokens used per tier
   - Show total cost per tier
   - Show average tokens per scan per tier
   - Display in a comparison table format

4. **Prompt Optimization**:
   - Free tier: Simplified prompt (fewer instructions)
   - Default tier: Current prompt (balanced)
   - High tier: Enhanced prompt (more detailed instructions, higher confidence thresholds)

### Database Schema Updates

Add to `src/db/schema.ts`:

```typescript
export interface AppSettings {
  id: string; // 'app-settings' (singleton)
  selectedModelTier: 'free' | 'default' | 'high';
  lastUpdated: Date;
}

export interface ScanRecord {
  // ... existing fields
  modelTier: 'free' | 'default' | 'high'; // Add this field
}
```

Add new Dexie table:
```typescript
settings: '&id'
```

### Model Configuration

Create `src/lib/models.ts`:

```typescript
export interface ModelConfig {
  tier: 'free' | 'default' | 'high';
  name: string;
  model: string;
  description: string;
  pricing: {
    input: number;  // USD per token
    output: number; // USD per token
  };
  prompt: string;
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  free: {
    tier: 'free',
    name: 'Free',
    model: 'openrouter/auto',
    description: 'Miễn phí - Chất lượng cơ bản',
    pricing: { input: 0, output: 0 },
    prompt: 'OCR hóa đơn tiếng Việt. Trả về JSON: {"title":"","fields":[{"field":"","value":""}],"sizes":[{"size":"","qty":0}],"raw":""}'
  },
  default: {
    tier: 'default',
    name: 'Default',
    model: 'google/gemini-2.5-flash-image',
    description: 'Mặc định - Cân bằng giá/chất lượng',
    pricing: { input: 0.000000175, output: 0.0000007 },
    prompt: 'OCR hóa đơn/nhãn dán tiếng Việt. Trả về JSON:\n{"title":"","fields":[{"field":"","value":"","conf":"high/medium/low"}],"sizes":[{"size":"","qty":0}],"raw":"","notes":[]}\nĐọc tất cả thông tin. conf: high(>90%), medium(70-90%), low(<70%).'
  },
  high: {
    tier: 'high',
    name: 'High Quality',
    model: 'google/gemini-2.0-flash-exp',
    description: 'Cao cấp - Chất lượng tốt nhất',
    pricing: { input: 0, output: 0 }, // Free during preview
    prompt: 'OCR hóa đơn/nhãn dán tiếng Việt với độ chính xác cao nhất. Trả về JSON:\n{"title":"","fields":[{"field":"","value":"","conf":"high/medium/low"}],"sizes":[{"size":"","qty":0}],"raw":"","notes":[]}\nYêu cầu:\n- Đọc tất cả thông tin, kể cả chữ mờ/nhỏ\n- conf: high(>95%), medium(85-95%), low(<85%)\n- Kiểm tra lại số liệu 2 lần\n- Ghi chú nếu có thông tin không chắc chắn'
  }
};
```

### Settings Page UI

Create `src/pages/SettingsPage.tsx`:

**Layout**:
- Header: "Cài đặt"
- Section 1: Model Selection (radio buttons)
- Section 2: Token Usage Statistics (comparison table)
- Section 3: Model Details (expandable cards)

**Model Selection Card**:
```
┌─────────────────────────────────────┐
│ ○ Free - Miễn phí                   │
│   Chất lượng cơ bản                 │
│                                     │
│ ● Default - Mặc định (đang chọn)   │
│   Cân bằng giá/chất lượng          │
│                                     │
│ ○ High Quality - Cao cấp            │
│   Chất lượng tốt nhất              │
└─────────────────────────────────────┘
```

**Token Usage Table**:
```
┌─────────────────────────────────────┐
│ Tier    │ Scans │ Tokens │ Cost     │
├─────────┼───────┼────────┼──────────┤
│ Free    │   5   │ 12.5K  │ $0.000   │
│ Default │  20   │ 85.2K  │ $0.0234  │
│ High    │   3   │ 18.9K  │ $0.000   │
└─────────────────────────────────────┘
```

### Validation
1. Model tier selection must be one of: 'free', 'default', 'high'
2. Settings must persist across app restarts
3. Token statistics must aggregate correctly per tier

### Error Handling
1. If settings load fails → default to 'default' tier
2. If model config not found → fallback to 'default' tier
3. If token stats calculation fails → show "N/A"

## ACCEPTANCE CRITERIA

**Given** user is on Settings page  
**When** user selects a model tier  
**Then** selection is saved to IndexedDB and persists across sessions

**Given** user has scans from multiple tiers  
**When** user views token usage table  
**Then** statistics are correctly aggregated per tier

**Given** user selects "Free" tier  
**When** user performs a new scan  
**Then** scan uses `openrouter/auto` model with simplified prompt

**Given** user selects "High" tier  
**When** user performs a new scan  
**Then** scan uses `google/gemini-2.0-flash-exp` model with enhanced prompt

**Given** user switches from Default to High tier  
**When** user views Analytics page  
**Then** new scans show higher token usage but better accuracy

## CONSTRAINTS

### DO NOT
- Do not modify existing scan records when changing model tier
- Do not remove existing API key fallback logic
- Do not change the core OCR processing flow
- Do not add backend API calls (client-side only)

### REUSE
- Existing `src/lib/gemini.ts` API integration pattern
- Existing `src/db/schema.ts` Dexie setup
- Existing `src/components/layout/Layout.tsx` page layout
- Existing Tailwind design tokens from `tailwind.config.js`

### SKIP
- Multi-language UI (Vietnamese only for MVP)
- Model performance benchmarking
- Advanced analytics charts
- Model auto-switching based on image quality

## IMPLEMENTATION CHECKLIST

- [ ] Update `src/db/schema.ts` with `AppSettings` interface and `settings` table
- [ ] Create `src/lib/models.ts` with model configurations
- [ ] Update `src/lib/gemini.ts` to use selected model tier
- [ ] Create `src/hooks/useSettings.ts` for settings CRUD
- [ ] Create `src/pages/SettingsPage.tsx` with model selector UI
- [ ] Add route `/settings` to `src/App.tsx`
- [ ] Add Settings icon to BottomNav (optional)
- [ ] Update `src/db/schema.ts` ScanRecord to include `modelTier` field
- [ ] Update Analytics page to show per-tier statistics
- [ ] Test model switching and token usage tracking
- [ ] Verify settings persistence across app restarts

## FILES TO CREATE
- `src/lib/models.ts` - Model configurations
- `src/hooks/useSettings.ts` - Settings hook
- `src/pages/SettingsPage.tsx` - Settings page component

## FILES TO MODIFY
- `src/db/schema.ts` - Add AppSettings interface and settings table
- `src/lib/gemini.ts` - Use selected model tier
- `src/App.tsx` - Add /settings route
- `src/pages/AnalyticsPage.tsx` - Show per-tier statistics (optional)

---

**Quality Gate: Self-Review**

✅ Task clearly defined: Settings page with 3-tier model selector  
✅ Database schema updated: AppSettings + modelTier field  
✅ Model configs specified: Free, Default, High with pricing  
✅ UI mockups provided: Radio buttons + token usage table  
✅ Acceptance criteria: 5 scenarios covering selection, persistence, and usage  
✅ Constraints documented: DO NOT, REUSE, SKIP sections  
✅ Implementation checklist: 11 steps with file paths  

⚠️ **Open item**: High tier model choice - `gemini-2.0-flash-exp` is experimental and may change. Consider `anthropic/claude-3.5-sonnet` as alternative.

**Confidence**: 85% - Clear requirements, existing patterns to follow, main risk is OpenRouter model availability.

---

*TIP-037 | Generated: 2026-05-07 | Framework: Vibecode Kit v5.0*
