/**
 * AMANDEEP SINGH PORTFOLIO - MAIN INTERACTION SCRIPT
 */

// ==========================================================================
// CONFIGURATION: Google Apps Script Web App URL for Contact Form Submissions
// ==========================================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxIdnCSMhl7NrOZwfA5D6AOv_q_Zbmu7Ihz0HDqGDEGYHvqbR4OQn3_jI_OCIINaEXx8g/exec';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initCounters();
    initProgressBars();
    initIntersectionAnimations();
    initContactForm();
    initHarleyFloatingPill();
});

/* ==========================================================================
   THEME TOGGLE (LIGHT / DARK MODE)
   ========================================================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const storedTheme = localStorage.getItem('portfolio-theme');
    
    // Check system preference if no stored theme
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        themeToggleBtn.innerHTML = theme === 'dark' 
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
}

/* ==========================================================================
   NAVIGATION & ACTIVE LINK HIGHLIGHTING
   ========================================================================== */
function initNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Mobile Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });
        
        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/* ==========================================================================
   ANIMATED NUMBER COUNTERS
   ========================================================================== */
function initCounters() {
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber && !statNumber.dataset.animated) {
                    statNumber.dataset.animated = 'true';
                    const target = parseInt(statNumber.getAttribute('data-target') || statNumber.textContent.replace(/\D/g, ''), 10);
                    animateValue(statNumber, 0, target, 1600);
                }
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    statCards.forEach(card => observer.observe(card));
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * (end - start) + start);
        element.textContent = current;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = end;
        }
    };
    window.requestAnimationFrame(step);
}

/* ==========================================================================
   PROFICIENCY PROGRESS BARS
   ========================================================================== */
function initProgressBars() {
    const bars = document.querySelectorAll('.proficiency-fill');
    if (bars.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = bar.getAttribute('data-width') || bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = targetWidth;
                }, 100);
                obs.unobserve(bar);
            }
        });
    }, { threshold: 0.2 });

    bars.forEach(bar => {
        const width = bar.style.width;
        if (width) {
            bar.setAttribute('data-width', width);
            bar.style.width = '0%';
        }
        observer.observe(bar);
    });
}

/* ==========================================================================
   SCROLL REVEAL / INTERSECTION OBSERVERS
   ========================================================================== */
function initIntersectionAnimations() {
    const animElements = document.querySelectorAll(
        '.featured-card, .timeline-item, .project-card-large, .skill-category-card, .award-card, .cert-card, .info-card'
    );

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(el);
    });
}

/* ==========================================================================
   CONTACT FORM VALIDATION & SUBMISSION (GOOGLE APPS SCRIPT)
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form') || document.getElementById('contactForm');
    const responseMsg = document.getElementById('response-message') || document.getElementById('formMessage');
    const submitBtn = document.getElementById('submit-btn') || (form ? form.querySelector('button[type="submit"]') : null);

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Retrieve field values
        const nameInput = form.querySelector('[name="name"]') || document.getElementById('name');
        const emailInput = form.querySelector('[name="email"]') || document.getElementById('email');
        const messageInput = form.querySelector('[name="message"]') || document.getElementById('message');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        // Validation
        if (!name || !email || !message) {
            showMessage(responseMsg, 'Please fill in all required fields (Name, Email, Message).', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage(responseMsg, 'Please enter a valid email address.', 'error');
            return;
        }

        // Check if user still has the placeholder URL
        if (!SCRIPT_URL || SCRIPT_URL === 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            showMessage(
                responseMsg, 
                '⚠️ Google Apps Script URL not configured yet. Please paste your deployed Web App URL in script.js (SCRIPT_URL).', 
                'info'
            );
            console.warn('Google Apps Script URL is not set. Please replace PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE in script.js with your deployed Web App URL.');
            return;
        }

        // Prepare button UI state
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Submitting...</span>';
        }
        showMessage(responseMsg, 'Submitting...', 'submitting');

        const formData = new FormData(form);

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        })
            .then(async (res) => {
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch (err) {
                    if (text.includes('Script function not found: doPost')) {
                        throw new Error('Google Apps Script is missing doPost(e) or needs to be re-deployed as a New Version.');
                    }
                    if (text.includes('Script function not found')) {
                        throw new Error('Google Apps Script function error. Please check your Apps Script deployment.');
                    }
                    throw new Error('Unexpected response format from Google Apps Script.');
                }
            })
            .then((data) => {
                if (data && data.result === 'success') {
                    showMessage(responseMsg, 'Thank you! Your message has been sent.', 'success');
                    form.reset();
                } else {
                    const errorDetails = data && data.message ? `: ${data.message}` : '';
                    showMessage(responseMsg, `Error submitting form${errorDetails}.`, 'error');
                }
            })
            .catch((error) => {
                showMessage(responseMsg, error.message || 'Submission failed. Please check your connection.', 'error');
                console.error('Submission Error:', error);
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
    });
}

function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = `form-message ${type}`;
    el.style.display = 'block';

    if (type !== 'submitting') {
        setTimeout(() => {
            el.style.display = 'none';
        }, 7000);
    }
}

/* ==========================================================================
   HARLEY FLOATING PILL SCROLL BUTTON (DYNAMIC SCROLL DOWN / SCROLL UP)
   ========================================================================== */
function initHarleyFloatingPill() {
    const pillWrap = document.getElementById('harleyFloatingPill');
    const pillBtn = document.getElementById('harleyScrollBtn');
    const pillLabel = document.getElementById('pillLabel');
    const pillArrowPath = document.getElementById('pillArrowPath');

    if (!pillWrap || !pillBtn || !pillLabel) return;

    let isScrollingUp = false;

    function updatePillState() {
        const scrollY = window.scrollY || window.pageYOffset;
        const windowHeight = window.innerHeight;
        const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const distanceFromBottom = docHeight - (scrollY + windowHeight);

        // Switch to "Scroll Up" ONLY when user reaches near the bottom of the page (within 200px or when footer is in view)
        const isAtBottom = distanceFromBottom <= 200;

        if (isAtBottom) {
            if (!isScrollingUp) {
                isScrollingUp = true;
                pillWrap.classList.remove('is-down');
                pillWrap.classList.add('is-up');
                pillLabel.textContent = 'Scroll Up';
                pillBtn.setAttribute('aria-label', 'Scroll to top of page');
                if (pillArrowPath) {
                    // Up chevron paths
                    pillArrowPath.setAttribute('d', 'M17 11l-5-5-5 5M17 18l-5-5-5 5');
                }
            }
        } else {
            if (isScrollingUp || !pillWrap.classList.contains('is-down')) {
                isScrollingUp = false;
                pillWrap.classList.remove('is-up');
                pillWrap.classList.add('is-down');
                pillLabel.textContent = 'Scroll Down';
                pillBtn.setAttribute('aria-label', 'Scroll down to explore page');
                if (pillArrowPath) {
                    // Down chevron paths
                    pillArrowPath.setAttribute('d', 'M7 13l5 5 5-5M7 6l5 5 5-5');
                }
            }
        }
    }

    // Smooth scroll action on click
    pillBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isScrollingUp) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            const scrollY = window.scrollY || window.pageYOffset;
            const contentEl = document.getElementById('harleyContent');
            if (scrollY < 120 && contentEl) {
                contentEl.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
            }
        }
    });

    // Throttled scroll listener
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updatePillState();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial check
    updatePillState();
}

