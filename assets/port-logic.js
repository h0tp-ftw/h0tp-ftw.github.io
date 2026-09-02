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
        snapshotCache[name] = data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0) ? data : null;
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
// THEME TOGGLE (4 CATPPUCCIN FLAVORS)
// ============================================

const THEME_CYCLE = ['frappe', 'macchiato', 'mocha', 'latte'];
const THEME_NAMES = {
    'frappe': '☕ Frappé',
    'macchiato': '🥛 Macchiato',
    'mocha': '🍫 Mocha',
    'latte': '☀️ Latte'
};

const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

let savedTheme = html.getAttribute('data-theme') || 'frappe';
try {
    const storedTheme = localStorage.getItem('theme');
    if (THEME_CYCLE.includes(storedTheme)) savedTheme = storedTheme;
} catch (_) {
    // Keep the theme already applied in <head> when storage is unavailable.
}
html.setAttribute('data-theme', savedTheme);

function applyTheme(themeName) {
    if (!THEME_CYCLE.includes(themeName)) return;
    html.setAttribute('data-theme', themeName);
    try {
        localStorage.setItem('theme', themeName);
    } catch (_) {
        // Fallback for private browsing
    }
    updateTogglePosition();
}

function updateTogglePosition() {
    const currentTheme = html.getAttribute('data-theme') || 'frappe';
    const isLight = currentTheme === 'latte';
    html.style.colorScheme = isLight ? 'light' : 'dark';

    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        const val = btn.getAttribute('data-theme-val');
        const isActive = val === currentTheme;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
}

updateTogglePosition();

document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-theme-val');
        if (target) applyTheme(target);
    });
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
// LATEST MODELS DYNAMIC RESOLUTION
// ============================================

async function updateLatestModels() {
    const geminiLabel = document.getElementById('gemini-model-name');
    if (!geminiLabel) return;

    try {
        const modelsData = await loadSnapshot('models');
        if (modelsData && modelsData.gemini_flash) {
            geminiLabel.textContent = modelsData.gemini_flash;
            return;
        }
    } catch (_) {}

    try {
        const res = await fetch('https://openrouter.ai/api/v1/models');
        if (!res.ok) return;
        const json = await res.json();
        const candidates = [];
        for (const m of json.data || []) {
            const mid = (m.id || '').toLowerCase();
            if (!mid.startsWith('google/gemini') || !mid.includes('flash')) continue;
            if (['lite', 'image', 'preview', 'batch', 'thinking'].some(k => mid.includes(k))) continue;
            const match = mid.match(/gemini[ -]?(\d+(?:\.\d+)*)[ -]?flash/);
            if (match) {
                const parts = match[1].split('.').map(Number);
                const name = (m.name || '').replace(/^Google:\s*/i, '').trim();
                candidates.push({ parts, name });
            }
        }
        if (candidates.length > 0) {
            candidates.sort((a, b) => {
                for (let i = 0; i < Math.max(a.parts.length, b.parts.length); i++) {
                    const diff = (b.parts[i] || 0) - (a.parts[i] || 0);
                    if (diff !== 0) return diff;
                }
                return 0;
            });
            geminiLabel.textContent = candidates[0].name;
        }
    } catch (_) {}
}

// ============================================
// INTERACTIVE HERO TERMINAL CLI ENGINE
// ============================================

const terminalState = {
    history: [],
    historyIndex: -1,
    siteStartTime: Date.now()
};

const COMMANDS_LIST = [
    'help',
    'neofetch',
    'whoami',
    'skills',
    'projects',
    'setup',
    'stars',
    'status',
    'theme',
    'discord',
    'spotify',
    'matrix',
    'cat',
    'sudo',
    'echo',
    'date',
    'clear',
    'exit'
];

