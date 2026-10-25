import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

const VALID_USER = 'testuser@example.com';
const VALID_PASS = 'Password@123';
const MAX_ATTEMPTS = 3;
const OTP_TTL_MS = 2 * 60 * 1000; // OTP valid for 2 minutes

// email -> { otp, expiresAt, attempts, locked }
const otpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // unique 6-digit
}

app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email !== VALID_USER || password !== VALID_PASS) {
    return res.status(401).json({ ok: false, message: 'Invalid username or password' });
  }
  const otp = generateOtp();
  otpStore.set(email, { otp, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0, locked: false });
  console.log(`[OTP sent] ${email} -> ${otp}`); // real system: send via SMS/Email
  return res.json({ ok: true, message: 'OTP sent' });
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body || {};
  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ ok: false, message: 'No OTP requested' });
  if (record.locked) return res.status(423).json({ ok: false, message: 'Account locked - too many attempts' });
  if (Date.now() > record.expiresAt) return res.status(410).json({ ok: false, message: 'OTP expired' });
  if (!otp || String(otp).length < 6) return res.status(400).json({ ok: false, message: 'Please enter 6 digit OTP' });

  if (String(otp) === record.otp) {
    otpStore.delete(email); // single-use
    return res.json({ ok: true, message: 'Welcome, testuser!' });
  }
  record.attempts++;
  if (record.attempts >= MAX_ATTEMPTS) {
    record.locked = true;
    return res.status(423).json({ ok: false, message: 'Account locked - too many attempts' });
  }
  return res.status(401).json({ ok: false, message: 'Invalid OTP' });
});

app.get('/health', (_req, res) => {
  return res.json({ ok: true });
});

// TEST-ONLY: automation reads the freshly generated OTP here.
// In production this endpoint MUST NOT exist.
app.get('/test-api/latest-otp', (req, res) => {
  const record = otpStore.get(req.query.email);
  if (!record) return res.status(404).json({ ok: false, message: 'No OTP found for this email' });
  return res.json({ ok: true, otp: record.otp });
});

app.listen(PORT, () => console.log(`OTP demo API running at http://localhost:${PORT}`));