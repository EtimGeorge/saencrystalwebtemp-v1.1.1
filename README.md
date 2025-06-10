
# Brandable Static Site Template

Welcome to the Brandable Static Site Template! This project provides a highly reusable website foundation built with HTML, CSS, and JavaScript, designed for quick deployment of professional, modern, and interactive static websites. Content and branding are managed through a Firebase-backed admin panel.

## Project Overview

The goal of this template is to allow different companies or individuals to quickly establish an online presence by customizing text, images, and branding colors. It features dynamic theming (light/dark mode), animations, interactive navigation, a multi-page structure with comprehensive manageable sections, and an admin panel for content management with AI-powered suggestions.

## Key Features

*   **Admin Panel**: Manage website content, branding, and theme colors through an easy-to-use interface at `public/admin.html`.
*   **Firebase Integration**: All website data is stored and managed in Firebase Firestore.
*   **AI Content Suggestions**: Get AI-powered suggestions for various text fields directly within the admin panel using the Google Gemini API.
*   **Multi-Page Structure**:
    *   Home Page (`index.html`) - 8+ manageable sections.
    *   About Us Page (`about.html`) - 8+ manageable sections.
    *   Services Page (`services.html`) - 8+ manageable sections.
    *   Contact Us Page (`contact.html`) - 8+ manageable sections.
    *   Blog Page (`blog.html`) - 8+ manageable sections.
    *   Service Detail Pages (via `service-detail-example.html`) - 8+ manageable content areas per service.
    *   Blog Post Detail Pages (via `blog-post-example.html`) - 8+ manageable sections per post.
*   **Dynamic Content**: All website content is dynamically loaded from Firebase Firestore.
*   **Dynamic Theming**:
    *   Light and Dark mode support, with user preference saved in `localStorage`.
    *   Theme colors are manageable via the admin panel and applied site-wide.
*   **Interactive Navigation**:
    *   Sticky header/navigation bar.
    *   Smooth scrolling for "Back to top" links.
    *   Active state indication for the current page.
    *   Mobile-responsive hamburger menu.
*   **Animations & Effects**:
    *   Subtle page load animations.
    *   Hover effects on buttons, links, and cards.
    *   Scroll-triggered animations for sections.
*   **Responsive Design**: Adapts to various screen sizes (desktop, tablet, mobile).
*   **Accessibility Focused**: Adherence to basic web accessibility standards (semantic HTML, ARIA attributes, focus indicators, contrast considerations).
*   **SEO Friendly**: Basic SEO meta tags and semantic HTML structure, with content populated dynamically.

## Technology Stack

*   **HTML5**: For semantic structure.
*   **CSS3**: For styling, layout (Flexbox/Grid), animations, and theming (CSS Variables).
*   **JavaScript (ES6+)**: For interactivity, DOM manipulation, theme switching, dynamic content loading from Firebase, and admin panel logic.
*   **Firebase**:
    *   **Firestore**: NoSQL database for content storage.
    *   **Authentication**: For securing the admin panel.
*   **Google Gemini API**: For AI content suggestions in the admin panel.

## Getting Started: Operation & Deployment Readiness

To make this website operational and ready for deployment, follow these crucial steps:

### 1. Firebase Project Setup
This is the most critical first step. Your website's content and admin access will be managed through Firebase.
*   **Follow the detailed instructions in**: [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md).
    *   This guide will walk you through:
        *   Creating a Firebase project.
        *   Adding Firebase to your web app and obtaining your `firebaseConfig` object.
        *   Enabling Firebase Authentication (Email/Password method).
        *   Enabling Cloud Firestore and setting it to **production mode**.
        *   Configuring essential **Firestore Security Rules**.

### 2. Configure API Keys & Firebase Connection

Once your Firebase project is set up:

*   **Firebase Configuration:**
    1.  You obtained a `firebaseConfig` object during the Firebase setup (Step 1.2 of `FIREBASE_SETUP.md`).
    2.  Open `public/assets/js/admin.js`. Replace the placeholder `firebaseConfig` object at the top with **your actual Firebase project configuration**.
    3.  Open `public/assets/js/main.js`. Replace the placeholder `firebaseConfig` object at the top with the **same actual Firebase project configuration**.
    *   **Example of where to paste (YOURS WILL BE DIFFERENT):**
        ```javascript
        // In admin.js and main.js
        const firebaseConfig = {
          apiKey: "AIzaSyYOUR_UNIQUE_API_KEY_HERE", // Replace
          authDomain: "your-project-id.firebaseapp.com", // Replace
          projectId: "your-project-id", // Replace
          storageBucket: "your-project-id.appspot.com", // Replace
          messagingSenderId: "123456789012", // Replace
          appId: "1:123456789012:web:youruniqueappid" // Replace
        };
        ```

