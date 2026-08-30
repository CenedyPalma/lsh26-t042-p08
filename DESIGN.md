# Design Specification: School Result Processing & GPA Engine (Monochrome Edition)

## Design Rationale & Identity
- **Product**: Apex Academy - School Result Processing & GPA Engine
- **Target Audience**: School Principals, Headmasters, Examination Officers, Subject Teachers, Academic Administrators.
- **Design Personality**: Pure, authoritative, editorial, high-contrast black-and-white monochrome aesthetic with extreme legibility and institutional weight.
- **Visual Approach**: Strict Black & White palette. Deep carbon black (`#09090b` / `#18181b`), pure white (`#ffffff`), and subtle neutral zinc shades (`#27272a`, `#71717a`, `#e4e4e7`, `#f4f4f5`).
- **Iconography**: 100% Lucide React icons. Zero emojis.
- **Typography Philosophy**: Powered by Google Font **Archivo** with variable width 100. Natural casing and natural letter-spacing (no artificial uppercase transformations, no harsh tracking classes) for a clean, sophisticated, authentic editorial feel.

---

## Token Specification (YAML)

```yaml
tokens:
  colors:
    brand:
      black_pure: "#000000"
      black_carbon: "#09090b"
      black_surface: "#18181b"
      gray_dark: "#27272a"
      gray_medium: "#71717a"
      gray_border: "#e4e4e7"
      gray_subtle: "#f4f4f5"
      white_pure: "#ffffff"
    neutral:
      bg_page: "#fafafa"
      bg_card: "#ffffff"
      border_subtle: "#e4e4e7"
      border_strong: "#27272a"
      text_primary: "#09090b"
      text_secondary: "#52525b"
      text_muted: "#71717a"
    monochrome_status:
      pass_bg: "#18181b"
      pass_text: "#ffffff"
      pass_border: "#27272a"
      fail_bg: "#ffffff"
      fail_text: "#09090b"
      fail_border: "#09090b"
      warning_bg: "#f4f4f5"
      warning_text: "#18181b"
      warning_border: "#d4d4d8"
      neutral_bg: "#f4f4f5"
      neutral_text: "#27272a"
      neutral_border: "#e4e4e7"
    grade_badges:
      aplus: { bg: "#09090b", text: "#ffffff", border: "#000000" }
      a: { bg: "#18181b", text: "#ffffff", border: "#27272a" }
      aminus: { bg: "#27272a", text: "#ffffff", border: "#3f3f46" }
      b: { bg: "#3f3f46", text: "#ffffff", border: "#52525b" }
      c: { bg: "#f4f4f5", text: "#18181b", border: "#d4d4d8" }
      d: { bg: "#e4e4e7", text: "#27272a", border: "#cbd5e1" }
      f: { bg: "#ffffff", text: "#000000", border: "#000000" }
  typography:
    font_family_sans: "'Archivo', sans-serif"
    font_family_mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    weights:
      light: 300
      regular: 400
      medium: 500
      semibold: 600
      bold: 700
      extrabold: 800
      black: 900
    classes:
      archivo_title: "font-family: Archivo; font-weight: 700; font-optical-sizing: auto; font-variation-settings: 'wdth' 100;"
      archivo_subtitle: "font-family: Archivo; font-weight: 600; font-optical-sizing: auto; font-variation-settings: 'wdth' 100;"
      archivo_regular: "font-family: Archivo; font-weight: 400; font-optical-sizing: auto; font-variation-settings: 'wdth' 100;"
      archivo_medium: "font-family: Archivo; font-weight: 500; font-optical-sizing: auto; font-variation-settings: 'wdth' 100;"
      archivo_bold: "font-family: Archivo; font-weight: 800; font-optical-sizing: auto; font-variation-settings: 'wdth' 100;"
  spacing:
    container_padding: "1.5rem"
    card_padding: "1.5rem"
    table_cell_padding: "0.75rem 1rem"
  borders:
    radius_sm: "6px"
    radius_md: "8px"
    radius_lg: "12px"
    radius_full: "9999px"
```
