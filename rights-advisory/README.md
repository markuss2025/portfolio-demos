# Meridian Rights Advisory – landing page (concept)

Concept page for a fictional human-rights advisory. Designed and built as plain, lightweight HTML/CSS/JS, so it can be handed to a WordPress / SEO specialist and integrated quickly.

## Design intent
- **Clarity:** one idea per section, plain-language headings, short paragraphs
- **Trust:** calm navy and gold palette, serif headings, confidentiality and disclaimer messaging
- **Conversion:** one primary action ("Request a consultation") repeated in header, hero, contact and a sticky mobile button
- **Accessibility:** skip link, visible focus states, labelled form fields, 4.5:1+ text contrast, reduced-motion support

## Handoff notes for WordPress
| Section in `index.html` | Suggested WP mapping |
|---|---|
| `.site-header` / `.site-footer` | Header and footer template parts |
| `.hero` | Hero block / custom block pattern |
| `.grid--3` cards | Query loop or reusable card pattern |
| `.steps` | Ordered list block with custom class |
| `.faq` | Accordion block (keeps `<details>` semantics) |
| `.contact .form` | Form plugin (replace `script.js` handling) |

- Colors, fonts and spacing live in `:root` at the top of `styles.css`. Change them there to re-skin the page
- No frameworks, no external requests, no images required: fast by default (add real images with `loading="lazy"` and explicit width/height)
- Headings follow a clean H1 > H2 > H3 order for SEO. `meta description` is set. `noindex` is set because this is a concept: remove it for production
- Fonts use the system stack (Georgia for headings). Self-host a web font if the brand requires one

## Run locally
Open `index.html` in a browser, or run `py -m http.server 8000` in this folder.

## Disclaimer
Fictional organisation, created for portfolio purposes only. Content is placeholder and is not legal advice.
