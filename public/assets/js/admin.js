
// assets/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Admin panel script loaded.");

    // --- Firebase Initialization ---
    // Import the functions you need from the SDKs you need
    // import { initializeApp } from "firebase/app";
    // import { getAnalytics } from "firebase/analytics";
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
// const app = initializeApp(firebaseConfig); // This line is for modular, not compat
// const analytics = getAnalytics(app);     // This line is for modular, not compat

    try {
        if (!firebase.apps.length) { 
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully.");
        } else {
            firebase.app(); 
            console.log("Firebase already initialized.");
        }
    } catch (e) {
        console.error("Error initializing Firebase:", e);
        const authLoadingEl = document.getElementById('auth-loading');
        if (authLoadingEl) {
            authLoadingEl.innerHTML = `<p class="error-message">Error initializing Firebase. Please check your configuration and console.</p>`;
        }
        const loginFormEl = document.getElementById('loginForm');
        const adminContentFormEl = document.getElementById('admin-content-form');
        if(loginFormEl) loginFormEl.style.display = 'none';
        if(adminContentFormEl) adminContentFormEl.style.display = 'none';
        return; 
    }
    
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- Firestore Constants ---
    const SITE_CONTENT_COLLECTION = 'siteContent';
    const COMPANY_DOC_ID = 'main_config'; 

    // --- Gemini API Initialization ---
    let ai;
    if (window.GoogleGenAI) {
        try {
            const apiKey = globalThis?.process?.env?.API_KEY || "AIzaSyCmKyF93UoEql91AIfB5MaNyMmwn3rsgbc"; 
            if (apiKey === "AIzaSyCmKyF93UoEql91AIfB5MaNyMmwn3rsgbc" || !apiKey) {
                 console.warn("API_KEY for Gemini is not set or is still the placeholder. AI suggestions will be disabled. Please set process.env.API_KEY or provide it directly in admin.js by replacing 'YOUR_API_KEY_HERE'.");
            } else {
                 ai = new window.GoogleGenAI({ apiKey });
                 console.log("GoogleGenAI initialized for AI suggestions.");
            }
        } catch (error) {
            console.error("Error initializing GoogleGenAI:", error);
        }
    } else {
        console.warn("GoogleGenAI SDK not loaded. AI suggestions will be disabled.");
    }


    // --- DOM Elements ---
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const logoutButton = document.getElementById('logoutButton');
    const authError = document.getElementById('authError');
    const userInfo = document.getElementById('userInfo');
    const userEmailSpan = document.getElementById('userEmail');
    const adminContentFormContainer = document.getElementById('admin-content-form'); 
    const contentManagementForm = document.getElementById('contentManagementForm');
    const authLoading = document.getElementById('auth-loading');
    const adminStatusMessage = document.getElementById('adminStatusMessage');
    const saveAllChangesButton = document.getElementById('saveAllChangesButton');
    
    const adminCompanyNameInput = document.getElementById('adminCompanyName');
    const adminCompanyNicheInput = document.getElementById('adminCompanyNiche');

    // AI Modal Elements
    const aiSuggestionModal = document.getElementById('aiSuggestionModal');
    const aiSuggestionModalCloseBtn = aiSuggestionModal ? aiSuggestionModal.querySelector('.modal-close-btn') : null;
    const aiSuggestionModalTitle = document.getElementById('aiSuggestionModalTitle');
    const aiSuggestionModalLoading = document.getElementById('aiSuggestionModalLoading');
    const aiSuggestionsList = document.getElementById('aiSuggestionsList');
    const aiSuggestionModalError = document.getElementById('aiSuggestionModalError');


    // Dynamic List Containers and Templates
    const socialLinksContainer = document.getElementById('socialLinksContainer');
    const socialLinkTemplate = document.getElementById('socialLinkTemplate');
    const addSocialLinkButton = document.getElementById('addSocialLinkButton');

    const keyFeaturesContainer = document.getElementById('keyFeaturesContainer');
    const keyFeatureTemplate = document.getElementById('keyFeatureTemplate');
    const addKeyFeatureButton = document.getElementById('addKeyFeatureButton');

    const testimonialsContainer = document.getElementById('testimonialsContainer');
    const testimonialTemplate = document.getElementById('testimonialTemplate');
    const addTestimonialButton = document.getElementById('addTestimonialButton');

    const storyBlocksContainer = document.getElementById('storyBlocksContainer');
    const storyBlockTemplate = document.getElementById('storyBlockTemplate');
    const addStoryBlockButton = document.getElementById('addStoryBlockButton');
    
    const teamMembersContainer = document.getElementById('teamMembersContainer');
    const teamMemberTemplate = document.getElementById('teamMemberTemplate');
    const addTeamMemberButton = document.getElementById('addTeamMemberButton');

    const valuesListContainer = document.getElementById('valuesListContainer');
    const valueItemTemplate = document.getElementById('valueItemTemplate');
    const addValueButton = document.getElementById('addValueButton');

    const communityInvolvementItemsContainer = document.getElementById('communityInvolvementItemsContainer');
    const communityInvolvementItemTemplate = document.getElementById('communityInvolvementItemTemplate');
    const addCommunityInvolvementItemButton = document.getElementById('addCommunityInvolvementItemButton');

    const servicesListContainer = document.getElementById('servicesListContainer');
    const serviceItemTemplate = document.getElementById('serviceItemTemplate');
    const addServiceButton = document.getElementById('addServiceButton');

    const blogPostsContainer = document.getElementById('blogPostsContainer');
    const blogPostTemplate = document.getElementById('blogPostTemplate');
    const addBlogPostButton = document.getElementById('addBlogPostButton');

    // Services Page Additional Sections Dynamic Lists
    const serviceApproachStepsContainer = document.getElementById('serviceApproachStepsContainer');
    const serviceApproachStepTemplate = document.getElementById('serviceApproachStepTemplate');
    const addServiceApproachStepButton = document.getElementById('addServiceApproachStepButton');

    const serviceDifferentiatorsContainer = document.getElementById('serviceDifferentiatorsContainer');
    const serviceDifferentiatorTemplate = document.getElementById('serviceDifferentiatorTemplate');
    const addServiceDifferentiatorButton = document.getElementById('addServiceDifferentiatorButton');

    const serviceBenefitItemsContainer = document.getElementById('serviceBenefitItemsContainer');
    const serviceBenefitItemTemplate = document.getElementById('serviceBenefitItemTemplate');
    const addServiceBenefitItemButton = document.getElementById('addServiceBenefitItemButton');

    const serviceFaqItemsContainer = document.getElementById('serviceFaqItemsContainer');
    const serviceFaqItemTemplate = document.getElementById('serviceFaqItemTemplate');
    const addServiceFaqItemButton = document.getElementById('addServiceFaqItemButton');

    // Contact Page Additional Sections Dynamic Lists
    const contactSocialLinksContainer = document.getElementById('contactSocialLinksContainer');
    const contactSocialLinkTemplate = document.getElementById('contactSocialLinkTemplate');
    const addContactSocialLinkButton = document.getElementById('addContactSocialLinkButton');

    const contactFaqItemsContainer = document.getElementById('contactFaqItemsContainer');
    const contactFaqItemTemplate = document.getElementById('contactFaqItemTemplate');
    const addContactFaqItemButton = document.getElementById('addContactFaqItemButton');


    // --- Helper Functions ---
    function displayAuthError(message) {
        if (authError) {
            authError.textContent = message;
            authError.style.display = 'block';
        }
    }

    function clearAuthError() {
        if (authError) {
            authError.textContent = '';
            authError.style.display = 'none';
        }
    }
    
    function showAuthLoading(isLoading) {
        if (authLoading) {
            authLoading.style.display = isLoading ? 'flex' : 'none';
        }
    }

    function showAdminStatus(message, type = 'info') { 
        if (adminStatusMessage) {
            adminStatusMessage.textContent = message;
            adminStatusMessage.className = `status-message ${type}-message`; 
            adminStatusMessage.style.display = 'block';
        }
    }
    function hideAdminStatus() {
        if (adminStatusMessage) {
            adminStatusMessage.style.display = 'none';
        }
    }
    
    function getSafe(fn, defaultValue = '') {
        try {
            const value = fn();
            return (value === null || value === undefined) ? defaultValue : value;
        } catch (e) {
            return defaultValue;
        }
    }
    
    function tryParseJSON(jsonString, defaultValue = []) {
        if (!jsonString || jsonString.trim() === '') return defaultValue;
        // Attempt to remove markdown fences if present
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonString.match(fenceRegex);
        if (match && match[2]) {
            jsonString = match[2].trim();
        }
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.warn("Failed to parse JSON string:", jsonString, e);
            return defaultValue; 
        }
    }


    // --- Dynamic List Item Management (Add functions as before) ---
     function addSocialLinkItem(data = {}) {
        if (!socialLinkTemplate || !socialLinksContainer) return;
        const newItem = socialLinkTemplate.content.cloneNode(true);
        newItem.querySelector('.social-platform-input').value = data.platform || '';
        newItem.querySelector('.social-url-input').value = data.url || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        socialLinksContainer.appendChild(newItem);
    }

    function addKeyFeatureItem(data = {}) {
        if (!keyFeatureTemplate || !keyFeaturesContainer) return;
        const newItem = keyFeatureTemplate.content.cloneNode(true);
        newItem.querySelector('.keyfeature-id-input').value = data.id || '';
        newItem.querySelector('.keyfeature-title-input').value = data.title || '';
        newItem.querySelector('.keyfeature-description-input').value = data.description || '';
        newItem.querySelector('.keyfeature-icon-input').value = data.iconPlaceholder || '';
        newItem.querySelector('.keyfeature-layout-select').value = data.layout || '1x1';
        newItem.querySelector('.keyfeature-isimage-checkbox').checked = data.isImage || false;
        newItem.querySelector('.keyfeature-imagesrc-input').value = data.imageSrc || '';
        newItem.querySelector('.keyfeature-imagealt-input').value = data.imageAlt || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        keyFeaturesContainer.appendChild(newItem);
    }
    
    function addTestimonialItem(data = {}) {
        if (!testimonialTemplate || !testimonialsContainer) return;
        const newItem = testimonialTemplate.content.cloneNode(true);
        newItem.querySelector('.testimonial-quote-input').value = data.quote || '';
        newItem.querySelector('.testimonial-author-input').value = data.author || '';
        newItem.querySelector('.testimonial-company-input').value = data.company || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        testimonialsContainer.appendChild(newItem);
    }

    function addStoryBlockItem(data = {}) {
        if (!storyBlockTemplate || !storyBlocksContainer) return;
        const newItem = storyBlockTemplate.content.cloneNode(true);
        newItem.querySelector('.storyblock-text-input').value = data.text || '';
        newItem.querySelector('.storyblock-image-input').value = data.imagePlaceholder || '';
        newItem.querySelector('.storyblock-imagealt-input').value = data.imageAlt || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        storyBlocksContainer.appendChild(newItem);
    }

    function addTeamMemberItem(data = {}) {
        if (!teamMemberTemplate || !teamMembersContainer) return;
        const newItem = teamMemberTemplate.content.cloneNode(true);
        newItem.querySelector('.teammember-name-input').value = data.name || '';
        newItem.querySelector('.teammember-title-input').value = data.title || '';
        newItem.querySelector('.teammember-image-input').value = data.imagePlaceholder || '';
        newItem.querySelector('.teammember-bio-input').value = data.bio || '';
        const socialLinksString = (data.socialLinks && Array.isArray(data.socialLinks))
            ? data.socialLinks.map(link => `${link.platform}: ${link.url}`).join('\n')
            : '';
        newItem.querySelector('.teammember-social-input').value = socialLinksString;
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        teamMembersContainer.appendChild(newItem);
    }

    function addValueItem(data = {}) {
        if (!valueItemTemplate || !valuesListContainer) return;
        const newItem = valueItemTemplate.content.cloneNode(true);
        newItem.querySelector('.value-name-input').value = data.name || '';
        newItem.querySelector('.value-description-input').value = data.description || '';
        newItem.querySelector('.value-icon-input').value = data.iconPlaceholder || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        valuesListContainer.appendChild(newItem);
    }
    
    function addCommunityInvolvementItem(data = {}) {
        if (!communityInvolvementItemTemplate || !communityInvolvementItemsContainer) return;
        const newItem = communityInvolvementItemTemplate.content.cloneNode(true);
        newItem.querySelector('.community-involvement-item-text-input').value = data.text || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        communityInvolvementItemsContainer.appendChild(newItem);
    }

    function addServiceItem(data = {}) {
        if (!serviceItemTemplate || !servicesListContainer) return;
        const newItem = serviceItemTemplate.content.cloneNode(true);
        newItem.querySelector('.service-id-input').value = data.id || '';
        newItem.querySelector('.service-name-input').value = data.name || '';
        newItem.querySelector('.service-shortdesc-input').value = data.shortDescription || '';
        newItem.querySelector('.service-image-input').value = data.imagePlaceholder || '';
        newItem.querySelector('.service-detailurl-input').value = data.detailPageUrl || '';

        const detail = data.detailContent || {};
        newItem.querySelector('.service-detail-pageTitle-input').value = detail.pageTitle || '';
        newItem.querySelector('.service-detail-metaDesc-input').value = detail.metaDescription || '';
        newItem.querySelector('.service-detail-bannerImage-input').value = detail.bannerImagePlaceholder || '';
        newItem.querySelector('.service-detail-overview-input').value = detail.overview || '';
        newItem.querySelector('.service-detail-featuresTitle-input').value = detail.featuresSectionTitle || '';
        newItem.querySelector('.service-detail-features-input').value = detail.features ? JSON.stringify(detail.features, null, 2) : '[]';
        
        // New fields for specific testimonials and related resources
        newItem.querySelector('.service-detail-specificTestimonialsJson-input').value = detail.specificTestimonials ? JSON.stringify(detail.specificTestimonials, null, 2) : '[]';
        newItem.querySelector('.service-detail-relatedResourcesJson-input').value = detail.relatedResources ? JSON.stringify(detail.relatedResources, null, 2) : '[]';
        
        newItem.querySelector('.service-detail-processTitle-input').value = detail.processSectionTitle || '';
        newItem.querySelector('.service-detail-processDesc-input').value = detail.processDescription || '';
        newItem.querySelector('.service-detail-ctaText-input').value = detail.ctaButtonText || '';
        newItem.querySelector('.service-detail-ctaLink-input').value = detail.ctaButtonLink || '';

        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        servicesListContainer.appendChild(newItem);
    }

    function addBlogPostItem(data = {}) {
        if (!blogPostTemplate || !blogPostsContainer) return;
        const newItem = blogPostTemplate.content.cloneNode(true);
        newItem.querySelector('.blogpost-id-input').value = data.id || '';
        newItem.querySelector('.blogpost-title-input').value = data.title || '';
        newItem.querySelector('.blogpost-date-input').value = data.date || '';
        newItem.querySelector('.blogpost-author-input').value = data.author || '';
        newItem.querySelector('.blogpost-summary-input').value = data.summary || '';
        newItem.querySelector('.blogpost-image-input').value = data.imagePlaceholder || '';
        newItem.querySelector('.blogpost-detailurl-input').value = data.detailPageUrl || '';

        const detail = data.detailContent || {};
        newItem.querySelector('.blogpost-detail-pageTitle-input').value = detail.pageTitle || '';
        newItem.querySelector('.blogpost-detail-metaDesc-input').value = detail.metaDescription || '';
        newItem.querySelector('.blogpost-detail-bannerImage-input').value = detail.bannerImagePlaceholder || '';
        newItem.querySelector('.blogpost-detail-fulltext-input').value = detail.fullText ? JSON.stringify(detail.fullText, null, 2) : '[]';
        
        // Populate new blog post detail fields
        newItem.querySelector('.blogpost-author-bio-input').value = getSafe(() => detail.authorBio);
        newItem.querySelector('.blogpost-author-image-input').value = getSafe(() => detail.authorImage);
        newItem.querySelector('.blogpost-author-link-input').value = getSafe(() => detail.authorPageLink);
        newItem.querySelector('.blogpost-social-share-enable-input').checked = getSafe(() => detail.enableSocialShare, false);
        newItem.querySelector('.blogpost-social-share-text-input').value = getSafe(() => detail.socialShareText);
        newItem.querySelector('.blogpost-tags-input').value = getSafe(() => detail.tags);
        newItem.querySelector('.blogpost-categories-input').value = getSafe(() => detail.categories);
        newItem.querySelector('.blogpost-prev-text-input').value = getSafe(() => detail.prevPostText, "Previous Post");
        newItem.querySelector('.blogpost-next-text-input').value = getSafe(() => detail.nextPostText, "Next Post");
        newItem.querySelector('.blogpost-related-title-input').value = getSafe(() => detail.relatedPostsTitle, "Related Posts");
        newItem.querySelector('.blogpost-related-ids-input').value = getSafe(() => detail.relatedPostIDs);
        newItem.querySelector('.blogpost-comments-placeholder-input').value = getSafe(() => detail.commentsPlaceholderText, "Comments are disabled or managed elsewhere.");
        newItem.querySelector('.blogpost-cta-title-input').value = getSafe(() => detail.ctaTitle);
        newItem.querySelector('.blogpost-cta-text-input').value = getSafe(() => detail.ctaText);
        newItem.querySelector('.blogpost-cta-buttontext-input').value = getSafe(() => detail.ctaButtonText);
        newItem.querySelector('.blogpost-cta-buttonlink-input').value = getSafe(() => detail.ctaButtonLink);


        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        blogPostsContainer.appendChild(newItem);
    }

    function addServiceApproachStepItem(data = {}) {
        if (!serviceApproachStepTemplate || !serviceApproachStepsContainer) return;
        const newItem = serviceApproachStepTemplate.content.cloneNode(true);
        newItem.querySelector('.service-approach-step-title-input').value = data.title || '';
        newItem.querySelector('.service-approach-step-desc-input').value = data.description || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        serviceApproachStepsContainer.appendChild(newItem);
    }

    function addServiceDifferentiatorItem(data = {}) {
        if (!serviceDifferentiatorTemplate || !serviceDifferentiatorsContainer) return;
        const newItem = serviceDifferentiatorTemplate.content.cloneNode(true);
        newItem.querySelector('.service-differentiator-title-input').value = data.title || '';
        newItem.querySelector('.service-differentiator-desc-input').value = data.description || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        serviceDifferentiatorsContainer.appendChild(newItem);
    }

    function addServiceBenefitItem(data = {}) {
        if (!serviceBenefitItemTemplate || !serviceBenefitItemsContainer) return;
        const newItem = serviceBenefitItemTemplate.content.cloneNode(true);
        newItem.querySelector('.service-benefit-item-text-input').value = data.text || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        serviceBenefitItemsContainer.appendChild(newItem);
    }

    function addServiceFaqItem(data = {}) {
        if (!serviceFaqItemTemplate || !serviceFaqItemsContainer) return;
        const newItem = serviceFaqItemTemplate.content.cloneNode(true);
        newItem.querySelector('.service-faq-item-question-input').value = data.question || '';
        newItem.querySelector('.service-faq-item-answer-input').value = data.answer || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        serviceFaqItemsContainer.appendChild(newItem);
    }

    function addContactSocialLinkItem(data = {}) {
        if (!contactSocialLinkTemplate || !contactSocialLinksContainer) return;
        const newItem = contactSocialLinkTemplate.content.cloneNode(true);
        newItem.querySelector('.contact-social-platform-input').value = data.platform || '';
        newItem.querySelector('.contact-social-url-input').value = data.url || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        contactSocialLinksContainer.appendChild(newItem);
    }

    function addContactFaqItem(data = {}) {
        if (!contactFaqItemTemplate || !contactFaqItemsContainer) return;
        const newItem = contactFaqItemTemplate.content.cloneNode(true);
        newItem.querySelector('.contact-faq-item-question-input').value = data.question || '';
        newItem.querySelector('.contact-faq-item-answer-input').value = data.answer || '';
        newItem.querySelector('.remove-item-btn').addEventListener('click', (e) => e.target.closest('.dynamic-list-item').remove());
        contactFaqItemsContainer.appendChild(newItem);
    }


    // --- AI Suggestion Logic ---

    function openAISuggestionModal(title) {
        if (aiSuggestionModalTitle) aiSuggestionModalTitle.textContent = title || "AI Suggestions";
        if (aiSuggestionsList) aiSuggestionsList.innerHTML = ''; // Clear previous suggestions
        if (aiSuggestionModalError) aiSuggestionModalError.style.display = 'none';
        if (aiSuggestionModalLoading) aiSuggestionModalLoading.style.display = 'none';
        if (aiSuggestionModal) aiSuggestionModal.style.display = 'flex';
    }

    function closeAISuggestionModal() {
        if (aiSuggestionModal) aiSuggestionModal.style.display = 'none';
    }

    function createPrompt(fieldType, baseInfo, optionalContext = {}) {
        let prompt = "";
        const { companyName, niche } = baseInfo;

        switch (fieldType) {
            case 'tagline':
                prompt = `Generate 3-5 concise and compelling taglines for a company named '${companyName}' in the '${niche}' industry.`;
                break;
            case 'heroSubtitle':
            case 'aboutHeroSubtitle': // Can use the same logic or differentiate
                prompt = `Generate 2-3 engaging hero subtitles (max 20 words each) for a company named '${companyName}' in the '${niche}' industry. The hero title might be '${optionalContext.heroTitle || 'Welcome'}'. Focus on conveying excitement and value.`;
                break;
            case 'homeIntroText':
                prompt = `Write an engaging introduction paragraph (around 70-100 words) for the homepage of '${companyName}', a company in the '${niche}' industry. The section title is '${optionalContext.sectionTitle || 'Introduction'}'. It should be welcoming and highlight the company's essence.`;
                break;
            case 'homeFeaturedServicesIntro':
                prompt = `Write a brief introductory text (around 40-60 words) for the 'Featured Services' section on the homepage of '${companyName}' (a '${niche}' company). This text should entice users to explore the services.`;
                break;
            case 'keyFeatureDescription':
                prompt = `Write a concise and benefit-driven description (20-40 words) for a key feature named '${optionalContext.featureName || 'this feature'}' for '${companyName}', a company in the '${niche}' industry.`;
                break;
            case 'homeAboutTeaserText':
                prompt = `Create a short and inviting teaser text (around 50-70 words) for an 'About Us' section on the homepage of '${companyName}', a '${niche}' company. It should make visitors want to learn more about the company.`;
                break;
            case 'testimonialQuote':
                prompt = `Generate 2-3 positive, brief testimonial quotes (1-2 sentences each) for a company like '${companyName}' in the '${niche}' industry, as if from satisfied clients. The author's name is '${optionalContext.authorName || 'a client'}'.`;
                break;
            case 'ctaBarText':
                prompt = `Generate 1-2 short, motivating sentences (around 10-20 words total) for a call to action bar for '${companyName}', a company in the '${niche}' industry. The bar title is '${optionalContext.barTitle || 'Ready?'}'.`;
                break;
            case 'metaDescription': // Generic meta description
                prompt = `Write a compelling meta description (max 155 characters) for the '${optionalContext.pageName || 'page'}' of '${companyName}', a company in the '${niche}' industry. The page title is '${optionalContext.pageTitle || ''}'.`;
                break;
            case 'storyBlockText':
                prompt = `Write an engaging paragraph (around 70-100 words) for an 'Our Story' section for '${companyName}', a '${niche}' company. This block should focus on ${optionalContext.storyFocus || 'a key aspect of the company journey'}.`;
                break;
            case 'teamIntro':
                prompt = `Write an inviting introduction (around 40-60 words) for the 'Our Team' section of '${companyName}', a company in the '${niche}' industry.`;
                break;
            case 'teamMemberBio':
                prompt = `Write a brief and professional bio (around 50-70 words) for a team member named '${optionalContext.memberName || 'Our Team Member'}' who holds the title '${optionalContext.memberTitle || 'Valued Employee'}' at '${companyName}', a '${niche}' company.`;
                break;
            case 'valuesIntro':
                prompt = `Craft an introductory text (around 30-50 words) for the 'Our Values' section of '${companyName}', a '${niche}' company.`;
                break;
            case 'valueDescription':
                prompt = `Describe the company value '${optionalContext.valueName || 'this core value'}' in 1-2 sentences (20-40 words) for '${companyName}', a '${niche}' company. Explain its importance.`;
                break;
            case 'aboutMissionText':
                prompt = `Write a clear and inspiring mission statement (around 50-80 words) for '${companyName}', a company in the '${niche}' industry. The section is 'Mission & Vision'. The mission title is '${optionalContext.missionTitle || 'Our Mission'}'.`;
                break;
            case 'aboutVisionText':
                prompt = `Write a forward-looking and aspirational vision statement (around 50-80 words) for '${companyName}', a company in the '${niche}' industry. The section is 'Mission & Vision'. The vision title is '${optionalContext.visionTitle || 'Our Vision'}'.`;
                break;
            case 'aboutCultureMainText':
                prompt = `Describe the company culture (around 70-100 words) at '${companyName}', a company in the '${niche}' industry. Focus on environment, values in action, and team dynamics. The section title is '${optionalContext.sectionTitle || 'Our Culture'}'.`;
                break;
            case 'aboutCommunityMainText':
                 prompt = `Write about the community involvement or corporate social responsibility (CSR) initiatives (around 60-90 words) of '${companyName}', a company in the '${niche}' industry. The section title is '${optionalContext.sectionTitle || 'Community Involvement & CSR'}'.`;
                break;
            case 'aboutCareersMainText':
                 prompt = `Create a brief and inviting text (around 50-70 words) for a 'Careers Teaser' section for '${companyName}', a company in the '${niche}' industry. It should encourage potential candidates to explore opportunities. The section title is '${optionalContext.sectionTitle || 'Join Our Team'}'.`;
                break;
            case 'servicesPageIntro':
                prompt = `Write an introduction (around 50-75 words) for the main services listing page of '${companyName}', a company in the '${niche}' industry.`;
                break;
            case 'serviceShortDescription':
                prompt = `Generate 2-3 concise and benefit-oriented short descriptions (around 30-50 words each) for a service named '${optionalContext.serviceName || 'Our Service'}' offered by '${companyName}', a company in the '${niche}' industry.`;
                break;
            case 'serviceDetailMetaDescription':
                 prompt = `Write a compelling meta description (max 155 characters) for a service detail page about '${optionalContext.serviceName || 'Our Service'}' offered by '${companyName}' ('${niche}' industry).`;
                break;
            case 'serviceDetailOverview':
                prompt = `Write a comprehensive overview (around 100-150 words) for a service named '${optionalContext.serviceName || 'Our Service'}' from '${companyName}'. Explain what the service is and its main benefits. Output in HTML paragraph format.`;
                break;
            case 'serviceDetailProcessDescription':
                prompt = `Describe the typical process or methodology (around 80-120 words) for delivering the service '${optionalContext.serviceName || 'Our Service'}' by '${companyName}'. Output in HTML paragraph format, possibly with bolded steps.`;
                break;
            case 'serviceFeaturesJson': 
                prompt = `For a service named '${optionalContext.serviceName}' by '${companyName}' ('${niche}' industry), suggest 2-3 key features. For each feature, provide a 'name' (string), 'description' (string, 20-30 words), an 'iconPlaceholder' (relevant emoji), 'imagePlaceholder' (suggest 'assets/images/placeholder-feature.jpg'), and 'imageAlt' (string, descriptive). Output this as a JSON array of objects. Example: [{"name":"Feature 1","description":"...","iconPlaceholder":"💡","imagePlaceholder":"assets/images/placeholder-feature.jpg","imageAlt":"..."}]`;
                break;
            case 'serviceSpecificTestimonialsJson':
                 prompt = `Generate 1-2 brief testimonial objects for a service named '${optionalContext.serviceName}' by '${companyName}'. Each object should have 'quote' (string), 'author' (string), and 'company' (string, optional). Output as a JSON array. Example: [{"quote":"Excellent specific service!","author":"S. User","company":"Specific Corp"}]`;
                break;
            case 'serviceRelatedResourcesJson':
                prompt = `Suggest 1-2 related resource objects for a service named '${optionalContext.serviceName}' by '${companyName}'. Each object should have 'title' (string), 'url' (string, e.g., '#'), and 'type' (string, e.g., 'PDF', 'Webinar'). Output as a JSON array. Example: [{"title":"Download Brochure","url":"/path/to/doc.pdf","type":"PDF"}]`;
                break;
            // New prompts for services page sections
            case 'servicesApproachMainText':
                prompt = `Write an introductory paragraph (around 60-90 words) explaining the general service approach of '${companyName}', a company in the '${niche}' industry. The section title is '${optionalContext.sectionTitle || 'Our Service Approach'}'.`;
                break;
            case 'serviceApproachStepDesc':
                prompt = `For a service approach step titled '${optionalContext.stepTitle || 'this step'}' at '${companyName}', write a concise description (20-40 words).`;
                break;
            case 'servicesWhyMainText':
                prompt = `Write an engaging paragraph (around 50-80 words) explaining why clients should choose the services of '${companyName}', a company in the '${niche}' industry. The section title is '${optionalContext.sectionTitle || 'Why Choose Our Services?'}'.`;
                break;
            case 'serviceDifferentiatorDesc':
                prompt = `For a key differentiator titled '${optionalContext.differentiatorTitle || 'this advantage'}' of '${companyName}', write a brief explanation (20-40 words).`;
                break;
            case 'servicesBenefitsMainText':
                prompt = `Write an introductory paragraph (around 40-70 words) for a section outlining the benefits of using '${companyName}'s services. The section title is '${optionalContext.sectionTitle || 'Benefits You Can Expect'}'.`;
                break;
            case 'servicesCaseStudiesMainText':
                prompt = `Write a teaser text (around 50-80 words) for a 'Success in Action' or 'Case Studies' section on the services page of '${companyName}'. It should hint at successful outcomes without detailing specific studies yet.`;
                break;
            case 'servicesFaqMainText':
                prompt = `Write an introductory text (around 30-50 words) for a 'Services FAQ' section for '${companyName}'.`;
                break;
            case 'serviceFaqItemAnswer':
                prompt = `Provide a concise and helpful answer (30-60 words) for the FAQ: '${optionalContext.faqQuestion || 'this question'}' regarding services at '${companyName}'.`;
                break;
            case 'servicesCtaQuoteMainText':
                prompt = `Write a compelling call to action text (around 40-70 words) for a section titled '${optionalContext.sectionTitle || 'Need a Tailored Solution?'}' on the services page of '${companyName}', encouraging users to request a custom quote.`;
                break;
            case 'blogPageIntro':
                 prompt = `Write an inviting introduction (around 40-60 words) for the main blog page of '${companyName}', a company in the '${niche}' industry.`;
                break;
            case 'blogFeaturedPostText':
                 prompt = `Generate a compelling teaser (around 40-60 words) for a featured blog post titled '${optionalContext.postTitle || 'Our Highlighted Article'}' by '${companyName}'.`;
                 break;
            case 'blogCategoriesIntro':
                 prompt = `Write a short introduction (around 30-50 words) for a blog categories section for '${companyName}'.`;
                 break;
            case 'blogAuthorSpotlightText':
                 prompt = `Craft a brief text (around 40-60 words) for an author spotlight section on the blog of '${companyName}', highlighting the expertise of authors.`;
                 break;
            case 'blogArchivesText':
                 prompt = `Write a short text (around 20-40 words) encouraging users to visit the blog archives of '${companyName}'.`;
                 break;
            case 'blogSubscribeText':
                 prompt = `Create an enticing call to action text (around 30-50 words) for users to subscribe to the blog newsletter of '${companyName}'.`;
                 break;
            case 'blogRelatedTopicsIntro':
                 prompt = `Write a brief introduction (around 30-50 words) for a 'Related Topics' section on the blog page of '${companyName}'.`;
                 break;
            case 'blogPostSummary':
                prompt = `Generate 2-3 compelling summaries (around 50-75 words each) for a blog post titled '${optionalContext.postTitle || 'Our Latest Article'}'.`;
                break;
            case 'blogPostDetailMetaDescription':
                 prompt = `Write an engaging meta description (max 155 characters) for a blog post titled '${optionalContext.postTitle || 'Our Latest Article'}' from '${companyName}' ('${niche}' industry).`;
                break;
            case 'blogPostFullText': // AI for full blog post content is ambitious, suggest sections or starting paragraphs
                prompt = `Write an introductory paragraph and a H2 subheading for a follow-up section for a blog post titled '${optionalContext.postTitle || 'Our Latest Article'}' by '${companyName}'. The post is about '${optionalContext.postTopic || 'an interesting topic'}'. Format the output as a JSON array with two HTML strings: ["<p>Introductory paragraph...</p>", "<h2>Suggested Subheading...</h2>"].`;
                break;
            case 'blogPostAuthorBio':
                 prompt = `Write a short, professional bio (30-50 words) for a blog post author at '${companyName}'. The post is titled '${optionalContext.postTitle || 'this article'}'.`;
                break;
            case 'blogPostTags':
            case 'blogPostCategories':
                 prompt = `Suggest 3-5 relevant ${fieldType === 'blogPostTags' ? 'tags' : 'categories'} (comma-separated) for a blog post titled '${optionalContext.postTitle || 'this article'}' by '${companyName}' ('${niche}' industry). The post is about: '${optionalContext.postSummary || 'general topics'}'.`;
                break;
            case 'blogPostCommentsPlaceholderText':
                 prompt = `Write a short, friendly placeholder text (10-20 words) for a comments section on a blog post for '${companyName}'.`;
                break;
            case 'blogPostCtaText':
                 prompt = `Generate 1-2 short, motivating sentences (around 10-20 words total) for a call to action section on a blog post page for '${companyName}'. The CTA title might be '${optionalContext.ctaTitle || 'Enjoyed this?'}'.`;
                break;
            case 'contactPageIntro':
                prompt = `Write a friendly and welcoming introduction (around 30-50 words) for the 'Contact Us' page of '${companyName}'.`;
                break;
            case 'contactMapPlaceholderText':
                 prompt = `Suggest a short, helpful placeholder text (1-2 sentences) for a map section on the contact page of '${companyName}', located at or near '${optionalContext.address || 'our office'}'.`;
                 break;
            case 'contactAddress':
                 prompt = `Based on the company name '${companyName}' and industry '${niche}', suggest a plausible street address format (e.g., 123 Innovation Drive, Tech City, ST 12345).`;
                 break;
            // Contact page new sections
            case 'contactOfficeHoursText':
                prompt = `Generate example office hours text (e.g., Mon-Fri: 9 AM - 5 PM, Sat: 10 AM - 2 PM, Sun: Closed) for '${companyName}'.`;
                break;
            case 'contactResponseText':
                prompt = `Write a brief text (around 20-40 words) about response expectations for inquiries at '${companyName}'.`;
                break;
            case 'contactSocialIntro':
                prompt = `Write a short introductory text (around 20-30 words) for a 'Social Connect' section on the contact page of '${companyName}'.`;
                break;
            case 'contactLocationText':
                prompt = `Suggest 1-2 sentences (around 30-50 words) highlighting location features (e.g., parking, accessibility) for '${companyName}'.`;
                break;
            case 'contactFaqsIntro':
                prompt = `Write a brief intro (around 20-30 words) for an FAQ section on the contact page of '${companyName}'.`;
                break;
            case 'contactFaqItemQuestion':
                prompt = `Suggest a common contact-related FAQ question for a company like '${companyName}'.`;
                break;
            case 'contactFaqItemAnswer':
                prompt = `Provide a concise answer (20-40 words) to the contact-related FAQ: '${optionalContext.faqQuestion || 'this question'}' for '${companyName}'.`;
                break;
            default:
                prompt = `Provide a suggestion for: ${fieldType.replace(/([A-Z])/g, ' $1').toLowerCase()} for a company named '${companyName}' in the '${niche}' industry. ${optionalContext.genericContext || ''}`;
        }
        return prompt;
    }
    
    async function getAISuggestion(fieldType, baseInfo, optionalContext = {}, targetTextarea) {
        if (!ai) {
            if (aiSuggestionModalError) {
                aiSuggestionModalError.textContent = "AI Service is not available. Please check API Key configuration in admin.js.";
                aiSuggestionModalError.style.display = 'block';
            }
            if (aiSuggestionModalLoading) aiSuggestionModalLoading.style.display = 'none';
            return;
        }

        if (aiSuggestionModalLoading) aiSuggestionModalLoading.style.display = 'flex';
        if (aiSuggestionModalError) aiSuggestionModalError.style.display = 'none';
        if (aiSuggestionsList) aiSuggestionsList.innerHTML = '';

        const prompt = createPrompt(fieldType, baseInfo, optionalContext);
        console.log("Generated AI Prompt:", prompt);

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-04-17", 
                contents: prompt,
            });
            
            const textResponse = response.text;
            console.log("AI Raw Response:", textResponse);

            let suggestions = [];
            if (textResponse.includes('\n') && (textResponse.match(/^\d+\.\s/m) || textResponse.match(/^[\*\-]\s/m))) {
                suggestions = textResponse.split('\n')
                    .map(s => s.replace(/^\d+\.\s*/, '').replace(/^[\*\-]\s*/, '').trim())
                    .filter(s => s.length > 0);
            } else if (fieldType === 'serviceFeaturesJson' || fieldType === 'blogPostFullText' || fieldType === 'serviceSpecificTestimonialsJson' || fieldType === 'serviceRelatedResourcesJson') {
                const parsedJson = tryParseJSON(textResponse); // tryParseJSON now handles markdown fences
                if (Array.isArray(parsedJson) && parsedJson.length > 0) {
                    suggestions.push(JSON.stringify(parsedJson, null, 2));
                } else if (typeof parsedJson === 'object' && Object.keys(parsedJson).length > 0) { // Single object is also valid for some JSON fields
                    suggestions.push(JSON.stringify(parsedJson, null, 2));
                }
                 else {
                    suggestions.push(textResponse); 
                }
            } else {
                suggestions.push(textResponse);
            }
            
            if (suggestions.length === 0 || (suggestions.length === 1 && suggestions[0].trim() === '')) {
                 suggestions = ["AI could not generate a suggestion for this field. Try rephrasing or adding more context to the form."];
            }

            displayAISuggestions(suggestions, targetTextarea);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            if (aiSuggestionModalError) {
                aiSuggestionModalError.textContent = "Error getting AI suggestion: " + error.message;
                aiSuggestionModalError.style.display = 'block';
            }
        } finally {
            if (aiSuggestionModalLoading) aiSuggestionModalLoading.style.display = 'none';
        }
    }

    function displayAISuggestions(suggestionsArray, targetTextarea) {
        if (!aiSuggestionsList) return;
        aiSuggestionsList.innerHTML = '';

        if (!suggestionsArray || suggestionsArray.length === 0) {
            const li = document.createElement('li');
            li.textContent = "No suggestions available.";
            aiSuggestionsList.appendChild(li);
            return;
        }

        suggestionsArray.forEach(suggestionText => {
            const li = document.createElement('li');
            
            const textSpan = document.createElement('span');
            textSpan.textContent = suggestionText;
            li.appendChild(textSpan);

            const useButton = document.createElement('button');
            useButton.textContent = "Use this suggestion";
            useButton.classList.add('button-use-suggestion');
            useButton.addEventListener('click', () => {
                targetTextarea.value = suggestionText;
                closeAISuggestionModal();
            });
            li.appendChild(useButton);
            aiSuggestionsList.appendChild(li);
        });
    }


    function handleAISuggestionClick(event) {
        const button = event.target.closest('.ai-suggest-btn');
        if (!button) return;

        const group = button.closest('.textarea-group');
        if (!group) return;

        const targetTextarea = group.querySelector('.ai-target-textarea');
        if (!targetTextarea) return;

        const companyName = adminCompanyNameInput ? adminCompanyNameInput.value : "Your Company";
        const niche = adminCompanyNicheInput ? adminCompanyNicheInput.value : ""; // Default to empty, prompt user if missing
        
        if (!niche) {
            alert("Please fill in the 'Company Niche/Industry' field in General Settings for better AI suggestions.");
            if(adminCompanyNicheInput) adminCompanyNicheInput.focus();
            return;
        }

        const baseInfo = { companyName, niche };
        let optionalContext = {};
        const fieldType = targetTextarea.dataset.aiFieldType || targetTextarea.id;

        const dynamicItem = targetTextarea.closest('.dynamic-list-item');
        if (dynamicItem) {
            if (fieldType === 'keyFeatureDescription') {
                const titleInput = dynamicItem.querySelector('.keyfeature-title-input');
                if (titleInput) optionalContext.featureName = titleInput.value;
            } else if (fieldType === 'testimonialQuote') {
                const authorInput = dynamicItem.querySelector('.testimonial-author-input');
                if (authorInput) optionalContext.authorName = authorInput.value || 'a client';
            } else if (fieldType === 'serviceShortDescription' || fieldType === 'serviceDetailMetaDescription' || fieldType === 'serviceDetailOverview' || fieldType === 'serviceDetailProcessDescription' || fieldType === 'serviceFeaturesJson' || fieldType === 'serviceSpecificTestimonialsJson' || fieldType === 'serviceRelatedResourcesJson') {
                const nameInput = dynamicItem.querySelector('.service-name-input');
                if (nameInput) optionalContext.serviceName = nameInput.value;
            } else if (fieldType === 'blogPostSummary' || fieldType === 'blogPostDetailMetaDescription' || fieldType === 'blogPostFullText' || fieldType === 'blogPostAuthorBio' || fieldType === 'blogPostTags' || fieldType === 'blogPostCategories' || fieldType === 'blogPostCtaText') {
                const titleInput = dynamicItem.querySelector('.blogpost-title-input');
                if (titleInput) optionalContext.postTitle = titleInput.value;
                if (fieldType === 'blogPostFullText' || fieldType === 'blogPostTags' || fieldType === 'blogPostCategories') {
                    const summaryInput = dynamicItem.querySelector('.blogpost-summary-input');
                    if (summaryInput) optionalContext.postSummary = summaryInput.value; 
                }
                 if (fieldType === 'blogPostCtaText') {
                    const ctaTitleInput = dynamicItem.querySelector('.blogpost-cta-title-input');
                    if(ctaTitleInput) optionalContext.ctaTitle = ctaTitleInput.value;
                }
            } else if (fieldType === 'serviceApproachStepDesc') {
                const titleInput = dynamicItem.querySelector('.service-approach-step-title-input');
                if (titleInput) optionalContext.stepTitle = titleInput.value;
            } else if (fieldType === 'serviceDifferentiatorDesc') {
                const titleInput = dynamicItem.querySelector('.service-differentiator-title-input');
                if (titleInput) optionalContext.differentiatorTitle = titleInput.value;
            } else if (fieldType === 'serviceFaqItemAnswer') {
                const questionInput = dynamicItem.querySelector('.service-faq-item-question-input');
                if (questionInput) optionalContext.faqQuestion = questionInput.value;
            } else if (fieldType === 'contactFaqItemAnswer') {
                 const questionInput = dynamicItem.querySelector('.contact-faq-item-question-input');
                if (questionInput) optionalContext.faqQuestion = questionInput.value;
            }
        } else { 
             // Context for non-dynamic items, potentially page or section titles
            if(fieldType === 'heroSubtitle' || fieldType === 'aboutHeroSubtitle') {
                const titleId = fieldType === 'heroSubtitle' ? 'adminHomeHeroTitle' : 'adminAboutHeroTitle';
                const titleEl = document.getElementById(titleId);
                if(titleEl) optionalContext.heroTitle = titleEl.value;
            } else if (fieldType === 'homeIntroText'){
                 const titleEl = document.getElementById('adminHomeIntroTitle');
                 if(titleEl) optionalContext.sectionTitle = titleEl.value;
            } else if (fieldType === 'ctaBarText') { // For home CTA bar
                const titleEl = document.getElementById('adminHomeCtaBarTitle');
                if(titleEl) optionalContext.barTitle = titleEl.value;
            } else if (fieldType === 'metaDescription'){ 
                const fieldset = targetTextarea.closest('fieldset');
                if (fieldset) {
                    const legend = fieldset.querySelector('legend');
                    if (legend) optionalContext.pageName = legend.textContent.replace(' Section', '').replace(' Content', '');
                    let titleInput = fieldset.querySelector('input[id*="Title"], input[name*="Title"]');
                    if(!titleInput && fieldset.previousElementSibling?.tagName === 'FIELDSET') { // Check sibling if title is in a different fieldset
                        titleInput = fieldset.previousElementSibling.querySelector('input[id*="Title"], input[name*="Title"]');
                    }
                     // If it's for a detail page, try to get the specific service/post name
                    if (optionalContext.pageName && (optionalContext.pageName.includes("Service Detail") || optionalContext.pageName.includes("Blog Post Detail"))){
                        // Handled by dynamicItem logic above, so this might not be needed here
                    } else if(titleInput) {
                        optionalContext.pageTitle = titleInput.value;
                    }
                }
            } else if (fieldType === 'blogFeaturedPostText') {
                const titleEl = document.getElementById('adminBlogFeaturedPostTitle'); // Section title
                const postIdEl = document.getElementById('adminBlogFeaturedPostId'); // Post ID to feature
                if(titleEl) optionalContext.sectionTitle = titleEl.value;
                if(postIdEl) { // Attempt to find the actual post title for better context
                    const blogPostItems = blogPostsContainer.querySelectorAll('.dynamic-list-item');
                    for (const item of blogPostItems) {
                        if (item.querySelector('.blogpost-id-input').value === postIdEl.value) {
                            optionalContext.postTitle = item.querySelector('.blogpost-title-input').value;
                            break;
                        }
                    }
                    if (!optionalContext.postTitle) optionalContext.postTitle = `post with ID: ${postIdEl.value}`;
                }
            } else if (fieldType === 'servicesApproachMainText' || fieldType === 'servicesWhyMainText' || fieldType === 'servicesBenefitsMainText' || fieldType === 'servicesCaseStudiesMainText' || fieldType === 'servicesFaqMainText' || fieldType === 'servicesCtaQuoteMainText' ||
                       fieldType === 'aboutMissionText' || fieldType === 'aboutVisionText' || fieldType === 'aboutCultureMainText' || fieldType === 'aboutCommunityMainText' || fieldType === 'aboutCareersMainText' ||
                       fieldType === 'contactOfficeHoursText' || fieldType === 'contactResponseText' || fieldType === 'contactSocialIntro' || fieldType === 'contactLocationText' || fieldType === 'contactFaqsIntro' ||
                       fieldType === 'blogCategoriesIntro' || fieldType === 'blogAuthorSpotlightText' || fieldType === 'blogArchivesText' || fieldType === 'blogSubscribeText' || fieldType === 'blogRelatedTopicsIntro'
            ) {
                 // Get parent fieldset's legend as section title
                const fieldset = targetTextarea.closest('fieldset');
                if (fieldset) {
                    const legend = fieldset.querySelector('legend');
                    if (legend) {
                        optionalContext.sectionTitle = legend.textContent.replace(' Section (on Services Page)', '').replace(' Section', '');
                        if(fieldType === 'aboutMissionText') {
                            optionalContext.missionTitle = document.getElementById('adminAboutMissionTitle')?.value || 'Our Mission';
                        }
                        if(fieldType === 'aboutVisionText') {
                            optionalContext.visionTitle = document.getElementById('adminAboutVisionTitle')?.value || 'Our Vision';
                        }
                    }
                }
            }
        }
        
        if (fieldType === 'contactMapPlaceholderText') {
            const addressInput = document.getElementById('adminContactAddress');
            if(addressInput) optionalContext.address = addressInput.value;
        }


        openAISuggestionModal(`AI Suggestions for ${fieldType.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        getAISuggestion(fieldType, baseInfo, optionalContext, targetTextarea);
    }

    if (contentManagementForm) {
        contentManagementForm.addEventListener('click', handleAISuggestionClick);
    }

    if (aiSuggestionModalCloseBtn) {
        aiSuggestionModalCloseBtn.addEventListener('click', closeAISuggestionModal);
    }
    if (aiSuggestionModal) {
        aiSuggestionModal.addEventListener('click', (event) => {
            if (event.target === aiSuggestionModal) {
                closeAISuggestionModal();
            }
        });
    }


    // Firestore Data Loading
    async function loadCompanyData() {
        if (!auth.currentUser) {
            console.log("No user logged in, cannot load company data.");
            return;
        }
        showAdminStatus("Loading content...", 'info');

        try {
            const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(COMPANY_DOC_ID);
            const docSnap = await docRef.get();

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                populateFormWithData(docSnap.data());
                showAdminStatus("Content loaded successfully.", 'success');
                setTimeout(hideAdminStatus, 3000);
            } else {
                console.log("No such document! Ready for first-time setup.");
                showAdminStatus("No existing data found. Fill out the form to create initial content.", 'info');
                if (socialLinksContainer && socialLinksContainer.children.length === 0) addSocialLinkItem();
                if (keyFeaturesContainer && keyFeaturesContainer.children.length === 0) addKeyFeatureItem();
                if (testimonialsContainer && testimonialsContainer.children.length === 0) addTestimonialItem();
                // Add initial items for new dynamic lists as well
                if (communityInvolvementItemsContainer && communityInvolvementItemsContainer.children.length === 0) addCommunityInvolvementItem();
                if (serviceApproachStepsContainer && serviceApproachStepsContainer.children.length === 0) addServiceApproachStepItem();
                if (serviceDifferentiatorsContainer && serviceDifferentiatorsContainer.children.length === 0) addServiceDifferentiatorItem();
                if (serviceBenefitItemsContainer && serviceBenefitItemsContainer.children.length === 0) addServiceBenefitItem();
                if (serviceFaqItemsContainer && serviceFaqItemsContainer.children.length === 0) addServiceFaqItem();
                if (contactSocialLinksContainer && contactSocialLinksContainer.children.length === 0) addContactSocialLinkItem();
                if (contactFaqItemsContainer && contactFaqItemsContainer.children.length === 0) addContactFaqItem();

            }
        } catch (error) {
            console.error("Error getting document:", error);
            showAdminStatus("Error loading content: " + error.message, 'error');
        }
    }

    function populateFormWithData(data) {
        if (!data) return;
        if (!contentManagementForm) return;
        contentManagementForm.reset(); 

        document.getElementById('adminCompanyName').value = data.companyName || '';
        if(adminCompanyNicheInput) adminCompanyNicheInput.value = data.companyNiche || '';
        document.getElementById('adminTagline').value = data.tagline || '';
        document.getElementById('adminLogoUrl').value = data.logoUrl || '';

        document.getElementById('adminContactEmail').value = getSafe(() => data.contactDetails.email);
        document.getElementById('adminContactPhone').value = getSafe(() => data.contactDetails.phone);
        document.getElementById('adminContactAddress').value = getSafe(() => data.contactDetails.address);

        if (socialLinksContainer) socialLinksContainer.innerHTML = '';
        if (data.socialMediaLinks && Array.isArray(data.socialMediaLinks)) {
            data.socialMediaLinks.forEach(link => addSocialLinkItem(link));
        } else if (socialLinksContainer) { addSocialLinkItem(); } 
        
        document.getElementById('adminThemePrimaryColor').value = getSafe(() => data.themeColors.primary, '#3498DB');
        document.getElementById('adminThemeSecondaryColor').value = getSafe(() => data.themeColors.secondary, '#95A5A6');
        document.getElementById('adminThemeAccentColor').value = getSafe(() => data.themeColors.accent, '#1ABC9C');

        const home = data.pages?.home || {};
        document.getElementById('adminHomeHeroTitle').value = getSafe(() => home.hero.title);
        document.getElementById('adminHomeHeroSubtitle').value = getSafe(() => home.hero.subtitle);
        document.getElementById('adminHomeHeroImage').value = getSafe(() => home.hero.imagePlaceholder);
        document.getElementById('adminHomeHeroCtaText').value = getSafe(() => home.hero.ctaText);
        document.getElementById('adminHomeHeroCtaLink').value = getSafe(() => home.hero.ctaLink);
        document.getElementById('adminHomeIntroTitle').value = getSafe(() => home.introduction.title);
        document.getElementById('adminHomeIntroText').value = getSafe(() => home.introduction.text);
        document.getElementById('adminHomeIntroImage').value = getSafe(() => home.introduction.imagePlaceholder);
        document.getElementById('adminHomeIntroImageAlt').value = getSafe(() => home.introduction.imageAlt);
        document.getElementById('adminHomeFeaturedServicesTitle').value = getSafe(() => home.featuredServices.title);
        document.getElementById('adminHomeFeaturedServicesIntro').value = getSafe(() => home.featuredServices.introText);
        document.getElementById('adminHomeKeyFeaturesTitle').value = getSafe(() => home.keyFeatures.title);
        if (keyFeaturesContainer) keyFeaturesContainer.innerHTML = '';
        if (home.keyFeatures?.items && Array.isArray(home.keyFeatures.items)) {
            home.keyFeatures.items.forEach(item => addKeyFeatureItem(item));
        } else if (keyFeaturesContainer) { addKeyFeatureItem(); }

        // New Home Page Sections
        document.getElementById('adminHomeCtaBarTitle').value = getSafe(() => home.ctaBar.title);
        document.getElementById('adminHomeCtaBarText').value = getSafe(() => home.ctaBar.text);
        document.getElementById('adminHomeCtaBarButtonText').value = getSafe(() => home.ctaBar.buttonText);
        document.getElementById('adminHomeCtaBarButtonLink').value = getSafe(() => home.ctaBar.buttonLink);
        document.getElementById('adminHomeBlogTeaserTitle').value = getSafe(() => home.blogTeaser.title);
        document.getElementById('adminHomeBlogTeaserNumPosts').value = getSafe(() => home.blogTeaser.numPosts, 3);
        document.getElementById('adminHomeBlogTeaserViewAllText').value = getSafe(() => home.blogTeaser.viewAllText);


        document.getElementById('adminHomeAboutTeaserTitle').value = getSafe(() => home.aboutTeaser.title);
        document.getElementById('adminHomeAboutTeaserText').value = getSafe(() => home.aboutTeaser.text);
        document.getElementById('adminHomeAboutTeaserImageSrc').value = getSafe(() => home.aboutTeaser.imageSrc);
        document.getElementById('adminHomeAboutTeaserImageAlt').value = getSafe(() => home.aboutTeaser.imageAlt);
        document.getElementById('adminHomeAboutTeaserButtonText').value = getSafe(() => home.aboutTeaser.buttonText);
        document.getElementById('adminHomeAboutTeaserButtonLink').value = getSafe(() => home.aboutTeaser.buttonLink);
        document.getElementById('adminHomeTestimonialsTitle').value = getSafe(() => home.testimonials.title);
        if (testimonialsContainer) testimonialsContainer.innerHTML = '';
        if (home.testimonials?.items && Array.isArray(home.testimonials.items)) {
            home.testimonials.items.forEach(item => addTestimonialItem(item));
        } else if (testimonialsContainer) { addTestimonialItem(); }

        const about = data.pages?.about || {};
        document.getElementById('adminAboutMetaDesc').value = about.metaDescription || '';
        document.getElementById('adminAboutHeroTitle').value = getSafe(() => about.hero.title);
        document.getElementById('adminAboutHeroSubtitle').value = getSafe(() => about.hero.subtitle);
        document.getElementById('adminAboutHeroImage').value = getSafe(() => about.hero.imagePlaceholder);
        document.getElementById('adminAboutStoryTitle').value = getSafe(() => about.ourStory.title);
        if (storyBlocksContainer) storyBlocksContainer.innerHTML = '';
        if (about.ourStory?.blocks && Array.isArray(about.ourStory.blocks)) {
            about.ourStory.blocks.forEach(block => addStoryBlockItem(block));
        } else if (storyBlocksContainer) { addStoryBlockItem(); }
        document.getElementById('adminAboutTeamTitle').value = getSafe(() => about.team.title);
        document.getElementById('adminAboutTeamIntro').value = getSafe(() => about.team.introText);
        if (teamMembersContainer) teamMembersContainer.innerHTML = '';
        if (about.team?.members && Array.isArray(about.team.members)) {
            about.team.members.forEach(member => addTeamMemberItem(member));
        } else if (teamMembersContainer) { addTeamMemberItem(); }
        document.getElementById('adminAboutValuesTitle').value = getSafe(() => about.values.title);
        document.getElementById('adminAboutValuesIntro').value = getSafe(() => about.values.introText);
        if (valuesListContainer) valuesListContainer.innerHTML = '';
        if (about.values?.list && Array.isArray(about.values.list)) {
            about.values.list.forEach(value => addValueItem(value));
        } else if (valuesListContainer) { addValueItem(); }

        // About Page - Additional Sections
        document.getElementById('adminAboutMissionVisionSectionTitle').value = getSafe(() => about.missionVision.sectionTitle, "Our Mission & Vision");
        document.getElementById('adminAboutMissionTitle').value = getSafe(() => about.missionVision.missionTitle, "Our Mission");
        document.getElementById('adminAboutMissionText').value = getSafe(() => about.missionVision.missionText);
        document.getElementById('adminAboutVisionTitle').value = getSafe(() => about.missionVision.visionTitle, "Our Vision");
        document.getElementById('adminAboutVisionText').value = getSafe(() => about.missionVision.visionText);

        document.getElementById('adminAboutCultureSectionTitle').value = getSafe(() => about.companyCulture.sectionTitle, "Our Culture");
        document.getElementById('adminAboutCultureMainText').value = getSafe(() => about.companyCulture.mainText);
        document.getElementById('adminAboutCultureImage').value = getSafe(() => about.companyCulture.imageSrc);
        document.getElementById('adminAboutCultureImageAlt').value = getSafe(() => about.companyCulture.imageAlt);
        
        document.getElementById('adminAboutCommunitySectionTitle').value = getSafe(() => about.communityInvolvement.sectionTitle, "Community Involvement & CSR");
        document.getElementById('adminAboutCommunityMainText').value = getSafe(() => about.communityInvolvement.mainText);
        if (communityInvolvementItemsContainer) communityInvolvementItemsContainer.innerHTML = '';
        if (about.communityInvolvement?.items && Array.isArray(about.communityInvolvement.items)) {
            about.communityInvolvement.items.forEach(item => addCommunityInvolvementItem(item));
        } else if (communityInvolvementItemsContainer) { addCommunityInvolvementItem(); }

        document.getElementById('adminAboutCareersSectionTitle').value = getSafe(() => about.careersTeaser.sectionTitle, "Join Our Team");
        document.getElementById('adminAboutCareersMainText').value = getSafe(() => about.careersTeaser.mainText);
        document.getElementById('adminAboutCareersButtonText').value = getSafe(() => about.careersTeaser.buttonText, "Explore Careers");
        document.getElementById('adminAboutCareersButtonLink').value = getSafe(() => about.careersTeaser.buttonLink);

        
        const services = data.pages?.services || {};
        document.getElementById('adminServicesPageTitle').value = services.pageTitle || '';
        document.getElementById('adminServicesPageIntro').value = services.introductionText || '';
        
        // Services Page Additional Sections
        document.getElementById('adminServicesApproachTitle').value = getSafe(() => services.ourApproach.title, "Our Service Approach");
        document.getElementById('adminServicesApproachMainText').value = getSafe(() => services.ourApproach.mainText);
        if (serviceApproachStepsContainer) serviceApproachStepsContainer.innerHTML = '';
        if (services.ourApproach?.steps && Array.isArray(services.ourApproach.steps)) {
            services.ourApproach.steps.forEach(step => addServiceApproachStepItem(step));
        } else if (serviceApproachStepsContainer) { addServiceApproachStepItem(); }
        
        document.getElementById('adminServicesWhyTitle').value = getSafe(() => services.whyChooseUs.title, "Why Choose Our Services?");
        document.getElementById('adminServicesWhyMainText').value = getSafe(() => services.whyChooseUs.mainText);
        if (serviceDifferentiatorsContainer) serviceDifferentiatorsContainer.innerHTML = '';
        if (services.whyChooseUs?.differentiators && Array.isArray(services.whyChooseUs.differentiators)) {
            services.whyChooseUs.differentiators.forEach(item => addServiceDifferentiatorItem(item));
        } else if (serviceDifferentiatorsContainer) { addServiceDifferentiatorItem(); }

        document.getElementById('adminServicesBenefitsTitle').value = getSafe(() => services.benefits.title, "Benefits You Can Expect");
        document.getElementById('adminServicesBenefitsMainText').value = getSafe(() => services.benefits.mainText);
        if (serviceBenefitItemsContainer) serviceBenefitItemsContainer.innerHTML = '';
        if (services.benefits?.items && Array.isArray(services.benefits.items)) {
            services.benefits.items.forEach(item => addServiceBenefitItem(item));
        } else if (serviceBenefitItemsContainer) { addServiceBenefitItem(); }

        document.getElementById('adminServicesCaseStudiesTitle').value = getSafe(() => services.caseStudiesTeaser.title, "Success in Action");
        document.getElementById('adminServicesCaseStudiesMainText').value = getSafe(() => services.caseStudiesTeaser.mainText);
        document.getElementById('adminServicesCaseStudiesImage').value = getSafe(() => services.caseStudiesTeaser.imageSrc);
        document.getElementById('adminServicesCaseStudiesImageAlt').value = getSafe(() => services.caseStudiesTeaser.imageAlt);
        document.getElementById('adminServicesCaseStudiesCaption').value = getSafe(() => services.caseStudiesTeaser.caption);

        document.getElementById('adminServicesFaqTitle').value = getSafe(() => services.faq.title, "Services FAQ");
        document.getElementById('adminServicesFaqMainText').value = getSafe(() => services.faq.mainText);
        if (serviceFaqItemsContainer) serviceFaqItemsContainer.innerHTML = '';
        if (services.faq?.items && Array.isArray(services.faq.items)) {
            services.faq.items.forEach(item => addServiceFaqItem(item));
        } else if (serviceFaqItemsContainer) { addServiceFaqItem(); }

        document.getElementById('adminServicesCtaQuoteTitle').value = getSafe(() => services.customQuoteCta.title, "Need a Tailored Solution?");
        document.getElementById('adminServicesCtaQuoteMainText').value = getSafe(() => services.customQuoteCta.mainText);
        document.getElementById('adminServicesCtaQuoteButtonText').value = getSafe(() => services.customQuoteCta.buttonText, "Request a Custom Quote");
        document.getElementById('adminServicesCtaQuoteButtonLink').value = getSafe(() => services.customQuoteCta.buttonLink, "contact.html");

        if (servicesListContainer) servicesListContainer.innerHTML = '';
        if (services.serviceList && Array.isArray(services.serviceList)) {
            services.serviceList.forEach(service => addServiceItem(service));
        } else if (servicesListContainer) { addServiceItem(); }

        const blog = data.pages?.blog || {};
        document.getElementById('adminBlogPageTitle').value = blog.pageTitle || '';
        document.getElementById('adminBlogPageIntro').value = blog.introductionText || '';

        // New blog sections
        document.getElementById('adminBlogFeaturedPostTitle').value = getSafe(() => blog.featuredPostSpotlight.title, "Featured Post Spotlight");
        document.getElementById('adminBlogFeaturedPostId').value = getSafe(() => blog.featuredPostSpotlight.postIdToFeature);
        document.getElementById('adminBlogFeaturedPostText').value = getSafe(() => blog.featuredPostSpotlight.text);

        document.getElementById('adminBlogCategoriesTitle').value = getSafe(() => blog.blogCategoriesOverview.title, "Explore by Category");
        document.getElementById('adminBlogCategoriesIntro').value = getSafe(() => blog.blogCategoriesOverview.introText);
        document.getElementById('adminBlogCategoriesPlaceholderText').value = getSafe(() => blog.blogCategoriesOverview.categoriesPlaceholderText);

        document.getElementById('adminBlogAuthorSpotlightTitle').value = getSafe(() => blog.authorSpotlightBlog.title, "Meet Our Authors");
        document.getElementById('adminBlogAuthorSpotlightText').value = getSafe(() => blog.authorSpotlightBlog.text);
        document.getElementById('adminBlogAuthorSpotlightImage').value = getSafe(() => blog.authorSpotlightBlog.imageSrc);
        document.getElementById('adminBlogAuthorSpotlightImageAlt').value = getSafe(() => blog.authorSpotlightBlog.imageAlt);
        
        document.getElementById('adminBlogArchivesTitle').value = getSafe(() => blog.blogArchivesLink.title, "Looking for Older Posts?");
        document.getElementById('adminBlogArchivesText').value = getSafe(() => blog.blogArchivesLink.text);
        document.getElementById('adminBlogArchivesButtonText').value = getSafe(() => blog.blogArchivesLink.buttonText, "Visit Archives");
        document.getElementById('adminBlogArchivesButtonLink').value = getSafe(() => blog.blogArchivesLink.buttonLink, "#");

        document.getElementById('adminBlogSubscribeTitle').value = getSafe(() => blog.blogSubscribeCta.title, "Stay Updated!");
        document.getElementById('adminBlogSubscribeText').value = getSafe(() => blog.blogSubscribeCta.text);
        document.getElementById('adminBlogSubscribePlaceholderText').value = getSafe(() => blog.blogSubscribeCta.formPlaceholderText);
        document.getElementById('adminBlogSubscribeButtonText').value = getSafe(() => blog.blogSubscribeCta.buttonText, "Subscribe Now");
        document.getElementById('adminBlogSubscribeButtonLink').value = getSafe(() => blog.blogSubscribeCta.buttonLink, "contact.html?subject=Blog%20Subscription");


        document.getElementById('adminBlogRelatedTopicsTitle').value = getSafe(() => blog.relatedTopicsBlog.title, "Related Topics");
        document.getElementById('adminBlogRelatedTopicsIntro').value = getSafe(() => blog.relatedTopicsBlog.introText);
        document.getElementById('adminBlogRelatedTopicsPlaceholderText').value = getSafe(() => blog.relatedTopicsBlog.topicsPlaceholderText);


        if (blogPostsContainer) blogPostsContainer.innerHTML = '';
        if (blog.posts && Array.isArray(blog.posts)) {
            blog.posts.forEach(post => addBlogPostItem(post));
        } else if (blogPostsContainer) { addBlogPostItem(); }

        const contact = data.pages?.contact || {};
        document.getElementById('adminContactPageTitle').value = contact.pageTitle || '';
        document.getElementById('adminContactPageIntro').value = contact.introText || '';
        document.getElementById('adminContactFormTitle').value = contact.formSectionTitle || '';
        document.getElementById('adminContactInfoTitle').value = contact.contactInfoTitle || '';
        document.getElementById('adminContactMapPlaceholder').value = contact.mapPlaceholderText || '';
        document.getElementById('adminContactFormspree').value = contact.formspreeEndpoint || '';

        // Contact Page - Additional Sections
        document.getElementById('adminContactOfficeHoursTitle').value = getSafe(() => contact.officeHours.title, "Our Office Hours");
        document.getElementById('adminContactOfficeHoursText').value = getSafe(() => contact.officeHours.text);
        document.getElementById('adminContactResponseTitle').value = getSafe(() => contact.responseExpectations.title, "Response Expectations");
        document.getElementById('adminContactResponseText').value = getSafe(() => contact.responseExpectations.text);
        document.getElementById('adminContactSocialTitle').value = getSafe(() => contact.socialConnect.title, "Connect With Us");
        document.getElementById('adminContactSocialIntro').value = getSafe(() => contact.socialConnect.introText);
        if (contactSocialLinksContainer) contactSocialLinksContainer.innerHTML = '';
        if (contact.socialConnect?.links && Array.isArray(contact.socialConnect.links)) {
            contact.socialConnect.links.forEach(link => addContactSocialLinkItem(link));
        } else if (contactSocialLinksContainer) { addContactSocialLinkItem(); }

        document.getElementById('adminContactLocationTitle').value = getSafe(() => contact.locationHighlights.title, "Location Highlights");
        document.getElementById('adminContactLocationText').value = getSafe(() => contact.locationHighlights.text);

        document.getElementById('adminContactFaqsTitle').value = getSafe(() => contact.faqs.title, "Contact FAQs");
        document.getElementById('adminContactFaqsIntro').value = getSafe(() => contact.faqs.introText);
        if (contactFaqItemsContainer) contactFaqItemsContainer.innerHTML = '';
        if (contact.faqs?.items && Array.isArray(contact.faqs.items)) {
            contact.faqs.items.forEach(item => addContactFaqItem(item));
        } else if (contactFaqItemsContainer) { addContactFaqItem(); }
    }
    
    function collectFormData() {
        const dataToSave = {
            companyName: document.getElementById('adminCompanyName').value,
            companyNiche: adminCompanyNicheInput ? adminCompanyNicheInput.value : '',
            tagline: document.getElementById('adminTagline').value,
            logoUrl: document.getElementById('adminLogoUrl').value,
            contactDetails: {
                email: document.getElementById('adminContactEmail').value,
                phone: document.getElementById('adminContactPhone').value,
                address: document.getElementById('adminContactAddress').value,
            },
            themeColors: {
                primary: document.getElementById('adminThemePrimaryColor').value,
                secondary: document.getElementById('adminThemeSecondaryColor').value,
                accent: document.getElementById('adminThemeAccentColor').value,
            },
            socialMediaLinks: [],
            pages: {
                home: {
                    hero: {
                        title: document.getElementById('adminHomeHeroTitle').value,
                        subtitle: document.getElementById('adminHomeHeroSubtitle').value,
                        imagePlaceholder: document.getElementById('adminHomeHeroImage').value,
                        ctaText: document.getElementById('adminHomeHeroCtaText').value,
                        ctaLink: document.getElementById('adminHomeHeroCtaLink').value,
                    },
                    introduction: {
                        title: document.getElementById('adminHomeIntroTitle').value,
                        text: document.getElementById('adminHomeIntroText').value,
                        imagePlaceholder: document.getElementById('adminHomeIntroImage').value,
                        imageAlt: document.getElementById('adminHomeIntroImageAlt').value,
                    },
                    featuredServices: {
                        title: document.getElementById('adminHomeFeaturedServicesTitle').value,
                        introText: document.getElementById('adminHomeFeaturedServicesIntro').value,
                         // services are managed under pages.services.serviceList
                    },
                    keyFeatures: {
                        title: document.getElementById('adminHomeKeyFeaturesTitle').value,
                        items: [],
                    },
                    ctaBar: { // New section
                        title: document.getElementById('adminHomeCtaBarTitle').value,
                        text: document.getElementById('adminHomeCtaBarText').value,
                        buttonText: document.getElementById('adminHomeCtaBarButtonText').value,
                        buttonLink: document.getElementById('adminHomeCtaBarButtonLink').value,
                    },
                    aboutTeaser: {
                        title: document.getElementById('adminHomeAboutTeaserTitle').value,
                        text: document.getElementById('adminHomeAboutTeaserText').value,
                        imageSrc: document.getElementById('adminHomeAboutTeaserImageSrc').value,
                        imageAlt: document.getElementById('adminHomeAboutTeaserImageAlt').value,
                        buttonText: document.getElementById('adminHomeAboutTeaserButtonText').value,
                        buttonLink: document.getElementById('adminHomeAboutTeaserButtonLink').value,
                    },
                    testimonials: {
                         title: document.getElementById('adminHomeTestimonialsTitle').value,
                        items: [],
                    },
                    blogTeaser: { // New section
                        title: document.getElementById('adminHomeBlogTeaserTitle').value,
                        numPosts: parseInt(document.getElementById('adminHomeBlogTeaserNumPosts').value, 10) || 3,
                        viewAllText: document.getElementById('adminHomeBlogTeaserViewAllText').value,
                    }
                },
                about: {
                    metaDescription: document.getElementById('adminAboutMetaDesc').value,
                    hero: {
                        title: document.getElementById('adminAboutHeroTitle').value,
                        subtitle: document.getElementById('adminAboutHeroSubtitle').value,
                        imagePlaceholder: document.getElementById('adminAboutHeroImage').value,
                    },
                    ourStory: {
                        title: document.getElementById('adminAboutStoryTitle').value,
                        blocks: [],
                    },
                    team: {
                        title: document.getElementById('adminAboutTeamTitle').value,
                        introText: document.getElementById('adminAboutTeamIntro').value,
                        members: [],
                    },
                    values: {
                        title: document.getElementById('adminAboutValuesTitle').value,
                        introText: document.getElementById('adminAboutValuesIntro').value,
                        list: [],
                    },
                    missionVision: {
                        sectionTitle: document.getElementById('adminAboutMissionVisionSectionTitle').value,
                        missionTitle: document.getElementById('adminAboutMissionTitle').value,
                        missionText: document.getElementById('adminAboutMissionText').value,
                        visionTitle: document.getElementById('adminAboutVisionTitle').value,
                        visionText: document.getElementById('adminAboutVisionText').value,
                    },
                    companyCulture: {
                        sectionTitle: document.getElementById('adminAboutCultureSectionTitle').value,
                        mainText: document.getElementById('adminAboutCultureMainText').value,
                        imageSrc: document.getElementById('adminAboutCultureImage').value,
                        imageAlt: document.getElementById('adminAboutCultureImageAlt').value,
                    },
                    communityInvolvement: {
                        sectionTitle: document.getElementById('adminAboutCommunitySectionTitle').value,
                        mainText: document.getElementById('adminAboutCommunityMainText').value,
                        items: [],
                    },
                    careersTeaser: {
                        sectionTitle: document.getElementById('adminAboutCareersSectionTitle').value,
                        mainText: document.getElementById('adminAboutCareersMainText').value,
                        buttonText: document.getElementById('adminAboutCareersButtonText').value,
                        buttonLink: document.getElementById('adminAboutCareersButtonLink').value,
                    }
                },
                services: {
                    pageTitle: document.getElementById('adminServicesPageTitle').value,
                    introductionText: document.getElementById('adminServicesPageIntro').value,
                    ourApproach: {
                        title: document.getElementById('adminServicesApproachTitle').value,
                        mainText: document.getElementById('adminServicesApproachMainText').value,
                        steps: []
                    },
                    whyChooseUs: {
                        title: document.getElementById('adminServicesWhyTitle').value,
                        mainText: document.getElementById('adminServicesWhyMainText').value,
                        differentiators: []
                    },
                    benefits: {
                        title: document.getElementById('adminServicesBenefitsTitle').value,
                        mainText: document.getElementById('adminServicesBenefitsMainText').value,
                        items: []
                    },
                    caseStudiesTeaser: {
                        title: document.getElementById('adminServicesCaseStudiesTitle').value,
                        mainText: document.getElementById('adminServicesCaseStudiesMainText').value,
                        imageSrc: document.getElementById('adminServicesCaseStudiesImage').value,
                        imageAlt: document.getElementById('adminServicesCaseStudiesImageAlt').value,
                        caption: document.getElementById('adminServicesCaseStudiesCaption').value
                    },
                    faq: {
                        title: document.getElementById('adminServicesFaqTitle').value,
                        mainText: document.getElementById('adminServicesFaqMainText').value,
                        items: []
                    },
                    customQuoteCta: {
                        title: document.getElementById('adminServicesCtaQuoteTitle').value,
                        mainText: document.getElementById('adminServicesCtaQuoteMainText').value,
                        buttonText: document.getElementById('adminServicesCtaQuoteButtonText').value,
                        buttonLink: document.getElementById('adminServicesCtaQuoteButtonLink').value
                    },
                    serviceList: [],
                },
                blog: {
                    pageTitle: document.getElementById('adminBlogPageTitle').value,
                    introductionText: document.getElementById('adminBlogPageIntro').value,
                    featuredPostSpotlight: {
                        title: document.getElementById('adminBlogFeaturedPostTitle').value,
                        postIdToFeature: document.getElementById('adminBlogFeaturedPostId').value,
                        text: document.getElementById('adminBlogFeaturedPostText').value,
                    },
                    blogCategoriesOverview: {
                        title: document.getElementById('adminBlogCategoriesTitle').value,
                        introText: document.getElementById('adminBlogCategoriesIntro').value,
                        categoriesPlaceholderText: document.getElementById('adminBlogCategoriesPlaceholderText').value,
                    },
                    authorSpotlightBlog: {
                        title: document.getElementById('adminBlogAuthorSpotlightTitle').value,
                        text: document.getElementById('adminBlogAuthorSpotlightText').value,
                        imageSrc: document.getElementById('adminBlogAuthorSpotlightImage').value,
                        imageAlt: document.getElementById('adminBlogAuthorSpotlightImageAlt').value,
                    },
                    blogArchivesLink: {
                        title: document.getElementById('adminBlogArchivesTitle').value,
                        text: document.getElementById('adminBlogArchivesText').value,
                        buttonText: document.getElementById('adminBlogArchivesButtonText').value,
                        buttonLink: document.getElementById('adminBlogArchivesButtonLink').value,
                    },
                    blogSubscribeCta: {
                        title: document.getElementById('adminBlogSubscribeTitle').value,
                        text: document.getElementById('adminBlogSubscribeText').value,
                        formPlaceholderText: document.getElementById('adminBlogSubscribePlaceholderText').value,
                        buttonText: document.getElementById('adminBlogSubscribeButtonText').value,
                        buttonLink: document.getElementById('adminBlogSubscribeButtonLink').value,
                    },
                    relatedTopicsBlog: {
                        title: document.getElementById('adminBlogRelatedTopicsTitle').value,
                        introText: document.getElementById('adminBlogRelatedTopicsIntro').value,
                        topicsPlaceholderText: document.getElementById('adminBlogRelatedTopicsPlaceholderText').value,
                    },
                    posts: [],
                },
                contact: {
                    pageTitle: document.getElementById('adminContactPageTitle').value,
                    introText: document.getElementById('adminContactPageIntro').value,
                    formSectionTitle: document.getElementById('adminContactFormTitle').value,
                    contactInfoTitle: document.getElementById('adminContactInfoTitle').value,
                    mapPlaceholderText: document.getElementById('adminContactMapPlaceholder').value,
                    formspreeEndpoint: document.getElementById('adminContactFormspree').value,
                    officeHours: {
                        title: document.getElementById('adminContactOfficeHoursTitle').value,
                        text: document.getElementById('adminContactOfficeHoursText').value,
                    },
                    responseExpectations: {
                        title: document.getElementById('adminContactResponseTitle').value,
                        text: document.getElementById('adminContactResponseText').value,
                    },
                    socialConnect: {
                        title: document.getElementById('adminContactSocialTitle').value,
                        introText: document.getElementById('adminContactSocialIntro').value,
                        links: [],
                    },
                    locationHighlights: {
                        title: document.getElementById('adminContactLocationTitle').value,
                        text: document.getElementById('adminContactLocationText').value,
                    },
                    faqs: {
                        title: document.getElementById('adminContactFaqsTitle').value,
                        introText: document.getElementById('adminContactFaqsIntro').value,
                        items: [],
                    }
                }
            }
        };
        
        if (socialLinksContainer) {
            socialLinksContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.socialMediaLinks.push({
                    platform: item.querySelector('.social-platform-input').value,
                    url: item.querySelector('.social-url-input').value,
                });
            });
        }
        
        if (keyFeaturesContainer) {
            keyFeaturesContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.home.keyFeatures.items.push({
                    id: item.querySelector('.keyfeature-id-input').value,
                    title: item.querySelector('.keyfeature-title-input').value,
                    description: item.querySelector('.keyfeature-description-input').value,
                    iconPlaceholder: item.querySelector('.keyfeature-icon-input').value,
                    layout: item.querySelector('.keyfeature-layout-select').value,
                    isImage: item.querySelector('.keyfeature-isimage-checkbox').checked,
                    imageSrc: item.querySelector('.keyfeature-imagesrc-input').value,
                    imageAlt: item.querySelector('.keyfeature-imagealt-input').value,
                });
            });
        }

        if (testimonialsContainer) {
            testimonialsContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.home.testimonials.items.push({
                    quote: item.querySelector('.testimonial-quote-input').value,
                    author: item.querySelector('.testimonial-author-input').value,
                    company: item.querySelector('.testimonial-company-input').value,
                });
            });
        }
        
        if (storyBlocksContainer) {
            storyBlocksContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.about.ourStory.blocks.push({
                    text: item.querySelector('.storyblock-text-input').value,
                    imagePlaceholder: item.querySelector('.storyblock-image-input').value,
                    imageAlt: item.querySelector('.storyblock-imagealt-input').value,
                });
            });
        }

        if (teamMembersContainer) {
            teamMembersContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                const socialInput = item.querySelector('.teammember-social-input').value;
                const socialLinks = socialInput.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.includes(':'))
                    .map(line => {
                        const parts = line.split(/:(.+)/); 
                        return { platform: parts[0]?.trim(), url: parts[1]?.trim() };
                    })
                    .filter(link => link.platform && link.url);

                dataToSave.pages.about.team.members.push({
                    name: item.querySelector('.teammember-name-input').value,
                    title: item.querySelector('.teammember-title-input').value,
                    imagePlaceholder: item.querySelector('.teammember-image-input').value,
                    bio: item.querySelector('.teammember-bio-input').value,
                    socialLinks: socialLinks,
                });
            });
        }

        if (valuesListContainer) {
            valuesListContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.about.values.list.push({
                    name: item.querySelector('.value-name-input').value,
                    description: item.querySelector('.value-description-input').value,
                    iconPlaceholder: item.querySelector('.value-icon-input').value,
                });
            });
        }
        
        if (communityInvolvementItemsContainer) {
            communityInvolvementItemsContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.about.communityInvolvement.items.push({
                    text: item.querySelector('.community-involvement-item-text-input').value,
                });
            });
        }

        // Services Page - Additional Sections
        if (serviceApproachStepsContainer) {
            serviceApproachStepsContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.services.ourApproach.steps.push({
                    title: item.querySelector('.service-approach-step-title-input').value,
                    description: item.querySelector('.service-approach-step-desc-input').value,
                });
            });
        }
        if (serviceDifferentiatorsContainer) {
            serviceDifferentiatorsContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.services.whyChooseUs.differentiators.push({
                    title: item.querySelector('.service-differentiator-title-input').value,
                    description: item.querySelector('.service-differentiator-desc-input').value,
                });
            });
        }
        if (serviceBenefitItemsContainer) {
            serviceBenefitItemsContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.services.benefits.items.push({
                    text: item.querySelector('.service-benefit-item-text-input').value,
                });
            });
        }
        if (serviceFaqItemsContainer) {
            serviceFaqItemsContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.services.faq.items.push({
                    question: item.querySelector('.service-faq-item-question-input').value,
                    answer: item.querySelector('.service-faq-item-answer-input').value,
                });
            });
        }


        if (servicesListContainer) {
            servicesListContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.services.serviceList.push({
                    id: item.querySelector('.service-id-input').value,
                    name: item.querySelector('.service-name-input').value,
                    shortDescription: item.querySelector('.service-shortdesc-input').value,
                    imagePlaceholder: item.querySelector('.service-image-input').value,
                    detailPageUrl: item.querySelector('.service-detailurl-input').value,
                    detailContent: {
                        pageTitle: item.querySelector('.service-detail-pageTitle-input').value,
                        metaDescription: item.querySelector('.service-detail-metaDesc-input').value,
                        bannerImagePlaceholder: item.querySelector('.service-detail-bannerImage-input').value,
                        overview: item.querySelector('.service-detail-overview-input').value,
                        featuresSectionTitle: item.querySelector('.service-detail-featuresTitle-input').value,
                        features: tryParseJSON(item.querySelector('.service-detail-features-input').value, []),
                        specificTestimonials: tryParseJSON(item.querySelector('.service-detail-specificTestimonialsJson-input').value, []),
                        relatedResources: tryParseJSON(item.querySelector('.service-detail-relatedResourcesJson-input').value, []),
                        processSectionTitle: item.querySelector('.service-detail-processTitle-input').value,
                        processDescription: item.querySelector('.service-detail-processDesc-input').value,
                        ctaButtonText: item.querySelector('.service-detail-ctaText-input').value,
                        ctaButtonLink: item.querySelector('.service-detail-ctaLink-input').value,
                    }
                });
            });
        }

        if (blogPostsContainer) {
            blogPostsContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                const postData = {
                    id: item.querySelector('.blogpost-id-input').value,
                    title: item.querySelector('.blogpost-title-input').value,
                    date: item.querySelector('.blogpost-date-input').value,
                    author: item.querySelector('.blogpost-author-input').value,
                    summary: item.querySelector('.blogpost-summary-input').value,
                    imagePlaceholder: item.querySelector('.blogpost-image-input').value,
                    detailPageUrl: item.querySelector('.blogpost-detailurl-input').value,
                    detailContent: {
                        pageTitle: item.querySelector('.blogpost-detail-pageTitle-input').value,
                        metaDescription: item.querySelector('.blogpost-detail-metaDesc-input').value,
                        bannerImagePlaceholder: item.querySelector('.blogpost-detail-bannerImage-input').value,
                        fullText: tryParseJSON(item.querySelector('.blogpost-detail-fulltext-input').value, []),
                        authorBio: item.querySelector('.blogpost-author-bio-input').value,
                        authorImage: item.querySelector('.blogpost-author-image-input').value,
                        authorPageLink: item.querySelector('.blogpost-author-link-input').value,
                        enableSocialShare: item.querySelector('.blogpost-social-share-enable-input').checked,
                        socialShareText: item.querySelector('.blogpost-social-share-text-input').value,
                        tags: item.querySelector('.blogpost-tags-input').value,
                        categories: item.querySelector('.blogpost-categories-input').value,
                        prevPostText: item.querySelector('.blogpost-prev-text-input').value,
                        nextPostText: item.querySelector('.blogpost-next-text-input').value,
                        relatedPostsTitle: item.querySelector('.blogpost-related-title-input').value,
                        relatedPostIDs: item.querySelector('.blogpost-related-ids-input').value,
                        commentsPlaceholderText: item.querySelector('.blogpost-comments-placeholder-input').value,
                        ctaTitle: item.querySelector('.blogpost-cta-title-input').value,
                        ctaText: item.querySelector('.blogpost-cta-text-input').value,
                        ctaButtonText: item.querySelector('.blogpost-cta-buttontext-input').value,
                        ctaButtonLink: item.querySelector('.blogpost-cta-buttonlink-input').value,
                    }
                };
                dataToSave.pages.blog.posts.push(postData);
            });
        }

        // Contact Page - Additional Sections
        if (contactSocialLinksContainer) {
            contactSocialLinksContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.contact.socialConnect.links.push({
                    platform: item.querySelector('.contact-social-platform-input').value,
                    url: item.querySelector('.contact-social-url-input').value,
                });
            });
        }
        if (contactFaqItemsContainer) {
            contactFaqItemsContainer.querySelectorAll('.dynamic-list-item').forEach(item => {
                dataToSave.pages.contact.faqs.items.push({
                    question: item.querySelector('.contact-faq-item-question-input').value,
                    answer: item.querySelector('.contact-faq-item-answer-input').value,
                });
            });
        }
        return dataToSave;
    }

    auth.onAuthStateChanged(user => {
        console.log("Auth state changed. User:", user); // Debug log
        showAuthLoading(false); 
        if (user) {
            if (loginForm) loginForm.style.display = 'none';
            if (userInfo) {
                userInfo.style.display = 'block';
                if (userEmailSpan) userEmailSpan.textContent = user.email;
            }
            if (logoutButton) logoutButton.style.display = 'inline-block';
            if (adminContentFormContainer) adminContentFormContainer.style.display = 'block';
            clearAuthError();
            loadCompanyData(); 
        } else {
            if (loginForm) loginForm.style.display = 'block';
            if (userInfo) userInfo.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'none';
            if (adminContentFormContainer) adminContentFormContainer.style.display = 'none';
            if (contentManagementForm) contentManagementForm.reset(); 
            clearAuthError();
            hideAdminStatus();
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => { 
            e.preventDefault();
            clearAuthError();
            const email = emailInput.value;
            const password = passwordInput.value;
            if (!email || !password) {
                displayAuthError("Please enter both email and password."); return;
            }
            loginButton.disabled = true; loginButton.textContent = 'Logging in...';
            try {
                await auth.signInWithEmailAndPassword(email, password);
            } catch (error) {
                console.error("Login error:", error); displayAuthError(error.message);
            } finally {
                loginButton.disabled = false; loginButton.textContent = 'Login';
            }
        });
    }

    if (signupButton) {
        signupButton.addEventListener('click', async () => { 
            clearAuthError();
            const email = emailInput.value;
            const password = passwordInput.value;
            if (!email || !password) {
                displayAuthError("Please enter email and password for sign up."); return;
            }
            if (password.length < 6) {
                displayAuthError("Password should be at least 6 characters."); return;
            }
            signupButton.disabled = true; signupButton.textContent = 'Signing up...';
            try {
                await auth.createUserWithEmailAndPassword(email, password);
                // alert("Sign up successful! You are now logged in."); // onAuthStateChanged will handle UI
            } catch (error) {
                console.error("Sign up error:", error); displayAuthError(error.message);
            } finally {
                signupButton.disabled = false; signupButton.textContent = 'Sign Up';
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => { 
            logoutButton.disabled = true; logoutButton.textContent = 'Logging out...';
            try {
                await auth.signOut();
            } catch (error) {
                console.error("Logout error:", error);
                displayAuthError("Error logging out.");
            } finally {
                logoutButton.disabled = false; logoutButton.textContent = 'Logout';
            }
        });
    }
    
    if (contentManagementForm) {
        contentManagementForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!auth.currentUser) {
                showAdminStatus("You must be logged in to save changes.", 'error'); return;
            }
            showAdminStatus("Saving data...", 'info');
            if(saveAllChangesButton) saveAllChangesButton.disabled = true;
            const dataToSave = collectFormData();
            console.log("Data to save:", JSON.stringify(dataToSave, null, 2)); 
            try {
                await db.collection(SITE_CONTENT_COLLECTION).doc(COMPANY_DOC_ID).set(dataToSave, { merge: true });
                showAdminStatus("Data saved successfully!", 'success');
                setTimeout(hideAdminStatus, 4000);
            } catch (error) {
                console.error("Error saving data to Firestore:", error);
                showAdminStatus("Error saving data: " + error.message, 'error');
            } finally {
                if(saveAllChangesButton) saveAllChangesButton.disabled = false;
            }
        });
    }

    if (addSocialLinkButton) addSocialLinkButton.addEventListener('click', () => addSocialLinkItem());
    if (addKeyFeatureButton) addKeyFeatureButton.addEventListener('click', () => addKeyFeatureItem());
    if (addTestimonialButton) addTestimonialButton.addEventListener('click', () => addTestimonialItem());
    if (addStoryBlockButton) addStoryBlockButton.addEventListener('click', () => addStoryBlockItem());
    if (addTeamMemberButton) addTeamMemberButton.addEventListener('click', () => addTeamMemberItem());
    if (addValueButton) addValueButton.addEventListener('click', () => addValueItem());
    if (addCommunityInvolvementItemButton) addCommunityInvolvementItemButton.addEventListener('click', () => addCommunityInvolvementItem());
    if (addServiceButton) addServiceButton.addEventListener('click', () => addServiceItem());
    if (addBlogPostButton) addBlogPostButton.addEventListener('click', () => addBlogPostItem());

    if (addServiceApproachStepButton) addServiceApproachStepButton.addEventListener('click', () => addServiceApproachStepItem());
    if (addServiceDifferentiatorButton) addServiceDifferentiatorButton.addEventListener('click', () => addServiceDifferentiatorItem());
    if (addServiceBenefitItemButton) addServiceBenefitItemButton.addEventListener('click', () => addServiceBenefitItem());
    if (addServiceFaqItemButton) addServiceFaqItemButton.addEventListener('click', () => addServiceFaqItem());

    if (addContactSocialLinkButton) addContactSocialLinkButton.addEventListener('click', () => addContactSocialLinkItem());
    if (addContactFaqItemButton) addContactFaqItemButton.addEventListener('click', () => addContactFaqItem());

    // The authLoading spinner is visible by default in HTML.
    // onAuthStateChanged will hide it once the auth state is determined.
    // No need for the extra block that was here previously.
});
