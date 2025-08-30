class BannerAnimation {
  constructor(containers = document.querySelectorAll('.banner-animation-container')) {
    this.init(containers);
  }

  init(containers) {
    containers.forEach(container => this.setup(container));
  }

  setup(container) {
    const image = container.querySelector('.banner-image__image, .video-background--image, .banner-img, .banner-image__image-container img');
    const video = container.querySelector('video');
    const textContent = container.querySelector('.banner-text-content');

    if (!textContent) return;

    if (video) {
      this.onVideoLoad(video, container);
    } else if (image) {
      this.onImageLoad(image, container);
    } else {
      const hasBackground = container.querySelector('.banner-image__image-container, .video-background');
      this.delayedTrigger(container, hasBackground ? 1000 : 500);
    }
  }

  onVideoLoad(video, container) {
    const triggerOnce = () => {
      this.trigger(container);
      video.removeEventListener('loadeddata', triggerOnce);
      video.removeEventListener('canplay', triggerOnce);
    };

    if (video.readyState >= 2) {
      this.trigger(container);
    } else {
      video.addEventListener('loadeddata', triggerOnce);
      video.addEventListener('canplay', triggerOnce);
      this.fallbackTrigger(container, 3000);
    }
  }

  onImageLoad(image, container) {
    const triggerOnce = () => {
      this.trigger(container);
      image.removeEventListener('load', triggerOnce);
    };

    if (image.complete && image.naturalHeight !== 0) {
      this.trigger(container);
    } else {
      image.addEventListener('load', triggerOnce);
      this.fallbackTrigger(container, 2000);
    }
  }

  fallbackTrigger(container, delay) {
    setTimeout(() => {
      if (!container.classList.contains('banner-loaded')) {
        this.trigger(container);
      }
    }, delay);
  }

  delayedTrigger(container, delay) {
    setTimeout(() => this.trigger(container), delay);
  }

  trigger(container) {
    container.classList.add('banner-loaded');
  }
}

// On initial page load
document.addEventListener('DOMContentLoaded', () => {
  new BannerAnimation();
});

// On Shopify section reload
document.addEventListener('shopify:section:load', (event) => {
  const containers = event.target.querySelectorAll('.banner-animation-container');
  if (containers.length) {
    new BannerAnimation(containers);
  }
});
