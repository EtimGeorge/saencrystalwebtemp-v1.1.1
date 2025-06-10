

// --- Firebase Initialization (Add this at the top) ---
// IMPORTANT: Replace with your actual Firebase project configuration!
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhsa5cDcCmKXwCrqpXbBYvtHMRQyD2tTo",
  authDomain: "mybrandablesite-live.firebaseapp.com",
  projectId: "mybrandablesite-live",
  storageBucket: "mybrandablesite-live.firebasestorage.app",
  messagingSenderId: "732971166987",
  appId: "1:732971166987:web:9d04b5bd80ba6aecd9060e",
  measurementId: "G-RXC8BL0LK8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

let db; // Declare db globally for this script
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully for public site.");
    } else {
        firebase.app(); 
        console.log("Firebase already initialized for public site.");
    }
    db = firebase.firestore(); // Initialize Firestore
} catch (e) {
    console.error("Error initializing Firebase on public site:", e);
    const bodyEl = document.querySelector('body');
    if (bodyEl) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Error connecting to site services. Content may be unavailable.';
        errorDiv.className = 'critical-error-message'; // Use a class for styling
        bodyEl.prepend(errorDiv);
    }
}

// --- Firestore Constants ---
const SITE_CONTENT_COLLECTION = 'siteContent'; // Firestore collection name
const COMPANY_DOC_ID = 'main_config';     // Document ID for the main site configuration


