/**
 * Sends form submissions (Contact Us / Report a Problem) straight to your
 * inbox using EmailJS (https://www.emailjs.com) — a free service that lets a
 * plain app (no backend server) deliver email via a simple HTTPS request.
 *
 * ============================== ONE-TIME SETUP ==============================
 * 1. Create a free account at https://www.emailjs.com
 * 2. Add an Email Service (e.g. Gmail) — copy its "Service ID".
 * 3. Create an Email Template with variables: {{from_name}}, {{from_email}},
 *    {{subject}}, {{message}} — copy its "Template ID".
 * 4. Account → General → copy your "Public Key".
 * 5. Paste all three values below.
 * =============================================================================
 *
 * Until you fill these in, the app automatically falls back to opening the
 * device's own mail app (mailto:) with the message pre-filled, so contact
 * forms still work out of the box — they just require the user to tap Send
 * in their own mail app instead of it going through silently.
 */

const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // EDIT ME
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // EDIT ME
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // EDIT ME

// Where mailto: fallback messages go if EmailJS isn't configured yet.
export const SUPPORT_EMAIL = 'support@urdunovellibrary.app'; // EDIT ME

const isConfigured =
  EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' &&
  EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
  EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';

/**
 * Sends { name, email, subject, message } to your inbox.
 * Returns { ok: true } on success, or { ok: false, needsMailFallback: true }
 * if EmailJS isn't set up yet or the request failed.
 */
export async function sendFormEmail({ name, email, subject, message }) {
  if (!isConfigured) {
    return { ok: false, needsMailFallback: true };
  }
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          from_name: name || 'App user',
          from_email: email || 'not provided',
          subject: subject || 'Novel Reader App',
          message: message || '',
        },
      }),
    });
    if (!res.ok) return { ok: false, needsMailFallback: true };
    return { ok: true };
  } catch (e) {
    return { ok: false, needsMailFallback: true };
  }
}
