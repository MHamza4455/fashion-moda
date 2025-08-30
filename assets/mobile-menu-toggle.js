var menuButton = document.querySelector('.mobile-menu__button--burger');
var hamburger = document.getElementById('hamburger');
var closeButton = document.querySelector('.drawer__close-button');
var navDrawer = document.getElementById('nav-drawer');
var drawerOverlay = document.querySelector('.drawer__overlay');
var header = document.querySelector('.site-header--livingproof-us');

function updateDrawerHeight() {
  if (!navDrawer) return;

  const header = document.querySelector('[data-site-header]');
  const announcementBar = document.querySelector('[data-announcement-wrapper]');
  const hasScrolled = document.body.classList.contains('has-scrolled');

  if (!header) return;

  const headerHeight = header.offsetHeight;
  const announcementHeight = announcementBar ? announcementBar.offsetHeight : 0;

  // Only account for announcement bar height when not scrolled
  const totalHeight = hasScrolled ? headerHeight : headerHeight + announcementHeight;

  navDrawer.style.height = `calc(100% - ${totalHeight}px)`;
  navDrawer.style.top = `${totalHeight}px`;

  // Update overlay position to match drawer
  if (drawerOverlay) {
    drawerOverlay.style.top = `${totalHeight}px`;
    drawerOverlay.style.height = `calc(100% - ${totalHeight}px)`;
  }
}

if (menuButton) {
  menuButton.addEventListener('click', function(e) {
    setTimeout(function() {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        hamburger.classList.add('active');
        if(header) {
          updateDrawerHeight();
        }
      } else {
        hamburger.classList.remove('active');
      }
    }, 10);
  });
}

if (closeButton) {
  closeButton.addEventListener('click', function(e) {
    setTimeout(function() {
      hamburger.classList.remove('active');
    }, 10);
  });
}

// Update drawer height on scroll
document.addEventListener('scroll', function() {
  if (navDrawer && navDrawer.classList.contains('is-open')) {
    if(header) {
      updateDrawerHeight();
    }
  }
});

// Update drawer height on resize
window.addEventListener('resize', function() {
  if (navDrawer && navDrawer.classList.contains('is-open')) {
    if(header) {
      updateDrawerHeight();
    }
  }
});

// Simple interval to check drawer state and reset hamburger icon when drawer is closed
if (hamburger && navDrawer) {
  setInterval(function() {
    if (!navDrawer.classList.contains('is-open') && hamburger.classList.contains('active')) {
      hamburger.classList.remove('active');
    }
  }, 100);
}
