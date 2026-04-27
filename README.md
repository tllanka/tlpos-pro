# TLpos Pro — PWA Scale Service Manager

**Ceylon Weighing Machine Limited — Field Service App**

## ✅ Features
- 📱 **PWA** — Install to home screen, works offline
- 📷 **QR Scanner** — Scan customer QR codes (requires HTTPS)
- 📍 **GPS Location** — Auto-capture customer GPS (requires HTTPS)
- 📊 **Excel Reports** — Export service/stamp records as .xlsx
- 💾 **Local Database** — IndexedDB (Dexie.js) — all data stored on device
- 📅 **Stamp Records** — Track weighing machine stamps per scale
- 🧾 **Invoice Generator** — Print/email service invoices

## 📁 File Structure
```
/
├── index.html          ← Main app
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (offline cache)
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── apple-touch-icon.png
```

## 🚀 Deploy to GitHub Pages

1. Create a new GitHub repository
2. Upload all files maintaining the folder structure
3. Go to **Settings → Pages → Source: main branch / root**
4. Your app will be live at: `https://yourusername.github.io/reponame/`

> ⚠️ **HTTPS required** — Camera (QR) and GPS only work on HTTPS. GitHub Pages provides HTTPS automatically.

## 🔐 Admin Panel
Password: `1990`

## 📱 Install as App (PWA)
- **Android Chrome**: Menu → "Add to Home Screen"  
- **iOS Safari**: Share → "Add to Home Screen"
- **Desktop Chrome**: Install icon in address bar

## 🔧 Tech Stack
- Dexie.js (IndexedDB)
- Html5-QRcode (camera scanner)
- SheetJS XLSX (Excel export)
- Bootstrap 5 / Font Awesome
- SweetAlert2
