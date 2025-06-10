# Style Guide & Accessibility

This guide provides styling conventions and important considerations for maintaining an accessible and visually appealing website.

## Table of Contents

1.  [Color Palette](#color-palette)
2.  [Typography](#typography)
3.  [Accessibility Considerations](#accessibility-considerations)
    *   [Color Contrast](#color-contrast)
    *   [Focus Indicators](#focus-indicators)
    *   [Semantic HTML](#semantic-html)
    *   [Image Alt Text](#image-alt-text)
4.  [CSS Variables](#css-variables)

## 1. Color Palette

The website uses CSS variables for theming, defined in `public/assets/css/theme.css`. When customizing colors, ensure they align with the brand identity while also meeting accessibility standards.

*   `--primary-color`: Main brand color, used for primary actions and highlights.
*   `--secondary-color`: Used for less prominent elements.
*   `--accent-color`: Used for specific highlights, calls to action, or active states.
*   `--background-color`: Main page background.
*   `--surface-color`: Background for cards, containers, etc.
*   `--text-color`: Main text color.
*   `--text-color-muted`: For less important text or secondary information.
*   `--link-color`: Default link color.
*   `--link-hover-color`: Link color on hover.
*   `--border-color`: For borders on elements.

## 2. Typography

Font families are defined using CSS variables in `public/assets/css/theme.css`:

*   `--font-family-base`: For general body text.
*   `--font-family-heading`: For headings (h1-h6).

Ensure chosen fonts are readable and scale well across devices. If using custom or Google Fonts, make sure they are correctly imported in all HTML files.

## 3. Accessibility Considerations

Creating an accessible website is crucial. Pay attention to the following:

### Color Contrast

*   **Importance:** Sufficient color contrast between text and its background is vital for users with visual impairments, including color blindness.
*   **WCAG Guidelines:** Aim for a contrast ratio of at least **4.5:1** for normal text and **3:1** for large text (18pt or 14pt bold).
*   **Tools for Checking Contrast:**
    *   WebAIM Contrast Checker: [https://webaim.org/resources/contrastchecker/](https://webaim.org/resources/contrastchecker/)
    *   Adobe Color Contrast Analyzer: [https://color.adobe.com/create/color-contrast-analyzer](https://color.adobe.com/create/color-contrast-analyzer)
    *   Browser developer tools often include contrast checking features.
*   **Dynamic Theming:** When changing theme colors in `theme.css`, always verify the new color combinations against contrast guidelines. This is especially important for text on colored backgrounds (e.g., buttons, header/footer text).

### Focus Indicators

*   **Importance:** Clear visual focus indicators are essential for keyboard-only users to understand which interactive element currently has focus.
*   **Styling:** The website uses `:focus-visible` CSS pseudo-class to provide distinct focus styles for links, buttons, and form inputs. These are defined in `public/assets/css/style.css`.
*   **Customization:** If you modify these styles, ensure the focus state is highly visible and distinct from the default and hover states. A common practice is to use a prominent outline or a change in background/border color. Avoid removing outlines without providing an alternative, equally clear focus indicator.

### Semantic HTML

*   Use HTML5 semantic elements correctly (e.g., `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<button>`). This helps assistive technologies understand the structure and purpose of content.

### Image Alt Text

*   All meaningful images must have descriptive `alt` attributes.
*   Decorative images should have an empty `alt=""` attribute.
*   The `main.js` script populates `alt` text for dynamically loaded images from `company-data.json`. Ensure the descriptions in the JSON file are meaningful.

## 4. CSS Variables

Leverage the CSS variables defined in `public/assets/css/theme.css` for all styling related to colors, fonts, and spacing where appropriate. This ensures consistency and makes theme updates easier.

---

By following these guidelines, you can create a website that is not only visually appealing and brand-aligned but also accessible to a wider range of users.