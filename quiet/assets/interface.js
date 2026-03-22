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
            this.isLockdown = !this.isLockdown;
            document.body.classList.toggle('lockdown-active', this.isLockdown);
            
            this.lockdownBtn.classList.toggle('active', this.isLockdown);
            const label = this.lockdownBtn.querySelector('.btn-label');
            if (label) {
                label.innerText = this.isLockdown ? 'END LOCKDOWN' : 'SIGNAL LOCKDOWN';
            }

            // High-signal auditory feedback simulation (UI only)
            console.log(this.isLockdown ? "[SYSTEM] Signal lockdown initiated. Suppressing noise." : "[SYSTEM] Signal lockdown terminated. Resuming telemetry.");
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuietInterface();
});
