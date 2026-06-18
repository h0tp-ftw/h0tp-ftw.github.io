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

const PROJECT_LOGOS = {
    'ankimon-trading-tool': 'https://img.icons8.com/fluency/512/bullish.png',
    'ankimon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/2052px-Pok%C3%A9_Ball_icon.svg.png',
    'anki-prettify': 'https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/logos/exports/1544x1544_circle.png',
    'prettify': 'https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/logos/exports/1544x1544_circle.png',
    'anki-vscode': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png',
    'anki': 'https://images.icon-icons.com/1381/PNG/512/anki_93962.png',
    'api-key-cycler': 'https://em-content.zobj.net/source/apple/354/key_1f511.png',
    'acoustic-engine': 'https://img.icons8.com/fluency/512/speaker.png',
    'alarm': 'https://img.icons8.com/color/512/alarm-clock.png',
    'h0tp-ftw.github.io': 'https://img.icons8.com/color/512/globe--v1.png',
};

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
