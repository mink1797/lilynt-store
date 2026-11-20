import { createHmac, timingSafeEqual } from 'node:crypto';

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

const verificationScript = `
local raw = redis.call('GET', KEYS[1])
if not raw then return {0, 'expired'} end
local otp = cjson.decode(raw)
if tonumber(otp.attempts or 0) >= 5 then redis.call('DEL', KEYS[1]); return {0, 'attempts'} end
if otp.hash ~= ARGV[1] then
  otp.attempts = tonumber(otp.attempts or 0) + 1
  local ttl = redis.call('TTL', KEYS[1])
  redis.call('SET', KEYS[1], cjson.encode(otp), 'EX', math.max(ttl, 1))
  if otp.attempts >= 5 then redis.call('DEL', KEYS[1]); return {0, 'attempts'} end
  return {0, 'invalid'}
end
local sequence = redis.call('INCR', KEYS[2])
local registrationNumber = ARGV[2] .. string.format('%06d', sequence)
local record = cjson.decode(ARGV[3])
record.registrationNumber = registrationNumber
record.registeredAt = ARGV[4]
redis.call('SET', ARGV[5] .. registrationNumber, cjson.encode(record), 'EX', '31536000')
redis.call('DEL', KEYS[1])
return {1, cjson.encode(record)}
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, OTP_SECRET } = process.env;
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN || !OTP_SECRET) return json(res, 503, { error: 'Appointment registration is not configured yet. Please contact LILYNT directly.' });

  const body = req.body || {};
  const phone = String(body.phone || '').replace(/\D/g, '');
  const otp = String(body.otp || '').replace(/\D/g, '');
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const date = String(body.date || '');
  const time = String(body.time || '');
  const service = String(body.service || '').trim();
  const message = String(body.message || '').trim().slice(0, 500);
  if (!/^[6-9]\d{9}$/.test(phone) || !/^\d{6}$/.test(otp)) return json(res, 400, { error: 'Enter a valid mobile number and 6-digit OTP.' });
  if (name.length < 2 || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !time || !service) {
    return json(res, 400, { error: 'Please check the appointment details and try again.' });
  }
  const selectedDate = new Date(`${date}T00:00:00+05:30`);
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) return json(res, 400, { error: 'Please choose today or a future appointment date.' });

  try {
    const year = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(new Date());
    const record = {
      name, email, phone: `+91${phone}`, appointmentDate: date, appointmentTime: time, purpose: service, message,
      owners: ['Anil Mishra', 'Silky Mishra'], company: 'LILYNT Group Private Limited', status: 'Pending confirmation'
    };
    const result = await redis(['EVAL', verificationScript, '2',
      `lilynt:appointment:otp:${phone}`, `lilynt:registration:sequence:${year}`,
      digest(phone, otp), `LIL-${year}-`, JSON.stringify(record), new Date().toISOString(),
      `lilynt:appointment:record:`
    ]);
    if (!Array.isArray(result) || Number(result[0]) !== 1) {
      const reason = Array.isArray(result) ? result[1] : 'invalid';
      if (reason === 'expired') return json(res, 400, { error: 'This OTP has expired. Please request a new OTP.' });
      if (reason === 'attempts') return json(res, 429, { error: 'Too many incorrect attempts. Please request a new OTP.' });
      return json(res, 400, { error: 'The OTP is incorrect. Please check and try again.' });
    }
    const saved = JSON.parse(result[1]);
    return json(res, 200, { ok: true, registrationNumber: saved.registrationNumber, registeredAt: saved.registeredAt, status: saved.status });
  } catch {
    return json(res, 503, { error: 'We could not complete registration right now. Please try again later.' });
  }
}
