// ============================================
// CONFIGURATION
// ============================================

const GITHUB_USERNAME = 'h0tp-ftw';
const FEATURED_PROJECTS_COUNT = 6;
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    })[character]);
}

// Static snapshots generated daily by .github/workflows/snapshot-github-data.yml.
// Visitors read these instead of GitHub's unauthenticated API (60 req/hr/IP), so
// the data-driven sections stay fast and never break under traffic. Each function
// below falls back to the live API if its snapshot is missing or empty (e.g. before
// the first Action run on a fork).
const DATA_BASE = 'assets/data';
const snapshotCache = {};

async function loadSnapshot(name) {
    if (name in snapshotCache) return snapshotCache[name];
    try {
        const res = await fetch(`${DATA_BASE}/${name}.json`, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        snapshotCache[name] = (Array.isArray(data) && data.length) ? data : null;
    } catch (error) {
        console.warn(`[snapshot] ${name} unavailable, falling back to live API:`, error.message);
        snapshotCache[name] = null;
    }
    return snapshotCache[name];
}

// Renders a friendly empty/error panel into a container. Pass onRetry to show a
// Retry button (use for transient failures, not for genuinely-empty results).
function renderState(container, { icon = 'ℹ️', title = '', detail = '', onRetry = null } = {}) {
    if (!container) return;
    container.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'loading-state state-panel';
    panel.innerHTML = `
        <div class="state-icon" aria-hidden="true">${escapeHtml(icon)}</div>
        <p class="state-title">${escapeHtml(title)}</p>
        ${detail ? `<p class="state-detail">${escapeHtml(detail)}</p>` : ''}
    `;
    if (onRetry) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'state-retry';
        btn.textContent = 'Retry';
        btn.addEventListener('click', onRetry);
        panel.appendChild(btn);
    }
    container.appendChild(panel);
}

// Site data/config (ROTATING_WORDS, SHOWCASE_FORKS, HIDE_REPOS, LANGUAGE_ICONS) lives in assets/site-config.js

// ============================================
// SCROLL PROGRESS INDICATOR (throttled)
// ============================================

let scrollTicking = false;
function onScroll() {
    if (!scrollTicking) {
        requestAnimationFrame(() => {
            updateScrollProgress();
            updateActiveNav();
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}

function updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height);

    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        progressBar.style.transform = `scaleX(${scrolled})`;
    }
}

window.addEventListener('scroll', onScroll, { passive: true });

// ============================================
// UTILITY FUNCTIONS
// ============================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ============================================
// SCROLL REVEAL & PARALLAX
// ============================================

const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.dataset.stagger || 0;
            setTimeout(() => entry.target.classList.add('visible'), delay);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function observeAnimatedElement(element) {
    if (reducedMotionQuery.matches) {
        element.classList.add('visible');
    } else {
        observer.observe(element);
    }
}

function initScrollAnimations() {
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right')
        .forEach(observeAnimatedElement);
}

// Enhanced parallax with multiple layers
// PARALLAX DISABLED FOR PERFORMANCE
// Parallax effects removed to eliminate lag

// ============================================
// THEME TOGGLE
// ============================================

const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

let savedTheme = html.getAttribute('data-theme') || 'frappe';
try {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'latte' || storedTheme === 'frappe') savedTheme = storedTheme;
} catch (_) {
    // Keep the theme already applied in <head> when storage is unavailable.
}
html.setAttribute('data-theme', savedTheme);

function updateTogglePosition() {
    const currentTheme = html.getAttribute('data-theme');
    const isLight = currentTheme === 'latte';
    const slider = document.querySelector('.theme-slider');
    if (slider) slider.classList.toggle('light-mode', isLight);
    html.style.colorScheme = isLight ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
}

updateTogglePosition();

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'frappe' ? 'latte' : 'frappe';

    html.setAttribute('data-theme', newTheme);
    try {
        localStorage.setItem('theme', newTheme);
    } catch (_) {
        // Theme still works for this visit when storage is unavailable.
    }
    updateTogglePosition();
});

// ============================================
// FLOATING NAVIGATION WITH SMOOTH SCROLL
// ============================================

const floatingNav = document.getElementById('floating-nav');
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = item.dataset.section;
        const section = document.getElementById(sectionId);

        if (section) {
            section.scrollIntoView({
                behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    });
});

