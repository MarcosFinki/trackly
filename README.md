![License](https://img.shields.io/badge/license-MIT-green)
![Tauri](https://img.shields.io/badge/Tauri-v2-blue)

# Trackly

Trackly is a minimal, native desktop time-tracking application built with **Tauri v2**, **Rust**, **Astro**, and **React**.

It is a local-first productivity tool focused on performance, simplicity, and privacy.

Unlike most time trackers, Trackly does not rely on cloud services. Everything runs locally on your machine.

---

## ✨ Features

- ✅ Project-based time tracking
- ✅ Start / Stop sessions
- ✅ Cancel sessions
- ✅ Session descriptions and tagging
- ✅ 7-day and 30-day statistics
- ✅ Tag-based activity breakdown
- ✅ Avatar upload (image resizing & WebP compression)
- ✅ Persistent login session
- ✅ Local SQLite storage (no cloud, no telemetry)
- ✅ Native desktop performance (via Tauri)

---

## 🧠 Philosophy

Trackly is:

- **Local-first** — your data stays on your machine.
- **Fast** — powered by Rust and SQLite.
- **Minimal** — focused on clarity and usability.
- **Open source** — fully inspectable and modifiable.

No backend servers. No analytics. No external dependencies.

---

## 🏗 Tech Stack

### Frontend
- Astro
- React
- TypeScript
- CSS

### Backend
- Rust
- Tauri v2
- SQLite (rusqlite)
- Argon2 (password hashing)
- Image processing (avatar resizing)
- UUID

---

## ⚡ Why Tauri?

Trackly leverages Tauri to provide:

- Native performance
- Small bundle size
- Secure Rust backend
- Modern web frontend
- Cross-platform capabilities

This allows the application to feel lightweight while maintaining a powerful architecture.

---

## 📸 Screenshots

### Dashboard
![Dashboard](assets/dashboard.png)

### Session Modal
![Session Modal](assets/modal.png)

### Profile View
![Profile](assets/profile.png)

---

## 💾 Data Storage

Trackly stores all data locally using SQLite.

On macOS, the database is located at:

~/Library/Application Support/com.marcos.trackly/trackly.db

The schema includes:

- users
- projects
- sessions
- session_tags
- app_session

Passwords are hashed using Argon2.

---

## 🚀 Installation

Download the latest release from the **Releases** section.

### macOS

1. Download the `.dmg`
2. Move Trackly.app to Applications
3. If macOS blocks it:
   - Right click → Open
   - Confirm

> Note: The app is not currently code-signed. macOS may require manual confirmation to open it.

---

## 🛠 Development

### Requirements

- Node.js
- Rust
- Tauri CLI

### Run in development mode

npm install
npx tauri dev

### Build production bundle

npx tauri build

---

## 📌 Current Status

This is the initial public release (v0.1.0).

The core features are stable, but the project is actively evolving.

---

## 📦 Project Structure

trackly/       → Astro + React frontend
src-tauri/     → Rust backend

The architecture follows a layered approach:

- Commands (Tauri layer)
- Services (business logic)
- Domain
- Infrastructure (SQLite)

---

## 🔐 Security

- Password hashing via Argon2
- No plaintext storage
- No external API calls
- No telemetry
- No tracking
- Local-only data storage

---

## 🛣 Roadmap

Planned improvements:

- Database migrations
- CSV export
- Auto-updater
- Dark mode
- Improved analytics
- Cross-platform builds (Windows / Linux)

---

## 📜 License

MIT License.

---

## 🤝 Contributing

Pull requests are welcome.

If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Open a PR

---

## 👤 Author

Built by Marcos Finkiel.