// ============================================
// VanillaTilt - 3D tilt-on-hover for cards.
// Vendored library (https://micku7zu.github.io/vanilla-tilt.js/).
// Classic <script> loaded BEFORE port-logic.js, which uses it in
// initCoolFeatures(). Self-contained: no app dependencies.
// ============================================

class VanillaTilt {
    constructor(element, settings = {}) {
        if (!(element instanceof Node)) {
            throw "Can't initialize VanillaTilt because " + element + " is not a Node.";
        }

        this.width = null;
        this.height = null;
        this.clientWidth = null;
        this.clientHeight = null;
        this.left = null;
        this.top = null;

        this.gammazero = null;
        this.betazero = null;
        this.lastgammazero = null;
        this.lastbetazero = null;

        this.transitionTimeout = null;
        this.updateCall = null;
        this.event = null;

        this.updateBind = this.update.bind(this);
        this.resetBind = this.reset.bind(this);

        this.element = element;
        this.settings = this.extendSettings(settings);

        this.reverse = this.settings.reverse ? -1 : 1;
        this.glare = this.isSettingTrue(this.settings.glare);
        this.glarePrerender = this.isSettingTrue(this.settings["glare-prerender"]);
        this.fullPageListening = this.isSettingTrue(this.settings["full-page-listening"]);

        if (this.glare) {
            this.prepareGlare();
        }

        if (this.fullPageListening) {
            this.updateClientSize();
        }

        this.addEventListeners();
        this.reset();
        this.updateInitialPosition();
    }

    isSettingTrue(setting) {
        return setting === "" || setting === true || setting === 1;
    }

    extendSettings(settings) {
        let defaultSettings = {
            reverse: false,
            max: 15, // max tilt rotation (degrees)
            startX: 0,
            startY: 0,
            perspective: 1000,
            easing: "cubic-bezier(.03,.98,.52,.99)",
            scale: 1.05,
            speed: 300,
            transition: true,
            axis: null,
            glare: false,
            "max-glare": 1,
            "glare-prerender": false,
            "full-page-listening": false,
            "mouse-event-element": null,
            reset: true,
            gyroscope: true,
            gyroscopeMinAngleX: -45,
            gyroscopeMaxAngleX: 45,
            gyroscopeMinAngleY: -45,
            gyroscopeMaxAngleY: 45,
            gyroscopeSamples: 10
        };

        let newSettings = {};
        for (var property in defaultSettings) {
            if (property in settings) {
                newSettings[property] = settings[property];
            } else if (this.element.hasAttribute("data-tilt-" + property)) {
                let attribute = this.element.getAttribute("data-tilt-" + property);
                try {
                    newSettings[property] = JSON.parse(attribute);
                } catch (e) {
                    newSettings[property] = attribute;
                }
            } else {
                newSettings[property] = defaultSettings[property];
            }
        }

        return newSettings;
    }

    initGlare() {
        this.glareElementWrapper = document.createElement("div");
        this.glareElementWrapper.classList.add("js-tilt-glare");
        this.glareElementWrapper.style.position = "absolute";
        this.glareElementWrapper.style.top = "0";
        this.glareElementWrapper.style.left = "0";
        this.glareElementWrapper.style.width = "100%";
        this.glareElementWrapper.style.height = "100%";
        this.glareElementWrapper.style.overflow = "hidden";
        this.glareElementWrapper.style.pointerEvents = "none";

        this.glareElement = document.createElement("div");
        this.glareElement.classList.add("js-tilt-glare-inner");
        this.glareElement.style.position = "absolute";
        this.glareElement.style.top = "50%";
        this.glareElement.style.left = "50%";
        this.glareElement.style.pointerEvents = "none";
        this.glareElement.style.backgroundImage = `linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)`;
        this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
        this.glareElement.style.transformOrigin = "0% 0%";
        this.glareElement.style.opacity = "0";

        this.updateGlareSize();

        this.glareElementWrapper.appendChild(this.glareElement);
        this.element.appendChild(this.glareElementWrapper);
    }

    prepareGlare() {
        if (!this.glarePrerender) {
            // Create glare element
            this.initGlare();
        }
    }

    updateGlareSize() {
        if (this.glare) {
            const size = (this.element.offsetWidth > this.element.offsetHeight ? this.element.offsetWidth : this.element.offsetHeight) * 2;
            this.glareElement.style.width = `${size}px`;
            this.glareElement.style.height = `${size}px`;
        }
    }

