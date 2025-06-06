/*
====================================================================================================
IMPORTANT: SUPABASE BACKEND SETUP FOR CONTACT FORM
====================================================================================================

This frontend code is designed to send contact form submissions to a Supabase backend.
You need to set up Supabase and replace the placeholder credentials below.

**Step 1: Create a Supabase Project**
   - If you haven't already, go to https://supabase.com and create a new project.

**Step 2: Create the 'contact_messages' Table**
   - In your Supabase project dashboard, go to the "Table Editor".
   - Click "New table".
   - Table Name: `contact_messages`
   - Ensure "Enable Row Level Security (RLS)" is CHECKED for this table.
   - Define the following columns:
      | Column Name  | Type                        | Default Value      | Is Nullable | Is Unique | Primary Key | Notes                                   |
      |--------------|-----------------------------|--------------------|-------------|-----------|-------------|-----------------------------------------|
      | id           | bigint                      | (auto-generated)   | No          | Yes       | Yes         | Primary key, auto-incrementing          |
      | created_at   | timestamp with time zone    | now()              | No          | No        | No          | Timestamp when the message was created  |
      | name         | text                        |                    | No          | No        | No          | Sender's name                           |
      | email        | text                        |                    | No          | No        | No          | Sender's email                          |
      | subject      | text                        |                    | No          | No        | No          | Message subject                         |
      | message      | text                        |                    | No          | No        | No          | The actual message content              |
      | submitted_at | timestamp with time zone    | (handled by JS)    | Yes         | No        | No          | Timestamp from client (optional)        |
      
   - Click "Save" to create the table.

**Step 3: Set Up Row Level Security (RLS) for Inserts**
   - After creating the table, go to "Authentication" -> "Policies".
   - Select the `contact_messages` table from the schema/table dropdown.
   - Click "New Policy".
   - Choose "Create a new policy from scratch".
   - Policy Name: `Allow public anonymous inserts for contact messages`
   - Allowed operation: CHECK "INSERT"
   - Target roles: CHECK "anon" (this allows non-logged-in users to send messages)
   - USING expression: (leave as `true` or blank for anon inserts if no specific checks needed here)
   - WITH CHECK expression: `true` (this allows all inserts that match the policy)
   - Click "Review" and then "Save policy".
   - *Security Note*: This policy allows anyone to insert data. For production, you might want more restrictive policies, CAPTCHA, or rate limiting, typically handled via custom Edge Functions if more complexity is needed.

**Step 4: Get Your Supabase URL and Anon Key**
   - In your Supabase project dashboard, go to "Project Settings" (usually a gear icon).
   - Under "API":
      - Find your "Project URL". This is your `SUPABASE_URL_PLACEHOLDER`.
      - Find your "Project API keys" -> "anon" "public" key. This is your `SUPABASE_ANON_KEY_PLACEHOLDER`.

**Step 5: Update Frontend Placeholders**
   - Replace `SUPABASE_URL_PLACEHOLDER` and `SUPABASE_ANON_KEY_PLACEHOLDER` at the top of this file (`js/script.js`) with your actual Supabase URL and anon key.

Example:
   // const SUPABASE_URL_PLACEHOLDER = 'https://your-project-id.supabase.co';
   // const SUPABASE_ANON_KEY_PLACEHOLDER = 'eyYourVeryLongAnonKey...';

====================================================================================================
*/
// Add these placeholders at the TOP of js/script.js (outside DOMContentLoaded)
const SUPABASE_URL_PLACEHOLDER = 'YOUR_SUPABASE_URL'; // IMPORTANT: User must replace this
const SUPABASE_ANON_KEY_PLACEHOLDER = 'YOUR_SUPABASE_ANON_KEY'; // IMPORTANT: User must replace this