function initHeroTerminal() {
    const terminalWindow = document.getElementById('terminal-window');
    const terminalBody = document.getElementById('terminal-body');
    const cliInput = document.getElementById('terminal-cli-input');
    const dotRed = document.querySelector('.terminal-dot.red');
    const dotYellow = document.querySelector('.terminal-dot.yellow');
    const dotGreen = document.querySelector('.terminal-dot.green');

    if (!cliInput || !terminalBody) return;

    // Focus input on clicking anywhere in terminal
    if (terminalWindow) {
        terminalWindow.addEventListener('click', (e) => {
            if (window.getSelection().toString().length === 0) {
                cliInput.focus();
            }
        });
    }

    // Window controls easter eggs
    if (dotRed) {
        dotRed.addEventListener('click', (e) => {
            e.stopPropagation();
            appendTerminalHistory('exit', '<span style="color: var(--ctp-red);">Terminal closed. Type anything to restart session.</span>');
            scrollTerminalToBottom();
        });
    }
    if (dotYellow) {
        dotYellow.addEventListener('click', (e) => {
            e.stopPropagation();
            appendTerminalHistory('clear', '');
            document.getElementById('terminal-output').innerHTML = '';
            scrollTerminalToBottom();
        });
    }
    if (dotGreen) {
        dotGreen.addEventListener('click', (e) => {
            e.stopPropagation();
            executeTerminalCommand('neofetch');
            scrollTerminalToBottom();
        });
    }

    cliInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const rawCmd = cliInput.value.trim();
            if (rawCmd) {
                terminalState.history.push(rawCmd);
                terminalState.historyIndex = terminalState.history.length;
                executeTerminalCommand(rawCmd);
            } else {
                appendTerminalHistory('', '');
            }
            cliInput.value = '';
            scrollTerminalToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (terminalState.history.length > 0) {
                if (terminalState.historyIndex > 0) {
                    terminalState.historyIndex--;
                }
                cliInput.value = terminalState.history[terminalState.historyIndex] || '';
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (terminalState.history.length > 0) {
                if (terminalState.historyIndex < terminalState.history.length - 1) {
                    terminalState.historyIndex++;
                    cliInput.value = terminalState.history[terminalState.historyIndex] || '';
                } else {
                    terminalState.historyIndex = terminalState.history.length;
                    cliInput.value = '';
                }
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleTabCompletion(cliInput);
        }
    });
}

function handleTabCompletion(inputEl) {
    const currentVal = inputEl.value;
    const parts = currentVal.trimStart().split(' ');

    if (parts.length === 1) {
        const query = parts[0].toLowerCase();
        const matches = COMMANDS_LIST.filter(cmd => cmd.startsWith(query));
        if (matches.length === 1) {
            inputEl.value = matches[0] + ' ';
        } else if (matches.length > 1) {
            appendTerminalHistory(currentVal, `<div style="color: var(--ctp-subtext0); font-size: 0.84rem;">Suggestions: ${matches.join('  ')}</div>`);
            scrollTerminalToBottom();
        }
    } else if (parts.length === 2) {
        const sub = parts[0].toLowerCase();
        const arg = parts[1].toLowerCase();
        if (sub === 'cat') {
            const files = Object.keys(window.TERMINAL_FILES || {});
            const matches = files.filter(f => f.toLowerCase().startsWith(arg));
            if (matches.length === 1) {
                inputEl.value = `cat ${matches[0]}`;
            } else if (matches.length > 1) {
                appendTerminalHistory(currentVal, `<div style="color: var(--ctp-subtext0); font-size: 0.84rem;">Files: ${matches.join('  ')}</div>`);
                scrollTerminalToBottom();
            }
        } else if (sub === 'theme') {
            const themes = THEME_CYCLE;
            const matches = themes.filter(t => t.startsWith(arg));
            if (matches.length === 1) {
                inputEl.value = `theme ${matches[0]}`;
            } else if (matches.length > 1) {
                appendTerminalHistory(currentVal, `<div style="color: var(--ctp-subtext0); font-size: 0.84rem;">Themes: ${matches.join('  ')}</div>`);
                scrollTerminalToBottom();
            }
        }
    }
}

function appendTerminalHistory(command, resultHtml) {
    const output = document.getElementById('terminal-output');
    if (!output) return;

    if (command) {
        const entry = document.createElement('div');
        entry.className = 'terminal-history-entry';
        entry.innerHTML = `<span class="terminal-user">h0tp</span>@<span class="terminal-prompt">portfolio</span>:<span class="terminal-path">~</span>$ <span class="terminal-cmd-text">${escapeHtml(command)}</span>`;
        output.appendChild(entry);
    }

    if (resultHtml) {
        const result = document.createElement('div');
        result.className = 'terminal-cmd-result';
        result.innerHTML = resultHtml;
        output.appendChild(result);
    }
}

function scrollTerminalToBottom() {
    const body = document.getElementById('terminal-body');
    if (body) {
        requestAnimationFrame(() => {
            body.scrollTop = body.scrollHeight;
        });
    }
}

