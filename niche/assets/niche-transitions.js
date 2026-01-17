document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const tile = e.target.closest('.niche-tile');
        if (tile) {
            e.preventDefault();
            const href = tile.href || tile.dataset.href;
            const target = tile.target || tile.dataset.target;
            if (target === '_blank') return;


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
