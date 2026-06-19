// ============================================
// CONFIGURATION
// ============================================

const GITHUB_USERNAME = 'h0tp-ftw';
const FEATURED_PROJECTS_COUNT = 6;
const PORTFOLIO_CSV_URL = 'assets/portfolio-returns.csv';

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
        <div class="state-icon" aria-hidden="true">${icon}</div>
        <p class="state-title">${title}</p>
        ${detail ? `<p class="state-detail">${detail}</p>` : ''}
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

// Site data/config (ROTATING_WORDS, PROJECT_LOGOS, LANGUAGE_ICONS) lives in assets/site-config.js

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

function getProjectImpactHtml(repoName) {
    // PROJECT_IMPACTS lives in assets/site-config.js (loaded before this file).
    const impacts = (typeof PROJECT_IMPACTS !== 'undefined') ? PROJECT_IMPACTS : {};
    const impactText = impacts[repoName.toLowerCase()] || '';
    return impactText ? `<p class="project-impact">${impactText}</p>` : '';
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

function initScrollAnimations() {
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced parallax with multiple layers
// PARALLAX DISABLED FOR PERFORMANCE
// Parallax effects removed to eliminate lag

// ============================================
// THEME TOGGLE
// ============================================

const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'frappe';
html.setAttribute('data-theme', savedTheme);

function updateTogglePosition() {
    const currentTheme = html.getAttribute('data-theme');
    const slider = document.querySelector('.theme-slider');
    if (slider) {
        slider.classList.toggle('light-mode', currentTheme === 'latte');
    }
}

updateTogglePosition();

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'frappe' ? 'latte' : 'frappe';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateTogglePosition();

    // Update chart if exists
    if (window.portfolioChart) {
        updateChartTheme();
    }
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
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

function updateActiveNav() {
    const sections = ['hero', 'my-setup', 'featured-projects', 'surprise-section', 'portfolio-performance', 'niche-projects', 'cool-people'];

    const scrollPosition = window.scrollY + 100;

    for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (!section) continue;

        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            navItems.forEach(item => {
                if (item.dataset.section === sectionId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
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

setTimeout(typeText, 1000);

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

function getProjectLogo(repoName) {
    const lowerName = repoName.toLowerCase();

    for (const [key, logoUrl] of Object.entries(PROJECT_LOGOS)) {
        if (lowerName.includes(key)) {
            return logoUrl;
        }
    }

    return null;
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
    if (!fullName.includes('/')) return `<span>${fullName}</span>`;
    const [owner, name] = fullName.split('/');
    return `
        <span class="repo-owner">${owner}/</span>
        <span class="repo-title">${name}</span>
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
        const filteredRepos = myRepos.filter(repo => {
            if (repo.full_name === 'h0tp-ftw/h0tp-ftw') return false;
            if (repo.fork && !showcaseForks.includes((repo.name || '').toLowerCase())) return false;
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
                const customLogo = getProjectLogo(repo.name);

                // CREATE FULLY CLICKABLE CARD
                const card = document.createElement('a');
                card.href = repo.html_url;
                card.target = '_blank';
                card.rel = 'noopener';
                card.className = 'project-card clickable-card';
                // Stagger animations based on index in this batch
                card.dataset.stagger = (i % 6) * 80;

                // Unified card template: owner avatar top-left + content below
                const ownerLogin = repo.owner ? repo.owner.login : repo.full_name.split('/')[0];
                const ownerAvatar = `https://github.com/${ownerLogin}.png?size=64`;
                const iconClass = getLanguageIcon(language);

                card.innerHTML = `
                    <div class="project-top">
                        <div class="project-top-left">
                            <img src="${ownerAvatar}" alt="${ownerLogin}" class="project-owner-avatar" loading="lazy" />
                            <h3 class="project-name">
                                ${renderRepoName(repo.full_name)}
                            </h3>
                        </div>
                        <div class="project-stats">
                            <span class="stat">⭐ ${stars}</span>
                            <span class="stat">🍴 ${repo.forks_count}</span>
                            <span class="stat"><i class="stat-lang-icon ${iconClass}"></i>${language}</span>
                        </div>
                    </div>
                    <div class="project-info">
                        <p class="project-description">${description}</p>
                        ${getProjectImpactHtml(repo.name)}
                    </div>
                `;

                container.appendChild(card);
                observer.observe(card);
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
// PORTFOLIO CHART WITH TOGGLE - 3 COLUMN CSV!
// ============================================

let portfolioChart = null;
let portfolioData = null;
let currentView = 'cumulative';

async function loadPortfolioDataFromCSV() {
    try {
        const csvUrl = PORTFOLIO_CSV_URL;

        console.log('📊 Loading CSV:', csvUrl);

        const response = await fetch(csvUrl);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const csvText = await response.text();
        console.log('✓ CSV loaded:', csvText.length, 'characters');

        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        console.log('✓ Lines:', lines.length);

        const dataLines = lines.slice(1);

        const months = [];
        const cumulativeReturns = [];
        const periodReturns = [];

        dataLines.forEach(line => {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length < 3) return;

            const month = parts[0];
            const returnVal = parseFloat(parts[1]);
            const periodVal = parseFloat(parts[2]);

            let formattedMonth = month;
            if (month.includes('-')) {
                const [monthName, year] = month.split('-');
                const fullYear = year.length === 2 ? '20' + year : year;
                formattedMonth = `${monthName} ${fullYear}`;
            }

            months.push(formattedMonth);
            cumulativeReturns.push(returnVal);
            periodReturns.push(periodVal);
        });

        console.log(`✅ Loaded ${months.length} months: ${months[0]} to ${months[months.length - 1]}`);

        return {
            months: months,
            cumulative: cumulativeReturns,
            period: periodReturns
        };

    } catch (error) {
        console.error('❌ Error loading CSV:', error);
        return {
            months: ["Oct 2024", "Nov 2024", "Dec 2024"],
            cumulative: [0.0, 0.8, 2.3],
            period: [0.0, 0.8, 1.5]
        };
    }
}

async function createPortfolioChart() {
    const canvas = document.getElementById('portfolio-chart');

    if (!canvas) {
        console.log('Portfolio chart canvas not found');
        return;
    }

    try {
        portfolioData = await loadPortfolioDataFromCSV();

        if (!portfolioData || portfolioData.months.length === 0) {
            renderState(canvas.parentElement, { icon: '📈', title: 'No portfolio data yet', detail: 'Performance data will appear here.' });
            return;
        }

        renderChart('cumulative');
        setupToggleButton();

        console.log('✅ Portfolio chart initialized');

    } catch (error) {
        console.error('Error creating portfolio chart:', error);
        renderState(canvas.parentElement, {
            icon: '⚠️',
            title: "Couldn't load the chart",
            detail: 'Please refresh the page to try again.'
        });
    }
}

function renderChart(viewType) {
    const canvas = document.getElementById('portfolio-chart');
    const theme = getChartTheme();

    if (portfolioChart) {
        portfolioChart.destroy();
    }

    const data = viewType === 'cumulative' ? portfolioData.cumulative : portfolioData.period;
    const label = viewType === 'cumulative' ? 'Cumulative TWR (%)' : 'Period Return (%)';

    const ctx = canvas.getContext('2d');

    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: portfolioData.months,
            datasets: [{
                label: label,
                data: data,
                borderColor: '#ca9ee6',
                backgroundColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea, scales } = chart;
                    if (!chartArea) return null;

                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

                    // If scales are not ready yet, return a default or wait
                    if (!scales || !scales.y) {
                        return 'rgba(202, 158, 230, 0.2)'; // fallback
                    }

                    const yAxis = scales.y;
                    // getPixelForValue returns the pixel location for a value
                    const zeroPixel = yAxis.getPixelForValue(0);
                    const top = chartArea.top;
                    const bottom = chartArea.bottom;
                    const height = bottom - top;

                    // Calculate ratio where 0 is located from 0..1 (top..bottom)
                    let zeroRatio = (zeroPixel - top) / height;

                    // Clamp ratio to [0, 1]
                    zeroRatio = Math.max(0, Math.min(1, zeroRatio));

                    // Green for above 0 (#a6d189)
                    gradient.addColorStop(0, 'rgba(166, 209, 137, 0.5)');
                    gradient.addColorStop(zeroRatio, 'rgba(166, 209, 137, 0.05)');

                    // Red for below 0 (#e78284)
                    gradient.addColorStop(zeroRatio, 'rgba(231, 130, 132, 0.05)');
                    gradient.addColorStop(1, 'rgba(231, 130, 132, 0.5)');

                    return gradient;
                },
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#ca9ee6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#f4b8e4',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: theme.textColor,
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: theme.tooltipBg,
                    titleColor: theme.textColor,
                    bodyColor: theme.textColor,
                    borderColor: theme.tooltipBorder,
                    borderWidth: 2,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            const prefix = viewType === 'cumulative' ? 'TWR' : 'Period';
                            return `${prefix}: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: theme.gridColor,
                        lineWidth: 1
                    },
                    ticks: {
                        color: theme.textColor,
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: viewType === 'cumulative',
                    grid: {
                        color: theme.gridColor,
                        lineWidth: 1
                    },
                    ticks: {
                        color: theme.textColor,
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });

    updateStatsDisplay(viewType);
    updateToggleButton(viewType);

    window.portfolioChart = portfolioChart;
}

function getChartTheme() {
    const theme = html.getAttribute('data-theme');
    const isDark = theme === 'frappe';

    return {
        textColor: isDark ? '#c6d0f5' : '#4c4f69',
        gridColor: isDark ? '#414559' : '#dce0e8',
        tooltipBg: isDark ? '#303446' : '#eff1f5',
        tooltipBorder: isDark ? '#ca9ee6' : '#8839ef'
    };
}

function updateStatsDisplay(viewType) {
    const statsContainer = document.getElementById('chart-stats-display');
    if (!statsContainer) return;

    const data = viewType === 'cumulative' ? portfolioData.cumulative : portfolioData.period;
    const currentValue = data[data.length - 1];

    if (viewType === 'cumulative') {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Current Return</span>
                <span class="stat-value">${currentValue.toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Time Period</span>
                <span class="stat-value">${portfolioData.months[0]} - ${portfolioData.months[portfolioData.months.length - 1]}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Months Tracked</span>
                <span class="stat-value">${portfolioData.months.length}</span>
            </div>
        `;
    } else {
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const avgValue = data.reduce((a, b) => a + b, 0) / data.length;

        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Best Month</span>
                <span class="stat-value">+${maxValue.toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Worst Month</span>
                <span class="stat-value">${minValue.toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Avg Month</span>
                <span class="stat-value">${avgValue.toFixed(2)}%</span>
            </div>
        `;
    }
}

function setupToggleButton() {
    const toggleBtn = document.getElementById('chart-toggle-btn');
    if (!toggleBtn) {
        console.warn('⚠️ Toggle button not found!');
        return;
    }

    console.log('✓ Setting up toggle button');

    toggleBtn.addEventListener('click', () => {
        currentView = currentView === 'cumulative' ? 'period' : 'cumulative';
        console.log(`🔄 Toggled to: ${currentView}`);
        renderChart(currentView);
    });
}

function updateToggleButton(viewType) {
    const toggleBtn = document.getElementById('chart-toggle-btn');
    if (!toggleBtn) return;

    if (viewType === 'cumulative') {
        toggleBtn.innerHTML = `
            <svg class="btn-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4 10h2v4h-2v-4zm4-6h2v10h-2V11zm4-4h2v14h-2V7z"/>
            </svg>
            <span>Show Period Returns</span>
        `;
    } else {
        toggleBtn.innerHTML = `
            <svg class="btn-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            <span>Show Cumulative TWR</span>
        `;
    }
}

function updateChartTheme() {
    if (!portfolioChart || !portfolioData) return;
    renderChart(currentView);
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
    const shuffled = [...starredProjects].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, starredProjects.length));
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
                    <img src="${ownerAvatar}" alt="${ownerLogin}" class="project-owner-avatar" loading="lazy" />
                    <h3 class="project-name">
                        ${renderRepoName(repo.full_name)}
                    </h3>
                </div>
                <div class="project-stats">
                    <span class="stat">⭐ ${stars}</span>
                    <span class="stat"><i class="stat-lang-icon ${iconClass}"></i>${language}</span>
                </div>
            </div>
            <div class="project-info">
                <p class="project-description">${description}</p>
                ${getProjectImpactHtml(repo.name)}
            </div>
        `;

        surpriseCardsGrid.appendChild(card);
        observer.observe(card);
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
let displayedStars = 0;
const STARS_PER_PAGE = 12;

async function loadAllStars() {
    allStars = await fetchAllStarredRepos();

    const container = document.getElementById('stars-grid');
    if (allStars.length === 0) {
        renderState(container, { icon: '⭐', title: 'No starred repos to show', detail: 'They may still be loading — check back shortly.' });
        return;
    }

    const languages = [...new Set(allStars.map(r => r.language).filter(Boolean))].sort();
    const languageFilter = document.getElementById('language-filter');
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageFilter.appendChild(option);
    });

    container.innerHTML = '';
    displayMoreStars();
}

function displayMoreStars(filtered = allStars) {
    const container = document.getElementById('stars-grid');
    const loadMoreBtn = document.getElementById('load-more');

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
                    <img src="${ownerAvatar}" alt="${ownerLogin}" class="project-owner-avatar" loading="lazy" />
                    <h3 class="project-name">
                        ${renderRepoName(repo.full_name)}
                    </h3>
                </div>
                <div class="project-stats">
                    <span class="stat">⭐ ${stars}</span>
                    <span class="stat"><i class="stat-lang-icon ${iconClass}"></i>${language}</span>
                </div>
            </div>
            <div class="project-info">
                <p class="project-description">${description}</p>
                ${getProjectImpactHtml(repo.name)}
            </div>
        `;

        container.appendChild(card);
        observer.observe(card);
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

    const filtered = allStars.filter(repo => {
        const matchesSearch = !searchTerm ||
            repo.name.toLowerCase().includes(searchTerm) ||
            repo.full_name.toLowerCase().includes(searchTerm) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm));

        const matchesLang = !selectedLang || repo.language === selectedLang;

        return matchesSearch && matchesLang;
    });

    displayedStars = 0;
    document.getElementById('stars-grid').innerHTML = '';
    displayMoreStars(filtered);
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
                    <img src="${user.avatar_url}" alt="${user.login}" loading="lazy" />
                </div>
                <div class="person-name">${user.login}</div>
                <div class="person-bio"></div>
            `;
            // Set bio via textContent so profile data can't inject markup.
            card.querySelector('.person-bio').textContent = user.bio || user.name || user.login;

            container.appendChild(card);
            observer.observe(card);
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
            createPortfolioChart(),
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
// NICHE PROJECTS TOGGLE
// ============================================

const showAllNicheBtn = document.getElementById('show-all-niche-btn');
const nicheGrid = document.getElementById('niche-grid');
let nicheExpanded = false;

if (showAllNicheBtn) {
    showAllNicheBtn.addEventListener('click', () => {
        nicheExpanded = !nicheExpanded;

        const hiddenTiles = nicheGrid.querySelectorAll('.hidden-niche-tile');

        if (nicheExpanded) {
            hiddenTiles.forEach(tile => {
                tile.classList.remove('hidden-niche-tile');
                tile.classList.add('visible-niche-tile');
            });
            showAllNicheBtn.querySelector('span').textContent = 'Show Less Projects';
            showAllNicheBtn.classList.add('expanded');
        } else {
            hiddenTiles.forEach(tile => {
                tile.classList.add('hidden-niche-tile');
                tile.classList.remove('visible-niche-tile');
            });
            showAllNicheBtn.querySelector('span').textContent = 'Show More Projects';
            showAllNicheBtn.classList.remove('expanded');
        }
    });
}

// ============================================
// COOL VISUAL EFFECTS (TILT & PARTICLE TRAIL)
// ============================================

// The VanillaTilt class lives in assets/vanilla-tilt.js (loaded before this file).

// Initialize tilt effects — skip on touch devices for performance
function initCoolFeatures() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

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

