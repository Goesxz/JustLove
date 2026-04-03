'use strict';

/* ============================================================
   FUNÇÃO DE ENTRADA (COM ÁUDIO + TRANSIÇÃO)
   ============================================================ */
function enter() {
  const curtain = document.getElementById('curtain');

  // 🔊 ajuste o nome do arquivo aqui
  const audio = new Audio('assets/audio/cheiro de mar.mpeg');

  audio.volume = 0.6;
  audio.play().catch(() => {
    console.log('Autoplay bloqueado');
  });

  if (curtain) {
    curtain.style.pointerEvents = 'all';
    curtain.classList.add('closing');
  }

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1200);
}

/* Botão de entrada */
(function initEnterBtn() {
  const btn = document.getElementById('enterBtn');
  if (!btn) return;
  btn.addEventListener('click', enter);
})();

/* Tecla Enter ou Espaço também acionam */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    enter();
  }
});


/* ============================================================
   CONTADOR DE TEMPO JUNTOS
   ============================================================ */
(function initContador() {
  const el = document.getElementById('contador');
  if (!el) return;

  const inicio = new Date('2026-03-10T00:00:00');

  const tick = () => {
    const diff  = Date.now() - inicio.getTime();
    const dias  = Math.floor(diff / 86400000);
    const horas = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const segs  = Math.floor((diff % 60000) / 1000);

    el.textContent = `${dias}d · ${horas}h ${mins}m ${segs}s`;
  };

  tick();
  setInterval(tick, 1000);
})();


/* ============================================================
   PARTÍCULAS FLUTUANTES (Canvas)
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const COLORS = [
    'rgba(192,175,232,',
    'rgba(216,206,245,',
    'rgba(149,129,201,',
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x:       Math.random() * W,
      y:       Math.random() * H,
      r:       Math.random() * 1.8 + 0.3,
      vx:      (Math.random() - 0.5) * 0.25,
      vy:      -(Math.random() * 0.4 + 0.1),
      alpha:   Math.random() * 0.6 + 0.1,
      da:      (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      life:    0,
      maxLife: Math.random() * 200 + 100,
    };
  }

  function init() {
    particles = Array.from({ length: 90 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.x     += p.vx;
      p.y     += p.vy;
      p.alpha += p.da;
      p.life++;

      if (p.alpha <= 0 || p.alpha >= 0.7) p.da *= -1;

      if (p.y < -10 || p.life > p.maxLife) {
        particles[i] = createParticle();
        particles[i].y = H + 5;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.max(0, Math.min(1, p.alpha)) + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });

  resize();
  init();
  draw();
})();