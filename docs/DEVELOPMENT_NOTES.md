
# Development Notes

This document provides some technical notes for developers working on or extending the "Brandable Static Site Generator" template.

## Project Structure

The project follows a standard static site structure:

*   **/public/**: Contains all deployable assets.
    *   **index.html, about.html, etc.:** Main HTML pages.
    *   **admin.html**: The admin panel interface.
    *   **assets/**:
        *   **css/**: Stylesheets.
            *   `theme.css`: Defines CSS variables for light/dark themes and base brand colors/fonts.
            *   `style.css`: Main structural and component styles for the public site.
            *   `admin-style.css`: Styles specifically for the admin panel.
            *   `animations.css`: Animation and hover effect styles.
            *   `responsive.css`: Media queries for responsive design.
        *   **js/**: JavaScript files.
            *   `main.js`: Core logic for fetching data from Firebase and populating public page content dynamically.
            *   `admin.js`: Logic for the admin panel, including Firebase Authentication, Firestore data management (CRUD), and AI content suggestions.
            *   `theme-switcher.js`: Handles dark/light mode toggle and saves preference to localStorage.
            *   `navigation.js`: Manages mobile navigation (hamburger menu) and smooth scrolling.
            *   `animations.js`: Implements page load and scroll-triggered animations using Intersection Observer.
            *   `testimonial-slider.js`: Logic for the testimonial slider component.
        *   **data/**:
            *   `company-data.json`: **(Historical/Reference)** Originally the central JSON file for all customizable text, image paths, and site settings. **With the Firebase admin panel, this file is no longer directly used by the live public site to load content.** It now primarily serves as a **schema reference** for the data structure managed in Firebase or as an example of initial data that could be entered into the admin panel.
        *   **images/**: Placeholder for company logo, hero images, service images, etc.
    *   **service-detail-example.html, blog-post-example.html**: Static examples of detail pages.
*   **/docs/**: Contains documentation files.
    *   `FIREBASE_SETUP.md`: Instructions for setting up the required Firebase project.
    *   `CUSTOMIZATION_GUIDE.md`: Instructions for users on how to customize content and form integrations via the admin panel.
    *   `STYLE_GUIDE.md`: Guidance on styling conventions and accessibility.
    *   `DEVELOPMENT_NOTES.md`: This file.
*   **README.md**: Main project overview and entry point.

## Dynamic Content Population (`main.js`)

*   **Data Source**: All website content is now fetched from **Firebase Firestore**. The specific document typically used is `siteContent/main_config` (constants defined in `main.js` and `admin.js`).
*   **Fetching**: `main.js` asynchronously fetches this data from Firestore on `DOMContentLoaded`.
*   **Global Content**: The `populateGlobalContent()` function updates elements common across all pages (e.g., logo, footer details, page titles).
*   **Page-Specific Content**: Functions like `populateHomePage()`, `populateAboutPage()`, etc., target specific elements (identified by IDs) on their respective pages and fill them with data from the corresponding sections of the fetched Firestore data. All pages are designed to have at least 8 distinct, manageable sections.
*   **[CompanyName] Placeholder**: A utility function `replacePlaceholders()` replaces instances of `[CompanyName]` and `[Address]` in text content with actual values from the Firestore data.

## Admin Panel (`admin.html` & `admin.js`)

*   **Authentication**: Firebase Authentication (Email/Password) is used to secure the admin panel.
*   **Data Management**: Admins can create, read, update, and delete website content, which is then saved to the Firestore document. The admin panel provides fields to manage content for all sections on all pages, including detailed content for services and blog posts.
*   **AI Suggestions**: Integrates with the Google Gemini API to provide content suggestions for various text fields. Requires a Gemini API Key.
*   **Structure**: The form in `admin.html` mirrors the data structure expected by the public site. `admin.js` handles the logic for populating this form from Firestore and collecting data from the form to save back to Firestore.

## Theming (`theme.css` & `theme-switcher.js`)

*   **CSS Variables**: `theme.css` defines a comprehensive set of CSS variables for colors and fonts. There are default (light theme) values in `:root` and overridden values in `body.dark-mode` for the dark theme. Theme colors (primary, secondary, accent) can be updated via the admin panel, which dynamically sets these CSS variables.
*   **Theme Toggle**: `theme-switcher.js` adds an event listener to the theme toggle button. It toggles the `dark-mode` class on the `<body>` element and stores the user's preference in `localStorage`.

## Animations (`animations.css` & `animations.js`)

*   **Page Load**: `animations.js` applies a class to the `<main>` element after a slight delay, triggering a fade-in/slide-up animation.
*   **Scroll-Triggered**: Uses `IntersectionObserver` to add an `.is-visible` class to elements with `.animate-on-scroll`, triggering CSS transitions.
*   **Hover Effects**: CSS transitions for hover effects on various elements.

## Navigation (`navigation.js`)

*   **Mobile Menu**: Toggles a `.nav-open` class for the mobile navigation overlay.
*   **Smooth Scrolling**: Implements smooth scrolling for on-page anchor links.

## Potential Future Enhancements

*   **Firebase Storage for Images**: Integrate Firebase Storage for easier image uploads directly from the admin panel, instead of requiring users to provide URLs.
*   **More Granular Admin Roles/Permissions**: If multiple admin users are needed with different levels of access.
*   **Markdown Support for Rich Text**: Implement a Markdown editor or parser for text areas like blog post content or service overviews in the admin panel, and render it as HTML on the public site.
*   **Version History/Rollbacks**: For content changes in Firestore (more advanced Firestore feature usage).
*   **Staging/Production Environments**: A more robust deployment workflow with separate Firebase projects or data for staging and production.

These notes should provide a good starting point for understanding the template's mechanics and potential areas for future development.
