# TIP-065: User Profile Page and Header Entry

## HEADER
- TIP-ID: TIP-065
- Project: ocr-mobile-web
- Module: user-profile-ui
- Priority: P1
- Depends on: TIP-064
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Dependency: TIP-064 provides expanded `UserProfile`, `authApi.updateProfile`, normalization/validation helpers, and `useAuthStore.updateUserProfile`.
- Tech stack: React Router, Tailwind mobile-first design system, Zustand auth store.
- Key files to read first:
  - `src/App.tsx`
  - `src/components/layout/Header.tsx`
  - `src/components/layout/Layout.tsx`
  - `src/pages/SettingsPage.tsx`
  - `src/lib/authApi.ts`
  - `src/store/authStore.ts`
  - `src/components/ui/index.ts`
- Patterns to follow:
  - Use `Layout title="Hồ sơ"` for protected page shell.
  - Use card sections like Settings page.
  - Use Header avatar as the only new navigation entry point.

## APPLICABLE STANDARDS
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — implement Profile at 320/375px first, enhance tablet+.
- [ui/runtime-responsive-hooks](../standards/ui/runtime-responsive-hooks.md) — use runtime hook only if Header behavior cannot be CSS-only.

## TASK
Implement the Profile page UI and Header avatar entry point. Users must be able to open `/profile`, view read-only account details, edit personal profile fields, save changes through `authApi.updateProfile`, reset unsaved changes, and see Vietnamese feedback.

## SPECIFICATIONS
### Business Rules
1. Add protected route `/profile` in `src/App.tsx`.
2. Create `src/pages/ProfilePage.tsx`.
3. Header must render a touch-friendly avatar/initials button for authenticated users.
4. Header avatar click navigates to `/profile`.
5. Profile page shows:
   - Profile summary/avatar card.
   - Editable form: display name, description, phone, job title, department, company, avatar URL.
   - Read-only account info: email, role, created date, last login.
   - Actions: `Lưu hồ sơ`, `Đặt lại`.
6. On successful save, call store sync action and show success toast.
7. On reset, restore form state from current persisted user.
8. Disable save while submitting.
9. Keep existing mobile logout button available unless Header spacing is impossible; do not remove logout entirely.

### Validation
1. Use TIP-064 helper/schema if available.
2. Show inline Vietnamese validation errors before API call.
3. Do not submit invalid payload.

### Error Handling
1. Network/API error shows toast or inline error without clearing form.
2. 401 should trigger logout/navigation to login using existing auth behavior.
3. Schema error should show `Dữ liệu hồ sơ từ server không đúng định dạng.`.

## ACCEPTANCE CRITERIA
- Given an authenticated user on History/Settings/Analytics When they tap Header avatar Then route changes to `/profile`.
- Given `/profile` loads When user has no `displayName` Then initials are derived from email.
- Given user edits valid fields When they tap `Lưu hồ sơ` Then save button disables, API is called, toast confirms success, and Header reflects updated identity.
- Given user enters invalid phone When they tap save Then inline validation appears and API is not called.
- Given user edits fields then taps `Đặt lại` When form has unsaved changes Then values return to persisted profile.
- Given 320px viewport When Profile renders Then no horizontal overflow and controls remain at least 44px high.
- Given keyboard navigation When tabbing through Header/Profile Then avatar, inputs, reset, and save have visible focus states.

## CONSTRAINTS
- DO NOT: add a bottom-nav Profile item.
- DO NOT: implement backend/API contract here.
- DO NOT: implement binary avatar upload; avatar URL/data URL text input only.
- DO NOT: store profile separately in localStorage.
- REUSE: `Layout`, `Toast`, `PrimaryButton`, existing design tokens, `authApi.updateProfile`, `useAuthStore`.
- SKIP: unit/e2e/a11y test implementation; test work belongs to TIP-066/TIP-067 unless small component tests are natural during development.

## FILE OWNERSHIP
UI agent owns:
- `src/pages/ProfilePage.tsx`
- `src/App.tsx`
- `src/components/layout/Header.tsx`
- Optional small UI helper component colocated only if it keeps `ProfilePage.tsx` under file-size limits.

## QUALITY GATE: /vibecode:tip Self-Review
- Completeness: PASS — route, page, header entry, form behavior, validation display, and mobile/a11y criteria are explicit.
- Multi-agent boundary: PASS — depends on TIP-064 and avoids backend files.
- Gaps declared: PASS — tests/polish are delegated to TIP-066/TIP-067.
