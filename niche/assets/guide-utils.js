document.addEventListener('DOMContentLoaded', () => {
    // Table of Contents Generation
    const tocContainer = document.querySelector('.guide-toc ul');
    const headings = document.querySelectorAll('.guide-content h2');

    if (tocContainer && headings.length > 0) {
        headings.forEach(heading => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');

            const id = heading.textContent.trim().toLowerCase().replace(/\s+/g, '-');
            heading.id = id;

            link.href = `#${id}`;
            link.textContent = heading.textContent;
            listItem.appendChild(link);
            tocContainer.appendChild(listItem);
        });
    }

    // Active link highlighting for TOC
    const tocLinks = document.querySelectorAll('.guide-toc a');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const link = document.querySelector(`.guide-toc a[href="#${id}"]`);
            if (entry.isIntersecting) {
                tocLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }, { rootMargin: '-20% 0px -80% 0px' });

    headings.forEach(heading => {
        observer.observe(heading);
    });

    // Copy Code Button
    const codeBlocks = document.querySelectorAll('.guide-content pre');
    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.textContent = 'Copy';
        block.appendChild(button);

        button.addEventListener('click', () => {
            const code = block.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
        });
    });
});
