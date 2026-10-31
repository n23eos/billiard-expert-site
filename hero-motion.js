'use strict';

(() => {
  const video = document.querySelector('#hero-film');
  const status = document.querySelector('#hero-motion-status');
  if (!video || !status) return;

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let visible = false;
  let playing = false;
  let pending = false;
  let playbackFailed = false;
  let intent = 0;

  function usesDataSaving() {
    return Boolean(connection && connection.saveData);
  }

  function updatePlayback(isPlaying) {
    playing = isPlaying;
    video.classList[isPlaying ? 'add' : 'remove']('is-playing');
  }

  function autoplayAllowed() {
    return !preference.matches && !usesDataSaving();
  }

  function shouldPlay() {
    return visible
      && !document.hidden
      && !playbackFailed
      && autoplayAllowed();
  }

  function pause() {
    intent += 1;
    pending = false;
    video.pause();
    updatePlayback(false);
  }

  function failPlayback() {
    playbackFailed = true;
    pause();
    status.textContent = 'Видео недоступно. Статичное изображение сохранено.';
  }

  function loadFilm() {
    if (video.getAttribute('src') || !video.dataset.src) return;
    video.setAttribute('src', video.dataset.src);
    video.load();
  }

  function start() {
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

  updatePlayback(false);

  video.addEventListener('playing', () => {
    if (!shouldPlay()) {
      video.pause();
      updatePlayback(false);
      return;
    }
    pending = false;
    status.textContent = '';
    updatePlayback(true);
  });
  video.addEventListener('pause', () => {
    if (!video.paused) return;
    pending = false;
    updatePlayback(false);
    reconcile();
  });
  video.addEventListener('error', failPlayback);

  document.addEventListener('visibilitychange', reconcile);

  const observer = new IntersectionObserver((entries) => {
    visible = Boolean(entries[0] && entries[0].isIntersecting);
    reconcile();
  }, { threshold: 0.15 });
  observer.observe(video.closest('section') || video);

  preference.addEventListener('change', () => {
    pause();
    if (!preference.matches) reconcile();
  });

  if (connection && connection.addEventListener) {
    connection.addEventListener('change', () => {
      pause();
      if (!connection.saveData) reconcile();
    });
  }
})();