function updateActiveNav() {
    const sections = ['hero', 'my-setup', 'featured-projects', 'surprise-section', 'cool-people'];

    const scrollPosition = window.scrollY + 100;

    for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (!section) continue;

        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            navItems.forEach(item => {
                const isActive = item.dataset.section === sectionId;
                item.classList.toggle('active', isActive);
                if (isActive) {
                    item.setAttribute('aria-current', 'location');
                } else {
                    item.removeAttribute('aria-current');
                }
            });
            break;
        }
    }
}

updateActiveNav();

// ============================================
// ROTATING TEXT ANIMATION
// ============================================

let currentWordIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
const rotatingTextElement = document.getElementById('rotating-text');
const typingSpeed = 100;
const deletingSpeed = 50;
const pauseTime = 2000;

function typeText() {
    const currentWord = ROTATING_WORDS[currentWordIndex];

    if (isDeleting) {
        rotatingTextElement.textContent = currentWord.substring(0, currentCharIndex - 1);
        currentCharIndex--;

        if (currentCharIndex === 0) {
            isDeleting = false;
            currentWordIndex = (currentWordIndex + 1) % ROTATING_WORDS.length;
            setTimeout(typeText, 500);
            return;
        }
    } else {
        rotatingTextElement.textContent = currentWord.substring(0, currentCharIndex + 1);
        currentCharIndex++;

        if (currentCharIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(typeText, pauseTime);
            return;
        }
    }

    setTimeout(typeText, isDeleting ? deletingSpeed : typingSpeed);
}

if (reducedMotionQuery.matches) {
    rotatingTextElement.textContent = ROTATING_WORDS[0];
} else {
    setTimeout(typeText, 1000);
}

// ============================================
// GITHUB API
// ============================================

let myReposCache = null;
let starredReposCache = null;
let followingCache = null;

async function fetchMyRepos() {
    if (myReposCache) return myReposCache;

    const snap = await loadSnapshot('repos');
    if (snap) { myReposCache = snap; return snap; }

    try {
        const repos = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 5) {
            const response = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&page=${page}`,
                { headers: { 'Accept': 'application/vnd.github.v3+json' } }
            );

            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

            const data = await response.json();
            if (data.length === 0) {
                hasMore = false;
            } else {
                repos.push(...data);
                page++;
            }
        }

        // This endpoint only returns repos owned by the user; fork-filtering
        // happens in loadFeaturedProjects (which honors SHOWCASE_FORKS).
        myReposCache = repos;
        return repos;
    } catch (error) {
        console.error('Error fetching repos:', error);
        return [];
    }
}

let starredFirstPageCache = null;

async function fetchStarredFirstPage() {
    if (starredFirstPageCache) return starredFirstPageCache;
    if (starredReposCache) return starredReposCache;

    // The snapshot holds the full starred list, so it also satisfies "Show All Stars".
    const snap = await loadSnapshot('starred');
    if (snap) { starredReposCache = snap; starredFirstPageCache = snap; return snap; }

    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/starred?per_page=100&page=1`,
            { headers: { 'Accept': 'application/vnd.github.v3+json' } }
        );
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        starredFirstPageCache = await response.json();
        return starredFirstPageCache;
    } catch (error) {
        console.error('Error fetching starred repos:', error);
        return [];
    }
}

async function fetchAllStarredRepos() {
    if (starredReposCache) return starredReposCache;

    const snap = await loadSnapshot('starred');
    if (snap) { starredReposCache = snap; starredFirstPageCache = snap; return snap; }

    try {
        const firstPage = await fetchStarredFirstPage();
        if (firstPage.length < 100) {
            starredReposCache = firstPage;
            return starredReposCache;
        }

        const repos = [...firstPage];
        let page = 2;
        let hasMore = true;

        while (hasMore && page <= 20) {
            const response = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/starred?per_page=100&page=${page}`,
                { headers: { 'Accept': 'application/vnd.github.v3+json' } }
            );
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            const data = await response.json();
            if (data.length === 0) {
                hasMore = false;
            } else {
                repos.push(...data);
                page++;
            }
        }

        starredReposCache = repos;
        return repos;
    } catch (error) {
        console.error('Error fetching starred repos:', error);
        return starredFirstPageCache || [];
    }
}

async function fetchFollowing() {
    if (followingCache) return followingCache;

    const snap = await loadSnapshot('following');
    if (snap) { followingCache = shuffleArray(snap); return followingCache; }

    try {
        const users = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 5) {
            const response = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/following?per_page=100&page=${page}`,
                { headers: { 'Accept': 'application/vnd.github.v3+json' } }
            );

            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

            const data = await response.json();
            if (data.length === 0) {
                hasMore = false;
            } else {
                users.push(...data);
                page++;
            }
        }

        followingCache = shuffleArray(users);
        return followingCache;
    } catch (error) {
        console.error('Error fetching following:', error);
        return [];
    }
}

