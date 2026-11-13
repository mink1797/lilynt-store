# LILYNT Corporate Website — Preview

This branch contains the rebuilt multi-business LILYNT corporate website concept.

## Safety
- The production `main` branch has not been changed.
- The current shopping-store website remains on `main`.
- This preview is marked `noindex, nofollow` and blocks crawling until the new corporate site is approved.
- Do not attach `lilynt.com` or change production branch settings before owner approval.

## Design
- Forest green, royal gold and ivory palette.
- Existing LILYNT logo asset reused without redesign.
- Responsive navigation, business mega-menu, search, division pages, About and Contact pages.
- 13 business division landing pages plus Home, About and Contact.
- Page titles, descriptions, canonical URLs, organization structured data, sitemap and Vercel SPA route fallback.

## Preview deployment
Create a separate Vercel Preview deployment from branch `corporate-restoration-preview`. Do not promote it to Production or assign the production domain. Test mobile and desktop layouts and all deep links before approval.

## Before launch
1. Run `npm install`, `npm run build` and fix any reported issues.
2. Verify all images, contact details, business claims, forms and links.
3. Confirm legal entity details and actual services/products offered.
4. After approval only: change robots to allow indexing, validate sitemap, merge to the production branch and update domain assignment deliberately.
