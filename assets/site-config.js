// ============================================
// SITE DATA / CONFIG
// Edit these to tweak the homepage. Loaded as a classic <script>
// BEFORE port-logic.js, so these globals are available to it.
// ============================================

const ROTATING_WORDS = [
    'unpaid',
    'unknown',
    'overworked',
    'broke',
    'caffeinated',
    'sleep-deprived',
    'passionate',
    'dedicated',
];

// Forks are hidden from the "My Projects" section by default — most are
// throwaway forks kept only for development or sending a PR. To feature a fork
// anyway (e.g. one you've meaningfully built on), add its repo name here.
// Matched against the GitHub repo name, case-insensitive.
const SHOWCASE_FORKS = [
    'ankimon',        // 66★ flagship project (forked from upstream, but yours)
    'anki-vscode',    // 13★ your tool
    'anki-prettify',  // your mod of the Prettify Nord card template
];

// Repos to hide from "My Projects" entirely, by name (case-insensitive) —
// dead duplicates, throwaway experiments, anything not worth featuring.
// Applies to forks and non-forks alike.
const HIDE_REPOS = [
    'ankimon-stale',  // dead duplicate of ankimon
];

// Map GitHub languages to Devicon classes
const LANGUAGE_ICONS = {
    'JavaScript': 'devicon-javascript-plain',
    'TypeScript': 'devicon-typescript-plain',
    'Python': 'devicon-python-plain',
    'HTML': 'devicon-html5-plain',
    'CSS': 'devicon-css3-plain',
    'Java': 'devicon-java-plain',
    'C#': 'devicon-csharp-plain',
    'C++': 'devicon-cplusplus-plain',
    'C': 'devicon-c-plain',
    'Go': 'devicon-go-plain',
    'Rust': 'devicon-rust-plain',
    'PHP': 'devicon-php-plain',
    'Ruby': 'devicon-ruby-plain',
    'Swift': 'devicon-swift-plain',
    'Kotlin': 'devicon-kotlin-plain',
    'Dart': 'devicon-dart-plain',
    'Shell': 'devicon-bash-plain',
    'PowerShell': 'devicon-powershell-plain',
    'Vue': 'devicon-vuejs-plain',
    'React': 'devicon-react-original',
    'Angular': 'devicon-angularjs-plain',
    'Svelte': 'devicon-svelte-plain',
    'Docker': 'devicon-docker-plain',
    'Kubernetes': 'devicon-kubernetes-plain',
    'Lua': 'devicon-lua-plain',
// Fallback
    'default': 'devicon-github-original'
};

// Discord User ID for real-time presence via Lanyard API
const DISCORD_USER_ID = '445586026451173377';

// Supported Catppuccin themes
const CATPPUCCIN_THEMES = [
    { id: 'frappe', name: 'Frappé', icon: '☕', desc: 'Dark (Default)' },
    { id: 'macchiato', name: 'Macchiato', icon: '🥛', desc: 'Dark (Medium)' },
    { id: 'mocha', name: 'Mocha', icon: '🍫', desc: 'Dark (Deep)' },
    { id: 'latte', name: 'Latte', icon: '☀️', desc: 'Light' },
];

// Virtual files accessible via `cat` command in the hero terminal
const TERMINAL_FILES = {
    'status.txt': 'Just another passionate FOSS developer & AI engineer building useful software.',
    'skills.txt': 'Agentic AI & ML/RL, Full-Stack Dev, Computational Biology, Cybersecurity',
    'about.md': '# About h0tp-ftw\nFOSS developer and AI enthusiast building autonomous agent systems, dev tools, and learning utilities (Ankimon).',
    'contact.txt': 'GitHub: https://github.com/h0tp-ftw\nDiscord: @h0tp (ID: 445586026451173377)',
    'setup.txt': 'OS: Windows 11 / Ubuntu (WSL2)\nEditor: Antigravity / Claude Code / Codex\nStack: Python, TypeScript, Node.js, PyTorch'
};
