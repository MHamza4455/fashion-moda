document.addEventListener('DOMContentLoaded', function() {
  let overlay = document.querySelector('.side-tray-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'side-tray-overlay';
    document.body.appendChild(overlay);
  }

  function openTray(tray) {
    if (tray.parentNode !== document.body) {
      document.body.appendChild(tray);
    }

    tray.offsetHeight;

    requestAnimationFrame(() => {
      tray.classList.add('visible');
      overlay.classList.add('visible');
      document.body.classList.add('side-tray-open');
      document.body.style.paddingRight = '15px';

      const button = document.querySelector(`[data-tray-id="${tray.id.replace('side-tray-', '')}"]`);
      if (button) {
        button.classList.add('is-expanded');
      }
    });
  }

  function closeTray(tray) {
    tray.classList.remove('visible');
    overlay.classList.remove('visible');
    document.body.classList.remove('side-tray-open');
    document.body.style.paddingRight = '';

    // Pause and reset any inline video in the tray
    var videos = tray.querySelectorAll('video');
    videos.forEach(function(video) {
      video.pause();
      video.currentTime = 0;
    });

    const button = document.querySelector(`[data-tray-id="${tray.id.replace('side-tray-', '')}"]`);
    if (button) {
      button.classList.remove('is-expanded');
    }
  }

  document.querySelectorAll('.open-side-tray-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tray = document.getElementById('side-tray-' + btn.dataset.trayId);
      if (tray) openTray(tray);
    });
  });
  document.querySelectorAll('.close-side-tray-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tray = document.getElementById('side-tray-' + btn.dataset.trayId);
      if (tray) closeTray(tray);
    });
  });
  overlay.addEventListener('click', function() {
    document.querySelectorAll('.side-tray.visible').forEach(function(tray) {
      closeTray(tray);
    });
  });

  // Setup How to Use Video Popup Modal Logic
  function setupHowToUseVideoPopup() {
    const wrappers = document.querySelectorAll('.how-to-use-video-popup-wrapper');

    wrappers.forEach(wrapper => {
      const playBtn = wrapper.querySelector('.how-to-use-video-play-btn');
      const modalId = wrapper.getAttribute('data-modal-id');
      const modal = document.getElementById(modalId);
      if (!playBtn || !modal) return;

      const closeBtn = modal.querySelector('.how-to-use-video-modal-close');
      const overlay = document.querySelector('.side-tray-overlay');

      const closeModal = () => {
        modal.style.display = 'none';
        document.body.classList.remove('video-modal-open');

        if (overlay && document.body.classList.contains('side-tray-open')) {
          overlay.style.display = 'block';
        }

        const iframe = modal.querySelector('iframe');
        if (iframe && iframe.src.includes('autoplay=1')) {
          iframe.src = iframe.src.replace(/([?&])autoplay=1(&)?/, (_, p1, p2) => (p2 ? p1 : ''));
        }

        const video = modal.querySelector('video');
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      };

      playBtn.addEventListener('click', e => {
        e.preventDefault();
        modal.style.display = 'flex';
        document.body.classList.add('video-modal-open');

        if (overlay) overlay.style.display = 'none';

        const video = modal.querySelector('video');
        if (video) {
          video.currentTime = 0;
          video.play();
        }

        const iframe = modal.querySelector('iframe');
        if (iframe && iframe.src && !iframe.src.includes('autoplay=1')) {
          const sep = iframe.src.includes('?') ? '&' : '?';
          iframe.src += `${sep}autoplay=1`;
        }
      });

      closeBtn?.addEventListener('click', closeModal);

      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
      });

      window.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
      });
    });
  }

  setupHowToUseVideoPopup();

  // Move elements with [data-move-to-body] to <body>
  document.querySelectorAll('[data-move-to-body]').forEach(el => {
    if (el.parentNode !== document.body) {
      document.body.appendChild(el);
    }
  });
});
