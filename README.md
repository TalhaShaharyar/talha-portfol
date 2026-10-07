# Talha Shaharyar — Animated portfolio

An editable portfolio inspired by the editorial structure and connected motion of deisseroth.com. Built with HTML, CSS, and JavaScript. No Supabase, database, build system, or paid hosting is required.

## Website editor

Open `admin/` on the deployed website.

- Edit headings, descriptions, pictures, links, menu links, timeline entries, unlimited categories, chapters, featured content, biography, footer columns, social profiles, privacy text, colors, and motion.
- Add, duplicate, remove, and reorder list items.
- Upload pictures or use image URLs; uploaded pictures are resized and stored in the content file. The editor enforces a 900 KB published-content limit; use hosted image URLs for larger collections.
- Save draft stores a local draft on your device. Preview opens that draft; it does not change the public site.
- Download backup exports all editable content. Restore backup loads it as an unpublished draft.
- Publish changes commits `content.json` to GitHub. GitHub Pages redeploys it.

The editor is publicly accessible, but publishing requires a GitHub token with write access. It does **not** pretend to protect publication with a password checked in browser code. The token stays in memory for the current tab, is transmitted only to `api.github.com`, and is not saved in local storage, backups, or the repository. Reloading or closing the tab disconnects it.

### Owner publishing setup

1. Create a fine-grained GitHub token for this repository only.
2. Grant Contents: Read and write. No additional repository permissions are needed for content edits.
3. In the editor, choose Connect GitHub and enter the token there, never in chat.
4. Review the site with Preview, then Publish changes → Publish now.

The editor uses the GitHub file SHA to refuse stale writes. If a conflict occurs, download a backup, load published content, and reapply your changes. A token with no write access cannot publish. An expired or invalid token produces an error.

## GitHub Pages hosting

In the repository, open Settings → Pages. Select Deploy from a branch, branch `main`, folder `/ (root)`. The `.nojekyll` file allows the plain static files to be served directly. Wait for the Pages deployment to finish.

`config.json` points the editor to the GitHub owner/repository/branch. If you move the code to another repository, update it. The public site uses relative asset links and supports both a repository path and a custom domain.

## Custom domain later

Use Settings → Pages → Custom domain. Configure the DNS records GitHub specifies, verify domain ownership, and enable Enforce HTTPS after the certificate is ready. GitHub writes a CNAME file when you save the custom domain. Do not replace it during later updates. The admin editor continues targeting the same repository; no backend migration is needed.

## Cookies and privacy

The built-in preference panel is functional and stores the visitor's choice locally. The starting site does not contain analytics or advertising scripts. Consent toggles do not install trackers. If trackers are added later, implement actual blocking before consent.

To use CookieYes itself, create your own CookieYes website and enter its `client_data/<ID>/script.js` ID in the editor. The site loads that account's script instead of the built-in banner. Do not copy the reference site's CookieYes ID. Manage the CookieYes banner in CookieYes. Replace the sample privacy policy to reflect services you actually use.

## Motion and responsive behavior

- Hero crossfades on a configurable timer and responds to chapter hover/focus.
- Animated particles, hover connection curves, traveling signal points, and subtle orbit motion.
- Timeline filtering, full-text search with safe highlighted matches, and scroll reveals.
- Collapsible navigation below 960 px; mobile story thumbnails and vertical layout below 760 px.
- Reduced-motion support, semantic labels, skip link, result announcements, keyboard controls.
- Local raster assets avoid third-party image requests in the initial version.

## Local preview

From this directory: `python3 -m http.server 8080`

Open the local homepage, `admin/`, and `privacy.html`. Open through HTTP rather than double-clicking index.html, because JSON content is fetched.

## Content and images

Truthful starter background uses Talha's supplied context. Two timeline entries are explicitly marked as samples. Replace them through the editor. The construction photograph is illustrative; it is not claimed to depict Talha's own project.

Photo: Tolu Olubode / Unsplash, https://unsplash.com/photos/gray-concrete-building-under-construction-PlBsJ5MybGc

The design is a new implementation inspired by the reference. No reference portrait, scientific imagery, branding, or proprietary theme assets are included.
