import { createHmac, randomInt } from 'node:crypto';

const json = (res, status, body) => res.status(status).json(body);
const redis = async (command) => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command) });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error('Storage service request failed');
  return data.result;
};
const digest = (phone, otp) => createHmac('sha256', process.env.OTP_SECRET).update(`${phone}:${otp}`).digest('hex');

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, MSG91_AUTH_KEY, MSG91_TEMPLATE_ID, OTP_SECRET } = process.env;
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN || !MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID || !OTP_SECRET) {
    return json(res, 503, { error: 'Mobile verification is not configured yet. Please contact LILYNT directly to arrange an appointment.' });
  }
  const phone = String(req.body?.phone || '').replace(/\D/g, '');
  const name = String(req.body?.name || '').trim().slice(0, 80);
  if (!/^[6-9]\d{9}$/.test(phone) || name.length < 2) return json(res, 400, { error: 'Enter a valid name and 10-digit Indian mobile number.' });
  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim().slice(0, 64);
  try {
    const phoneCount = Number(await redis(['INCR', `lilynt:otp:limit:phone:${phone}`]));
    if (phoneCount === 1) await redis(['EXPIRE', `lilynt:otp:limit:phone:${phone}`, '600']);
    const ipCount = Number(await redis(['INCR', `lilynt:otp:limit:ip:${ip}`]));
    if (ipCount === 1) await redis(['EXPIRE', `lilynt:otp:limit:ip:${ip}`, '600']);
    if (phoneCount > 3 || ipCount > 12) return json(res, 429, { error: 'Too many OTP requests. Please wait 10 minutes before trying again.' });

    const otp = String(randomInt(0, 1000000)).padStart(6, '0');
    const key = `lilynt:appointment:otp:${phone}`;
    await redis(['SET', key, JSON.stringify({ hash: digest(phone, otp), attempts: 0, name, createdAt: new Date().toISOString() }), 'EX', '300']);

    const smsUrl = new URL('https://control.msg91.com/api/v5/otp');
    smsUrl.searchParams.set('template_id', MSG91_TEMPLATE_ID);
    smsUrl.searchParams.set('mobile', `91${phone}`);
    smsUrl.searchParams.set('otp', otp);
    smsUrl.searchParams.set('otp_expiry', '5');
    const sms = await fetch(smsUrl, { method: 'POST', headers: { authkey: MSG91_AUTH_KEY, 'Content-Type': 'application/json' } });
    const smsBody = await sms.json().catch(() => ({}));
    if (!sms.ok || (smsBody.type && String(smsBody.type).toLowerCase() === 'error')) {
      await redis(['DEL', key]);
      return json(res, 502, { error: 'The SMS provider could not send your OTP. Please try again later.' });
    }
    return json(res, 200, { ok: true, message: 'OTP sent. It is valid for 5 minutes.' });
  } catch {
    return json(res, 503, { error: 'We could not process the OTP request right now. Please try again later.' });
  }
}