// Check for prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', function() {
    // Throttle function
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Features Showcase Scroll Animation
    const featuresShowcase = document.getElementById('features-showcase');

    if (featuresShowcase) {
        const pinTarget = featuresShowcase.querySelector('.showcase-pin-target');
        const stickyContent = featuresShowcase.querySelector('.showcase-sticky-content');
        const slides = Array.from(stickyContent.querySelectorAll('.feature-slide'));
        const numSlides = slides.length;

        const setupFeaturesShowcase = () => {
            const isStatic = window.innerWidth <= 768 || prefersReducedMotion;
            if (isStatic) {
                if (numSlides > 0) {
                    slides.forEach(slide => {
                        slide.classList.add('active-slide-mobile-static');
                        slide.classList.remove('active-slide');
                    });
                }
                if (stickyContent) stickyContent.style.position = 'static'; // Changed from ''
                if (pinTarget) pinTarget.style.height = 'auto'; // Changed from ''
            } else {
                if (numSlides > 0) {
                    slides.forEach(slide => {
                        slide.classList.remove('active-slide-mobile-static');
                    });
                    if (!stickyContent.querySelector('.feature-slide.active-slide')) {
                        slides[0].classList.add('active-slide');
                    }
                }
                 if (stickyContent) stickyContent.style.position = ''; // Revert to CSS 'sticky'
                 if (pinTarget) pinTarget.style.height = ''; // Revert to CSS '300vh'
            }
        };

        const handleFeaturesScroll = () => {
            if (!pinTarget || !stickyContent || numSlides === 0) return;

            if (window.innerWidth <= 768 || prefersReducedMotion) {
                slides.forEach(slide => {
                    if (!slide.classList.contains('active-slide-mobile-static')) {
                        slide.classList.add('active-slide-mobile-static');
                    }
                    slide.classList.remove('active-slide'); 
                });
                stickyContent.style.position = 'static';
                pinTarget.style.height = 'auto';
                return; 
            } else {
                slides.forEach(slide => {
                    slide.classList.remove('active-slide-mobile-static');
                });
                stickyContent.style.position = ''; // Revert to CSS 'sticky'
                pinTarget.style.height = ''; // Revert to CSS '300vh' or default
            }

            const pinTargetRect = pinTarget.getBoundingClientRect();
            
            if (pinTargetRect.top <= 0 && pinTargetRect.bottom >= window.innerHeight) {
                const availableScrollDistance = pinTarget.offsetHeight - window.innerHeight;
                let currentScrollWithinPinned = -pinTargetRect.top; 
                currentScrollWithinPinned = Math.max(0, Math.min(currentScrollWithinPinned, availableScrollDistance));
                
                let scrollProgress = 0;
                if (availableScrollDistance > 0) { 
                    scrollProgress = currentScrollWithinPinned / availableScrollDistance;
                }
                
                const slideIndexToShow = Math.min(Math.floor(scrollProgress * numSlides), numSlides - 1);

                slides.forEach((slide, index) => {
                    if (index === slideIndexToShow) {
                        if (!slide.classList.contains('active-slide')) {
                            slide.classList.add('active-slide');
                        }
                    } else {
                        if (slide.classList.contains('active-slide')) {
                            slide.classList.remove('active-slide');
                        }
                    }
                });

            } else if (pinTargetRect.top > 0 && slides.length > 0) {
                slides.forEach((slide, index) => {
                    if (index === 0) {
                        if (!slide.classList.contains('active-slide') && !(window.innerWidth <= 768 || prefersReducedMotion)) {
                            slide.classList.add('active-slide');
                        }
                    } else {
                        if (slide.classList.contains('active-slide')) {
                            slide.classList.remove('active-slide');
                        }
                    }
                });
            }
        };
        
        setupFeaturesShowcase(); 
        window.addEventListener('resize', throttle(setupFeaturesShowcase, 200)); 

        if (typeof throttle === 'function') {
            window.addEventListener('scroll', throttle(handleFeaturesScroll, 10)); 
            handleFeaturesScroll(); 
        } else {
            window.addEventListener('scroll', handleFeaturesScroll);
            handleFeaturesScroll(); 
        }
    }

    // Scroll Reveal Logic
                // to 1 (when stickyContent is about to become unsticky at the bottom).
                // The distance available for "internal" scrolling is pinTarget.offsetHeight - window.innerHeight.
                const availableScrollDistance = pinTarget.offsetHeight - window.innerHeight;
                let currentScrollWithinPinned = -pinTargetRect.top; // How much of pinTarget has scrolled above viewport top

                // Clamp currentScrollWithinPinned to be within [0, availableScrollDistance]
                currentScrollWithinPinned = Math.max(0, Math.min(currentScrollWithinPinned, availableScrollDistance));
                
                let scrollProgress = 0;
                if (availableScrollDistance > 0) { // Avoid division by zero if element not tall enough
                    scrollProgress = currentScrollWithinPinned / availableScrollDistance;
                }
                
                // Determine which slide should be active based on scrollProgress
                // Each slide gets an equal portion of the scroll duration.
                const slideIndexToShow = Math.min(Math.floor(scrollProgress * numSlides), numSlides - 1);

                slides.forEach((slide, index) => {
                    if (index === slideIndexToShow) {
                        if (!slide.classList.contains('active-slide')) {
                            slide.classList.add('active-slide');
                        }
                    } else {
                        if (slide.classList.contains('active-slide')) {
                            slide.classList.remove('active-slide');
                        }
                    }
                });

            } else if (pinTargetRect.top > 0 && slides.length > 0) {
                // If we've scrolled back above the pinned section, ensure only the first slide is active
                // and others are not. This handles scrolling up past the pinned section.
                slides.forEach((slide, index) => {
                    if (index === 0) {
                        if (!slide.classList.contains('active-slide')) {
                            slide.classList.add('active-slide');
                        }
                    } else {
                        if (slide.classList.contains('active-slide')) {
                            slide.classList.remove('active-slide');
                        }
                    }
                });
            }
            // If pinTargetRect.bottom < window.innerHeight, we've scrolled past the element.
            // The last active slide will remain visible, which is usually the desired behavior.
        };

        // Use the existing throttle function
        if (typeof throttle === 'function') {
            window.addEventListener('scroll', throttle(handleFeaturesScroll, 10)); // Throttle with 10ms
            handleFeaturesScroll(); // Initial call
        } else {
            window.addEventListener('scroll', handleFeaturesScroll);
            handleFeaturesScroll(); // Initial call
        }
    }

    // Scroll Reveal Logic
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) {
                el.classList.add('active');
            }
        });
    };
    revealOnScroll(); // Initial check
    window.addEventListener('scroll', throttle(revealOnScroll, 100)); // Throttled

    // Hero Carousel Logic
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.classList.add('js-active');
    }
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
        });
        if (index >= 0 && index < slides.length) {
            slides[index].classList.add('active');
            currentSlide = index;
        }
    }

    function nextSlide() {
        let newSlide = currentSlide + 1;
        if (newSlide >= slides.length) {
            newSlide = 0;
        }
        showSlide(newSlide);
    }

    function prevSlide() {
        let newSlide = currentSlide - 1;
        if (newSlide < 0) {
            newSlide = slides.length - 1;
        }
        showSlide(newSlide);
    }

    if (prevButton && nextButton && slides.length > 0) {
        prevButton.addEventListener('click', prevSlide);
        nextButton.addEventListener('click', nextSlide);
        showSlide(0); 
    } else {
        if(prevButton) prevButton.style.display = 'none';
        if(nextButton) nextButton.style.display = 'none';
        if(slides.length > 0 && !slides[0].classList.contains('active')) {
            slides[0].classList.add('active');
        }
    }

    // Sticky Text Scroll Interaction for Portfolio Page
    const stickyFeature = document.getElementById('sticky-scroll-feature');
    if (stickyFeature) {
        const stickyHeadline = document.getElementById('sticky-narrative-headline');
        const stickyParagraph = document.getElementById('sticky-narrative-paragraph');
        const imageItems = document.querySelectorAll('.scrolling-images-panel .image-item');
        const initialHeadline = stickyHeadline ? stickyHeadline.textContent : "";
        const initialParagraph = stickyParagraph ? stickyParagraph.textContent : "";

        const handleStickyScroll = () => {
            if (!stickyHeadline || !stickyParagraph) return;
            const thresholdY = window.innerHeight / 3; 
            let activeImageFound = false;

            imageItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.top < thresholdY && rect.bottom > thresholdY) {
                    stickyHeadline.textContent = item.dataset.narrativeHeadline;
                    stickyParagraph.textContent = item.dataset.narrativeParagraph;
                    item.classList.add('active-image-highlight'); 
                    activeImageFound = true;
                } else {
                    item.classList.remove('active-image-highlight'); 
                }
            });

            if (!activeImageFound) {
                const containerRect = stickyFeature.getBoundingClientRect();
                if (containerRect.top >= 0 && (stickyHeadline.textContent !== initialHeadline || stickyParagraph.textContent !== initialParagraph)) { 
                    stickyHeadline.textContent = initialHeadline;
                    stickyParagraph.textContent = initialParagraph;
                }
            }
        };
        window.addEventListener('scroll', throttle(handleStickyScroll, 50)); 
        handleStickyScroll(); // Initial check
    }

    // New Intersection Observer for Project Grid
    const projectGridContainer = document.querySelector('.project-grid-container');

    if (projectGridContainer) {
        const projectItems = projectGridContainer.querySelectorAll('.project-item');
        const animationDelayStart = 0.1; // seconds
        const animationDelayIncrement = 0.2; // seconds

        const observerOptions = {
            root: null, // relative to document viewport
            rootMargin: '0px',
            threshold: 0.2 // Trigger when 20% of the container is visible
        };

        const gridObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    projectItems.forEach((item, index) => {
                        // Calculate delay for each item
                        const delay = animationDelayStart + (index * animationDelayIncrement);
                        item.style.animationDelay = `${delay}s`;
                        item.classList.add('animate-in');
                    });
                    observer.unobserve(entry.target); // Stop observing once triggered
                }
            });
        }, observerOptions);

        gridObserver.observe(projectGridContainer);
    }

    // Sequential Text Reveal for specific sections
    const sectionsToRevealTextIn = document.querySelectorAll('#mission, #values'); // Add other section selectors if needed

    if (sectionsToRevealTextIn.length > 0) {
        const textRevealDelayStart = 0.1; // seconds, initial delay for the first item in a section
        const textRevealDelayIncrement = 0.25; // seconds, delay between items in a section

        const textObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.25 // Trigger when 25% of the section is visible
        };

        const handleTextReveal = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const itemsToReveal = entry.target.querySelectorAll('.text-reveal-item');
                    itemsToReveal.forEach((item, index) => {
                        const delay = textRevealDelayStart + (index * textRevealDelayIncrement);
                        item.style.transitionDelay = `${delay}s`;
                        item.classList.add('active');
                    });
                    observer.unobserve(entry.target); // Stop observing this section once done
                }
            });
        };

        const textRevealObserver = new IntersectionObserver(handleTextReveal, textObserverOptions);

        sectionsToRevealTextIn.forEach(section => {
            // Before observing, ensure items are not already 'active' (e.g. from a quick scroll back/forth)
            // This is less critical with unobserve, but good if items could be reset.
            // For now, the CSS sets initial state, and JS adds 'active' once.
            const items = section.querySelectorAll('.text-reveal-item');
            if (items.length > 0 && !items[0].classList.contains('active')) { // Check if first item needs animating
                 textRevealObserver.observe(section);
            } else if (items.length > 0 && items[0].classList.contains('active')) {
                // If already active (e.g. from a previous scroll), ensure all are visible
                // This handles cases where user scrolls up and then down again quickly
                // and unobserve might not have re-fired or items were partially revealed.
                // However, with unobserve, this might not be strictly necessary.
                // For simplicity, if already active, assume all are fine.
            }
        });
    }

    // Parallax for elements with .parallax-hero class
    const parallaxHeroes = document.querySelectorAll('.parallax-hero');
    
    const baseFarBgSpeed = 0.15; // Renamed for clarity
    const baseMidBgSpeed = 0.35;
    const baseContentSpeed = 0.05;

    if (parallaxHeroes.length > 0) {
        const handleGlobalHeroParallax = () => {
            const scrollY = window.pageYOffset;
            const viewportHeight = window.innerHeight;

            let currentFarBgSpeed, currentMidBgSpeed, currentContentSpeed;

            if (prefersReducedMotion) {
                currentFarBgSpeed = 0;
                currentMidBgSpeed = 0;
                currentContentSpeed = 0;
            } else if (window.innerWidth <= 768) {
                currentFarBgSpeed = 0.05;
                currentMidBgSpeed = 0.1;
                currentContentSpeed = 0.01;
            } else {
                currentFarBgSpeed = baseFarBgSpeed;
                currentMidBgSpeed = baseMidBgSpeed;
                currentContentSpeed = baseContentSpeed;
            }

            parallaxHeroes.forEach(heroSection => {
                const parallaxFarBg = heroSection.querySelector('.parallax-bg-far');
                const parallaxMidBg = heroSection.querySelector('.parallax-bg-mid');
                const parallaxContent = heroSection.querySelector('.parallax-content-foreground');

                const heroRect = heroSection.getBoundingClientRect();
                const heroTop = heroRect.top;
                const heroHeight = heroRect.height;

                if (heroTop < viewportHeight && heroTop + heroHeight > 0) {
                    if (parallaxFarBg) {
                        parallaxFarBg.style.transform = `translateY(${scrollY * currentFarBgSpeed}px)`;
                    }
                    if (parallaxMidBg) {
                        parallaxMidBg.style.transform = `translateY(${scrollY * currentMidBgSpeed}px)`;
                    }
                    if (parallaxContent) {
                        if (heroSection.id === 'hero') { 
                            parallaxContent.style.transform = `translateY(0px)`; 
                        } else {
                            parallaxContent.style.transform = `translateY(${scrollY * currentContentSpeed}px)`;
                        }
                    }
                }
            });
        };

        if (typeof throttle === 'function') {
            window.addEventListener('scroll', throttle(handleGlobalHeroParallax, 10));
            handleGlobalHeroParallax(); // Initial call
        } else {
            window.addEventListener('scroll', handleGlobalHeroParallax);
            handleGlobalHeroParallax(); // Initial call
        }
    }

    // Contact Form Handling
    const contactForm = document.getElementById('main-contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', async function(event) { // Make function async
            event.preventDefault();

            formFeedback.textContent = '';
            formFeedback.className = '';
            formFeedback.style.display = 'none';

            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const subject = document.getElementById('contact-subject').value.trim();
            const message = document.getElementById('contact-message').value.trim();

            let errors = [];
            if (name === '') errors.push('Full Name is required.');
            if (email === '') {
                errors.push('Email Address is required.');
            } else {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email)) {
                    errors.push('Please enter a valid Email Address.');
                }
            }
            if (subject === '') errors.push('Subject is required.');
            if (message === '') errors.push('Message is required.');

            if (errors.length > 0) {
                formFeedback.textContent = errors.join(' ');
                formFeedback.classList.add('error');
                formFeedback.style.display = 'block';
                return;
            }

            const formData = {
                name: name,
                email: email,
                subject: subject,
                message: message,
                submitted_at: new Date().toISOString()
            };

            // Check if placeholder values have been replaced
            if (SUPABASE_URL_PLACEHOLDER === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY_PLACEHOLDER === 'YOUR_SUPABASE_ANON_KEY') {
                console.error('Supabase URL or Anon Key not configured in script.js!');
                formFeedback.textContent = 'Form submission is not configured. Please contact support. (Admin: Check Supabase credentials)';
                formFeedback.classList.add('error');
                formFeedback.style.display = 'block';
                return;
            }
            
            // Disable button during submission
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                const response = await fetch(`${SUPABASE_URL_PLACEHOLDER}/rest/v1/contact_messages`, { // Assuming table name is 'contact_messages'
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY_PLACEHOLDER,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY_PLACEHOLDER}`, // Supabase often uses Bearer token for anon key as well for REST
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal' // Or 'return=representation' if you want the created object back
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) { // Typically 201 Created for a successful POST
                    formFeedback.textContent = 'Message sent successfully! Thank you.';
                    formFeedback.classList.add('success');
                    formFeedback.style.display = 'block';
                    contactForm.reset();
                } else {
                    // Try to get error message from Supabase response if possible
                    const errorData = await response.json().catch(() => null); // Catch if response isn't valid JSON
                    let errorMessage = `Error sending message. Status: ${response.status}`;
                    if (errorData && errorData.message) {
                        errorMessage += `: ${errorData.message}`;
                    } else if (response.statusText) {
                        errorMessage += ` - ${response.statusText}`;
                    }
                    console.error('Supabase error:', errorData);
                    formFeedback.textContent = errorMessage;
                    formFeedback.classList.add('error');
                    formFeedback.style.display = 'block';
                }
            } catch (error) {
                console.error('Network or submission error:', error);
                formFeedback.textContent = 'Could not send message due to a network error. Please try again.';
                formFeedback.classList.add('error');
                formFeedback.style.display = 'block';
            } finally {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }
        });
    }

    // Dynamic Year for Footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
