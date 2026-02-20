# UI/UX Design Document: NR31 Regiment Portal

## 1. Visual Language

* **Color Palette (Theme):**
    * **Primary Mode:** Light Mode.
    * **Accent Color:** Gold/Yellow from the coat of arms (e.g., `#D4AF37` or `#E5B81B`) — for buttons, markers, and active states.
    * **Supporting Colors:**
        * **Background:** Light with a subtle warm tint (e.g., `#FDFBF7` or classic `#FFFFFF`).
        * **Text:** Dark blue, almost black, from the coat of arms background (e.g., `#1A1F2C` or `#0B1320`) — for premium contrast on a light background.
        * **Surfaces:** White (`#FFFFFF`) for cards and modal windows to stand out from the background.
        * **Borders:** Semi-transparent dark (e.g., `rgba(26, 31, 44, 0.1)`) or light gray (`#E5E7EB`).


* **Typography:**
    * **Headers:** Serif fonts, such as *Cinzel* or *Playfair Display* — to create a historical atmosphere.
    * **Interface and Body Text:** Clean Sans-serif, such as *Inter* or *Roboto* — for readability in menus and tables.


* **Effects:**
    * **Glassmorphism:** Semi-transparent backgrounds with blur (`backdrop-blur-md`) for the header, modal windows, and cards over game screenshots.
    * **Borders:** Thin, subtle borders (`border-black/10` or `border-gray-200`) to separate blocks in the light theme.

---

## 2. Layout Structure

### 2.1. Sticky Header

Fixed at the top, height 64px (`h-16`). Background: semi-transparent light (`bg-white/80` or `bg-[#FDFBF7]/80`) with blur.

* **Left Side:**
    * **Hamburger Menu (Button):** 4-line icon. Opens a side panel (Sheet/Drawer) on click.
    * **Logo:** Regiment coat of arms SVG + "NR31" text (bold).


* **Center Part (Desktop):**
    * Navigation links: *Home, Roster, Events, Media*.
    * Active link is highlighted with the accent color at the bottom.


* **Right Side:**
    * **Language Switcher:** "UA 🇺🇦 / EN 🇬🇧" dropdown.
    * **Theme Toggle:** Sun/Moon icon.
    * **CTA "Join" Button:** Bright, solid fill. Disappears if the user is authorized.
    * **User Profile:**
        * *Guest:* "Login" button — Outline style.
        * *User:* Avatar (circle). Click opens a dropdown (Profile, Admin, Logout).


### 2.2. Sidebar Drawer

Slides out from the left when the Hamburger button is clicked.

* **Content:** Vertical list of links.
* **Additional Sections:** *Regiment Wiki, Server Rules, History, About Us.*
* **Menu Footer:** Duplicated language/theme toggles (for mobile convenience).

### 2.3. Footer

Minimalist, separated by a line at the top.

* **Left Column:** Logo + "© 2026 NR31 Regiment".
* **Center:** Text "Developed for the EUK Community" with a link. Link to GitHub repository (code icon).
* **Right Column:** Row of social media icons (Discord, YouTube, Telegram) with a glow effect on hover.

---

## 3. Page UI Design

### 3.1. Home Page

**Section 1: Hero Block (First Screen)**

* **Background:** Full-screen game screenshot (formation or battle). Overlaid with a light gradient (slight darkening at the top for text readability, smoothly transitioning to the background color at the bottom).
* **Center:**
    * H1 Header: Large, epic font.
    * Subheader: Regiment slogan.
    * Button (CTA): Large "Join Discord" button.
    * Badge: "Part of EUK Community".

**Section 2: Content Grid**
Layout: 70% (Content) | 30% (Widgets). Single column on mobile.

* **Left Column (Feed):**
    * **"About Us" Block:** Card with brief text and a "Read History" button.
    * **News Cards (Feed):**
        * News image (aspect-ratio 16:9).
        * Title + Date (small gray font).
        * Preview text (clamped to 3 lines).
        * Card Footer: Author (avatar + nickname) and "Comments" button.
    * **EUK Block:** Special card with the community logo that visually stands out (e.g., with a colored border).

* **Right Column (Sticky Widgets):**
    * **"Next Event" Widget:**
        * Countdown timer (Days : Hrs : Min).
        * Event name.
        * "I'm attending" button (RSVP).
    * **Discord Widget:**
        * Status: "🟢 45 Online".
        * List of online officers' avatars.
        * "Connect" button.
    * **Media:** Embedded YouTube Shorts player (vertical format) or the latest video.

### 3.2. Roster Page

* **View:** Hierarchical tree or grouped lists (Accordions).
* **Groups:** Command -> Officers -> NCOs -> Privates -> Recruits.
* **Soldier Card (Row Item):**
    * Left: Rank icon (shoulder strap) + Avatar.
    * Center: In-game nickname + Real name (optional).
    * Right: Status (Active / On Leave / Reserve).

* **Interaction:**
    * Clicking opens a **Profile Modal**:
        * Large character photo.
        * List of awards (medals as icons with tooltips).
        * Enlistment date.
        * Promotion history (Timeline).

### 3.3. Events Page (Calendar)

* **Calendar Grid:** Classic monthly view.
* **Events (Event Pills):** Colored bars on days.
    * Red: Battle/Event.
    * Green: Training.
    * Blue: Meeting.

* **Event Details (Pop-over):**
    * Clicking an event shows a card over the calendar.
    * Info: Gathering time, Map, Faction.
    * **RSVP Block:** Three buttons (Attending, Absent, Late) with a click counter under each.

### 3.4. Admin Dashboard

Accessible only to roles with permissions. Design is more utilitarian (SaaS-like).

* **Admin Sidebar:** Users, Content, Files, Settings.
* **Users Table:**
    * Columns: Nickname, Email, Role, Status, Last Activity.
    * Actions (three dots): Edit, Ban, Change Role.
    * Filters at the top: Search by nickname, filter by rank.
* **News Editor:**
    * Title field.
    * WYSIWYG editor (bold, italic, lists, image insertion).
    * "Publish" button.

---

## 4. Design System (UI Components)

### 4.1. Buttons

* **Primary:** Filled with the accent color, dark text. Hover: slightly lighter shade.
* **Secondary:** Transparent background, dark blue or gold border (Outline). Hover: background matches the border color, contrasting (light) text.
* **Destructive:** Red text or background (for "Delete", "Leave" buttons).
* **Ghost:** No background, highlighted only on hover (for menus).

### 4.2. States

* **Loading:** Use "Skeletons" (shimmering gray blocks in the shape of the content) instead of spinners during data loading.
* **Empty:** If there are no news items — show an "Empty" icon and "No news yet" text.
* **Error:** Red toast notifications in the bottom right corner for API errors.

### 4.3. Icons

Use the **Lucide React** set. Style: thin lines (stroke-width: 1.5 or 2), rounded corners.

---

## 5. User Experience (UX) Features

1. **Onboarding (First Login):**
    * After registration/login, show a beautiful welcome window: *"Welcome to NR31! Please sync your account with Discord"* (if planned) or *"Check the training schedule"*.

2. **Breadcrumbs:**
    * On internal pages (e.g., Guides -> Melee Combat), show the navigation path at the top.

3. **Feedback:**
    * When clicking the "I'm attending" button on an event — the button changes color and a small checkmark animation appears.