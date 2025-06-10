
# Firebase Project Setup Guide

This guide outlines the steps to set up a new Firebase project for the Brandable Static Site. This setup is **essential** for the admin panel functionality and for the public website to display dynamic content.

## 1. Create a Firebase Project

1.  **Go to the Firebase Console:**
    *   Navigate to [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Sign in with your Google account if you haven't already.
2.  **Add a Project:**
    *   Click on "**Add project**" (or "**Create a project**").
    *   Enter your desired **Project name** (e.g., "MyBrandableSite-Live"). Using a descriptive name helps.
    *   Accept the Firebase terms and click "**Continue**".
3.  **Google Analytics (Optional but Recommended):**
    *   You can choose to enable Google Analytics for this project. It provides useful insights into your website's traffic and user engagement.
    *   If you enable it, select or create a Google Analytics account.
    *   Click "**Continue**" (or "**Create project**").
4.  **Wait for Project Creation:**
    *   Firebase will provision your project. This might take a few moments.
    *   Once ready, click "**Continue**". You will be taken to your project's overview page.

## 2. Add Firebase to Your Web App

1.  **Register Your App:**
    *   On your Firebase project's overview page, find the "Get started by adding Firebase to your app" section.
    *   Click on the Web icon (`</>`).
    *   Enter an **App nickname** (e.g., "My Brand Site - Web").
    *   **Firebase Hosting (Optional):** You can choose to "Also set up Firebase Hosting for this app." This is a good option if you plan to deploy your site using Firebase Hosting. You can also set this up later.
    *   Click "**Register app**".
2.  **Get Firebase SDK Configuration:**
    *   After registering, Firebase will provide you with your Firebase SDK configuration. This is a JavaScript object containing your project's unique identifiers. It will look something like this:

    ```javascript
    // PASTE THIS INTO YOUR APP'S SCRIPT FILES
    const firebaseConfig = {
      apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Example
      authDomain: "your-project-id.firebaseapp.com",    // Example
      projectId: "your-project-id",                     // Example
      storageBucket: "your-project-id.appspot.com",     // Example
      messagingSenderId: "123456789012",                // Example
      appId: "1:123456789012:web:abcdef1234567890abcdef",// Example
      measurementId: "G-XXXXXXXXXX"                     // Example, if Analytics enabled
    };
    ```
    *   **IMPORTANT: Copy this entire `firebaseConfig` object.** You will need to paste this into:
        *   `public/assets/js/main.js` (for the public site)
        *   `public/assets/js/admin.js` (for the admin panel)
    *   Keep this configuration handy. While it's generally safe for client-side code (security is enforced by Firebase Rules), treat the `apiKey` with care.

    *   After copying, click "**Continue to console**".

## 3. Enable Firebase Authentication

This is required for admin users to log in to the admin panel.

1.  **Go to Authentication:**
    *   In the Firebase console, from the left-hand menu, navigate to **Build > Authentication**.
2.  **Get Started:**
    *   Click on the "**Get started**" button.
3.  **Enable Email/Password Sign-in:**
    *   You'll see a list of sign-in providers. Click on "**Email/Password**".
    *   Enable the toggle switch for "Email/Password".
    *   Click "**Save**".
    *   Other providers are not needed for this template but can be explored for future enhancements.

## 4. Enable Cloud Firestore (Database)

Cloud Firestore will store all your website's content (text, image URLs, theme settings, etc.).

1.  **Go to Firestore Database:**
    *   In the Firebase console, from the left-hand menu, navigate to **Build > Firestore Database**.
2.  **Create Database:**
    *   Click on "**Create database**".
3.  **Choose Mode: Production Mode**
    *   Select "**Start in production mode**". This ensures your data is secure by default. We will define specific security rules next to allow public reading of site content and restricted writing for admins.
    *   Click "**Next**".
4.  **Choose Firestore Location:**
    *   Select a Cloud Firestore location. **Choose a region closest to your primary user base.** This setting **cannot be changed later**, so choose carefully.
    *   Click "**Enable**". Firestore will take a few moments to provision.

## 5. Configure Firestore Security Rules

Security rules define who can read and write data in your Firestore database. These are crucial for protecting your data while allowing your website and admin panel to function correctly.

1.  **Go to Rules Tab:**
    *   In the Cloud Firestore section of the Firebase console, click on the "**Rules**" tab.
2.  **Update Rules:**
    *   Replace the default rules with the following:

    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {

        // Site Content Collection (e.g., 'siteContent')
        // Document ID is 'main_config' (as defined in admin.js and main.js)
        match /siteContent/{documentId} {
          // Allow public read access for the website to display content
          allow read: if true;

          // Allow write access ONLY to authenticated users (admins)
          // This is a basic rule. For higher security, you might:
          // 1. Check if request.auth.uid matches a specific list of admin UIDs.
          // 2. Use Firebase custom claims to mark users as admins.
          // 3. Store admin UIDs in a separate secure collection and check against that.
          // For this template, any authenticated user can write to the admin panel.
          // Ensure your admin sign-up process is controlled.
          allow write: if request.auth != null;
        }

        // Users Collection (for admin user data, if you decide to store more admin info)
        // This rule allows users to read and write their own data if you create a 'users/{userId}' path.
        // Currently, the template only uses Firebase Authentication, not a separate 'users' collection.
        // You can uncomment and adapt this if you extend admin user profiles.
        /*
        match /users/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        */

        // Default deny for any other paths not explicitly matched
        match /{document=**} {
          allow read, write: if false;
        }
      }
    }
    ```

    **Explanation of these Rules:**
    *   `rules_version = '2';`: Specifies the modern security rules version.
    *   `service cloud.firestore`: Targets the Firestore service.
    *   `match /databases/{database}/documents`: Applies to all documents in your Firestore database.
    *   `match /siteContent/{documentId}`:
        *   This rule targets your main content collection (named `siteContent` in the JavaScript files) and any document within it (specifically `main_config`).
        *   `allow read: if true;`: **Allows anyone (public visitors) to read documents from this collection.** This is essential for your public website to fetch and display the content you manage in the admin panel.
        *   `allow write: if request.auth != null;`: **Allows any authenticated user to write to this collection.** This means anyone who successfully logs into your admin panel (via Firebase Authentication) can modify the site content.
            *   **Security Note:** For a production site with multiple potential admins or higher security needs, you should restrict write access further. You could check `request.auth.uid` against a hardcoded list of admin UIDs in the rules, or use Firebase custom claims set by a backend function. For this template's scope, relying on Firebase Authentication for admin access is the primary gate.
    *   `match /users/{userId}`: This is a commented-out example. If you decide to store additional information about your admin users in a separate `users` collection in Firestore (e.g., roles, preferences), this rule would allow each user to read and write only their own document. The current template does not use this.
    *   `match /{document=**}`: `allow read, write: if false;`: This is a crucial **default deny rule**. It ensures that any path not explicitly matched above is not readable or writable by anyone, enhancing security.

3.  **Publish Rules:**
    *   After pasting and reviewing the rules, click the "**Publish**" button.

## 6. Initial Data (Optional but Recommended for First Use)

Your Firestore database is now empty. When you first access the admin panel:

*   The forms will be blank.
*   You can start filling out all the fields and click "Save All Changes". This will create the `main_config` document in your `siteContent` collection.
*   **Reference Data:** The file `public/assets/data/company-data.json` in this project contains the complete data structure and example content. You can use this file as a reference for what kind of information to put into each field in the admin panel to get started.

## Next Steps: Configuration in Your Code

Now that your Firebase project is set up:

1.  **Copy `firebaseConfig`:** Ensure you have copied the `firebaseConfig` object from Step 2.2.
2.  **Update JavaScript Files:**
    *   Open `public/assets/js/main.js` and replace the placeholder `firebaseConfig` at the top with your copied configuration.
    *   Open `public/assets/js/admin.js` and replace the placeholder `firebaseConfig` at the top with your copied configuration.
3.  **Set Up Gemini API Key:**
    *   Obtain a Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Open `public/assets/js/admin.js`.
    *   Find the line: `const apiKey = globalThis?.process?.env?.API_KEY || "YOUR_API_KEY_HERE";`
    *   Replace `"YOUR_API_KEY_HERE"` with your actual Google Gemini API Key.
4.  **Create Admin User:**
    *   Open `public/admin.html` in your browser.
    *   Use the "Sign Up" button to create your first admin user account. This user will be stored in Firebase Authentication.
5.  **Manage Content:**
    *   Log in to `public/admin.html` and start managing your website's content!

Your Firebase backend is now ready to power your brandable website! Refer to the `CUSTOMIZATION_GUIDE.md` for more details on using the admin panel and customizing your site.
