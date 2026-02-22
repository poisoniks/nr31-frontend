# ⚔️ Nr.31 FKR Regiment Portal (Frontend)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

The official web interface for managing the **31st Feldkanonenregiment (Nr.31 FKR)**.
This project serves as the central hub for soldiers, officers, and recruits, providing access to the roster, event calendar, and training materials.

> **Proudly developed for the Unified Ukrainian Community.**

---

## 📋 Features

### 🌍 Public Access
- **Home Page:** News feed, event announcements, Discord & YouTube integration.
- **Roster:** Interactive regiment structure tree, soldier cards, service history, and medals.
- **Calendar:** Schedule for trainings, linebattles, and meetings.
- **Library:** Guides, regiment statutes, and resource downloads.
- **Localization:** Full support for Ukrainian (UA) and English (EN).
- **Theming:** Dark (Default) and Light themes.

### 🔒 Restricted Access (Members Only)
- **Authentication:** JWT (Access + Refresh tokens).
- **Profile:** Linking in-game character to the user account.
- **Admin Dashboard:**
  - Roster management (Promotions, discharges).
  - CMS for news and events.
  - Role-Based Access Control (RBAC).

---

## 🛠 Tech Stack

- **Core:** [React 18](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Auth), React Context (Theme)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod (Validation)
- **Networking:** Axios (with JWT interceptors)
- **Internationalization:** i18next
- **Visuals:** Lucide React (Icons), Framer Motion (Animations)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/Nr.31 FKR-frontend.git](https://github.com/your-username/Nr.31 FKR-frontend.git)
cd Nr.31 FKR-frontend

```

### 2. Install dependencies

```bash
npm install
# or
yarn install

```

### 3. Environment Configuration

TODO

### 4. Run Development Server

```bash
npm run dev

```

Open your browser at `http://localhost:5173`.

---

## 🐳 Docker Deployment

To build and run the production version in a container:

```bash
# Build the image
docker build -t Nr.31 FKR-frontend .

# Run the container
docker run -p 80:80 -d Nr.31 FKR-frontend

```

---

## 🤝 Contributing

This project is **Open Source**. Contributions are welcome!

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## ⚖️ License & Copyright

### 💻 Code

The source code of this project is distributed under the **MIT License**. You are free to use, modify, and distribute it.

### 🎨 Content & Brand

The name "Nr.31 FKR Regiment", the regiment logo, historical descriptions, and graphic assets are the property of the Nr.31 FKR Community.
**© 2026 Nr.31 FKR Regiment.**

If you fork this project for your own use, please replace the name, logo, and content with your own.

---

<div align="center">
<sub>Built with ❤️ by poisoniks</sub>
</div>
