# Research Report: OCR & Scanning App UI/UX Patterns

**Timestamp:** 2026-05-06  
**Researcher:** Claude Code (research skill)  
**Scope:** Mobile OCR apps for invoices, receipts, and labels

---

## Executive Summary

Research on leading mobile scanning apps (Adobe Scan, CamScanner, Microsoft Lens, Google Lens, Notion, and banking apps) reveals consistent patterns in scan workflow, result display, and export mechanisms. Key findings:

1. **Camera-first scanning** — single tap to capture with AI edge detection
2. **Multi-page batch scanning** — continuous capture mode is standard
3. **Post-capture editing** — crop, rotate, filters, reorder pages
4. **Cloud + local storage** — history accessible across devices
5. **Selective export** — checkboxes for multi-select, batch PDF/Excel export
6. **Tab-based navigation** — Camera | Files/History | Profile/Settings

---

## Plain Language Summary (Tóm tắt dễ hiểu)

| App | Điểm mạnh UI/UX | Điểm yếu |
|-----|----------------|----------|
| **Adobe Scan** | Tự động crop, chỉnh màu thông minh, export PDF ngay | Phức tạp cho người mới |
| **CamScanner** | Batch scan mạnh, nhiều filter, share dễ | Quảng cáo phiền |
| **Microsoft Lens** | Tích hợp Office 365, miễn phí không quảng cáo | Tính năng ít hơn đối thủ |
| **Google Lens** | AI mạnh, dịch thuật real-time, tìm kiếm ảnh | Không có export file văn bản tốt |
| **Notion** | Scan vào database, link với workspace | Không phải app scan chuyên dụng |
| **App ngân hàng VN** | Mã vạch, QR, hóa đơn điện nước | UI riêng biệt từng ngân hàng |

### Why good scanning apps work:
- **Auto-detect edges** → reduce user effort to near zero
- **Preview immediately** → confidence in capture quality
- **Quick export** → get data out in < 3 taps
- **Searchable history** → find old scans in seconds

---

## Research Methodology

- Sources consulted: 8 (web research, app store descriptions, UX analysis)
- Date range: 2023–2026
- Key search terms: "mobile OCR app UX", "scanner app UI patterns", "batch scan workflow", "receipt export features"

---

## Key Findings

### 1. Industry Standard Scan Workflow

```
[Camera View] → [Auto-detect] → [Preview/Edit] → [Save] → [Export]
     ↑                                              ↓
     └──────────────────────────────────────────────┘
              (Most apps allow re-edit)
```

**Steps:**
1. **Open camera** — Full-screen viewfinder, prominent capture button
2. **Auto-detect** — Blue border shows detected document edges in real-time
3. **Capture** — Tap or auto-capture when stable
4. **Batch mode** — "Add page" button to continue scanning
5. **Preview** — Thumbnail strip at bottom, tap to edit individual pages
6. **Edit** — Crop, rotate, filter (color/B&W/grayscale), reorder
7. **Save** — Auto-named with date, editable title
8. **Export** — Share button → PDF/Image/Text/Excel

### 2. Common Navigation Structure

| Tab | Purpose | Icon |
|-----|---------|------|
| **Scan** | Camera viewfinder | 📷 Camera |
| **Files/History** | List of scanned documents | 📁 Folder or 📋 List |
| **Settings** | App configuration | ⚙️ Gear |

**History Tab Patterns:**
- Card-based grid or list view
- Thumbnail + title + date + page count
- Swipe actions: delete, share
- Long-press for multi-select
- Checkbox selection mode for batch export
- Search bar at top (by name, date, OCR text)

### 3. Result Display Patterns

**Single Document View:**
```
┌────────────────────────────────┐
│ ← Back    [Edit] [Share] [⋮]   │
├────────────────────────────────┤
│                                │
│     [Scanned Document]         │
│                                │
├────────────────────────────────┤
│ Page 1 of 3    ◀ ▶            │
└────────────────────────────────┘
```

**OCR Results Display:**
- **Extracted text** in scrollable card below image
- **Structured fields** displayed as key-value pairs
- **Confidence indicators** — usually subtle (not dominant badges)
- **Edit button** to correct OCR output
- **Copy/Share** individual fields

### 4. Export UX Patterns

**Multi-Select Export Flow:**
```
[History Tab]
    ↓
[Tap checkmark icon to enter select mode]
    ↓
[Select multiple documents via checkboxes]
    ↓
[Bottom bar appears: "X selected" + [Export] button]
    ↓
[Export modal: PDF | Images | Excel/CSV]
    ↓
[Share sheet: Email, AirDrop, Drive, etc.]
```

**Export Format Options:**
| Format | Use Case | Notes |
|--------|----------|-------|
| PDF | Archival, sharing | Single or multi-page |
| Images | Individual files | JPG/PNG per page |
| Excel/CSV | Spreadsheets | For receipts with tables |
| Text | OCR raw output | Plain text copy |
| Copy to app | Integration | Notion, Drive, etc. |

### 5. Mobile-First Design Principles

**Camera View:**
- Full-screen viewfinder (status bar hidden)
- Floating action button for capture
- Top controls: flash toggle, auto/manual, close
- Bottom: gallery access, batch mode toggle

**Gestures:**
- Pinch to zoom on preview
- Swipe left/right to navigate pages
- Long-press to select in history
- Pull-to-refresh on file list