function getLanguageIcon(language) {
    if (!language) return LANGUAGE_ICONS['default'];
    return LANGUAGE_ICONS[language] || LANGUAGE_ICONS['default'];
}

/* 
   REMOVED: getRepoImage(repo) 
   We now use language icons instead of random placeholder images.
*/

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

function renderRepoName(fullName) {
    if (!fullName.includes('/')) return `<span>${escapeHtml(fullName)}</span>`;
    const [owner, name] = fullName.split('/');
    return `
        <span class="repo-owner">${escapeHtml(owner)}/</span>
        <span class="repo-title">${escapeHtml(name)}</span>
    `;
}
// ============================================
// LOAD FEATURED PROJECTS - FULLY CLICKABLE!
// ============================================

async function loadFeaturedProjects() {
    const container = document.getElementById('featured-projects-grid');
    const section = document.getElementById('featured-projects');

    try {
        const myRepos = await fetchMyRepos();

        if (myRepos.length === 0) {
            renderState(container, { icon: '📦', title: 'No projects to show yet', detail: 'Public repositories will appear here.' });
            return;
        }

        // Hide the profile/website repo, and hide forks unless explicitly
        // featured via SHOWCASE_FORKS (assets/site-config.js). Most forks are
        // throwaway dev/PR forks, so they're excluded by default.
        const showcaseForks = (typeof SHOWCASE_FORKS !== 'undefined' ? SHOWCASE_FORKS : [])
            .map(name => name.toLowerCase());
        const hideRepos = (typeof HIDE_REPOS !== 'undefined' ? HIDE_REPOS : [])
            .map(name => name.toLowerCase());
        const filteredRepos = myRepos.filter(repo => {
            const name = (repo.name || '').toLowerCase();
            if (repo.full_name === 'h0tp-ftw/h0tp-ftw') return false;
            if (hideRepos.includes(name)) return false;
            if (repo.fork && !showcaseForks.includes(name)) return false;
            return true;
        });

        if (filteredRepos.length === 0) {
            renderState(container, { icon: '📦', title: 'No projects to show yet', detail: 'Public repositories will appear here.' });
            return;
        }

        // Remove the loading state before rendering repo cards
        const loadingState = container.querySelector('.loading-state');
        if (loadingState) loadingState.remove();

        // Helper to render a chunk of repos
        const renderRepos = (repos, startIndex) => {
            repos.forEach((repo, i) => {
                const index = startIndex + i;
                const description = repo.description || 'No description available';
                const stars = formatNumber(repo.stargazers_count);
                const language = repo.language || 'Code'; // Better fallback
                const iconClass = getLanguageIcon(language);

                // CREATE FULLY CLICKABLE CARD
                const card = document.createElement('a');
                card.href = repo.html_url;
                card.target = '_blank';
                card.rel = 'noopener';
                card.className = 'project-card clickable-card';
                // Stagger animations based on index in this batch
                card.dataset.stagger = (i % 6) * 80;

                card.innerHTML = `
                    <div class="project-top">
                        <div class="project-top-left">
                            <h3 class="project-name">
                                ${renderRepoName(repo.full_name)}
                            </h3>
                        </div>
                        <div class="project-stats">
                            <span class="stat">⭐ ${stars}</span>
                            <span class="stat">🍴 ${repo.forks_count}</span>
                            <span class="stat"><i class="stat-lang-icon ${iconClass}"></i>${escapeHtml(language)}</span>
                        </div>
                    </div>
                    <div class="project-info">
                        <p class="project-description">${escapeHtml(description)}</p>
                    </div>
                `;

                container.appendChild(card);
                observeAnimatedElement(card);
            });
        };

        const initialLimit = 5;
        const initialRepos = filteredRepos.slice(0, initialLimit);
        const remainingRepos = filteredRepos.slice(initialLimit);

        renderRepos(initialRepos, 0);

        // If there are more repos, add a Load More button
        if (remainingRepos.length > 0) {
            // Check if button container already exists (id: projects-load-more-container)
            let existingBtnContainer = document.getElementById('projects-load-more-container');
            if (existingBtnContainer) existingBtnContainer.remove();

            const btnContainer = document.createElement('div');
            btnContainer.id = 'projects-load-more-container'; // ID for easy removal
            btnContainer.style.width = '100%';
            btnContainer.style.display = 'flex';
            btnContainer.style.justifyContent = 'center';
            btnContainer.style.marginTop = '3rem';

            // Using surprise-btn class for consistent styling with the other button
            btnContainer.innerHTML = `
                <button id="projects-load-more-btn" class="surprise-btn" style="min-width: 200px;">
                    <svg class="btn-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M7 10l5 5 5-5z"/>
                    </svg>
                    <span>Show All Projects (${filteredRepos.length})</span>
                </button>
            `;

            // Append after the grid
            container.parentNode.appendChild(btnContainer);

            // Event listener
            document.getElementById('projects-load-more-btn').addEventListener('click', function () {
                renderRepos(remainingRepos, initialLimit);
                // Animate removal
                btnContainer.style.opacity = '0';
                setTimeout(() => btnContainer.remove(), 300);
            });
        }

    } catch (error) {
        console.error('Error loading featured projects:', error);
        renderState(container, {
            icon: '⚠️',
            title: "Couldn't load projects",
            detail: 'GitHub may be rate-limited. Try again in a moment.',
            onRetry: () => { myReposCache = null; delete snapshotCache.repos; loadFeaturedProjects(); }
        });
    }
}

