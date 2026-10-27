# Buderus EDS target — initial inventory and migration state

**Inventory date:** 2026-10-25  
**Validation update:** 2026-10-26  
**Source page:** <https://www.buderus.de/de>  
**User-provided target:** GitHub `mica1973/buderus`; DA `https://content.da.live/mica1973/buderus`; preview `https://main--buderus--mica1973.aem.page/`; live `https://main--buderus--mica1973.aem.live/`.

## Target and integration state

- `https://github.com/mica1973/buderus` exists; `main` starts at `b49601e` (`chore: cleanup repository template`). It is the AEM boilerplate scaffold: `blocks/{cards,columns,footer,fragment,header,hero,widget}`, standard scripts/styles, no importer tooling and no code-side `content/` directory. A Studio feature worktree `feat/buderus-shell-polish` was created from this base.
- Before the content migration, `https://main--buderus--mica1973.aem.page/` returned 404. After DA documents were updated and previewed, the root and `/index.plain.html`, `/nav.plain.html`, `/footer.plain.html` returned HTTP 200. The page pipeline generated responsive image variants for the public source-image URLs.
- The supplied EDS Admin config URL `https://admin.hlx.page/sidekick/mica1973/buderus/main/config.json` returns HTTP 401 from this environment. User-provided information states DA is the source; this mapping is not independently confirmed from the Admin config. The DA `/config` sheet UI exists but its data sheet is blank.
- EMA's `get_current_site` reports `mica1973/viega`. The attempted switch to Buderus failed with “No GitHub access configured in the workspace”. No EMA migration/push call was made while EMA remained loaded on Viega. The GitHub MCP and local clone can read the Buderus repo, but that does not make EMA point at Buderus.
- DA MCP initially returned 401 despite its stored “signed in” state. After a DA browser sign-in and one fresh DA-MCP OAuth sign-in, Source API list/read/update/preview succeeded. This is a verified recovery path for this workspace, not proof that every 401 is merely an expired login.

## Source-page findings

- The source responds HTTP 200, declares `lang="de-DE"`, and has title “Buderus - Systemlösungen für Heizung, Solar, Wärmepumpen”. Its shared header contains the Buderus logo, utility destinations (offer, installer search, industry), customer-mode links, MyBuderus, “Alle Themen”, Products, Advice, Climate/funding, AskBuderus and search. The search form uses GET `/de/suche` with `query`.
- The upper carousel contains six slides (MyBuderus/Systemgarantie, offer request, heat-pump webinar, Beratungsexzellenz, in-person consultation, Meet.Buderus). Each slide has a public Buderus image, German copy and CTA.
- The main page includes one lead H1 (“Moderne Heizsysteme für heute und morgen.”), fraud-call notice, product overview, offer CTA, market segments, advice tools, heat-pump products, gas comparison, action cards, news/highlights, guides, press CTA, service/contact cards, testimonials and hotline.
- The source footer has four groups: Service, Kontakt, Unternehmen, and social channels, plus copyright, cookie preferences, and inclusive-language copy. Cookie-preference behavior is delivered by source-site JavaScript (`showDockPrivacySettings()`); that behavior is not reproduced in EDS.
- These are observations from the live page DOM/screenshot, not from EMA catalog output. Source interactions include dynamic mega menus, AskBuderus, search, floating contact links, a lead-form iframe, galleries and a rotating carousel; do not claim they are all reimplemented.

## DA content state and changes

- Initial DA listing contained exactly `index.html`, `nav.html`, and `footer.html`, all boilerplate samples: generic Adobe starter navigation with `noindex`, Adobe legal/footer links, and the boilerplate welcome homepage with generic metadata. No DA metadata/placeholder/query/redirect sheets or shared media were listed at the repository root.
- Before replacement, DA versions were checkpointed for all three documents. `nav.html` now has the German Buderus utility/menu links; `footer.html` has the source's four footer groups and legal/language copy; `index.html` has the German homepage content, six-slide banner, page metadata and main service/product sections.
- The three documents were previewed in DA (not published). Unmigrated destinations in the nav/footer/body deliberately point to the original `www.buderus.de` site, rather than to EDS paths that do not exist yet. Cookie preferences are described but not wired to an unavailable source-only JavaScript API.

## Code worktree and quality state