**Accessibility:**
- Large touch targets (min 44pt)
- High contrast text
- Haptic feedback on capture
- VoiceOver/TalkBack support

### 6. Vietnamese Banking App Patterns (MoMo, VNPay, ZaloPay)

**Invoice/Bill Scanning:**
```
┌────────────────────────────────┐
│ Quét hóa đơn                    │
├────────────────────────────────┤
│ [Camera with overlay guide]     │
│                                │
│ ┌────────────────────────────┐ │
│ │   Place bill within frame   │ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│ [Gallery]  [Capture]  [Flash]   │
└────────────────────────────────┘
```

**Key features:**
- Barcode/QR code detection for bill IDs
- Direct payment integration
- Auto-populate billing info
- Save to transaction history

---

## Comparative Analysis

| Feature | Adobe Scan | CamScanner | Microsoft Lens | Google Lens | Notion |
|---------|------------|-----------|---------------|-------------|--------|
| Auto edge detection | ✅ | ✅ | ✅ | ✅ | ✅ |
| Batch scanning | ✅ | ✅ | ✅ | ❌ | ✅ |
| OCR accuracy | High | High | High | Very High | Medium |
| Export Excel | Via Adobe | ✅ | Via Office | ❌ | ❌ |
| Export PDF | ✅ | ✅ | ✅ | ✅ | ✅ |
| History search | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multi-select export | ✅ | ✅ | ✅ | N/A | ✅ |
| Free tier | 5GB cloud | Limited | ✅ | ✅ | ✅ |
| Mobile-first | Medium | Medium | ✅ | ✅ | ✅ |

---

## Implementation Recommendations

### For OCR-Gemini Mobile Web

**1. Navigation Structure**
```tsx
// Recommended tab structure
const tabs = [
  { path: '/camera', label: 'Scan', icon: Camera },
  { path: '/history', label: 'Lịch sử', icon: FolderOpen },
  { path: '/analytics', label: 'Thống kê', icon: BarChart },
  { path: '/settings', label: 'Cài đặt', icon: Settings },
];
```

**2. History Page — Multi-Select Pattern**
```tsx
// Enter select mode via toggle button
// Bottom action bar with:
// - Selected count
// - Select All / Deselect All
// - Export button (primary)
// - Delete button (danger, optional)
```

**3. Camera Page — Minimal UI**
```tsx
// Full-screen camera
// Floating capture button (bottom center)
// Top bar: flash toggle, gallery access, close
// Minimal overlay guides
```

**4. Result Page — Clear Hierarchy**
```tsx
// Image preview (top 60%)
// OCR results card (scrollable below)
// Action bar: Edit | Copy | Share
// No confidence badges (per TIP-023)
```

**5. Export — Accessible Location**
- NOT on camera result page (single scan)
- YES on History page (batch operations)
- YES in detail view (share single scan)

---

## Best Practices Summary

| Pattern | Do | Don't |
|---------|-----|-------|
| **Scan flow** | Auto-detect, single tap | Manual crop required |
| **Confidence** | Show subtle indicators | Large badges dominating UI |
| **Export** | History page multi-select | Result page for single items |
| **Navigation** | Tab bar (3-4 tabs) | Hamburger menu |
| **History** | Card list + search | Grid-only (hard to scan) |
| **Edit OCR** | Inline editing | Modal forms |
| **Empty states** | Helpful illustration + CTA | Blank space |

---

## Resources & References

### Official Documentation
- [Adobe Scan](https://www.adobe.com/acrobat/mobile/scanner-app.html)
- [CamScanner](https://www.camscanner.com/)
- [Microsoft Lens](https://www.microsoft.com/en/microsoft-lens)
- [Google Lens](https://lens.google/)

### UX Research
- [Nielsen Norman Group - Mobile UX](https://www.nngroup.com/)
- [Apple Human Interface Guidelines - Document Apps](https://developer.apple.com/design/human-interface-guidelines/document-apps)

---

## Appendices

### A. Glossary

| Term | Definition |
|------|------------|
| **OCR** | Optical Character Recognition - extract text from images |
| **Edge detection** | AI识别文档边界，自动裁剪 |
| **Batch scan** | 连续扫描多页，合并为一个文档 |
| **Confidence score** | OCR结果可信度指标 |
| **Structured data** | 结构化数据（字段-值对）vs 原始文本 |

### B. App Feature Matrix

| Feature | Our App | Adobe | CamScanner | MS Lens |
|---------|---------|-------|------------|---------|
| Mobile-first web | ✅ | N/A | N/A | N/A |
| Auto edge detect | ✅ | ✅ | ✅ | ✅ |
| Batch scan | ✅ | ✅ | ✅ | ✅ |
| Export Excel | ✅ | Via sub | ✅ | Via Office |
| Multi-select | ✅ | ✅ | ✅ | ✅ |
| History search | ✅ | ✅ | ✅ | ✅ |
| Offline support | ✅ (IndexedDB) | ❌ | ❌ | ❌ |

---

## Unresolved Questions

1. **Biometric auth** — Should we add fingerprint/FaceID for accessing scan history?
2. **Cloud sync** — Plan for cross-device sync via backend?
3. **Collaboration** — Share scans with team members?
4. **AI enhancements** — Add category detection, duplicate detection?