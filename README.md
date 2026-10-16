# iwin.in

Static website for **iwin.in**: a free directory of scholarships, hackathons, coding contests, olympiads, fellowships and government contests for Indian students and creators, with guides, a quiz, tools, lead capture, sponsorship and support pages.

## Hosting (GitHub Pages, free plan)
1. Repository Settings > Pages > Build and deployment > Source: **Deploy from a branch**, Branch: **main**, folder **/ (root)**.
2. Custom domain: `iwin.in` (the `CNAME` file is included). Tick **Enforce HTTPS** once the certificate is issued.
3. DNS at the registrar: A records for `@` to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153, and a CNAME for `www` to `webworksa1.github.io`.

## Editing
- Listings: `assets/js/data.js`
- Payment links for the Support page: `assets/js/config.js`
- Pages are plain HTML. They were generated from templates, so keep header and footer changes consistent across files.

## Forms
All forms post through FormSubmit. The first submission triggers a one-time activation email to the site inbox; confirm it once and all forms start delivering.

## AdSense
The AdSense script is in the `<head>` of every page and `ads.txt` is at the root. Use Auto ads after approval.

## Notice
iwin.in is independent and not affiliated with iWin, Inc. or any other holder of an "iWin" trademark. See `trademark.html`.
