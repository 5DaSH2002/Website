// ============================================================
//  IC0NIC Portfolio — VIP interactions
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============ Interactive Cyber Grid Background Canvas ============
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
        // A few particles glow gold for the VIP accent
        this.gold = Math.random() > 0.82;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Gentle repulsion from the cursor
        if (mouse.x !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius && dist > 0) {
                const force = (mouse.radius - dist) / mouse.radius;
                this.x += (dx / dist) * force * 1.2;
                this.y += (dy / dist) * force * 1.2;
            }
        }
    }

    draw() {
        ctx.fillStyle = this.gold ? '#ffd54a' : '#00ffcc';
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
                const goldLink = particlesArray[a].gold || particlesArray[b].gold;
                ctx.strokeStyle = goldLink
                    ? `rgba(255, 213, 74, ${opacity * 0.22})`
                    : `rgba(0, 255, 204, ${opacity * 0.25})`;
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

// ============ Matrix Rain "Draw-In" Effect for the Hacker Masks ============
function runMaskMatrix(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    const maskPath = new Path2D('M20,35 C20,15 35,8 50,8 C65,8 80,15 80,35 C80,55 70,75 50,85 C30,75 20,55 20,35 Z');

    const chars = '01アイウエオカキクケコサシスセソ';
    const fontSize = Math.max(5, size / 13);
    const columns = Math.floor(size / fontSize);
    const drops = Array(columns).fill(0).map(() => Math.random() * -size / fontSize);

    let frame = 0;
    const maxFrames = 46;

    function drawFrame() {
        ctx.save();
        ctx.clearRect(0, 0, size, size);
        ctx.clip(maskPath, 'nonzero');

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

// ============ Typewriter Effect for "IC0NIC" ============
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

// ============================================================
//  VIP AUDIO ENGINE — Web Audio, click + hover + ambient
// ============================================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = false;         // hover + ambient (opt-in via toggle)
let ambientNodes = null;

function resumeAudio() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

// Cyber click (always plays on click — user gesture)
function playTechClickSound() {
    resumeAudio();
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

// Subtle hover blip (only when sound enabled)
function playHoverSound() {
    if (!soundEnabled) return;
    resumeAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Ambient cyber drone (two detuned oscillators + slow LFO)
function startAmbient() {
    if (ambientNodes) return;
    resumeAudio();
    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.045, audioCtx.currentTime + 2);
    master.connect(audioCtx.destination);

    const oscA = audioCtx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = 110;
    const oscB = audioCtx.createOscillator();
    oscB.type = 'sine';
    oscB.frequency.value = 110.6; // slight detune -> shimmer

    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);

    oscA.connect(master);
    oscB.connect(master);
    oscA.start();
    oscB.start();
    lfo.start();

    ambientNodes = { master, oscA, oscB, lfo };
}

function stopAmbient() {
    if (!ambientNodes) return;
    const { master, oscA, oscB, lfo } = ambientNodes;
    master.gain.cancelScheduledValues(audioCtx.currentTime);
    master.gain.setValueAtTime(master.gain.value, audioCtx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
    setTimeout(() => {
        try { oscA.stop(); oscB.stop(); lfo.stop(); } catch (e) {}
    }, 1100);
    ambientNodes = null;
}

// Click sounds (always on)
document.querySelectorAll('.click-sound').forEach(el => {
    el.addEventListener('click', playTechClickSound);
});

// Hover sounds (gated by toggle)
document.querySelectorAll('.hover-sound').forEach(el => {
    el.addEventListener('mouseenter', playHoverSound);
});

// Sound toggle button
const soundToggle = document.getElementById('soundToggle');
soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    resumeAudio();
    const icon = soundToggle.querySelector('i');
    if (soundEnabled) {
        soundToggle.classList.add('on');
        icon.className = 'fas fa-volume-high';
        startAmbient();
    } else {
        soundToggle.classList.remove('on');
        icon.className = 'fas fa-volume-xmark';
        stopAmbient();
    }
});

// ============================================================
//  CURSOR SPOTLIGHT
// ============================================================
const spotlight = document.getElementById('spotlight');
let spotX = window.innerWidth / 2;
let spotY = window.innerHeight / 2;
let curX = spotX;
let curY = spotY;

if (!prefersReducedMotion) {
    window.addEventListener('mousemove', (e) => {
        spotX = e.clientX;
        spotY = e.clientY;
        spotlight.classList.add('active');
    });

    function moveSpot() {
        curX += (spotX - curX) * 0.12;
        curY += (spotY - curY) * 0.12;
        spotlight.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
        requestAnimationFrame(moveSpot);
    }
    moveSpot();
}

// ============================================================
//  SCROLL PROGRESS BAR
// ============================================================
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    scrollProgress.style.width = `${Math.min(100, scrolled * 100)}%`;
}, { passive: true });

// ============================================================
//  SCROLL REVEAL + SKILL BARS (IntersectionObserver)
// ============================================================
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.revealDelay || '0', 10);
            setTimeout(() => entry.target.classList.add('in-view'), delay);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ============================================================
//  3D TILT CARDS
// ============================================================
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt-card').forEach(card => {
        const MAX = 10; // deg
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rx = (0.5 - py) * MAX * 2;
            const ry = (px - 0.5) * MAX * 2;
            card.style.transform =
                `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
            const glare = card.querySelector('.tilt-glare');
            if (glare) {
                glare.style.setProperty('--gx', `${px * 100}%`);
                glare.style.setProperty('--gy', `${py * 100}%`);
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform =
                'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// ============================================================
//  ACTIVE NAV HIGHLIGHT
// ============================================================
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { threshold: 0.5 });

sections.forEach(s => navObserver.observe(s));

// ============================================================
//  CINEMATIC PRELOADER
// ============================================================
(function () {
    const preloader = document.getElementById('preloader');
    const bar = document.getElementById('preloaderBar');
    const percentEl = document.getElementById('preloaderPercent');
    const bootEl = document.getElementById('preloaderBoot');
    if (!preloader) return;

    const bootMessages = [
        'INITIALIZING SYSTEM',
        'LOADING NEURAL GRID',
        'DECRYPTING MASKS',
        'ESTABLISHING LINK',
        'ACCESS GRANTED'
    ];

    let progress = 0;
    let msgIndex = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 12 + 4;
        if (progress > 100) progress = 100;
        bar.style.width = progress + '%';
        percentEl.textContent = Math.floor(progress);

        const nextMsg = Math.min(bootMessages.length - 1, Math.floor(progress / 25));
        if (nextMsg !== msgIndex) {
            msgIndex = nextMsg;
            bootEl.textContent = bootMessages[msgIndex];
        }

        if (progress >= 100) {
            clearInterval(interval);
            bootEl.textContent = bootMessages[bootMessages.length - 1];
            setTimeout(() => {
                preloader.classList.add('done');
                // Kick off the first reveal check after preloader hides
                document.querySelectorAll('#home .reveal').forEach(el => {
                    if (el.getBoundingClientRect().top < window.innerHeight) {
                        const delay = parseInt(el.dataset.revealDelay || '0', 10);
                        setTimeout(() => el.classList.add('in-view'), delay);
                    }
                });
            }, 500);
        }
    }, 200);
})();
