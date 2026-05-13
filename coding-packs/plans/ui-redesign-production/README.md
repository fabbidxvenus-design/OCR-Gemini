# UI Redesign Production Plan

Implement production-ready redesign for HLVN OCR mobile web app based on Google Stitch designs.

## Source Design

- Google Stitch project: `projects/17363451422652957148`
- Project title: **OCR Mobile Web - Production**
- Design system asset: `assets/8074986626643835639`
- Direction: **Industrial Utility + AI Trust**

## Goal

Migrate the current UI from POC/default app styling to a production-grade mobile OCR operations tool.

## TIPs

- [TIP-062: Design Tokens & Tailwind Config](tips/TIP-062-design-tokens-tailwind.md)
- [TIP-063: Shared Layout Components](tips/TIP-063-shared-layout-components.md)
- [TIP-064: Auth Screens](tips/TIP-064-auth-screens.md)
- [TIP-065: Camera Scan Screen](tips/TIP-065-camera-scan-screen.md)
- [TIP-066: OCR Processing Screen](tips/TIP-066-ocr-processing-screen.md)
- [TIP-067: OCR Result Review & Edit Screens](tips/TIP-067-result-review-edit.md)
- [TIP-068: History & Detail Screens](tips/TIP-068-history-screens.md)
- [TIP-069: Analytics Dashboard](tips/TIP-069-analytics-dashboard.md)
- [TIP-070: Settings Screen](tips/TIP-070-settings-screen.md)
- [TIP-071: Visual Verification](tips/TIP-071-visual-verification.md)

## Execution

Use zflow plan-supervised mode:

```bash
/zflow --plan ui-redesign-production --phase execute auto
```
