# Bukolabs.io — Desktop Scanner (Electron + React)

## Developer setup

| Requirement | Version |
|-------------|---------|
| Node.js | **20 LTS** (`>=20.0.0 <21`) — use `nvm use` at repo root |
| npm | `>=10.0.0` |

From the **monorepo root**:

```powershell
cd "c:\Desktop Scanner App"
npm install
npm run dev:user
```

Browser-only: `npm run dev:web -w user-interface-electron` → http://localhost:5173

Pack Windows installer: `npm run build:user` (from repo root).

---

# CURSOR PROMPT — DESKTOP APP (Electron + React)
# Bukolabs.io — Desktop Scanner App
# Complete screen-by-screen UI + flow implementation guide
# Based on Figma designs

---

You are implementing the complete frontend of the Bukolabs.io Desktop Scanner Electron app.
Build every screen below exactly as described — content, layout, components, and navigation flow.
Do NOT use placeholder text. Every label, button, field, and state shown here is final.

---

## DESIGN TOKENS (apply everywhere)

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        darkest:  '#0A2E20',  // deepest sidebar/splash bg
        dark:     '#0D3D2E',  // sidebar bg, splash bg
        deep:     '#1A5240',  // sidebar hover, card accent
        primary:  '#166534',  // active nav item bg
        emerald:  '#059669',  // CTA buttons, badges, checkmarks
        bright:   '#10B981',  // CTA hover state
        mint:     '#D1FAE5',  // soft tag bg, feature pills
        bg:       '#F0FBF6',  // page background
        surface:  '#FFFFFF',  // card backgrounds
        border:   '#E2F0EB',  // card borders, dividers
      },
      status: {
        active:   '#059669',
        inactive: '#6B7280',
        warning:  '#D97706',
        error:    '#DC2626',
      }
    },
    fontFamily: { sans: ['Inter', 'sans-serif'] },
    keyframes: {
      loadingBar: { '0%': { width: '0%' }, '100%': { width: '100%' } }
    },
    animation: { 'loading-bar': 'loadingBar 2.3s ease-in-out forwards' }
  }
}
```

---

## ROUTING (App.tsx)

```tsx
<Routes>
  <Route path="/"          element={<Navigate to="/splash" replace />} />
  <Route path="/splash"    element={<SplashScreen />} />
  <Route path="/welcome"   element={<WelcomeScreen />} />
  <Route path="/login"     element={<LoginScreen />} />
  <Route path="/activate"  element={<ActivateScreen />} />
  <Route path="/checking"  element={<CheckingCredentials />} />
  <Route path="/no-internet" element={<NoInternetModal />} />
  <Route path="/forgot"    element={<ForgotPasswordScreen />} />
  <Route path="/request-access" element={<RequestAccessScreen />} />
  <Route path="/request-email"  element={<RequestThroughEmail />} />
  <Route path="/request-sms"    element={<RequestThroughSMS />} />
  <Route path="/request-sent"   element={<RequestSentSuccess />} />
  <Route path="/checking-connection" element={<CheckingConnection />} />
  <Route path="/validating-key" element={<ValidatingSerialKey />} />
  <Route path="/activated"      element={<AccountActivated />} />
  <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard"   element={<DashboardScreen />} />
    <Route path="scan"        element={<ScanScreen />} />
    <Route path="documents"   element={<DocumentsScreen />} />
    <Route path="search"      element={<SearchScreen />} />
    <Route path="devices"     element={<DevicesScreen />} />
    <Route path="settings"    element={<SettingsScreen />} />
    <Route path="help"        element={<HelpScreen />} />
  </Route>
</Routes>
```

---

## ─────────────────────────────────────────
## SCREEN 1 — SPLASH SCREEN
## Route: /splash → auto-navigate to /welcome after 2.5s
## ─────────────────────────────────────────

Full-screen window. Background: #0D3D2E. No sidebar, no nav bar.

LAYOUT (vertical center of screen):
```
[bukolabs.io logo + "infinite possibilities" — top-left corner, white, small, opacity 60%]

CENTER BLOCK:
  ┌─────────────────────────┐
  │   [Scanner icon in       │   white rounded square icon, 64x64
  │    rounded card]         │
  │                          │
  │   bukolabs.io            │   white text, 12px, opacity 50%
  │   Desktop Scanner        │   white, 28px bold
  │   Secure document        │   white, 13px, opacity 50%
  │   scanning made simple   │
  │                          │
  │   [━━━━━━━━━━━━━━━━━]    │   animated loading bar, width 180px
  │                          │   bar color: #10B981, track: white/20%
  │   Preparing your         │   white, 11px, opacity 30%
  │   workspace...           │
  └─────────────────────────┘

BOTTOM (absolute, centered, 20px from bottom):
  ADMIN-CONTROLLED ACCESS  •  SAFE LOCAL SCANNING  •  ONLINE/OFFLINE READY
  white text, 10px, opacity 25%, letter-spacing wide
