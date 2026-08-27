# S3 Console visual thesis

## Direction: neo-brutalist utility

S3 Console is a field instrument, not a cloud marketing site. Its visual language borrows from warehouse labels, flight cases, graph paper, and hand-marked inventory tabs: thick ink borders, offset shadows, square geometry, terse uppercase labels, and bright safety-color actions. The expressive connection screen gives way to a dense but calm workbench once connected. The result should feel portable, inspectable, and vendor-neutral.

## Palette

Light is the primary treatment because object inventories benefit from paper-like scanning. Dark is a full treatment selected from the top bar and persisted locally.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| paper / background | `#F3EEDF` | `#151817` | warm manifest paper / near-black equipment case |
| surface | `#FFFDF5` | `#202422` | working planes |
| ink / text | `#17201D` | `#F5F0DF` | high-contrast primary ink |
| muted | `#5D665F` | `#B9C0B8` | secondary copy (both ≥4.5:1) |
| line | `#17201D` | `#F5F0DF` | structural 2px rules |
| signal | `#C83216` | `#FF7757` | primary action / active location; deep safety orange meets text contrast in light mode |
| signal ink | `#FFFDF5` | `#151817` | action label |
| electric | `#B9F227` | `#C7FA44` | connected/success, selected utility |
| warning | `#F2B705` | `#FFD052` | incomplete or risky state |
| danger | `#C52D36` | `#FF767D` | destructive state |

Status is always paired with an icon or word, never color alone. There are no gradients.

## Type and spacing

Headings and utility labels use the locally shipped **Space Grotesk** variable font, whose squared counters fit storage identifiers. Data, paths, code, sizes, and form controls use **IBM Plex Mono**. Both are OFL and self-hosted as WOFF2 subsets. Scale: 12, 14, 16, 20, 28, and `clamp(36px, 7vw, 76px)`. Body text is at least 16px. A strict 4px base rhythm uses 8/12/16/24/32/48px steps. Workbench content has a 1440px cap; reading copy has a 68ch measure.

## Interaction grammar

- Buttons depress by losing their 3px offset shadow and translating 2px.
- The connected workbench is arranged as a manifest: endpoint rail → bucket index → object ledger → inspector.
- Selection uses a filled electric strip plus a text marker; focus uses a 3px signal outline with a 2px gap.
- Drawers originate from the right-side inspector. Dialogs are reserved for credential entry and confirmed destructive actions.
- On 390px screens, the rail becomes a compact top dock, inventories become stacked rows, and the inspector occupies the full viewport. Secondary columns drop their labels before data is removed.

## Motion policy

Transitions last 160–220ms and only animate opacity or transform: button press, inspector entrance, toast arrival, and progress fills. Nothing loops. With `prefers-reduced-motion: reduce`, transitions and smooth scrolling become instant; state still changes via border, copy, and position.

## Original asset plan and provenance

The connection screen uses one original generated still: a top-down, tactile still life of anonymous modular storage crates connected by orange cables on graph paper. It explains the product promise—one console connecting different stores—without depicting unsupported screens or brands. It is exported as responsive AVIF/WebP with explicit dimensions and stays below 300 KB.

Prompt sheet: “top-down editorial still life, four mismatched unbranded industrial storage crates and translucent data blocks, connected into one compact control terminal by vivid safety-orange cables, warm cream graph-paper workbench, black ink registration marks, lime status tabs, neo-brutalist utility product photography, hard noon shadows, tactile painted metal and recycled plastic, orthographic 50mm lens, limited cream charcoal orange acid-lime palette, clean negative space; no people, no text, no watermark, no logos, no recognizable brand, no gradient, no UI screenshot.”

Generated with Azure OpenAI image deployment `factory-image` on 2026-08-27. Original generation is retained in `assets/src/` with its prompt sidecar. Generated imagery is original for this product and disclosed in the footer.

Icons are original inline SVG line symbols authored for this interface (bucket, object, link, settings) using square caps and the same 2px rule. No third-party icon runtime is used.
