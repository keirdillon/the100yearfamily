# The 100-Year Family — Book Landing Page

The pre-launch page for *The 100-Year Family* by Jeremy Straub: a book reveal, the story, and the **Founding Readers** email signup.

- Plain HTML, CSS and JavaScript. No framework, **no build step**, nothing to install.
- One serverless function (`/api/subscribe`) saves signups to **Resend**, which the 100YF stack already uses.
- Fonts, images and scripts are all self-hosted. No third-party trackers or cookies.

---

## What's in the folder

```
index.html              The landing page
privacy.html            Privacy page (DRAFT: fill in the [BRACKETS])
thank-you.html          Shown after signup when JavaScript is off
404.html                Not-found page
api/subscribe.js        Signup endpoint → Resend Contacts (+ optional welcome email)
assets/css/styles.css   All styles (brand tokens at the top)
assets/js/main.js       Generations animation + signup forms
assets/img/             Book mockup, cover, photos, tree-rings art, social share card
assets/fonts/           EB Garamond, Source Serif 4, DM Sans (woff2)
vercel.json             Clean URLs, caching and security headers
robots.txt, sitemap.xml, site.webmanifest, favicons
.env.example            The environment variables the signup needs
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
3. Add the environment variables from step 3, then **Deploy**.

### 3. Connect the signup (Resend)
In resend.com:
1. **API Keys** → create a key with "Full access" (or "Sending" + contacts). Save it as `RESEND_API_KEY` in Vercel.
2. **Contacts → Segments** → create a segment called *Founding Readers*. Put its ID in `RESEND_SEGMENT_ID`. This is optional but recommended, so book readers stay separate from app users.
3. **Optional welcome email:** verify the sending domain under **Domains** (for example 100yearos.com), then set
   `RESEND_FROM_EMAIL="Jeremy Straub <jeremy@100yearos.com>"`. Leave it unset to skip the welcome email.
4. **Optional:** set `NOTIFY_EMAIL` to get a note for every new signup.

After changing environment variables, redeploy so they take effect (Deployments → ⋯ → Redeploy).

Until `RESEND_API_KEY` is set, the form shows "Sign-ups aren't connected yet" and stores nothing.

### 4. Pick the domain
**100yearos.com currently serves the SaaS app.** Options:
- **A. Book page on the root, app on a subdomain.** Move the app to `app.100yearos.com`, then add `100yearos.com` to this project. This is the strongest setup for the launch.
- **B. Book page on a subdomain,** for example `book.100yearos.com`. Add that subdomain to this project in Vercel → Settings → Domains.

If the final address isn't `https://100yearos.com`, find and replace that URL in `index.html` (canonical, og:url, og:image, JSON-LD), `privacy.html`, `robots.txt` and `sitemap.xml`.

### 5. Optional extras
- **Analytics:** Vercel → Project → **Analytics → Enable**. The page already includes the script, which is privacy-friendly and cookieless.
- **Share preview:** after launch, paste the URL into the LinkedIn Post Inspector to refresh its cached preview card.

---

## Run it locally
- **Look only:** `npx serve .` then open the address it prints. The signup endpoint won't run this way.
- **With the signup working:** `npm i -g vercel`, then `vercel link`, then copy `.env.example` to `.env.local` and fill it in, then `vercel dev`.

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
- [ ] Send yourself a test signup on the live site and confirm the contact appears in Resend.

## How the signup works
`POST /api/subscribe` accepts JSON or a normal form post with `email`, `firstName` (optional) and `source` (`hero` or `founding-readers`).
- A hidden "company" field catches bots without a CAPTCHA.
- Emails already on the list are treated as success, and they don't get a second welcome email.
- Welcome or notify email failures never block a signup. They're written to the Vercel function logs.