    updateClientSize() {
        this.clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    onWindowResize() {
        this.updateGlareSize();
        this.updateClientSize();
    }

    addEventListeners() {
        this.onMouseEnterBind = this.onMouseEnter.bind(this);
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseLeaveBind = this.onMouseLeave.bind(this);
        this.onWindowResizeBind = this.onWindowResize.bind(this);

        this.element.addEventListener("mouseenter", this.onMouseEnterBind);
        this.element.addEventListener("mouseleave", this.onMouseLeaveBind);
        this.element.addEventListener("mousemove", this.onMouseMoveBind);

        if (this.glare || this.fullPageListening) {
            window.addEventListener("resize", this.onWindowResizeBind);
        }
    }

    onMouseEnter() {
        this.updateElementPosition();
        this.element.style.willChange = "transform";
        this.setTransition();
    }

    onMouseMove(event) {
        if (this.updateCall !== null) {
            cancelAnimationFrame(this.updateCall);
        }

        this.event = event;
        this.updateCall = requestAnimationFrame(this.updateBind);
    }

    onMouseLeave() {
        this.setTransition();
        if (this.settings.reset) {
            requestAnimationFrame(this.resetBind);
        }
    }

    reset() {
        this.event = {
            clientX: this.left + this.width / 2,
            clientY: this.top + this.height / 2
        };

        if (this.element && this.element.style) {
            this.element.style.transform = `perspective(${this.settings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }

        this.resetGlare();
    }

    resetGlare() {
        if (this.glare) {
            this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
            this.glareElement.style.opacity = "0";
        }
    }

    updateInitialPosition() {
        if (this.settings.startX === 0 && this.settings.startY === 0) {
            return;
        }

        this.onMouseEnter();

        if (this.fullPageListening) {
            this.event = {
                clientX: (this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.clientWidth,
                clientY: (this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.clientHeight
            };
        } else {
            this.event = {
                clientX: this.left + ((this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.width),
                clientY: this.top + ((this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.height)
            };
        }

        let backupScale = this.settings.scale;
        this.settings.scale = 1;
        this.update();
        this.settings.scale = backupScale;
        this.resetGlare();
    }

    getValues() {
        let x, y;

        if (this.fullPageListening) {
            x = this.event.clientX / this.clientWidth;
            y = this.event.clientY / this.clientHeight;
        } else {
            x = (this.event.clientX - this.left) / this.width;
            y = (this.event.clientY - this.top) / this.height;
        }

        x = Math.min(Math.max(x, 0), 1);
        y = Math.min(Math.max(y, 0), 1);

        let tiltX = (this.reverse * (this.settings.max - x * this.settings.max * 2)).toFixed(2);
        let tiltY = (this.reverse * (y * this.settings.max * 2 - this.settings.max)).toFixed(2);
        let angle = Math.atan2(this.event.clientX - (this.left + this.width / 2), -(this.event.clientY - (this.top + this.height / 2))) * (180 / Math.PI);

        return {
            tiltX: tiltX,
            tiltY: tiltY,
            percentageX: x * 100,
            percentageY: y * 100,
            angle: angle
        };
    }

    updateElementPosition() {
        let rect = this.element.getBoundingClientRect();
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        this.left = rect.left;
        this.top = rect.top;
    }

    update() {
        let values = this.getValues();

        this.element.style.transform = "perspective(" + this.settings.perspective + "px) " +
            "rotateX(" + (this.settings.axis === "x" ? 0 : values.tiltY) + "deg) " +
            "rotateY(" + (this.settings.axis === "y" ? 0 : values.tiltX) + "deg) " +
            "scale3d(" + this.settings.scale + ", " + this.settings.scale + ", " + this.settings.scale + ")";

        if (this.glare) {
            this.glareElement.style.transform = `rotate(${values.angle}deg) translate(-50%, -50%)`;
            this.glareElement.style.opacity = `${values.percentageY * this.settings["max-glare"] / 100}`;
        }

        this.element.dispatchEvent(new CustomEvent("tiltChange", {
            "detail": values
        }));

        this.updateCall = null;
    }

    setTransition() {
        clearTimeout(this.transitionTimeout);
        this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;
        if (this.glare) this.glareElement.style.transition = `opacity ${this.settings.speed}ms ${this.settings.easing}`;

        this.transitionTimeout = setTimeout(() => {
            this.element.style.transition = "";
            if (this.glare) this.glareElement.style.transition = "";
        }, this.settings.speed);
    }
}
