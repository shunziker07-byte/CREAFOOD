---
name: Obsidian Luxe
colors:
  surface: '#131318'
  surface-dim: '#131318'
  surface-bright: '#39383e'
  surface-container-lowest: '#0e0e13'
  surface-container-low: '#1b1b20'
  surface-container: '#1f1f25'
  surface-container-high: '#2a292f'
  surface-container-highest: '#35343a'
  on-surface: '#e4e1e9'
  on-surface-variant: '#e3bdc7'
  inverse-surface: '#e4e1e9'
  inverse-on-surface: '#303036'
  outline: '#aa8891'
  outline-variant: '#5b3f47'
  surface-tint: '#ffb0c9'
  primary: '#ffb0c9'
  on-primary: '#650034'
  primary-container: '#ff4898'
  on-primary-container: '#58002d'
  inverse-primary: '#b90064'
  secondary: '#eeb8c7'
  on-secondary: '#492631'
  secondary-container: '#653e4a'
  on-secondary-container: '#dfaab8'
  tertiary: '#d6c5a2'
  on-tertiary: '#392f17'
  tertiary-container: '#9e8f70'
  on-tertiary-container: '#322811'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd9e2'
  primary-fixed-dim: '#ffb0c9'
  on-primary-fixed: '#3e001e'
  on-primary-fixed-variant: '#8e004b'
  secondary-fixed: '#ffd9e2'
  secondary-fixed-dim: '#eeb8c7'
  on-secondary-fixed: '#30111c'
  on-secondary-fixed-variant: '#623b47'
  tertiary-fixed: '#f3e1bd'
  tertiary-fixed-dim: '#d6c5a2'
  on-tertiary-fixed: '#231a05'
  on-tertiary-fixed-variant: '#51452b'
  background: '#131318'
  on-background: '#e4e1e9'
  surface-variant: '#35343a'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 20px
  card-padding: 16px
  widget-padding: 14px
  stack-gap: 12px
  grid-gap: 10px
  element-margin: 8px
  tight-margin: 4px
---

## Brand & Style

The design system embodies a **Digital Luxury Boutique** aesthetic, moving away from generic SaaS or gaming visuals toward a high-end, editorial dashboard experience. The personality is focused, sophisticated, and energetic, defined by "Luxury Restraint"—where every element serves a functional purpose within a premium atmosphere.

The style leverages **Functional Glassmorphism** and **Minimalism**. It uses deep obsidian tones, fine hairlines, and strategic fuchsia and sand-gold accents to create a sense of exclusivity and precision. The emotional response should be one of "calm focus" mixed with "premium motivation," suitable for high-performance routines and lifestyle curation.

**Design Principles:**
- **Singular Accent:** Fuchsia is reserved strictly for action, progression, and active states.
- **Warm Contrast:** A new Tertiary Sand-Gold provides a sophisticated counterpoint to the cool obsidian and vibrant fuchsia.
- **Restrained Depth:** Visual hierarchy is managed through exactly three levels of elevation.
- **Atmospheric Lighting:** Depth is conveyed via subtle glows and semi-transparent overlays rather than traditional heavy shadows.

## Colors

The palette is a high-contrast "Midnight" theme. The primary background (`#0A0A0F`) provides a deep canvas for the fuchsia accent to vibrate against.

**Color Application:**
- **Primary (Fuchsia):** Used for CTAs, active navigation states, and data completion. Never used as a large background fill.
- **Secondary (Rose-Champagne):** Utilized for secondary icons and the terminal end of progress bar gradients to soften the visual impact.
- **Tertiary (Sand-Gold):** Introduced as `#E8D6B3` for high-end decorative elements, premium badges, or specific "achievement" states to elevate the boutique feel.
- **Neutral:** A range of deep blacks and slate-grays for surfaces, with muted lavenders for secondary text to maintain a "cool" luxury temperature.
- **Surface Overlays:** Glass effects are achieved using `rgba(255, 255, 255, 0.04)` for standard components and `0.06` for active states.

## Typography

This system uses a modern, geometric sans-serif stack (Hanken Grotesk). The typographic hierarchy is strictly sentence-case to maintain a contemporary, approachable luxury feel—avoiding all-caps which can feel too aggressive for a personal routine app.

**Key Stylistic Rules:**
- **Numerics:** Use the same font weight as headlines for data points (e.g., score values) to ensure they feel integrated into the design.
- **Micro-copy:** Smallest labels (`11px`) should have slightly increased letter spacing to ensure legibility on dark backgrounds.
- **Line Heights:** Generous line heights are used for body text to promote readability and "breathing room" in the layout.

## Layout & Spacing

The layout follows a precise **4px/8px rhythm**, ensuring mathematical harmony across all components.

- **Layout Model:** Primarily a fixed-width mobile approach (max-width: 380px) that expands into a multi-column grid on larger screens.
- **Grid Strategy:** A 2-column utility grid for widgets (like Gym or To-do cards) creates a compact, information-dense but organized interface.
- **Breathing Room:** Outer container padding is fixed at `20px` to create a "frame" for the content, enhancing the boutique feel. Vertical rhythm is maintained with an `18px` margin after titles to separate header information from primary actions.

## Elevation & Depth

This design system rejects traditional drop shadows in favor of **Tonal Layers** and **Glows**. Depth is communicated through background opacity shifts and border illumination.

1.  **Level 1 (Base):** Background `#0A0A0F`. Flat, no borders. Used for the application foundation.
2.  **Level 2 (Standard Card):** Surface `rgba(255, 255, 255, 0.04)` with a `12px` backdrop blur. Enclosed by a `1px` border of `rgba(255, 255, 255, 0.08)`. This is the default state for content modules.
3.  **Level 3 (Active/Interactive):** Surface `rgba(255, 255, 255, 0.06)` with a `1px` border of `rgba(255, 31, 143, 0.25)` (accent color). A soft fuchsia glow (`0 0 24px rgba(255, 31, 143, 0.08)`) is applied to pull the element toward the user.

## Shapes

The shape language is sophisticated and heavily rounded, creating a tactile "soft-glass" feel.

- **Main Cards & Containers:** Use a `20px` radius to establish a friendly yet modern structure.
- **Secondary Cards:** Use a `16px` radius to fit within primary containers.
- **Buttons:** Fixed at `12px` to provide a distinct interactive shape that contrasts with the larger container rounds.
- **Progress Elements:** Use fully rounded (`pill`) ends for tracks and fills.

## Components

### Buttons
- **Primary:** Solid Fuchsia (`#FF1F8F`) background with white text. Apply a subtle fuchsia glow on hover.
- **Secondary:** Transparent background with a `1px` border of `rgba(255, 255, 255, 0.12)`. On hover, transition the border to a muted fuchsia.
- **Tertiary:** Sand-Gold (`#E8D6B3`) is used for premium or "exclusive" action buttons.

### Progress Bars
- **Track:** `6px` height, background `rgba(255, 255, 255, 0.06)`.
- **Fill:** Gradient from Primary Fuchsia to Rose-Champagne.

### Cards
- Standard cards use Elevation Level 2.
- Interactive cards (Daily Score, active tasks) use Elevation Level 3 with a themed border.

### Inputs
- Background `rgba(255, 255, 255, 0.03)` with a subtle border. Focus state triggers a solid fuchsia border and an internal glow.

### Navigation
- Bottom-aligned navigation with a glassmorphism background. Active items are indicated by fuchsia text and a small `50%` rounded dot indicator.
