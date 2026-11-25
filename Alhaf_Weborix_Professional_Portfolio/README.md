# Alhaf Weborix Technology — Multi-page Portfolio

A clean, editable-by-code, responsive portfolio starter. There is **no on-screen website editor**. Edit the HTML, CSS and JavaScript directly in VS Code.

## Pages
- `index.html` — Home page and footer
- `about.html` — About Me
- `projects.html` — Project cards and image placeholders
- `certificates.html` — Certificate image slots
- `cv.html` — Resume page with Print / Save as PDF
- `contact.html` — Email and WhatsApp buttons plus mailto contact form

## Run locally
1. Extract the ZIP.
2. Open this folder in VS Code.
3. Run `index.html` with Live Server (or open it in a browser).

## Main editing files
- `css/style.css` — colors, layout, responsive styles, animations and image placeholders.
- `js/main.js` — theme switch, mobile menu, rotating skills and contact form behavior.
- `js/config.js` — set your real email and WhatsApp number.
- Each HTML page — edit all page content, cards, technology names and links.

## Add your own images and logos
- Your portrait has intentionally been removed. The Home and About pages show image placeholders instead.
- Replace the placeholder block in `index.html` / `about.html` with your own `<img>` tag.
- Technology logo circles are placeholders. Put logo image files in `assets/` and replace each `.logo-circle` with an `<img>` element.
- Project screenshots and certificate scans have dedicated placeholder blocks. Add your images in `assets/` and update the relevant HTML.

## Dark / Light mode
The theme switch is available in the header on all pages. The selection is saved in the current browser using `localStorage`.

## Contact setup
Open `js/config.js` and update:
- `email`
- `whatsappNumber` in international format, digits only (Pakistan example format: 92XXXXXXXXXX)

The contact form uses `mailto:` to open the visitor's email application. It does not send or store messages on a server. For a production contact form, connect a backend or form service.

## CV
Update the details directly in `cv.html`, then choose **Download / Print PDF** and select “Save as PDF” in the print dialog.

## Before publishing
Confirm your official degree/university wording, course list, award title, project details, email and phone number. Replace all sample project/certificate content and placeholders with verified information.


## Latest requested layout updates
- The large Home hero photo/background placeholder has been removed; add your own page background image or CSS background when ready.
- A circular company-logo placeholder is now in the header beside the brand name/tagline on every page.
- The globe rotates clockwise.
- Home statistics cards now have visible gaps between them.
- The Light/Dark preference is stored once in browser `localStorage` and shared across all pages on the same website.
- The CV includes a circular photo placeholder.


## Home-only global theme control (latest update)
- The Light/Dark toggle appears only on `index.html` (Home).
- All other pages have no independent theme toggle.
- The selected theme is saved in `localStorage` under `awt-theme`.
- Every page reads that same setting when it opens, so navigation from Home keeps the selected theme site-wide.


## Theme fix (v4)
- The Home page is the only page with a Light/Dark switch.
- Theme is stored once as `awt-theme` and applied on the root HTML element for all pages.
- Every page applies the saved theme before the stylesheet paints, avoiding a dark flash.
- Added explicit light palette overrides for page backgrounds, cards, navigation, forms, and footer.
- Already-open tabs synchronize when the Home page theme changes.


## Home-controlled theme propagation (v5)
- Home is the only page with a theme toggle.
- The chosen `theme=light` or `theme=dark` is attached to every internal HTML page link.
- Each page reads that URL theme before loading its stylesheet, then applies the same CSS variables.
- This URL propagation also supports direct local-file previews where browser localStorage may not be shared consistently across separate HTML files.
- Use the Home page to switch themes, then navigate to About / Projects / Certificates / CV / Contact using the website links.


## Responsive update (November 2026)
- Added page-scoped responsive refinements for phone/tablet widths.
- Prevented horizontal overflow and improved mobile wrapping for the Home hero heading and content.
- Refined mobile header, navigation, hero layout, metrics, cards, forms, and resume layout.
- Made the six Home hero technology badges compact and arranged them in a three-column mobile grid; the desktop row remains compact.
- Removed the duplicate seventh Python badge from the Home hero.
- Kept the existing page-specific background image files and made their positioning/attachment responsive on small screens.
- Preserved the existing Globe and Orbit animation CSS and existing JavaScript behavior.
- Checked local HTML asset references, CSS brace balance, and JavaScript syntax. A full interactive browser test was not completed in this environment.


## November 2026 portfolio updates
- About page now displays the supplied Shorim Khan portrait in a responsive photo frame.
- The three Professional Values cards animate in and rotate through short statements related to web development, design and technology.
- Certificates page contains eight large, responsive certificate image cards.
- Add certificate scans to `assets/certificates/` as `certificate-01.jpg` through `certificate-08.jpg`, then edit the title/provider/date text in `certificates.html`.
- CV page includes a direct `Download CV` PDF link to `assets/Shorim_Khan_CV.pdf`; the print/save option remains available.
- The same supplied portrait is used in the CV preview.


## Final professional update — November 2026
- Preserved the existing multi-page website, shared styling, theme propagation, About portrait, background assets and original globe/orbit presentation.
- Projects page now uses a single featured-project slider with four project entries, 5-second autoplay, Previous/Next controls, navigation dots, and pause-on-hover/focus behavior.
- Project homepage links are intentionally unconfigured (`data-project-url=""`) until a real URL is supplied. Edit the URL in `projects.html`; the interface does not claim a placeholder is live.
- Certificates page contains exactly eight image slots. Add the original scans as `assets/certificates/certificate-01.jpg` through `certificate-08.jpg`; edit titles and issuers in `certificates.html`. No certificate scans were present in the supplied ZIP, so none were fabricated.
- CV HTML and `assets/Shorim_Khan_CV.pdf` were updated with the professional title, skills and five training/course entries supplied for this update. Existing education wording was retained for verification. No dates, grades, credential IDs, email address or phone number were invented.
- Existing profile photograph is retained on About and CV pages. Existing supplied technology/company images are reused in the relevant portfolio/project and certificates areas.
- Responsive refinements were added for the project slider, certificate cards and CV/print layout.
- To run: open the extracted project folder in VS Code and launch `index.html` with Live Server. The site remains an editable HTML/CSS/JavaScript project.