```

FLOW: After loading bar finishes (2.3s animation), auto-navigate to /welcome.

---

## ─────────────────────────────────────────
## SCREEN 2 — WELCOME SCREEN
## Route: /welcome
## ─────────────────────────────────────────

Background: #F0FBF6. Centered white card, 720px wide, rounded-2xl, shadow-xl.

LAYOUT (card — two-column):
```
LEFT COLUMN (flex-1):
  [bukolabs.io logo]  bukolabs.io
                      infinite possibilities

  "Welcome to"              — gray-500, 13px
  "Desktop Scanner"         — gray-900, 32px, font-bold
  "Securely scan, organize, and manage documents with ease"  — gray-500, 13px, mb-8

  OPTION BUTTON 1:  [UserIcon]  "Returning User"
                                "Sign in to your assigned account"  → /login

  OPTION BUTTON 2:  [KeyIcon]   "Activate Account"
                                "Use your admin-provided serial key" → /activate

  Each option button: border-2 border-brand-border, rounded-xl, p-4,
  hover: border-brand-emerald, left icon in mint bg circle, chevron right on right edge

  FEATURE PILLS (row):
  ✓ Assigned Access   ✓ Access Key Check   ✓ Online / Offline Ready
  mint background, brand-primary text, rounded-full, text-11px

RIGHT COLUMN (w-52):
  [Scanner illustration image — document/scanner graphic with teal accent]
  File: /assets/scanner-illustration.png or SVG placeholder
```

BOTTOM of card (full-width border-top, flex row, justify-between, text-11px gray-400):
```
  🛡 Admin-controlled access    🔒 Safe local scanning    🌐 Online/Offline ready
```

---

## ─────────────────────────────────────────
## SCREEN 3 — RETURNING USER LOGIN
## Route: /login
## ─────────────────────────────────────────

Background: #F0FBF6. White card, 440px wide, centered, rounded-2xl, shadow-lg, p-8.

CONTENT (top to bottom):
```
[bukolabs.io logo]  bukolabs.io  |  infinite possibilities   — 12px, gray

"Returning User"       — gray-900, 20px, font-bold
"Sign in to your assigned account"  — gray-500, 13px, mb-6

FORM FIELDS:
  Username             — label: "Username", 11px, font-medium, gray-600
  [Enter your username]  — input, border-brand-border, rounded-lg, py-2.5

  Password             — label: "Password"
  [Enter password] [👁] — input + eye toggle, border-brand-border

ROW:
  [☐] Remember me on this device   |   "Forgot Credentials?" → /forgot

BUTTON:
  [→ Sign In]   — full width, bg-brand-emerald, white text, py-3, rounded-lg

ERROR STATE (shows below button if credentials invalid):
  Red text in red-50 bg box: "Invalid username or password. X attempts remaining."
  After 5 failures: "Account temporarily locked. Contact your admin."

SECURITY PILLS (bottom, border-top):
  Admin-controlled access  •  Local scanning  •  Online/Offline ready
```

FLOW:
- Submit → show /checking screen (loading state)
- Success → navigate to /app/dashboard
- Fail → show error inline, count attempts
- "Forgot Credentials?" → /forgot

---

## ─────────────────────────────────────────
## SCREEN 4 — ACTIVATE ACCOUNT
## Route: /activate
## ─────────────────────────────────────────

Background: #F0FBF6. White card, 440px wide, centered, rounded-2xl, shadow-lg, p-8.

CONTENT:
```
[bukolabs.io logo]  bukolabs.io  |  infinite possibilities

"Activate"                  — gray-900, 20px, bold
"Activate your workspace using assigned serial access"  — gray-500, 13px

FIELD:
  Label: "Username"
  [Enter your username]   — input

  Label: "Admin-assigned account"
  Note: "Access is controlled and managed by your administrator"  — 11px gray-400

  Label: "Serial key verification"
  Note: "Your unique key secures your workspace"  — 11px gray-400
  [Enter your serial key]   — monospace font, placeholder: XXXX-XXXX-XXXX-XXXX

FEATURE LIST (with green check icons):
  ✓ Secure local access
  ✓ Serial key verification — Your unique key secures workspace
  ✓ Secure local access — Your data stays on your device

BUTTON:
  [Activate Account]  — full width, bg-brand-emerald, white

LINK: "← Back to login"  gray text below button  → /welcome

BOTTOM: Don't have an account yet? — gray text
  "Contact your assigned administrator to obtain your account credentials and serial key to activate access"
  [Request Through Email]  [Request Through SMS]  — outline buttons

SECURITY PILLS (border-top):
  Admin-controlled access  •  Safe local scanning  •  Online/Offline ready
```

FLOW:
- Submit → /validating-key
- Success → /activated
- Fail → show "Error / Invalid Key" inline error

---

## ─────────────────────────────────────────
## SCREEN 5 — FORGOT PASSWORD
## Route: /forgot
## ─────────────────────────────────────────

Background: #F0FBF6. White card, 440px wide, centered, rounded-2xl, shadow-lg, p-8.

CONTENT:
```
"Forgot Password"          — gray-900, 20px, bold
"For security, credentials must be reset through the Admin"  — gray-500, 13px, mb-6

INFO BOX (gray-50, border, rounded-xl, p-4, mb-6):
  "Need Account Access?"
  "Contact your assigned administrator to reset your credentials.
   Choose how you'd like to request access to your administrator."

  OPTION 1: [📧 icon] "Request Through Email" → /request-email
  OPTION 2: [💬 icon] "Request Through SMS"   → /request-sms
  OPTION 3: [👤 icon] "Ask Admin Personally"   (no route, informational)

BUTTONS:
  [Cancel]        → /login
  [Send Request]  → /request-sent (after choosing method)