function executeTerminalCommand(raw) {
    const tokens = raw.trim().split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    switch (cmd) {
        case 'help': {
            const helpHtml = `
                <div style="margin-bottom: 0.4rem; color: var(--ctp-peach); font-weight: 600;">Available Commands:</div>
                <div class="terminal-help-table">
                    <div><span class="terminal-cmd-tag">neofetch</span></div><div>Display system stats & portfolio info</div>
                    <div><span class="terminal-cmd-tag">whoami</span></div><div>Display developer bio & background</div>
                    <div><span class="terminal-cmd-tag">skills</span></div><div>List technical capabilities & stack</div>
                    <div><span class="terminal-cmd-tag">projects</span></div><div>List featured open-source repositories</div>
                    <div><span class="terminal-cmd-tag">setup</span></div><div>View development environment tools</div>
                    <div><span class="terminal-cmd-tag">stars</span></div><div>Overview of starred GitHub repositories</div>
                    <div><span class="terminal-cmd-tag">theme &lt;name&gt;</span></div><div>Switch theme (frappe, macchiato, mocha, latte)</div>
                    <div><span class="terminal-cmd-tag">discord</span></div><div>Check live Discord status & activity</div>
                    <div><span class="terminal-cmd-tag">spotify</span></div><div>View currently playing track</div>
                    <div><span class="terminal-cmd-tag">matrix</span></div><div>Enter the matrix rain simulation</div>
                    <div><span class="terminal-cmd-tag">cat &lt;file&gt;</span></div><div>Read file (status.txt, skills.txt, about.md, contact.txt, setup.txt)</div>
                    <div><span class="terminal-cmd-tag">sudo &lt;cmd&gt;</span></div><div>Execute command with elevated privileges</div>
                    <div><span class="terminal-cmd-tag">date</span></div><div>Print current date and time</div>
                    <div><span class="terminal-cmd-tag">clear</span></div><div>Clear terminal output</div>
                </div>
            `;
            appendTerminalHistory(raw, helpHtml);
            break;
        }

        case 'neofetch': {
            const currentTheme = html.getAttribute('data-theme') || 'frappe';
            const uptimeMinutes = Math.floor((Date.now() - terminalState.siteStartTime) / 60000);
            const uptimeSeconds = Math.floor(((Date.now() - terminalState.siteStartTime) % 60000) / 1000);
            const uptimeStr = uptimeMinutes > 0 ? `${uptimeMinutes}m ${uptimeSeconds}s` : `${uptimeSeconds}s`;

            const colors = ['#ca9ee6', '#8caaee', '#81c8be', '#a6d189', '#e5c890', '#ef9f76', '#ea999c', '#f2d5cf'];
            const dotsHtml = colors.map(c => `<span class="neofetch-color-dot" style="background: ${c};"></span>`).join('');

            const neofetchHtml = `
                <div class="terminal-neofetch">
                    <div class="terminal-neofetch-logo">
                        <div class="nyan-anim-box" aria-label="Animated Nyan Cat">
                            <div class="nyan-frame nyan-frame-a">
<span class="nyan-star nyan-s1">★</span>  <span class="nyan-star nyan-s2">✦</span>   <span class="nyan-star nyan-s3">★</span>
<span class="nyan-r1">~-~-~-~-~</span>   <span class="nyan-cat">/\\_/\\</span>
<span class="nyan-r2">~-~-~-~-~</span>  <span class="nyan-face">( o.o)</span><span class="nyan-pop">[::•.::]</span><span class="nyan-tail">~</span>
<span class="nyan-r3">~-~-~-~-~</span>   <span class="nyan-paws">(")_(")</span>
<span class="nyan-r4">~-~-~-~-~</span>
<span class="nyan-r5">~-~-~-~-~</span>
<span class="nyan-r6">~-~-~-~-~</span>
                            </div>
                            <div class="nyan-frame nyan-frame-b">
  <span class="nyan-star nyan-s2">✦</span>   <span class="nyan-star nyan-s3">★</span>   <span class="nyan-star nyan-s1">✦</span>
<span class="nyan-r1">-_-_-_-_-</span>    <span class="nyan-cat">/\\_/\\</span>
<span class="nyan-r2">-_-_-_-_-</span>  <span class="nyan-face">( ^.^)</span><span class="nyan-pop">[::.•::]</span><span class="nyan-tail">^</span>
<span class="nyan-r3">-_-_-_-_-</span>    <span class="nyan-paws">(") (")</span>
<span class="nyan-r4">-_-_-_-_-</span>
<span class="nyan-r5">-_-_-_-_-</span>
<span class="nyan-r6">-_-_-_-_-</span>
                            </div>
                        </div>
                    </div>
                    <div class="terminal-neofetch-info">
                        <div style="font-weight: bold; color: var(--accent); margin-bottom: 0.25rem;">h0tp@portfolio</div>
                        <div><span class="neofetch-key">OS:</span> <span class="neofetch-val">Windows 11 / Ubuntu (WSL2)</span></div>
                        <div><span class="neofetch-key">Host:</span> <span class="neofetch-val">h0tp-ftw.github.io (Static zero-build)</span></div>
                        <div><span class="neofetch-key">Uptime:</span> <span class="neofetch-val">${uptimeStr}</span></div>
                        <div><span class="neofetch-key">Shell:</span> <span class="neofetch-val">zsh 5.9 / Antigravity CLI</span></div>
                        <div><span class="neofetch-key">Theme:</span> <span class="neofetch-val">Catppuccin ${escapeHtml(currentTheme)}</span></div>
                        <div><span class="neofetch-key">AI Stack:</span> <span class="neofetch-val">Antigravity, Claude Code, Codex, Gemini</span></div>
                        <div><span class="neofetch-key">Flagship:</span> <span class="neofetch-val">Ankimon (66★)</span></div>
                        <div class="neofetch-palette">${dotsHtml}</div>
                    </div>
                </div>
            `;
            appendTerminalHistory(raw, neofetchHtml);
            break;
        }

        case 'whoami':
        case 'bio': {
            const adjective = (typeof ROTATING_WORDS !== 'undefined' && ROTATING_WORDS[currentWordIndex]) ? ROTATING_WORDS[currentWordIndex] : 'passionate';
            appendTerminalHistory(raw, `
                <div style="color: var(--ctp-text);">
                    <strong>h0tp-ftw</strong> — Just another <span style="color: var(--ctp-yellow); font-weight: bold;">${escapeHtml(adjective)}</span> FOSS developer &amp; AI enthusiast.<br>
                    Focusing on autonomous agent systems, full-stack dev tools, computational biology, and cybersecurity.
                </div>
            `);
            break;
        }

        case 'skills': {
            appendTerminalHistory(raw, `
                <div style="line-height: 1.6;">
                    <div>🤖 <strong style="color: var(--ctp-mauve);">Agentic AI & ML/RL:</strong> Autonomous agents, Claude Code, Codex, Antigravity, PyTorch, Prompt Architecture</div>
                    <div>🌐 <strong style="color: var(--ctp-blue);">Full-Stack:</strong> TypeScript, JavaScript, Python, Node.js, Fastify, HTML5, CSS3/Tailwind</div>
                    <div>🧬 <strong style="color: var(--ctp-teal);">Computational Biology:</strong> Bioinformatics tools, genomic sequencing pipelines</div>
                    <div>🔒 <strong style="color: var(--ctp-red);">Cybersecurity:</strong> Security tooling, reverse engineering, defensive hardening</div>
                </div>
            `);
            break;
        }

        case 'projects': {
            const repos = myReposCache || [];
            if (repos.length > 0) {
                const listHtml = repos.slice(0, 6).map(r => `
                    <div style="margin-bottom: 0.35rem;">
                        <a href="${escapeHtml(r.html_url)}" target="_blank" rel="noopener" style="color: var(--accent); font-weight: 600; text-decoration: underline;">${escapeHtml(r.name)}</a>
                        <span style="color: var(--ctp-yellow); font-size: 0.85rem;">★ ${r.stargazers_count}</span>
                        <span style="color: var(--ctp-subtext0); font-size: 0.85rem;">(${escapeHtml(r.language || 'Code')})</span>
                        <div style="color: var(--ctp-subtext1); font-size: 0.84rem;">${escapeHtml(r.description || 'No description provided.')}</div>
                    </div>
                `).join('');
                appendTerminalHistory(raw, listHtml);
            } else {
                appendTerminalHistory(raw, `
                    <div>Featured projects: <a href="https://github.com/h0tp-ftw/ankimon" target="_blank" rel="noopener" style="color: var(--accent);">ankimon (66★)</a>, <a href="https://github.com/h0tp-ftw/anki-vscode" target="_blank" rel="noopener" style="color: var(--accent);">anki-vscode (13★)</a>, <a href="https://github.com/h0tp-ftw/anki-prettify" target="_blank" rel="noopener" style="color: var(--accent);">anki-prettify (2★)</a></div>
                `);
            }
            break;
        }

        case 'setup': {
            appendTerminalHistory(raw, `
                <div style="line-height: 1.6;">
                    <div>💻 <strong>OS:</strong> Windows 11 Pro & Ubuntu (WSL2)</div>
                    <div>⚡ <strong>Editors:</strong> Antigravity, Claude Code, Codex, VS Code</div>
                    <div>🧠 <strong>AI Engines:</strong> Claude Opus 4.6, Gemini Flash, Perplexity</div>
                </div>
            `);
            break;
        }

        case 'stars': {
            const stars = starredReposCache || [];
            const count = stars.length > 0 ? stars.length : '100+';
            appendTerminalHistory(raw, `
                <div>Starred Repositories: <strong style="color: var(--ctp-yellow);">${count} total stars</strong></div>
                <div style="color: var(--ctp-subtext0); font-size: 0.85rem; margin-top: 0.2rem;">Use the "Discover Starred Projects" section or the "Surprise Me!" button below to explore them!</div>
            `);
            break;
        }

        case 'status': {
            const liveHtml = lanyardState.data ? formatDiscordStatusHtml(lanyardState.data) : (window.TERMINAL_FILES ? window.TERMINAL_FILES['status.txt'] : '<span style="color: var(--ctp-mauve);">In Flow</span> 🫡');
            appendTerminalHistory(raw, `
                <div>Live Presence: ${liveHtml}</div>
            `);
            break;
        }

        case 'theme': {
            if (args.length === 0) {
                const curr = html.getAttribute('data-theme') || 'frappe';
                appendTerminalHistory(raw, `Current theme: <strong>${escapeHtml(curr)}</strong>. Available: <code>frappe</code>, <code>macchiato</code>, <code>mocha</code>, <code>latte</code>. Example: <code>theme mocha</code>`);
            } else {
                const target = args[0].toLowerCase();
                if (THEME_CYCLE.includes(target)) {
                    applyTheme(target);
                    appendTerminalHistory(raw, `<span style="color: var(--ctp-green);">Switched theme to <strong>Catppuccin ${escapeHtml(target)}</strong>! 🎨</span>`);
                } else {
                    appendTerminalHistory(raw, `<span style="color: var(--ctp-red);">Unknown theme '${escapeHtml(target)}'. Choose from: ${THEME_CYCLE.join(', ')}</span>`);
                }
            }
            break;
        }

        case 'discord': {
            const d = lanyardState.data;
            const liveHtml = d ? formatDiscordStatusHtml(d) : '<span style="color: var(--ctp-mauve);">In Flow</span> 🫡';
            appendTerminalHistory(raw, `
                <div>Discord: <strong>@h0tp</strong> (ID: ${escapeHtml(DISCORD_USER_ID)})</div>
                <div>Status: ${liveHtml}</div>
                <div style="font-size: 0.84rem; color: var(--ctp-subtext0); margin-top: 0.25rem;">Profile: <a href="https://discordapp.com/users/${escapeHtml(DISCORD_USER_ID)}" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: underline;">discord.com/users/${escapeHtml(DISCORD_USER_ID)}</a></div>
            `);
            break;
        }

        case 'spotify': {
            const d = lanyardState.data;
            if (d && d.listening_to_spotify && d.spotify) {
                const sp = d.spotify;
                const trackUrl = sp.track_id ? `https://open.spotify.com/track/${sp.track_id}` : 'https://spotify.com';
                appendTerminalHistory(raw, `
                    <div>🎵 <a href="${escapeHtml(trackUrl)}" target="_blank" rel="noopener" style="color: var(--ctp-green); font-weight: 600; text-decoration: underline;">${escapeHtml(sp.song)}</a> by <span style="color: var(--ctp-peach);">${escapeHtml(sp.artist)}</span></div>
                    <div style="font-size: 0.84rem; color: var(--ctp-subtext0);">Album: ${escapeHtml(sp.album)}</div>
                `);
            } else {
                appendTerminalHistory(raw, `<div>No track currently playing on Spotify.</div>`);
            }
            break;
        }

        case 'matrix': {
            appendTerminalHistory(raw, `<span style="color: var(--ctp-green);">Initializing Matrix neural stream...</span>`);
            runMatrixEffect();
            break;
        }

        case 'cat': {
            if (args.length === 0) {
                appendTerminalHistory(raw, `<span style="color: var(--ctp-red);">usage: cat &lt;filename&gt;</span>`);
            } else {
                const filename = args[0].toLowerCase();
                const files = window.TERMINAL_FILES || {};
                if (filename in files) {
                    appendTerminalHistory(raw, `<div style="white-space: normal; color: var(--ctp-text);">${files[filename]}</div>`);
                } else {
                    const available = Object.keys(files).join(', ');
                    appendTerminalHistory(raw, `<span style="color: var(--ctp-red);">cat: ${escapeHtml(filename)}: No such file. Available files: ${available}</span>`);
                }
            }
            break;
        }

        case 'sudo': {
            appendTerminalHistory(raw, `
                <div><span style="color: var(--ctp-green);">[sudo] password for guest:</span> ••••••••</div>
                <div style="margin-top: 0.25rem; color: var(--ctp-peach); font-weight: 600;">Permission Granted! 🚀 Let's build something awesome together.</div>
                <div style="color: var(--ctp-subtext0); font-size: 0.84rem;">Feel free to reach out on Discord (@h0tp) or GitHub!</div>
            `);
            break;
        }

        case 'echo': {
            appendTerminalHistory(raw, `<div>${escapeHtml(args.join(' '))}</div>`);
            break;
        }

        case 'date': {
            appendTerminalHistory(raw, `<div>${escapeHtml(new Date().toString())}</div>`);
            break;
        }

        case 'clear': {
            const output = document.getElementById('terminal-output');
            if (output) output.innerHTML = '';
            break;
        }

        case 'exit': {
            appendTerminalHistory(raw, `<div>Use <code>clear</code> to reset terminal or scroll to explore projects! 🚀</div>`);
            break;
        }

        default: {
            appendTerminalHistory(raw, `<span style="color: var(--ctp-red);">command not found: ${escapeHtml(cmd)}. Type <code>help</code> for available commands.</span>`);
            break;
        }
    }
}

