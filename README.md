HEAD
# TableForUs

# TableForUs — Full-Stack Bangalore Cafe Discovery & Meetup Platform

Includes both **frontend** (React + Vite + Tailwind CSS) and **backend** (Node.js + Express REST API + pre-seeded Bangalore cafe data & persistent JSON database).

---

## What Is Inside the ZIP (`tableforus/`)

```text
tableforus/
├── backend/
│   ├── data/
│   │   └── seedData.js       # 24 pre-seeded Bangalore cafes across JP Nagar, Jayanagar, Koramangala, Electronic City, HSR Layout & Indiranagar
│   ├── server.js             # Express API (guest/account auth, onboarding preferences, Haversine distance, Friend-Meetup score, reviews, 3-free-bookings & cashback/coupons)
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── fallbackData.js
│       └── App.jsx           # Guest opening login -> 3-step onboarding -> Main dashboard & bookings/rewards wallet
└── README.md
```

---

## Run in VS Code (PowerShell)

### Terminal 1 — Backend (`http://localhost:5000`)
```powershell
cd backend
npm install
npm start
```

### Terminal 2 — Frontend (`http://localhost:5173`)
```powershell
cd frontend
npm install
npm run dev
```
>>>>>>> d140e91 (Initial TableForUs project)
