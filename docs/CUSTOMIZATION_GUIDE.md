
# Website Customization & Operation Guide

This guide provides comprehensive step-by-step instructions on how to set up, customize, and operate your brandable static website using the Firebase-backed admin panel.

## Table of Contents

1.  [**Prerequisites: Essential Setup (MANDATORY)**](#prerequisites-essential-setup)
    *   [1.1. Firebase Project Setup](#11-firebase-project-setup)
    *   [1.2. API Key & Firebase Configuration in Code](#12-api-key--firebase-configuration-in-code)
    *   [1.3. Google Gemini API Key for AI Suggestions](#13-google-gemini-api-key-for-ai-suggestions)
2.  [**Admin Panel: Your Content Hub**](#admin-panel-your-content-hub)
    *   [2.1. Accessing the Admin Panel](#21-accessing-the-admin-panel)
    *   [2.2. Creating Your Admin Account (First Time)](#22-creating-your-admin-account-first-time)
    *   [2.3. Logging In](#23-logging-in)
    *   [2.4. Navigating the Admin Form](#24-navigating-the-admin-form)
    *   [2.5. Managing Content & Branding (Field by Field)](#25-managing-content--branding-field-by-field)
        *   [General Settings](#general-settings)
        *   [Contact Details](#contact-details)
        *   [Social Media Links](#social-media-links)
        *   [Theme Customization](#theme-customization)
        *   [Home Page Content](#home-page-content)
        *   [About Page Content](#about-page-content)
        *   [Services Page & Service Details](#services-page--service-details)
        *   [Blog Page & Blog Posts](#blog-page--blog-posts)
        *   [Contact Page Content](#contact-page-content)
    *   [2.6. Using AI Content Suggestions](#26-using-ai-content-suggestions)
    *   [2.7. Saving Your Changes](#27-saving-your-changes)
3.  [**Managing Images**](#3-managing-images)
4.  [**Contact Form Setup**](#4-contact-form-setup)
5.  [**Advanced: Modifying CSS Themes**](#5-advanced-modifying-css-themes)
6.  [**Advanced: Adding/Modifying Pages**](#6-advanced-addingmodifying-pages)
7.  [**Deployment**](#7-deployment)

---

## 1. Prerequisites: Essential Setup (MANDATORY)

Before you can use the website or the admin panel, you **must** complete the following setup steps.

### 1.1. Firebase Project Setup

Your website's data (all content, branding, etc.) and admin user accounts are managed through Firebase.

*   **Action**: Follow the **entire** [`docs/FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) guide.
    *   This includes:
        1.  Creating a Firebase project.
        2.  Adding Firebase to your web app (make sure to **copy your `firebaseConfig` object**).
        3.  Enabling Firebase Authentication (Email/Password method).
        4.  Enabling Cloud Firestore (Database) in **production mode**.
        5.  Configuring Firestore Security Rules as specified in the guide.

**Do not proceed until your Firebase project is fully set up as per the `FIREBASE_SETUP.md` guide.**

### 1.2. API Key & Firebase Configuration in Code

You need to tell your website's code how to connect to *your* Firebase project.

1.  **Locate your Firebase Configuration (`firebaseConfig`):** You copied this during Step 2.2 of the `FIREBASE_SETUP.md` guide. It looks like this (your values will be different):
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      // ... and other keys
    };
    ```
2.  **Update `public/assets/js/main.js` (for the public site):**
    *   Open this file.
    *   At the very top, find the placeholder `firebaseConfig`.
    *   **Replace the entire placeholder object with your actual `firebaseConfig` object.**
3.  **Update `public/assets/js/admin.js` (for the admin panel):**
    *   Open this file.
    *   At the very top, find the placeholder `firebaseConfig`.
    *   **Replace the entire placeholder object with your actual `firebaseConfig` object (the same one used in `main.js`).**

    **Save both files after pasting your configuration.**

### 1.3. Google Gemini API Key for AI Suggestions

The admin panel offers AI-powered content suggestions using the Google Gemini API.

1.  **Get a Gemini API Key:**
    *   Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Sign in with your Google account.
    *   Create a new API key if you don't have one already. Copy this key securely.
2.  **Add Key to `admin.js`:**
    *   Open `public/assets/js/admin.js`.
    *   Find this line (near the top, after Firebase initialization):
        ```javascript
        const apiKey = globalThis?.process?.env?.API_KEY || "YOUR_API_KEY_HERE";
        ```
    *   **Replace `"YOUR_API_KEY_HERE"` with your actual Google Gemini API Key.**
        ```javascript
        // Example:
        const apiKey = globalThis?.process?.env?.API_KEY || "AIzaSyYOUR_GEMINI_API_KEY_ACTUALLY_HERE";
        ```
    *   Save the file.
    *   **Security Note**: This method places the API key in client-side code. For the admin panel (which should be access-controlled), this is a simpler setup. If high security for this key is paramount, consider routing API calls through a secure backend proxy. The template assumes the admin panel itself is not publicly exposed without authentication. If the key is missing or incorrect, AI features will not work.

**Once these prerequisites are met, your website is ready for content management and viewing!**

---

## 2. Admin Panel: Your Content Hub

The admin panel (`public/admin.html`) is where you'll manage all your website's content, branding, and theme settings.

### 2.1. Accessing the Admin Panel

*   Open the file `public/admin.html` in your web browser.
    *   If developing locally, this might be `http://localhost:PORT/admin.html` (if using a local server) or by directly opening the file via `file:///path/to/your/project/public/admin.html`.

### 2.2. Creating Your Admin Account (First Time)

If this is your first time accessing the admin panel after setting up Firebase:

1.  On the login screen, enter the **email address** and a **strong password** you want to use for your admin account.
2.  Click the "**Sign Up**" button.
3.  This will create a new user in your Firebase Authentication. You will then be automatically logged in.

### 2.3. Logging In

For subsequent visits:

1.  Enter your admin email and password.
2.  Click the "**Login**" button.

If you forget your password, you can use the "Forgot password?" link that Firebase Authentication typically provides, or manage users directly in the Firebase console (Authentication > Users).

### 2.4. Navigating the Admin Form

Once logged in, you'll see a comprehensive form divided into sections using `<fieldset>` elements. Each fieldset corresponds to a part of your website or a specific page.

*   **Status Messages:** At the top of the form, a status message area (`#adminStatusMessage`) will show feedback (e.g., "Loading content...", "Data saved successfully!", or any errors).
*   **Saving:** The "**Save All Changes**" button is at the very bottom of the form.

### 2.5. Managing Content & Branding (Field by Field)

Here's a breakdown of the sections and fields:

#### General Settings
*   **Company Name:** Your official company or brand name. Used globally (e.g., in the header, footer, page titles).
*   **Company Niche/Industry:** A brief description of your company's field (e.g., "SaaS for small businesses," "Sustainable fashion retail," "Healthcare technology"). **This is very important context for AI suggestions.**
*   **Tagline:** Your company's main slogan or tagline. (AI suggestions available ✨)
*   **Logo URL:** The path or URL to your company's logo image (see [Managing Images](#3-managing-images)). Example: `assets/images/my-logo.png`.

#### Contact Details
*   **Email:** Your primary contact email address.
*   **Phone:** Your primary contact phone number.
*   **Address:** Your company's physical address. (AI suggestions available ✨ for a plausible format)

#### Social Media Links
This is a dynamic list.
*   Click "**Add Social Media Link**" to add a new entry.
*   For each entry:
    *   **Platform Name:** E.g., "Twitter", "LinkedIn", "Instagram".
    *   **URL:** The full URL to your social media profile.
*   Click "**Remove**" to delete an entry.

#### Theme Customization
*   **Primary Color:** Main brand color (e.g., for buttons, active links).
*   **Secondary Color:** A complementary color.
*   **Accent Color:** For highlights, special CTAs.
    *   Use the color pickers or enter hex color codes (e.g., `#3498DB`). These colors update the CSS variables defined in `public/assets/css/theme.css`, affecting the entire public site.

#### Home Page Content
*   **Hero Section:** Title, Subtitle (AI ✨), Image URL, CTA Button Text & Link.
*   **Introduction Section:** Title, Text (AI ✨), Image URL, Image Alt Text.
*   **Featured Services Section:** Title, Intro Text (AI ✨). (Actual services are managed under "Services Page").
*   **Key Features (Bento Grid):** Section Title, and a dynamic list for Key Feature Items (AI ✨ for description).
    *   Each feature item has: ID, Title, Description, Icon (emoji/shortcode), Layout (1x1, 2x2), "Is Image Block?" checkbox, Image URL, Image Alt Text.
*   **Call to Action Bar:** Title, Text (AI ✨), Button Text, Button Link.
*   **About Us Teaser:** Title, Text (AI ✨), Image URL, Image Alt, Button Text & Link.
*   **Testimonials:** Section Title, and a dynamic list for Testimonial Items (AI ✨ for quote).
    *   Each testimonial has: Quote, Author, Company (optional).
*   **Latest Blog Posts Teaser:** Section Title, Number of Posts to Show, "View All" Button Text. (Actual blog posts managed under "Blog Page").

#### About Page Content
*   **Meta Description:** SEO description for the About page (AI ✨).
*   **Hero Section:** Title, Subtitle (AI ✨), Image URL.
*   **Our Story Section:** Title, and dynamic list for Story Blocks (AI ✨ for text).
    *   Each block has: Text, Image URL, Image Alt.
*   **Team Section:** Title, Intro Text (AI ✨), and dynamic list for Team Members (AI ✨ for bio).
    *   Each member has: Name, Title, Image URL, Bio, Social Links (one per line, e.g., `LinkedIn: url`).
*   **Our Values Section:** Title, Intro Text (AI ✨), and dynamic list for Value Items (AI ✨ for description).
    *   Each value has: Name, Description, Icon.
*   **Mission & Vision Section:** Overall Section Title, Mission Title, Mission Text (AI ✨), Vision Title, Vision Text (AI ✨).
*   **Company Culture Section:** Section Title, Main Text (AI ✨), Image URL, Image Alt Text.
*   **Community Involvement & CSR Section:** Section Title, Main Text (AI ✨), and a dynamic list for Involvement Items (each item having just text).
*   **Careers Teaser Section:** Section Title, Main Text (AI ✨), Button Text, Button Link.

#### Services Page & Service Details
*   **Services Page Title:** Title for the main `services.html` page.
*   **Services Page Introduction Text:** Intro for `services.html` (AI ✨).
*   **Our Service Approach Section:** Section Title, Main Text (AI ✨), and dynamic list for Approach Steps (each with Title and Description (AI ✨)).
*   **Why Choose Us Section:** Section Title, Main Text (AI ✨), and dynamic list for Differentiators (each with Title and Description (AI ✨)).
*   **Benefits Section:** Section Title, Main Text (AI ✨), and dynamic list for Benefit Items (each with Text).
*   **Case Studies Teaser Section:** Section Title, Main Text (AI ✨), Image URL, Image Alt Text, Image Caption.
*   **Services FAQ Section:** Section Title, Main Text/Introduction (AI ✨), and dynamic list for FAQ Items (each with Question and Answer (AI ✨)).
*   **Custom Quote CTA Section:** Section Title, Main Text (AI ✨), Button Text, Button Link.
*   **List of Individual Services (for cards & detail pages):**
    *   Click "**Add Service**" to add a new service. Each service entry includes:
        *   **Service ID:** Unique identifier (e.g., "strategic-consulting").
        *   **Service Name.**
        *   **Short Description:** For `services.html` card (AI ✨).
        *   **Image URL:** For `services.html` card.
        *   **Detail Page URL:** e.g., `service-detail-example.html?service=your-service-id`.
        *   **Nested Fieldset for Service Detail Page Content:**
            *   Detail Page Title.
            *   Detail Page Meta Description (AI ✨).
            *   Detail Page Banner Image URL.
            *   Overview: Full description (AI ✨).
            *   Features Section Title.
            *   Features (JSON array): `[{"name":"Feature 1","description":"Desc 1","iconPlaceholder":"🔍","imagePlaceholder":"url","imageAlt":"alt1"}]` (AI ✨ for feature descriptions).
            *   Service Specific Testimonials (JSON array): `[{"quote":"Great!","author":"Client","company":"Client Co"}]` (AI ✨ for quotes).
            *   Related Resources/Downloads (JSON array): `[{"title":"Doc","url":"/doc.pdf","type":"PDF"}]` (AI ✨ for titles/descriptions).
            *   Process Section Title.
            *   Process Description (AI ✨).
            *   CTA Button Text & Link for the detail page.

#### Blog Page & Blog Posts
*   **Blog Page Title:** Title for `blog.html`.
*   **Blog Page Introduction Text:** Intro for `blog.html` (AI ✨).
*   **Featured Post Spotlight Section:** Section Title, Post ID to Feature (from list below), Teaser Text (AI ✨).
*   **Categories Overview Section:** Section Title, Introduction Text (AI ✨), Categories Placeholder Text.
*   **Author Spotlight Section:** Section Title, Text (AI ✨), Image URL, Image Alt Text.
*   **Archives Link Section:** Section Title, Text (AI ✨), Button Text, Button Link.
*   **Subscribe CTA Section:** Section Title, Text (AI ✨), Form Placeholder Text, CTA Button Text, CTA Button Link.
*   **Related Topics Section:** Section Title, Introduction Text (AI ✨), Related Topics Placeholder Text.
*   **List of Blog Posts:** Click "**Add Blog Post**" to add a new post. Each post entry includes:
    *   **Post ID:** Unique identifier (e.g., "future-of-tech").
    *   **Title.**
    *   **Date:** Publication date.
    *   **Author.**
    *   **Summary:** For `blog.html` card (AI ✨).
    *   **Image URL:** For card and post header.
    *   **Detail Page URL:** e.g., `blog-post-example.html?post=your-post-id`.
    *   **Nested Fieldset for Blog Post Detail Content:**
        *   Detail Page Title.
        *   Detail Page Meta Description (AI ✨).
        *   Detail Page Banner Image URL.
        *   Full Text (JSON array of HTML strings, or Markdown): The complete content of the blog post (AI ✨ for intro/subheadings).
        *   Author Bio: (AI ✨).
        *   Author Image URL.
        *   Author Profile Page Link (Optional).
        *   Enable Social Share Section? (Checkbox).
        *   Social Share Text (e.g., "Share this post:").
        *   Tags (comma-separated) (AI ✨).
        *   Categories (comma-separated) (AI ✨).
        *   Previous Post Link Text (e.g., "Previous Article").
        *   Next Post Link Text (e.g., "Next Article").
        *   Related Posts Section Title.
        *   Related Post IDs (comma-separated, from Blog Posts list).
        *   Comments Placeholder Text (AI ✨).
        *   **Post Page CTA:** Title, Text (AI ✨), Button Text, Button Link.

#### Contact Page Content
*   **Page Title:** Title for `contact.html`.
*   **Intro Text:** Introduction for the contact page (AI ✨).
*   **Form Section Title:** Heading for the contact form area.
*   **Contact Info Section Title:** Heading for the address/details area.
*   **Map Placeholder Text:** Text to display if a map embed isn't used (AI ✨).
*   **Formspree Endpoint URL:** Your endpoint URL from Formspree.io (see [Contact Form Setup](#4-contact-form-setup)).
*   **Office Hours Section:** Section Title, Office Hours Text (e.g., "Mon-Fri: 9am-5pm") (AI ✨).
*   **Response Expectations Section:** Section Title, Main Text (AI ✨).
*   **Social Connect Section:** Section Title, Intro Text (AI ✨), and dynamic list for Social Connect Links (each with Platform Name and URL).
*   **Location Highlights Section:** Section Title, Main Text (e.g., parking, accessibility) (AI ✨).
*   **Contact FAQs Section:** Section Title, Intro Text (AI ✨), and dynamic list for FAQ Items (each with Question (AI ✨) and Answer (AI ✨)).

### 2.6. Using AI Content Suggestions

For many textarea fields, you'll see a "Suggest with AI ✨" button.

1.  **Ensure API Key is Configured:** This feature requires your Google Gemini API Key (see [Section 1.3](#13-google-gemini-api-key-for-ai-suggestions)).
2.  **Provide Context:**
    *   **Crucial:** Fill in "Company Name" and especially "**Company Niche/Industry**" in the "General Settings" section. This significantly improves suggestion quality.
    *   For items within dynamic lists (e.g., a service description), ensure relevant fields for *that specific item* (like "Service Name") are filled.
3.  **Click the Button:** Click "Suggest with AI ✨" next to the desired field.
4.  **Review Suggestions:** A modal window will appear, showing a loading spinner then a list of suggestions.
5.  **Apply Suggestion:** Click "Use this suggestion" next to your preferred option. The text will be copied to the textarea.
6.  **Edit:** You can further edit the AI-generated content before saving.

### 2.7. Saving Your Changes

*   After making any modifications in the admin panel, scroll to the bottom and click the "**Save All Changes**" button.
*   A status message will indicate if the save was successful or if there was an error.
*   The public website will reflect these changes the next time it loads data from Firebase (typically on page load/refresh).

---

## 3. Managing Images

The admin panel requires you to provide URLs for all images (logo, hero images, feature images, etc.).

*   **Recommended Method (Local Project Images):**
    1.  Place all your website images in the `public/assets/images/` directory within your project.
    2.  When you deploy your site, these images will be deployed along with it.
    3.  In the admin panel's image URL fields, enter the **relative path** from the `public` directory.
        *   Example: If your logo is `public/assets/images/my-logo.png`, enter `assets/images/my-logo.png`.
*   **Alternative (External Hosting):**
    *   You can host images on services like Firebase Storage, AWS S3, Imgur, etc.
    *   In this case, enter the **full public URL** of the image in the admin panel.
*   **Optimization:** Ensure your images are optimized for the web (appropriate dimensions, compressed file size) to improve page loading times.

---

## 4. Contact Form Setup

The contact form on `contact.html` needs an endpoint to send email submissions. Formspree.io is a simple and free option.

1.  **Sign up at Formspree:** Go to [Formspree.io](https://formspree.io/) and create an account.
2.  **Create a New Form:** Follow their instructions to create a new form. You'll be given a unique **endpoint URL** (it looks like `https://formspree.io/f/your_unique_code`).
3.  **Enter Endpoint in Admin Panel:**
    *   Log in to your website's admin panel (`public/admin.html`).
    *   Navigate to the "Contact Page Content" section.
    *   Paste your Formspree endpoint URL into the "**Formspree Endpoint URL**" field.
    *   Click "**Save All Changes**".

Now, when visitors submit the contact form on your public site, the data will be sent to your Formspree account, which will then email it to you.

*Alternative: Netlify Forms*
If you deploy your site on Netlify, you can use Netlify Forms. The HTML form is already set up with `data-netlify="true"`. In this case, you might not need a Formspree endpoint; Netlify will handle submissions. Clear the Formspree endpoint field in the admin panel if using Netlify's built-in handling.

---

## 5. Advanced: Modifying CSS Themes

While primary theme colors are managed in the admin panel, more fundamental visual changes (like fonts, spacing, or complex color schemes beyond the three main theme colors) require direct CSS edits.

*   **CSS Variables:** The core of the theming system is in `public/assets/css/theme.css`. This file defines CSS variables for:
    *   Light theme (in `:root { ... }`)
    *   Dark theme (in `body.dark-mode { ... }`)
*   **Changing Fonts:**
    1.  Modify `--font-family-base` (for body text) and `--font-family-heading` (for headings) in `theme.css`.
    2.  If using Google Fonts or other external fonts, ensure you import them in the `<head>` section of all public HTML files (e.g., `index.html`, `about.html`, etc.).
*   **Other Colors & Styles:** You can adjust other CSS variables in `theme.css` or modify general styles in `public/assets/css/style.css`.
*   Refer to `docs/STYLE_GUIDE.md` for more on styling conventions and accessibility.

---

## 6. Advanced: Adding/Modifying Pages

The template includes a standard set of pages. Content for these is managed via the admin panel.

*   **Adding New Service/Blog Detail Pages:**
    1.  In the admin panel (Services or Blog section), add a new service/blog item.
    2.  Define a unique **ID** (e.g., "new-awesome-service").
    3.  Define a **Detail Page URL**. This URL should include a query parameter that matches the ID.
        *   Example for a service: `service-detail-example.html?service=new-awesome-service`
        *   Example for a blog post: `blog-post-example.html?post=my-latest-article`
    4.  **Create the HTML File:** Duplicate an existing detail page (e.g., `public/service-detail-example.html`) and rename it if you prefer a different file name (e.g., `public/new-service-page.html`). Ensure the URL in the admin panel matches this new file name if you change it.
    5.  The JavaScript (`main.js`) will use the query parameter (`service` or `post`) to fetch and display the correct content from Firestore that you entered in the admin panel for that item's "Detail Content".
*   **Adding Entirely New Top-Level Pages (e.g., a "Portfolio" page):**
    1.  **Create HTML:** Create a new HTML file in `public/` (e.g., `public/portfolio.html`). Copy the structure from an existing page (like `about.html`) to include the header, footer, CSS/JS links.
    2.  **Update Admin Panel HTML (`public/admin.html`):**
        *   Add a new `<fieldset>` for "Portfolio Page Content".
        *   Add input fields, textareas, and dynamic list templates as needed for your new page's content. Give them unique IDs.
    3.  **Update Admin Panel JavaScript (`public/assets/js/admin.js`):**
        *   In `populateFormWithData()`: Add logic to load data from Firestore into your new portfolio fields.
        *   In `collectFormData()`: Add logic to gather data from your new portfolio fields and add it to the `dataToSave.pages.portfolio` object (or similar).
        *   If you have dynamic lists for the portfolio, create new `addPortfolioItem()` functions and connect their "Add" buttons.
    4.  **Update Public Site JavaScript (`public/assets/js/main.js`):**
        *   Create a new function, `populatePortfolioPage()`, to take data from `siteData.pages.portfolio` and inject it into `portfolio.html`.
        *   In `routeContentPopulation()`, add an `else if` condition to call `populatePortfolioPage()` when `portfolio.html` is the current page.
    5.  **Update Navigation:** Manually add links to your new "Portfolio" page in the `<nav>` section of all public HTML files (header and footer quick links). For fully dynamic navigation, you'd need to manage navigation links in the admin panel as well, which is a more complex addition.

---

## 7. Deployment

Your website consists of static files that fetch data dynamically from Firebase.

1.  **Final Checks:**
    *   Ensure your Firebase configuration in `public/assets/js/main.js` and `public/assets/js/admin.js` points to your **PRODUCTION Firebase project**.
    *   Ensure your Google Gemini API key in `public/assets/js/admin.js` is correct.
    *   Test the admin panel and public site thoroughly.
2.  **Choose a Hosting Provider:**
    *   Firebase Hosting (recommended for easy integration)
    *   Netlify, Vercel, GitHub Pages, AWS S3, Cloudflare Pages, etc.
3.  **Deploy:**
    *   Upload the **entire contents of your `public/` directory** to your chosen hosting provider.
    *   Follow your hosting provider's instructions for deployment.

This comprehensive guide should equip you to fully customize, operate, and deploy your brandable website.
