'use strict';

/* ============================================================
   NAV — comportamento ao rolar
   ============================================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ============================================================
   MENU MOBILE
   ============================================================ */
(function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  const toggle = (open) => {
    btn.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', () => toggle(!menu.classList.contains('open')));

  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) toggle(false);
  });
})();


/* ============================================================
   CONTADOR DE TEMPO JUNTOS
   ============================================================ */
(function initContador() {
  const el = document.getElementById('contador');
  if (!el) return;

  const inicio = new Date('2025-03-10T00:00:00');

  const update = () => {
    const diff  = Date.now() - inicio.getTime();
    const dias  = Math.floor(diff / 86400000);
    const horas = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const segs  = Math.floor((diff % 60000) / 1000);
    el.textContent = `${dias}d · ${horas}h ${mins}m ${segs}s`;
  };

  update();
  setInterval(update, 1000);
})();


/* ============================================================
   ANIMAÇÕES DE SCROLL (Intersection Observer)
   ============================================================ */
(function initReveal() {
  const items = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  items.forEach(el => observer.observe(el));
})();


/* ============================================================
   CONTADOR ANIMADO (stats da seção Sobre)
   ============================================================ */
(function initCountUp() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el  = entry.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = 1600;
      const t0  = performance.now();

      const step = (now) => {
        const p     = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * end);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = end;
      };

      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
})();


/* ============================================================
   CORAÇÕES DA TIMELINE
   ============================================================ */
(function initHearts() {
  document.querySelectorAll('.js-heart').forEach((btn, index) => {
    const key     = `heart-${index}`;
    const countEl = btn.querySelector('.timeline__heart-count');

    const saved = sessionStorage.getItem(key);
    if (saved) {
      const { liked, count } = JSON.parse(saved);
      if (liked) btn.classList.add('liked');
      if (countEl) countEl.textContent = count;
    }

    btn.addEventListener('click', () => {
      const liked    = btn.classList.toggle('liked');
      const n        = parseInt(countEl?.textContent || '0', 10);
      const newCount = liked ? n + 1 : n - 1;

      if (countEl) countEl.textContent = newCount;
      sessionStorage.setItem(key, JSON.stringify({ liked, count: newCount }));

      btn.style.transform = 'scale(1.18)';
      setTimeout(() => { btn.style.transform = ''; }, 200);

      showToast(liked ? '❤ Guardado com carinho' : 'Removido dos favoritos');
    });
  });
})();


/* ============================================================
   RESERVE — seleção de plano + EmailJS + Google Calendar
   ============================================================ */
