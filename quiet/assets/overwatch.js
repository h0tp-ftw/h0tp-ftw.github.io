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
            
            <!-- Real-time Telemetry Grid -->
            <div class="telemetry-grid">
                <div class="telemetry-item">
                    <span class="telemetry-label">Signal-Noise Ratio</span>
                    <div class="telemetry-bar"><div class="telemetry-fill" id="telemetry-snr"></div></div>
                    <span class="telemetry-value" id="val-snr">-- db</span>
                </div>
                <div class="telemetry-item">
                    <span class="telemetry-label">Entropy Level</span>
                    <div class="telemetry-bar"><div class="telemetry-fill" id="telemetry-entropy"></div></div>
                    <span class="telemetry-value" id="val-entropy">-- H</span>
                </div>
                <div class="telemetry-item">
                    <span class="telemetry-label">Integrity Index</span>
                    <div class="telemetry-bar"><div class="telemetry-fill" id="telemetry-integrity"></div></div>
                    <span class="telemetry-value" id="val-integrity">-- %</span>
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
        
        this.telemetryElements = {
            snr: { fill: document.getElementById('telemetry-snr'), val: document.getElementById('val-snr') },
            entropy: { fill: document.getElementById('telemetry-entropy'), val: document.getElementById('val-entropy') },
            integrity: { fill: document.getElementById('telemetry-integrity'), val: document.getElementById('val-integrity') }
        };
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
            const isLockdown = document.body.classList.contains('lockdown-active');
            
            const drift = Math.random() * 15 + 5; // 5-20% base
            const fluctuation = Math.sin(Date.now() / 2000) * 5;
            const total = Math.max(0, Math.min(100, drift + fluctuation));
            this.meterElement.style.width = `${total}%`;
            
            if (total > 20) {
                this.meterElement.classList.add('warning');
            } else {
                this.meterElement.classList.remove('warning');
            }

            // Update Telemetry Grid
            if (this.telemetryElements) {
                // SNR (90-99 in normal, 40-60 in lockdown)
                const snrVal = isLockdown ? (40 + Math.random() * 20) : (90 + Math.random() * 9);
                this.telemetryElements.snr.fill.style.width = `${snrVal}%`;
                this.telemetryElements.snr.val.innerText = `${snrVal.toFixed(1)} db`;

                // Entropy (5-15 in normal, 70-90 in lockdown)
                const entropyVal = isLockdown ? (70 + Math.random() * 20) : (5 + Math.random() * 10);
                this.telemetryElements.entropy.fill.style.width = `${entropyVal}%`;
                this.telemetryElements.entropy.val.innerText = `${entropyVal.toFixed(1)} H`;
                
                // Integrity (99-100 in normal, 85-95 in lockdown)
                const integrityVal = isLockdown ? (85 + Math.random() * 10) : (99 + Math.random() * 1);
                this.telemetryElements.integrity.fill.style.width = `${integrityVal}%`;
                this.telemetryElements.integrity.val.innerText = `${integrityVal.toFixed(1)} %`;
            }

        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OverwatchFeed('overwatch-feed-container');
});