document.addEventListener('DOMContentLoaded', async () => {
    console.log('Document loaded. Main.js is active for data population from Firestore.');

    let siteData = null;

    // --- Loading Overlay ---
    let loadingOverlay;

    function showLoadingOverlay() {
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="spinner-container">
                    <div class="spinner"></div>
                    <p>Loading content...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        }
        loadingOverlay.style.display = 'flex';
    }

    function hideLoadingOverlay() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    function displayGlobalError(message) {
        const mainElement = document.querySelector('main') || document.body;
        let errorP = document.getElementById('global-site-error');
        if (!errorP) {
            errorP = document.createElement('p');
            errorP.id = 'global-site-error';
            errorP.className = 'error-message'; // Use existing error class
            mainElement.prepend(errorP);
        }
        errorP.textContent = message;
        errorP.style.display = 'block';
    }

    // --- Helper to convert HEX to RGB parts ---
    function hexToRgbParts(hex) {
        if (!hex) return null;
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // --- Apply Theme Colors from Firestore Data ---
    function applyThemeColors(themeColors) {
        if (!themeColors) return;
        const root = document.documentElement;

        if (themeColors.primary) {
            root.style.setProperty('--primary-color', themeColors.primary);
        }
        if (themeColors.secondary) {
            root.style.setProperty('--secondary-color', themeColors.secondary);
        }
        if (themeColors.accent) {
            root.style.setProperty('--accent-color', themeColors.accent);
            const accentRgb = hexToRgbParts(themeColors.accent);
            if (accentRgb) {
                root.style.setProperty('--accent-color-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
            }
        }
        if (themeColors.background) {
             root.style.setProperty('--background-color', themeColors.background);
             const backgroundRgb = hexToRgbParts(themeColors.background);
             if (backgroundRgb) {
                root.style.setProperty('--background-color-rgb', `${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}`);
             }
        }
        if (themeColors.surface) {
             root.style.setProperty('--surface-color', themeColors.surface);
             const surfaceRgb = hexToRgbParts(themeColors.surface);
             if (surfaceRgb) {
                root.style.setProperty('--surface-color-rgb', `${surfaceRgb.r}, ${surfaceRgb.g}, ${surfaceRgb.b}`);
             }
        }
         if (themeColors.text) {
             root.style.setProperty('--text-color', themeColors.text);
             const textRgb = hexToRgbParts(themeColors.text);
             if (textRgb) {
                root.style.setProperty('--text-color-rgb', `${textRgb.r}, ${textRgb.g}, ${textRgb.b}`);
             }
        }
        if (themeColors.textMuted) { // Assuming you might add this for consistency
            root.style.setProperty('--text-color-muted', themeColors.textMuted);
            const textMutedRgb = hexToRgbParts(themeColors.textMuted);
            if (textMutedRgb) {
               root.style.setProperty('--text-color-muted-rgb', `${textMutedRgb.r}, ${textMutedRgb.g}, ${textMutedRgb.b}`);
            }
        }
    }


    // --- Fetch Data from Firestore and Render ---
    async function loadCompanyDataAndRender() {
        if (!db) {
            displayGlobalError('Firestore is not available. Cannot load site content.');
            console.error('Firestore instance (db) is not initialized.');
            hideLoadingOverlay();
            return;
        }
        showLoadingOverlay();

        try {
            const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(COMPANY_DOC_ID);
            const docSnap = await docRef.get();

            if (docSnap.exists()) {
                siteData = docSnap.data();
                console.log('Site data loaded from Firestore:', siteData);

                if (siteData.themeColors) {
                    applyThemeColors(siteData.themeColors);
                }

                if (siteData) {
                    populateGlobalContent();
                    routeContentPopulation();
                }
            } else {
                console.error(`Document ${COMPANY_DOC_ID} not found in ${SITE_CONTENT_COLLECTION}.`);
                displayGlobalError('Website content could not be loaded. Configuration missing.');
            }
        } catch (error) {
            console.error('Could not fetch site data from Firestore:', error);
            displayGlobalError('Sorry, we encountered an error loading the website content. Please try again later.');
        } finally {
            hideLoadingOverlay();
        }
    }


    // --- Utility to replace [CompanyName] and [Address] placeholders ---
    function replacePlaceholders(text, companyName, companyAddress) {
        if (typeof text !== 'string') return String(text); // Ensure it's a string
        let result = text.replace(/\[CompanyName\]/g, companyName || "Your Company");
        if (companyAddress) {
            result = result.replace(/\[Address\]/g, companyAddress);
        }
        return result;
    }

    // --- Populate Global Content (Logo, Page Title, Footer) ---
    function populateGlobalContent() {
        if (!siteData) {
            console.warn("Global site data is missing. Cannot populate global content.");
            return;
        }
        const companyName = siteData.companyName || "BrandName"; // Fallback

        // Update Logo/Brand Name in Header
        const headerLogoElement = document.querySelector('header .logo');
        if (headerLogoElement) {
            headerLogoElement.textContent = companyName;
        }
        
        // Update Logo in Footer
        const footerLogoElement = document.querySelector('footer .footer-logo');
        if (footerLogoElement) {
            footerLogoElement.textContent = companyName;
        }

        // Populate Footer
        const footer = document.querySelector('footer');
        if (footer) {
            // Update Copyright
            const copyrightP = footer.querySelector('.footer-copyright-text'); 
            if (copyrightP) {
                 copyrightP.innerHTML = `&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.`;
            }

            // Update Contact Details
            const footerContactDetailsDiv = document.getElementById('footerContactDetails');
            if (footerContactDetailsDiv && siteData.contactDetails) {
                let detailsHTML = '';
                if (siteData.contactDetails.email) {
                    detailsHTML += `<p>Email: <a href="mailto:${siteData.contactDetails.email}">${siteData.contactDetails.email}</a></p>`;
                }
                if (siteData.contactDetails.phone) {
                    detailsHTML += `<p>Phone: <a href="tel:${siteData.contactDetails.phone.replace(/[^0-9+]/g, '')}">${siteData.contactDetails.phone}</a></p>`;
                }
                if (!detailsHTML) detailsHTML = "<p>Contact details unavailable.</p>";
                footerContactDetailsDiv.innerHTML = detailsHTML;
            } else if (footerContactDetailsDiv) {
                footerContactDetailsDiv.innerHTML = '<p>Contact details unavailable.</p>'; 
            }

            // Update Social Media Links
            const footerSocialMediaDiv = document.getElementById('footerSocialMedia');
            if (footerSocialMediaDiv && siteData.socialMediaLinks && Array.isArray(siteData.socialMediaLinks) && siteData.socialMediaLinks.length > 0) {
                let socialHTML = '<ul class="social-links-list">'; 
                siteData.socialMediaLinks.forEach(link => {
                    if (link.platform && link.url) { 
                        socialHTML += `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${link.platform} (opens in new tab)">${link.platform}</a></li>`;
                    }
                });
                socialHTML += '</ul>';
                footerSocialMediaDiv.innerHTML = socialHTML;
            } else if (footerSocialMediaDiv) {
                footerSocialMediaDiv.innerHTML = ''; 
            }
        }
    }

    // --- Route Content Population based on current page ---
    function routeContentPopulation() {
        if (!siteData) {
             console.warn("Site data not available for routing content.");
             return;
        }
        
        const path = window.location.pathname;
        const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

        if (currentPage === 'index.html') {
            populateHomePage();
        } else if (currentPage === 'about.html') {
            populateAboutPage();
        } else if (currentPage === 'services.html') {
            populateServicesPage();
        } else if (currentPage === 'contact.html') {
            populateContactPage();
        } else if (currentPage === 'blog.html') {
            populateBlogPage();
        } else if (currentPage.startsWith('service-detail-example.html')) { 
            populateServiceDetailPage();
        } else if (currentPage.startsWith('blog-post-example.html')) {
            populateBlogPostDetailPage();
        }
    }

    // --- Helper to set text content by ID ---
    function setTextById(id, text, fallback = '') {
        const element = document.getElementById(id);
        if (element) {
            const companyName = siteData?.companyName || "Your Company";
            const companyAddress = siteData?.contactDetails?.address || "123 Main St";
            element.textContent = replacePlaceholders(text || fallback, companyName, companyAddress);
        } else {
            // console.warn(`Element with ID "${id}" not found for setTextById.`);
        }
    }

    // --- Helper to set HTML content by ID ---
    function setHtmlById(id, html, fallback = '') {
        const element = document.getElementById(id);
        if (element) {
            const companyName = siteData?.companyName || "Your Company";
            const companyAddress = siteData?.contactDetails?.address || "123 Main St";
            element.innerHTML = replacePlaceholders(html || fallback, companyName, companyAddress);
        } else {
            // console.warn(`Element with ID "${id}" not found for setHtmlById.`);
        }
    }
    
    // --- Helper to set image src and alt by ID ---
    function setImageById(id, src, alt, displayStyle = 'block', fallbackSrc = 'assets/images/placeholder-default.png') {
        const element = document.getElementById(id);
        if (element) {
            if (src) {
                element.src = src;
                const companyName = siteData?.companyName || "Your Company";
                const companyAddress = siteData?.contactDetails?.address || "123 Main St";
                element.alt = replacePlaceholders(alt || "Placeholder image", companyName, companyAddress);
                element.style.display = displayStyle;
                element.onerror = () => {
                    console.warn(`Failed to load image: ${element.src}. For ID "${id}". Using fallback.`);
                    element.src = fallbackSrc;
                    element.alt = 'Error loading image. Placeholder shown.';
                };
            } else {
                element.src = fallbackSrc;
                element.alt = 'Image not available. Placeholder shown.';
                element.style.display = displayStyle; // Still display placeholder
            }
        } else {
            // console.warn(`Element with ID "${id}" not found for setImageById.`);
        }
    }
    
    // --- Helper to set meta content ---
    function setMeta(name, content) {
        const meta = document.querySelector(`meta[name="${name}"]`);
        if (meta) {
            const companyName = siteData?.companyName || "Your Company";
            const companyAddress = siteData?.contactDetails?.address || "123 Main St";
            meta.content = replacePlaceholders(content || '', companyName, companyAddress);
        }
    }

    // --- Helper to set href and text for an anchor tag by ID ---
    function setLinkById(id, href, text, displayStyle = 'inline-block') {
        const element = document.getElementById(id);
        if (element && element.tagName === 'A') {
            element.href = href || '#';
            if (text !== undefined) { 
                element.textContent = replacePlaceholders(text, siteData?.companyName, siteData?.contactDetails?.address);
            }
             if (href && href !== '#') {
                element.style.display = displayStyle; 
            } else if (!text && (!href || href === '#')) { // Hide if no text and no meaningful link
                element.style.display = 'none';
            } else {
                element.style.display = displayStyle; // Show if has text, even if link is #
            }
        } else if (element) {
            // console.warn(`Element with ID "${id}" is not an anchor tag for setLinkById.`);
        } else {
            // console.warn(`Element with ID "${id}" not found for setLinkById.`);
        }
    }


    // --- Page-Specific Population Functions ---
    function populateHomePage() {
        const pageData = siteData?.pages?.home;
        if (!pageData) {
            console.warn("Home page data not found in siteData.");
            return;
        }
        const companyName = siteData.companyName || 'Website';
        document.title = `Home - ${companyName}`;
        setMeta('description', `Welcome to ${companyName}. ${replacePlaceholders(pageData.hero?.subtitle || '', siteData.companyName, siteData.contactDetails?.address)}`);

        // Populate Hero
        if (pageData.hero) {
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                const heroTitleEl = heroSection.querySelector('.hero-content h1');
                if (heroTitleEl) heroTitleEl.textContent = replacePlaceholders(pageData.hero.title || "Welcome!", siteData.companyName, siteData.contactDetails?.address);
                const heroSubtitleEl = heroSection.querySelector('.hero-content p');
                if (heroSubtitleEl) heroSubtitleEl.textContent = replacePlaceholders(pageData.hero.subtitle || "Discover amazing things.", siteData.companyName, siteData.contactDetails?.address);
                
                const heroCtaButton = heroSection.querySelector('.hero-cta-button'); // Assuming one CTA
                if (heroCtaButton) {
                     heroCtaButton.href = pageData.hero.ctaLink || '#';
                     heroCtaButton.textContent = replacePlaceholders(pageData.hero.ctaText || "Learn More", siteData.companyName, siteData.contactDetails?.address);
                }
            }

            const heroBgPlaceholder = document.querySelector('#hero .hero-background-placeholder');
            if (heroBgPlaceholder && pageData.hero.imagePlaceholder) {
                heroBgPlaceholder.style.backgroundImage = `url('${pageData.hero.imagePlaceholder}')`;
            } else if (heroBgPlaceholder) {
                 heroBgPlaceholder.style.backgroundImage = `url('assets/images/placeholder-hero.jpg')`;
            }
        }

        if (pageData.introduction) {
            setTextById('intro-title', pageData.introduction.title, "Introduction");
            setHtmlById('intro-text', pageData.introduction.text, "Learn more about us.");
            setImageById('intro-image', pageData.introduction.imagePlaceholder, pageData.introduction.imageAlt || 'Introduction image');
        }

        if (pageData.featuredServices) {
            setTextById('featured-services-title', pageData.featuredServices.title, "Featured Services");
            setTextById('featured-services-intro-text', pageData.featuredServices.introText, "Check out our top services.");
            const listContainer = document.getElementById('featured-services-list');
            if (listContainer && Array.isArray(pageData.featuredServices.services) && pageData.featuredServices.services.length > 0) {
                listContainer.innerHTML = ''; 
                pageData.featuredServices.services.forEach(service => {
                    const serviceDiv = document.createElement('div');
                    serviceDiv.className = 'featured-service-item';
                    serviceDiv.innerHTML = `
                        ${service.iconPlaceholder ? `<div class="featured-service-icon">${service.iconPlaceholder}</div>` : ''}
                        <h4><a href="${service.link || '#'}">${replacePlaceholders(service.name || "Service Name", siteData.companyName, siteData.contactDetails?.address)}</a></h4>
                        <p>${replacePlaceholders(service.description || "Service description.", siteData.companyName, siteData.contactDetails?.address)}</p>
                    `;
                    listContainer.appendChild(serviceDiv);
                });
            } else if (listContainer) {
                listContainer.innerHTML = '<p>No featured services to display at this time.</p>';
            }
        }

        if (pageData.keyFeatures?.items) {
            const keyFeaturesSection = document.getElementById('key-features');
            if(keyFeaturesSection && pageData.keyFeatures.title) {
                const h2 = keyFeaturesSection.querySelector('h2');
                if(h2) h2.textContent = replacePlaceholders(pageData.keyFeatures.title, siteData.companyName, siteData.contactDetails?.address);
            }
            const bentoGridContainer = document.querySelector('#key-features .bento-grid');
            if (bentoGridContainer && Array.isArray(pageData.keyFeatures.items) && pageData.keyFeatures.items.length > 0) {
                bentoGridContainer.innerHTML = ''; 
                pageData.keyFeatures.items.forEach(item => {
                    const bentoItem = document.createElement('div');
                    bentoItem.classList.add('bento-item', 'animate-on-scroll');
                    if (item.id) bentoItem.id = item.id;
                    bentoItem.classList.add(item.layout === '2x2' ? 'bento-item-2x2' : 'bento-item-1x1');

                    if (item.isImage && item.imageSrc) {
                        bentoItem.classList.add('bento-item-image-container');
                        const img = document.createElement('img');
                        img.src = item.imageSrc;
                        img.alt = replacePlaceholders(item.imageAlt || "Feature image", siteData.companyName, siteData.contactDetails?.address);
                        img.onerror = () => { img.src = 'assets/images/placeholder-bento-feature.jpg'; img.alt = 'Error loading feature image'; };
                        bentoItem.appendChild(img);
                        if(item.title && item.layout === '2x2'){ 
                            const titleOverlay = document.createElement('h3');
                            titleOverlay.classList.add('bento-item-image-title');
                            titleOverlay.textContent = replacePlaceholders(item.title, siteData.companyName, siteData.contactDetails?.address);
                            bentoItem.appendChild(titleOverlay);
                        }
                    } else {
                        if (item.iconPlaceholder) bentoItem.innerHTML += `<div class="icon-placeholder">${item.iconPlaceholder}</div>`;
                        if (item.title) bentoItem.innerHTML += `<h3>${replacePlaceholders(item.title, siteData.companyName, siteData.contactDetails?.address)}</h3>`;
                        if (item.description) bentoItem.innerHTML += `<p>${replacePlaceholders(item.description, siteData.companyName, siteData.contactDetails?.address)}</p>`;
                    }
                    bentoGridContainer.appendChild(bentoItem);
                });
            } else if (bentoGridContainer) {
                bentoGridContainer.innerHTML = "<p>Key features information is currently unavailable.</p>";
            }
        }
        
        if (pageData.ctaBar) {
            setTextById('home-cta-bar-title', pageData.ctaBar.title, "Ready to Start?");
            setTextById('home-cta-bar-text', pageData.ctaBar.text, "Contact us today!");
            setLinkById('home-cta-bar-button', pageData.ctaBar.buttonLink, pageData.ctaBar.buttonText);
        } else {
            const ctaBarSection = document.getElementById('home-cta-bar');
            if (ctaBarSection) ctaBarSection.style.display = 'none';
        }

        if (pageData.aboutTeaser) {
            const teaserSection = document.getElementById('about-teaser');
            if (teaserSection) {
                const titleEl = teaserSection.querySelector('.about-teaser-text-col h2');
                if(titleEl) titleEl.textContent = replacePlaceholders(pageData.aboutTeaser.title || "About Us", siteData.companyName, siteData.contactDetails?.address);
                const textEl = teaserSection.querySelector('.about-teaser-text-col p');
                if(textEl) textEl.textContent = replacePlaceholders(pageData.aboutTeaser.text || "Learn more about our company.", siteData.companyName, siteData.contactDetails?.address);
                
                const buttonEl = teaserSection.querySelector('.about-teaser-button');
                if(buttonEl) {
                    buttonEl.textContent = replacePlaceholders(pageData.aboutTeaser.buttonText || "Learn More", siteData.companyName, siteData.contactDetails?.address);
                    buttonEl.href = pageData.aboutTeaser.buttonLink || "about.html";
                }
                const teaserImg = teaserSection.querySelector('.about-teaser-image-col img');
                if (teaserImg) {
                     setImageById(teaserImg.id, pageData.aboutTeaser.imageSrc, pageData.aboutTeaser.imageAlt || 'About us teaser image'); // Requires ID
                }
            }
        }
        
        if (pageData.testimonials?.items) {
            const testimonialsSection = document.getElementById('testimonials');
            if (testimonialsSection && pageData.testimonials.title) {
                const h2 = testimonialsSection.querySelector('h2');
                if(h2) h2.textContent = replacePlaceholders(pageData.testimonials.title, siteData.companyName, siteData.contactDetails?.address);
            }
            const testimonialTrack = document.querySelector('#testimonials .testimonial-track');
            if (testimonialTrack && Array.isArray(pageData.testimonials.items) && pageData.testimonials.items.length > 0) {
                testimonialTrack.innerHTML = ''; 
                pageData.testimonials.items.forEach(item => {
                    const card = document.createElement('div');
                    card.classList.add('testimonial-card');
                    card.innerHTML = `
                        <blockquote class="testimonial-quote">${replacePlaceholders(item.quote || "A great experience!", siteData.companyName, siteData.contactDetails?.address)}</blockquote>
                        <p class="testimonial-author">${replacePlaceholders(item.author || "Anonymous", siteData.companyName, siteData.contactDetails?.address)}</p>
                        ${item.company ? `<p class="testimonial-company">${replacePlaceholders(item.company, siteData.companyName, siteData.contactDetails?.address)}</p>` : ''}
                    `;
                    testimonialTrack.appendChild(card);
                });
                if (typeof initTestimonialSlider === 'function') {
                    initTestimonialSlider();
                }
            } else if (testimonialTrack) {
                testimonialTrack.innerHTML = "<p>No testimonials to display at the moment.</p>";
                const prevButton = document.querySelector('#testimonials .prev-slide');
                const nextButton = document.querySelector('#testimonials .next-slide');
                if(prevButton) prevButton.style.display = 'none';
                if(nextButton) nextButton.style.display = 'none';
            }
        }
        
        if (pageData.blogTeaser && siteData.pages?.blog?.posts) {
            setTextById('latest-blog-teaser-title', pageData.blogTeaser.title, "From Our Blog");
            const postsContainer = document.getElementById('latest-blog-posts-container');
            setLinkById('latest-blog-teaser-viewall', 'blog.html', pageData.blogTeaser.viewAllText || "View All Posts");

            if (postsContainer) {
                postsContainer.innerHTML = '';
                const allPosts = siteData.pages.blog.posts || [];
                const numPostsToShow = pageData.blogTeaser.numPosts || 3;
                const sortedPosts = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
                const recentPosts = sortedPosts.slice(0, numPostsToShow);

                if (recentPosts.length > 0) {
                    recentPosts.forEach(post => {
                        const article = document.createElement('article');
                        article.className = 'blog-post-summary animate-on-scroll';
                        const postDate = new Date(post.date);
                        const formattedDate = !isNaN(postDate.getTime()) 
                                            ? postDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
                                            : (post.date || "Date not available");
                        
                        const imageHTML = post.imagePlaceholder ? `<img src="${post.imagePlaceholder}" alt="Image for ${replacePlaceholders(post.title || "Blog Post", siteData.companyName, siteData.contactDetails?.address)}" onerror="this.onerror=null;this.src='assets/images/blog1-placeholder.png';this.alt='Error loading image for blog post';">` : '';

                        article.innerHTML = `
                            ${imageHTML}
                            <div class="blog-post-summary-content">
                                <h3><a href="${post.detailPageUrl || '#'}">${replacePlaceholders(post.title || "Blog Post Title", siteData.companyName, siteData.contactDetails?.address)}</a></h3>
                                <p class="post-meta">Published on <time datetime="${post.date || ''}">${formattedDate}</time> by ${replacePlaceholders(post.author || "Author", siteData.companyName, siteData.contactDetails?.address)}</p>
                                <p>${replacePlaceholders(post.summary || "Read more...", siteData.companyName, siteData.contactDetails?.address)}</p>
                                <a href="${post.detailPageUrl || '#'}" class="button">Read More</a>
                            </div>
                        `;
                        postsContainer.appendChild(article);
                    });
                } else {
                    postsContainer.innerHTML = "<p>No recent blog posts to display.</p>";
                }
            }
        } else {
             const blogTeaserSection = document.getElementById('latest-blog-teaser');
             if(blogTeaserSection) blogTeaserSection.style.display = 'none';
        }
    }

    function populateAboutPage() {
        const pageData = siteData?.pages?.about;
        if (!pageData) {
            console.warn("About page data not found in siteData.");
            return;
        }
        const companyName = siteData.companyName || 'Website';
        document.title = `${replacePlaceholders(pageData.hero?.title || "About Us", companyName, siteData.contactDetails?.address)} - ${companyName}`;
        setMeta('description', pageData.metaDescription || `Learn more about ${companyName}.`);

        if (pageData.hero) {
            setTextById('about-hero-title', pageData.hero.title, "About Our Company");
            setTextById('about-hero-subtitle', pageData.hero.subtitle, "Our story and mission.");
            const heroBgPlaceholder = document.querySelector('#about-hero .hero-background-placeholder');
            if (heroBgPlaceholder && pageData.hero.imagePlaceholder) {
                heroBgPlaceholder.style.backgroundImage = `url('${pageData.hero.imagePlaceholder}')`;
            } else if (heroBgPlaceholder) {
                heroBgPlaceholder.style.backgroundImage = `url('assets/images/placeholder-about-hero.jpg')`;
            }
        }

        if (pageData.ourStory) {
            setTextById('our-story-title', pageData.ourStory.title, "Our Story");
            const storyBlocksContainer = document.getElementById('story-blocks-container');
            if (storyBlocksContainer && Array.isArray(pageData.ourStory.blocks) && pageData.ourStory.blocks.length > 0) {
                storyBlocksContainer.innerHTML = ''; 
                pageData.ourStory.blocks.forEach((block, index) => {
                    const blockDiv = document.createElement('div');
                    blockDiv.classList.add('story-block', 'animate-on-scroll');
                    
                    const textCol = document.createElement('div');
                    textCol.classList.add('story-text-col');
                    const p = document.createElement('p');
                    p.textContent = replacePlaceholders(block.text || "A part of our story.", siteData.companyName, siteData.contactDetails?.address);
                    textCol.appendChild(p);

                    const imageCol = document.createElement('div');
                    imageCol.classList.add('story-image-col');
                    const img = document.createElement('img');
                    img.src = block.imagePlaceholder || 'assets/images/placeholder-our-story.jpg';
                    img.alt = replacePlaceholders(block.imageAlt || "Story image", siteData.companyName, siteData.contactDetails?.address);
                    img.onerror = () => { img.src = 'assets/images/placeholder-our-story.jpg'; img.alt = 'Error loading story image';};
                    imageCol.appendChild(img);

                    if (index % 2 === 0) { 
                        blockDiv.classList.add('image-left');
                        blockDiv.appendChild(imageCol);
                        blockDiv.appendChild(textCol);
                    } else { 
                        blockDiv.classList.add('image-right');
                        blockDiv.appendChild(textCol);
                        blockDiv.appendChild(imageCol);
                    }
                    storyBlocksContainer.appendChild(blockDiv);
                });
            } else if (storyBlocksContainer) {
                storyBlocksContainer.innerHTML = "<p>Our story is being written...</p>";
            }
        }

        if (pageData.team) {
            setTextById('team-title', pageData.team.title, "Our Team");
            setTextById('team-intro-text', pageData.team.introText, "Meet our experts.");
            const teamGridContainer = document.getElementById('team-grid-container');
            if (teamGridContainer && Array.isArray(pageData.team.members) && pageData.team.members.length > 0) {
                teamGridContainer.innerHTML = ''; 
                pageData.team.members.forEach(member => {
                    const card = document.createElement('div');
                    card.classList.add('team-member-card', 'animate-on-scroll');
                    let socialLinksHTML = '';
                    if(member.socialLinks && Array.isArray(member.socialLinks) && member.socialLinks.length > 0) {
                        socialLinksHTML = `<ul class="team-member-social">${member.socialLinks.map(link => `<li><a href="${link.url || '#'}" target="_blank" rel="noopener noreferrer">${link.platform}</a></li>`).join('')}</ul>`;
                    }
                    card.innerHTML = `
                        <div class="team-member-photo">
                            <img src="${member.imagePlaceholder || 'assets/images/placeholder-team-member.png'}" alt="Photo of ${replacePlaceholders(member.name || "Team Member", siteData.companyName, siteData.contactDetails?.address)}" onerror="this.onerror=null;this.src='assets/images/placeholder-team-member.png';this.alt='Error loading team member photo';">
                        </div>
                        <h3 class="team-member-name">${replacePlaceholders(member.name || "Team Member", siteData.companyName, siteData.contactDetails?.address)}</h3>
                        <p class="team-member-title">${replacePlaceholders(member.title || "Role", siteData.companyName, siteData.contactDetails?.address)}</p>
                        <div class="team-member-contact-overlay">
                            <p class="team-member-bio">${replacePlaceholders(member.bio || "Bio placeholder.", siteData.companyName, siteData.contactDetails?.address)}</p>
                            ${socialLinksHTML}
                        </div>
                    `;
                    teamGridContainer.appendChild(card);
                });
            } else if (teamGridContainer) {
                teamGridContainer.innerHTML = "<p>Team information coming soon.</p>";
            }
        }

        if (pageData.values) {
            setTextById('values-title', pageData.values.title, "Our Values");
            setTextById('values-intro-text', pageData.values.introText, "The principles that guide us.");
            const valuesListContainer = document.getElementById('values-list-container');
            if (valuesListContainer && Array.isArray(pageData.values.list) && pageData.values.list.length > 0) {
                valuesListContainer.innerHTML = ''; 
                pageData.values.list.forEach(value => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('value-item', 'animate-on-scroll');
                    itemDiv.innerHTML = `
                        ${value.iconPlaceholder ? `<div class="value-icon-placeholder">${value.iconPlaceholder}</div>` : ''}
                        <h3>${replacePlaceholders(value.name || "Value", siteData.companyName, siteData.contactDetails?.address)}</h3>
                        <p>${replacePlaceholders(value.description || "Value description.", siteData.companyName, siteData.contactDetails?.address)}</p>
                    `;
                    valuesListContainer.appendChild(itemDiv);
                });
            } else if (valuesListContainer) {
                valuesListContainer.innerHTML = "<p>Our core values will be shared soon.</p>";
            }
        }

        if (pageData.missionVision) {
            setTextById('mission-vision-section-title', pageData.missionVision.sectionTitle, "Our Mission & Vision");
            setTextById('mission-title', pageData.missionVision.missionTitle, "Our Mission");
            setHtmlById('mission-text', pageData.missionVision.missionText, "Our mission will be defined here.");
            setTextById('vision-title', pageData.missionVision.visionTitle, "Our Vision");
            setHtmlById('vision-text', pageData.missionVision.visionText, "Our vision will be defined here.");
        } else {
             const mvSection = document.getElementById('mission-vision');
             if(mvSection) mvSection.style.display = 'none';
        }

        if (pageData.companyCulture) {
            setTextById('culture-section-title', pageData.companyCulture.sectionTitle, "Our Culture");
            setHtmlById('culture-main-text', pageData.companyCulture.mainText, "Details about our company culture are coming soon.");
            setImageById('culture-image', pageData.companyCulture.imageSrc, pageData.companyCulture.imageAlt || 'Company culture image');
        } else {
            const ccSection = document.getElementById('company-culture');
            if(ccSection) ccSection.style.display = 'none';
        }

        if (pageData.communityInvolvement) {
            setTextById('community-section-title', pageData.communityInvolvement.sectionTitle, "Community Involvement");
            setHtmlById('community-main-text', pageData.communityInvolvement.mainText, "We are committed to our community.");
            const listContainer = document.getElementById('community-involvement-list-container');
            if (listContainer && Array.isArray(pageData.communityInvolvement.items) && pageData.communityInvolvement.items.length > 0) {
                listContainer.innerHTML = '';
                pageData.communityInvolvement.items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = replacePlaceholders(item.text || "Community initiative.", siteData.companyName, siteData.contactDetails?.address);
                    listContainer.appendChild(li);
                });
            } else if (listContainer) {
                listContainer.innerHTML = "<li>Details on our community involvement coming soon.</li>";
            }
        } else {
             const ciSection = document.getElementById('community-involvement');
             if(ciSection) ciSection.style.display = 'none';
        }

        if (pageData.careersTeaser) {
            setTextById('careers-section-title', pageData.careersTeaser.sectionTitle, "Join Our Team");
            setHtmlById('careers-main-text', pageData.careersTeaser.mainText, "Interested in a career with us?");
            setLinkById('careers-button', pageData.careersTeaser.buttonLink, pageData.careersTeaser.buttonText);
        } else {
             const ctSection = document.getElementById('careers-teaser');
             if(ctSection) ctSection.style.display = 'none';
        }
    }
    
    function populateServicesPage() {
        const pageData = siteData?.pages?.services;
        if (!pageData) {
            console.warn("Services page data not found in siteData.");
            return;
        }
        const companyName = siteData.companyName || 'Website';
        document.title = `${replacePlaceholders(pageData.pageTitle || "Our Services", companyName, siteData.contactDetails?.address)} - ${companyName}`;
        setMeta('description', `Discover the range of services offered by ${companyName}. ${replacePlaceholders(pageData.introductionText || '', companyName, siteData.contactDetails?.address)}`);

        setTextById('services-page-title', pageData.pageTitle, "Our Services");
        setHtmlById('services-intro-text', pageData.introductionText, "Explore our offerings.");

        const serviceItemsContainer = document.getElementById('service-items-container');
        if (serviceItemsContainer && Array.isArray(pageData.serviceList) && pageData.serviceList.length > 0) {
            serviceItemsContainer.innerHTML = '';
            pageData.serviceList.forEach(service => {
                const card = document.createElement('div');
                card.className = 'service-card animate-on-scroll';
                card.innerHTML = `
                    <div class="service-card-image-container">
                        <img src="${service.imagePlaceholder || 'assets/images/service-placeholder.png'}" alt="${replacePlaceholders(service.name || 'Service', siteData.companyName, siteData.contactDetails?.address)}" onerror="this.onerror=null;this.src='assets/images/service-placeholder.png';this.alt='Error loading service image';">
                    </div>
                    <div class="service-card-content">
                        <h3>${replacePlaceholders(service.name || "Service Title", siteData.companyName, siteData.contactDetails?.address)}</h3>
                        <p>${replacePlaceholders(service.shortDescription || "Service description.", siteData.companyName, siteData.contactDetails?.address)}</p>
                        <a href="${service.detailPageUrl || '#'}" class="button service-card-cta">Learn More</a>
                    </div>
                `;
                serviceItemsContainer.appendChild(card);
            });
        } else if (serviceItemsContainer) {
            serviceItemsContainer.innerHTML = "<p>Service details are currently unavailable. Please check back soon.</p>";
        }

        if (pageData.ourApproach) {
            setTextById('services-approach-title', pageData.ourApproach.title, "Our Service Approach");
            setHtmlById('services-approach-main-text', pageData.ourApproach.mainText, "Learn about how we work.");
            const stepsContainer = document.getElementById('services-approach-steps-container');
            if (stepsContainer && Array.isArray(pageData.ourApproach.steps) && pageData.ourApproach.steps.length > 0) {
                stepsContainer.innerHTML = '';
                pageData.ourApproach.steps.forEach(step => {
                    const stepDiv = document.createElement('div');
                    stepDiv.className = 'approach-step'; 
                    stepDiv.style.flex = '1'; // Basic styling if not in CSS
                    stepDiv.style.minWidth = '200px';
                    stepDiv.style.padding = 'var(--space-sm)';
                    stepDiv.style.border = '1px solid var(--border-color)';
                    stepDiv.innerHTML = `
                        <h4>${replacePlaceholders(step.title || "Step Title", siteData.companyName, siteData.contactDetails?.address)}</h4>
                        <p class="text-small">${replacePlaceholders(step.description || "Step description.", siteData.companyName, siteData.contactDetails?.address)}</p>
                    `;
                    stepsContainer.appendChild(stepDiv);
                });
            } else if (stepsContainer) {
                stepsContainer.innerHTML = "<p>Our approach details coming soon.</p>";
            }
        } else {
            const saSection = document.getElementById('services-our-approach');
            if(saSection) saSection.style.display = 'none';
        }
        
        if (pageData.whyChooseUs) {
            setTextById('services-why-title', pageData.whyChooseUs.title, "Why Choose Us?");
            setHtmlById('services-why-main-text', pageData.whyChooseUs.mainText, "Discover the benefits of partnering with us.");
            const diffContainer = document.getElementById('services-differentiators-container');
            if (diffContainer && Array.isArray(pageData.whyChooseUs.differentiators) && pageData.whyChooseUs.differentiators.length > 0) {
                diffContainer.innerHTML = '';
                pageData.whyChooseUs.differentiators.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'differentiator-item'; 
                    itemDiv.innerHTML = `
                        <h4>${replacePlaceholders(item.title || "Key Differentiator", siteData.companyName, siteData.contactDetails?.address)}</h4>
                        <p class="text-small">${replacePlaceholders(item.description || "Description.", siteData.companyName, siteData.contactDetails?.address)}</p>
                    `;
                    diffContainer.appendChild(itemDiv);
                });
            } else if (diffContainer) {
                diffContainer.innerHTML = "<p>Reasons to choose us will be detailed soon.</p>";
            }
        } else {
             const wcSection = document.getElementById('services-why-choose-us');
            if(wcSection) wcSection.style.display = 'none';
        }

        if (pageData.benefits) {
            setTextById('services-benefits-title', pageData.benefits.title, "Expected Benefits");
            setHtmlById('services-benefits-main-text', pageData.benefits.mainText, "Our services offer significant advantages.");
            const benefitsList = document.getElementById('services-benefits-list-container');
            if (benefitsList && Array.isArray(pageData.benefits.items) && pageData.benefits.items.length > 0) {
                benefitsList.innerHTML = '';
                pageData.benefits.items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = replacePlaceholders(item.text || "Benefit item.", siteData.companyName, siteData.contactDetails?.address);
                    benefitsList.appendChild(li);
                });
            } else if (benefitsList) {
                benefitsList.innerHTML = "<li>Benefit details coming soon.</li>";
            }
        } else {
             const sbSection = document.getElementById('services-benefits');
            if(sbSection) sbSection.style.display = 'none';
        }

        if (pageData.caseStudiesTeaser) {
            setTextById('services-casestudies-title', pageData.caseStudiesTeaser.title, "Success in Action");
            setHtmlById('services-casestudies-main-text', pageData.caseStudiesTeaser.mainText, "See how we've helped others.");
            setImageById('services-casestudies-image', pageData.caseStudiesTeaser.imageSrc, pageData.caseStudiesTeaser.imageAlt || 'Case study teaser image');
            setTextById('services-casestudies-caption', pageData.caseStudiesTeaser.caption, "Visual representation of success.");
        } else {
             const scsSection = document.getElementById('services-case-studies-teaser');
            if(scsSection) scsSection.style.display = 'none';
        }

        if (pageData.faq) {
            setTextById('services-faq-title', pageData.faq.title, "Services FAQ");
            setHtmlById('services-faq-main-text', pageData.faq.mainText, "Common questions about our services.");
            const faqContainer = document.getElementById('services-faq-list-container');
            if (faqContainer && Array.isArray(pageData.faq.items) && pageData.faq.items.length > 0) {
                faqContainer.innerHTML = '';
                pageData.faq.items.forEach(item => {
                    const faqDiv = document.createElement('div');
                    faqDiv.className = 'faq-item';
                    faqDiv.style.marginTop = 'var(--space-md)'; 
                    faqDiv.innerHTML = `
                        <h4>${replacePlaceholders(item.question || "FAQ Question", siteData.companyName, siteData.contactDetails?.address)}</h4>
                        <p class="text-small">${replacePlaceholders(item.answer || "FAQ answer.", siteData.companyName, siteData.contactDetails?.address)}</p>
                    `;
                    faqContainer.appendChild(faqDiv);
                });
            } else if (faqContainer) {
                faqContainer.innerHTML = "<p>FAQs coming soon.</p>";
            }
        } else {
            const sfSection = document.getElementById('services-faq');
            if(sfSection) sfSection.style.display = 'none';
        }
        
        if (pageData.customQuoteCta) {
            setTextById('services-ctaquote-title', pageData.customQuoteCta.title, "Need a Custom Solution?");
            setHtmlById('services-ctaquote-main-text', pageData.customQuoteCta.mainText, "Contact us for a tailored quote.");
            setLinkById('services-ctaquote-button', pageData.customQuoteCta.buttonLink, pageData.customQuoteCta.buttonText);
        } else {
            const scqSection = document.getElementById('services-cta-quote');
            if(scqSection) scqSection.style.display = 'none';
        }
    }

    function populateContactPage() {
        const pageData = siteData?.pages?.contact;
        if (!pageData) {
            console.warn("Contact page data not found in siteData.");
            return;
        }
        const companyName = siteData.companyName || 'Website';
        document.title = `${replacePlaceholders(pageData.pageTitle || "Contact Us", companyName, siteData.contactDetails?.address)} - ${companyName}`;
        setMeta('description', `Get in touch with ${companyName}. ${replacePlaceholders(pageData.introText || '', companyName, siteData.contactDetails?.address)}`);

        setTextById('contact-page-title', pageData.pageTitle, "Contact Us");
        setHtmlById('contact-intro-text', pageData.introText, "We'd love to hear from you.");
        setTextById('contact-form-title', pageData.formSectionTitle, "Send Us a Message");
        setTextById('contact-info-title', pageData.contactInfoTitle, "Our Contact Details");
        
        const addressBlock = document.getElementById('contact-address-block');
        if (addressBlock && siteData.contactDetails) {
            let addressHTML = `${siteData.companyName || 'Our Company'}<br>`;
            if (siteData.contactDetails.address) addressHTML += `${replacePlaceholders(siteData.contactDetails.address, siteData.companyName, siteData.contactDetails?.address)}<br>`;
            if (siteData.contactDetails.email) addressHTML += `Email: <a href="mailto:${siteData.contactDetails.email}">${siteData.contactDetails.email}</a><br>`;
            if (siteData.contactDetails.phone) addressHTML += `Phone: <a href="tel:${siteData.contactDetails.phone.replace(/[^0-9+]/g, '')}">${siteData.contactDetails.phone}</a>`;
            addressBlock.innerHTML = addressHTML;
        } else if (addressBlock) {
            addressBlock.innerHTML = "Contact details unavailable.";
        }

        const mapPlaceholder = document.querySelector('#map-container .map-placeholder');
        if (mapPlaceholder && pageData.mapPlaceholderText) {
            mapPlaceholder.textContent = replacePlaceholders(pageData.mapPlaceholderText, siteData.companyName, siteData.contactDetails?.address);
        } else if (mapPlaceholder) {
            mapPlaceholder.textContent = "Map information will be available here.";
        }
        
        const contactForm = document.getElementById('contactForm');
        if (contactForm && pageData.formspreeEndpoint) {
            contactForm.action = pageData.formspreeEndpoint;
        } else if (contactForm && !pageData.formspreeEndpoint && !contactForm.getAttribute('data-netlify')) {
            const submitButton = contactForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Form Unavailable";
                 const formMsg = document.createElement('p');
                 formMsg.textContent = "Contact form is currently unavailable.";
                 formMsg.style.color = 'red';
                 contactForm.prepend(formMsg);
            }
        }

        if (pageData.officeHours) {
            setTextById('contact-office-hours-title', pageData.officeHours.title, "Our Office Hours");
            setHtmlById('contact-office-hours-text', pageData.officeHours.text, "Office hours will be listed here.");
        } else {
             const ohSection = document.getElementById('contact-office-hours');
             if(ohSection) ohSection.style.display = 'none';
        }

        if (pageData.responseExpectations) {
            setTextById('contact-response-title', pageData.responseExpectations.title, "Response Expectations");
            setHtmlById('contact-response-text', pageData.responseExpectations.text, "We aim to respond promptly.");
        } else {
             const reSection = document.getElementById('contact-response-expectations');
             if(reSection) reSection.style.display = 'none';
        }

        if (pageData.socialConnect) {
            setTextById('contact-social-title', pageData.socialConnect.title, "Connect With Us");
            setHtmlById('contact-social-intro', pageData.socialConnect.introText, "Follow us on social media.");
            const linksContainer = document.getElementById('contact-social-links-container');
            if (linksContainer && Array.isArray(pageData.socialConnect.links) && pageData.socialConnect.links.length > 0) {
                linksContainer.innerHTML = '';
                pageData.socialConnect.links.forEach(link => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="${link.url || '#'}" target="_blank" rel="noopener noreferrer">${replacePlaceholders(link.platform || "Social Platform", siteData.companyName, siteData.contactDetails?.address)}</a>`;
                    linksContainer.appendChild(li);
                });
            } else if (linksContainer) {
                linksContainer.innerHTML = "<li>Social media links coming soon.</li>";
            }
        } else {
            const csSection = document.getElementById('contact-social-connect');
            if(csSection) csSection.style.display = 'none';
        }
        
        if (pageData.locationHighlights) {
            setTextById('contact-location-title', pageData.locationHighlights.title, "Location Highlights");
            setHtmlById('contact-location-text', pageData.locationHighlights.text, "Information about our location.");
        } else {
            const lhSection = document.getElementById('contact-location-highlights');
            if(lhSection) lhSection.style.display = 'none';
        }

        if (pageData.faqs) {
            setTextById('contact-faqs-title', pageData.faqs.title, "Contact FAQs");
            setHtmlById('contact-faqs-intro', pageData.faqs.introText, "Common questions about contacting us.");
            const faqsContainer = document.getElementById('contact-faqs-list-container');
            if (faqsContainer && Array.isArray(pageData.faqs.items) && pageData.faqs.items.length > 0) {
                faqsContainer.innerHTML = '';
                pageData.faqs.items.forEach(item => {
                    const faqDiv = document.createElement('div');
                    faqDiv.className = 'faq-item';
                    faqDiv.style.marginTop = 'var(--space-md)';
                    faqDiv.innerHTML = `
                        <h4>${replacePlaceholders(item.question || "FAQ Question", siteData.companyName, siteData.contactDetails?.address)}</h4>
                        <p class="text-small">${replacePlaceholders(item.answer || "FAQ answer.", siteData.companyName, siteData.contactDetails?.address)}</p>
                    `;
                    faqsContainer.appendChild(faqDiv);
                });
            } else if (faqsContainer) {
                faqsContainer.innerHTML = "<p>FAQs for contacting us are coming soon.</p>";
            }
        } else {
            const cfSection = document.getElementById('contact-faqs');
            if(cfSection) cfSection.style.display = 'none';
        }
    }

    function populateBlogPage() {
        const pageData = siteData?.pages?.blog;
        if (!pageData) {
            console.warn("Blog page data not found in siteData.");
            return;
        }
        const companyName = siteData.companyName || 'Website';
        document.title = `${replacePlaceholders(pageData.pageTitle || "Our Blog", companyName, siteData.contactDetails?.address)} - ${companyName}`;
        setMeta('description', `Read the latest articles and insights from ${companyName}. ${replacePlaceholders(pageData.introductionText || '', companyName, siteData.contactDetails?.address)}`);

        const blogHeader = document.getElementById('blog-header');
        if (blogHeader) {
            const h1 = blogHeader.querySelector('h1');
            if (h1) h1.textContent = replacePlaceholders(pageData.pageTitle || "Our Blog", companyName, siteData.contactDetails?.address);
            const p = blogHeader.querySelector('p');
            if (p) p.textContent = replacePlaceholders(pageData.introductionText || "Latest news and articles.", companyName, siteData.contactDetails?.address);
        }

        const blogItemsContainer = document.getElementById('blog-item-container');
        if (blogItemsContainer && Array.isArray(pageData.posts) && pageData.posts.length > 0) {
            blogItemsContainer.innerHTML = '';
            const sortedPosts = [...pageData.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
            sortedPosts.forEach(post => {
                const article = document.createElement('article');
                article.className = 'blog-post-summary animate-on-scroll';
                const postDate = new Date(post.date);
                const formattedDate = !isNaN(postDate.getTime()) 
                                    ? postDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
                                    : (post.date || "Date not available");
                
                const imageHTML = post.imagePlaceholder ? `<img src="${post.imagePlaceholder}" alt="Image for ${replacePlaceholders(post.title || "Blog Post", siteData.companyName, siteData.contactDetails?.address)}" onerror="this.onerror=null;this.src='assets/images/blog1-placeholder.png'; this.alt='Error loading image';">` : '';

                article.innerHTML = `
                    ${imageHTML}
                    <div class="blog-post-summary-content">
                        <h3><a href="${post.detailPageUrl || '#'}">${replacePlaceholders(post.title || "Blog Post Title", siteData.companyName, siteData.contactDetails?.address)}</a></h3>
                        <p class="post-meta">Published on <time datetime="${post.date || ''}">${formattedDate}</time> by ${replacePlaceholders(post.author || "Author", siteData.companyName, siteData.contactDetails?.address)}</p>
                        <p>${replacePlaceholders(post.summary || "Read more...", siteData.companyName, siteData.contactDetails?.address)}</p>
                        <a href="${post.detailPageUrl || '#'}" class="button">Read More</a>
                    </div>
                `;
                blogItemsContainer.appendChild(article);
            });
        } else if (blogItemsContainer) {
            blogItemsContainer.innerHTML = "<p>No blog posts available at this time. Please check back later!</p>";
        }

        // Populate Blog Page Additional Sections
        if (pageData.featuredPostSpotlight) {
            setTextById('blog-featured-post-title', pageData.featuredPostSpotlight.title, "Featured Post Spotlight");
            const postIdToFeature = pageData.featuredPostSpotlight.postIdToFeature;
            const featuredPostData = pageData.posts?.find(p => p.id === postIdToFeature);
            
            if (featuredPostData) {
                setTextById('blog-featured-post-article-title', featuredPostData.title, "Featured Article");
                setTextById('blog-featured-post-text', pageData.featuredPostSpotlight.text || featuredPostData.summary, "Read our highlighted post.");
                setLinkById('blog-featured-post-link', featuredPostData.detailPageUrl, "Read Featured Post");
            } else {
                // Fallback if specific post not found but teaser text is provided
                setTextById('blog-featured-post-article-title', "Featured Article");
                setTextById('blog-featured-post-text', pageData.featuredPostSpotlight.text || "Check out our latest content.", "Read our highlighted post.");
                setLinkById('blog-featured-post-link', "#", "Explore Blog");
                if (!pageData.featuredPostSpotlight.text && !featuredPostData) { // Hide if no specific content
                     const fpSection = document.getElementById('featured-post-spotlight');
                     if(fpSection) fpSection.style.display = 'none';
                }
            }
        } else {
             const fpSection = document.getElementById('featured-post-spotlight');
             if(fpSection) fpSection.style.display = 'none';
        }

        if (pageData.blogCategoriesOverview) {
            setTextById('blog-categories-title', pageData.blogCategoriesOverview.title, "Explore by Category");
            setTextById('blog-categories-intro', pageData.blogCategoriesOverview.introText, "Find articles by topic.");
            setTextById('blog-categories-placeholder-text', pageData.blogCategoriesOverview.categoriesPlaceholderText, "Categories coming soon.");
        } else {
             const bcSection = document.getElementById('blog-categories-overview');
             if(bcSection) bcSection.style.display = 'none';
        }
        
        if (pageData.authorSpotlightBlog) {
            setTextById('blog-author-spotlight-title', pageData.authorSpotlightBlog.title, "Meet Our Authors");
            setHtmlById('blog-author-spotlight-text', pageData.authorSpotlightBlog.text, "Our writers share their expertise.");
            setImageById('blog-author-spotlight-image', pageData.authorSpotlightBlog.imageSrc, pageData.authorSpotlightBlog.imageAlt || 'Author spotlight image');
        } else {
             const basSection = document.getElementById('author-spotlight-blog');
             if(basSection) basSection.style.display = 'none';
        }

        if (pageData.blogArchivesLink) {
            setTextById('blog-archives-title', pageData.blogArchivesLink.title, "Looking for Older Posts?");
            setHtmlById('blog-archives-text', pageData.blogArchivesLink.text, "Explore past articles.");
            setLinkById('blog-archives-button', pageData.blogArchivesLink.buttonLink, pageData.blogArchivesLink.buttonText);
        } else {
             const balSection = document.getElementById('blog-archives-link');
             if(balSection) balSection.style.display = 'none';
        }
        
        if (pageData.blogSubscribeCta) {
            setTextById('blog-subscribe-title', pageData.blogSubscribeCta.title, "Stay Updated!");
            setHtmlById('blog-subscribe-text', pageData.blogSubscribeCta.text, "Subscribe to our newsletter.");
            setTextById('blog-subscribe-placeholder-text', pageData.blogSubscribeCta.formPlaceholderText, "(Subscription form or link will appear here)");
            // For the button inside the placeholder div - assuming structure is: div#blog-subscribe-form-placeholder > a.button
            const subscribeButton = document.querySelector('#blog-subscribe-form-placeholder .button');
            if(subscribeButton && subscribeButton.tagName === 'A'){
                 setLinkById(subscribeButton.id, pageData.blogSubscribeCta.buttonLink, pageData.blogSubscribeCta.buttonText);
            }
        } else {
             const bscSection = document.getElementById('blog-subscribe-cta');
             if(bscSection) bscSection.style.display = 'none';
        }

        if (pageData.relatedTopicsBlog) {
            setTextById('blog-related-topics-title', pageData.relatedTopicsBlog.title, "Related Topics");
            setHtmlById('blog-related-topics-intro', pageData.relatedTopicsBlog.introText, "Explore related content.");
            setTextById('blog-related-topics-placeholder-text', pageData.relatedTopicsBlog.topicsPlaceholderText, "(Related topics or service links will be shown here)");
        } else {
             const brtSection = document.getElementById('related-topics-blog');
             if(brtSection) brtSection.style.display = 'none';
        }
    }

    function populateServiceDetailPage() {
        const params = new URLSearchParams(window.location.search);
        const serviceId = params.get('service');
        if (!serviceId) {
            console.error("No service ID provided in URL.");
            document.querySelector('main').innerHTML = '<p class="error-message">Service details could not be loaded. No service specified.</p>';
            return;
        }

        const service = siteData?.pages?.services?.serviceList?.find(s => s.id === serviceId);
        if (!service || !service.detailContent) {
            console.error(`Service with ID "${serviceId}" or its detailContent not found.`);
             document.querySelector('main').innerHTML = '<p class="error-message">Sorry, the requested service details could not be found. Please try again or check our main services page.</p>';
            return;
        }
        
        const detail = service.detailContent;
        const companyName = siteData.companyName || 'Website';

        document.title = replacePlaceholders(detail.pageTitle || service.name || "Service Detail", companyName, siteData.contactDetails?.address) + ` - ${companyName}`;
        setMeta('description', replacePlaceholders(detail.metaDescription || service.shortDescription || `Details about ${service.name}`, companyName, siteData.contactDetails?.address));

        // Hero Banner for Service Detail
        setTextById('service-detail-title', replacePlaceholders(service.name || "Service Name", companyName, siteData.contactDetails?.address));
        const heroBgPlaceholder = document.querySelector('#service-detail-hero .hero-background-placeholder');
        if (heroBgPlaceholder && detail.bannerImagePlaceholder) {
            heroBgPlaceholder.style.backgroundImage = `url('${detail.bannerImagePlaceholder}')`;
        } else if (heroBgPlaceholder) {
            heroBgPlaceholder.style.backgroundImage = `url('assets/images/placeholder-service-detail-banner.jpg')`; 
        }
        
        // Breadcrumb
        setTextById('breadcrumb-service-name', replacePlaceholders(service.name || "Service Detail", companyName, siteData.contactDetails?.address));

        // Main Content
        setTextById('service-overview-title', "Overview"); // Usually static title
        setHtmlById('service-overview-text', detail.overview || "Detailed overview coming soon.");

        const featuresContainer = document.getElementById('service-features-container');
        const featuresTitleEl = document.getElementById('service-features-title');
        if (featuresContainer && Array.isArray(detail.features) && detail.features.length > 0) {
            featuresContainer.innerHTML = '';
            if (featuresTitleEl) {
                featuresTitleEl.textContent = replacePlaceholders(detail.featuresSectionTitle || "Key Features", companyName, siteData.contactDetails?.address);
                featuresTitleEl.style.display = 'block';
            }
            detail.features.forEach((feature, index) => {
                const featureDiv = document.createElement('div');
                featureDiv.classList.add('feature-block', 'animate-on-scroll');
                // Alternate image left/right based on index for visual variety
                featureDiv.classList.add(index % 2 === 0 ? 'feature-block-text-left' : 'feature-block-image-left');

                const textCol = document.createElement('div');
                textCol.classList.add('feature-text-col');
                textCol.innerHTML = `
                    ${feature.iconPlaceholder ? `<span class="feature-icon-placeholder">${feature.iconPlaceholder}</span>` : ''}
                    <h3>${replacePlaceholders(feature.name || "Feature", companyName, siteData.contactDetails?.address)}</h3>
                    <p>${replacePlaceholders(feature.description || "Feature description.", companyName, siteData.contactDetails?.address)}</p>
                `;

                const imageCol = document.createElement('div');
                imageCol.classList.add('feature-image-col');
                if (feature.imagePlaceholder) {
                    const img = document.createElement('img');
                    img.src = feature.imagePlaceholder;
                    img.alt = replacePlaceholders(feature.imageAlt || feature.name || "Feature image", companyName, siteData.contactDetails?.address);
                    img.onerror = () => { img.src = 'assets/images/placeholder-service-feature.jpg'; img.alt='Error loading feature image'; };
                    imageCol.appendChild(img);
                } else {
                    imageCol.innerHTML = `<div class="image-placeholder-fallback" style="width:100%; height:200px; background: #eee; display:flex; align-items:center; justify-content:center; border-radius:8px;">Visual coming soon</div>`;
                }
                
                featureDiv.appendChild(textCol); // Default order, can be changed by CSS class 'feature-block-image-left'
                featureDiv.appendChild(imageCol);
                featuresContainer.appendChild(featureDiv);
            });
        } else if (featuresContainer) {
            featuresContainer.innerHTML = '<p>No specific features listed for this service yet.</p>';
            if(featuresTitleEl) featuresTitleEl.style.display = 'none';
        }

        const processTitleEl = document.getElementById('service-process-title');
        const processDescEl = document.getElementById('service-process-description');
        if(detail.processDescription && processTitleEl && processDescEl){
            processTitleEl.textContent = replacePlaceholders(detail.processSectionTitle || "Our Process", companyName, siteData.contactDetails?.address);
            processDescEl.innerHTML = replacePlaceholders(detail.processDescription, companyName, siteData.contactDetails?.address);
            processTitleEl.style.display = 'block';
            processDescEl.style.display = 'block';
        } else {
             if(processTitleEl) processTitleEl.style.display = 'none';
             if(processDescEl) processDescEl.style.display = 'none';
        }
        
        // Specific Testimonials
        const testimonialsSection = document.getElementById('service-detail-testimonials'); // Assuming a new section with this ID
        const testimonialsContainer = document.getElementById('service-detail-testimonials-container'); // Assuming a container within
        if (testimonialsContainer && Array.isArray(detail.specificTestimonials) && detail.specificTestimonials.length > 0) {
            if(testimonialsSection) testimonialsSection.style.display = 'block'; // Show the whole section
            testimonialsContainer.innerHTML = ''; // Clear placeholder
             const titleEl = testimonialsSection ? testimonialsSection.querySelector('h2') : null;
             if(titleEl) titleEl.textContent = "What Our Clients Say About This Service";

            detail.specificTestimonials.forEach(testimonial => {
                const testimonialDiv = document.createElement('div');
                testimonialDiv.className = 'testimonial-card'; // Re-use existing testimonial card style
                testimonialDiv.innerHTML = `
                    <blockquote class="testimonial-quote">${replacePlaceholders(testimonial.quote, companyName)}</blockquote>
                    <p class="testimonial-author">${replacePlaceholders(testimonial.author, companyName)}</p>
                    ${testimonial.company ? `<p class="testimonial-company">${replacePlaceholders(testimonial.company, companyName)}</p>` : ''}
                `;
                testimonialsContainer.appendChild(testimonialDiv);
            });
        } else if (testimonialsContainer) {
            testimonialsContainer.innerHTML = '<p>No specific testimonials for this service yet.</p>';
            if(testimonialsSection) testimonialsSection.style.display = 'none';
        }

        // Related Resources
        const resourcesSection = document.getElementById('service-detail-resources'); // Assuming a new section
        const resourcesContainer = document.getElementById('service-detail-resources-container'); // Assuming a container within
        if (resourcesContainer && Array.isArray(detail.relatedResources) && detail.relatedResources.length > 0) {
            if(resourcesSection) resourcesSection.style.display = 'block';
            resourcesContainer.innerHTML = ''; // Clear placeholder
            const titleEl = resourcesSection ? resourcesSection.querySelector('h2') : null;
            if(titleEl) titleEl.textContent = "Related Resources & Downloads";

            const ul = document.createElement('ul');
            detail.relatedResources.forEach(resource => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${resource.url || '#'}" target="_blank" rel="noopener noreferrer">${replacePlaceholders(resource.title, companyName)}</a> ${resource.type ? `(${resource.type})` : ''}`;
                ul.appendChild(li);
            });
            resourcesContainer.appendChild(ul);
        } else if (resourcesContainer) {
            resourcesContainer.innerHTML = '<p>No related resources available for this service at the moment.</p>';
            if(resourcesSection) resourcesSection.style.display = 'none';
        }

        const ctaButton = document.getElementById('service-detail-cta');
        if (ctaButton && detail.ctaButtonText && detail.ctaButtonLink) {
            ctaButton.textContent = replacePlaceholders(detail.ctaButtonText, companyName, siteData.contactDetails?.address);
            ctaButton.href = detail.ctaButtonLink;
            ctaButton.style.display = 'inline-block';
        } else if (ctaButton) {
            ctaButton.style.display = 'none';
        }
    }

    function populateBlogPostDetailPage() {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post');
         if (!postId) {
            console.error("No post ID provided in URL.");
            document.querySelector('main').innerHTML = '<p class="error-message">Blog post details could not be loaded. No post specified.</p>';
            return;
        }

        const post = siteData?.pages?.blog?.posts?.find(p => p.id === postId);
        if (!post || !post.detailContent) {
            console.error(`Blog post with ID "${postId}" or its detailContent not found.`);
            document.querySelector('main').innerHTML = '<p class="error-message">Sorry, the requested blog post could not be found.</p>';
            return;
        }
        
        const detail = post.detailContent;
        const companyName = siteData.companyName || 'Website';
        const allPosts = siteData.pages.blog.posts || [];

        document.title = replacePlaceholders(detail.pageTitle || post.title || "Blog Post", companyName, siteData.contactDetails?.address) + ` - ${companyName}`;
        setMeta('description', replacePlaceholders(detail.metaDescription || post.summary || `Read our article: ${post.title}`, companyName, siteData.contactDetails?.address));

        setTextById('breadcrumb-post-title', replacePlaceholders(post.title || "Blog Post", companyName, siteData.contactDetails?.address));
        setTextById('post-title', replacePlaceholders(post.title || "Post Title", companyName, siteData.contactDetails?.address));
        
        const postDate = new Date(post.date);
        const formattedDate = !isNaN(postDate.getTime()) 
                            ? postDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
                            : (post.date || "Date not available");
        setHtmlById('post-meta-info', `Published on <time datetime="${post.date || ''}">${formattedDate}</time> by ${replacePlaceholders(post.author || "Author", companyName, siteData.contactDetails?.address)}`);
        
        setImageById('post-main-image', detail.bannerImagePlaceholder || post.imagePlaceholder, post.title || "Blog post image", 'block', 'assets/images/blog-post-hero-placeholder.png');
        
        const bodyContentDiv = document.getElementById('post-body-content');
        if (bodyContentDiv) {
            if (Array.isArray(detail.fullText) && detail.fullText.length > 0) {
                bodyContentDiv.innerHTML = detail.fullText.map(htmlString => replacePlaceholders(htmlString, companyName, siteData.contactDetails?.address)).join('');
            } else if (typeof detail.fullText === 'string' && detail.fullText.trim() !== '') { // Handle single string (Markdown or HTML)
                 bodyContentDiv.innerHTML = replacePlaceholders(detail.fullText, companyName, siteData.contactDetails?.address); // Assuming direct HTML for now
            } else {
                bodyContentDiv.innerHTML = "<p>Content for this post is currently unavailable.</p>";
            }
        }
        
        // Author Bio Box
        setTextById('post-author-name', post.author || "Author");
        setImageById('post-author-image', detail.authorImage, `Photo of ${post.author || "Author"}`, 'inline-block', 'assets/images/placeholder-team-member.png');
        setHtmlById('post-author-bio', detail.authorBio || "Author biography not available.");
        setLinkById('post-author-profile-link', detail.authorPageLink, "View Profile", detail.authorPageLink ? 'inline-block' : 'none');
        const authorBioBox = document.getElementById('post-author-bio-box');
        if (authorBioBox && (!post.author && !detail.authorBio && !detail.authorImage)) { // Hide if no author info
            authorBioBox.style.display = 'none';
        }
        
        // Social Share (basic placeholder population)
        const socialShareSection = document.getElementById('post-social-share');
        if(detail.enableSocialShare){
             if (socialShareSection) socialShareSection.style.display = 'block'; // Or flex/grid
             setTextById('post-social-share-text', detail.socialShareText || 'Share this post:');
             // Actual share links would need more logic or be static links
        } else {
            if (socialShareSection) socialShareSection.style.display = 'none';
        }

        // Tags and Categories
        const tagsList = document.getElementById('post-tags-list');
        if (tagsList && detail.tags) {
            tagsList.innerHTML = detail.tags.split(',').map(tag => `<span class="tag-item">${replacePlaceholders(tag.trim(), companyName)}</span>`).join(' ');
        } else if (tagsList) {
            tagsList.innerHTML = '<span class="tag-item">No tags</span>';
        }
        const categoriesList = document.getElementById('post-categories-list');
        if (categoriesList && detail.categories) {
            categoriesList.innerHTML = detail.categories.split(',').map(cat => `<span class="category-item">${replacePlaceholders(cat.trim(), companyName)}</span>`).join(' ');
        } else if (categoriesList) {
             categoriesList.innerHTML = '<span class="category-item">Uncategorized</span>';
        }
        
        // Post Navigation
        const sortedPosts = [...allPosts].sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort oldest to newest
        const currentIndex = sortedPosts.findIndex(p => p.id === postId);
        
        const prevPostLink = document.getElementById('post-nav-prev-link');
        if (currentIndex > 0 && prevPostLink) {
            const prevPost = sortedPosts[currentIndex - 1];
            setLinkById('post-nav-prev-link', prevPost.detailPageUrl, '', 'flex');
            setTextById('post-nav-prev-label', detail.prevPostText || "Previous Post");
            setTextById('post-nav-prev-title', prevPost.title);
        } else if (prevPostLink) {
            prevPostLink.style.display = 'none';
        }

        const nextPostLink = document.getElementById('post-nav-next-link');
        if (currentIndex < sortedPosts.length - 1 && nextPostLink) {
            const nextPost = sortedPosts[currentIndex + 1];
            setLinkById('post-nav-next-link', nextPost.detailPageUrl, '', 'flex');
            setTextById('post-nav-next-label', detail.nextPostText || "Next Post");
            setTextById('post-nav-next-title', nextPost.title);
        } else if (nextPostLink) {
            nextPostLink.style.display = 'none';
        }
        if ( (currentIndex <=0 || !prevPostLink) && (currentIndex >= sortedPosts.length -1 || !nextPostLink) ){
             const postNavSection = document.getElementById('post-navigation');
             if(postNavSection) postNavSection.style.display = 'none';
        }


        // Related Posts
        const relatedPostsContainer = document.getElementById('related-posts-container');
        setTextById('related-posts-title', detail.relatedPostsTitle || "Related Posts");
        if (relatedPostsContainer && detail.relatedPostIDs) {
            relatedPostsContainer.innerHTML = '';
            const relatedIDs = detail.relatedPostIDs.split(',').map(id => id.trim());
            const relatedPostsData = allPosts.filter(p => relatedIDs.includes(p.id) && p.id !== postId);

            if (relatedPostsData.length > 0) {
                relatedPostsData.forEach(relatedPost => {
                    const article = document.createElement('article');
                    article.className = 'blog-post-summary animate-on-scroll'; // Reuse summary card style
                    const relatedPostDate = new Date(relatedPost.date);
                    const relatedFormattedDate = !isNaN(relatedPostDate.getTime()) ? relatedPostDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (relatedPost.date || "");

                    const imageHTML = relatedPost.imagePlaceholder ? `<img src="${relatedPost.imagePlaceholder}" alt="${replacePlaceholders(relatedPost.title || "Blog Post", companyName)}" onerror="this.onerror=null;this.src='assets/images/blog1-placeholder.png'; this.alt='Error loading image';">` : '';
                    article.innerHTML = `
                        ${imageHTML}
                        <div class="blog-post-summary-content">
                            <h3><a href="${relatedPost.detailPageUrl || '#'}">${replacePlaceholders(relatedPost.title || "Blog Post Title", companyName)}</a></h3>
                            <p class="post-meta"><time datetime="${relatedPost.date || ''}">${relatedFormattedDate}</time></p>
                             <a href="${relatedPost.detailPageUrl || '#'}" class="button">Read More</a>
                        </div>
                    `;
                    relatedPostsContainer.appendChild(article);
                });
            } else {
                relatedPostsContainer.innerHTML = "<p>No related posts to display at this time.</p>";
            }
        } else if (relatedPostsContainer) {
            relatedPostsContainer.innerHTML = "<p>No related posts configured.</p>";
        }

        // Comments Placeholder
        setTextById('post-comments-title', "Comments"); // Static usually
        setHtmlById('post-comments-text', detail.commentsPlaceholderText || "Comments are disabled or will be loaded via a third-party service.");

        // Post Page CTA
        const postCtaSection = document.getElementById('post-page-cta');
        if (detail.ctaTitle || detail.ctaText) {
            if(postCtaSection) postCtaSection.style.display = 'block';
            setTextById('post-cta-title', detail.ctaTitle || "Enjoyed This Read?");
            setHtmlById('post-cta-text', detail.ctaText || "Explore more insights or get in touch!");
            setLinkById('post-cta-button', detail.ctaButtonLink || "contact.html", detail.ctaButtonText || "Contact Us");
        } else if (postCtaSection) {
            postCtaSection.style.display = 'none';
        }
    }
    
    // --- Initial Load ---
    loadCompanyDataAndRender();
});

// Ensure initTestimonialSlider is called after testimonials are populated
// This might be done within populateHomePage if using dynamic testimonials.
// If not, it can be called here directly if testimonials are static in HTML.
// For this template, it's called from populateHomePage.

// Add dynamic list population fallback for all lists
// For example, inside populateAboutPage:
// const listContainer = document.getElementById('community-involvement-list-container');
// if (listContainer && Array.isArray(pageData.communityInvolvement.items) && pageData.communityInvolvement.items.length > 0) {
//     // ... populate items
// } else if (listContainer) {
//     listContainer.innerHTML = "<li>Details coming soon.</li>"; // Fallback message
// }

// For populateServicesPage, ensure service-items-container has a fallback
// For populateBlogPage, ensure blog-item-container has a fallback
// Same for all dynamic lists within service-detail and blog-post-detail pages.
