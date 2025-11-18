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

        const tiles = projects.map(project => `
            <a href="niche/${project.file}" class="niche-tile">
                <div class="niche-tile-icon">${project.icon}</div>
                <div class="niche-tile-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <span class="niche-tile-tag">${project.tag}</span>
                </div>
            </a>
        `).join('');

        nicheGrid.innerHTML = tiles;
    } catch (error) {
        console.error('Failed to load niche projects:', error);
        nicheGrid.innerHTML = '<p class="error">Failed to load projects. Please try again later.</p>';
    }
}
