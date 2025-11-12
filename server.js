// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

let profiles = []; // Hier speichern wir alle User-Daten
let tokens = {};   // Token pro User

// Registrierung
app.post("/api/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Bitte alle Felder ausfüllen" });
  }

  // Prüfen ob User schon existiert
  const exists = profiles.find(p => p.email === email);
  if (exists) return res.status(400).json({ error: "User existiert bereits" });

  const newProfile = { id: profiles.length + 1, name, email };
  profiles.push(newProfile);

  // Token erstellen
  const token = "token-" + Math.random().toString(36).substr(2, 9);
  tokens[email] = token;

  res.json({ message: "Registrierung erfolgreich!", token });
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const profile = profiles.find(p => p.email === email);
  if (!profile) return res.status(400).json({ error: "User nicht gefunden" });

  // Token abrufen oder neu generieren
  const token = tokens[email] || ("token-" + Math.random().toString(36).substr(2, 9));
  tokens[email] = token;

  res.json({ message: "Login erfolgreich!", token });
});

// Profile laden
app.get("/api/profiles", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  if (!Object.values(tokens).includes(token)) return res.status(401).json({ error: "Ungültiger Token" });

  res.json(profiles);
});

app.listen(PORT, () => {
  console.log(`AutoForm Backend running on http://localhost:${PORT}`);
});
