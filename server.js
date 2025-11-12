// 1️⃣ Module importieren
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// 2️⃣ App erstellen
const app = express();
const PORT = 4000;

// 3️⃣ Middleware
app.use(cors());
app.use(bodyParser.json());

// 4️⃣ Dummy-Daten
const users = [];
const profiles = [
    {
        id: 1,
        name: "Max Mustermann",
        email: "max@mustermann.com",
        phone: "0123456789",
        address: "Musterstraße 1"
    }
];

// 5️⃣ Routen

// Registrierung
app.post("/api/register", (req, res) => {
    const { email, password } = req.body;
    console.log("Register attempt:", email, password);
    if(!email || !password) return res.status(400).json({ error: "Email und Passwort nötig" });
    if(users.find(u => u.email === email)) return res.status(400).json({ error: "Email schon registriert" });
    users.push({ email, password });
    res.json({ token: "test-token-123" });
});

// Login
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if(!user) return res.status(400).json({ error: "Falsche Email oder Passwort" });
    res.json({ token: "test-token-123" });
});

// Profile abrufen
app.get("/api/profiles", (req, res) => {
    res.json(profiles);
});

// 6️⃣ Server starten
app.listen(PORT, () => console.log(`AutoForm backend running on http://localhost:${PORT}`));
