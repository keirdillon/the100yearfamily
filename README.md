# The 100-Year Family — Book Landing Page

The pre-launch page for *The 100-Year Family* by Jeremy Straub: a book reveal, the story, and the **Founding Readers** email signup.

- Plain HTML, CSS and JavaScript. No framework, **no build step**, nothing to install.
- Signups post straight to **Formspree** (form `xwllknya`), so there is no server code and nothing to configure in Vercel.
- Fonts, images and scripts are all self-hosted. No third-party trackers or cookies.

---

## What's in the folder

```
index.html              The landing page
privacy.html            Privacy page (DRAFT: fill in the [BRACKETS])
thank-you.html          Shown after signup when JavaScript is off
404.html                Not-found page
assets/css/styles.css   All styles (brand tokens at the top)
assets/js/main.js       Generations animation + signup forms (POST to Formspree)
assets/img/             Book mockup, cover, photos, tree-rings art, social share card
assets/fonts/           EB Garamond, Source Serif 4, DM Sans (woff2)
vercel.json             Clean URLs, caching and security headers
robots.txt, sitemap.xml, site.webmanifest, favicons
```

---

## Deploy: GitHub → Vercel (about 10 minutes)

### 1. Put it on GitHub
Pick one:
- **GitHub CLI:** from this folder, run
  `gh repo create keirdillon/100-year-family-landing --private --source . --push`
- **GitHub website:** create an empty repo, then follow its "push an existing repository" commands from this folder. A first commit is already made.

### 2. Import into Vercel
1. Vercel → **Add New → Project** → import the repo.
2. **Framework Preset: Other.** Leave the Build Command and Output Directory empty, because nothing gets built.
3. **Deploy.** No environment variables are needed.

### 3. The signup (Formspree)
Both forms post to `https://formspree.io/f/xwllknya`. Submissions land in the Formspree dashboard and in the notification email set there. Fields sent: `email`, `firstName` (second form only), `source` (`hero` or `founding-readers`), and `_subject`. The hidden `_gotcha` field is Formspree's honeypot: bots fill it, people never see it.

To change where signups go, replace the endpoint in both `<form action="…">` tags in `index.html`. To export the list or connect it to an email tool, use Formspree's dashboard (Integrations).

### 4. Domain
The site runs at **https://the100yearfamily.com** (GoDaddy DNS: `A @ 216.150.1.1`). `www.the100yearfamily.com` is a permanent redirect to the bare domain, set in Vercel → Settings → Domains.

If the address ever changes, find and replace `https://the100yearfamily.com` in `index.html` (canonical, og:url, og:image, JSON-LD), `privacy.html`, `robots.txt` and `sitemap.xml`.

### 5. Optional extras
- **Analytics:** Vercel → Project → **Analytics → Enable**. The page already includes the script, which is privacy-friendly and cookieless.
- **Share preview:** after launch, paste the URL into the LinkedIn Post Inspector to refresh its cached preview card.

---

## Run it locally
- **Look only:** `npx serve .` then open the address it prints. The signup endpoint won't run this way.
- The forms post to Formspree directly, so they work locally too.

## Editing content
- All copy is in `index.html`. Each section is labelled with a comment (`HERO`, `THE SHIRTSLEEVES CYCLE`, and so on).
- The generations figures (100%, 30%, 10–15%, 3–5%) and their captions are in `assets/js/main.js` under `GENS`.
- Brand colors and fonts are the variables at the top of `assets/css/styles.css`.
- To swap a photo, replace the file in `assets/img/` and keep the name, or update the `src`, `width` and `height` in `index.html`.

## Before going public
- [ ] Fill in the `[LEGAL ENTITY NAME]`, `[CONTACT EMAIL]` and `[DATE]` placeholders in `privacy.html`, and have counsel review the page.
- [ ] Compliance review of the page and the welcome email, given Jeremy's role at Coastal Wealth.
- [ ] Replace the three photos with full-resolution originals. The current files are 864 px, which looks soft on the full-width ranch band.
- [ ] Confirm the offers the page promises: Chapter One early, the Continuity Score, The Family Dispatch, and the Summit invitation.
- [ ] Send yourself a test signup on the live site and confirm it appears in the Formspree dashboard.

## How the signup works
`assets/js/main.js` sends the form as JSON to Formspree with `Accept: application/json`, then swaps the form for the "You're a Founding Reader" message. Formspree's own error messages (for example an invalid email) show inline. With JavaScript off, the form posts normally and Formspree shows its own thank-you page.