- Local code changes are isolated on `feat/buderus-shell-polish`; no code has been pushed and nothing was published to `.aem.live`.
- The feature adds an accessible carousel/banner block, updates header/nav behavior and styling, styles the source footer, applies the German page language and Buderus design tokens, and adds a code-bus wordmark SVG. `scripts/aem.js` is untouched.
- `npm ci` completed; it reported 9 dependency audit findings (1 low, 2 moderate, 6 high). `npm run lint`, `git diff --check`, and XML parsing of `icons/buderus.svg` passed after the final implementation changes.
- The local `@adobe/aem-cli up` preview runs at `http://localhost:3340/` against the previewed DA content. The document, styles/scripts, header/footer fragments, Buderus logo, fonts, and banner images loaded successfully. The original shell check was clean; after adding Brand Concierge, its conversation request to `https://edge.adobedc.net/brand-concierge/va7/conversations` returned HTTP 400 in local preview (see below).
- Compared the live source and local build at 1440px: the hero uses the same image/content, the banner text panel measures 792×367px (close to the source panel), and the lead H1 starts at x=120/y=893 vs source x=118/y=896. The header/menu, six-slide controls, utility links, and search form were inspected; dropdown and search open, and Escape closes the open menu.
- Fine-tuned the shared shell against the live source DOM at 1440px: the logo tile is 144×144 at x=40 and the wordmark is 144×21; on scroll the metadata row and breadcrumb collapse, leaving a 56px sticky bar with a 100×100 tile. The “Alle Themen” panel now uses the authored category list and four menu groups in a dark full-width panel. The footer matches the source color and 4-column geometry (1284px container, 650px outer height), with print/back-to-top actions and decorative, aria-hidden social SVGs.
- Brand Concierge is injected as a bottom-right launcher and opens a floating panel. Its styling configuration is based on the user-supplied file and uses Buderus colors, German labels, and Buderus privacy/legal links. The launcher/panel render locally; focus moves to Close on open, Escape closes and restores focus, and the launcher is bottom-right at desktop (864×953) and mobile (390×844). The configured company SVG is valid XML. No Concierge scripts are requested on the default no-consent route.
- Important: `scripts/consent-check.js` is a fail-closed placeholder, not a production CMP. The local launcher is visible independently; Concierge vendor scripts remain unloaded unless a real CMP dispatches `consent.update` with `consented: true`. The former query-string consent override was removed. Earlier local testing with that override showed Alloy return HTTP 200 and the Concierge UI initialize, but the conversation service returned HTTP 400 on repeated requests. The cause is unknown and requires checking the production datastream/agent/origin configuration; no successful conversational reply was verified.
- At 390px, the banner stacks its image, controls and copy like the source mobile treatment; the header is 56px plus a 44px breadcrumb, with a 48×48 logo tile at x=20/y=4 and source-aligned quick-action icons. The mobile page has no horizontal overflow. Mobile menu and “Alle Themen” submenu were opened, and Escape closed the submenu and menu.
- Footer heading/list pairs now render as four desktop columns, two at tablet widths and one on mobile; the 390px page has no horizontal overflow. The homepage title, German locale, description and OG metadata were verified; one H1 remains, the flattened metadata labels do not display, and citation wrappers are normalized.
- No PageSpeed/Lighthouse score has been measured. The desktop/mobile layout checks are not a 100-point performance audit; do not claim the 100-point goal without a Lighthouse/PageSpeed run.

## Acceptance criteria

- Keep the home path in German (`de-DE`), with one H1; provide source-aligned responsive utility/primary navigation and accessible dropdowns/search.
- Render all six carousel slides with image/title/copy/CTA, manual controls, keyboard support, pause behavior, and no autoplay when reduced motion is requested; reserve image size and prioritize only the first slide.
- Render the four source footer link/social groups and legal/language copy. The site-local demo only migrates the supplied homepage, so other page destinations remain explicit source-domain links.
- At desktop and mobile, header, banner and footer remain legible, keyboard-operable and free of horizontal overflow; images and console requests must be checked in the local browser.
- The Brand Concierge must not load before consent, must be operable from the lower-right launcher (including Escape and focus restoration), and must complete a real conversation on the configured preview/production origin. The final criterion remains unverified because the local conversation API returned HTTP 400 and the current consent gate is only a stub.
- Verify final code with `npm run lint` and `git diff --check`; compare source and EDS screenshots at equal viewports. Report only checks actually completed.

## Primary references

See [EDS/DA working knowledge](../eds-da-knowledge.md) for the cited EDS, DA/Experience Workspace, Admin API, performance and EMA sources. The main EDS flow is backend `.plain.html` → decorate HTML sections/blocks → DA preview → code/content releases separately; current source documentation takes precedence over old template assumptions.