function runMatrixEffect() {
    const canvas = document.getElementById('terminal-matrix-canvas');
    if (!canvas) return;

    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 600;
    canvas.height = canvas.offsetHeight || 300;

    const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    let frames = 0;
    const interval = setInterval(() => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#a6d189';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        frames++;
        if (frames > 140) {
            clearInterval(interval);
            canvas.style.display = 'none';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            appendTerminalHistory('', `<span style="color: var(--ctp-green);">[Matrix simulation complete]</span>`);
            scrollTerminalToBottom();
        }
    }, 33);
}

// ============================================
// LANYARD DISCORD PRESENCE & SPOTIFY TELEMETRY
// ============================================

let lanyardState = {
    data: null,
    ws: null,
    heartbeatTimer: null
};

function initLanyardPresence(userId = typeof DISCORD_USER_ID !== 'undefined' ? DISCORD_USER_ID : '445586026451173377') {
    if (!userId) return;

    function connectWS() {
        try {
            const ws = new WebSocket('wss://api.lanyard.rest/socket');
            lanyardState.ws = ws;

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    const { op, t, d } = message;

                    if (op === 1) {
                        const interval = d.heartbeat_interval;
                        if (lanyardState.heartbeatTimer) clearInterval(lanyardState.heartbeatTimer);
                        lanyardState.heartbeatTimer = setInterval(() => {
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ op: 3 }));
                            }
                        }, interval);

                        ws.send(JSON.stringify({
                            op: 2,
                            d: { subscribe_to_id: userId }
                        }));
                    } else if (op === 0) {
                        if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
                            lanyardState.data = d;
                            updateLanyardUI(d);
                        }
                    }
                } catch (err) {
                    console.warn('[Lanyard] Parse error:', err);
                }
            };

            ws.onerror = () => {
                fallbackLanyardREST(userId);
            };

            ws.onclose = () => {
                if (lanyardState.heartbeatTimer) clearInterval(lanyardState.heartbeatTimer);
                setTimeout(connectWS, 30000);
            };
        } catch (_) {
            fallbackLanyardREST(userId);
        }
    }

    async function fallbackLanyardREST(id) {
        try {
            const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
            if (!res.ok) return;
            const json = await res.json();
            if (json.success && json.data) {
                lanyardState.data = json.data;
                updateLanyardUI(json.data);
            }
        } catch (_) {}
    }

    connectWS();
}

