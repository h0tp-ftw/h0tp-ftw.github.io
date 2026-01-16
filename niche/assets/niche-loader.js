async function loadNicheProjects() {
    const nicheGrid = document.getElementById('niche-grid');
    if (!nicheGrid) {
        console.error('The element with id "niche-grid" was not found.');
        return;
    }

    try {
        const response = await fetch('niche/projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { projects } = await response.json();

        if (!projects || !Array.isArray(projects)) {
            throw new Error('Invalid projects data format.');
        }

        projects.sort((a, b) => a.order - b.order);

        const initialLimit = 3;
        const initialProjects = projects.slice(0, initialLimit);
        const remainingProjects = projects.slice(initialLimit);

        // Add event delegation for tile clicks
        // Remove any existing listeners first if re-running (simplistic check)
        if (!nicheGrid.hasAttribute('data-listeners-attached')) {
            nicheGrid.setAttribute('data-listeners-attached', 'true');
            
            const handleTileAction = (tile, forceNewTab = false) => {
                const href = tile.dataset.href;
                const target = tile.dataset.target;
                
                if (forceNewTab || target === '_blank') {
                    window.open(href, '_blank', 'noopener');
                } else {
                    window.location.href = href;
                }
            };

            nicheGrid.addEventListener('click', (e) => {
                // Allow clicks on links inside to work normally
                if (e.target.closest('a')) return;

                const tile = e.target.closest('.niche-tile');
                if (tile) {
                    handleTileAction(tile);
                }
            });

            nicheGrid.addEventListener('keydown', (e) => {
                const tile = e.target.closest('.niche-tile');
                if (!tile) return;
                
                // Allow bubbling if focused on an inner link
                if (e.target.closest('a')) return;

                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTileAction(tile);
                }
            });
        }

        const createTile = (project) => {
            const isExternal = project.file.startsWith('http');
            const href = isExternal ? project.file : `niche/${project.file}`;
            const targetAttr = isExternal ? '_blank' : '_self';
            
            return `
            <div class="niche-tile" role="link" tabindex="0" data-href="${href}" data-target="${targetAttr}">
                <div class="niche-tile-icon">${project.icon}</div>
                <div class="niche-tile-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <span class="niche-tile-tag">${project.tag}</span>
                </div>
            </div>
            `;
        };

        const tiles = initialProjects.map(createTile).join('');
        nicheGrid.innerHTML = tiles;

        if (remainingProjects.length > 0) {
            const loadMoreContainer = document.createElement('div');
            loadMoreContainer.style.width = '100%';
            loadMoreContainer.style.display = 'flex';
            loadMoreContainer.style.justifyContent = 'center';
            loadMoreContainer.style.marginTop = '2rem';
            
            loadMoreContainer.innerHTML = `
                <button id="niche-load-more" class="load-more-btn">
                    Show All Projects (${projects.length})
                </button>
            `;
            
            // Insert after the grid
            nicheGrid.parentNode.insertBefore(loadMoreContainer, nicheGrid.nextSibling);

            const btn = loadMoreContainer.querySelector('#niche-load-more');
            btn.addEventListener('click', () => {
                const newTiles = remainingProjects.map(createTile).join('');
                nicheGrid.insertAdjacentHTML('beforeend', newTiles);
                loadMoreContainer.remove();
            });
        }
    } catch (error) {
        console.error('Failed to load niche projects:', error);
        nicheGrid.innerHTML = '<p class="error">Failed to load projects. Please try again later.</p>';
    }
}
