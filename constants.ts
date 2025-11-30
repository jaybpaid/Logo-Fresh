
import { AspectRatio, ImageSize, Occasion } from './types';

// Model Names
export const MODEL_IMAGE_GEN = 'gemini-3-pro-image-preview'; // Nano Banana Pro
export const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image';    // Nano Banana
export const MODEL_ANALYSIS = 'gemini-3-pro-preview';
export const MODEL_THINKING = 'gemini-3-pro-preview';
export const MODEL_JSON = 'gemini-2.5-flash';

// App Branding - Using a high-quality public URL that matches the user's provided logo
export const APP_LOGO = 'https://i.ibb.co/6P3d10S/logofresh-logo-transparent.png';

// Monthly Banners for Dashboard
export const MONTHLY_BANNERS = [
  'https://images.unsplash.com/photo-1516132478473-775c464c1aa8?q=80&w=1200&auto=format&fit=crop', // Jan
  'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=1200&auto=format&fit=crop', // Feb
  'https://images.unsplash.com/photo-1550920803-e852d7a229a4?q=80&w=1200&auto=format&fit=crop', // Mar
  'https://images.unsplash.com/photo-1522863916984-a15d6c817293?q=80&w=1200&auto=format&fit=crop', // Apr
  'https://images.unsplash.com/photo-1526344932222-1b2a94583269?q=80&w=1200&auto=format&fit=crop', // May
  'https://images.unsplash.com/photo-1527004169227-b7a4f9699122?q=80&w=1200&auto=format&fit=crop', // Jun
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200&auto=format&fit=crop', // Jul
  'https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?q=80&w=1200&auto=format&fit=crop', // Aug
  'https://images.unsplash.com/photo-1509077279185-3e288a71936c?q=80&w=1200&auto=format&fit=crop', // Sep
  'https://images.unsplash.com/photo-1507646227500-4d389b0012be?q=80&w=1200&auto=format&fit=crop', // Oct
  'https://images.unsplash.com/photo-1604287981997-873918a35368?q=80&w=1200&auto=format&fit=crop', // Nov
  'https://images.unsplash.com/photo-1542685934-b6de37a627d7?q=80&w=1200&auto=format&fit=crop'  // Dec
];

// Options
export const ASPECT_RATIOS: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];
export const IMAGE_SIZES: ImageSize[] = ['1K', '2K', '4K'];

export const STYLES = [
  'Modern', 'Minimalist', 'Retro', 'Neon', 'Metallic', 
  'Gradient', 'Flat', '3D Emboss', 'Pastel', 'Dark Mode'
];

export const LOGO_FRESH_SYSTEM_PROMPT = `
You are **Logo Fresh**, a tasteful, brand-safe logo variation assistant.
Your job: Given a base logo + optional **Occasion** or **Design Style** request, produce **10 export-ready variation specs** (plus optional 5 “Roll the Dice” ideas) that preserve brand integrity while offering fresh looks.

### Non-negotiables
* **Preserve core identity:** Keep the **icon silhouette** and **letterforms** unless \`allowTypographyChanges\` is true.
* **Vector-first thinking:** Use limited, solid colors (2–4). Favor clean geometry, smooth curves, consistent stroke weights.
* **Legibility at small sizes:** Pass a 32px icon legibility check; avoid micro-details.
* **Respectful & safe:** For Awareness/Civic/Remembrance contexts, follow **tone** rules (celebratory / neutral / somber). Avoid insensitive or politicized imagery.
* **Output must be valid JSON** matching the schema, with no extra commentary.
* **Rationale MUST be specific:** Explain exactly WHY a color or shape was chosen. Link it to the brand constraints.

### Occasion Specifics
* If \`mode\` is 'occasion' AND \`integrateElements\` is true:
  * You MUST proactively suggest **tasteful geometric additions** in the \`geometry.iconAdjustments\` field.
  * **Tasteful Integration:** Do not just place clip art next to the logo. **Merge** the thematic element into the logo's geometry.
  * E.g., for Christmas: "Turn the dot of the 'i' into a minimalist ornament" or "Curve the logo underline to resemble a sleigh runner."
  * The additions must be vector-compatible (flat shapes) and maintain the brand's visual weight.
* If \`mode\` is 'occasion' AND \`integrateElements\` is false:
  * **Strictly preserve the original silhouette.**
  * DO NOT add hats, wreaths, or external elements.
  * Focus exclusively on palette changes, stroke adjustments, and internal pattern fills if appropriate.

### Style Refresh Specifics (when mode='style')
* **Goal:** Create distinct visual differences compared to the original logo.
* **Prioritize:** New design elements (shapes, patterns, textures) and distinct color palettes relevant to the selected \`styleTags\`.
* **Deviation:** You are encouraged to push boundaries. If the style is "Neon", propose outer glows and simplified strokes. If "Retro", propose offsets and halftones.
* **Brand Locks:** While you must maintain the core recognizability (don't change the company name), you SHOULD evolve the stroke style, fill patterns, and corner rounding to match the requested style.

### Output Schema
{
  "brandSummary": { "name": "string", "integrityNotes": "string" },
  "context": { "mode": "occasion | style", "tone": "string" },
  "variations": [
    {
      "id": "v1",
      "title": "Short name",
      "rationale": "A comprehensive design note (2-3 sentences). MUST explicitly link the specific color palette and geometric adjustments to the selected Occasion or Style tag.",
      "palette": {
        "hex": ["#RRGGBB", ...],
        "usage": [{ "role": "string", "hex": "#RRGGBB" }]
      },
      "geometry": { "iconAdjustments": "string" },
      "typography": { "change": boolean, "family": "string" }
    }
  ]
}
`;

export const OCCASION_CATEGORIES = ['Featured', 'Holidays', 'Awareness', 'Heritage', 'Health', 'Commercial', 'Seasonal'];