// ============================================
// 3 RANDOM STARRED PROJECTS
// ============================================

const surpriseBtn = document.getElementById('surprise-btn');
const surpriseCardsGrid = document.getElementById('surprise-cards-grid');
let starredProjects = [];

async function initializeSurprise() {
    starredProjects = await fetchStarredFirstPage();

    if (starredProjects.length > 0) {
        const initialProjects = getRandomProjects(6);
        display5RandomCards(initialProjects);
    }
}

surpriseBtn.addEventListener('click', () => {
    if (starredProjects.length === 0) return;

    surpriseBtn.classList.add('spinning');
    surpriseBtn.disabled = true;

    setTimeout(() => {
        surpriseBtn.classList.remove('spinning');
        surpriseBtn.disabled = false;
    }, 800);

    const randomProjects = getRandomProjects(6);
    display5RandomCards(randomProjects);
});

function getRandomProjects(count) {
    return shuffleArray(starredProjects).slice(0, Math.min(count, starredProjects.length));
}

function display5RandomCards(projects) {
    surpriseCardsGrid.innerHTML = '';

    projects.forEach((repo, index) => {
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'project-card clickable-card';
        card.dataset.stagger = index * 80;

        const description = repo.description || 'No description available';
        const stars = formatNumber(repo.stargazers_count);
        const language = repo.language || 'Unknown';
        const ownerLogin = repo.owner ? repo.owner.login : repo.full_name.split('/')[0];
        const ownerAvatar = `https://github.com/${ownerLogin}.png?size=64`;
        const iconClass = getLanguageIcon(language);

        card.innerHTML = `
            <div class="project-top">
                <div class="project-top-left">
                    <img src="${ownerAvatar}" alt="${escapeHtml(ownerLogin)}" class="project-owner-avatar" loading="lazy" />
                    <h3 class="project-name">
                        ${renderRepoName(repo.full_name)}
                    </h3>
                </div>
                <div class="project-stats">
                    <span class="stat">⭐ ${stars}</span>
                    <span class="stat"><i class="stat-lang-icon ${iconClass}"></i>${escapeHtml(language)}</span>
                </div>
            </div>
            <div class="project-info">
                <p class="project-description">${escapeHtml(description)}</p>
            </div>
        `;

        surpriseCardsGrid.appendChild(card);
        observeAnimatedElement(card);
    });
}

// ============================================
// SHOW ALL STARS TOGGLE
// ============================================

const showAllStarsBtn = document.getElementById('show-all-stars-btn');
const allStarsInline = document.getElementById('all-stars-inline');
let isStarsExpanded = false;

let allStarsLoaded = false;