function getDiscordAssetUrl(appId, assetKey) {
    if (!assetKey) return '';
    if (assetKey.startsWith('http://') || assetKey.startsWith('https://')) return assetKey;
    if (assetKey.startsWith('mp:external/')) {
        return 'https://media.discordapp.net/external/' + assetKey.substring('mp:external/'.length);
    }
    if (assetKey.startsWith('mp:')) {
        return 'https://media.discordapp.net/' + assetKey.substring('mp:'.length);
    }
    if (appId) {
        return `https://cdn.discordapp.com/app-assets/${appId}/${assetKey}.png`;
    }
    return '';
}

function getDiscordEmojiUrl(emoji) {
    if (!emoji) return null;
    if (emoji.id) {
        return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'webp'}?size=48&quality=lossless`;
    }
    return null;
}

function formatDiscordStatusHtml(data) {
    if (!data) return '<span style="color: var(--ctp-subtext0);">Offline</span>';
    const status = data.discord_status || 'offline';
    if (status === 'offline') return '<span style="color: var(--ctp-subtext0);">Offline</span>';

    const activities = data.activities || [];

    // 1. Music (Spotify)
    if (data.listening_to_spotify && data.spotify) {
        const sp = data.spotify;
        const trackUrl = sp.track_id ? `https://open.spotify.com/track/${sp.track_id}` : 'https://spotify.com';
        const eqHtml = `<span class="cli-equalizer" aria-hidden="true"><span class="cli-bar"></span><span class="cli-bar"></span><span class="cli-bar"></span><span class="cli-bar"></span></span>`;
        return `${eqHtml}🎵 <a href="${escapeHtml(trackUrl)}" target="_blank" rel="noopener" style="color: var(--ctp-green); text-decoration: underline; font-weight: 600;">${escapeHtml(sp.song || 'Music')}</a> by <span style="color: var(--ctp-peach);">${escapeHtml(sp.artist || '')}</span> <span style="color: var(--ctp-subtext0);">(Spotify)</span>`;
    }

    // 2. Music (YouTube Music / other rich media)
    const mediaAct = activities.find(a => a.type === 2 || (a.name && /music/i.test(a.name)));
    if (mediaAct) {
        const title = mediaAct.details || mediaAct.state || 'Music';
        const artist = mediaAct.state && mediaAct.details ? mediaAct.state : '';
        const targetUrl = mediaAct.details_url || mediaAct.state_url || 'https://music.youtube.com';
        const sourceName = mediaAct.name || 'YouTube Music';
        const eqHtml = `<span class="cli-equalizer" aria-hidden="true"><span class="cli-bar"></span><span class="cli-bar"></span><span class="cli-bar"></span><span class="cli-bar"></span></span>`;
        return `${eqHtml}🎵 <a href="${escapeHtml(targetUrl)}" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: underline; font-weight: 600;">${escapeHtml(title)}</a>${artist ? ` by <span style="color: var(--ctp-peach);">${escapeHtml(artist)}</span>` : ''} <span style="color: var(--ctp-subtext0);">(${escapeHtml(sourceName)})</span>`;
    }

    // 3. Streaming (Type 1)
    const streamAct = activities.find(a => a.type === 1);
    if (streamAct) {
        const streamName = escapeHtml(streamAct.name);
        const streamDetails = streamAct.details ? ` · <span style="color: var(--ctp-subtext0);">${escapeHtml(streamAct.details)}</span>` : '';
        const streamLink = streamAct.url 
            ? `<a href="${escapeHtml(streamAct.url)}" target="_blank" rel="noopener" style="color: var(--ctp-red); text-decoration: underline; font-weight: 600;">${streamName}</a>`
            : `<strong style="color: var(--ctp-red);">${streamName}</strong>`;
        const streamBadge = `<span class="cli-game-badge" aria-hidden="true"><span class="cli-stream-dot"></span></span>`;
        return `${streamBadge}🔴 Streaming ${streamLink}${streamDetails}`;
    }

    // 4. Watching (Type 3)
    const watchAct = activities.find(a => a.type === 3);
    if (watchAct) {
        const watchDetails = [watchAct.details, watchAct.state].filter(Boolean).map(escapeHtml).join(' · ');
        const detailsStr = watchDetails ? ` · <span style="color: var(--ctp-subtext0);">${watchDetails}</span>` : '';
        return `📺 Watching <strong style="color: var(--ctp-lavender);">${escapeHtml(watchAct.name)}</strong>${detailsStr}`;
    }

    // 5. Competing (Type 5)
    const compAct = activities.find(a => a.type === 5);
    if (compAct) {
        const compDetails = [compAct.details, compAct.state].filter(Boolean).map(escapeHtml).join(' · ');
        const detailsStr = compDetails ? ` · <span style="color: var(--ctp-subtext0);">${compDetails}</span>` : '';
        return `🏆 Competing in <strong style="color: var(--ctp-yellow);">${escapeHtml(compAct.name)}</strong>${detailsStr}`;
    }

    // 6. Games vs. Development / Apps (Type 0)
    const appAct = activities.find(a => a.type === 0 && a.name);
    if (appAct) {
        const name = appAct.name;
        const isDevTool = /code|studio|vim|intellij|pycharm|cursor|zed|xcode|sublime|antigravity|terminal|iterm|warp|fleet/i.test(name);
        const extraParts = [appAct.details, appAct.state].filter(Boolean).map(escapeHtml);
        const detailsStr = extraParts.length ? ` · <span style="color: var(--ctp-subtext0);">${extraParts.join(' · ')}</span>` : '';

        if (isDevTool) {
            const devBadge = `<span class="cli-game-badge" aria-hidden="true"><span class="cli-game-dot" style="background: var(--ctp-blue); box-shadow: 0 0 6px var(--ctp-blue);"></span></span>`;
            return `${devBadge}💻 <strong style="color: var(--ctp-blue);">${escapeHtml(name)}</strong>${detailsStr}`;
        } else {
            // Gaming!
            const gameBadge = `<span class="cli-game-badge" aria-hidden="true"><span class="cli-game-dot"></span></span>`;
            return `${gameBadge}🎮 Playing <strong style="color: var(--ctp-green);">${escapeHtml(name)}</strong>${detailsStr}`;
        }
    }

    // 7. Custom Status (Type 4)
    const custom = activities.find(a => a.type === 4);
    if (custom) {
        const customEmojiImgUrl = custom.emoji ? getDiscordEmojiUrl(custom.emoji) : null;
        let emojiHtml = '';
        if (customEmojiImgUrl) {
            emojiHtml = `<img src="${escapeHtml(customEmojiImgUrl)}" alt="emote" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 4px;" />`;
        } else if (custom.emoji && custom.emoji.name) {
            emojiHtml = `${escapeHtml(custom.emoji.name)} `;
        }
        const text = custom.state ? `<span style="color: var(--ctp-peach);">${escapeHtml(custom.state)}</span>` : '';
        const combined = `${emojiHtml}${text}`.trim();
        if (combined) return combined;
    }

    return 'Online 🫡';
}



