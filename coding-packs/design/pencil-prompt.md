# Pencil Design Prompt: OCR Gemini Redesign

Create a high-fidelity mobile UI design (390x844px) for a warehouse OCR application called "OCR Gemini".

## Global Style
- **Theme**: Professional, Industrial, High-Contrast.
- **Colors**: Primary Blue (#2563EB), Slate 900 for text, Slate 50 for background.
- **Components**: Rounded corners (12px), Large buttons (min 48px height), subtle shadows.
- **Icons**: Lucide style (thin strokes, clear metaphors).

## Screen 1: Camera
- Full-screen viewfinder.
- Top: Semi-transparent bar with Close(X), Flash(Toggle), and Gallery access.
- Bottom: Floating large white circular shutter button (( O )) with 64px diameter. Small gallery preview on the left, camera switch on the right.

## Screen 2: History (Batch Mode)
- Search input at the top with "Select" toggle button.
- Vertical list of cards. Each card contains: a small image thumbnail (left), bold title (Order/SKU), date/time (gray), and a right chevron.
- **Interaction**: In Select Mode, show checkboxes on the left of each card.
- **Floating Bar**: When items are selected, a floating blue bar appears at the bottom with "X items selected" and a "Download Excel" button with `FileSpreadsheet` icon.

## Screen 3: Scan Detail
- Top navigation with Back and Edit.
- Card showing the captured photo (4:3 aspect ratio).
- Information cards below the image. AI-verified fields show a small green checkmark.
- Fixed bottom actions: Copy Text, Share, Export Single Excel.

## Screen 4: Analytics
- KPI Cards at the top showing "Total Scans" and "Total Cost".
- A simple bar chart showing top 5 scanned SKUs.
- Bottom navigation with 3 tabs: Camera, History, Analytics.

Ensure the design feels fast, reliable, and optimized for one-handed operation in a warehouse environment.
