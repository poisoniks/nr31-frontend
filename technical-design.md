# Frontend Technical Design Document (TDD)

**Project:** NR31 Regiment Portal
**Platform:** Web (SPA)
**Framework:** React + Vite

## 1. Executive Summary

The NR31 Regiment Portal is a specialized Single Page Application (SPA) designed to manage regiment activities, roster, and content. The application prioritizes a "Dark Mode" aesthetic suitable for a gaming community, utilizing a responsive design that supports multiple languages (UA/EN) and distinct user roles (Guest, Member, Officer, Admin).

## 2. Technology Stack

For a detailed breakdown of the technologies and libraries used, please refer to the [Technical Stack Document](./technical-stack.md).

## 3. Global Layout Architecture

### 3.1. Header (Sticky Navbar)

* **Behavior:** Fixed position at the top (`h-14` or `h-16`), transparent backdrop blur effect on scroll.
* **Left Section:**
* **Logo & Title:** SVG Icon + "NR31" text.
* **Mobile/Sidebar Trigger:** A "Hamburger" icon (4 horizontal lines style) that opens a **Sidebar Drawer** (Sheet component).


* **Center Section (Desktop Nav):**
* Links: *Home, Roster, Calendar, Library*.


* **Right Section (User Actions):**
* **Theme Toggle:** Sun/Moon icon (supports system default).
* **Language Switcher:** Dropdown (UA/EN).
* **CTA Button:** "Join Regiment" (Hidden if user is authenticated/member).
* **User Profile:** Avatar with Dropdown Menu (*Profile, Settings, Admin Dashboard, Logout*).



### 3.2. Sidebar Drawer (Mobile & Extended Nav)

* Activated by the header trigger.
* Contains secondary links: *Wiki, Server Rules, About Us, History*.
* Duplicate navigation links for mobile view.

### 3.3. Footer

* **Layout:** 3-Column Grid.
* **Left:** Copyright © 2026 NR31.
* **Center:** "Powered by EUK Community". Links to GitHub Repositories (Frontend/Backend).
* **Right:** Social Media Icons (Discord, YouTube, TikTok, Telegram).

---

## 4. Page Specifications

### 4.1. Home Page (Landing)

* **Hero Section:**
* **Background:** Full-width cinematic game screenshot or looped silent video with a dark gradient overlay.
* **Content:** Large Typography ("Honor. Discipline. Victory."), Primary CTA Button ("Join Us"), Subtext referencing EUK Community.


* **Main Content Grid (2 Columns: 70% Left / 30% Right):**
* **Left Column (Feed):**
* **About Block:** Brief regiment introduction.
* **News Feed:** Infinite scroll or paginated cards showing announcements, promotions, and battle reports.
* **EUK Community Block:** Banner linking to the Unified Ukrainian Community Discord/Site.


* **Right Column (Sticky Widgets):**
* **Next Event Widget:** Countdown timer to the nearest calendar event + "RSVP" button.
* **Discord Widget:** Live online count, list of active officers, "Join Server" button.
* **Media Widget:** Embedded YouTube Short/Video (latest upload).





### 4.2. Roster Page

* **Layout:** Hierarchical Tree View or Grouped Cards.
* **Grouping:** High Command -> Officers -> NCOs -> Enlisted.
* **Interactions:**
* **Hover:** Visual highlight.
* **Click:** Opens a **Member Detail Modal** (Service record, medals, join date, status).



### 4.3. Calendar Page

* **View:** Month/Week grid.
* **Event Types:** Color-coded (Battle=Red, Training=Green, Meeting=Blue).
* **Event Detail Modal:**
* Description, Map name, Faction.
* **RSVP Action:** Buttons for "Attending", "Absent", "Late".



### 4.4. Library / Wiki

* **Layout:** Tabbed Interface (`Tabs` component).
* **Tab 1: Guides:** List of articles (Rich Text content).
* **Tab 2: Files:** Resource list (Texture packs, Configs). Attributes: Filename, Size, Updated Date, Download Button.
* **Tab 3: Rules:** Static text content (Regiment Statute).



### 4.5. Admin Dashboard (Protected Route)

* **Access:** Requires specific permissions in JWT.
* **Overview:** Charts (Recruitment stats, Attendance).
* **User Management:** DataTable with sort/filter. Actions: *Promote, Kick, Award Medal, Change Role*.
* **Content Management:**
* **News Editor:** Rich Text Editor (WYSIWYG) for posting announcements.
* **Event Manager:** CRUD interface for Calendar events.
* **File Upload:** Interface to upload assets to the server.
