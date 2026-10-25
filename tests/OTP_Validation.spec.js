import { test, expect } from '@playwright/test';
import path from 'path';
import { pathToFileURL } from 'url';

// Build a file:// URL to the demo app that sits next to this test file.
const APP_URL = pathToFileURL(path.join(__dirname, 'otp-demo.html')).href;
const API_URL = 'http://127.0.0.1:3000';

// Helper: fills OTP into a single field OR multiple digit-boxes.
async function enterOtp(page, otp) {
  const boxes = page.locator('[data-testid="otp-box"]');
  const count = await boxes.count();
  if (count > 1) {
    for (let i = 0; i < otp.length; i++) {
      await boxes.nth(i).fill(otp[i]);
    }
  } else {
    await page.locator('#otp').fill(otp);
  }
}

// Reusable step: log in and reach the OTP screen.
async function goToOtpScreen(page) {
  await page.goto(APP_URL);
  await page.fill('#username', 'testuser@example.com');
  await page.fill('#password', 'Password@123');
  await page.click('#send-otp');
  await expect(page.locator('#otp-screen')).toBeVisible();
}

// Read the freshly generated (UNIQUE) OTP from the app's test hook.
// This mimics Strategy 2 - calling a test-only backend API. Never hardcode!
async function getGeneratedOtp(page) {
  return await page.evaluate(() => window.__getOtp());
}

// ===================== POSITIVE SCENARIOS =====================
test.describe('OTP - Positive Scenarios', () => {

  // DYNAMIC OTP: unique each login, read via the test hook (not hardcoded)
  test('Valid OTP allows the user to log in successfully', async ({ page }) => {
    await goToOtpScreen(page);
    const otp = await getGeneratedOtp(page);
    await enterOtp(page, otp);
    await page.click('#verify-otp');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('#welcome-msg')).toContainText('Welcome');
  });

  // STRATEGY 2: OTP fetched from the local backend test API.
  test('Valid OTP fetched from test API is accepted', async ({ request }) => {
    const email = 'testuser@example.com';
    const sendResponse = await request.post(`${API_URL}/login`, {
      data: { email, password: 'Password@123' },
    });
    expect(sendResponse.status()).toBe(200);
    const res = await request.get(`${API_URL}/test-api/latest-otp?email=${email}`);
    expect(res.ok()).toBeTruthy();
    const { otp } = await res.json();
    const verifyResponse = await request.post(`${API_URL}/verify-otp`, {
      data: { email, otp },
    });
    expect(verifyResponse.status()).toBe(200);
    await expect(verifyResponse).toBeOK();
  });


  // ===================== NEGATIVE SCENARIOS =====================
  test.describe('OTP - Negative Scenarios', () => {

    test.beforeEach(async ({ page }) => {
      await goToOtpScreen(page);
    });

    test('Invalid / wrong OTP shows an error and blocks login', async ({ page }) => {
      await enterOtp(page, '000000');
      await page.click('#verify-otp');
      await expect(page.locator('#otp-error')).toBeVisible();
      await expect(page.locator('#otp-error')).toContainText('Invalid OTP');
      await expect(page).not.toHaveURL(/.*dashboard/);
    });

    test('Empty OTP submission is not allowed', async ({ page }) => {
      await page.click('#verify-otp');
      await expect(page.locator('#otp-error')).toContainText(/required|enter/i);
    });

    test('OTP with fewer digits than required is rejected', async ({ page }) => {
      await page.locator('#otp').fill('123');
      await page.click('#verify-otp');
      await expect(page.locator('#otp-error')).toContainText(/6 digit/i);
    });

    test('OTP field rejects non-numeric characters', async ({ page }) => {
      await page.locator('#otp').fill('abcdef');
      const value = await page.locator('#otp').inputValue();
      expect(value).toMatch(/^\d*$/);
    });

    test('Account locks after multiple wrong OTP attempts (brute-force guard)', async ({ page }) => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        await enterOtp(page, '000000');
        await page.click('#verify-otp');
      }
      await expect(page.locator('#otp-error')).toContainText(/locked|too many attempts/i);
      await expect(page.locator('#verify-otp')).toBeDisabled();
    });

    // Need a real backend - learning only
    test.skip('Expired OTP is rejected', async ({ page }) => {
      await page.waitForTimeout(1000);
      await enterOtp(page, '123456');
      await page.click('#verify-otp');
      await expect(page.locator('#otp-error')).toContainText(/expired/i);
    });

    test('Reused (already consumed) OTP cannot be used twice', async ({ page }) => {
      const otp = await getGeneratedOtp(page);
      await enterOtp(page, otp);
      await page.click('#verify-otp');
      await expect(page).toHaveURL(/.*dashboard/);
      await page.click('#logout');
      await page.fill('#username', 'testuser@example.com');
      await page.fill('#password', 'Password@123');
      await page.click('#send-otp');
      await enterOtp(page, otp); // old, already-consumed code
      await page.click('#verify-otp');
      await expect(page.locator('#otp-error')).toContainText(/invalid/i);
    });
  });

  // ===================== UI / UX SCENARIOS =====================
  test.describe('OTP - UI & UX Scenarios', () => {

    test.beforeEach(async ({ page }) => {
      await goToOtpScreen(page);
    });

    test('Resend OTP button is disabled until the timer finishes', async ({ page }) => {
      await expect(page.locator('#resend-otp')).toBeDisabled();
      await expect(page.locator('#resend-timer')).toBeVisible();
    });

    test('Resend OTP becomes clickable after the countdown', async ({ page }) => {
      await expect(page.locator('#resend-otp')).toBeEnabled({ timeout: 10000 });
      await page.click('#resend-otp');
      await expect(page.locator('#otp-sent-msg')).toContainText(/sent/i);
    });

    test('OTP input allows only the maximum number of digits', async ({ page }) => {
      await page.locator('#otp').fill('1234567890');
      const value = await page.locator('#otp').inputValue();
      expect(value.length).toBeLessThanOrEqual(6);
    });

    test('Masking / visibility toggle works', async ({ page }) => {
      const otpInput = page.locator('#otp');
      await expect(otpInput).toHaveAttribute('type', 'password');
      await page.click('#toggle-otp-visibility');
      await expect(otpInput).toHaveAttribute('type', 'text');
    });

    // Multi-box UIs only - learning only
    test.skip('Auto-focus moves to the next box as each digit is typed', async ({ page }) => {
      const boxes = page.locator('[data-testid="otp-box"]');
      await boxes.nth(0).fill('1');
      await expect(boxes.nth(1)).toBeFocused();
    });
  });

  // ===================== EMAIL-BASED OTP (STRATEGY 3) =====================
  // Needs `npm install mailosaur` and a real app - learning only
  test.describe('OTP - Email based (real inbox)', () => {

    test.skip('OTP received by email is read and used to log in', async ({ page }) => {
      const { default: MailosaurClient } = await import('mailosaur');
      const mailosaur = new MailosaurClient('YOUR_API_KEY');
      const serverId = 'YOUR_SERVER_ID';
      const testEmail = `otp-test@${serverId}.mailosaur.net`;
      await page.goto('https://your-app.com/login');
      await page.fill('#username', testEmail);
      await page.click('#send-otp');
      const email = await mailosaur.messages.get(serverId, { sentTo: testEmail });
      const match = email.text.body.match(/\b(\d{6})\b/);
      expect(match, 'Could not find a 6-digit OTP in the email').not.toBeNull();
      const otp = match[1];
      await enterOtp(page, otp);
      await page.click('#verify-otp');
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });
});