# zflow Pipeline: Settings & Field Categorization

## Plan Overview
**Plan Directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\coding-packs\plans\Setting-page&Filed-categorization`  
**Mode**: Plan-supervised (skip RRI, SDD, PROPOSAL)  
**TIPs**: TIP-037, TIP-038  
**Tier**: STANDARD  
**Started**: 2026-05-07T07:17:10Z

## TIP Summary

### TIP-037: Settings Page - Model Selector
- **Estimate**: 6-8 hours (M)
- **Priority**: P1
- **Dependencies**: TIP-004 (IndexedDB), TIP-005 (Routing)
- **Scope**: Create Settings page with 3 model tiers (Free, Default, High), token usage statistics, model selection persistence

### TIP-038: Field Categorization - Main vs Other
- **Estimate**: 4-6 hours (M)
- **Priority**: P1
- **Dependencies**: TIP-009 (OCR Display), TIP-010 (Edit Fields)
- **Scope**: Categorize OCR fields into Main (Barcode, Lot No, Product, Quantity, Contract) and Other, update UI with visual hierarchy

## Complexity Analysis

### TIP-037 Complexity Score
- **Technical**: 35/100 (new page, IndexedDB CRUD, model config)
- **Domain**: 25/100 (straightforward model selection)
- **Integration**: 30/100 (integrates with existing gemini.ts, db schema)
- **Total**: 30/100 → **STANDARD tier**

### TIP-038 Complexity Score
- **Technical**: 25/100 (regex matching, field categorization)
- **Domain**: 30/100 (business logic for field priority)
- **Integration**: 35/100 (touches OCR display, edit, detail pages)
- **Total**: 30/100 → **STANDARD tier**

**Combined Complexity**: 30/100 → **STANDARD tier confirmed**

## Phase: INTAKE → SPEC

**Next Action**: Generate G/W/T specs for both TIPs, create failing tests (Red Gate)

---

*Pipeline state: INTAKE complete, transitioning to SPEC*