```

---

## ─────────────────────────────────────────
## SCREEN 6 — REQUEST THROUGH EMAIL
## Route: /request-email
## ─────────────────────────────────────────

White card, 440px, centered.

```
Title: "Request Through Email"
Subtitle: "A request will be sent to your administrator's email"

FIELD: "Administrator Email" → [email input]

BUTTONS:
  [Cancel]       [Send Request]  — Send → /request-sent
```

---

## ─────────────────────────────────────────
## SCREEN 7 — REQUEST THROUGH SMS
## Route: /request-sms
## ─────────────────────────────────────────

Same as email screen but for SMS:
```
Title: "Request Through SMS"
Field: "Phone Number" → [phone input]
Buttons: [Cancel] [Send Request] → /request-sent
```

---

## ─────────────────────────────────────────
## SCREEN 8 — REQUEST SENT SUCCESSFULLY
## Route: /request-sent
## ─────────────────────────────────────────

White card, centered, text-center:
```
[✓ green circle icon, 56px]
"Request Sent Successfully"        — gray-900, 18px, bold
"Your request has been forwarded to your administrator.
 They will contact you through your registered contact details."  — gray-500, 13px

[Back to Sign In]   — green CTA button  → /login
```

---

## ─────────────────────────────────────────
## SCREEN 9 — CHECKING CREDENTIALS (loading)
## Route: /checking
## ─────────────────────────────────────────

White card, centered, text-center:
```
[Circular spinner animation, brand-emerald, 48px]
"Checking Credentials"     — gray-800, 16px, font-medium
"Please wait while the system verifies your assigned credentials"  — gray-400, 12px

[Back to Sign In]   — outline button  → /login
```

Auto-navigates after API resolves: success → /app/dashboard, fail → /login with error.

---

## ─────────────────────────────────────────
## SCREEN 10 — ACCOUNT ACTIVATED SUCCESSFULLY
## Route: /activated
## ─────────────────────────────────────────

White card, centered, text-center:
```
[✓ green circle with check, 56px]
"Account Activated Successfully"   — gray-900, 18px, bold
"Your account has been registered. The system will verify
 your assigned credentials and activate your workspace."  — gray-500, 13px

[Continue to Dashboard]  — green CTA  → /app/dashboard
```

---

## ─────────────────────────────────────────
## SCREEN 11 — CHECKING CONNECTION
## Route: /checking-connection
## ─────────────────────────────────────────

White card, centered, text-center:
```
[Spinner, 40px, emerald]
"Checking Connection"       — gray-800, 16px
"Preparing your connection for your workspace and syncing
 any pending updates..."    — gray-400, 12px

[Back to Sign In]           — outline button
```

---

## ─────────────────────────────────────────
## SCREEN 12 — VALIDATING SERIAL KEY (loading)
## Route: /validating-key
## ─────────────────────────────────────────

White card, centered, text-center:
```
[Spinner, 40px, emerald]
"Validating Serial Key"     — gray-800, 16px
"Checking your key against the activation database..."  — gray-400, 12px

[Back to Sign In]           — outline button
```

---

## ─────────────────────────────────────────
## SCREEN 13 — NO INTERNET CONNECTION MODAL
## ─────────────────────────────────────────

Shown as an overlay on top of /login when no internet is detected.
Dark overlay (bg-black/40). White centered card.

```
[⚠️ amber warning icon, 48px in amber-100 circle]
"No Internet Connection Found"   — gray-900, 16px, font-semibold
"You can continue offline with locally cached data, or
 check your connection and try again."  — gray-500, 12px

BUTTONS (side by side):
  [Offline]          — outline, gray border  → continue login offline
  [Connect Online]   — bg-brand-emerald      → retry internet check
```

---

## ─────────────────────────────────────────
## APP SHELL — AppShell.tsx
## All /app/* routes render inside this
## ─────────────────────────────────────────

```tsx
// Full screen layout: dark sidebar left + content right

