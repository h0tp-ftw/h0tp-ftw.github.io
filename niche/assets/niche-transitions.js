document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const tile = e.target.closest('.niche-tile');
        if (tile) {
            e.preventDefault();
            const href = tile.href;

            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    window.location.href = href;
                });
            } else {
                window.location.href = href;
            }
        }
    });
});
