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

// One-line "impact" blurb shown under a project card, keyed by lowercase repo
// name. Resume-bullet voice: what you built + the concrete win. Repos with no
// entry simply show no blurb. Keep these accurate — they describe real usage.
const PROJECT_IMPACTS = {
    'acoustic-engine': 'Engineered a noise-resilient DSP engine that detects smoke, CO, and appliance alarms in real time on a Raspberry Pi — deterministic FFT instead of neural nets, learning a new alarm from a single recording.',
    'alarm-audio-detector': 'Packaged acoustic alarm detection as a Home Assistant add-on: real-time T3/T4 smoke and CO recognition that runs 100% locally on a Raspberry Pi and updates HA sensors over REST.',
    'shucky': 'Built a zero-dependency security scanner that audits agent SKILL.md packages for risky behavior — secret access, network calls — and blocks unsafe installs straight from CI.',
    'jules-bot': 'Built a Discord bot that turns forum threads into gated Google Jules coding-agent sessions — streaming live logs and requiring human approval before any code changes.',
    'jules-skill': "Wrote a zero-dependency CLI wrapper for Google's Jules API that emits pure JSON, letting AI agents drive coding sessions programmatically.",
    'ionosphere': "Built a stateless HTTP bridge that exposes the Google Gemini CLI as an OpenAI-compatible API — unlocking agentic tool-use, search grounding, and Gemini's huge context in any OpenAI client.",
    'gemini-openai-bridge': 'Prototyped an OpenAI-compatible bridge for the Gemini CLI, then documented the architectural dead-ends (process-spawn latency, statelessness) that led to its successor, Ionosphere.',
    'ankimon': 'Lead the 66★ experimental branch of Ankimon — an Anki add-on that gamifies studying Pokémon-style — coordinating a 15+ contributor community.',
    'anki-vscode': 'Built a VS Code extension that makes Anki add-on development seamless: live breakpoint debugging (debugpy / F5), profile switching across Anki versions, and one-click setup.',
    'anki-prettify': 'Extended the Prettify Anki card template with responsive theming, hover-to-expand images, deck breadcrumbs, and inline tags — turning plain flashcards into a polished, distraction-free study UI.',
    'ankimon-sprites': 'Curated 13k+ Pokémon sprites, cries, and badges for Ankimon, with a GitHub Action that builds, checksums, and mirrors the asset pack to Releases and HuggingFace on every push.',
    'ankimon-trading-tool': 'Built a web tool that diffs two Ankimon (Pokémon-in-Anki) collections side by side to surface mutually beneficial card trades between players.',
    'api-key-cycler': 'Built a cross-platform, zero-dependency CLI that rotates between API-key sets in your .env — sequential, random, or indexed — to sidestep rate limits across OpenAI, Gemini, Anthropic, and more.',
    'h0tp-ftw.github.io': 'Designed and built this very portfolio from scratch — framework-free HTML/CSS/JS, Catppuccin theming, and a daily GitHub Actions pipeline that snapshots live GitHub data.',
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