*   **Google Gemini API Key (for AI Content Suggestions):**
    1.  The AI content suggestion feature in the admin panel uses the Google Gemini API.
    2.  Obtain an API key for the Gemini API from [Google AI Studio](https://aistudio.google.com/app/apikey).
    3.  Open `public/assets/js/admin.js`.
    4.  Find the line: `const apiKey = globalThis?.process?.env?.API_KEY || "YOUR_API_KEY_HERE";`
    5.  Replace `"YOUR_API_KEY_HERE"` with your actual Google Gemini API Key.
        ```javascript
        // In admin.js
        const apiKey = globalThis?.process?.env?.API_KEY || "YOUR_GEMINI_API_KEY"; // Replace "YOUR_GEMINI_API_KEY"
        ```
    6.  **Security Note:** Placing API keys directly in client-side JavaScript is generally not recommended for production environments if the key has broad permissions or billing implications. For this template's AI feature (which is typically on an admin-only, authenticated page), it's a simpler setup. For higher security, consider using a backend proxy to make API calls or ensure the admin panel is not publicly accessible. The current setup assumes the `admin.html` page itself is access-controlled or deployed in a trusted environment.

### 3. Admin Panel: Setup & Content Management

1.  **Access Admin Panel:** Open `public/admin.html` in your browser.
2.  **Create Admin User (First Time):**
    *   Use the email and password fields and click "**Sign Up**". This creates your first admin user in Firebase Authentication.
3.  **Login:** Use your admin credentials to log in.
4.  **Manage Content:**
    *   The admin panel form allows you to edit all website content: general company details, theme colors, social media links, and detailed content for each page (Home, About, Services, Blog, Contact, individual Service Detail pages, and individual Blog Post Detail pages). Each page has numerous sections that are fully manageable.
    *   **Image URLs:** Upload your images to a suitable location (e.g., `public/assets/images/` or a cloud storage service) and enter the correct relative or absolute URL in the image fields.
    *   **AI Content Suggestions:** Use the "Suggest with AI ✨" buttons next to text areas for content ideas (requires Gemini API Key to be configured). Ensure "Company Niche" is filled for better suggestions.
    *   **Save Changes:** Click "**Save All Changes**". Data is saved to Firebase Firestore. The public site will reflect changes on next load/refresh.

### 4. View Public Site

*   Open `public/index.html` (and other public HTML files) in your browser.
*   The site will now load all its content dynamically from your configured Firebase project.
*   It's recommended to use a local web server for development to avoid potential issues with `file:///` paths. Many simple HTTP servers are available (e.g., `npx serve ./public`).

## Customization & Further Details

For more in-depth information:

*   **Full Setup & Customization**: [`docs/CUSTOMIZATION_GUIDE.md`](docs/CUSTOMIZATION_GUIDE.md) - *This guide details all manageable fields in the admin panel.*
*   **Firebase Setup Deep Dive**: [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md)
*   **Styling & Accessibility**: [`docs/STYLE_GUIDE.md`](docs/STYLE_GUIDE.md)
*   **Developer Notes**: [`docs/DEVELOPMENT_NOTES.md`](docs/DEVELOPMENT_NOTES.md)

**Note on `company-data.json`**: The file `public/assets/data/company-data.json` is no longer directly used by the live website for content. All content is fetched from Firebase. This JSON file now serves as a **structural reference** for the data managed in the admin panel and can be helpful for understanding the expected data schema or for initial manual data input if needed (though the admin panel is the primary tool).

## Deployment

This website is a collection of static files (HTML, CSS, JS, images) that dynamically load data from Firebase. It can be deployed on any static hosting provider.

**Popular Static Hosting Providers:**

*   Netlify
*   Vercel
*   GitHub Pages
*   AWS S3
*   Firebase Hosting (Recommended for seamless integration)
*   Cloudflare Pages

**General Deployment Steps:**

1.  Ensure your Firebase project is correctly set up and security rules are in place.
2.  Confirm your Firebase configuration in `public/assets/js/admin.js` and `public/assets/js/main.js` points to your **production Firebase project**.
3.  Verify your Gemini API key setup in `admin.js` is secure and appropriate for your deployment environment.
4.  Upload the entire contents of the `public/` directory to your chosen hosting provider.
5.  If using Netlify Forms for the contact page, Netlify will automatically detect your form. Ensure the Formspree endpoint in the admin panel's contact page settings is either cleared or correctly points to your chosen service.

## Contributing

This template is designed as a starting point. Feel free to extend, modify, or improve it.

---

Enjoy building your brandable website!
