# KodNest Premium Build System

A premium SaaS design system. Calm, intentional, coherent, confident. Not flashy, not loud, not playful.

## Design philosophy

- **Calm, Intentional, Coherent, Confident**
- No gradients, glassmorphism, neon, or animation noise
- One mind: no visual drift

## Color system (4 only)

| Role      | Token     | Value    |
|-----------|-----------|----------|
| Background| `--kn-bg` | `#F7F6F3`|
| Text      | `--kn-text` | `#111111` |
| Accent    | `--kn-accent` | `#8B0000` |
| Success   | `--kn-success` | muted green |
| Warning   | `--kn-warning` | muted amber |

## Typography

- **Headings:** Serif (`Georgia`), large, confident, generous spacing
- **Body:** Sans-serif, 16–18px, line-height 1.6–1.8, max width 720px for text blocks
- No decorative fonts, no random sizes

## Spacing scale

Use only: **8px, 16px, 24px, 40px, 64px**

- `--kn-space-xs`: 8px  
- `--kn-space-sm`: 16px  
- `--kn-space-md`: 24px  
- `--kn-space-lg`: 40px  
- `--kn-space-xl`: 64px  

## Global layout

Every page follows:

1. **Top Bar** — Project name (left), Progress “Step X / Y” (center), Status badge (right)
2. **Context Header** — Large serif headline, one-line subtext, clear purpose
3. **Primary Workspace (70%)** — Main interaction; clean cards, predictable components
4. **Secondary Panel (30%)** — Step explanation, copyable prompt, actions (Copy, Build in Lovable, It Worked, Error, Add Screenshot)
5. **Proof Footer** — Checklist: UI Built, Logic Working, Test Passed, Deployed (each with proof input)

## Components

- **Primary button:** Solid deep red (`--kn-accent`)
- **Secondary button:** Outlined, same hover and radius
- **Inputs:** Clean borders, no heavy shadows, clear focus state
- **Cards:** Subtle border, no drop shadows, balanced padding
- **Transitions:** 150–200ms, ease-in-out, no bounce, no parallax

## Error & empty states

- **Errors:** Explain what went wrong and how to fix; never blame the user
- **Empty:** Provide next action; never feel dead

## Files

- `css/tokens.css` — Design tokens (colors, spacing, typography, transitions)
- `css/base.css` — Reset, body, typography base
- `css/layout.css` — Top bar, context header, workspace, panel, proof footer
- `css/components.css` — Buttons, inputs, cards, badges, copy box
- `css/states.css` — Error and empty state styles
- `css/main.css` — Single import for all layers
- `index.html` — Design system demo (layout + components only; no product features)

## Usage

Link `css/main.css` and use the class names and structure above. Keep spacing and colors to the token scale so the system stays coherent.
