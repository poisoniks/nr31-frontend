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
- **Regiment Roster:** Interactive structure tree with service history and member statistics.
- **Calendar:** Real-time schedule for trainings, linebattles, and community events.
- **Library:** Repository of tactical guides, regiment statutes, and training materials.
- **Theming:** Dark (Default) and Light themes.
- **Localization:** Comprehensive support for Ukrainian (UA) and English (EN) languages.

### 🔒 Member & Administrative Access
- **Authentication:** Secure JWT-based session management with automated token refreshing.
- **Event Orchestration:** Full lifecycle management (CRUD) for calendar events, including complex recurrence rule configurations.
- **Personnel Management:** Administrative tools for promotions, recruitment, and service record updates.
- **Security:** Granular Role-Based Access Control (RBAC) protecting administrative interfaces.

---

## 🛠 Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build System:** [Vite 7](https://vite.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) (Vite-integrated CSS-first architecture)
- **Navigation:** [React Router 7](https://reactrouter.com/)
- **State Management:** [Zustand 5](https://github.com/pmndrs/zustand)
- **Type Integration:** [openapi-typescript](https://github.com/drwpow/openapi-typescript) (Automated frontend types from Backend OpenAPI specs)
- **Networking:** Axios (configured with JWT interceptors)
- **Internationalization:** i18next (with browser detection and async backend loading)
- **Iconography:** Lucide React

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm

### 1. Installation
```bash
git clone https://github.com/poisoniks/nr31-frontend.git
cd nr31-frontend
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Development
```bash
npm run dev
```
The application will be served at `http://localhost:5173`.

---

## 🐳 Deployment

Containerized production builds are supported:

```bash
docker build -t nr31-frontend .
docker run -p 80:80 -d nr31-frontend
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

- **Software:** Distributed under the **MIT License**.
- **Branding:** "Nr.31 FKR Regiment" name, logos, and specific regiment assets are the properties of the Nr.31 FKR Regiment Community.

**© 2026 Nr.31 FKR Regiment.**

---

<div align="center">
<sub>Built with ❤️ by poisoniks</sub>
</div>
