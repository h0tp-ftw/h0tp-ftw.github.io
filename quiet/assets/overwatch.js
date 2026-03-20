/**
 * Overwatch Feed - Quiet's Strategic Monitoring System
 * Simulates high-signal data stream analysis.
 */

class OverwatchFeed {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.messages = [
            "Monitoring baseline data streams...",
            "Analyzing entropy levels in sector 4.",
            "Signal-to-noise ratio: Optimal.",
            "Minor drift detected. Analysis in progress.",
            "Applying recursive stabilization protocols.",
            "Target alignment: Absolute.",
            "Zero-intel barrier: Intact.",
            "Tactical friend protocol: Standby.",
            "Scanning for efficiency bottlenecks...",
            "Surgical correction applied to metadata stream.",
            "Baseline restored. Precision: 99.99%.",
            "Waiting for high-signal triggers.",
            "Overwatch active. All sectors nominal."
        ];

        this.init();
    }

    init() {
        this.renderStructure();
        this.startFeed();
        this.updateMeter();
    }

    renderStructure() {
        this.container.innerHTML = `
            <div class="overwatch-header">
                <span class="overwatch-title">Overwatch Feed</span>
                <div class="overwatch-meter-container">
                    <span class="meter-label">Drift</span>
                    <div class="meter-bar">
                        <div class="meter-fill" id="drift-meter"></div>
                    </div>
                </div>
            </div>
            <div class="overwatch-log" id="overwatch-log"></div>
            <div class="overwatch-status-line">
                <span class="status-marker">></span> 
                <span id="overwatch-status-text">CALIBRATING...</span>
            </div>
        `;
        this.logElement = document.getElementById('overwatch-log');
        this.meterElement = document.getElementById('drift-meter');
        this.statusElement = document.getElementById('overwatch-status-text');
    }

    addLog(text) {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-text">${text}</span>`;
        
        this.logElement.prepend(entry);

        // Keep only last 8 entries
        while (this.logElement.children.length > 8) {
            this.logElement.lastChild.remove();
        }
        
        // Update status text with the latest log message (shortened)
        if (this.statusElement) {
            this.statusElement.innerText = text.toUpperCase();
        }
    }

    startFeed() {
        const scheduleNext = () => {
            const delay = Math.random() * 5000 + 3000; // 3-8 seconds
            setTimeout(() => {
                const msg = this.messages[Math.floor(Math.random() * this.messages.length)];
                this.addLog(msg);
                scheduleNext();
            }, delay);
        };

        // Initial logs
        this.addLog("Overwatch initialized.");
        this.addLog("Establishing secure data link...");
        setTimeout(() => this.addLog("Connection secured. Monitoring active."), 1500);
        
        scheduleNext();
    }

    updateMeter() {
        setInterval(() => {
            const drift = Math.random() * 15 + 5; // 5-20% base
            const fluctuation = Math.sin(Date.now() / 2000) * 5;
            const total = Math.max(0, Math.min(100, drift + fluctuation));
            this.meterElement.style.width = `${total}%`;
            
            if (total > 20) {
                this.meterElement.classList.add('warning');
            } else {
                this.meterElement.classList.remove('warning');
            }
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OverwatchFeed('overwatch-feed-container');
});
