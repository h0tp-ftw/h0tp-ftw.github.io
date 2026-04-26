(() => {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'frappe';
    html.setAttribute('data-theme', savedTheme);

    document.addEventListener('DOMContentLoaded', () => {
        // Animated background
        const bg = document.createElement('div');
        bg.className = 'guide-animated-bg';
        bg.innerHTML = '<div class="gradient-orb orb-1"></div><div class="gradient-orb orb-2"></div><div class="gradient-orb orb-3"></div>';
        document.body.prepend(bg);

        // Theme toggle
        const toggle = document.createElement('button');
        toggle.className = 'guide-theme-toggle';
        toggle.id = 'guide-theme-toggle';
        toggle.setAttribute('aria-label', 'Toggle theme');
        toggle.innerHTML = `<div class="guide-theme-slider">
            <svg class="guide-slider-icon moon-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
            <svg class="guide-slider-icon sun-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2m0 18v2M23 12h-2M3 12H1m19.071-7.071l-1.414 1.414M5.343 18.657l-1.414 1.414m15.142 0l-1.414-1.414M5.343 5.343L3.929 3.929"/>
            </svg>
        </div>`;
        document.body.prepend(toggle);

        function updateSlider() {
            const slider = toggle.querySelector('.guide-theme-slider');
            if (slider) slider.classList.toggle('light-mode', html.getAttribute('data-theme') === 'latte');
        }
        updateSlider();

        toggle.addEventListener('click', () => {
            const newTheme = html.getAttribute('data-theme') === 'frappe' ? 'latte' : 'frappe';
            html.setAttribute('data-theme', newTheme);
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateSlider();
        });

        // Back button — detect if we're on the blog index or a post
        const isIndex = /\/niche\/(index\.html)?(\?.*)?(\#.*)?$/.test(window.location.pathname);
        const backNav = document.createElement('div');
        backNav.className = 'niche-back-nav';
        if (isIndex) {
            backNav.innerHTML = `<a href="../" class="back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15 18l-6-6 6-6"/></svg>
                Back to Portfolio
            </a>`;
        } else {
            backNav.innerHTML = `<a href="./" class="back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15 18l-6-6 6-6"/></svg>
                Back to Blog
            </a>`;
        }
        document.body.prepend(backNav);

        // Footer
        const container = document.querySelector('.niche-container');
        if (container) {
            const footer = document.createElement('footer');
            footer.className = 'blog-footer';
            footer.innerHTML = `<p>Built with <span style="color:var(--ctp-red)">&hearts;</span> by h0tp</p>
                <p class="blog-footer-disclaimer">Disclaimer: All content provided is for educational purposes only. I am not responsible for any liabilities or actions taken based on this information.</p>`;
            container.appendChild(footer);
        }

        // Copy code helper (used by posts with .cmd-block)
        window.copyCode = function(btn) {
            const block = btn.closest('.cmd-block');
            const lines = block.querySelectorAll('.cmd-line');
            let text = '';
            lines.forEach(line => {
                let t = line.innerText;
                if (t.startsWith('$')) t = t.substring(1).trim();
                text += t + '\n';
            });
            navigator.clipboard.writeText(text.trim()).then(() => {
                const orig = btn.innerHTML;
                btn.innerHTML = '<span style="font-size:16px">&#10003;</span>';
                btn.classList.add('copied');
                setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
            });
        };
    });
})();
