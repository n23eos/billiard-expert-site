'use strict';

(() => {
  const video = document.querySelector('#hero-film');
  const button = document.querySelector('#hero-motion-toggle');
  const status = document.querySelector('#hero-motion-status');
  if (!video || !button || !status) return;

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let visible = false;
  let playing = false;
  let pending = false;
  let manuallyPaused = false;
  let explicitMotion = false;
  let playbackFailed = false;
  let intent = 0;

  function usesDataSaving() {
    return Boolean(connection && connection.saveData);
  }

  function updateControl(isPlaying) {
    playing = isPlaying;
    video.classList[isPlaying ? 'add' : 'remove']('is-playing');
    button.textContent = isPlaying ? 'Пауза' : 'Смотреть в движении';
    button.setAttribute('aria-pressed', String(isPlaying));
    button.setAttribute(
      'aria-label',
      isPlaying ? 'Приостановить видео' : 'Воспроизвести видео'
    );
  }

  function autoplayAllowed() {
    return !preference.matches && !usesDataSaving();
  }

  function shouldPlay() {
    return visible
      && !document.hidden
      && !manuallyPaused
      && !playbackFailed
      && (explicitMotion || autoplayAllowed());
  }

  function pause({ manual = false } = {}) {
    intent += 1;
    pending = false;
    if (manual) {
      manuallyPaused = true;
      explicitMotion = false;
    }
    video.pause();
    updateControl(false);
  }

  function failPlayback() {
    playbackFailed = true;
    explicitMotion = false;
    pause();
    status.textContent = 'Видео недоступно. Статичное изображение сохранено.';
  }

  function loadFilm() {
    if (video.getAttribute('src') || !video.dataset.src) return;
    video.setAttribute('src', video.dataset.src);
    video.load();
  }

  function start({ explicit = false } = {}) {
    if (explicit) {
      manuallyPaused = false;
      explicitMotion = true;
      playbackFailed = false;
      status.textContent = '';
    }
    if (!shouldPlay() || pending || playing) return;

    loadFilm();
    pending = true;
    const token = ++intent;
    let result;
    try {
      result = video.play();
    } catch {
      if (token === intent) failPlayback();
      return;
    }

    Promise.resolve(result).then(() => {
      if (token !== intent) return;
      if (!shouldPlay()) {
        video.pause();
        return;
      }
      pending = false;
    }).catch(() => {
      if (token === intent) failPlayback();
    });
  }

  function reconcile() {
    if (shouldPlay()) start();
    else if (pending || playing || !video.paused) pause();
  }

  button.hidden = false;
  updateControl(false);

  button.addEventListener('click', () => {
    if (pending || playing || !video.paused) pause({ manual: true });
    else start({ explicit: true });
  });

  video.addEventListener('playing', () => {
    if (!shouldPlay()) {
      video.pause();
      updateControl(false);
      return;
    }
    pending = false;
    status.textContent = '';
    updateControl(true);
  });
  video.addEventListener('pause', () => {
    if (!video.paused) return;
    pending = false;
    updateControl(false);
  });
  video.addEventListener('error', failPlayback);

  document.addEventListener('visibilitychange', reconcile);

  const observer = new IntersectionObserver((entries) => {
    visible = Boolean(entries[0] && entries[0].isIntersecting);
    reconcile();
  }, { threshold: 0.15 });
  observer.observe(video.closest('section') || video);

  preference.addEventListener('change', () => {
    explicitMotion = false;
    pause();
    if (!preference.matches) reconcile();
  });

  if (connection && connection.addEventListener) {
    connection.addEventListener('change', () => {
      explicitMotion = false;
      pause();
      if (!connection.saveData) reconcile();
    });
  }
})();