(function initReserve() {
  const btn = document.getElementById('reserveBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const selected = document.querySelector('.reserve__radio:checked');
    if (!selected) { showToast('Escolha um momento primeiro ✦'); return; }

    const nomeVal = document.getElementById('reserveNome')?.value.trim();
    const dataVal = document.getElementById('reserveData')?.value;
    const msgVal  = document.getElementById('reserveMensagem')?.value.trim();

    if (!nomeVal) { showToast('Informe seu nome ✦'); return; }
    if (!dataVal) { showToast('Escolha uma data e hora ✦'); return; }
    if (new Date(dataVal) < new Date()) { showToast('Escolha uma data futura ✦'); return; }

    const plano = selected.closest('.reserve__opcao')
                          .querySelector('.reserve__opcao-nome')
                          .textContent;

    const dataFormatada = new Date(dataVal).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    emailjs.send("service_xcooozd", "template_fr4fwsc", {
      plano, nome: nomeVal, data: dataFormatada, mensagem: msgVal || '—'
    })
    .then(() => showToast(`"${plano}" reservado com amor 💜`))
    .catch(() => showToast(`"${plano}" reservado com amor 💜`))
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = `Reservar esse momento <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    });

    const dataEvento = new Date(dataVal);
    const pad  = (n) => String(n).padStart(2, '0');
    const fmt  = (d) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}` +
      `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text:   `💜 ${plano}`,
      dates:  `${fmt(dataEvento)}/${fmt(new Date(dataEvento.getTime() + 3600000))}`,
      details: msgVal ? `Reservado por ${nomeVal} 💜\n\n"${msgVal}"` : `Reservado por ${nomeVal} 💜`
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  });
})();


/* ============================================================
   SCROLL SUAVE
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


/* ============================================================
   TOAST
   ============================================================ */
let toastTimer;

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}


/* ============================================================
   MÚSICA DE FUNDO + VÍDEO COM SOM
   ============================================================

   COMO FUNCIONA:
   - Navegadores bloqueiam autoplay de áudio sem interação do usuário
   - Na PRIMEIRA interação (clique em qualquer lugar), a música começa
   - O botão ♪ no canto inferior direito liga/desliga a música
   - Quando o vídeo entra na tela → música pausa, vídeo toca com SOM
   - Quando o vídeo sai da tela → vídeo pausa, música volta
   - O vídeo tem um botão de play próprio para iniciar com som
   ============================================================ */
(function initMediaControls() {

  const audio       = document.getElementById('bgMusic');
  const toggleBtn   = document.getElementById('musicToggle');
  const video       = document.getElementById('loveVideo');
  const playOverlay = document.getElementById('videoPlayOverlay');
  const playBtn     = document.getElementById('videoPlayBtn');

  if (!audio || !toggleBtn) return;

  // Estado
  let musicStarted  = false;   // música já foi iniciada alguma vez?
  let userMuted     = false;   // usuário desligou manualmente?
  let pausedByVideo = false;   // música foi pausada pelo vídeo?
  let videoPlaying  = false;   // vídeo está tocando?

  /* ── Atualiza visual do botão ── */
  function updateToggleBtn() {
    const label = toggleBtn.querySelector('.music-label');
    if (userMuted || !musicStarted) {
      toggleBtn.classList.remove('playing');
      toggleBtn.classList.add('muted');
      if (label) label.textContent = '♪';
      toggleBtn.title = 'Clique para tocar a música';
    } else {
      toggleBtn.classList.add('playing');
      toggleBtn.classList.remove('muted');
      if (label) label.textContent = '♫';
      toggleBtn.title = 'Clique para pausar a música';
    }
  }

  /* ── Inicia a música (chamado na 1ª interação) ── */
  function startMusic() {
    if (musicStarted || userMuted) return;
    audio.volume = 0.55;
    audio.play()
      .then(() => {
        musicStarted = true;
        updateToggleBtn();
      })
      .catch(() => {
        // Navegador ainda bloqueou — tenta de novo no próximo clique
      });
  }

  /* ── Primeira interação do usuário → inicia música ── */
  const onFirstInteraction = () => {
    startMusic();
    // Remove listeners após primeiro disparo bem-sucedido
    if (musicStarted) {
      document.removeEventListener('click',      onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
      document.removeEventListener('keydown',    onFirstInteraction);
    }
  };

  document.addEventListener('click',      onFirstInteraction, { passive: true });
  document.addEventListener('touchstart', onFirstInteraction, { passive: true });
  document.addEventListener('keydown',    onFirstInteraction, { passive: true });

  /* ── Botão de controle da música ── */
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Não dispara onFirstInteraction

    if (!musicStarted && !userMuted) {
      // Primeira vez clicando no botão — inicia
      userMuted = false;
      audio.volume = 0.55;
      audio.play()
        .then(() => { musicStarted = true; updateToggleBtn(); })
        .catch(() => showToast('Ative o som do navegador ♪'));
      return;
    }

    userMuted = !userMuted;

    if (userMuted) {
      audio.pause();
    } else {
      if (!videoPlaying) {
        audio.play().catch(() => {});
      }
      pausedByVideo = false;
    }

    updateToggleBtn();
  });

  /* ── Controle do vídeo ── */
  if (video) {

    /* Botão de play do vídeo */
    if (playBtn && playOverlay) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startVideoWithSound();
      });

      // Clique no container também inicia o vídeo
      const videoWrap = document.getElementById('videoWrap');
      if (videoWrap) {
        videoWrap.addEventListener('click', () => {
          if (!videoPlaying) startVideoWithSound();
          else pauseVideo();
        });
      }
    }

    function startVideoWithSound() {
      // Pausa a música
      if (!audio.paused) {
        audio.pause();
        pausedByVideo = true;
      }

      // Toca o vídeo COM SOM
      video.muted = false;
      video.volume = 1.0;
      video.play()
        .then(() => {
          videoPlaying = true;
          if (playOverlay) playOverlay.classList.add('hidden');
        })
        .catch(() => {
          // Fallback: toca mutado se o navegador bloquear
          video.muted = true;
          video.play().then(() => {
            videoPlaying = true;
            if (playOverlay) playOverlay.classList.add('hidden');
            showToast('Ative o som do navegador para ouvir o vídeo 🔊');
          });
        });
    }

    function pauseVideo() {
      video.pause();
      videoPlaying = false;
      if (playOverlay) playOverlay.classList.remove('hidden');

      // Retoma a música se estava pausada pelo vídeo
      if (pausedByVideo && !userMuted && musicStarted) {
        audio.play().catch(() => {});
        pausedByVideo = false;
      }
    }

    /* Quando o vídeo sai da viewport → pausa o vídeo e retoma música */
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && videoPlaying) {
          pauseVideo();
        }
      });
    }, { threshold: 0.2 });

    videoObserver.observe(video);

    /* Quando o vídeo termina → retoma música */
    video.addEventListener('ended', () => {
      videoPlaying = false;
      if (playOverlay) playOverlay.classList.remove('hidden');
      if (pausedByVideo && !userMuted && musicStarted) {
        audio.play().catch(() => {});
        pausedByVideo = false;
      }
    });
  }

  /* Estado inicial do botão */
  updateToggleBtn();

})();

document.addEventListener('click', onFirstInteraction);

