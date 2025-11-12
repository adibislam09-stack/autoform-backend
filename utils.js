// utils.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'db.sqlite3');

function getDb(){
  const db = new sqlite3.Database(DB_PATH);
  return db;
}

function initDb(){
  const db = getDb();
  db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      data_encrypted BLOB,
      nonce BLOB,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  });
  db.close();
}

// Encryption helpers using AES-256-GCM and a per-user key derived from password
function deriveKey(password, salt='autoform_salt'){
  // WARNING: For production use a secure salt per user; scrypt is used here for demo
  return crypto.scryptSync(password, salt, 32);
}

function encryptJSON(jsonObj, key){
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(jsonObj), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: encrypted.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64') };
}

function decryptJSON(encObj, key){
  const iv = Buffer.from(encObj.iv, 'base64');
  const tag = Buffer.from(encObj.tag, 'base64');
  const ciphertext = Buffer.from(encObj.ciphertext, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

module.exports = { getDb, initDb, deriveKey, encryptJSON, decryptJSON };