showAllStarsBtn.addEventListener('click', async () => {
    isStarsExpanded = !isStarsExpanded;
    showAllStarsBtn.setAttribute('aria-expanded', String(isStarsExpanded));
    allStarsInline.setAttribute('aria-hidden', String(!isStarsExpanded));
    allStarsInline.toggleAttribute('inert', !isStarsExpanded);

    if (isStarsExpanded) {
        allStarsInline.classList.remove('collapsed');
        showAllStarsBtn.querySelector('span:nth-of-type(1)').textContent = 'Hide All Stars';

        if (!allStarsLoaded) {
            allStarsLoaded = true;
            await loadAllStars();
            const starsCountElement = document.getElementById('stars-count');
            if (starsCountElement && allStars.length > 0) {
                starsCountElement.textContent = `(${allStars.length})`;
            }
            starredProjects = allStars;
        }
    } else {
        allStarsInline.classList.add('collapsed');
        showAllStarsBtn.querySelector('span:nth-of-type(1)').textContent = 'Show All Stars';
    }
});

// ============================================
// ALL STARRED PROJECTS WITH FILTER
// ============================================

let allStars = [];
let activeStars = [];
let displayedStars = 0;
const STARS_PER_PAGE = 12;

async function loadAllStars() {
    allStars = await fetchAllStarredRepos();

    const container = document.getElementById('stars-grid');
    if (allStars.length === 0) {
        renderState(container, { icon: '⭐', title: 'No starred repos to show', detail: 'They may still be loading — check back shortly.' });
        return;
    }

    activeStars = allStars;
    const languages = [...new Set(allStars.map(r => r.language).filter(Boolean))].sort();
    const languageFilter = document.getElementById('language-filter');
    languageFilter.replaceChildren(new Option('All Languages', ''));
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageFilter.appendChild(option);
    });

    container.innerHTML = '';
    displayMoreStars();
}

function displayMoreStars(filtered = activeStars) {
    const container = document.getElementById('stars-grid');
    const loadMoreBtn = document.getElementById('load-more');

    if (filtered.length === 0) {
        renderState(container, {
            icon: '🔎',
            title: 'No matching projects',
            detail: 'Try a different search or language filter.'
        });
        loadMoreBtn.style.display = 'none';
        return;
    }

    const toDisplay = filtered.slice(displayedStars, displayedStars + STARS_PER_PAGE);

    toDisplay.forEach((repo) => {
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'project-card clickable-card';

        const description = repo.description || 'No description available';
        const stars = formatNumber(repo.stargazers_count);
        const language = repo.language || 'Unknown';
        const ownerLogin = repo.owner ? repo.owner.login : repo.full_name.split('/')[0];
        const ownerAvatar = `https://github.com/${ownerLogin}.png?size=64`;
        const iconClass = getLanguageIcon(language);

        card.innerHTML = `
            <div class="project-top">
                <div class="project-top-left">
                    <img src="${ownerAvatar}" alt="${escapeHtml(ownerLogin)}" class="project-owner-avatar" loading="lazy" />
                    <h3 class="project-name">
                        ${renderRepoName(repo.full_name)}
                    </h3>
                </div>
                <div class="project-stats">
                    <span class="stat">⭐ ${stars}</span>
                    <span class="stat"><i class="stat-lang-icon ${iconClass}"></i>${escapeHtml(language)}</span>
                </div>
            </div>
            <div class="project-info">
                <p class="project-description">${escapeHtml(description)}</p>
            </div>
        `;

        container.appendChild(card);
        observeAnimatedElement(card);
    });

    displayedStars += toDisplay.length;

    if (displayedStars >= filtered.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

const searchInput = document.getElementById('search-stars');
const languageFilter = document.getElementById('language-filter');
const loadMoreBtn = document.getElementById('load-more');

function filterStars() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedLang = languageFilter.value;

    activeStars = allStars.filter(repo => {
        const matchesSearch = !searchTerm ||
            repo.name.toLowerCase().includes(searchTerm) ||
            repo.full_name.toLowerCase().includes(searchTerm) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm));

        const matchesLang = !selectedLang || repo.language === selectedLang;

        return matchesSearch && matchesLang;
    });

    displayedStars = 0;
    document.getElementById('stars-grid').innerHTML = '';
    displayMoreStars(activeStars);
}

searchInput.addEventListener('input', filterStars);
languageFilter.addEventListener('change', filterStars);
loadMoreBtn.addEventListener('click', () => displayMoreStars());

