const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { BANGALORE_AREAS, INITIAL_CAFES } = require("./data/seedData");

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, "data", "db.json");

app.use(cors());
app.use(express.json());

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function computeMeetupScore(sub) {
  const score =
    0.35 * sub.ambiance +
    0.30 * sub.seating +
    0.20 * sub.food +
    0.15 * sub.value;
  return Number(score.toFixed(2));
}

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { users: [], cafes: INITIAL_CAFES };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "TableForUs API", areas: Object.keys(BANGALORE_AREAS) });
});

app.post("/api/auth/guest", (req, res) => {
  const db = loadDB();
  const guestUser = {
    id: "guest_" + Date.now(),
    name: req.body?.name?.trim() || "Guest Explorer",
    email: "guest@tableforus.in",
    isGuest: true,
    onboardingCompleted: false,
    preferences: { area: "Koramangala", maxBudget: "any", ambiance: "All" },
    freeBookingsUsed: 0,
    walletBalance: 0,
    coupons: [],
    bookings: []
  };
  db.users.push(guestUser);
  saveDB(db);
  res.json({ user: guestUser });
});

app.post("/api/auth/login", (req, res) => {
  const { name, email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const db = loadDB();
  let user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    user = {
      id: "u_" + Date.now(),
      name: name?.trim() || email.split("@")[0],
      email: email.trim().toLowerCase(),
      isGuest: false,
      onboardingCompleted: false,
      preferences: { area: "Koramangala", maxBudget: "any", ambiance: "All" },
      freeBookingsUsed: 0,
      walletBalance: 0,
      coupons: [],
      bookings: []
    };
    db.users.push(user);
    saveDB(db);
  }
  res.json({ user });
});

app.post("/api/users/:id/onboarding", (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.preferences = {
    area: req.body.area || "Koramangala",
    maxBudget: req.body.maxBudget || "any",
    ambiance: req.body.ambiance || "All"
  };
  user.onboardingCompleted = true;
  saveDB(db);
  res.json({ user });
});

app.get("/api/cafes", (req, res) => {
  const db = loadDB();
  const area = req.query.area || "Koramangala";
  const baseCoords = BANGALORE_AREAS[area] || BANGALORE_AREAS["Koramangala"];
  const userLat = req.query.lat ? parseFloat(req.query.lat) : baseCoords.lat;
  const userLng = req.query.lng ? parseFloat(req.query.lng) : baseCoords.lng;

  const enriched = db.cafes.map((cafe) => ({
    ...cafe,
    distanceKm: calculateDistanceKm(userLat, userLng, cafe.lat, cafe.lng),
    meetupScore: computeMeetupScore(cafe.subRatings)
  }));

  res.json({ cafes: enriched, areas: BANGALORE_AREAS });
});

app.post("/api/cafes/:id/reviews", (req, res) => {
  const db = loadDB();
  const cafe = db.cafes.find((c) => c.id === Number(req.params.id));
  if (!cafe) return res.status(404).json({ error: "Cafe not found" });

  const { user, ambiance, seating, food, value, spend, comment } = req.body;
  const avgReview = Number(((ambiance + seating + food + value) / 4).toFixed(1));

  const newReview = {
    id: Date.now(),
    user: user || "Guest Explorer",
    rating: avgReview,
    spend: Number(spend) || cafe.budget,
    comment: comment || "Great spot to catch up with friends!",
    date: "Just now"
  };

  cafe.reviews.unshift(newReview);
  cafe.subRatings = {
    ambiance: Number(((cafe.subRatings.ambiance * 4 + Number(ambiance)) / 5).toFixed(2)),
    seating: Number(((cafe.subRatings.seating * 4 + Number(seating)) / 5).toFixed(2)),
    food: Number(((cafe.subRatings.food * 4 + Number(food)) / 5).toFixed(2)),
    value: Number(((cafe.subRatings.value * 4 + Number(value)) / 5).toFixed(2))
  };
  cafe.overallRating = Number(((cafe.overallRating * 4 + avgReview) / 5).toFixed(1));

  saveDB(db);
  res.json({
    cafe: {
      ...cafe,
      meetupScore: computeMeetupScore(cafe.subRatings)
    }
  });
});

app.post("/api/bookings", (req, res) => {
  const db = loadDB();
  const { userId, cafeId, date, time, guests, rewardChoice, useCouponId, useWallet } = req.body;

  const user = db.users.find((u) => u.id === userId);
  const cafe = db.cafes.find((c) => c.id === Number(cafeId));
  if (!user || !cafe) return res.status(404).json({ error: "User or Cafe not found" });

  const isFree = user.freeBookingsUsed < 3;
  const baseFee = isFree ? 0 : 99;
  let discountApplied = 0;

  if (!isFree && useCouponId) {
    const couponIdx = user.coupons.findIndex((c) => c.id === useCouponId && !c.used);
    if (couponIdx !== -1) {
      discountApplied += user.coupons[couponIdx].amount;
      user.coupons[couponIdx].used = true;
    }
  }

  let walletUsed = 0;
  if (!isFree && useWallet && user.walletBalance > 0) {
    walletUsed = Math.min(user.walletBalance, Math.max(0, baseFee - discountApplied));
    user.walletBalance -= walletUsed;
  }

  const finalPaid = Math.max(0, baseFee - discountApplied - walletUsed);
  let rewardSummary = "Free Table Reservation (₹0 Fee)";

  if (isFree) {
    user.freeBookingsUsed += 1;
    const remaining = 3 - user.freeBookingsUsed;
    rewardSummary = `Free Booking #${user.freeBookingsUsed} of 3 (${remaining} free left)`;
  } else if (rewardChoice === "cashback") {
    const cashbackAmount = Math.max(20, Math.round((finalPaid || baseFee) * 0.2));
    user.walletBalance += cashbackAmount;
    rewardSummary = `₹${cashbackAmount} Instant Cashback credited to Wallet`;
  } else {
    const newCoupon = {
      id: "CPN" + Math.floor(1000 + Math.random() * 9000),
      code: "BREW50",
      label: "₹50 Off Next Table Booking / Order",
      amount: 50,
      used: false
    };
    user.coupons.push(newCoupon);
    rewardSummary = `Unlocked Coupon ${newCoupon.code} (₹50 Off Next Order)`;
  }

  const booking = {
    id: "BK" + Math.floor(100000 + Math.random() * 900000),
    cafeId: cafe.id,
    cafeName: cafe.name,
    cafeArea: cafe.area,
    date,
    time,
    guests: Number(guests),
    isFree,
    amountPaid: finalPaid,
    rewardSummary,
    status: "Confirmed",
    createdAt: new Date().toISOString()
  };

  user.bookings.unshift(booking);
  saveDB(db);
  res.json({ booking, user });
});

app.listen(PORT, () => {
  console.log(`TableForUs backend running on http://localhost:${PORT}`);
});
