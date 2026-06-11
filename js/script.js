"use strict";

/* ============================================================
   NAV — comportamento ao rolar
   ============================================================ */
(function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 60);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   MENU MOBILE
   ============================================================ */
(function initMobileMenu() {
  const btn = document.getElementById("hamburger");
  const menu = document.getElementById("mobileMenu");
  const close = document.getElementById("mobileClose");
  if (!btn || !menu) return;

  const toggle = (open) => {
    btn.classList.toggle("open", open);
    menu.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  btn.addEventListener("click", () => toggle(true));
  close?.addEventListener("click", () => toggle(false));

  menu
    .querySelectorAll(".mobile-link")
    .forEach((link) => link.addEventListener("click", () => toggle(false)));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) toggle(false);
  });
})();

/* ============================================================
   CONTADOR DE TEMPO JUNTOS
   ============================================================ */
(function initContador() {
  const el = document.getElementById("contador");
  if (!el) return;

  const inicio = new Date("2025-03-10T00:00:00");

  const update = () => {
    const diff = Date.now() - inicio.getTime();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${d}d · ${h}h ${m}m ${s}s`;
  };

  update();
  setInterval(update, 1000);
})();

/* ============================================================
   ANIMAÇÕES DE SCROLL (Intersection Observer)
   ============================================================ */
(function initReveal() {
  const items = document.querySelectorAll(
    ".reveal-up, .reveal-left, .reveal-right",
  );
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -28px 0px" },
  );

  items.forEach((el) => observer.observe(el));
})();

/* ============================================================
   CORAÇÕES DA TIMELINE
   ============================================================ */
(function initHearts() {
  document.querySelectorAll(".js-heart").forEach((btn, index) => {
    const key = `heart-v2-${index}`;
    const countEl = btn.querySelector(".tl__heart-count");

    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const { liked, count } = JSON.parse(saved);
        if (liked) btn.classList.add("liked");
        if (countEl) countEl.textContent = count;
      }
    } catch (_) {}

    btn.addEventListener("click", () => {
      const liked = btn.classList.toggle("liked");
      const n = parseInt(countEl?.textContent || "0", 10);
      const newCount = liked ? n + 1 : n - 1;
      if (countEl) countEl.textContent = newCount;

      try {
        sessionStorage.setItem(key, JSON.stringify({ liked, count: newCount }));
      } catch (_) {}

      btn.style.transform = "scale(1.2)";
      setTimeout(() => {
        btn.style.transform = "";
      }, 200);
      showToast(liked ? "❤ Guardado com carinho" : "Removido");
    });
  });
})();

/* ============================================================
   RESERVE — seleção de plano + EmailJS + Google Calendar
   ============================================================ */
(function initReserve() {
  const btn = document.getElementById("reserveBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const selected = document.querySelector(".reserve__radio:checked");
    if (!selected) {
      showToast("Escolha um momento primeiro ✦");
      return;
    }

    const nomeVal = document.getElementById("reserveNome")?.value.trim();
    const dataVal = document.getElementById("reserveData")?.value;
    const msgVal = document.getElementById("reserveMensagem")?.value.trim();

    if (!nomeVal) {
      showToast("Informe seu nome ✦");
      return;
    }
    if (!dataVal) {
      showToast("Escolha uma data e hora ✦");
      return;
    }
    if (new Date(dataVal) < new Date()) {
      showToast("Escolha uma data futura ✦");
      return;
    }

    const plano =
      selected.closest(".reserve__opt")?.querySelector(".reserve__opt-name")
        ?.textContent ?? "Momento especial";

    const dataFormatada = new Date(dataVal).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    btn.disabled = true;
    btn.textContent = "Enviando...";

    if (typeof emailjs !== "undefined") {
      emailjs
        .send("service_xcooozd", "template_fr4fwsc", {
          plano,
          nome: nomeVal,
          data: dataFormatada,
          mensagem: msgVal || "—",
        })
        .catch(() => {})
        .finally(() => {
          showToast(`"${plano}" reservado com amor 💜`);
          resetBtn();
        });
    } else {
      showToast(`"${plano}" reservado com amor 💜`);
      resetBtn();
    }

    // Google Calendar
    const dataEvento = new Date(dataVal);
    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
      `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `❤ ${plano}`,
      dates: `${fmt(dataEvento)}/${fmt(new Date(dataEvento.getTime() + 3600000))}`,
      details: msgVal
        ? `Reservado por ${nomeVal}\n\n"${msgVal}"`
        : `Reservado por ${nomeVal}`,
    });

    window.open(
      `https://calendar.google.com/calendar/render?${params.toString()}`,
      "_blank",
    );

    function resetBtn() {
      btn.disabled = false;
      btn.innerHTML = `Reservar esse momento <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
  });
})();

/* ============================================================
   SCROLL SUAVE
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer;

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.textContent = msg;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ============================================================
   CARTA — ENVELOPE INTERATIVO
/* ============================================================
   CARTA MODAL
   ============================================================ */

(function initEnvelopeModal() {
  const envelope = document.getElementById("envelope");
  const cartaModal = document.getElementById("cartaModal");
  const cartaClose = document.getElementById("cartaClose");
  const cartaBackdrop = document.getElementById("cartaBackdrop");

  if (!envelope || !cartaModal) return;

  function abrirCarta() {
    cartaModal.classList.add("open");
    cartaModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function fecharCarta() {
    cartaModal.classList.remove("open");
    cartaModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  envelope.addEventListener("click", abrirCarta);

  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirCarta();
    }
  });

  cartaClose?.addEventListener("click", fecharCarta);

  cartaBackdrop?.addEventListener("click", fecharCarta);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      fecharCarta();
    }
  });
})();
/* ============================================================
   MAPA — FILTRO DE CATEGORIAS
   ============================================================ */
(function initMapaFiltros() {
  const btns = document.querySelectorAll(".mapa-filtro");
  const cards = document.querySelectorAll(".lugar-card");
  const empty = document.getElementById("mapaEmpty");
  if (!btns.length) return;

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Atualiza botão ativo
      btns.forEach((b) => b.classList.remove("mapa-filtro--active"));
      btn.classList.add("mapa-filtro--active");

      const cat = btn.dataset.cat;
      let visible = 0;

      cards.forEach((card) => {
        const match = cat === "todos" || card.dataset.cat === cat;
        card.classList.toggle("hidden", !match);
        if (match) visible++;
      });

      if (empty) empty.style.display = visible === 0 ? "block" : "none";
    });
  });
})();

/* ============================================================
   MÚSICA DE FUNDO + VÍDEO COM SOM
   ============================================================ */
(function initMediaControls() {
  const audio = document.getElementById("bgMusic");
  const toggleBtn = document.getElementById("musicToggle");
  const musicLabel = document.getElementById("musicLabel");
  const video = document.getElementById("loveVideo");
  const playOverlay = document.getElementById("videoPlayOverlay");
  const playBtn = document.getElementById("videoPlayBtn");

  if (!audio || !toggleBtn) return;

  let musicStarted = false;
  let userMuted = false;
  let pausedByVideo = false;
  let videoPlaying = false;

  function updateToggleBtn() {
    if (userMuted || !musicStarted) {
      toggleBtn.classList.remove("playing");
      toggleBtn.classList.add("muted");
      if (musicLabel) musicLabel.textContent = "♪";
      toggleBtn.title = "Clique para tocar a música";
    } else {
      toggleBtn.classList.add("playing");
      toggleBtn.classList.remove("muted");
      if (musicLabel) musicLabel.textContent = "♫";
      toggleBtn.title = "Clique para pausar a música";
    }
  }

  function startMusic() {
    if (musicStarted || userMuted) return;
    audio.volume = 0.5;
    audio
      .play()
      .then(() => {
        musicStarted = true;
        updateToggleBtn();
      })
      .catch(() => {});
  }

  const onFirstInteraction = () => {
    startMusic();
    if (musicStarted) {
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction);
    }
  };

  document.addEventListener("click", onFirstInteraction, { passive: true });
  document.addEventListener("touchstart", onFirstInteraction, {
    passive: true,
  });

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!musicStarted) {
      userMuted = false;
      audio.volume = 0.5;
      audio
        .play()
        .then(() => {
          musicStarted = true;
          updateToggleBtn();
        })
        .catch(() => showToast("Ative o som do navegador ♪"));
      return;
    }

    userMuted = !userMuted;

    if (userMuted) {
      audio.pause();
    } else {
      if (!videoPlaying) audio.play().catch(() => {});
      pausedByVideo = false;
    }

    updateToggleBtn();
  });

  // Controle do vídeo
  if (video) {
    function startVideoWithSound() {
      if (!audio.paused) {
        audio.pause();
        pausedByVideo = true;
      }
      video.muted = false;
      video.volume = 1.0;
      video
        .play()
        .then(() => {
          videoPlaying = true;
          if (playOverlay) playOverlay.classList.add("hidden");
        })
        .catch(() => {
          video.muted = true;
          video.play().then(() => {
            videoPlaying = true;
            if (playOverlay) playOverlay.classList.add("hidden");
            showToast("Ative o som do navegador para ouvir 🔊");
          });
        });
    }

    function pauseVideo() {
      video.pause();
      videoPlaying = false;
      if (playOverlay) playOverlay.classList.remove("hidden");
      if (pausedByVideo && !userMuted && musicStarted) {
        audio.play().catch(() => {});
        pausedByVideo = false;
      }
    }

    playBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      startVideoWithSound();
    });

    const videoWrap = document.getElementById("videoWrap");
    videoWrap?.addEventListener("click", () => {
      if (!videoPlaying) startVideoWithSound();
      else pauseVideo();
    });

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && videoPlaying) pauseVideo();
        });
      },
      { threshold: 0.2 },
    );

    videoObserver.observe(video);

    video.addEventListener("ended", () => {
      videoPlaying = false;
      if (playOverlay) playOverlay.classList.remove("hidden");
      if (pausedByVideo && !userMuted && musicStarted) {
        audio.play().catch(() => {});
        pausedByVideo = false;
      }
    });
  }

  updateToggleBtn();
})();