function updateLanyardUI(data) {
    if (!data) return;

    const terminalLiveStatus = document.getElementById('terminal-live-status');
    const liveStatusHtml = formatDiscordStatusHtml(data);

    if (terminalLiveStatus) {
        terminalLiveStatus.innerHTML = liveStatusHtml;
    }
    if (window.TERMINAL_FILES) {
        window.TERMINAL_FILES['status.txt'] = liveStatusHtml;
    }
}

// ============================================
// INITIALIZE EVERYTHING!
// ============================================

async function init() {
    console.log('🚀 Initializing portfolio...');

    try {
        initScrollAnimations();
        initHeroTerminal();
        initLanyardPresence();
        initClawdMascot();

        await Promise.allSettled([
            loadFeaturedProjects(),
            initializeSurprise(),
            loadCoolPeople(),
            updateLatestModels()
        ]);

        console.log('✅ Site fully loaded');
    } catch (error) {
        console.error('❌ Error during initialization:', error);
    }
}

// Clawd pixel mascot dynamic animations (Idle / Jump)
function initClawdMascot() {
    const clawd = document.getElementById('clawd-mascot');
    if (!clawd) return;

    const link = clawd.closest('.clawd-mascot-link') || clawd.parentElement;
    const idleSrc = 'assets/clawd-idle.gif?v=20260902d';
    const jumpSrc = 'assets/clawd-jump.gif?v=20260902d';

    // Preload animation states into browser cache
    [idleSrc, jumpSrc].forEach(src => {
        const img = new Image();
        img.src = src;
    });

    let lastJumpTime = 0;

    window.triggerClawdJump = function(force = false) {
        const now = Date.now();
        if (!force && (clawd.dataset.jumping || (now - lastJumpTime < 2500))) return;

        lastJumpTime = now;
        clawd.dataset.jumping = 'true';
        clawd.src = jumpSrc;
        clawd.classList.add('clawd-jumping');

        setTimeout(() => {
            delete clawd.dataset.jumping;
            const isHovered = link?.matches(':hover') || clawd.matches(':hover');
            if (!isHovered) {
                clawd.classList.remove('clawd-jumping');
                clawd.src = idleSrc;
            } else {
                clawd.src = jumpSrc;
            }
        }, 850);
    };

    if (link) {
        link.addEventListener('mouseenter', () => {
            clawd.src = jumpSrc;
        });

        link.addEventListener('mouseleave', () => {
            if (!clawd.dataset.jumping) {
                clawd.classList.remove('clawd-jumping');
                clawd.src = idleSrc;
            }
        });

        link.addEventListener('click', () => {
            window.triggerClawdJump(true);
        });
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

