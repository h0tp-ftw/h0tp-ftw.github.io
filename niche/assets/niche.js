// ============================================
// NICHE PAGES - SHARED FUNCTIONALITY
// ============================================

// Theme detection and sync with main site
function syncTheme() {
    const savedTheme = localStorage.getItem('theme') || 'frappe';
    document.body.setAttribute('data-theme', savedTheme);
}

// Call on page load
syncTheme();

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll-to-top button (optional)
const scrollBtn = document.createElement('button');
scrollBtn.className = 'scroll-to-top-btn';
scrollBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 8l-6 6h12z"/>
    </svg>
`;
scrollBtn.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem;
    background: var(--niche-accent);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
    z-index: 1000;
`;

document.body.appendChild(scrollBtn);

// Show/hide scroll button
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.pointerEvents = 'auto';
    } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.pointerEvents = 'none';
    }
});

scrollBtn.addEventListener('click', scrollToTop);

// Analytics tracking (optional - add your own)
function trackPage(pageName) {
    console.log('Page view:', pageName);
    // Add your analytics code here
}

// Track current page
const currentPage = document.title;
trackPage(currentPage);
