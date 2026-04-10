/**
 * Overwatch Signal Visualization System
 * Handles the background waveform and real-time signal logging.
 */

class OverwatchSignal {
    constructor() {
        this.canvas = document.getElementById('signal-waveform');
        this.container = document.getElementById('overwatch-feed-container');
        this.compressionVal = document.getElementById('compression-val');
        
        if (!this.canvas || !this.container) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.logs = [];
        this.maxLogs = 8;
        
        this.init();
        window.overwatchInstance = this;
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Create log overlay if it doesn't exist
        this.logElement = document.createElement('div');
        this.logElement.className = 'overwatch-log-overlay';
        this.logElement.style.cssText = `
            position: absolute;
            bottom: 1rem;
            left: 1rem;
            font-family: monospace;
            font-size: 0.75rem;
            color: var(--ctp-blue);
            pointer-events: none;
            text-shadow: 0 0 5px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column-reverse;
            gap: 2px;
        `;
        this.container.appendChild(this.logElement);

        this.animate();
        this.startRandomLogs();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    addLog(text) {
        const entry = document.createElement('div');
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        entry.innerHTML = `<span style="opacity: 0.5;">[${timestamp}]</span> ${text}`;
        entry.style.animation = 'fade-in-up 0.3s ease-out forwards';
        
        this.logElement.prepend(entry);
        
        if (this.logElement.children.length > this.maxLogs) {
            this.logElement.lastChild.remove();
        }
    }

    startRandomLogs() {
        const events = [
            "Packet burst detected in Sector 7",
            "Entropy filter calibrated",
            "Node synchronization complete",
            "Analyzing jitter variance...",
            "Sub-millisecond latency achieved",
            "Uplink integrity at 99.8%",
            "Buffering incoming stream...",
            "Noise floor baseline adjusted"
        ];

        const trigger = () => {
            if (Math.random() > 0.7) {
                this.addLog(events[Math.floor(Math.random() * events.length)]);
            }
            setTimeout(trigger, 3000 + Math.random() * 5000);
        };
        trigger();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const time = Date.now() * 0.001;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Draw background waveform
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(137, 180, 250, 0.2)'; // ctp-blue with alpha
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.width; x += 2) {
            const noise = Math.sin(x * 0.02 + time) * 10;
            const wave = Math.sin(x * 0.005 + time * 0.5) * 20;
            const y = centerY + noise + wave;
            
            if (x === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();

        // Active pulses
        if (Math.random() > 0.98) {
            this.particles.push({
                x: 0,
                y: centerY + (Math.random() - 0.5) * 40,
                speed: 5 + Math.random() * 5,
                size: 2 + Math.random() * 3
            });
        }

        this.ctx.fillStyle = 'var(--ctp-blue)';
        this.particles.forEach((p, i) => {
            p.x += p.speed;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Cleanup
            if (p.x > this.width) this.particles.splice(i, 1);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Add CSS for the log animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    new OverwatchSignal();
});
