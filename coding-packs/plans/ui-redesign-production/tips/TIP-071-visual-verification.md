# TIP-071: Visual Verification

## Objective
Capture screenshots of all redesigned screens for visual QA verification.

## Source Screens
All screens from Stitch project `17363451422652957148`:
- Login: `e0a9428012f74a629cc39d8507cfc128`
- Camera Scan: `0b323b263d334df68298cafbdf3b6c02`
- OCR Processing: `37a58f153b264c3dbf7eb015e925bc94`
- Result Review: `dc0bf719691d43e7b50a61a4e8c01316`
- History: `06fa1786a57a4d139e0924fb7a19e597`
- Analytics: `9698637998e24c91a04e0177e157fb2e`
- Settings: `52e481a3a4044eba88d768ad4e20a7d5`

## Requirements

### Screenshot Capture
For each screen:
1. Start dev server (`pnpm dev`)
2. Navigate to screen route
3. Capture screenshot at 390×844 viewport (mobile)
4. Save to `coding-packs/plans/ui-redesign-production/screenshots/`

### Visual Checklist
Verify each screenshot:
- [ ] Design tokens applied (teal primary, correct typography)
- [ ] Mobile-first layout (no overflow, proper spacing)
- [ ] Touch targets ≥48px
- [ ] Confidence markers visible (green/amber where applicable)
- [ ] Bottom navigation styled correctly
- [ ] No POC-looking UI elements remain
- [ ] Dark mode camera stage (if applicable)
- [ ] Staged processing checklist (if applicable)

### Comparison
- Compare implementation screenshots against Stitch design screens
- Document any intentional deviations
- Flag any unintentional visual regressions

## Acceptance Criteria
- All 7+ screens captured at mobile viewport
- Visual checklist completed for each screen
- Screenshots saved to plan directory
- Build passes and dev server runs without errors