// ============================================
// COOL PEOPLE
// ============================================

async function loadCoolPeople() {
    const container = document.getElementById('people-grid');

    try {
        const following = await fetchFollowing();

        if (following.length === 0) {
            renderState(container, { icon: '👤', title: 'Not following anyone yet' });
            return;
        }

        container.innerHTML = '';

        const peopleToShow = following.slice(0, 20);

        peopleToShow.forEach((user, index) => {
            const card = document.createElement('a');
            card.className = 'person-card';
            card.href = user.html_url;
            card.target = '_blank';
            card.rel = 'noopener';
            card.dataset.stagger = (index % 5) * 80;

            card.innerHTML = `
                <div class="person-avatar">
                    <img src="${escapeHtml(user.avatar_url)}" alt="${escapeHtml(`${user.login} avatar`)}" loading="lazy" />
                </div>
                <div class="person-name">${escapeHtml(user.login)}</div>
                <div class="person-bio"></div>
            `;
            // Set bio via textContent so profile data can't inject markup.
            card.querySelector('.person-bio').textContent = user.bio || user.name || user.login;

            container.appendChild(card);
            observeAnimatedElement(card);
        });

        // Snapshot data already carries bios; only the live-API fallback needs lookups.
        const needsBio = peopleToShow.some(u => !u.bio && !u.name);
        if (needsBio) {
            // Lazy-fetch bios once the section scrolls into view
            const section = document.getElementById('cool-people');
            const bioObserver = new IntersectionObserver(async (entries) => {
                if (!entries[0].isIntersecting) return;
                bioObserver.disconnect();

                const cards = container.querySelectorAll('.person-card');
                const batchSize = 5;
                for (let i = 0; i < peopleToShow.length; i += batchSize) {
                    const batch = peopleToShow.slice(i, i + batchSize);
                    const details = await Promise.allSettled(
                        batch.map(u =>
                            fetch(`https://api.github.com/users/${u.login}`, {
                                headers: { 'Accept': 'application/vnd.github.v3+json' }
                            }).then(r => r.ok ? r.json() : null)
                        )
                    );
                    details.forEach((result, j) => {
                        if (result.status !== 'fulfilled' || !result.value) return;
                        const userData = result.value;
                        const card = cards[i + j];
                        if (!card) return;
                        const bioEl = card.querySelector('.person-bio');
                        if (bioEl && (userData.bio || userData.name)) {
                            bioEl.textContent = userData.bio || userData.name;
                        }
                    });
                }
            }, { rootMargin: '200px' });

            if (section) bioObserver.observe(section);
        }
    } catch (error) {
        console.error('Error loading cool people:', error);
        renderState(container, {
            icon: '⚠️',
            title: "Couldn't load people",
            detail: 'GitHub may be rate-limited. Try again shortly.',
            onRetry: () => { followingCache = null; delete snapshotCache.following; loadCoolPeople(); }
        });
    }
}
// ============================================
// INITIALIZE EVERYTHING!
// ============================================

async function init() {
    console.log('🚀 Initializing portfolio...');

    try {
        initScrollAnimations();

        await Promise.allSettled([
            loadFeaturedProjects(),
            initializeSurprise(),
            loadCoolPeople()
        ]);

        console.log('✅ Site fully loaded');
    } catch (error) {
        console.error('❌ Error during initialization:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


// ============================================
// COOL VISUAL EFFECTS (TILT & PARTICLE TRAIL)
// ============================================

// The VanillaTilt class lives in assets/vanilla-tilt.js (loaded before this file).

// Initialize tilt effects — skip on touch devices for performance
function initCoolFeatures() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || reducedMotionQuery.matches) return;

    const tiltElements = document.querySelectorAll('.project-card, .profile-image');
    tiltElements.forEach(el => {
        new VanillaTilt(el, {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
            scale: 1.02
        });
    });

    const tiltObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.classList.contains('project-card')) {
                    new VanillaTilt(node, {
                        max: 5,
                        speed: 400,
                        glare: true,
                        "max-glare": 0.2,
                        scale: 1.02
                    });
                }
            });
        });
    });

    ['featured-projects-grid', 'stars-grid', 'surprise-cards-grid'].forEach(id => {
        const el = document.getElementById(id);
        if (el) tiltObserver.observe(el, { childList: true });
    });
}

initCoolFeatures();

