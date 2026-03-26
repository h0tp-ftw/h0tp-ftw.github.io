/**
 * Quiet Interface Systems
 * Real-time clock and lockdown protocols.
 */

class QuietInterface {
    constructor() {
        this.lockdownBtn = document.getElementById('lockdown-toggle');
        this.systemTimeEl = document.getElementById('system-time');
        this.isLockdown = false;

        this.init();
    }

    init() {
        this.setupClock();
        this.setupLockdown();
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

    handleCommand(cmd) {
        if (!cmd) return;

        // Feedback via Overwatch log if available
        const overwatch = window.overwatchInstance;
        const log = (msg) => {
            if (overwatch) overwatch.addLog(msg);
            else console.log(`[TERMINAL] ${msg}`);
        };

        switch (cmd) {
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
