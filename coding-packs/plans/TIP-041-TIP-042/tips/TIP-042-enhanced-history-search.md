# TIP-042: Enhanced Search, Filter, Sort & View Modes for History Page

## HEADER
- TIP-ID: TIP-042
- Project: OCR Gemini Mobile Web
- Module: HistoryPage Enhancement (src/pages/HistoryPage.tsx)
- Priority: P1
- Depends on: TIP-013 (History list), TIP-041 (Display name)
- Estimated: M (6-8 hours)

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18 + TypeScript + Dexie (IndexedDB) + Tailwind
- Key files to read first:
  - `src/pages/HistoryPage.tsx` (existing implementation)
  - `src/hooks/useScans.ts` (data fetching)
  - `src/db/schema.ts` (ScanRecord type)
  - `src/lib/scanDisplayName.ts` (TIP-041 display name logic)
- Patterns to follow: Mobile-first responsive design, smooth animations

## TASK
Upgrade the History page with advanced search, multi-filter, sorting options, and multiple view modes (List/Grid). Provide a better UX for managing large numbers of scans with improved discoverability.

## SPECIFICATIONS

### 1. View Modes
Support switching between different display layouts:

**List View (Default)**:
- Full-width cards with thumbnail on left
- Shows: title, first field preview, timestamp
- Best for: detailed scanning, selecting multiple

**Grid View**:
- 2-column grid with square thumbnails
- Shows: thumbnail, title only
- Best for: visual browsing, finding duplicates

**Compact View**:
- Dense list without thumbnails
- Text-only with inline actions
- Best for: large lists, quick scanning

### 2. Search Enhancements

**Advanced Search Bar**:
- Debounced input (300ms)
- Search across multiple fields:
  - Title/product_name
  - Contract/Lot/Barcode numbers
  - Raw OCR text
- Highlight matching terms in results

**Quick Filters** (filter chips):
- "Hôm nay" (Today)
- "Tuần này" (This week)
- "Tháng này" (This month)
- "Đã sửa" (Edited scans only)
- "Chưa sửa" (Not edited)

### 3. Sorting Options

**Sort Dropdown**:
- Mới nhất (Newest first) - Default
- Cũ nhất (Oldest first)
- Theo tên (A-Z)
- Theo tên (Z-A)
- Nhiều field nhất (Most fields)

**Sort by field value** (advanced):
- By contract number
- By lot number
- By barcode

### 4. UI Components

**View Mode Toggle**:
- 3 icon buttons in header area
- Active state: filled icon, primary color
- Inactive state: outline icon, neutral color
- Smooth transition between modes

**Filter Bar**:
- Horizontal scrolling chip container
- Active filters highlighted with checkmark
- "Bộ lọc" (Filter) button to expand full panel

**Sort Dropdown**:
- Icon button with current sort label
- Dropdown menu with sort options

**Advanced Filter Panel** (expandable):
- Date range picker
- Model tier filter (Free/Default/High)
- Token cost range
- Field count filter (has sizes, has notes, etc.)

### 5. State Management

**URL State** (for shareability):
```
/history?view=grid&sort=az&filter=today&search=áo+phông
```

**Local State**:
- `viewMode: 'list' | 'grid' | 'compact'`
- `sortBy: 'date_desc' | 'date_asc' | 'name_az' | 'name_za' | 'fields_count'`
- `filterChips: string[]` (active quick filters)
- `dateRange: { from?: Date; to?: Date }`
- `modelTierFilter: ('free' | 'default' | 'high')[]`

### 6. Animations

- View mode change: 200ms fade/scale transition
- Grid layout: 150ms staggered appearance
- Filter chips: slide-in/out with opacity
- Search results: highlight pulse animation

## ACCEPTANCE CRITERIA

### View Modes
- Given user is on History page
- When user clicks Grid icon
- Then scans display in 2-column grid layout

- Given user clicks List icon
- Then scans display in full-width card layout

- Given user clicks Compact icon
- Then scans display in text-only dense list

### Search
- Given user types "áo phông" in search
- When scan has product_name matching "áo phông"
- Then it appears in results

- Given user types "HD-2024"
- When scan has contract_no containing "HD-2024"
- Then it appears in results

### Filters
- Given user taps "Hôm nay" filter chip
- When scans load
- Then only today's scans are shown

- Given user taps "Đã sửa" filter chip
- When scans load
- Then only scans with `edited: true` are shown

- Given multiple filters are active
- When scans load
- Then scans matching ALL active filters are shown (AND logic)

### Sorting
- Given user selects "A-Z" sort
- When scans load
- Then scans are sorted alphabetically by display name

- Given user selects "Nhiều field nhất"
- When scans load
- Then scans with most fields appear first

### Persistence
- Given user changes view mode to Grid
- When user navigates away and returns
- Then view mode persists to Grid

- Given user shares URL
- When recipient opens link
- Then they see same filters and sort

## CONSTRAINTS
- DO NOT: Change the core scan data structure
- DO NOT: Break existing multi-select export functionality
- DO NOT: Add external search library (use existing filtering)
- REUSE: `useScans` hook for data fetching
- REUSE: `scanDisplayName` from TIP-041 for display titles
- REUSE: Existing Toast component for feedback
- SKIP: Bulk edit functionality
- SKIP: Offline sync capabilities

## FILES TO CREATE
- `src/components/ui/ViewModeToggle.tsx` - View mode switcher
- `src/components/ui/FilterChip.tsx` - Reusable filter chip
- `src/components/ui/SortDropdown.tsx` - Sort options dropdown
- `src/components/ui/AdvancedFilterPanel.tsx` - Expandable filter panel
- `src/components/ui/ScanGridItem.tsx` - Grid item component
- `src/components/ui/ScanCompactItem.tsx` - Compact list item
- `src/lib/scanFilters.ts` - Filter/sort logic utilities

## FILES TO MODIFY
- `src/pages/HistoryPage.tsx` - Integrate new components and logic
- `src/hooks/useScans.ts` - Add sort and filter support (optional server-side)

## QUALITY GATE
- [ ] All view modes render correctly at 375px, 390px, 428px
- [ ] Filter combinations work correctly (AND logic)
- [ ] Sort order persists correctly
- [ ] Smooth animations between view modes
- [ ] URL state updates correctly and is shareable
- [ ] No console errors during filter/sort operations
- [ ] Performance: smooth scrolling with 100+ scans
- [ ] Touch targets minimum 44x44px