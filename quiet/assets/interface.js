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
        this.notificationOverlay = document.getElementById('notification-overlay');
        this.scanOverlay = document.querySelector('.scan-overlay');
        document.body.classList.add('scanning-active');
        this.setupClock();
        this.setupLockdown();
        this.setupTelemetry();
        this.setupSignalMonitor();
        this.setupActionGrid();
        this.setupNeuralUplink();
        this.setupNeuralSyncCanvas();
        this.setupResponseMatrix();
        this.setupThreatLandscape();
        this.setupTabs();
        this.setupAutoDefense();
        this.setupDataStreams();
        this.setupPatternRecognition();
        this.setupSystemConsole();
        this.setupSignalMeter();
        this.setupPacketCapture();
        this.setupLoadoutSelector();
    }

    setupLoadoutSelector() {
        const loadoutCards = document.querySelectorAll('.loadout-card');
        loadoutCards.forEach(card => {
            card.addEventListener('click', () => {
                const loadout = card.getAttribute('data-loadout');
                loadoutCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.handleCommand(`loadout ${loadout}`);
                this.notify(`LOADOUT CHANGED: ${loadout.toUpperCase()}`, 'success');
            });
        });
    }

    setupPacketCapture() {
        const grid = document.getElementById('packet-grid');
        const countEl = document.getElementById('packet-count');
        if (!grid) return;

        // Initialize 64 cells
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'packet-cell';
            cell.innerText = '00';
            grid.appendChild(cell);
        }

        const cells = grid.querySelectorAll('.packet-cell');
        let sequence = 0;

        setInterval(() => {
            sequence++;
            if (countEl) countEl.innerText = `SEQ: ${sequence.toString(16).toUpperCase()}`;

            const burstSize = Math.floor(Math.random() * 8) + 1;
            for (let i = 0; i < burstSize; i++) {
                const idx = Math.floor(Math.random() * 64);
                const cell = cells[idx];
                const val = Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
                
                cell.innerText = val;
                cell.classList.remove('active', 'encrypted', 'malformed', 'filtered');
                
                const rand = Math.random();
                if (rand > 0.95) cell.classList.add('malformed');
                else if (rand > 0.8) cell.classList.add('encrypted');
                else if (rand > 0.4) cell.classList.add('active');
                else cell.classList.add('filtered');

                setTimeout(() => {
                    cell.classList.remove('active', 'malformed', 'encrypted', 'filtered');
                }, 400 + Math.random() * 600);
            }
        }, 150);
    }

    setupSignalMeter() {
        const meter = document.getElementById('global-signal-meter');
        if (!meter) return;
        const bars = meter.querySelectorAll('.signal-bar');
        
        setInterval(() => {
            const snr = parseFloat(document.getElementById('snr-val')?.innerText || 0);
            const strength = Math.floor((snr - 80) / 4); // 0 to 5 roughly
            
            bars.forEach((bar, i) => {
                bar.classList.remove('active', 'warning', 'alert');
                if (i <= strength) {
                    if (snr < 85) bar.classList.add('alert');
                    else if (snr < 90) bar.classList.add('warning');
                    else bar.classList.add('active');
                    bar.style.height = `${(i + 1) * 20}%`;
                } else {
                    bar.style.height = '20%';
                }
            });
        }, 1000);
    }

    setupSystemConsole() {
        this.consoleOutput = document.getElementById('console-output');
        if (!this.consoleOutput) return;

        const bootMsgs = [
            { tag: 'BOOT', msg: 'Initializing QUIET v4.2.0-stable' },
            { tag: 'KERN', msg: 'Loading tactical heuristics engine...' },
            { tag: 'NET', msg: 'Establishing encrypted uplink to Nova...' },
            { tag: 'SEC', msg: 'Integrity check: 100% (Signed by IONOSPHERE)' },
            { tag: 'OK', msg: 'System operational.' }
        ];

        bootMsgs.forEach((m, i) => {
            setTimeout(() => this.appendConsole(m.msg, m.tag), i * 200);
        });

        // Periodic system noise
        const systemEvents = [
            { tag: 'CRON', msg: 'Nightly build cycle initiated.', type: 'out' },
            { tag: 'SEC', msg: 'Zero-trust handshake completed.', type: 'out' },
            { tag: 'MEM', msg: 'Garbage collection: 142ms / 4.2MB cleared.', type: 'out' },
            { tag: 'NET', msg: 'Ping baseline: 18ms.', type: 'out' },
            { tag: 'WRN', msg: 'Minor signal jitter in Sector 7.', type: 'wrn' }
        ];

        setInterval(() => {
            if (Math.random() > 0.8) {
                const ev = systemEvents[Math.floor(Math.random() * systemEvents.length)];
                this.appendConsole(ev.msg, ev.tag, ev.type);
            }
        }, 5000);
    }

    appendConsole(msg, tag = 'SYS', type = '') {
        if (!this.consoleOutput) return;
        
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        line.innerHTML = `
            <span class="console-time">[${timeStr}]</span>
            <span class="console-tag">${tag}</span>
            <span class="console-msg">${msg}</span>
        `;

        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;

        // Limit buffer
        if (this.consoleOutput.children.length > 50) {
            this.consoleOutput.firstChild.remove();
        }
    }

    setupPatternRecognition() {
        const patternList = document.getElementById('pattern-list');
        const patternStatus = document.getElementById('pattern-status');
        const snrVal = document.getElementById('snr-val');
        
        if (!patternList || !patternStatus) return;

        const signatures = [
            'GHOST_PROTOCOL', 'ENCRYPTED_BEACON', 'NEURAL_STUTTER', 'QUANTUM_DRIFT',
            'VOID_ECHO', 'PULSE_FRAG', 'SYNTH_OVERLAY', 'VECTOR_BREADCRUMB'
        ];

        const addPattern = (name) => {
            // Remove empty state
            const empty = patternList.querySelector('.empty');
            if (empty) empty.remove();

            const confidence = (Math.random() * 20 + 75).toFixed(1);
            const isHigh = confidence > 90;
            
            const entry = document.createElement('div');
            entry.className = `pattern-entry ${isHigh ? 'high-confidence' : ''}`;
            entry.innerHTML = `
                <span class="pattern-name">${name}</span>
                <span class="pattern-confidence">${confidence}% CONF</span>
            `;

            patternList.prepend(entry);
            this.notify(`PATTERN IDENTIFIED: ${name} (${confidence}%)`, isHigh ? 'info' : 'success');

            if (patternList.children.length > 4) {
                patternList.lastChild.remove();
            }
        };

        setInterval(() => {
            const snr = parseFloat(snrVal?.innerText || 0);
            if (snr > 88 && Math.random() > 0.9) {
                const name = signatures[Math.floor(Math.random() * signatures.length)];
                addPattern(name);
                patternStatus.innerText = `ANALYSIS COMPLETE: SIGNATURE COHERENCE DETECTED`;
                patternStatus.style.color = 'var(--ctp-green)';
            } else if (snr < 85) {
                patternStatus.innerText = `SCANNING... SNR TOO LOW FOR PATTERN LOCK`;
                patternStatus.style.color = 'var(--ctp-yellow)';
            } else {
                patternStatus.innerText = `SCANNING FOR COHERENT SIGNATURES...`;
                patternStatus.style.color = 'var(--ctp-overlay1)';
            }
        }, 4000);
    }

    setupDataStreams() {
        const rawStream = document.getElementById('raw-stream-content');
        const filteredStream = document.getElementById('filtered-stream-content');
        const rawRate = document.getElementById('raw-stream-rate');
        const filteredRate = document.getElementById('filtered-stream-rate');

        if (!rawStream || !filteredStream) return;

        const dataTypes = ['PKT', 'SYN', 'ACK', 'PUSH', 'RST', 'FIN', 'URG', 'ECE', 'CWR'];
        const systems = ['AUTH', 'DB', 'CACHE', 'GATE', 'EDGE', 'CORE', 'MESH', 'PROXY'];

        const createStreamLine = (container, type = 'normal') => {
            const line = document.createElement('div');
            line.className = `stream-line ${type}`;
            const sys = systems[Math.floor(Math.random() * systems.length)];
            const dtype = dataTypes[Math.floor(Math.random() * dataTypes.length)];
            const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
            line.innerText = `[${sys}] ${dtype} // 0x${hex} // ${Math.floor(Math.random() * 1000)}ms`;
            
            container.appendChild(line);
            if (container.children.length > 20) {
                container.removeChild(container.firstChild);
            }
            container.scrollTop = container.scrollHeight;
        };

        let rawBytes = 0;
        let filteredBytes = 0;

        const updateRates = () => {
            if (rawRate) rawRate.innerText = `${(rawBytes / 1024).toFixed(1)} kbps`;
            if (filteredRate) filteredRate.innerText = `${(filteredBytes / 1024).toFixed(1)} kbps`;
            rawBytes = 0;
            filteredBytes = 0;
        };

        setInterval(updateRates, 1000);

        const cycleStreams = () => {
            const rawCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < rawCount; i++) {
                const isCritical = Math.random() > 0.95;
                createStreamLine(rawStream, isCritical ? 'critical' : 'normal');
                rawBytes += Math.floor(Math.random() * 512) + 64;
                
                // Filtering simulation
                if (!isCritical && Math.random() > 0.6) {
                    createStreamLine(filteredStream, 'success');
                    filteredBytes += Math.floor(Math.random() * 128) + 32;
                }
            }
        };

        setInterval(cycleStreams, 200 + Math.random() * 300);
    }

    notify(message, type = 'info', duration = 3000) {
        if (!this.notificationOverlay) return;

        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        toast.innerHTML = `<span style="opacity: 0.5">[${timestamp}]</span> ${message}`;

        this.notificationOverlay.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => toast.remove(), 500);
        }, duration);
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-target');

                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const content = document.getElementById(target);
                if (content) {
                    content.classList.add('active');
                    this.handleCommand(`switch_tab ${target}`);
                }
                
                // Trigger resize for canvases if hidden/shown
                window.dispatchEvent(new Event('resize'));
            });
        });
    }

    setupThreatLandscape() {
        const landscape = document.getElementById('threat-landscape');
        const scanLine = document.getElementById('threat-scan-line');
        const threatCountEl = document.getElementById('threat-count');
        if (!landscape || !scanLine) return;

        let threats = [];
        let scanX = 0;
        const rect = landscape.getBoundingClientRect();

        const createThreat = (x, y) => {
            const node = document.createElement('div');
            node.className = 'threat-node detected';
            node.style.left = `${x}px`;
            node.style.top = `${y}px`;
            landscape.appendChild(node);
            setTimeout(() => node.remove(), 2000);
            this.handleCommand('threat_detected');
            this.notify(`THREAT DETECTED: Sector ${Math.floor(x/rect.width*100)}%:${Math.floor(y/rect.height*100)}%`, 'alert');
        };

        const update = () => {
            scanX = (scanX + 2) % rect.width;
            scanLine.style.left = `${scanX}px`;

            // Randomly spawn threats near the scan line
            if (Math.random() > 0.98) {
                const y = Math.random() * rect.height;
                createThreat(scanX, y);
                threats.push(Date.now());
            }

            // Cleanup threat list (for stats)
            threats = threats.filter(t => Date.now() - t < 5000);
            if (threatCountEl) {
                threatCountEl.innerText = `DETECTED THREATS: ${threats.length}`;
            }

            requestAnimationFrame(update);
        };

        update();
    }

    setupResponseMatrix() {
        const nodes = Array.from({ length: 4 }, (_, i) => document.getElementById(`matrix-node-${i}`)).filter(Boolean);
        if (nodes.length === 0) return;

        nodes.forEach(node => {
            node.addEventListener('mousedown', (e) => {
                const statusEl = node.querySelector('.matrix-status');
                if (statusEl.classList.contains('warning')) {
                    statusEl.innerText = 'STATUS: MITIGATING...';
                    statusEl.className = 'matrix-status mitigating';
                    this.handleCommand(`mitigation ${node.id}`);
                    
                    setTimeout(() => {
                        statusEl.innerText = 'STATUS: SECURE';
                        statusEl.className = 'matrix-status';
                        node.classList.add('scan');
                    }, 2000);
                }
            });
        });

        const cycleMatrix = () => {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            const statusEl = randomNode.querySelector('.matrix-status');
            const valueEl = randomNode.querySelector('.matrix-value');
            
            // Skip if currently being mitigated
            if (statusEl.classList.contains('mitigating')) return;

            if (Math.random() > 0.8) {
                const isAlert = Math.random() > 0.6;
                statusEl.innerText = isAlert ? 'STATUS: ANOMALY' : 'STATUS: SECURE';
                statusEl.className = `matrix-status ${isAlert ? 'warning' : ''}`;
                randomNode.classList.toggle('scan', !isAlert);
                
                if (isAlert) {
                    this.handleCommand(`anomaly ${randomNode.id.split('-').pop()}`);
                }
            }

            // Occasional value fluctuation
            if (Math.random() > 0.9) {
                const versions = ['X', 'Y', 'Z', 'A', 'P'];
                const currentVal = valueEl.innerText;
                const newVal = versions[Math.floor(Math.random() * versions.length)];
                valueEl.innerText = currentVal.replace(/[A-Z]$/, newVal);
            }
        };

        setInterval(cycleMatrix, 1500);
    }

    setupNeuralSyncCanvas() {
        const canvas = document.getElementById('neural-sync-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        const resize = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        let offset = 0;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const points = 50;
            const step = canvas.width / points;
            
            ctx.beginPath();
            ctx.strokeStyle = '#89b4fa';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            
            for (let i = 0; i <= points; i++) {
                const x = i * step;
                const y = (canvas.height / 2) + Math.sin(i * 0.2 + offset) * 15;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = '#cba6f7';
            ctx.setLineDash([]);
            for (let i = 0; i <= points; i++) {
                const x = i * step;
                const y = (canvas.height / 2) + Math.cos(i * 0.15 - offset * 0.5) * 10;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            offset += 0.05;
            requestAnimationFrame(draw);
        };
        draw();
    }

    setupNeuralUplink() {
        const nodes = [
            document.getElementById('node-alpha'),
            document.getElementById('node-beta'),
            document.getElementById('node-gamma')
        ].filter(Boolean);

        if (nodes.length === 0) return;

        let currentNodeIndex = 0;

        const cycleUplink = () => {
            // Deactivate all nodes
            nodes.forEach(node => {
                node.classList.remove('active', 'syncing');
            });

            // Set the current node to active
            const currentNode = nodes[currentNodeIndex];
            currentNode.classList.add('active');

            // Set the previous node to syncing
            const prevNodeIndex = (currentNodeIndex - 1 + nodes.length) % nodes.length;
            const prevNode = nodes[prevNodeIndex];
            prevNode.classList.add('syncing');

            // Move to the next node for the next cycle
            currentNodeIndex = (currentNodeIndex + 1) % nodes.length;
        };

        cycleUplink(); // Initial call
        setInterval(cycleUplink, 2000); // Cycle every 2 seconds
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
                            const label = parent.querySelector('.telemetry-label').innerText;
                            this.notify(`CRITICAL LOAD: ${label} at ${amount}${suffix}`, 'warning');
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
            this.notify(this.isLockdown ? "SIGNAL LOCKDOWN INITIATED" : "SIGNAL LOCKDOWN TERMINATED", this.isLockdown ? 'alert' : 'success');
        });

        const terminalInput = document.getElementById('terminal-input');
        const terminalHint = document.getElementById('terminal-hint');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.availableCommands = ['status', 'clear', 'help', 'lockdown', 'unlock', 'baseline', 'intercept'];

        if (terminalInput) {
            terminalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = terminalInput.value.trim().toLowerCase();
                    if (cmd) {
                        this.commandHistory.unshift(cmd);
                        if (this.commandHistory.length > 20) this.commandHistory.pop();
                        this.historyIndex = -1;
                        this.handleCommand(cmd);
                    }
                    terminalInput.value = '';
                    if (terminalHint) terminalHint.innerText = '';
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (this.historyIndex < this.commandHistory.length - 1) {
                        this.historyIndex++;
                        terminalInput.value = this.commandHistory[this.historyIndex];
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (this.historyIndex > 0) {
                        this.historyIndex--;
                        terminalInput.value = this.commandHistory[this.historyIndex];
                    } else if (this.historyIndex === 0) {
                        this.historyIndex = -1;
                        terminalInput.value = '';
                    }
                } else if (e.key === 'Tab') {
                    e.preventDefault();
                    const val = terminalInput.value.toLowerCase();
                    const match = this.availableCommands.find(c => c.startsWith(val));
                    if (match) {
                        terminalInput.value = match;
                    }
                }
            });

            terminalInput.addEventListener('input', () => {
                const val = terminalInput.value.toLowerCase();
                if (val && terminalHint) {
                    const match = this.availableCommands.find(c => c.startsWith(val));
                    terminalHint.innerText = match ? `SUGGESTION: ${match}` : '';
                } else if (terminalHint) {
                    terminalHint.innerText = '';
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
        document.body.classList.toggle('signal-lockdown', this.isLockdown);
        
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

    setupAutoDefense() {
        // Automatically triggers lockdown if threat count spikes
        setInterval(() => {
            const threatCountEl = document.getElementById('threat-count');
            if (threatCountEl) {
                const count = parseInt(threatCountEl.innerText.split(': ')[1] || 0);
                if (count >= 5 && !this.isLockdown) {
                    this.notify("THREAT OVERLOAD: AUTO-LOCKDOWN ENGAGED", "alert");
                    this.handleCommand("lockdown");
                }
            }
        }, 2000);
    }

    handleCommand(cmd) {
        if (!cmd) return;

        // Visual feedback in the Directive Log
        this.logDirective(cmd);
        this.appendConsole(`EXEC: ${cmd.toUpperCase()}`, 'USER', 'out');

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
            case (cmd.startsWith('loadout') ? cmd : 'none'):
                const loadout = cmd.split(' ')[1] || 'STEALTH';
                log(`Applying tactical loadout: ${loadout.toUpperCase()}...`);
                this.appendConsole(`LOADOUT: ${loadout.toUpperCase()} ENGAGED`, 'SEC', 'out');
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
            case (cmd.startsWith('mitigation') ? cmd : 'none'):
                log(`Initiating manual mitigation for ${cmd.split(' ')[1] || 'CORE'}...`);
                break;
            case (cmd.startsWith('anomaly') ? cmd : 'none'):
                log(`Analyzing anomaly in node: ${cmd.split(' ')[1] || 'ALL'}`);
                log("Executing sub-system recalibration...");
                break;
            default:
                log(`Directive unrecognized: ${cmd.toUpperCase()}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuietInterface();
});
