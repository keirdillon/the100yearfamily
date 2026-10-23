/**
 * POST /api/subscribe — Founding Readers signup.
 *
 * Adds the subscriber to Resend Contacts (optionally into a Segment) and, if a
 * verified sender is configured, sends a short welcome email.
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY      required  Resend API key (re_…)
 *   RESEND_SEGMENT_ID   optional  Segment to add new contacts to (e.g. "Founding Readers")
 *   RESEND_FROM_EMAIL   optional  Verified sender, e.g. "Jeremy Straub <jeremy@100yearos.com>".
 *                                 When unset, no welcome email is sent.
 *   NOTIFY_EMAIL        optional  Internal address to notify on each new signup.
 *
 * Accepts JSON (from the page's script) or a normal form post (no-JS fallback,
 * which redirects to /thank-you).
 */

const RESEND = 'https://api.resend.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);
}

async function resend(path, payload, apiKey) {
  const res = await fetch(RESEND + path, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let body = null;
  try { body = await res.json(); } catch (_) { /* empty body */ }
  return { ok: res.ok, status: res.status, body };
}

function reply(req, res, status, payload) {
  const wantsJson =
    String(req.headers['content-type'] || '').includes('application/json') ||
    String(req.headers.accept || '').includes('application/json');
  if (wantsJson) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(status).json(payload);
  }
  // No-JavaScript fallback: send people to a real page.
  res.setHeader('Location', payload.ok ? '/thank-you' : '/?signup=error#join');
  return res.status(303).end();
}

function welcomeHtml(firstName) {
  const hello = firstName ? `${firstName},` : 'Welcome,';
  return `<!doctype html><html><body style="margin:0;background:#FAF7F2;font-family:Georgia,serif;color:#3A3F4E">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8A5A34;margin:0 0 24px">The 100-Year Family · Founding Readers</p>
    <p style="font-size:18px;line-height:1.6;margin:0 0 16px">${hello}</p>
    <p style="font-size:18px;line-height:1.6;margin:0 0 16px">Thank you for joining the Founding Readers. You are early, and early is a gift.</p>
    <p style="font-size:18px;line-height:1.6;margin:0 0 16px">Chapter One, <em>When the Spreadsheets Stop Mattering</em>, comes to you before the book is published. In between, every other week, you will get The Family Dispatch: one dynasty, one hard truth, one thing to do this week.</p>
    <p style="font-size:18px;line-height:1.6;margin:0 0 24px">Start tonight with one question at your own table: if our wealth disappeared tomorrow, would our character remain?</p>
    <p style="font-size:18px;line-height:1.6;margin:0">Jeremy Straub</p>
    <p style="font-size:14px;line-height:1.6;color:#7A7F8C;margin:32px 0 0;border-top:1px solid #E4DCCC;padding-top:16px">Wealth alone won't last 100 years. Families who build strength and virtue, do.</p>
  </div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const email = clean(body.email, 254).toLowerCase();
  const firstName = clean(body.firstName, 80);
  const source = clean(body.source, 40) || 'site';

  // Honeypot: real people never fill the hidden "company" field.
  if (clean(body.company, 200)) {
    return reply(req, res, 200, { ok: true });
  }

  if (!EMAIL_RE.test(email)) {
    return reply(req, res, 400, { ok: false, error: 'Please enter a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[subscribe] RESEND_API_KEY is not set; signup not stored for', source);
    return reply(req, res, 503, { ok: false, error: "Sign-ups aren't connected yet. Please try again soon." });
  }

  // 1. Create the contact.
  const contact = { email, unsubscribed: false };
  if (firstName) contact.first_name = firstName;
  if (process.env.RESEND_SEGMENT_ID) contact.segments = [{ id: process.env.RESEND_SEGMENT_ID }];

  const created = await resend('/contacts', contact, apiKey);
  const message = String((created.body && (created.body.message || created.body.name)) || '');
  const alreadyThere = created.status === 409 || /already|exist/i.test(message);

  if (!created.ok && !alreadyThere) {
    console.error('[subscribe] Resend contact error', created.status, message);
    return reply(req, res, 502, { ok: false, error: 'Something went wrong on our side. Please try again in a minute.' });
  }

  // 2. Optional welcome + internal notification. Failures here never block the signup.
  const from = process.env.RESEND_FROM_EMAIL;
  if (from && !alreadyThere) {
    const sent = await resend('/emails', {
      from,
      to: [email],
      subject: 'Welcome to the Founding Readers',
      html: welcomeHtml(firstName),
    }, apiKey);
    if (!sent.ok) console.error('[subscribe] welcome email failed', sent.status, sent.body && sent.body.message);
  }
  if (from && process.env.NOTIFY_EMAIL && !alreadyThere) {
    await resend('/emails', {
      from,
      to: [process.env.NOTIFY_EMAIL],
      subject: `New Founding Reader (${source})`,
      text: `${firstName || '(no name)'} <${email}> joined from: ${source}`,
    }, apiKey).catch(() => {});
  }

  return reply(req, res, 200, { ok: true });
}
