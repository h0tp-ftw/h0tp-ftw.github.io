/**
 * Quiet Interface Systems
 * Real-time clock and lockdown protocols.
 */

class QuietInterface {
    constructor() {
        this.lockdownBtn = document.getElementById('lockdown-toggle');
        this.systemTimeEl = document.getElementById('system-time');
        this.directiveList = document.getElementById('directive-list');
        this.isLockdown = false;

        this.init();
    }

    init() {
        this.setupClock();
        this.setupLockdown();
        this.setupTelemetry();
        this.setupSignalMonitor();
        this.setupActionGrid();
    }

    setupActionGrid() {
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
                if (cmd) this.handleCommand(cmd);
            });
        });
    }

    setupSignalMonitor() {
        this.signalCanvas = document.getElementById('signal-integrity-canvas');
        this.signalMonitor = document.getElementById('signal-monitor');
        if (!this.signalCanvas) return;

        const ctx = this.signalCanvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = this.signalCanvas.getBoundingClientRect();

        this.signalCanvas.width = rect.width * dpr;
        this.signalCanvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const snrVal = document.getElementById('snr-val');
        const noiseVal = document.getElementById('noise-val');
        let points = Array.from({ length: 60 }, (_, i) => ({ x: (rect.width / 59) * i, y: rect.height / 2 }));

        // Intercept interaction
        if (this.signalMonitor) {
            this.signalMonitor.addEventListener('mousedown', (e) => {
                const mRect = this.signalMonitor.getBoundingClientRect();
                const x = e.clientX - mRect.left;
                const y = e.clientY - mRect.top;
                
                this.createIntercept(x, y);
                this.handleCommand('intercept');
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, rect.width, rect.height);
            
            // Background grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < rect.width; i += 20) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, rect.height); ctx.stroke();
            }
            for (let i = 0; i < rect.height; i += 10) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(rect.width, i); ctx.stroke();
            }

            // Signal Path
            ctx.beginPath();
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ctp-mauve') || '#cba6f7';
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            
            points.shift();
            const lastY = points[points.length - 1].y;
            const drift = (Math.random() - 0.5) * 4;
            const noise = (Math.random() - 0.5) * (this.isLockdown ? 1 : 10);
            let nextY = lastY + drift + noise;
            
            // Contain within canvas
            nextY = Math.max(10, Math.min(rect.height - 10, nextY));
            points.push({ x: rect.width, y: nextY });

            // Re-calculate X positions for all points to keep them spaced
            points.forEach((p, i) => {
                p.x = (rect.width / (points.length - 1)) * i;
            });

            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();

            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.stroke();
            ctx.shadowBlur = 0;

            if (snrVal && Math.random() > 0.9) {
                const snr = (80 + Math.random() * 15 + (this.isLockdown ? 5 : 0)).toFixed(1);
                snrVal.innerText = snr;
                if (noiseVal) {
                    noiseVal.innerText = snr > 90 ? 'MINIMAL' : (snr > 85 ? 'LOW' : 'MODERATE');
                    noiseVal.style.color = snr > 90 ? 'var(--ctp-green)' : (snr > 85 ? 'var(--ctp-overlay1)' : 'var(--ctp-yellow)');
                }
            }

            requestAnimationFrame(draw);
        };

        draw();
    }

    setupTelemetry() {
        this.cpuBar = document.getElementById('cpu-bar');
        this.memBar = document.getElementById('mem-bar');
        this.netBar = document.getElementById('net-bar');
        this.cpuVal = document.getElementById('cpu-val');
        this.memVal = document.getElementById('mem-val');
        this.netVal = document.getElementById('net-val');

        const updateTelemetry = () => {
            const cpu = Math.floor(Math.random() * 95) + 2;
            const mem = Math.floor(Math.random() * 85) + 10;
            const net = Math.floor(Math.random() * 200) + 5;

            const updateItem = (bar, val, amount, threshold, suffix = '%') => {
                if (!bar || !val) return;
                
                // Scale bar for display
                const barWidth = Math.min(amount, 100);
                bar.style.width = `${barWidth}%`;
                val.innerText = `${amount}${suffix}`;

                const parent = bar.closest('.telemetry-item');
                if (parent) {
                    if (amount > threshold) {
                        parent.classList.add('alert');
                        if (Math.random() > 0.8) {
                            console.warn(`[SYSTEM] TELEMETRY ALERT: THRESHOLD EXCEEDED (${amount}${suffix})`);
                        }
                    } else {
                        parent.classList.remove('alert');
                    }
                }
            };

            updateItem(this.cpuBar, this.cpuVal, cpu, 80);
            updateItem(this.memBar, this.memVal, mem, 85);
            updateItem(this.netBar, this.netVal, net, 100, 'ms');
        };

        setInterval(updateTelemetry, 3000);
    }

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const format = (n) => n.toString().padStart(2, '0');
            const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const dayStr = days[now.getDay()];
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = `${format(now.getHours())}:${format(now.getMinutes())}:${format(now.getSeconds())}`;
            
            if (this.systemTimeEl) {
                this.systemTimeEl.innerText = `SECURE CONNECTION ESTABLISHED // ${dayStr} ${dateStr} ${timeStr} UTC`;
            }
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    setupLockdown() {
        if (!this.lockdownBtn) return;

        this.lockdownBtn.addEventListener('click', () => {
            this.toggleLockdown();
        });

        const terminalInput = document.getElementById('terminal-input');
        if (terminalInput) {
            terminalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = terminalInput.value.trim().toLowerCase();
                    terminalInput.value = '';
                    this.handleCommand(cmd);
                }
            });
        }
    }

    logDirective(cmd) {
        if (!this.directiveList) return;
        
        // Remove placeholder
        const placeholder = this.directiveList.querySelector('.placeholder');
        if (placeholder) placeholder.remove();

        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const entry = document.createElement('li');
        entry.className = 'directive-entry';
        entry.innerHTML = `<span class="time">[${timeStr}]</span> <span class="cmd">> ${cmd.toUpperCase()}</span>`;
        
        this.directiveList.prepend(entry);
        
        // Limit to 5 entries
        while (this.directiveList.children.length > 5) {
            this.directiveList.lastChild.remove();
        }
    }

    toggleLockdown(state) {
        this.isLockdown = state !== undefined ? state : !this.isLockdown;
        document.body.classList.toggle('lockdown-active', this.isLockdown);
        
        if (this.lockdownBtn) {
            this.lockdownBtn.classList.toggle('active', this.isLockdown);
            const label = this.lockdownBtn.querySelector('.btn-label');
            if (label) {
                label.innerText = this.isLockdown ? 'END LOCKDOWN' : 'SIGNAL LOCKDOWN';
            }
        }

        console.log(this.isLockdown ? "[SYSTEM] Signal lockdown initiated. Suppressing noise." : "[SYSTEM] Signal lockdown terminated. Resuming telemetry.");
    }

    createIntercept(x, y) {
        if (!this.signalMonitor) return;
        const marker = document.createElement('div');
        marker.className = 'intercept-marker';
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        this.signalMonitor.appendChild(marker);
        setTimeout(() => marker.remove(), 1000);
    }

    handleCommand(cmd) {
        if (!cmd) return;

        // Visual feedback in the Directive Log
        this.logDirective(cmd);

        // Feedback via Overwatch log if available
        const overwatch = window.overwatchInstance;
        const log = (msg) => {
            if (overwatch) overwatch.addLog(msg);
            else console.log(`[TERMINAL] ${msg}`);
        };

        switch (cmd) {
            case 'intercept':
                log("Signal packet intercepted. Analyzing payload...");
                break;
            case 'lockdown':
            case 'lock':
                this.toggleLockdown(true);
                log("Executing lockdown protocol...");
                break;
            case 'unlock':
            case 'baseline':
                this.toggleLockdown(false);
                log("Restoring baseline telemetry...");
                break;
            case 'status':
                log("System status: OPERATIONAL // All sectors nominal.");
                break;
            case 'clear':
                if (overwatch && overwatch.logElement) {
                    overwatch.logElement.innerHTML = '';
                    log("Log buffer cleared.");
                }
                if (this.directiveList) {
                    this.directiveList.innerHTML = '<li class="directive-entry placeholder">AWAITING SYSTEM COMMANDS...</li>';
                }
                break;
            case 'help':
                log("Available directives: LOCKDOWN, UNLOCK, STATUS, CLEAR, HELP");
                break;
            default:
                log(`Directive unrecognized: ${cmd.toUpperCase()}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuietInterface();
});
