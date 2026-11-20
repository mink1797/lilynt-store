# LILYNT appointment registration — deployment setup

The appointment page is added at `/appointment/`. The API is intentionally fail-closed: it will not issue a registration number unless mobile OTP delivery and persistent storage are configured.

## Required Vercel environment variables

Add these to the `lilynt-store` Vercel project for Production (and Preview while testing):

- `UPSTASH_REDIS_REST_URL` — REST URL for a persistent Upstash Redis database.
- `UPSTASH_REDIS_REST_TOKEN` — matching REST token (keep secret).
- `MSG91_AUTH_KEY` — MSG91 API authentication key (keep secret).
- `MSG91_TEMPLATE_ID` — approved MSG91 OTP template ID. The approved DLT template must contain the OTP placeholder required by your MSG91 account.
- `OTP_SECRET` — a random secret of at least 32 bytes, used only to HMAC OTP values.

Do not put these values in frontend code, GitHub files, or chat messages. Add them directly in Vercel Project Settings → Environment Variables, then redeploy.

## Provider setup

1. Create/activate an Upstash Redis database and copy its REST URL and REST token.
2. Activate MSG91 OTP service, complete the required Indian DLT/entity/sender/template registration, and create an approved OTP template.
3. Add the five variables above in Vercel.
4. Redeploy and test using a mobile number you control.

## Registration behavior

- 6-digit OTP, 5-minute expiry, maximum 5 verification attempts.
- OTP requests are rate-limited by mobile and IP.
- Registration number format: `LIL-YYYY-000001`, with an atomic yearly sequence.
- Appointment records are retained in Redis for one year.
- Owners displayed on the appointment confirmation: Anil Mishra and Silky Mishra.
- Every new registration starts as **Pending confirmation**; this is an appointment request, not an automatically confirmed calendar booking.

## Important

The frontend and API code can be deployed before the provider setup, but OTP and registration remain unavailable until all environment variables and the approved SMS template are configured. The API does not reveal or generate OTPs in the browser.