SIDEBAR (220px wide, full height, background: #0D3D2E):

  TOP — Logo area (px-4 py-4, border-b border-white/10):
    [bukolabs.io logo icon]  bukolabs.io
                             infinite possibilities
    (white text, logo-white variant)

  NAV ITEMS (px-2 py-3, space-y-0.5):
    Each item: flex items-center gap-3 px-3 py-2 rounded-lg text-sm
    Active:   bg-brand-emerald text-white font-medium
    Inactive: text-white/60 hover:text-white hover:bg-white/10

    Items in order:
    [DashboardIcon]   Dashboard       → /app/dashboard
    [ScanIcon]        Scan            → /app/scan
    [FolderIcon]      Documents       → /app/documents
    [SearchIcon]      Search          → /app/search
    [MonitorIcon]     Devices         → /app/devices
    [SettingsIcon]    Settings        → /app/settings
    [HelpCircleIcon]  Help / About    → /app/help

  BOTTOM (px-3 pb-3 border-t border-white/10 pt-3):
    "Secure & Ready" label — white/40, 10px
    "Your workspace is protected and ready to scan"  — white/30, 10px
    [🔒 icon]  (small, white/40)

    User block:
    [Avatar circle, bg-brand-emerald, initials white]
    Name — white, 12px, font-medium
    Role — white/40, 10px
    [Log Out button — text-white/40 hover:text-white, text-xs]

TOP BAR (h-12 bg-white border-b border-brand-border px-5):
  LEFT:  page title (14px font-semibold gray-800)
  RIGHT: status badges + user name
    Badges (if online):   [● Synced] [● Connected] [↑ Upload Files]
                           green bg    green bg       white bg border
    Badges (if offline):  [○ Offline] gray badge
    User info: avatar + "John Doe" — 13px gray-700

BREADCRUMB (px-5 py-1.5 bg-white border-b border-gray-100 text-xs text-gray-400):
  e.g. "bukolabs.io  /  Scan"

CONTENT: flex-1 overflow-auto p-5 bg-brand-bg (#F0FBF6)
```

---

## ─────────────────────────────────────────
## SCREEN 14 — DASHBOARD
## Route: /app/dashboard
## ─────────────────────────────────────────

```
PAGE TITLE: "Dashboard"
SUBTITLE:   "Manage and preview your scan and application status"

TOP STAT CARDS (grid 4 columns, gap-4):

  Card 1: "Documents Scanned"    value: 128       icon: DocumentIcon   (gray)
  Card 2: "Pages Scanned"        value: 342       icon: FileTextIcon   (gray)
  Card 3: "Storage Used"         value: 2.65 GB   icon: HardDriveIcon  (gray)
  Card 4: "Devices Connected"    value: 2          icon: MonitorIcon    (gray)

  Each card: bg-white, rounded-xl, border-brand-border, shadow-sm, p-4
  Value: text-2xl font-bold gray-900
  Label: text-xs gray-500

RECENT FILES (below stats, full-width card):
  Header row: "Recent Files" (left)  [↑ Sort by]  [Filter] dropdown (right)
  Table columns: File Icon | File Name | Type | Date | File Size | Actions
  Rows: show 5-6 files
    e.g. Invoice_2024_05_25.pdf   PDF   May 25, 2024 10:36 AM   1.2 MB   [icons]
         Customer_profile.pdf    PDF   May 23, 2024  9:14 AM   342 KB   [icons]
         report_Q1_2024.pdf      PDF   May 23, 2024  8:03 AM   567 KB   [icons]
  File type badges: PDF=red/orange, PNG=blue, JPG=yellow  (colored pills)
  Actions: [👁 View] [🖨 Print] [⬇ Download]

RIGHT SIDE PANEL (grid col-2, alongside recent files):

  "Default Scan Settings" card:
    Default Scanner:  EPSON PerfectionV600
    Color Mode:       Grayscale
    Resolution:       300 DPI
    Paper Size:       A4
    File Format:      PDF
    [Change Settings] button — outline green

  + small "Cloud Sync & Privacy" info card at bottom right
```

OFFLINE STATE (when no internet, replace cards content with):
  Each section shows: [🚫 wifi icon] "Oops! No Internet"
  "The Dashboard section requires an internet connection..." subtitle
  [Go Online] button   [Continue Offline] button

---

## ─────────────────────────────────────────
## SCREEN 15 — SCAN (step 1: select scanner)
## Route: /app/scan
## ─────────────────────────────────────────

TOP BAR BADGES (right of breadcrumb):
  [● Admin Connected]  [● Synced Status]  [Upload Files]
  (green filled, green filled, white border)

STEP TABS (below breadcrumb, full-width row):
  [1 Select Scanner] → [2 Configure] → [3 Preview] → [4 Save]
  Active step: bg-brand-emerald white text, rounded
  Inactive: text-gray-400

PAGE LAYOUT (two columns):

LEFT COLUMN — "Select Scanner" card:
  Instruction: "Please select the scanner device for scanning"

  DEVICE LIST (each item = selectable row):
  [Scanner icon]  EPSON Perfection V600         [Selected — green highlight + checkmark]
                  USB 3.0
  [Scanner icon]  CanoScan MG2                   [Select] button
                  Bluetooth
  [Scanner icon]  HP ScanJet Pro 2000S           [Select] button
                  USB 2.0

  Selected item: border-brand-emerald bg-brand-mint/20 rounded-lg
  [Refresh Devices]   [Cancel]   [Next: Configure →]  — buttons at bottom

RIGHT COLUMN — "Scanner Information" card:
  Shows info for selected device:
  Image: [EPSON PerfectionV600 device photo / placeholder]
  Type:             Flatbed Scanner
  Connection:       USB
  Resolution Range: 400-3200 DPI
  Status:           ● Connected  (green)
  [Refresh Device Information]  — outline button link text

FOOTER BAR (full-width bottom strip, white, border-top):
  Left: [Avatar] John Doe — john@company.com  /  Admin Access
  Right: [🔒 Secure & Ready] "Your workspace is protected..." | © bukolabs.io Admin
```

---

## ─────────────────────────────────────────
## SCREEN 16 — SCAN (step 2: configure)
## Route: /app/scan  (same page, step 2 state)
## ─────────────────────────────────────────

STEP TABS: step 2 "Configure" is active

LEFT COLUMN — "Scan Configuration" card:
  Section: Document Information
    Document Type:     [Finance ▼]  — dropdown
    Filename:          [Department_[Date]_[Dept]]  — text input, shows auto-format hint

  Section: Scan Settings (2-column grid)
    Color Mode:        [Finance ▼]
    Resolution:        [300 DPI ▼]
    Page Size:         [A4 (210 x 297 mm) ▼]
    Paper Orientation: [Portrait ▼]
    Scan Source:       [Flatbed ▼]
    File Format:       [PDF ▼]

  Section: Image Adjustments (2-column grid)
    Brightness:        [slider 0]
    Contrast:          [slider 0]
    
  [← Back]   [Start Preview]  — buttons at bottom (Preview = green CTA)

MIDDLE COLUMN — "Live Preview" card:
  Header: "Live Preview"  [↔ Full Screen] icon button top right
  Preview area: white rectangle with dashed border showing document preview
  Shows: INVOICE document preview rendered inside
  Below preview: zoom controls [←→] [100%] [Fit to Page]
  Below that: "Document is saved and ready for sync to cloud" — green checkmark note

RIGHT COLUMN — "Scan Summary" card:
  EPSON PerfectionV600
  Finance
  Filename:    Department_2020_01_2_pdf.pdf
  Color Mode:  Finance
  Resolution:  400-3200 DPI
  Scan Source: Flatbed

  "Quick Presets" section:
  [Standard] [Color] [Scan to OCR]  [Fine/Page]  — preset chips

  FOOTER in card:
  [← Back]   [Scan]   [Save Next]  — row of buttons, Scan = green

---

## ─────────────────────────────────────────
## SCREEN 17 — SCAN (step 3: preview + save document)
## ─────────────────────────────────────────

STEP TABS: step 3 "Preview" active, then step 4 "Save" active after scan

LEFT COLUMN — "Live Preview" (large):
  Full preview of scanned document (e.g. INVOICE)
  Shows rendered scanned page content
  Navigation: [← Previous] [1 of 1] [Next →]
  Zoom: [←→ Zoom In] [100%] [↕ Zoom Out] [Fit to Page]

RIGHT COLUMN — top: "Scan Summary" card (same as step 2)
  EPSON PerfectionV600 details

RIGHT COLUMN — bottom: "Final Summary" card (appears after scan completes):
  Document preview thumbnail
  Invoice details visible

  [← Back]   [Rescan]   [Save Document]   [🖨 Save & Print]
  Save Document = green CTA

---

## ─────────────────────────────────────────
## SCREEN 18 — SCAN (step 4: save document)
## ─────────────────────────────────────────

LEFT COLUMN — "Save Document" card:
  Filename:         [Finance_Invoice_2024_001.pdf]  — editable input
  Save Location:    [/Users/Desktop/Documents/Finance]  — path picker
  File format:      PDF with OCR  — dropdown (shows: PDF, PDF with OCR, PNG)
  Add to cloud:     [☑] Add document to cloud database  — checkbox
  Additional Note:  [text area, optional]

  Tags row: [Finance] [Invoice] [2024] [x add tag]

  "Secure & Ready" note: "Your workspace is protected and...synced to cloud"

RIGHT COLUMN — "Final Summary" card:
  Shows final document:   INVOICE preview
  Filename:               Finance_Invoice_2024_001.pdf
  Invoice No:             INV-001
  Date:                   Jan 01, 2024
  Amount:                 $500.00
  Description:            Consulting fees x1... Total $175

  [← Back]   [Cancel]   [Save Document]  — Save = green CTA

FOOTER: user info + bukolabs.io branding

---

## ─────────────────────────────────────────
## SCREEN 19 — CHOOSE LOCAL SAVE FOLDER (modal)
## ─────────────────────────────────────────

Overlay modal (white card, ~560px wide):

```
Title: "Choose Local Store Folder"
Subtitle: "Select a destination folder for offline backup of your documents"
Hint: [⚠ Recommended: avoid storing on system drives like C:\]

LEFT — FOLDER TREE:
  📁 Documents          (expandable)
    📁 Desktop          (expandable, shows sub-items)
    📁 Finance Documents (highlighted/selected)
      📁 folder 1
      📁 folder 2
      📁 folder 3
      📁 folder 4
  📁 Downloads
  📁 Desktop
  📁 Cloud Folder
    📁 Cloud Documents

RIGHT — FOLDER CONTENTS:
  "Currently in: Finance Documents"
  List of files/folders in selected directory

CHECKBOXES:
  [☑] Use recommended Documents folder
  [☑] Synchronize documents to cloud

TAGS row: [Add Tags]  [Create Folder]

At the bottom:
  "The selected folder will act as..." info note

BUTTONS: [Cancel]  [Create and Save]
```

---

## ─────────────────────────────────────────
## SCREEN 20 — DOCUMENTS (file manager)
## Route: /app/documents
## ─────────────────────────────────────────

OFFLINE STATE (when internet is required for full sync):
```
[🚫 wifi icon centered, 64px gray]
"Oops! No Internet"
"The Documents section requires an internet connection to load and access referenced files. You will still work with locally stored documents."
[Go Online]   [Continue Cloud Sync]
```

ONLINE STATE:
Header: "Documents"  subtitle: "Organize, preview, and filter all documents"

TOOLBAR (below header):
  [📁 New Folder]  [⬆ Upload]  [Filter ▼]  [Sort ▼]
  Right: [🔍 search input]  [≡ List view] [⊞ Grid view]  [⬇ Export Documents]

TWO-COLUMN LAYOUT:
LEFT — Folder Tree (240px):
  📁 All Documents
  📁 Finance
  📁 Reports
  📁 Invoices
  📁 Contracts
  📁 Archive
  (collapsible, active folder highlighted in brand-mint)

RIGHT — File List (flex-1):
  Table: [☐] | Icon | File Name | Type | Date Modified | File Size | Pages | Actions
  Rows:
    ☐  📄 Invoice_2024_05_25.pdf     PDF    May 25, 2024  1.2 MB   4 pgs   [👁][🖨][⬇]
    ☐  📄 Customer_profile.pdf       PDF    May 23, 2024  342 KB   2 pgs   [👁][🖨][⬇]
    ☐  📄 b_med_780_...pdf           PDF    May 23, 2024  45 KB    1 pg    [👁][🖨][⬇]
    ☐  📄 Report_Q1_2024.pdf         PDF    May 23, 2024  567 KB   6 pgs   [👁][🖨][⬇]
    ☐  📄 [additional row]            PDF    May 22, 2024  202 KB   1 pg    [👁][🖨][⬇]

  Pagination: "Showing 1-10 of 24 documents"  [ 1 ] [ 2 ] [ 3 ]

---

## ─────────────────────────────────────────
## SCREEN 21 — SEARCH
## Route: /app/search
## ─────────────────────────────────────────

OFFLINE STATE (same wifi icon / no internet pattern as Documents)

ONLINE STATE:
Header: "Search"  subtitle: "Search documents by filename or document content"

SEARCH BAR (full width, prominent):
  🔍 [Search for documents...]    [Advanced Filters]  [+ New Document]
  Filter row: [All Types ▼]  [All Tags ▼]  [Date Range ▼]   Clear All

RESULTS SECTION:
  "About 24 results" — gray, 13px

  RESULT CARDS (vertical list):
    Card: bg-white, border, rounded-xl, p-4, hover-shadow
    ┌──────────────────────────────────────────────┐
    │ 📄 Invoice_2024_05_12.pdf      [PDF badge]   │
    │    Date: May 25, 2024 10:36 AM  |  Size: 1.2 MB  │
    │    Content preview: "...Total Payments: $500.00..."  │
    │    Tags: [Finance] [Invoice] [2024]            │
    │    [👁 View]  [🖨 Print]  [⬇ Download]  [✏ Rename]  │
    └──────────────────────────────────────────────┘

    More cards: Contract_draft.pdf, Report_Q1_2024.pdf, etc.

  SEARCH TIPS panel (right sidebar, 260px):
    "Search Tips"
    • Search by filename
    • Use quotes for exact match
    • Filter by document type
    • Sort by date or relevance
    Fields shown: Preview  |  Filename  |  Number

---

## ─────────────────────────────────────────
## SCREEN 22 — DEVICES
## Route: /app/devices
## ─────────────────────────────────────────

OFFLINE STATE (same no-internet pattern)

ONLINE STATE:
Header: "Devices"  subtitle: "Find and manage connected devices at offline mode"

AVAILABLE DEVICES modal / inline panel:
  Title: "Available Devices"
  [Refresh Devices] button top-right

  Device rows:
    [Scanner icon]  EPSON PerfectionV600   USB 3.0    [● Connected]  [▼]
    [Scanner icon]  iPhone 14 Pro Max      Bluetooth   [○ Offline]    [▼]
    [Printer icon]  Canon DR-C225 II       USB 2.0     [● Connected]  [▼]
    [Printer icon]  HP ScanJet Pro 2000    USB         [⚠ Pending]    [▼]

  Status badges: green "Connected", gray "Offline", amber "Pending"

  [Schedule Calibration]  [Cancel]  [Continue]  — bottom buttons

---

## ─────────────────────────────────────────
## SCREEN 23 — SETTINGS
## Route: /app/settings
## ─────────────────────────────────────────

OFFLINE STATE (same no-internet pattern, with:
  "Settings page sync and user data requires an internet connection or cloud account")

ONLINE STATE:
Header: "Settings"

TAB ROW (horizontal tabs, below header):
  [Account Details]  [Storage]  [LUI]  [Security]
  Active tab: bg-brand-emerald white text, rounded pill

TAB: Account Details
  Profile section:
    Avatar: large circle with initials, [Upload Photo] link
    Full Name:        [John Doe]            — editable
    Username:         [johndoe]             — editable
    Email Address:    [john@company.com]    — editable
    Phone Number:     [+1 234 567 890]      — editable
    Department:       [Finance]             — dropdown
    Role:             Admin  (read-only, gray)
    Account Status:   [Active] badge        (read-only)
    [Save Changes]  button — green CTA

TAB: Storage
  Cloud Sync section:
    Cloud Sync:       [toggle ON/OFF]
    Cloud Provider:   [Bukolabs Cloud ▼]
    Storage Used:     2.65 GB / 10 GB  — progress bar
    Last Synced:      May 25, 2024

TAB: Security
  Change Password section:
    Current Password:  [input]
    New Password:      [input]
    Confirm Password:  [input]
    [Update Password]  button

CLOUD SYNC & PRIVACY card (right sidebar if 2-col layout, or below):
  "Cloud Sync & Privacy"
  Sync Status: [toggle]
  Light:       [toggle]
  Compact Mode:[toggle]
  [Save Changes]

"Changes Saved Successfully" — green toast notification (bottom-right, auto-dismiss 3s)
```

---

## ─────────────────────────────────────────
## SCREEN 24 — HELP / ABOUT
## Route: /app/help
## ─────────────────────────────────────────

OFFLINE STATE (same no-internet pattern)

ONLINE STATE:
Header: "About Desktop Scanner"  subtitle: "Application information and support details"

TWO-COLUMN LAYOUT:

LEFT — App info card:
  [bukolabs.io logo, large]
  "Desktop Scanner"          — 20px bold gray-900
  Version: 1.0.0  Build 001 · May 26, 2024

  System Information:
    App Version:     Desktop PilotMXE
    App Version:     1.0.0  Build 0001
    Version:         56.7
    History:         3561
    License:         20:30 hours until expiry
    Developer:       Bukolabs.io

  [Check for Updates]  button — outline
  [Help Center]  [Print Utility Licenses]  links

  [Support Applications]  [Accessibility]  — secondary links

  "Secure & Ready" note: green checkmark + text

  Copyright: © Bukolabs.io Admin
  [🔒 Privacy specification]

RIGHT — nothing (or future content area)

---

## ─────────────────────────────────────────
## SCREEN 25 — PRINT FLOW (modal overlay)
## Triggered from: Documents list, Scan result
## ─────────────────────────────────────────

### Step A — Available Devices modal:
```
Title: "Available Devices"
[Refresh Devices] top-right
Device list (radio select):
  ● EPSON PerfectionV600  USB 3.0     [● Connected]
  ○ iPhone 14 Pro Max     Bluetooth   [○ Offline]
  ○ Canon DR-C225 II      USB 2.0     [● Connected]
  ○ HP ScanJet Pro 2000   USB         [⚠ Pending]
[Schedule Calibration]  [Cancel]  [Continue →]
```

### Step B — Print Saved Document modal:
```
Title: "Print Saved Document"
Subtitle: "Choose the saved document you want to print directly to the printer"

LEFT table: "Choose from Documents"
  This will print the PDF images of the document...
  Rows: [filename] | [pages]
    Scanner_Report_xxxx     9 pages
    Finance_Invoice_2023_...  1 page
    Contract_draft.pdf      1 page
    Finance_files_...       [page count]

RIGHT: "Browse Local File"
  File explorer / upload area:
  "Click or drag here to browse a file through the folder"
  [browse button area]

[Cancel]  [Continue →]
```

### Step C — Confirm Print Job modal:
```
Title: "Confirm Print Job"
Subtitle: "Review the selected print settings before sending to the printer"

Details:
  File:          Counter_Report_Q3.pdf
  Printer:       Canon Micro Printer
  Copies:        1
  Paper Size:    A4
  Page Size:     A4
  Color Mode:    Color
[Back]   [Print Now]  — Print Now = green CTA
```

### Step D — Print Completed toast:
```
[✓ green circle]
"Print Completed"
"Your document has been successfully sent to the printer"
[Print another]   [Done]
```

---

## ─────────────────────────────────────────
## SCREEN 26 — EXPORT DOCUMENTS (modal)
## Triggered from: Documents toolbar
## ─────────────────────────────────────────

Modal with 4 panel columns (Export As | Filter by Department | Filter by File Type | Sort Documents):

```
PANEL 1 — "Export As":
  [☑] All Documents
  [☐] Finance
  [☐] Invoice
  [☐] Reports

PANEL 2 — "Filter by Department":
  Department dropdown: [All Departments ▼]
  Checkboxes: [☑] Finance, [☐] HR, [☐] IT, etc.

PANEL 3 — "Filter by File Type":
  [☑] PDF
  [☐] PNG
  [☐] JPG
  Include archived: [toggle]
  Separate Office Filters: [toggle]

PANEL 4 — "Sort Documents":
  Sort By: [Date Created ▼]
  Order:   [Newest First ▼]

Buttons: [Cancel]  [Apply Filters]  [Save Folder]
```

---

## ─────────────────────────────────────────
## SCREEN 27 — SCAN PREFERENCES (Settings sub-modal)
## Route: open from Settings or Scan Configure
## ─────────────────────────────────────────

```
Title: "Scan Preferences"

SECTION: Scan Format
  File Format: [PDF ▼]
  
SECTION: Page Handling
  Auto Deskew:       [toggle ON]
  Auto Crop:         [toggle ON]
  Remove Blank Pages:[toggle OFF]
  Duplex Scanning:   [toggle OFF]

SECTION: File Management
  Auto-Naming Rule:  [Department_[Date]_[Dept] ▼]
  Include Metadata:  [toggle ON]
  Compress Output:   [toggle OFF]

SECTION: Advanced Scan Settings
  Preview File:      [toggle ON]
  (other advanced options)

[Cancel]   [Apply and Save]
```

---

## ─────────────────────────────────────────
## SCREEN 28 — DOCUMENTS SAVED SUCCESSFULLY (toast/modal)
## ─────────────────────────────────────────

Small green toast card (bottom-right or centered):
```
[✓ green circle]
"Documents saved successfully!"
subtitle: small gray text
```

---

## ─────────────────────────────────────────
## SCREEN 29 — SEND FEEDBACK (modal)
## Accessible from: Help page / settings
## ─────────────────────────────────────────

```
Title: "Send Feedback"
Star rating: ★ ★ ★ ★ ☆ (4 stars selected, interactive)
[text area: "Type your feedback here..."]
Buttons: [Cancel]  [Submit Feedback]
```

---

## ─────────────────────────────────────────
## SCREEN 30 — REPORT AN ISSUE (modal)
## ─────────────────────────────────────────

```
Title: "Report an Issue"
[text area: "Describe the issue you are experiencing..."]
Priority: [Medium ▼]
Buttons: [Cancel]  [Submit Report]

SUCCESS state:
  [✓ circle]  "Report Submitted!"
  "Thank you for your report. Our team will look into this."
  [OK]
```

---

## ─────────────────────────────────────────
## FULL NAVIGATION FLOW SUMMARY
## ─────────────────────────────────────────

```
App Launch
    └─→ /splash (2.5s)
            └─→ /welcome
                    ├─→ "Returning User"  → /login
                    │       ├─→ [no internet check] → NoInternetModal (overlay)
                    │       ├─→ Submit → /checking → success → /app/dashboard
                    │       └─→ "Forgot Credentials?" → /forgot
                    │               ├─→ /request-email → /request-sent → /login
                    │               └─→ /request-sms   → /request-sent → /login
                    └─→ "Activate Account" → /activate
                            ├─→ Submit → /validating-key → success → /activated → /app/dashboard
                            ├─→ fail → inline error
                            └─→ "Request Through Email/SMS" → request screens

Inside app (/app/*):
  Dashboard  →  quick links to Scan, Documents
  Scan
    Step 1: Select Scanner
    Step 2: Configure Settings
    Step 3: Live Preview
    Step 4: Save Document   ← "Choose Local Store Folder" modal optional
                            ← "Export Documents" modal optional
                            ← leads to "Documents Saved!" toast
    Any step → "Print" flow (Available Devices → Print Saved Doc → Confirm → Print Complete)
  Documents → open file → print/export/delete
  Search    → find file → open/print/export
  Devices   → view/connect/refresh devices
  Settings
    Account Details tab
    Storage tab
    Security tab
    Scan Preferences sub-modal
  Help/About
```

---

## SHARED COMPONENTS TO BUILD

### Reusable across all screens:

```tsx
// 1. ScreenCard — white card for auth screens
<ScreenCard width={440}>...</ScreenCard>

// 2. FormInput
<FormInput label="Username" placeholder="Enter username" type="text" />

// 3. Button variants
<Button variant="primary">Sign In</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">← Back</Button>

// 4. StatusBadge
<StatusBadge status="connected" />   // green ●
<StatusBadge status="offline" />     // gray ○
<StatusBadge status="pending" />     // amber ⚠

// 5. SuccessCard (for activated, saved, etc.)
<SuccessCard title="Account Activated Successfully!" message="..." ctaLabel="Continue" onCta={fn} />

// 6. NoInternetState (inline page empty state)
<NoInternetState onGoOnline={fn} onContinueOffline={fn} />

// 7. NoInternetModal (full overlay modal)
<NoInternetModal onOffline={fn} onRetry={fn} />

// 8. FileRow (used in Documents, Search, Dashboard)
<FileRow file={file} onView={} onPrint={} onDownload={} />

// 9. StepTabs (used in Scan flow)
<StepTabs steps={['Select Scanner','Configure','Preview','Save']} activeStep={2} />

// 10. PageHeader
<PageHeader title="Dashboard" subtitle="Manage and preview..." />

// 11. SidebarNavItem
<SidebarNavItem icon={ScanIcon} label="Scan" path="/app/scan" />

// 12. DeviceCard (used in Devices, Scan step 1)
<DeviceCard name="EPSON Perfection V600" connection="USB 3.0" status="connected" onSelect={fn} />

// 13. Toast notification (success/error auto-dismiss)
<Toast type="success" message="Documents saved successfully!" />

// 14. Modal wrapper
<Modal title="Available Devices" onClose={fn}>...</Modal>
```

---

## IMPORTANT IMPLEMENTATION NOTES

1. **No blank green screen** — body background must be `#F0FBF6`. Sidebar is `#0D3D2E`. Only splash is full-screen dark green.

2. **Loading states** — every async operation (login, scan, save) shows a loading spinner or progress screen before navigating. Never flash to a blank state.

3. **Offline-first UI** — when `isOnline === false`, show the "Oops! No Internet" empty state inside each main page section. App still loads; it doesn't crash.

4. **All scan steps are one route** (`/app/scan`) — manage step state with `useState<1|2|3|4>(1)`. The step tabs update visually as user progresses.

5. **Footer bar** — the bottom strip in Scan screens shows: user avatar + name + email | "Secure & Ready" badge | "🔒 privacy specification" link | "© bukolabs.io Admin" — use in AppShell or per-page footer.

6. **Top badges** — in Scan, Dashboard: show `[● Admin Connected]` `[● Synced Status]` `[↑ Upload Files]` green/white pills in the top-right of the topbar.

7. **Modals** — Print flow, Choose Folder, Export Documents, Scan Preferences, Send Feedback, Report Issue all open as overlays (dark bg/30 backdrop + centered white card). Never navigate to a new route for modals.

8. **Typography** — use Inter. Headings: font-bold. Body: font-normal. Labels: font-medium text-xs. All gray scale from gray-400 (muted) → gray-600 (labels) → gray-800/900 (headings).

---

*Bukolabs.io Desktop Scanner App — Complete Screen & Flow Prompt*
*Aethera Digital & Syn7rgy · 2026*