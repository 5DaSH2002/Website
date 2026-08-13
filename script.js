// Interactive Cyber Grid Background Canvas
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const numberOfParticles = 75;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Mouse Interaction
const mouse = {
    x: null,
    y: null,
    radius: 150
};

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                let opacity = 1 - (distance / 120);
                ctx.strokeStyle = `rgba(0, 255, 204, ${opacity * 0.25})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animateCanvas);
}

initParticles();
animateCanvas();

// Chains connecting each of the 3 atom electrons to a mask
(function () {
    const svgNS = 'http://www.w3.org/2000/svg';
    const LINKS_PER_CHAIN = 10;

    // Electron positions in the atom's own 0-100 viewBox (matches the SVG markup)
    const ELECTRONS = [
        { x: 29, y: 86.37 },
        { x: 71, y: 86.37 },
        { x: 92, y: 50 }
    ];

    function ensureDefs(svg) {
        const defs = document.createElementNS(svgNS, 'defs');
        const grad = document.createElementNS(svgNS, 'linearGradient');
        grad.setAttribute('id', 'chainGradient');
        grad.setAttribute('x1', '0%');
        grad.setAttribute('y1', '0%');
        grad.setAttribute('x2', '100%');
        grad.setAttribute('y2', '100%');
        const stops = [
            { offset: '0%', color: '#eafff2' },
            { offset: '45%', color: '#00ff66' },
            { offset: '100%', color: '#0a4d29' }
        ];
        stops.forEach(s => {
            const stop = document.createElementNS(svgNS, 'stop');
            stop.setAttribute('offset', s.offset);
            stop.setAttribute('stop-color', s.color);
            grad.appendChild(stop);
        });
        defs.appendChild(grad);
        svg.appendChild(defs);
    }

    function buildChains() {
        const scene = document.querySelector('.hacker-scene');
        const atom = document.querySelector('.atom-wrap');
        const svg = document.getElementById('chainsSvg');
        if (!scene || !atom || !svg) return;

        const sceneRect = scene.getBoundingClientRect();
        svg.setAttribute('width', sceneRect.width);
        svg.setAttribute('height', sceneRect.height);
        svg.innerHTML = '';
        ensureDefs(svg);

        const atomRect = atom.getBoundingClientRect();

        // Sort masks left-to-right and electrons left-to-right so each electron feeds the nearest mask
        const targets = [
            document.querySelector('.hacker-mask-container.left-mask'),
            document.querySelector('.hacker-mask-container.center-mask'),
            document.querySelector('.hacker-mask-container.right-mask')
        ];
        const electronsSorted = [...ELECTRONS].sort((a, b) => a.x - b.x);

        targets.forEach((maskEl, chainIndex) => {
            if (!maskEl) return;
            const e = electronsSorted[chainIndex];
            const startX = atomRect.left + (e.x / 100) * atomRect.width - sceneRect.left;
            const startY = atomRect.top + (e.y / 100) * atomRect.height - sceneRect.top;

            const r = maskEl.getBoundingClientRect();
            const mx = r.left + r.width / 2 - sceneRect.left;
            const my = r.top - sceneRect.top + 6;
            const midY = (startY + my) / 2;

            const d = `M ${startX} ${startY} C ${startX} ${midY}, ${mx} ${midY}, ${mx} ${my}`;

            // Thin guide line (the chain's inner cable)
            const line = document.createElementNS(svgNS, 'path');
            line.setAttribute('class', 'chain-line');
            line.setAttribute('id', `chainPath${chainIndex}`);
            line.setAttribute('d', d);
            svg.appendChild(line);

            const len = line.getTotalLength();

            // Interlocking oval links following the path's direction
            for (let i = 1; i <= LINKS_PER_CHAIN; i++) {
                const dist = (len / (LINKS_PER_CHAIN + 1)) * i;
                const pt = line.getPointAtLength(dist);
                const ptNext = line.getPointAtLength(Math.min(len, dist + 1));
                const angle = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x) * (180 / Math.PI);
                const alternate = i % 2 === 0 ? 90 : 0;

                const link = document.createElementNS(svgNS, 'ellipse');
                link.setAttribute('class', 'chain-link');
                link.setAttribute('cx', pt.x);
                link.setAttribute('cy', pt.y);
                link.setAttribute('rx', 3.6);
                link.setAttribute('ry', 2.1);
                link.setAttribute('transform', `rotate(${angle + alternate} ${pt.x} ${pt.y})`);
                svg.appendChild(link);

                const delay = chainIndex * 200 + i * 70;
                setTimeout(() => link.classList.add('show'), delay);
            }

            // Spark where the chain first meets the mask
            const spark = document.createElementNS(svgNS, 'circle');
            spark.setAttribute('class', 'chain-spark');
            spark.setAttribute('cx', mx);
            spark.setAttribute('cy', my);
            spark.setAttribute('r', 2);
            svg.appendChild(spark);
            const sparkDelay = chainIndex * 200 + (LINKS_PER_CHAIN + 1) * 70;
            setTimeout(() => spark.classList.add('show'), sparkDelay);

            // Continuous traveling pulse: radiance flowing from the electron down to the mask
            const pulse = document.createElementNS(svgNS, 'circle');
            pulse.setAttribute('class', 'chain-pulse');
            pulse.setAttribute('r', 2.6);
            const motion = document.createElementNS(svgNS, 'animateMotion');
            motion.setAttribute('dur', '2.1s');
            motion.setAttribute('repeatCount', 'indefinite');
            motion.setAttribute('begin', `${(sparkDelay / 1000 + 0.3).toFixed(2)}s`);
            motion.setAttribute('path', d);
            pulse.appendChild(motion);
            svg.appendChild(pulse);
            setTimeout(() => pulse.classList.add('active'), sparkDelay);
        });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildChains, 200);
    });

    window.addEventListener('load', () => {
        setTimeout(buildChains, 150);
    });
})();

// Matrix Rain "Draw-In" Effect for the Hacker Masks (center + two flanking masks)
function runMaskMatrix(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    // Same outline as the SVG mask, used here to clip the falling code to the mask silhouette
    const maskPath = new Path2D('M20,35 C20,15 35,8 50,8 C65,8 80,15 80,35 C80,55 70,75 50,85 C30,75 20,55 20,35 Z');

    const chars = '01アイウエオカキクケコサシスセソ';
    const fontSize = Math.max(5, size / 13);
    const columns = Math.floor(size / fontSize);
    const drops = Array(columns).fill(0).map(() => Math.random() * -size / fontSize);

    let frame = 0;
    const maxFrames = 46; // ~1.5s pacing via requestAnimationFrame

    function drawFrame() {
        ctx.save();
        ctx.clearRect(0, 0, size, size);
        ctx.clip(maskPath, 'nonzero');

        // Trail fade
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, size, size);

        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            ctx.fillStyle = Math.random() > 0.92 ? '#c8ffe0' : '#00ff66';
            ctx.fillText(char, x, y);
            drops[i] += 0.9;
            if (y > size && Math.random() > 0.95) {
                drops[i] = 0;
            }
        }
        ctx.restore();

        frame++;
        if (frame < maxFrames) {
            requestAnimationFrame(drawFrame);
        } else {
            canvas.classList.add('fade-out');
        }
    }

    requestAnimationFrame(drawFrame);
}

document.addEventListener('DOMContentLoaded', () => {
    ['maskMatrixLeft', 'maskMatrixCenter', 'maskMatrixRight'].forEach(runMaskMatrix);
});

// Typewriter Effect for "IC0NIC"
const word = "IC0NIC";
let charIndex = 0;
let isDeleting = false;
const typewriterElement = document.getElementById("typewriter");

function typeEffect() {
    if (isDeleting) {
        typewriterElement.textContent = word.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterElement.textContent = word.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 80 : 130;

    if (!isDeleting && charIndex === word.length) {
        typeSpeed = 2200;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        typeSpeed = 500;
    }

    setTimeout(typeEffect, typeSpeed);
}

document.addEventListener("DOMContentLoaded", () => setTimeout(typeEffect, 800));

// Enhanced Web Audio API Sound Trigger (Cyber Tech Sound Effect)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTechClickSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

document.querySelectorAll('.click-sound').forEach(element => {
    element.addEventListener('click', playTechClickSound);
});

