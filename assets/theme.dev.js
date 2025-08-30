
/*
* @license
* Palo Alto Theme (c)
*
* This file is included for advanced development by
* Shopify Agencies.  Modified versions of the theme
* code are not supported by Shopify or Presidio Creative.
*
* In order to use this file you will need to change
* theme.js to theme.dev.js in /layout/theme.liquid
*
*/


let isLpUsHeader = document.querySelector('header.site-header--livingproof-us') !== null;

(function (scrollLock, AOS, Flickity, themeCurrency, Ajaxinate) {
    'use strict';

    (function() {
        const env = {"NODE_ENV":"production"};
        try {
            if (process) {
                process.env = Object.assign({}, process.env);
                Object.assign(process.env, env);
                return;
            }
        } catch (e) {} // avoid ReferenceError: process is not defined
        globalThis.process = { env:env };
    })();

    window.theme = window.theme || {};

    window.theme.sizes = {
      mobile: 480,
      small: 768,
      large: 1024,
      widescreen: 1440,
    };

    window.theme.keyboardKeys = {
      TAB: 'Tab',
      ENTER: 'Enter',
      NUMPADENTER: 'NumpadEnter',
      ESCAPE: 'Escape',
      SPACE: 'Space',
      LEFTARROW: 'ArrowLeft',
      RIGHTARROW: 'ArrowRight',
    };

    window.theme.focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function debounce(fn, time) {
      let timeout;
      return function () {
        // eslint-disable-next-line prefer-rest-params
        if (fn) {
          const functionCall = () => fn.apply(this, arguments);
          clearTimeout(timeout);
          timeout = setTimeout(functionCall, time);
        }
      };
    }

    const selectors$19 = {
      body: 'body',
      main: '[data-main]',
      header: '[data-site-header]',
      preventTransparentHeader: '[data-prevent-transparent-header]',
    };
    const classes$Z = {
      supportsTransparentHeader: 'supports-transparent-header',
      siteHeaderTransparent: 'site-header--transparent',
      isFirstSectionTransparent: 'is-first-section-transparent',
    };

    const attributes$L = {
      transparent: 'data-transparent',
    };

    const initTransparentHeader = () => {
      // Determine what is the first
      const body = document.querySelector(selectors$19.body);
      const header = body.querySelector(selectors$19.header);

      if (!header) return;

      const headerTransparent = header.getAttribute(attributes$L.transparent) === 'true';
      const firstSection = body.querySelector(selectors$19.main).children[0];

      if (!firstSection) return;

      const preventTransparentHeader = firstSection.querySelector(`${selectors$19.preventTransparentHeader}:first-of-type`);
      window.isHeaderTransparent = headerTransparent && firstSection.classList.contains(classes$Z.supportsTransparentHeader) && !preventTransparentHeader;

      const supportsHasSelector = CSS.supports('(selector(:has(*)))');
      if (!supportsHasSelector) {
        body.classList.toggle(classes$Z.isFirstSectionTransparent, window.isHeaderTransparent);
        header.classList.toggle(classes$Z.siteHeaderTransparent, window.isHeaderTransparent);
      }
    };

    let screenOrientation = getScreenOrientation();

    const selectors$18 = {
      body: 'body',
      main: '[data-main]',
      collectionFilters: '[data-collection-filters]',
      footer: '[data-section-type*="footer"]',
      header: '[data-header-height]',
      stickyHeader: '[data-site-header][data-position="fixed"]',
      announcementBar: '[data-announcement-bar]',
      collectionStickyBar: '[data-collection-sticky-bar]',
      logoTextLink: '[data-logo-text-link]',
    };

    const classes$Y = {
      templateCollection: 'template-collection',
      templateSearch: 'template-search',
      supportsTransparentHeader: 'supports-transparent-header',
    };

    function readHeights() {
      const h = {};
      h.windowHeight = Math.min(window.screen.height, window.innerHeight);
      h.footerHeight = getHeight(selectors$18.footer);
      h.headerHeight = getHeight(selectors$18.header);
      h.stickyHeaderHeight = isHeaderSticky() ? window.stickyHeaderHeight : 0;
      h.headerInitialHeight = parseInt(document.querySelector(selectors$18.header)?.dataset.height || document.querySelector(selectors$18.header)?.offsetHeight) || 0;
      h.announcementBarHeight = getHeight(selectors$18.announcementBar);
      h.collectionStickyBarHeight = getHeight(selectors$18.collectionStickyBar);
      return h;
    }

    function setVarsOnResize() {
      document.addEventListener('theme:resize', resizeVars);
      setVars();
      document.dispatchEvent(new CustomEvent('theme:vars'), {bubbles: false});
    }

    function setVars() {
      calcVars();
    }

    function resizeVars() {
      // restrict the heights that are changed on resize to avoid iOS jump when URL bar is shown and hidden
      calcVars(true);
    }

    function calcVars(checkOrientation = false) {
      const body = document.querySelector(selectors$18.body);
      const hasCollectionFilters = document.querySelector(selectors$18.collectionFilters);
      const hasLogoTextLink = document.querySelector(selectors$18.logoTextLink) !== null;

      let {windowHeight, headerHeight, headerInitialHeight, announcementBarHeight, footerHeight, collectionStickyBarHeight} = readHeights();

      if (hasLogoTextLink) headerHeight = recalcHeaderHeight();

      const contentFullHeight = window.isHeaderTransparent && checkFirstSectionTransparency() ? windowHeight - announcementBarHeight : windowHeight - headerInitialHeight - announcementBarHeight;
      let fullHeight = isHeaderSticky() ? windowHeight - window.stickyHeaderHeight : windowHeight;
      const isCollectionPage = body.classList.contains(classes$Y.templateCollection);
      const isSearchPage = body.classList.contains(classes$Y.templateSearch);
      const isPageWithFilters = (isCollectionPage && hasCollectionFilters) || (isSearchPage && hasCollectionFilters);

      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      document.documentElement.style.setProperty('--content-full', `${contentFullHeight}px`);
      document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
      document.documentElement.style.setProperty('--collection-sticky-bar-height', `${collectionStickyBarHeight}px`);

      if (isPageWithFilters) fullHeight = windowHeight;

      if (!checkOrientation) {
        document.documentElement.style.setProperty('--full-height', `${fullHeight}px`);
        return;
      }

      const currentScreenOrientation = getScreenOrientation();
      if (currentScreenOrientation !== screenOrientation) {
        // Only update the heights on screen orientation change
        document.documentElement.style.setProperty('--full-height', `${fullHeight}px`);

        // Update the screen orientation state
        screenOrientation = currentScreenOrientation;
      }
    }

    function getHeight(selector) {
      const el = document.querySelector(selector);
      if (el) {
        return el.clientHeight;
      } else {
        return 0;
      }
    }

    function checkFirstSectionTransparency() {
      const firstSection = document.querySelector(selectors$18.main).firstElementChild;
      return firstSection.classList.contains(classes$Y.supportsTransparentHeader);
    }

    function isHeaderSticky() {
      return document.querySelector(selectors$18.stickyHeader);
    }

    function getScreenOrientation() {
      if (window.matchMedia('(orientation: portrait)').matches) {
        return 'portrait';
      }

      if (window.matchMedia('(orientation: landscape)').matches) {
        return 'landscape';
      }
    }

    function recalcHeaderHeight() {
      document.documentElement.style.setProperty('--header-height', 'auto');
      document.documentElement.style.setProperty('--header-sticky-height', 'auto');

      // Header is declared here to avoid `offsetHeight` returning zero when the element has not been rendered to the DOM yet in the Theme editor
      const header = document.querySelector(selectors$18.header);
      const resetHeight = header.offsetHeight;

      // requestAnimationFrame method is needed to properly update the CSS variables on resize after they have been reset
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--header-height', `${resetHeight}px`);
        document.documentElement.style.setProperty('--header-sticky-height', `${resetHeight}px`);
      });

      return resetHeight;
    }

    const selectors$17 = {
      overflowBackground: '[data-overflow-background]',
      overflowFrame: '[data-overflow-frame]',
      overflowContent: '[data-overflow-content]',
      overflowContainer: '[data-overflow-container]',
      overflowWrapper: '[data-overflow-wrapper]',
    };

    function singles(frame, wrappers) {
      // sets the height of any frame passed in with the
      // tallest preventOverflowContent as well as any image in that frame
      let tallest = 0;

      wrappers.forEach((wrap) => {
        tallest = wrap.offsetHeight > tallest ? wrap.offsetHeight : tallest;
      });
      const images = frame.querySelectorAll(selectors$17.overflowBackground);
      const frames = [frame, ...images];
      frames.forEach((el) => {
        el.style.setProperty('min-height', `calc(${tallest}px + var(--header-height))`);
      });
    }

    function doubles(section) {
      if (window.innerWidth < window.theme.sizes.small) {
        // if we are below the small breakpoint, the double section acts like two independent
        // single frames
        let singleFrames = section.querySelectorAll(selectors$17.overflowFrame);
        singleFrames.forEach((singleframe) => {
          const wrappers = singleframe.querySelectorAll(selectors$17.overflowContent);
          singles(singleframe, wrappers);
        });
        return;
      }

      let tallest = 0;

      const frames = section.querySelectorAll(selectors$17.overflowFrame);
      const contentWrappers = section.querySelectorAll(selectors$17.overflowContent);
      contentWrappers.forEach((content) => {
        if (content.offsetHeight > tallest) {
          tallest = content.offsetHeight;
        }
      });
      const images = section.querySelectorAll(selectors$17.overflowBackground);
      let applySizes = [...frames, ...images];
      applySizes.forEach((el) => {
        el.style.setProperty('min-height', `${tallest}px`);
      });
      section.style.setProperty('min-height', `${tallest}px`);
    }

    function preventOverflow(container) {
      const singleFrames = container.querySelectorAll(selectors$17.overflowContainer);
      if (singleFrames) {
        singleFrames.forEach((frame) => {
          const wrappers = frame.querySelectorAll(selectors$17.overflowContent);
          singles(frame, wrappers);
          document.addEventListener('theme:resize', () => {
            singles(frame, wrappers);
          });
        });
      }

      const doubleSections = container.querySelectorAll(selectors$17.overflowWrapper);
      if (doubleSections) {
        doubleSections.forEach((section) => {
          doubles(section);
          document.addEventListener('theme:resize', () => {
            doubles(section);
          });
        });
      }
    }

    window.lastWindowWidth = window.innerWidth;

    function dispatchResizeEvent() {
      document.dispatchEvent(
        new CustomEvent('theme:resize', {
          bubbles: true,
        })
      );

      if (window.lastWindowWidth !== window.innerWidth) {
        document.dispatchEvent(
          new CustomEvent('theme:resize:width', {
            bubbles: true,
          })
        );

        window.lastWindowWidth = window.innerWidth;
      }
    }

    function resizeListener() {
      window.addEventListener('resize', debounce(dispatchResizeEvent, 50));
    }

    let prev = window.pageYOffset;
    let up = null;
    let down = null;
    let wasUp = null;
    let wasDown = null;
    let scrollLockTimer$1 = 0;

    const classes$X = {
      quickViewVisible: 'js-quick-view-visible',
      cartDrawerOpen: 'js-drawer-open-cart',
    };

    function dispatchScrollEvent() {
      const position = window.pageYOffset;
      if (position > prev) {
        down = true;
        up = false;
      } else if (position < prev) {
        down = false;
        up = true;
      } else {
        up = null;
        down = null;
      }
      prev = position;
      document.dispatchEvent(
        new CustomEvent('theme:scroll', {
          detail: {
            up,
            down,
            position,
          },
          bubbles: false,
        })
      );
      if (up && !wasUp) {
        document.dispatchEvent(
          new CustomEvent('theme:scroll:up', {
            detail: {position},
            bubbles: false,
          })
        );
      }
      if (down && !wasDown) {
        document.dispatchEvent(
          new CustomEvent('theme:scroll:down', {
            detail: {position},
            bubbles: false,
          })
        );
      }
      wasDown = down;
      wasUp = up;
    }

    function lock(e) {
      // Prevent body scroll lock race conditions
      setTimeout(() => {
        if (scrollLockTimer$1) {
          clearTimeout(scrollLockTimer$1);
        }

        scrollLock.disablePageScroll(e.detail, {
          allowTouchMove: (el) => el.tagName === 'TEXTAREA',
        });

        document.documentElement.setAttribute('data-scroll-locked', '');
      });
    }

    function unlock(e) {
      const timeout = e.detail;

      if (timeout) {
        scrollLockTimer$1 = setTimeout(removeScrollLock, timeout);
      } else {
        removeScrollLock();
      }
    }

    function removeScrollLock() {
      const isPopupVisible = document.body.classList.contains(classes$X.quickViewVisible) || document.body.classList.contains(classes$X.cartDrawerOpen);

      if (!isPopupVisible) {
        scrollLock.clearQueueScrollLocks();
        scrollLock.enablePageScroll();
        document.documentElement.removeAttribute('data-scroll-locked');
      }
    }

    function scrollListener() {
      let timeout;
      window.addEventListener(
        'scroll',
        function () {
          if (timeout) {
            window.cancelAnimationFrame(timeout);
          }
          timeout = window.requestAnimationFrame(function () {
            dispatchScrollEvent();
          });
        },
        {passive: true}
      );

      window.addEventListener('theme:scroll:lock', lock);
      window.addEventListener('theme:scroll:unlock', unlock);
    }

    const wrap = (toWrap, wrapperClass = '', wrapperOption) => {
      const wrapper = wrapperOption || document.createElement('div');
      wrapper.classList.add(wrapperClass);
      wrapper.setAttribute('data-scroll-lock-scrollable', '');
      toWrap.parentNode.insertBefore(wrapper, toWrap);
      return wrapper.appendChild(toWrap);
    };

    function wrapElements(container) {
      // Target tables to make them scrollable
      const tableSelectors = 'table';
      const tables = container.querySelectorAll(tableSelectors);
      tables.forEach((table) => {
        wrap(table, 'table-wrapper');
      });
    }

    function isTouchDevice() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    function isTouch() {
      if (isTouchDevice()) {
        document.documentElement.className = document.documentElement.className.replace('no-touch', 'supports-touch');
        window.theme.touch = true;
      } else {
        window.theme.touch = false;
      }
    }

    function loading() {
      document.documentElement.classList.remove('is-loading');
      document.documentElement.classList.add('is-loaded');
    }

    const classes$W = {
      loading: 'is-loading',
      imgIn: 'img-in',
    };

    const selectors$16 = {
      img: 'img.is-loading',
      section: '[data-section-type]',
    };

    /*
      Catch images loaded events and add class "is-loaded" to them and their containers
    */
    function loadedImagesEventHook() {
      document.addEventListener(
        'load',
        (e) => {
          if (e.target.tagName.toLowerCase() == 'img' && e.target.classList.contains(classes$W.loading)) {
            e.target.classList.remove(classes$W.loading);
            e.target.parentNode.classList.remove(classes$W.loading);

            const section = e.target.closest(selectors$16.section);
            if (section) section.classList.add(classes$W.imgIn);
          }
        },
        true
      );
    }

    /*
      Remove "is-loading" class to the loaded images and their containers
    */
    function removeLoadingClassFromLoadedImages(container) {
      container.querySelectorAll(selectors$16.img).forEach((img) => {
        if (img.complete) {
          img.classList.remove(classes$W.loading);
          img.parentNode.classList.remove(classes$W.loading);

          const section = img.closest(selectors$16.section);
          if (section) section.classList.add(classes$W.imgIn);
        }
      });
    }

    /**
     * This component prevents any HTML from being loaded,
     * until user's cursor is over the component or over specific trigger referenced by the <deferred-loading> element.
     * The main focus is for deferred loading of images.
     * Loading is triggered by a 'mouseenter' event rendering depends on a `<template>` element that should hold all of the HTML
     *
     * @example
     *  <deferred-loading data-deferred-container=".parent-container-selector" data-deferred-triggers=".button-element-selector">
     *    <template>
     *      <div data-deferred-content>
     *        // Insert deferred markup or images here:
     *        {%- render 'image', image: section.settings.image_1 -%}
     *        {%- render 'image', image: section.settings.image_2 -%}
     *      </div>
     *    </template>
     *  </deferred-loading>
     */
    const selectors$15 = {
      img: 'img',
      template: 'template',
      shopifySection: '.shopify-section',
      deferredContent: '[data-deferred-content]',
      reloadSrcsetException: '[data-product-image]',
    };

    const attributes$K = {
      srcset: 'srcset',
      loaded: 'data-loaded',
      deferredContainer: 'data-deferred-container',
    };

    class DeferredLoading extends HTMLElement {
      constructor() {
        super();

        this.container = this;
        if (this.hasAttribute(attributes$K.deferredContainer)) {
          this.container = this.closest(this.getAttribute(attributes$K.deferredContainer)) || this.closest(selectors$15.shopifySection);
        }

        this.deferredTriggers = this.container.querySelectorAll(this.dataset.deferredTriggers);
      }

      connectedCallback() {
        if (this.deferredTriggers.length == 0) {
          this.container.addEventListener(
            'mouseenter',
            () => {
              if (this.hasAttribute(attributes$K.loaded)) return;
              this.loadTemplate();
            },
            {once: true}
          );

          return;
        }

        this.deferredTriggers.forEach((trigger) => {
          trigger.addEventListener(
            'mouseenter',
            () => {
              if (this.hasAttribute(attributes$K.loaded)) return;
              this.loadTemplate();
            },
            {once: true}
          );
        });
      }

      loadTemplate() {
        const content = document.createElement('div');
        const template = this.querySelector(selectors$15.template);
        if (!template || !template?.content?.firstElementChild) return;

        content.appendChild(template.content.firstElementChild.cloneNode(true));

        const deferredContent = content.querySelector(selectors$15.deferredContent);
        if (!deferredContent) return;

        this.append(deferredContent);
        this.setAttribute(attributes$K.loaded, true);

        const containsImages = deferredContent.querySelectorAll(selectors$15.img).length > 0;
        if (containsImages) {
          this.reloadSrcset(this);
        }
      }

      // Reload srcset for correct image render on Safari - fixes 'object-fit: cover' issues
      reloadSrcset(container) {
        if (!container) return;
        container.querySelectorAll(selectors$15.img).forEach((img) => {
          const reloadSrcsetException = img.parentNode.matches(selectors$15.reloadSrcsetException);

          if (!reloadSrcsetException) {
            const srcset = img.getAttribute(attributes$K.srcset);
            img.setAttribute(attributes$K.srcset, '');
            img.setAttribute(attributes$K.srcset, srcset);
          }
        });
      }
    }

    const selectors$14 = {
      inputSearch: 'input[type="search"]',
      inputType: 'input[name="type"]',
      form: 'form',
      allVisibleElements: '[role="option"]',
      ariaSelected: '[aria-selected="true"]',
      selectedOption: '[aria-selected="true"] a, button[aria-selected="true"]',
      popularSearches: '[data-popular-searches]',
      popdownBody: '[data-popdown-body]',
      mainInputSearch: '[data-main-input-search]',
      predictiveSearchResults: '[data-predictive-search-results]',
      predictiveSearch: 'predictive-search',
      searchForm: 'search-form',
    };

    const classes$V = {
      isSearched: 'is-searched',
      templateSearch: 'template-search',
    };

    class SearchForm extends HTMLElement {
      constructor() {
        super();

        this.input = this.querySelector(selectors$14.inputSearch);
        this.form = this.querySelector(selectors$14.form);
        this.popdownBody = this.closest(selectors$14.popdownBody);
        this.popularSearches = this.popdownBody?.querySelector(selectors$14.popularSearches);
        this.predictiveSearchResults = this.querySelector(selectors$14.predictiveSearchResults);
        this.predictiveSearch = this.matches(selectors$14.predictiveSearch);
        this.searchForm = this.matches(selectors$14.searchForm);
        this.selectedElement = null;
        this.activeElement = null;
        this.searchTerm = '';
        this.currentSearchTerm = '';
        this.isSearchPage = document.body.classList.contains(classes$V.templateSearch);

        this.input.addEventListener(
          'input',
          debounce((event) => {
            this.onChange(event);
          }, 300).bind(this)
        );

        this.input.addEventListener('focus', this.onFocus.bind(this));
        this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));
        this.addEventListener('keyup', this.onKeyup.bind(this));
        this.addEventListener('keydown', this.onKeydown.bind(this));

        if (this.isSearchPage) {
          this.mainInputType = document.querySelector(`${selectors$14.mainInputSearch} ${selectors$14.inputType}`);
          this.inputType = this.querySelector(selectors$14.inputType);
          this.inputType.value = this.mainInputType.value;
        }
      }

      getQuery() {
        return this.input.value.trim();
      }

      onFocus() {
        this.currentSearchTerm = this.getQuery();
      }

      onChange() {
        this.classList.toggle(classes$V.isSearched, !this.isFormCleared());
        this.searchTerm = this.getQuery();
      }

      isFormCleared() {
        return this.input.value.length === 0;
      }

      submit() {
        this.form.submit();
      }

      reset() {
        this.input.val = '';
      }

      onFormSubmit(event) {
        if (!this.getQuery().length || this.querySelector(selectors$14.selectedLink)) event.preventDefault();
      }

      onKeydown(event) {
        // Prevent the cursor from moving in the input when using the up and down arrow keys
        if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
          event.preventDefault();
        }
      }

      onKeyup(event) {
        if (!this.getQuery().length && this.predictiveSearch) {
          this.close(true);
        }
        event.preventDefault();

        switch (event.code) {
          case 'ArrowUp':
            this.switchOption('up');
            break;
          case 'ArrowDown':
            this.switchOption('down');
            break;
          case 'Enter':
            this.selectOption();
            break;
        }
      }

      switchOption(direction) {
        const moveUp = direction === 'up';
        const predictiveSearchOpened = this.classList.contains(classes$V.isSearched) && this.predictiveSearchResults;

        const visibleElementsContainer = predictiveSearchOpened ? this.predictiveSearchResults : this.popularSearches;

        if (!visibleElementsContainer) return;
        this.selectedElement = visibleElementsContainer.querySelector(selectors$14.ariaSelected);

        // Filter out hidden elements
        const allVisibleElements = Array.from(visibleElementsContainer.querySelectorAll(selectors$14.allVisibleElements)).filter((element) => element.offsetParent !== null);

        let activeElementIndex = 0;

        if (moveUp && !this.selectedElement) return;

        let selectedElementIndex = -1;
        let i = 0;

        while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
          if (allVisibleElements[i] === this.selectedElement) {
            selectedElementIndex = i;
          }
          i++;
        }

        if (!moveUp && this.selectedElement) {
          activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
        } else if (moveUp) {
          activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
        }

        if (activeElementIndex === selectedElementIndex) return;

        this.activeElement = allVisibleElements[activeElementIndex];
        this.handleFocusableDescendants();
      }

      selectOption() {
        const selectedOption = this.querySelector(selectors$14.selectedOption);

        if (selectedOption) selectedOption.click();
      }

      handleFocusableDescendants(reset = false) {
        const selected = this.selectedElement ? this.selectedElement : this.querySelector(selectors$14.ariaSelected);
        if (selected) selected.setAttribute('aria-selected', false);

        if (!this.activeElement || reset) {
          this.selectedElement = null;
          this.activeElement?.setAttribute('aria-selected', false);
          this.input.setAttribute('aria-expanded', false);
          this.input.setAttribute('aria-activedescendant', '');
          return;
        }

        this.activeElement.setAttribute('aria-selected', true);
        this.input.setAttribute('aria-activedescendant', this.activeElement.id);
      }
    }

    customElements.define('search-form', SearchForm);

    const selectors$13 = {
      predictiveSearch: 'predictive-search',
      sectionPredictiveSearch: '#shopify-section-api-predictive-search',
      predictiveSearchResults: '[data-predictive-search-results]',
      predictiveSearchStatus: '[data-predictive-search-status]',
      searchResultsLiveRegion: '[data-predictive-search-live-region-count-value]',
      searchResultsWrapper: '[data-search-results-wrapper]',
    };

    const classes$U = {
      reset: 'reset',
    };

    class PredictiveSearch extends SearchForm {
      constructor() {
        super();

        this.abortController = new AbortController();
        this.allPredictiveSearchInstances = document.querySelectorAll(selectors$13.predictiveSearch);
        this.predictiveSearchResults = this.querySelector(selectors$13.predictiveSearchResults);
        this.cachedResults = {};
      }

      connectedCallback() {
        this.predictiveSearchResults.addEventListener('transitionend', (event) => {
          if (event.target === this.predictiveSearchResults && !this.getQuery().length) {
            this.classList.remove(classes$U.reset);
            requestAnimationFrame(() => this.clearResultsHTML());
          }
        });
      }

      onChange() {
        super.onChange();
        this.classList.remove(classes$U.reset);

        if (!this.searchTerm.length) {
          this.classList.add(classes$U.reset);
          return;
        }

        requestAnimationFrame(() => this.getSearchResults(this.searchTerm));
      }

      onFocus() {
        super.onFocus();

        if (!this.currentSearchTerm.length) return;

        if (this.searchTerm !== this.currentSearchTerm) {
          // Search term was changed from other search input, treat it as a user change
          this.onChange();
        } else if (this.getAttribute('results') === 'true') {
          this.open();
        } else {
          this.getSearchResults(this.searchTerm);
        }
      }

      getSearchResults(searchTerm) {
        const queryKey = searchTerm.replace(' ', '-').toLowerCase();
        const suggestionsResultsLimit = parseInt(window.theme.settings.suggestionsResultsLimit);
        let resources = 'query';
        resources += window.theme.settings.suggestArticles ? ',article' : '';
        resources += window.theme.settings.suggestCollections ? ',collection' : '';
        resources += window.theme.settings.suggestProducts ? ',product' : '';
        resources += window.theme.settings.suggestPages ? ',page' : '';

        this.setLiveRegionLoadingState();

        if (this.cachedResults[queryKey]) {
          this.renderSearchResults(this.cachedResults[queryKey]);
          return;
        }

        fetch(`${theme.routes.predictiveSearchUrl}?q=${encodeURIComponent(searchTerm)}&resources[type]=${resources}&resources[limit]=${suggestionsResultsLimit}&section_id=api-predictive-search`, {
          signal: this.abortController.signal,
        })
          .then((response) => {
            if (!response.ok) {
              var error = new Error(response.status);
              this.close();
              throw error;
            }

            return response.text();
          })
          .then((text) => {
            const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors$13.sectionPredictiveSearch).innerHTML;
            // Save bandwidth keeping the cache in all instances synced
            this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
              predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
            });
            this.renderSearchResults(resultsMarkup);
          })
          .catch((error) => {
            if (error?.code === 20) {
              // Code 20 means the call was aborted
              return;
            }
            this.close();
            throw error;
          });
      }

      switchOption(direction) {
        super.switchOption(direction);

        if (this.statusElement) this.statusElement.textContent = '';
      }

      setLiveRegionLoadingState() {
        this.statusElement = this.statusElement || this.querySelector(selectors$13.predictiveSearchStatus);
        this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

        this.setLiveRegionText(this.loadingText);
        this.setAttribute('loading', true);
      }

      setLiveRegionText(statusText) {
        this.statusElement.setAttribute('aria-hidden', 'false');
        this.statusElement.textContent = statusText;

        setTimeout(() => {
          this.statusElement.setAttribute('aria-hidden', 'true');
        }, 1000);
      }

      renderSearchResults(resultsMarkup) {
        this.predictiveSearchResults.innerHTML = resultsMarkup;

        this.setAttribute('results', true);

        this.setLiveRegionResults();
        this.open();
      }

      setLiveRegionResults() {
        this.removeAttribute('loading');
        this.setLiveRegionText(this.querySelector(selectors$13.searchResultsLiveRegion).textContent);
      }

      open() {
        this.setAttribute('open', true);
      }

      close(clearSearchTerm = false) {
        this.closeResults(clearSearchTerm);
      }

      closeResults(clearSearchTerm = false) {
        if (clearSearchTerm) {
          this.reset();
          this.removeAttribute('results');
          this.classList.remove(classes$U.reset);
        }

        this.removeAttribute('loading');
        this.removeAttribute('open');
      }

      clearResultsHTML() {
        this.predictiveSearchResults.innerHTML = '';
      }
    }

    customElements.define('predictive-search', PredictiveSearch);

    // Safari requestIdleCallback polyfill
    window.requestIdleCallback =
      window.requestIdleCallback ||
      function (cb) {
        var start = Date.now();
        return setTimeout(function () {
          cb({
            didTimeout: false,
            timeRemaining: function () {
              return Math.max(0, 50 - (Date.now() - start));
            },
          });
        }, 1);
      };
    window.cancelIdleCallback =
      window.cancelIdleCallback ||
      function (id) {
        clearTimeout(id);
      };

    resizeListener();
    scrollListener();
    isTouch();
    loadedImagesEventHook();

    const headerFunctions = debounce(() => {
      // Recheck sticky header settings if section is set to hidden
      initTransparentHeader();
    }, 300);

    const showAnimations = document.body.dataset.animations === 'true';
    if (showAnimations) {
      AOS.init({
        once: true,
        offset: 50,
        duration: 600,
      });
    }

    window.addEventListener('DOMContentLoaded', () => {
      setVarsOnResize();
      preventOverflow(document);
      wrapElements(document);
      removeLoadingClassFromLoadedImages(document);
      loading();
    });

    document.addEventListener('shopify:section:load', (e) => {
      const container = e.target;

      window.dispatchEvent(new Event('resize'), {bubbles: true});

      preventOverflow(container);
      wrapElements(container);
      setVarsOnResize();

      headerFunctions();
    });

    document.addEventListener('shopify:section:reorder', () => {
      headerFunctions();
    });

    document.addEventListener('shopify:section:unload', () => {
      headerFunctions();
    });

    if (!customElements.get('deferred-loading')) {
      customElements.define('deferred-loading', DeferredLoading);
    }

    (function () {
      function n(n) {
        var i = window.innerWidth || document.documentElement.clientWidth,
          r = window.innerHeight || document.documentElement.clientHeight,
          t = n.getBoundingClientRect();
        return t.top >= 0 && t.bottom <= r && t.left >= 0 && t.right <= i;
      }
      function t(n) {
        var i = window.innerWidth || document.documentElement.clientWidth,
          r = window.innerHeight || document.documentElement.clientHeight,
          t = n.getBoundingClientRect(),
          u = (t.left >= 0 && t.left <= i) || (t.right >= 0 && t.right <= i),
          f = (t.top >= 0 && t.top <= r) || (t.bottom >= 0 && t.bottom <= r);
        return u && f;
      }
      function i(n, i) {
        function r() {
          var r = t(n);
          r != u && ((u = r), typeof i == 'function' && i(r, n));
        }
        var u = t(n);
        window.addEventListener('load', r);
        window.addEventListener('resize', r);
        window.addEventListener('scroll', r);
      }
      function r(t, i) {
        function r() {
          var r = n(t);
          r != u && ((u = r), typeof i == 'function' && i(r, t));
        }
        var u = n(t);
        window.addEventListener('load', r);
        window.addEventListener('resize', r);
        window.addEventListener('scroll', r);
      }
      window.visibilityHelper = {isElementTotallyVisible: n, isElementPartiallyVisible: t, inViewportPartially: i, inViewportTotally: r};
    })();

    window.Shopify = window.Shopify || {};
    window.Shopify.theme = window.Shopify.theme || {};
    window.Shopify.theme.sections = window.Shopify.theme.sections || {};

    window.Shopify.theme.sections.registered = window.Shopify.theme.sections.registered || {};
    window.Shopify.theme.sections.instances = window.Shopify.theme.sections.instances || [];
    const registered = window.Shopify.theme.sections.registered;
    const instances = window.Shopify.theme.sections.instances;

    const attributes$J = {
      id: 'data-section-id',
      type: 'data-section-type',
    };

    class Registration {
      constructor(type = null, components = []) {
        this.type = type;
        this.components = validateComponentsArray(components);
        this.callStack = {
          onLoad: [],
          onUnload: [],
          onSelect: [],
          onDeselect: [],
          onBlockSelect: [],
          onBlockDeselect: [],
          onReorder: [],
        };
        components.forEach((comp) => {
          for (const [key, value] of Object.entries(comp)) {
            const arr = this.callStack[key];
            if (Array.isArray(arr) && typeof value === 'function') {
              arr.push(value);
            } else {
              console.warn(`Unregisted function: '${key}' in component: '${this.type}'`);
              console.warn(value);
            }
          }
        });
      }

      getStack() {
        return this.callStack;
      }
    }

    class Section {
      constructor(container, registration) {
        this.container = validateContainerElement(container);
        this.id = container.getAttribute(attributes$J.id);
        this.type = registration.type;
        this.callStack = registration.getStack();

        try {
          this.onLoad();
        } catch (e) {
          console.warn(`Error in section: ${this.id}`);
          console.warn(this);
          console.warn(e);
        }
      }

      callFunctions(key, e = null) {
        this.callStack[key].forEach((func) => {
          const props = {
            id: this.id,
            type: this.type,
            container: this.container,
          };
          if (e) {
            func.call(props, e);
          } else {
            func.call(props);
          }
        });
      }

      onLoad() {
        this.callFunctions('onLoad');
      }

      onUnload() {
        this.callFunctions('onUnload');
      }

      onSelect(e) {
        this.callFunctions('onSelect', e);
      }

      onDeselect(e) {
        this.callFunctions('onDeselect', e);
      }

      onBlockSelect(e) {
        this.callFunctions('onBlockSelect', e);
      }

      onBlockDeselect(e) {
        this.callFunctions('onBlockDeselect', e);
      }

      onReorder(e) {
        this.callFunctions('onReorder', e);
      }
    }

    function validateContainerElement(container) {
      if (!(container instanceof Element)) {
        throw new TypeError('Theme Sections: Attempted to load section. The section container provided is not a DOM element.');
      }
      if (container.getAttribute(attributes$J.id) === null) {
        throw new Error('Theme Sections: The section container provided does not have an id assigned to the ' + attributes$J.id + ' attribute.');
      }

      return container;
    }

    function validateComponentsArray(value) {
      if ((typeof value !== 'undefined' && typeof value !== 'object') || value === null) {
        throw new TypeError('Theme Sections: The components object provided is not a valid');
      }

      return value;
    }

    /*
     * @shopify/theme-sections
     * -----------------------------------------------------------------------------
     *
     * A framework to provide structure to your Shopify sections and a load and unload
     * lifecycle. The lifecycle is automatically connected to theme editor events so
     * that your sections load and unload as the editor changes the content and
     * settings of your sections.
     */

    function register(type, components) {
      if (typeof type !== 'string') {
        throw new TypeError('Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered');
      }

      if (typeof registered[type] !== 'undefined') {
        throw new Error('Theme Sections: A section of type "' + type + '" has already been registered. You cannot register the same section type twice');
      }

      if (!Array.isArray(components)) {
        components = [components];
      }

      const section = new Registration(type, components);
      registered[type] = section;

      return registered;
    }

    function load(types, containers) {
      types = normalizeType(types);

      if (typeof containers === 'undefined') {
        containers = document.querySelectorAll('[' + attributes$J.type + ']');
      }

      containers = normalizeContainers(containers);

      types.forEach(function (type) {
        const registration = registered[type];

        if (typeof registration === 'undefined') {
          return;
        }

        containers = containers.filter(function (container) {
          // Filter from list of containers because container already has an instance loaded
          if (isInstance(container)) {
            return false;
          }

          // Filter from list of containers because container doesn't have data-section-type attribute
          if (container.getAttribute(attributes$J.type) === null) {
            return false;
          }

          // Keep in list of containers because current type doesn't match
          if (container.getAttribute(attributes$J.type) !== type) {
            return true;
          }

          instances.push(new Section(container, registration));

          // Filter from list of containers because container now has an instance loaded
          return false;
        });
      });
    }

    function reorder(selector) {
      var instancesToReorder = getInstances(selector);

      instancesToReorder.forEach(function (instance) {
        instance.onReorder();
      });
    }

    function unload(selector) {
      var instancesToUnload = getInstances(selector);

      instancesToUnload.forEach(function (instance) {
        var index = instances
          .map(function (e) {
            return e.id;
          })
          .indexOf(instance.id);
        instances.splice(index, 1);
        instance.onUnload();
      });
    }

    function getInstances(selector) {
      var filteredInstances = [];

      // Fetch first element if its an array
      if (NodeList.prototype.isPrototypeOf(selector) || Array.isArray(selector)) {
        var firstElement = selector[0];
      }

      // If selector element is DOM element
      if (selector instanceof Element || firstElement instanceof Element) {
        var containers = normalizeContainers(selector);

        containers.forEach(function (container) {
          filteredInstances = filteredInstances.concat(
            instances.filter(function (instance) {
              return instance.container === container;
            })
          );
        });

        // If select is type string
      } else if (typeof selector === 'string' || typeof firstElement === 'string') {
        var types = normalizeType(selector);

        types.forEach(function (type) {
          filteredInstances = filteredInstances.concat(
            instances.filter(function (instance) {
              return instance.type === type;
            })
          );
        });
      }

      return filteredInstances;
    }

    function getInstanceById(id) {
      var instance;

      for (var i = 0; i < instances.length; i++) {
        if (instances[i].id === id) {
          instance = instances[i];
          break;
        }
      }
      return instance;
    }

    function isInstance(selector) {
      return getInstances(selector).length > 0;
    }

    function normalizeType(types) {
      // If '*' then fetch all registered section types
      if (types === '*') {
        types = Object.keys(registered);

        // If a single section type string is passed, put it in an array
      } else if (typeof types === 'string') {
        types = [types];

        // If single section constructor is passed, transform to array with section
        // type string
      } else if (types.constructor === Section) {
        types = [types.prototype.type];

        // If array of typed section constructors is passed, transform the array to
        // type strings
      } else if (Array.isArray(types) && types[0].constructor === Section) {
        types = types.map(function (Section) {
          return Section.type;
        });
      }

      types = types.map(function (type) {
        return type.toLowerCase();
      });

      return types;
    }

    function normalizeContainers(containers) {
      // Nodelist with entries
      if (NodeList.prototype.isPrototypeOf(containers) && containers.length > 0) {
        containers = Array.prototype.slice.call(containers);

        // Empty Nodelist
      } else if (NodeList.prototype.isPrototypeOf(containers) && containers.length === 0) {
        containers = [];

        // Handle null (document.querySelector() returns null with no match)
      } else if (containers === null) {
        containers = [];

        // Single DOM element
      } else if (!Array.isArray(containers) && containers instanceof Element) {
        containers = [containers];
      }

      return containers;
    }

    if (window.Shopify.designMode) {
      document.addEventListener('shopify:section:load', function (event) {
        var id = event.detail.sectionId;
        var container = event.target.querySelector('[' + attributes$J.id + '="' + id + '"]');

        // The global variable `Shopify.visualPreviewMode` will return true if you're in the theme editor's visual preview, and `undefined` if not.
        if (window.Shopify.visualPreviewMode === true) {
          // Dynamically generated section ID by Shopify is sometimes missing a part of it, when generated in `shopify-visual-preview-section-list-item` preview container
          // and we cannot find the exact `container` to `load()`, eg. instead of ID of `template--20722209358146__eyJzZWN0aW9uIjoi` we get an ID of `template--20722209358146__`
          // Updating the `container` variable here is solely for the purpose of getting the proper container when this is the case
          if (container === null) {
            // This should be done only for theme editor's visual preview so that the section's JS is loaded inside it and the preview is not broken
            // Eventually, in case we still cannot get hold of the right `container`, preview should still look decent, by rendering a section's Liquid, CSS and Web Components
            container = event.target.querySelector(`[${attributes$J.id}]`);
          }
        }

        if (container !== null) {
          load(container.getAttribute(attributes$J.type), container);
        }
      });

      document.addEventListener('shopify:section:reorder', function (event) {
        var id = event.detail.sectionId;
        var container = event.target.querySelector('[' + attributes$J.id + '="' + id + '"]');
        var instance = getInstances(container)[0];

        if (typeof instance === 'object') {
          reorder(container);
        }
      });

      document.addEventListener('shopify:section:unload', function (event) {
        var id = event.detail.sectionId;
        var container = event.target.querySelector('[' + attributes$J.id + '="' + id + '"]');
        var instance = getInstances(container)[0];

        if (typeof instance === 'object') {
          unload(container);
        }
      });

      document.addEventListener('shopify:section:select', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onSelect(event);
        }
      });

      document.addEventListener('shopify:section:deselect', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onDeselect(event);
        }
      });

      document.addEventListener('shopify:block:select', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onBlockSelect(event);
        }
      });

      document.addEventListener('shopify:block:deselect', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onBlockDeselect(event);
        }
      });
    }

    const throttle = (fn, wait) => {
      let prev, next;
      return function invokeFn(...args) {
        const now = Date.now();
        next = clearTimeout(next);
        if (!prev || now - prev >= wait) {
          // eslint-disable-next-line prefer-spread
          fn.apply(null, args);
          prev = now;
        } else {
          next = setTimeout(invokeFn.bind(null, ...args), wait - (now - prev));
        }
      };
    };

    function FetchError(object) {
      this.status = object.status || null;
      this.headers = object.headers || null;
      this.json = object.json || null;
      this.body = object.body || null;
    }
    FetchError.prototype = Error.prototype;

    const selectors$12 = {
      single: '[data-collapsible-single]', // Add this attribute when we want only one item expanded at the same time
      trigger: '[data-collapsible-trigger]',
      content: '[data-collapsible-content]',
    };

    const classes$T = {
      isExpanded: 'is-expanded',
    };

    const attributes$I = {
      expanded: 'aria-expanded',
      controls: 'aria-controls',
      triggerMobile: 'data-collapsible-trigger-mobile',
      transitionOverride: 'data-collapsible-transition-override',
    };

    const settings$8 = {
      animationDelay: 500,
    };

    const sections$C = {};

    class Collapsible {
      constructor(container) {
        this.container = container;
        this.single = this.container.querySelector(selectors$12.single);
        this.triggers = this.container.querySelectorAll(selectors$12.trigger);
        this.resetHeightTimer = 0;
        this.isTransitioning = false;
        this.transitionOverride = this.container.hasAttribute(attributes$I.transitionOverride);
        this.collapsibleToggleEvent = (event) => throttle(this.collapsibleToggle(event), 1250);

        this.init();
      }

      init() {
        this.triggers.forEach((trigger) => {
          trigger.addEventListener('click', this.collapsibleToggleEvent);
          trigger.addEventListener('keyup', this.collapsibleToggleEvent);
        });
      }

      collapsibleToggle(e) {
        e.preventDefault();

        const trigger = e.target.matches(selectors$12.trigger) ? e.target : e.target.closest(selectors$12.trigger);
        const dropdownId = trigger.getAttribute(attributes$I.controls);
        const dropdown = document.getElementById(dropdownId);
        const triggerMobile = trigger.hasAttribute(attributes$I.triggerMobile);
        const isExpanded = trigger.classList.contains(classes$T.isExpanded);
        const isSpace = e.code === theme.keyboardKeys.SPACE;
        const isEscape = e.code === theme.keyboardKeys.ESCAPE;
        const isMobile = window.innerWidth < theme.sizes.small;

        // Do nothing if transitioning
        if (this.isTransitioning && !this.transitionOverride) {
          return;
        }

        // Do nothing if any different than ESC and Space key pressed
        if (e.code && !isSpace && !isEscape) {
          return;
        }

        // Do nothing if ESC key pressed and not expanded or mobile trigger clicked and screen not mobile
        if ((!isExpanded && isEscape) || (triggerMobile && !isMobile)) {
          return;
        }

        this.isTransitioning = true;
        trigger.disabled = true;

        // When we want only one item expanded at the same time
        if (this.single) {
          this.triggers.forEach((otherTrigger) => {
            const isExpanded = otherTrigger.classList.contains(classes$T.isExpanded);

            if (trigger == otherTrigger || !isExpanded) return;

            const dropdownId = otherTrigger.getAttribute(attributes$I.controls);
            const dropdown = document.getElementById(dropdownId);

            requestAnimationFrame(() => {
              this.closeItem(dropdown, otherTrigger);
            });
          });
        }

        // requestAnimationFrame fixes content jumping when item is sliding down
        if (isExpanded) {
          requestAnimationFrame(() => {
            this.closeItem(dropdown, trigger);
          });
        } else {
          requestAnimationFrame(() => {
            this.openItem(dropdown, trigger);
          });
        }
      }

      openItem(dropdown, trigger) {
        let dropdownHeight = dropdown.querySelector(selectors$12.content).offsetHeight;

        this.setDropdownHeight(dropdown, dropdownHeight, trigger, true);
        trigger.classList.add(classes$T.isExpanded);
        trigger.setAttribute(attributes$I.expanded, true);

        trigger.dispatchEvent(
          new CustomEvent('theme:form:sticky', {
            bubbles: true,
            detail: {
              element: 'accordion',
            },
          })
        );
      }

      closeItem(dropdown, trigger) {
        let dropdownHeight = dropdown.querySelector(selectors$12.content).offsetHeight;

        requestAnimationFrame(() => {
          dropdownHeight = 0;
          this.setDropdownHeight(dropdown, dropdownHeight, trigger, false);
          trigger.classList.remove(classes$T.isExpanded);
        });

        this.setDropdownHeight(dropdown, dropdownHeight, trigger, false);
        trigger.classList.remove(classes$T.isExpanded);
        trigger.setAttribute(attributes$I.expanded, false);
      }

      setDropdownHeight(dropdown, dropdownHeight, trigger, isExpanded) {
        dropdown.style.height = `${dropdownHeight}px`;
        dropdown.setAttribute(attributes$I.expanded, isExpanded);
        dropdown.classList.toggle(classes$T.isExpanded, isExpanded);

        if (this.resetHeightTimer) {
          clearTimeout(this.resetHeightTimer);
        }

        if (dropdownHeight == 0) {
          this.resetHeightTimer = setTimeout(() => {
            dropdown.style.height = '';
          }, settings$8.animationDelay);
        }

        if (isExpanded) {
          this.resetHeightTimer = setTimeout(() => {
            dropdown.style.height = 'auto';
            this.isTransitioning = false;
          }, settings$8.animationDelay);
        } else {
          this.isTransitioning = false;
        }

        // Always remove trigger disabled attribute after animation completes
        setTimeout(() => {
          trigger.disabled = false;
        }, settings$8.animationDelay);
      }

      onUnload() {
        this.triggers.forEach((trigger) => {
          trigger.removeEventListener('click', this.collapsibleToggleEvent);
          trigger.removeEventListener('keyup', this.collapsibleToggleEvent);
        });
      }
    }

    const collapsible = {
      onLoad() {
        sections$C[this.id] = new Collapsible(this.container);
      },
      onUnload() {
        sections$C[this.id].onUnload();
      },
    };

    const selectors$11 = {
      quantityHolder: '[data-quantity-holder]',
      quantityField: '[data-quantity-field]',
      quantityButton: '[data-quantity-button]',
      quantityMinusButton: '[data-quantity-minus]',
      quantityPlusButton: '[data-quantity-plus]',
    };

    const classes$S = {
      quantityReadOnly: 'read-only',
      isDisabled: 'is-disabled',
    };

    class QuantityCounter {
      constructor(holder, inCart = false) {
        this.holder = holder;
        this.quantityUpdateCart = inCart;
      }

      init() {
        // DOM Elements
        this.quantity = this.holder.querySelector(selectors$11.quantityHolder);

        if (!this.quantity) {
          return;
        }

        this.field = this.quantity.querySelector(selectors$11.quantityField);
        this.buttons = this.quantity.querySelectorAll(selectors$11.quantityButton);
        this.increaseButton = this.quantity.querySelector(selectors$11.quantityPlusButton);

        // Set value or classes
        this.quantityValue = Number(this.field.value || 0);
        this.cartItemID = this.field.getAttribute('data-id');
        this.maxValue = Number(this.field.getAttribute('max')) > 0 ? Number(this.field.getAttribute('max')) : null;
        this.minValue = Number(this.field.getAttribute('min')) > 0 ? Number(this.field.getAttribute('min')) : 0;
        this.disableIncrease = this.disableIncrease.bind(this);

        // Flags
        this.emptyField = false;

        // Methods
        this.updateQuantity = this.updateQuantity.bind(this);
        this.decrease = this.decrease.bind(this);
        this.increase = this.increase.bind(this);

        this.disableIncrease();

        // Events
        if (!this.quantity.classList.contains(classes$S.quantityReadOnly)) {
          this.changeValueOnClick();
          this.changeValueOnInput();
        }
      }

      /**
       * Change field value when click on quantity buttons
       *
       * @return  {Void}
       */

      changeValueOnClick() {
        this.buttons.forEach((element) => {
          element.addEventListener('click', (event) => {
            event.preventDefault();

            this.quantityValue = Number(this.field.value || 0);

            const clickedElement = event.target;
            const isDescrease = clickedElement.matches(selectors$11.quantityMinusButton) || clickedElement.closest(selectors$11.quantityMinusButton);
            const isIncrease = clickedElement.matches(selectors$11.quantityPlusButton) || clickedElement.closest(selectors$11.quantityPlusButton);

            if (isDescrease) {
              this.decrease();
            }

            if (isIncrease) {
              this.increase();
            }

            this.updateQuantity();
          });
        });
      }

      /**
       * Change field value when input new value in a field
       *
       * @return  {Void}
       */

      changeValueOnInput() {
        this.field.addEventListener('input', () => {
          this.quantityValue = this.field.value;
          this.updateQuantity();
        });
      }

      /**
       * Update field value
       *
       * @return  {Void}
       */

      updateQuantity() {
        if (this.maxValue < this.quantityValue && this.maxValue !== null) {
          this.quantityValue = this.maxValue;
        }

        if (this.minValue > this.quantityValue) {
          this.quantityValue = this.minValue;
        }

        this.field.value = this.quantityValue;

        this.disableIncrease();

        document.dispatchEvent(new CustomEvent('theme:cart:update'));

        if (this.quantityUpdateCart) {
          this.updateCart();
        }
      }

      /**
       * Decrease value
       *
       * @return  {Void}
       */

      decrease() {
        if (this.quantityValue > this.minValue) {
          this.quantityValue--;

          return;
        }

        this.quantityValue = 0;
      }

      /**
       * Increase value
       *
       * @return  {Void}
       */

      increase() {
        this.quantityValue++;
      }

      /**
       * Disable increase
       *
       * @return  {[type]}  [return description]
       */

      disableIncrease() {
        this.increaseButton.classList.toggle(classes$S.isDisabled, this.quantityValue >= this.maxValue && this.maxValue !== null);
      }

      updateCart() {
        if (this.quantityValue === '') return;

        const event = new CustomEvent('theme:cart:update', {
          bubbles: true,
          detail: {
            id: this.cartItemID,
            quantity: this.quantityValue,
          },
        });

        this.holder.dispatchEvent(event);
      }
    }

    const a11y = {
      /**
       * A11y Helpers
       * -----------------------------------------------------------------------------
       * A collection of useful functions that help make your theme more accessible
       */

      state: {
        firstFocusable: null,
        lastFocusable: null,
        trigger: null,
      },

      trapFocus: function (options) {
        var focusableElements = Array.from(options.container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex^="-"])')).filter(function (element) {
          var width = element.offsetWidth;
          var height = element.offsetHeight;

          return width !== 0 && height !== 0 && getComputedStyle(element).getPropertyValue('display') !== 'none';
        });

        focusableElements = focusableElements.filter(function (element) {
          return !element.classList.contains('deferred-media__poster');
        });

        this.state.firstFocusable = focusableElements[0];
        this.state.lastFocusable = focusableElements[focusableElements.length - 1];

        if (!options.elementToFocus) {
          options.elementToFocus = this.state.firstFocusable || options.container;
        }
        this._setupHandlers();

        document.addEventListener('focusin', this._onFocusInHandler);
        document.addEventListener('focusout', this._onFocusOutHandler);

        options.container.setAttribute('tabindex', '-1');
        options.elementToFocus.focus();
      },

      removeTrapFocus: function (options) {
        const focusVisible = !document.body.classList.contains('no-outline');
        if (options && options.container) {
          options.container.removeAttribute('tabindex');
        }
        document.removeEventListener('focusin', this._onFocusInHandler);

        if (this.state.trigger && focusVisible) {
          this.state.trigger.focus();
        }
      },

      _manageFocus: function (evt) {
        if (evt.code !== theme.keyboardKeys.TAB) {
          return;
        }

        /**
         * On the last focusable element and tab forward,
         * focus the first element.
         */
        if (evt.target === this.state.lastFocusable && !evt.shiftKey) {
          evt.preventDefault();
          this.state.firstFocusable.focus();
        }

        /**
         * On the first focusable element and tab backward,
         * focus the last element.
         */
        if (evt.target === this.state.firstFocusable && evt.shiftKey) {
          evt.preventDefault();
          this.state.lastFocusable.focus();
        }
      },

      _onFocusOut: function () {
        document.removeEventListener('keydown', this._manageFocusHandler);
      },

      _onFocusIn: function (evt) {
        if (evt.target !== this.state.lastFocusable && evt.target !== this.state.firstFocusable) {
          return;
        }

        document.addEventListener('keydown', this._manageFocusHandler);
      },

      _setupHandlers: function () {
        if (!this._onFocusInHandler) {
          this._onFocusInHandler = this._onFocusIn.bind(this);
        }

        if (!this._onFocusOutHandler) {
          this._onFocusOutHandler = this._onFocusIn.bind(this);
        }

        if (!this._manageFocusHandler) {
          this._manageFocusHandler = this._manageFocus.bind(this);
        }
      },
    };

    function getScript(url, callback, callbackError) {
      let head = document.getElementsByTagName('head')[0];
      let done = false;
      let script = document.createElement('script');
      script.src = url;

      // Attach handlers for all browsers
      script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
          done = true;
          callback();
        } else {
          callbackError();
        }
      };

      head.appendChild(script);
    }

    const loaders = {};
    window.isYoutubeAPILoaded = false;
    window.isVimeoAPILoaded = false;

    function loadScript(options = {}) {
      if (!options.type) {
        options.type = 'json';
      }

      if (options.url) {
        if (loaders[options.url]) {
          return loaders[options.url];
        } else {
          return getScriptWithPromise(options.url, options.type);
        }
      } else if (options.json) {
        if (loaders[options.json]) {
          return Promise.resolve(loaders[options.json]);
        } else {
          return window
            .fetch(options.json)
            .then((response) => {
              return response.json();
            })
            .then((response) => {
              loaders[options.json] = response;
              return response;
            });
        }
      } else if (options.name) {
        const key = ''.concat(options.name, options.version);
        if (loaders[key]) {
          return loaders[key];
        } else {
          return loadShopifyWithPromise(options);
        }
      } else {
        return Promise.reject();
      }
    }

    function getScriptWithPromise(url, type) {
      const loader = new Promise((resolve, reject) => {
        if (type === 'text') {
          fetch(url)
            .then((response) => response.text())
            .then((data) => {
              resolve(data);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          getScript(
            url,
            function () {
              resolve();
            },
            function () {
              reject();
            }
          );
        }
      });

      loaders[url] = loader;
      return loader;
    }

    function loadShopifyWithPromise(options) {
      const key = ''.concat(options.name, options.version);
      const loader = new Promise((resolve, reject) => {
        try {
          window.Shopify.loadFeatures([
            {
              name: options.name,
              version: options.version,
              onLoad: (err) => {
                onLoadFromShopify(resolve, reject, err);
              },
            },
          ]);
        } catch (err) {
          reject(err);
        }
      });
      loaders[key] = loader;
      return loader;
    }

    function onLoadFromShopify(resolve, reject, err) {
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    }

    const selectors$10 = {
      videoIframe: '[data-video-id]',
    };

    const classes$R = {
      loaded: 'loaded',
    };

    const attributes$H = {
      dataEnableSound: 'data-enable-sound',
      dataEnableBackground: 'data-enable-background',
      dataEnableAutoplay: 'data-enable-autoplay',
      dataEnableLoop: 'data-enable-loop',
      dataVideoId: 'data-video-id',
      dataVideoType: 'data-video-type',
    };

    class LoadVideoVimeo {
      constructor(container) {
        this.container = container;
        this.player = this.container.querySelector(selectors$10.videoIframe);

        if (this.player) {
          this.videoID = this.player.getAttribute(attributes$H.dataVideoId);
          this.videoType = this.player.getAttribute(attributes$H.dataVideoType);
          this.enableBackground = this.player.getAttribute(attributes$H.dataEnableBackground) === 'true';
          this.disableSound = this.player.getAttribute(attributes$H.dataEnableSound) === 'false';
          this.enableAutoplay = this.player.getAttribute(attributes$H.dataEnableAutoplay) !== 'false';
          this.enableLoop = this.player.getAttribute(attributes$H.dataEnableLoop) !== 'false';

          if (this.videoType == 'vimeo') {
            this.init();
          }
        }
      }

      init() {
        this.loadVimeoPlayer();
      }

      loadVimeoPlayer() {
        const oembedUrl = 'https://vimeo.com/api/oembed.json';
        const vimeoUrl = 'https://vimeo.com/' + this.videoID;
        let paramsString = '';
        const state = this.player;

        const params = {
          url: vimeoUrl,
          background: this.enableBackground,
          muted: this.disableSound,
          autoplay: this.enableAutoplay,
          loop: this.enableLoop,
        };

        for (let key in params) {
          paramsString += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&';
        }

        fetch(`${oembedUrl}?${paramsString}`)
          .then((response) => response.json())
          .then(function (data) {
            state.innerHTML = data.html;

            setTimeout(function () {
              state.parentElement.classList.add(classes$R.loaded);
            }, 1000);
          })
          .catch(function () {
            console.log('error');
          });
      }
    }

    const selectors$$ = {
      videoIframe: '[data-video-id]',
      videoWrapper: '.video-wrapper',
      youtubeWrapper: '[data-youtube-wrapper]',
    };

    const attributes$G = {
      dataSectionId: 'data-section-id',
      dataEnableSound: 'data-enable-sound',
      dataHideOptions: 'data-hide-options',
      dataCheckPlayerVisibility: 'data-check-player-visibility',
      dataVideoId: 'data-video-id',
      dataVideoType: 'data-video-type',
    };

    const classes$Q = {
      loaded: 'loaded',
    };

    const players = [];

    class LoadVideoYT {
      constructor(container) {
        this.container = container;
        this.player = this.container.querySelector(selectors$$.videoIframe);

        if (this.player) {
          this.videoOptionsVars = {};
          this.videoID = this.player.getAttribute(attributes$G.dataVideoId);
          this.videoType = this.player.getAttribute(attributes$G.dataVideoType);
          if (this.videoType == 'youtube') {
            this.checkPlayerVisibilityFlag = this.player.getAttribute(attributes$G.dataCheckPlayerVisibility) === 'true';
            this.playerID = this.player.querySelector(selectors$$.youtubeWrapper) ? this.player.querySelector(selectors$$.youtubeWrapper).id : this.player.id;
            if (this.player.hasAttribute(selectors$$.dataHideOptions)) {
              this.videoOptionsVars = {
                cc_load_policy: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                playsinline: 1,
                autohide: 0,
                controls: 0,
                branding: 0,
                showinfo: 0,
                rel: 0,
                fs: 0,
                wmode: 'opaque',
              };
            }

            this.init();

            this.container.addEventListener(
              'touchstart',
              function (e) {
                if (e.target.matches(selectors$$.videoWrapper) || e.target.closest(selectors$$.videoWrapper)) {
                  const playerID = e.target.querySelector(selectors$$.videoIframe).id;
                  players[playerID].playVideo();
                }
              },
              {passive: true}
            );
          }
        }
      }

      init() {
        if (window.isYoutubeAPILoaded) {
          this.loadYoutubePlayer();
        } else {
          // Load Youtube API if not loaded yet
          loadScript({url: 'https://www.youtube.com/iframe_api'}).then(() => this.loadYoutubePlayer());
        }
      }

      loadYoutubePlayer() {
        const defaultYoutubeOptions = {
          height: '720',
          width: '1280',
          playerVars: this.videoOptionsVars,
          events: {
            onReady: (event) => {
              const eventIframe = event.target.getIframe();
              const id = eventIframe.id;
              const enableSound = document.querySelector(`#${id}`).getAttribute(attributes$G.dataEnableSound) === 'true';

              eventIframe.setAttribute('tabindex', '-1');

              if (enableSound) {
                event.target.unMute();
              } else {
                event.target.mute();
              }
              event.target.playVideo();

              if (this.checkPlayerVisibilityFlag) {
                this.checkPlayerVisibility(id);

                window.addEventListener(
                  'scroll',
                  throttle(() => {
                    this.checkPlayerVisibility(id);
                  }, 150)
                );
              }
            },
            onStateChange: (event) => {
              // Loop video if state is ended
              if (event.data == 0) {
                event.target.playVideo();
              }
              if (event.data == 1) {
                // video is playing
                event.target.getIframe().parentElement.classList.add(classes$Q.loaded);
              }
            },
          },
        };

        const currentYoutubeOptions = {...defaultYoutubeOptions};
        currentYoutubeOptions.videoId = this.videoID;
        if (this.videoID.length) {
          YT.ready(() => {
            players[this.playerID] = new YT.Player(this.playerID, currentYoutubeOptions);
          });
        }
        window.isYoutubeAPILoaded = true;
      }

      checkPlayerVisibility(id) {
        let playerID;
        if (typeof id === 'string') {
          playerID = id;
        } else if (id.data != undefined) {
          playerID = id.data.id;
        } else {
          return;
        }

        const playerElement = document.getElementById(playerID + '-container');
        if (!playerElement) {
          return;
        }
        const player = players[playerID];
        const box = playerElement.getBoundingClientRect();
        let isVisible = visibilityHelper.isElementPartiallyVisible(playerElement) || visibilityHelper.isElementTotallyVisible(playerElement);

        // Fix the issue when element height is bigger than the viewport height
        if (box.top < 0 && playerElement.clientHeight + box.top >= 0) {
          isVisible = true;
        }

        if (isVisible && player && typeof player.playVideo === 'function') {
          player.playVideo();
        } else if (!isVisible && player && typeof player.pauseVideo === 'function') {
          player.pauseVideo();
        }
      }

      onUnload() {
        const playerID = 'youtube-' + this.container.getAttribute(attributes$G.dataSectionId);
        if (!players[playerID]) {
          return;
        }
        players[playerID].destroy();
      }
    }

    const selectors$_ = {
      notificationForm: '[data-notification-form]',
      notification: '[data-notification]',
      popupClose: '[data-popup-close]',
    };

    const classes$P = {
      popupSuccess: 'pswp--success',
      notificationPopupVisible: 'notification-popup-visible',
    };

    class LoadNotification {
      constructor(popup, pswpElement) {
        this.popup = popup;
        this.pswpElement = pswpElement;
        this.notificationForm = null;
        this.notificationStopSubmit = true;
        this.sessionStorage = window.sessionStorage;
        const notificationWrapper = this.pswpElement.querySelector(selectors$_.notification);
        this.outerCloseEvent = (e) => {
          if (!notificationWrapper.contains(e.target)) {
            this.popup.close();
          }
        };

        this.init();
      }

      init() {
        this.popup.listen('preventDragEvent', (e, isDown, preventObj) => {
          preventObj.prevent = false;
        });

        const notificationFormSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
        this.notificationForm = this.pswpElement.querySelector(selectors$_.notificationForm);
        const closeBtn = this.pswpElement.querySelector(selectors$_.popupClose);
        document.body.classList.add(classes$P.notificationPopupVisible);

        this.pswpElement.addEventListener('mousedown', () => {
          this.popup.framework.unbind(window, 'pointermove pointerup pointercancel', this.popup);
        });

        if (notificationFormSuccess) {
          this.pswpElement.classList.add(classes$P.popupSuccess);
        }

        this.notificationForm.addEventListener('submit', (e) => this.notificationSubmitEvent(e));

        // Custom closing events
        this.pswpElement.addEventListener('click', this.outerCloseEvent);

        closeBtn.addEventListener('click', () => {
          this.popup.close();
        });

        this.popup.listen('destroy', () => {
          this.notificationRemoveStorage();
          this.pswpElement.removeEventListener('click', this.outerCloseEvent);
          document.body.classList.remove(classes$P.notificationPopupVisible);
        });
      }

      notificationSubmitEvent(e) {
        if (this.notificationStopSubmit) {
          e.preventDefault();

          this.notificationRemoveStorage();
          this.notificationWriteStorage();
          this.notificationStopSubmit = false;
          this.notificationForm.submit();
        }
      }

      notificationWriteStorage() {
        if (this.sessionStorage !== undefined) {
          this.sessionStorage.setItem('notification_form_id', this.notificationForm.id);
        }
      }

      notificationRemoveStorage() {
        this.sessionStorage.removeItem('notification_form_id');
      }
    }

    // iOS smooth scrolling fix
    function flickitySmoothScrolling(slider) {
      const flkty = Flickity.data(slider);

      if (!flkty) {
        return;
      }

      flkty.on('dragStart', (event, pointer) => {
        document.ontouchmove = function (e) {
          e.preventDefault();
        };
      });

      flkty.on('dragEnd', (event, pointer) => {
        document.ontouchmove = function (e) {
          return true;
        };
      });
    }

    const hosts = {
      html5: 'html5',
      youtube: 'youtube',
      vimeo: 'vimeo',
    };

    const selectors$Z = {
      deferredMedia: '[data-deferred-media]',
      deferredMediaButton: '[data-deferred-media-button]',
      productMediaWrapper: '[data-product-single-media-wrapper]',
      mediaContainer: '[data-video]',
      mediaHidden: '.media--hidden',
    };

    const classes$O = {
      mediaHidden: 'media--hidden',
    };

    const attributes$F = {
      loaded: 'loaded',
      sectionId: 'data-section-id',
      dataAutoplayVideo: 'data-autoplay-video',
      mediaId: 'data-media-id',
    };

    class ProductVideo {
      constructor(container) {
        this.container = container;
        this.id = this.container.getAttribute(attributes$F.sectionId);
        this.autoplayVideo = this.container.getAttribute(attributes$F.dataAutoplayVideo) === 'true';
        this.players = {};
        this.pauseContainerMedia = (mediaId, container = this.container) => this.pauseOtherMedia(mediaId, container);
        this.init();
      }

      init() {
        const mediaContainers = this.container.querySelectorAll(selectors$Z.mediaContainer);

        mediaContainers.forEach((mediaContainer) => {
          const deferredMediaButton = mediaContainer.querySelector(selectors$Z.deferredMediaButton);

          if (deferredMediaButton) {
            deferredMediaButton.addEventListener('click', this.loadContent.bind(this, mediaContainer));
          }

          if (this.autoplayVideo) {
            this.loadContent(mediaContainer);
          }
        });
      }

      loadContent(mediaContainer) {
        if (mediaContainer.querySelector(selectors$Z.deferredMedia).getAttribute(attributes$F.loaded)) {
          return;
        }

        const content = document.createElement('div');
        content.appendChild(mediaContainer.querySelector('template').content.firstElementChild.cloneNode(true));
        const mediaId = mediaContainer.dataset.mediaId;
        const element = content.querySelector('video, iframe');
        const host = this.hostFromVideoElement(element);
        const deferredMedia = mediaContainer.querySelector(selectors$Z.deferredMedia);
        deferredMedia.appendChild(element);
        deferredMedia.setAttribute('loaded', true);

        this.players[mediaId] = {
          mediaId: mediaId,
          sectionId: this.id,
          container: mediaContainer,
          element: element,
          host: host,
          ready: () => {
            this.createPlayer(mediaId);
          },
        };

        const video = this.players[mediaId];

        switch (video.host) {
          case hosts.html5:
            this.loadVideo(video, hosts.html5);
            break;
          case hosts.vimeo:
            if (window.isVimeoAPILoaded) {
              this.loadVideo(video, hosts.vimeo);
            } else {
              loadScript({url: 'https://player.vimeo.com/api/player.js'}).then(() => this.loadVideo(video, hosts.vimeo));
            }
            break;
          case hosts.youtube:
            if (window.isYoutubeAPILoaded) {
              this.loadVideo(video, hosts.youtube);
            } else {
              loadScript({url: 'https://www.youtube.com/iframe_api'}).then(() => this.loadVideo(video, hosts.youtube));
            }
            break;
        }
      }

      hostFromVideoElement(video) {
        if (video.tagName === 'VIDEO') {
          return hosts.html5;
        }

        if (video.tagName === 'IFRAME') {
          if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(video.src)) {
            return hosts.youtube;
          } else if (video.src.includes('vimeo.com')) {
            return hosts.vimeo;
          }
        }

        return null;
      }

      loadVideo(video, host) {
        if (video.host === host) {
          video.ready();
        }
      }

      createPlayer(mediaId) {
        const video = this.players[mediaId];

        switch (video.host) {
          case hosts.html5:
            video.element.addEventListener('play', () => {
              video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
            });

            video.element.addEventListener('pause', () => {
              video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
            });

            if (this.autoplayVideo) {
              this.observeVideo(video, mediaId);
            }

            break;
          case hosts.vimeo:
            video.player = new Vimeo.Player(video.element);
            video.player.play(); // Force video play on iOS
            video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});

            window.isVimeoAPILoaded = true;

            video.player.on('play', () => {
              video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
            });

            video.player.on('pause', () => {
              video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
            });

            if (this.autoplayVideo) {
              this.observeVideo(video, mediaId);
            }

            break;
          case hosts.youtube:
            if (video.host == hosts.youtube && video.player) {
              return;
            }

            YT.ready(() => {
              const videoId = video.container.dataset.videoId;

              video.player = new YT.Player(video.element, {
                videoId: videoId,
                events: {
                  onReady: (event) => {
                    event.target.playVideo(); // Force video play on iOS
                    video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
                  },
                  onStateChange: (event) => {
                    // Playing
                    if (event.data == 1) {
                      video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
                    }

                    // Paused
                    if (event.data == 2) {
                      video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
                    }

                    // Ended
                    if (event.data == 0) {
                      video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
                    }
                  },
                },
              });

              window.isYoutubeAPILoaded = true;

              if (this.autoplayVideo) {
                this.observeVideo(video, mediaId);
              }
            });

            break;
        }

        video.container.addEventListener('theme:media:visible', (event) => this.onVisible(event));
        video.container.addEventListener('theme:media:hidden', (event) => this.onHidden(event));
        video.container.addEventListener('xrLaunch', (event) => this.onHidden(event));
      }

      observeVideo(video) {
        let observer = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              const outsideViewport = entry.intersectionRatio == 0;
              const isVisible = !video.element.closest(selectors$Z.mediaHidden);

              if (outsideViewport) {
                this.pauseVideo(video);
              } else if (isVisible) {
                this.playVideo(video);
              }
            });
          },
          {
            rootMargin: '200px',
            threshold: [0, 0.25, 0.75, 1],
          }
        );
        observer.observe(video.element);
      }

      playVideo(video) {
        if (video.player && video.player.playVideo) {
          video.player.playVideo();
        } else if (video.element && video.element.play) {
          video.element.play();
        } else if (video.player && video.player.play) {
          video.player.play();
        }

        video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
      }

      pauseVideo(video) {
        if (video.player && video.player.pauseVideo) {
          // Youtube
          if (video.player.playerInfo.playerState == '1') {
            // If Youtube video is playing
            // There is no need to trigger the 'pause' event since we are listening for it when initializing the YT Video
            video.player.pauseVideo();
          }
        } else if (video.player && video.player.pause) {
          // Vimeo
          video.player.pause();
        } else if (video.element && !video.element.paused) {
          // HTML5
          // If HTML5 video is playing (we used .paused because there is no 'playing' property)
          if (typeof video.element.pause === 'function') {
            video.element?.pause();
          }
        }
      }

      onHidden(event) {
        if (typeof event.target.dataset.mediaId !== 'undefined') {
          const mediaId = event.target.dataset.mediaId;
          const video = this.players[mediaId];
          this.pauseVideo(video);
        }
      }

      onVisible(event) {
        if (typeof event.target.dataset.mediaId !== 'undefined') {
          const mediaId = event.target.dataset.mediaId;
          const video = this.players[mediaId];

          // Using a timeout so the video "play" event can triggers after the previous video "pause" event
          // because both events change the "draggable" option of the slider and we need to time it right
          setTimeout(() => {
            this.playVideo(video);
          }, 50);

          this.pauseContainerMedia(mediaId);
        }
      }

      pauseOtherMedia(mediaId, container) {
        const currentMedia = `[${attributes$F.mediaId}="${mediaId}"]`;
        const otherMedia = container.querySelectorAll(`${selectors$Z.productMediaWrapper}:not(${currentMedia})`);

        if (otherMedia.length) {
          otherMedia.forEach((media) => {
            media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
            media.classList.add(classes$O.mediaHidden);
          });
        }
      }
    }

    function getSearchParams(searchForm, filtersForm, deleteParams = [], type = false) {
      const searchFormData = new FormData(searchForm);
      const searchFormParams = new URLSearchParams(searchFormData);

      if (!filtersForm) return searchFormParams.toString();

      const filtersFormData = new FormData(filtersForm);
      const filtersFormParams = new URLSearchParams(filtersFormData);

      // Get keys with empty values from the search-form and filters-form's FormData objects and delete them
      const emptyParams = [];
      for (const pair of searchFormData.entries()) {
        if (pair[1] === '') emptyParams.push(pair[0]);
      }
      for (const pair of filtersFormData.entries()) {
        if (pair[1] === '') emptyParams.push(pair[0]);
      }
      for (let index = 0; index < emptyParams.length; index++) {
        const param = emptyParams[index];
        if (searchFormParams.has(param)) searchFormParams.delete(param);
        if (filtersFormParams.has(param)) filtersFormParams.delete(param);
      }

      // Delete duplicated keys gotten from the filters FormData object
      for (const key of searchFormParams.keys()) {
        if (filtersFormParams.has(key)) filtersFormParams.delete(key);
      }

      // Delete keys from deleteParams array
      if (deleteParams.length > 0) {
        for (let index = 0; index < deleteParams.length; index++) {
          const param = deleteParams[index];
          if (searchFormParams.has(param)) searchFormParams.delete(param);
          if (filtersFormParams.has(param)) filtersFormParams.delete(param);
        }
      }

      // Replace type key if necessary
      if (type) {
        if (filtersFormParams.has('type')) filtersFormParams.delete('type');
        searchFormParams.set('type', type);
      }

      return `${searchFormParams.toString()}&${filtersFormParams.toString()}`;
    }

    const selectors$Y = {
      scrollbar: '[data-custom-scrollbar]',
      scrollbarItems: '[data-custom-scrollbar-items]',
      scrollbarThumb: '[data-custom-scrollbar-thumb]',
      current: '.current',
    };

    class CustomScrollbar {
      constructor(container) {
        this.container = container;
        this.scrollbarItems = container.querySelector(selectors$Y.scrollbarItems);
        this.scrollbar = container.querySelector(selectors$Y.scrollbar);
        this.scrollbarThumb = container.querySelector(selectors$Y.scrollbarThumb);
        this.trackWidth = 0;
        this.calcScrollbarEvent = () => this.calculateScrollbar();
        this.onScrollbarChangeEvent = (e) => this.onScrollbarChange(e);

        if (this.scrollbar && this.scrollbarItems) {
          this.events();
          this.calculateScrollbar();
          if (this.scrollbarItems.children.length) {
            this.calculateTrack(this.scrollbarItems.querySelector(selectors$Y.current));
          }
        }
      }

      calculateTrack(element) {
        if (!element) {
          this.scrollbar.style.setProperty('--thumb-scale', 0);
          this.scrollbar.style.setProperty('--thumb-position', '0px');
          return;
        }

        const thumbScale = element.clientWidth / this.scrollbarThumb.parentElement.clientWidth;
        const thumbPosition = element.offsetLeft / this.scrollbarThumb.parentElement.clientWidth;
        this.scrollbar.style.setProperty('--thumb-scale', thumbScale);
        this.scrollbar.style.setProperty('--thumb-position', `${this.trackWidth * thumbPosition}px`);
      }

      calculateScrollbar() {
        if (this.scrollbarItems.children.length) {
          const childrenArr = [...this.scrollbarItems.children];
          this.trackWidth = 0;

          childrenArr.forEach((element) => {
            this.trackWidth += element.getBoundingClientRect().width + parseInt(window.getComputedStyle(element).marginRight);
          });
          this.scrollbar.style.setProperty('--track-width', `${this.trackWidth}px`);
        }
      }

      onScrollbarChange(e) {
        if (e && e.detail && e.detail.element && this.container.contains(e.detail.element)) {
          this.calculateTrack(e.detail.element);
        }
      }

      events() {
        document.addEventListener('theme:resize:width', this.calcScrollbarEvent);
        document.addEventListener('theme:custom-scrollbar:change', this.onScrollbarChangeEvent);
      }

      unload() {
        document.removeEventListener('theme:resize:width', this.calcScrollbarEvent);
        document.removeEventListener('theme:custom-scrollbar:change', this.onScrollbarChangeEvent);
      }
    }

    const selectors$X = {
      tooltip: '[data-tooltip]',
      tooltipContainer: '[data-tooltip-container]',
      tooltipArrow: '[data-tooltip-arrow]',
      aos: '[data-aos]',
    };

    const classes$N = {
      root: 'tooltip-default',
      isAnimating: 'is-animating',
      visible: 'is-visible',
      hiding: 'is-hiding',
    };

    const attributes$E = {
      aos: 'data-aos',
      tooltip: 'data-tooltip',
      tooltipContainer: 'data-tooltip-container',
      tooltipStopMouseEnter: 'data-tooltip-stop-mouseenter',
    };

    const sections$B = {};

    class Tooltip {
      constructor(el) {
        this.tooltip = el;
        if (!this.tooltip.hasAttribute(attributes$E.tooltip)) {
          return;
        }

        this.rootClass = classes$N.root;
        this.isAnimatingClass = classes$N.isAnimating;
        this.label = this.tooltip.getAttribute(attributes$E.tooltip);
        this.transitionSpeed = 200;
        this.hideTransitionTimeout = 0;
        this.animatedContainer = this.tooltip.closest(selectors$X.aos);
        this.addPinEvent = () => this.addPin();
        this.addPinMouseEvent = () => this.addPin(true);
        this.removePinEvent = (event) => throttle(this.removePin(event), 50);
        this.removePinMouseEvent = (event) => this.removePin(event, true, true);
        this.init();
      }

      init() {
        if (!document.querySelector(selectors$X.tooltipContainer)) {
          const tooltipTemplate = `<div class="${this.rootClass}__inner"><div class="${this.rootClass}__arrow" data-tooltip-arrow></div><div class="${this.rootClass}__text label-typography"></div></div>`;
          const tooltipElement = document.createElement('div');
          tooltipElement.className = `${this.rootClass} ${this.isAnimatingClass}`;
          tooltipElement.setAttribute(attributes$E.tooltipContainer, '');
          tooltipElement.innerHTML = tooltipTemplate;
          document.body.appendChild(tooltipElement);
        }

        this.tooltip.addEventListener('mouseenter', this.addPinMouseEvent);
        this.tooltip.addEventListener('mouseleave', this.removePinMouseEvent);
        this.tooltip.addEventListener('theme:tooltip:init', this.addPinEvent);
        document.addEventListener('theme:tooltip:close', this.removePinEvent);

        const tooltipTarget = document.querySelector(selectors$X.tooltipContainer);

        if (theme.settings.animations && this.animatedContainer) {
          if (this.animatedContainer.getAttribute(attributes$E.aos) === 'hero') {
            // Used for PDP and Featured product section
            this.animatedContainer.addEventListener('animationend', () => {
              tooltipTarget.classList.remove(classes$N.isAnimating);
            });
          } else {
            this.animatedContainer.addEventListener('transitionend', (event) => {
              // This will fire the event when the last transition end
              if (event.propertyName === 'transform') {
                tooltipTarget.classList.remove(classes$N.isAnimating);
              }
            });
          }
        }
      }

      addPin(stopMouseEnter = false) {
        const tooltipTarget = document.querySelector(selectors$X.tooltipContainer);
        const tooltipTargetArrow = tooltipTarget.querySelector(selectors$X.tooltipArrow);

        if (tooltipTarget && ((stopMouseEnter && !this.tooltip.hasAttribute(attributes$E.tooltipStopMouseEnter)) || !stopMouseEnter)) {
          const tooltipTargetInner = tooltipTarget.querySelector(`.${this.rootClass}__inner`);
          const tooltipTargetText = tooltipTarget.querySelector(`.${this.rootClass}__text`);
          tooltipTargetText.textContent = this.label;

          const tooltipTargetWidth = tooltipTargetInner.offsetWidth;
          const tooltipRect = this.tooltip.getBoundingClientRect();
          const tooltipTop = tooltipRect.top;
          const tooltipWidth = tooltipRect.width;
          const tooltipHeight = tooltipRect.height;
          const tooltipTargetPositionTop = tooltipTop + tooltipHeight + window.scrollY;
          let tooltipTargetPositionLeft = tooltipRect.left - tooltipTargetWidth / 2 + tooltipWidth / 2;
          let tooltipArrowPositionLeft = '50%';
          const tooltipLeftWithWidth = tooltipTargetPositionLeft + tooltipTargetWidth;
          const tooltipTargetWindowDifference = tooltipLeftWithWidth - window.innerWidth;

          if (tooltipTargetWindowDifference > 0) {
            tooltipTargetPositionLeft -= tooltipTargetWindowDifference;
          }

          if (tooltipTargetPositionLeft < 0) {
            tooltipArrowPositionLeft = `calc(50% + ${tooltipTargetPositionLeft}px)`;
            tooltipTargetPositionLeft = 0;
          }

          tooltipTargetArrow.style.left = tooltipArrowPositionLeft;
          tooltipTarget.style.transform = `translate(${tooltipTargetPositionLeft}px, ${tooltipTargetPositionTop}px)`;

          tooltipTarget.classList.remove(classes$N.hiding);
          const onTooltipHiding = (event) => {
            if (event.target !== tooltipTargetInner) return;
            if (event.propertyName === 'transform' || event.propertyName === 'opacity') {
              requestAnimationFrame(() => (tooltipTarget.style.transform = 'translate(0, -100%)'));
            }
            tooltipTarget.removeEventListener('transitionend', onTooltipHiding);
          };
          tooltipTarget.addEventListener('transitionend', onTooltipHiding);

          tooltipTarget.classList.add(classes$N.visible);

          document.addEventListener('theme:scroll', this.removePinEvent);
        }
      }

      removePin(event, stopMouseEnter = false, hideTransition = false) {
        const tooltipTarget = document.querySelector(selectors$X.tooltipContainer);
        const tooltipVisible = tooltipTarget.classList.contains(classes$N.visible);

        if (tooltipTarget && ((stopMouseEnter && !this.tooltip.hasAttribute(attributes$E.tooltipStopMouseEnter)) || !stopMouseEnter)) {
          if (tooltipVisible && (hideTransition || event.detail.hideTransition)) {
            tooltipTarget.classList.add(classes$N.hiding);

            if (this.hideTransitionTimeout) {
              clearTimeout(this.hideTransitionTimeout);
            }

            this.hideTransitionTimeout = setTimeout(() => {
              tooltipTarget.classList.remove(classes$N.hiding);
            }, this.transitionSpeed);
          }

          tooltipTarget.classList.remove(classes$N.visible);

          document.removeEventListener('theme:scroll', this.removePinEvent);
        }
      }

      unload() {
        this.tooltip.removeEventListener('mouseenter', this.addPinMouseEvent);
        this.tooltip.removeEventListener('mouseleave', this.removePinMouseEvent);
        this.tooltip.removeEventListener('theme:tooltip:init', this.addPinEvent);
        document.removeEventListener('theme:tooltip:close', this.removePinEvent);
        document.removeEventListener('theme:scroll', this.removePinEvent);
      }
    }

    const tooltip = {
      onLoad() {
        sections$B[this.id] = [];
        const tooltips = this.container.querySelectorAll(selectors$X.tooltip);
        tooltips.forEach((tooltip) => {
          sections$B[this.id].push(new Tooltip(tooltip));
        });
      },
      onUnload() {
        sections$B[this.id].forEach((tooltip) => {
          if (typeof tooltip.unload === 'function') {
            tooltip.unload();
          }
        });
      },
    };

    const selectors$W = {
      rangeSlider: '[data-range-slider]',
      rangeDotLeft: '[data-range-left]',
      rangeDotRight: '[data-range-right]',
      rangeLine: '[data-range-line]',
      rangeHolder: '[data-range-holder]',
      dataMin: 'data-se-min',
      dataMax: 'data-se-max',
      dataMinValue: 'data-se-min-value',
      dataMaxValue: 'data-se-max-value',
      dataStep: 'data-se-step',
      dataFilterUpdate: 'data-range-filter-update',
      priceMin: '[data-field-price-min]',
      priceMax: '[data-field-price-max]',
    };

    const classes$M = {
      isInitialized: 'is-initialized',
    };

    class RangeSlider {
      constructor(container) {
        this.container = container;
        this.init();
        this.initListener = () => this.init();

        document.addEventListener('theme:filters:init', this.initListener);
      }

      init() {
        this.slider = this.container.querySelector(selectors$W.rangeSlider);

        if (!this.slider) {
          return;
        }

        this.resizeFilters = debounce(this.reset.bind(this), 50);

        this.onMoveEvent = (event) => this.onMove(event);
        this.onStopEvent = (event) => this.onStop(event);
        this.onStartEvent = (event) => this.onStart(event);
        this.startX = 0;
        this.x = 0;

        // retrieve touch button
        this.touchLeft = this.slider.querySelector(selectors$W.rangeDotLeft);
        this.touchRight = this.slider.querySelector(selectors$W.rangeDotRight);
        this.lineSpan = this.slider.querySelector(selectors$W.rangeLine);

        // get some properties
        this.min = parseFloat(this.slider.getAttribute(selectors$W.dataMin));
        this.max = parseFloat(this.slider.getAttribute(selectors$W.dataMax));

        this.step = 0.0;

        // normalize flag
        this.normalizeFact = 20;

        // retrieve default values
        let defaultMinValue = this.min;
        if (this.slider.hasAttribute(selectors$W.dataMinValue)) {
          defaultMinValue = parseFloat(this.slider.getAttribute(selectors$W.dataMinValue));
        }
        let defaultMaxValue = this.max;

        if (this.slider.hasAttribute(selectors$W.dataMaxValue)) {
          defaultMaxValue = parseFloat(this.slider.getAttribute(selectors$W.dataMaxValue));
        }

        // check values are correct
        if (defaultMinValue < this.min) {
          defaultMinValue = this.min;
        }

        if (defaultMaxValue > this.max) {
          defaultMaxValue = this.max;
        }

        if (defaultMinValue > defaultMaxValue) {
          defaultMinValue = defaultMaxValue;
        }

        if (this.slider.getAttribute(selectors$W.dataStep)) {
          this.step = Math.abs(parseFloat(this.slider.getAttribute(selectors$W.dataStep)));
        }

        // initial reset
        this.reset();
        window.addEventListener('theme:resize', this.resizeFilters);

        // usefull values, min, max, normalize fact is the width of both touch buttons
        this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
        this.selectedTouch = null;
        this.initialValue = this.lineSpan.offsetWidth - this.normalizeFact;

        // set defualt values
        this.setMinValue(defaultMinValue);
        this.setMaxValue(defaultMaxValue);

        // link events
        this.touchLeft.addEventListener('mousedown', this.onStartEvent);
        this.touchRight.addEventListener('mousedown', this.onStartEvent);
        this.touchLeft.addEventListener('touchstart', this.onStartEvent, {passive: true});
        this.touchRight.addEventListener('touchstart', this.onStartEvent, {passive: true});

        // initialize
        this.slider.classList.add(classes$M.isInitialized);
      }

      reset() {
        this.touchLeft.style.left = '0px';
        this.touchRight.style.left = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
        this.lineSpan.style.marginLeft = '0px';
        this.lineSpan.style.width = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
        this.startX = 0;
        this.x = 0;

        this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
        this.initialValue = this.lineSpan.offsetWidth - this.normalizeFact;
      }

      setMinValue(minValue) {
        const ratio = (minValue - this.min) / (this.max - this.min);
        this.touchLeft.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact))) + 'px';
        this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
        this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
        this.slider.setAttribute(selectors$W.dataMinValue, minValue);
      }

      setMaxValue(maxValue) {
        const ratio = (maxValue - this.min) / (this.max - this.min);
        this.touchRight.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact)) + this.normalizeFact) + 'px';
        this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
        this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
        this.slider.setAttribute(selectors$W.dataMaxValue, maxValue);
      }

      onStart(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        let eventTouch = event;

        if (event.touches) {
          eventTouch = event.touches[0];
        }

        if (event.currentTarget === this.touchLeft) {
          this.x = this.touchLeft.offsetLeft;
        } else if (event.currentTarget === this.touchRight) {
          this.x = this.touchRight.offsetLeft;
        }

        this.startX = eventTouch.pageX - this.x;
        this.selectedTouch = event.currentTarget;
        document.addEventListener('mousemove', this.onMoveEvent);
        document.addEventListener('mouseup', this.onStopEvent);
        document.addEventListener('touchmove', this.onMoveEvent, {passive: true});
        document.addEventListener('touchend', this.onStopEvent, {passive: true});
      }

      onMove(event) {
        let eventTouch = event;

        if (event.touches) {
          eventTouch = event.touches[0];
        }

        this.x = eventTouch.pageX - this.startX;

        if (this.selectedTouch === this.touchLeft) {
          if (this.x > this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10) {
            this.x = this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10;
          } else if (this.x < 0) {
            this.x = 0;
          }

          this.selectedTouch.style.left = this.x + 'px';
        } else if (this.selectedTouch === this.touchRight) {
          if (this.x < this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10) {
            this.x = this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10;
          } else if (this.x > this.maxX) {
            this.x = this.maxX;
          }
          this.selectedTouch.style.left = this.x + 'px';
        }

        // update line span
        this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
        this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';

        // write new value
        this.calculateValue();

        // call on change
        if (this.slider.getAttribute('on-change')) {
          const fn = new Function('min, max', this.slider.getAttribute('on-change'));
          fn(this.slider.getAttribute(selectors$W.dataMinValue), this.slider.getAttribute(selectors$W.dataMaxValue));
        }

        this.onChange(this.slider.getAttribute(selectors$W.dataMinValue), this.slider.getAttribute(selectors$W.dataMaxValue));
      }

      onStop(event) {
        document.removeEventListener('mousemove', this.onMoveEvent);
        document.removeEventListener('mouseup', this.onStopEvent);
        document.removeEventListener('touchmove', this.onMoveEvent, {passive: true});
        document.removeEventListener('touchend', this.onStopEvent, {passive: true});

        this.selectedTouch = null;

        // write new value
        this.calculateValue();

        // call did changed
        this.onChanged(this.slider.getAttribute(selectors$W.dataMinValue), this.slider.getAttribute(selectors$W.dataMaxValue));
      }

      onChange(min, max) {
        const rangeHolder = this.slider.closest(selectors$W.rangeHolder);
        if (rangeHolder) {
          const priceMin = rangeHolder.querySelector(selectors$W.priceMin);
          const priceMax = rangeHolder.querySelector(selectors$W.priceMax);

          if (priceMin && priceMax) {
            priceMin.value = parseInt(min);
            priceMax.value = parseInt(max);
          }
        }
      }

      onChanged(min, max) {
        if (this.slider.hasAttribute(selectors$W.dataFilterUpdate)) {
          this.slider.dispatchEvent(new CustomEvent('theme:filter:range-update', {bubbles: true}));
        }
      }

      calculateValue() {
        const newValue = (this.lineSpan.offsetWidth - this.normalizeFact) / this.initialValue;
        let minValue = this.lineSpan.offsetLeft / this.initialValue;
        let maxValue = minValue + newValue;

        minValue = minValue * (this.max - this.min) + this.min;
        maxValue = maxValue * (this.max - this.min) + this.min;

        if (this.step !== 0.0) {
          let multi = Math.floor(minValue / this.step);
          minValue = this.step * multi;

          multi = Math.floor(maxValue / this.step);
          maxValue = this.step * multi;
        }

        if (this.selectedTouch === this.touchLeft) {
          this.slider.setAttribute(selectors$W.dataMinValue, minValue);
        }

        if (this.selectedTouch === this.touchRight) {
          this.slider.setAttribute(selectors$W.dataMaxValue, maxValue);
        }
      }

      unload() {
        document.removeEventListener('theme:filters:init', this.initListener);
        window.removeEventListener('theme:resize', this.resizeFilters);
      }
    }

    function Listeners() {
      this.entries = [];
    }

    Listeners.prototype.add = function (element, event, fn) {
      this.entries.push({element: element, event: event, fn: fn});
      element.addEventListener(event, fn);
    };

    Listeners.prototype.removeAll = function () {
      this.entries = this.entries.filter(function (listener) {
        listener.element.removeEventListener(listener.event, listener.fn);
        return false;
      });
    };

    /**
     * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */
    function getVariantFromSerializedArray(product, collection) {
      _validateProductStructure(product);

      // If value is an array of options
      var optionArray = _createOptionArrayFromOptionCollection(product, collection);
      return getVariantFromOptionArray(product, optionArray);
    }

    /**
     * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */
    function getVariantFromOptionArray(product, options) {
      _validateProductStructure(product);
      _validateOptionsArray(options);

      var result = product.variants.filter(function (variant) {
        return options.every(function (option, index) {
          return variant.options[index] === option;
        });
      });

      return result[0] || null;
    }

    /**
     * Creates an array of selected options from the object
     * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
     * @param {Object} product Product JSON object
     * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
     */
    function _createOptionArrayFromOptionCollection(product, collection) {
      _validateProductStructure(product);
      _validateSerializedArray(collection);

      var optionArray = [];

      collection.forEach(function (option) {
        for (var i = 0; i < product.options.length; i++) {
          var name = product.options[i].name || product.options[i];
          if (name.toLowerCase() === option.name.toLowerCase()) {
            optionArray[i] = option.value;
            break;
          }
        }
      });

      return optionArray;
    }

    /**
     * Check if the product data is a valid JS object
     * Error will be thrown if type is invalid
     * @param {object} product Product JSON object
     */
    function _validateProductStructure(product) {
      if (typeof product !== 'object') {
        throw new TypeError(product + ' is not an object.');
      }

      if (Object.keys(product).length === 0 && product.constructor === Object) {
        throw new Error(product + ' is empty.');
      }
    }

    /**
     * Validate the structure of the array
     * It must be formatted like jQuery's serializeArray()
     * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
     */
    function _validateSerializedArray(collection) {
      if (!Array.isArray(collection)) {
        throw new TypeError(collection + ' is not an array.');
      }

      if (collection.length === 0) {
        throw new Error(collection + ' is empty.');
      }

      if (collection[0].hasOwnProperty('name')) {
        if (typeof collection[0].name !== 'string') {
          throw new TypeError('Invalid value type passed for name of option ' + collection[0].name + '. Value should be string.');
        }
      } else {
        throw new Error(collection[0] + 'does not contain name key.');
      }
    }

    /**
     * Validate the structure of the array
     * It must be formatted as list of values
     * @param {Array} collection Array of object (e.g. ['36', 'Black'])
     */
    function _validateOptionsArray(options) {
      if (Array.isArray(options) && typeof options[0] === 'object') {
        throw new Error(options + 'is not a valid array of options.');
      }
    }

    var selectors$V = {
      idInput: '[name="id"]',
      planInput: '[name="selling_plan"]',
      optionInput: '[name^="options"]',
      quantityInput: '[name="quantity"]',
      propertyInput: '[name^="properties"]',
    };

    // Public Methods
    // -----------------------------------------------------------------------------

    /**
     * Returns a URL with a variant ID query parameter. Useful for updating window.history
     * with a new URL based on the currently select product variant.
     * @param {string} url - The URL you wish to append the variant ID to
     * @param {number} id  - The variant ID you wish to append to the URL
     * @returns {string} - The new url which includes the variant ID query parameter
     */

    function getUrlWithVariant(url, id) {
      if (/variant=/.test(url)) {
        return url.replace(/(variant=)[^&]+/, '$1' + id);
      } else if (/\?/.test(url)) {
        return url.concat('&variant=').concat(id);
      }

      return url.concat('?variant=').concat(id);
    }

    /**
     * Constructor class that creates a new instance of a product form controller.
     *
     * @param {Element} element - DOM element which is equal to the <form> node wrapping product form inputs
     * @param {Object} product - A product object
     * @param {Object} options - Optional options object
     * @param {Function} options.onOptionChange - Callback for whenever an option input changes
     * @param {Function} options.onPlanChange - Callback for changes to name=selling_plan
     * @param {Function} options.onQuantityChange - Callback for whenever an quantity input changes
     * @param {Function} options.onPropertyChange - Callback for whenever a property input changes
     * @param {Function} options.onFormSubmit - Callback for whenever the product form is submitted
     */
    class ProductForm {
      constructor(element, product, options) {
        this.element = element;
        this.form = this.element.tagName == 'FORM' ? this.element : this.element.querySelector('form');
        this.product = this._validateProductObject(product);
        this.variantElement = this.element.querySelector(selectors$V.idInput);

        options = options || {};

        this._listeners = new Listeners();
        this._listeners.add(this.element, 'submit', this._onSubmit.bind(this, options));

        this.optionInputs = this._initInputs(selectors$V.optionInput, options.onOptionChange);

        this.planInputs = this._initInputs(selectors$V.planInput, options.onPlanChange);

        this.quantityInputs = this._initInputs(selectors$V.quantityInput, options.onQuantityChange);

        this.propertyInputs = this._initInputs(selectors$V.propertyInput, options.onPropertyChange);
      }

      /**
       * Cleans up all event handlers that were assigned when the Product Form was constructed.
       * Useful for use when a section needs to be reloaded in the theme editor.
       */
      destroy() {
        this._listeners.removeAll();
      }

      /**
       * Getter method which returns the array of currently selected option values
       *
       * @returns {Array} An array of option values
       */
      options() {
        return this._serializeInputValues(this.optionInputs, function (item) {
          var regex = /(?:^(options\[))(.*?)(?:\])/;
          item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'
          return item;
        });
      }

      /**
       * Getter method which returns the currently selected variant, or `null` if variant
       * doesn't exist.
       *
       * @returns {Object|null} Variant object
       */
      variant() {
        const opts = this.options();
        if (opts.length) {
          return getVariantFromSerializedArray(this.product, opts);
        } else {
          return this.product.variants[0];
        }
      }

      /**
       * Getter method which returns the current selling plan, or `null` if plan
       * doesn't exist.
       *
       * @returns {Object|null} Variant object
       */
      plan(variant) {
        let plan = {
          allocation: null,
          group: null,
          detail: null,
        };
        const formData = new FormData(this.form);
        const id = formData.get('selling_plan');

        if (id && variant) {
          plan.allocation = variant.selling_plan_allocations.find(function (item) {
            return item.selling_plan_id.toString() === id.toString();
          });
        }
        if (plan.allocation) {
          plan.group = this.product.selling_plan_groups.find(function (item) {
            return item.id.toString() === plan.allocation.selling_plan_group_id.toString();
          });
        }
        if (plan.group) {
          plan.detail = plan.group.selling_plans.find(function (item) {
            return item.id.toString() === id.toString();
          });
        }

        if (plan && plan.allocation && plan.detail && plan.allocation) {
          return plan;
        } else return null;
      }

      /**
       * Getter method which returns a collection of objects containing name and values
       * of property inputs
       *
       * @returns {Array} Collection of objects with name and value keys
       */
      properties() {
        return this._serializeInputValues(this.propertyInputs, function (item) {
          var regex = /(?:^(properties\[))(.*?)(?:\])/;
          item.name = regex.exec(item.name)[2]; // Use just the value between 'properties[' and ']'
          return item;
        });
      }

      /**
       * Getter method which returns the current quantity or 1 if no quantity input is
       * included in the form
       *
       * @returns {Array} Collection of objects with name and value keys
       */
      quantity() {
        return this.quantityInputs[0] ? Number.parseInt(this.quantityInputs[0].value, 10) : 1;
      }

      getFormState() {
        const variant = this.variant();
        return {
          options: this.options(),
          variant: variant,
          properties: this.properties(),
          quantity: this.quantity(),
          plan: this.plan(variant),
        };
      }

      // Private Methods
      // -----------------------------------------------------------------------------
      _setIdInputValue(variant) {
        if (variant && variant.id) {
          this.variantElement.value = variant.id.toString();
        } else {
          this.variantElement.value = '';
        }

        this.variantElement.dispatchEvent(new Event('change'));
      }

      _onSubmit(options, event) {
        event.dataset = this.getFormState();
        if (options.onFormSubmit) {
          options.onFormSubmit(event);
        }
      }

      _onOptionChange(event) {
        this._setIdInputValue(event.dataset.variant);
      }

      _onFormEvent(cb) {
        if (typeof cb === 'undefined') {
          return Function.prototype.bind();
        }

        return function (event) {
          event.dataset = this.getFormState();
          this._setIdInputValue(event.dataset.variant);
          cb(event);
        }.bind(this);
      }

      _initInputs(selector, cb) {
        var elements = Array.prototype.slice.call(this.element.querySelectorAll(selector));

        return elements.map(
          function (element) {
            this._listeners.add(element, 'change', this._onFormEvent(cb));
            return element;
          }.bind(this)
        );
      }

      _serializeInputValues(inputs, transform) {
        return inputs.reduce(function (options, input) {
          if (
            input.checked || // If input is a checked (means type radio or checkbox)
            (input.type !== 'radio' && input.type !== 'checkbox') // Or if its any other type of input
          ) {
            options.push(transform({name: input.name, value: input.value}));
          }

          return options;
        }, []);
      }

      _validateProductObject(product) {
        if (typeof product !== 'object') {
          throw new TypeError(product + ' is not an object.');
        }

        if (typeof product.variants[0].options === 'undefined') {
          throw new TypeError('Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route');
        }
        return product;
      }
    }

    function fetchProduct(handle) {
      const requestRoute = `${theme.routes.root}products/${handle}.js`;

      return window
        .fetch(requestRoute)
        .then((response) => {
          return response.json();
        })
        .catch((e) => {
          console.error(e);
        });
    }

    const defaults$1 = {
      color: 'ash',
    };

    const selectors$U = {
      swatch: '[data-swatch]',
      swatchColor: '[data-swatch-color]',
      productBlock: '[data-product-block]',
      productImage: '[data-product-image]',
      productImageSecondary: '[data-product-image-secondary]',
      productImageHover: '[data-product-image-hover]',
      quickView: '[data-button-quick-view]',
      gridImage: '[data-grid-image]',
      link: '[data-grid-link]',
      swatchesMore: '[data-swatches-more]',
      sectionType: '[data-section-type]',
      swatchesContainer: '[data-swatches-container]',
      swatchesLabel: '[data-swatches-label]',
      swatchesButton: '[data-swatches-button]',
      selectorWrapper: '[data-option-position]',
      slider: '[data-slider]',
    };

    const classes$L = {
      mediaVisible: 'product__media--featured-visible',
      mediaHoverVisible: 'product__media__hover-img--visible',
      noImage: 'swatch__link--no-image',
      noOutline: 'no-outline',
      isVisible: 'is-visible',
      selectorLarge: 'selector-wrapper--large',
    };

    const attributes$D = {
      swatch: 'data-swatch',
      handle: 'data-swatch-handle',
      label: 'data-swatch-label',
      image: 'data-swatch-image',
      imageId: 'data-swatch-image-id',
      variant: 'data-swatch-variant',
      variantId: 'data-variant-id',
      variantSecondaryId: 'data-variant-secondary-id',
      loaded: 'data-loaded',
      href: 'href',
    };

    let swatches = {};
    const sections$A = {};

    class ColorMatch {
      constructor(options = {}) {
        this.settings = {
          ...defaults$1,
          ...options,
        };

        this.match = this.init();
      }

      getColor() {
        return this.match;
      }

      init() {
        const getColors = loadScript({json: theme.assets.swatches});
        return getColors
          .then((colors) => {
            return this.matchColors(colors, this.settings.color);
          })
          .catch((e) => {
            console.log('failed to load swatch colors script');
            console.log(e);
          });
      }

      matchColors(colors, name) {
        let bg = '#E5E5E5';
        let img = null;
        const path = theme.assets.base || '/';
        const comparisonName = name.toLowerCase().replace(/\s/g, '');
        const array = colors.colors;

        if (array) {
          let indexArray = null;

          const hexColorArr = array.filter((colorObj, index) => {
            const neatName = Object.keys(colorObj).toString().toLowerCase().replace(/\s/g, '');

            if (neatName === comparisonName) {
              indexArray = index;

              return colorObj;
            }
          });

          if (hexColorArr.length && indexArray !== null) {
            const value = Object.values(array[indexArray])[0];
            bg = value;

            if (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.svg')) {
              img = `${path}${value}`;
              bg = '#888888';
            }
          }
        }

        return {
          color: this.settings.color,
          path: img,
          hex: bg,
        };
      }
    }

    class Swatch {
      constructor(element) {
        this.element = element;
        this.swatchLink = this.element.nextElementSibling;
        this.colorString = element.getAttribute(attributes$D.swatch);
        this.image = this.element.getAttribute(attributes$D.image);
        this.imageId = this.element.getAttribute(attributes$D.imageId);
        this.variant = this.element.getAttribute(attributes$D.variant);
        this.outer = this.element.closest(selectors$U.productBlock);
        this.hoverImages = [];

        const matcher = new ColorMatch({color: this.colorString});
        matcher.getColor().then((result) => {
          this.colorMatch = result;
          this.init();
        });
      }

      init() {
        this.setStyles();

        if (this.variant && this.outer) {
          this.handleClicks();
        }

        if (!this.image && this.swatchLink) {
          this.swatchLink.classList.add(classes$L.noImage);
        }
      }

      setStyles() {
        if (this.colorMatch && this.colorMatch.hex) {
          this.element.style.setProperty('--swatch', `${this.colorMatch.hex}`);
        }

        if (this.colorMatch && this.colorMatch.path) {
          this.element.style.setProperty('background-image', `url(${this.colorMatch.path})`);
        }
      }

      handleClicks() {
        // Change PGI featured image on swatch click
        this.swatchLink.addEventListener('click', (event) => {
          const isFocusEnabled = !document.body.classList.contains(classes$L.noOutline);
          const variantId = this.swatchLink.getAttribute(attributes$D.variant);

          if (!isFocusEnabled) {
            event.preventDefault();
            this.updateImagesAndLinksOnEvent(variantId);
          }
        });

        this.swatchLink.addEventListener('keyup', (event) => {
          const isFocusEnabled = !document.body.classList.contains(classes$L.noOutline);
          const variantId = this.swatchLink.getAttribute(attributes$D.variant);

          if (event.code !== theme.keyboardKeys.ENTER && event.code !== theme.keyboardKeys.NUMPADENTER) {
            return;
          }

          if (!isFocusEnabled) {
            event.preventDefault();
            this.swatchLink.dispatchEvent(new Event('mouseenter', {bubbles: true}));
            this.updateImagesAndLinksOnEvent(variantId);
          }
        });
      }

      updateImagesAndLinksOnEvent(variantId) {
        this.updateLinks();
        this.replaceImages(variantId);
      }

      updateLinks() {
        this.linkElements = this.outer.querySelectorAll(selectors$U.link);
        this.quickView = this.outer.querySelector(selectors$U.quickView);

        // Update links
        if (this.linkElements.length) {
          this.linkElements.forEach((element) => {
            const destination = getUrlWithVariant(element.getAttribute('href'), this.variant);
            element.setAttribute('href', destination);
          });
        }

        // Change quickview variant with swatch one
        if (this.quickView && theme.settings.quickBuy === 'quick_buy') {
          this.quickView.setAttribute(attributes$D.variantId, this.variant);
        }
      }

      replaceImages(id) {
        const imageSecondary = this.outer.querySelector(`[${attributes$D.variantSecondaryId}="${id}"]`);
        const gridImage = this.outer.querySelector(`[${attributes$D.variantId}="${id}"]`);
        const gridImages = this.outer.querySelectorAll(selectors$U.gridImage);
        const currentGridImage = [...gridImages].find((image) => image.classList.contains(classes$L.mediaVisible));

        // Add new loaded image and sync with the secondary image for smooth animation
        if (gridImage && this.imageId) {
          if (!imageSecondary || !currentGridImage) return;

          const onAnimationEnd = () => {
            requestAnimationFrame(() => {
              currentGridImage.classList.remove(classes$L.mediaVisible);
              gridImage.classList.add(classes$L.mediaVisible);

              requestAnimationFrame(() => {
                imageSecondary.classList.remove(classes$L.mediaVisible);
              });
            });

            imageSecondary.removeEventListener('animationend', onAnimationEnd);
          };

          requestAnimationFrame(() => {
            imageSecondary.classList.add(classes$L.mediaVisible);
          });

          imageSecondary.addEventListener('animationend', onAnimationEnd);
        }

        // Change all hover images classes
        if (theme.settings.productGridHover === 'image') {
          this.hoverImages = this.outer.querySelectorAll(selectors$U.productImageHover);
        }

        if (this.hoverImages.length > 1) {
          this.hoverImages.forEach((hoverImage) => {
            hoverImage.classList.remove(classes$L.mediaHoverVisible);

            if (hoverImage.getAttribute(attributes$D.variantId) === this.variant) {
              hoverImage.classList.add(classes$L.mediaHoverVisible);
            } else {
              this.hoverImages[0].classList.add(classes$L.mediaHoverVisible);
            }
          });
        }
      }
    }

    class GridSwatch extends HTMLElement {
      constructor() {
        super();

        this.handle = this.getAttribute(attributes$D.handle);
        this.label = this.getAttribute(attributes$D.label).trim().toLowerCase();

        fetchProduct(this.handle).then((product) => {
          this.product = product;
          this.colorOption = product.options.find((element) => {
            return element.name.toLowerCase() === this.label || null;
          });

          if (this.colorOption) {
            this.swatches = this.colorOption.values;
            this.init();
          }
        });
      }

      init() {
        this.swatchElements = this.querySelectorAll(selectors$U.swatch);

        this.swatchElements.forEach((el) => {
          new Swatch(el);
        });

        this.handleShowMore();
      }

      handleShowMore() {
        this.initialHeight = this.offsetHeight;
        this.expandedHeight = this.initialHeight;
        const section = this.closest(selectors$U.sectionType);
        const moreLink = this.querySelector(selectors$U.swatchesMore);

        if (!moreLink) return;

        moreLink?.addEventListener('click', () => {
          this.classList.add(classes$L.isVisible);
        });

        section?.addEventListener('touchstart', (e) => {
          if (!this.contains(e.target)) {
            this.classList.remove(classes$L.isVisible);
            this.dispatchEvent(new Event('mouseleave', {bubbles: true}));
          }
        });

        this.addEventListener('mouseenter', () => {
          const onAnimationStart = (event) => {
            this.expandedHeight = this.offsetHeight;
            const slider = event.target.closest(selectors$U.slider);
            const heightDiffers = this.expandedHeight > this.initialHeight;

            if (heightDiffers && slider) {
              requestAnimationFrame(() => slider.dispatchEvent(new CustomEvent('theme:slider:resize', {bubbles: false})));
            }

            this.removeEventListener('animationstart', onAnimationStart);
          };

          this.addEventListener('animationstart', onAnimationStart);
        });

        this.addEventListener('mouseleave', () => {
          const onAnimationStart = (event) => {
            const slider = event.target.closest(selectors$U.slider);
            const heightDiffers = this.expandedHeight > this.initialHeight;

            if (heightDiffers && slider) {
              requestAnimationFrame(() => slider.dispatchEvent(new CustomEvent('theme:slider:resize', {bubbles: false})));
            }

            this.removeEventListener('animationstart', onAnimationStart);
          };

          this.addEventListener('animationstart', onAnimationStart);
        });
      }
    }

    class SwatchesContainer {
      constructor(container) {
        this.container = container;
        this.swatchesContainers = this.container.querySelectorAll(selectors$U.swatchesContainer);

        this.swatchesContainers.forEach((swatchesContainer) => {
          this.checkSwatchesHeightOnResize = () => this.checkSwatchesHeight(swatchesContainer);
          this.checkSwatchesHeight(swatchesContainer);
          document.addEventListener('theme:resize:width', this.checkSwatchesHeightOnResize);
        });
      }

      checkSwatchesHeight(swatchesContainer) {
        const label = swatchesContainer.querySelector(selectors$U.swatchesLabel);
        const swatch = swatchesContainer.querySelector(selectors$U.swatchesButton);
        const containerPaddingTop = parseInt(window.getComputedStyle(swatchesContainer).getPropertyValue('padding-top'));
        const labelMargin = parseInt(window.getComputedStyle(label).getPropertyValue('margin-bottom'));
        const swatchMargin = parseInt(window.getComputedStyle(swatch).getPropertyValue('margin-bottom'));
        const selectorWrapper = swatchesContainer.closest(selectors$U.selectorWrapper);
        selectorWrapper.classList.remove(classes$L.selectorLarge);

        if (swatchesContainer.offsetHeight - containerPaddingTop > label.offsetHeight + labelMargin + swatch.offsetHeight * 2 + swatchMargin * 2) {
          swatchesContainer.style.setProperty('--swatches-max-height', `${swatchesContainer.offsetHeight}px`);
          selectorWrapper.classList.add(classes$L.selectorLarge);
        }
      }

      onUnload() {
        this.swatchesContainers.forEach((swatchesContainer) => {
          document.removeEventListener('theme:resize:width', this.checkSwatchesHeightOnResize);
        });
      }
    }

    const makeSwatches = (container) => {
      swatches = [];
      const els = container.querySelectorAll(selectors$U.swatch);
      els.forEach((el) => {
        swatches.push(new Swatch(el));
      });
    };

    const swatchSection = {
      onLoad() {
        makeSwatches(this.container);
      },
    };

    const swatchesContainer = {
      onLoad() {
        sections$A[this.id] = new SwatchesContainer(this.container);
      },
      onUnload() {
        sections$A[this.id].onUnload();
      },
    };

    const selectors$T = {
      slider: '[data-slider]',
      productMediaContainer: '[data-product-media-container]',
      productMediaSlider: '[data-product-media-slideshow]',
      productMediaSlide: '[data-product-media-slideshow-slide]',
      progressBar: '[data-product-slideshow-progress]',
      flickityButton: '.flickity-button',
      popupProduct: '[data-product]',
      popupClose: '[data-popup-close]',
    };

    const classes$K = {
      fill: 'fill',
      quickViewVisible: 'js-quick-view-visible',
    };

    const sections$z = {};

    class ProductGrid {
      constructor(container) {
        this.container = container;
        this.body = document.body;
        this.sliders = this.container.querySelectorAll(selectors$T.slider);

        if (theme.settings.productGridHover === 'slideshow' && !window.theme.touch) {
          this.productGridSlideshow();
        }

        new QuickViewPopup(this.container);
      }

      /* Product grid slideshow */
      productGridSlideshow() {
        const productMediaSlider = this.container.querySelectorAll(selectors$T.productMediaSlider);
        const linkedImages = this.container.querySelectorAll(selectors$T.productMediaContainer);

        if (productMediaSlider.length) {
          productMediaSlider.forEach((slider) => {
            const mediaContainer = slider.closest(selectors$T.productMediaContainer);
            const progressBar = mediaContainer.querySelector(selectors$T.progressBar);
            const countImages = slider.querySelectorAll(selectors$T.productMediaSlide).length;
            const autoplaySpeed = 2200;
            const draggable = !this.sliders.length; // Enable dragging if only layout is not Carousel
            let flkty = new Flickity.data(slider);
            let timer = 0;

            let cellSelector = selectors$T.productMediaSlide;

            if (!flkty.isActive && countImages > 1) {
              flkty = new Flickity(slider, {
                draggable: draggable,
                cellSelector: cellSelector,
                contain: true,
                wrapAround: true,
                imagesLoaded: true,
                pageDots: false,
                prevNextButtons: false,
                adaptiveHeight: false,
                pauseAutoPlayOnHover: false,
                selectedAttraction: 0.2,
                friction: 1,
                on: {
                  ready: () => {
                    this.container.style.setProperty('--autoplay-speed', `${autoplaySpeed}ms`);
                  },
                  change: () => {
                    if (timer) {
                      clearTimeout(timer);
                    }

                    progressBar.classList.remove(classes$K.fill);
                    progressBar.offsetWidth; // Force a reflow to ensure the remove class takes effect immediately

                    requestAnimationFrame(() => {
                      progressBar.classList.add(classes$K.fill);
                    });

                    timer = setTimeout(() => {
                      progressBar.classList.remove(classes$K.fill);
                    }, autoplaySpeed);
                  },
                  dragEnd: () => {
                    flkty.playPlayer();
                  },
                },
              });

              if (!window.theme.touch) {
                mediaContainer.addEventListener('mouseenter', () => {
                  progressBar.classList.add(classes$K.fill);

                  if (timer) {
                    clearTimeout(timer);
                  }

                  timer = setTimeout(() => {
                    progressBar.classList.remove(classes$K.fill);
                  }, autoplaySpeed);

                  flkty.options.autoPlay = autoplaySpeed;
                  flkty.playPlayer();
                });
                mediaContainer.addEventListener('mouseleave', () => {
                  flkty.stopPlayer();
                  if (timer) {
                    clearTimeout(timer);
                  }
                  progressBar.classList.remove(classes$K.fill);
                });
              }
            }
          });
        }

        // Prevent page redirect on slideshow arrow click
        if (linkedImages.length) {
          linkedImages.forEach((item) => {
            item.addEventListener('click', (e) => {
              if (e.target.matches(selectors$T.flickityButton)) {
                e.preventDefault();
              }
            });
          });
        }
      }

      /**
       * Quickview popup close function
       */
      popupClose() {
        const popupProduct = document.querySelector(selectors$T.popupProduct);
        if (popupProduct) {
          const popupClose = popupProduct.querySelector(selectors$T.popupClose);
          popupClose.dispatchEvent(new Event('click'));
        }
      }

      /**
       * Event callback for Theme Editor `section:block:select` event
       */
      onBlockSelect() {
        if (this.body.classList.contains(classes$K.quickViewVisible)) {
          this.popupClose();
        }
      }

      /**
       * Event callback for Theme Editor `section:deselect` event
       */
      onDeselect() {
        if (this.body.classList.contains(classes$K.quickViewVisible)) {
          this.popupClose();
        }
      }

      /**
       * Event callback for Theme Editor `section:unload` event
       */
      onUnload() {
        if (this.body.classList.contains(classes$K.quickViewVisible)) {
          this.popupClose();
        }
      }
    }

    const productGrid = {
      onLoad() {
        sections$z[this.id] = new ProductGrid(this.container);
      },
      onBlockSelect() {
        sections$z[this.id].onBlockSelect();
      },
      onDeselect() {
        sections$z[this.id].onDeselect();
      },
      onUnload() {
        sections$z[this.id].onUnload();
      },
    };

    const selectors$S = {
      ajaxinateContainer: '#AjaxinateLoop',
      ajaxinatePagination: '#AjaxinatePagination',
    };

    const attributes$C = {
      ajaxinateId: 'data-ajaxinate-id',
    };

    const classes$J = {
      isLoaded: 'is-loaded',
    };

    let sections$y = {};

    class Ajaxify {
      constructor(container) {
        this.container = container;
        this.endlessScroll = [];

        if (theme.settings.enableInfinityScroll) {
          this.init();
        }
      }

      init() {
        this.loadMoreFix();

        this.ajaxinateContainer = this.container.querySelectorAll(selectors$S.ajaxinateContainer);

        this.ajaxinateContainer.forEach((element) => {
          const ajaxinateContainer = `${selectors$S.ajaxinateContainer}[${attributes$C.ajaxinateId}="${element.dataset.ajaxinateId}"]`;
          const ajaxinatePagination = `${selectors$S.ajaxinatePagination}[${attributes$C.ajaxinateId}="${element.dataset.ajaxinateId}"]`;
          const hasChildren = element.children.length > 0;

          if (hasChildren) {
            const endlessScroll = new Ajaxinate({
              container: ajaxinateContainer,
              pagination: ajaxinatePagination,
              method: 'scroll',
            });

            element.classList.add(classes$J.isLoaded);

            this.endlessScroll.push(endlessScroll);
          }
        });
      }

      update(id) {
        // Get the elements again, since fetching contents from Filtering or Tabs bring newly rendered DOM elements
        this.ajaxinateContainer = this.container.querySelectorAll(selectors$S.ajaxinateContainer);

        const instanceIDMatch = (instance) => instance.settings.container === id;
        const elementIDMatch = (element) => `${selectors$S.ajaxinateContainer}[${attributes$C.ajaxinateId}="${element.dataset.ajaxinateId}"]` === id;

        // Compare `Ajaxinate` instances, destroy already initialised ones and remove them from `this.endlessScroll` array
        const instanceExists = this.endlessScroll.find(instanceIDMatch);
        if (instanceExists) {
          const index = this.endlessScroll.findIndex(instanceIDMatch);
          this.endlessScroll.splice(index, 1);
          // Revert back the method from 'click' to 'scroll' to prevent Ajaxinate JS errors with removing event listeners on destroy
          instanceExists.settings.method = 'scroll';
          instanceExists.destroy();
        }

        // Find whether the DOM elements match the ID passed to the `update()` method and init new `Ajaxinate` instance
        const element = [...this.ajaxinateContainer].find(elementIDMatch);

        if (!element) return;

        const ajaxinateContainer = `${selectors$S.ajaxinateContainer}[${attributes$C.ajaxinateId}="${element.dataset.ajaxinateId}"]`;
        const ajaxinatePagination = `${selectors$S.ajaxinatePagination}[${attributes$C.ajaxinateId}="${element.dataset.ajaxinateId}"]`;
        const hasChildren = element.children.length > 0;

        if (!hasChildren) return;

        const endlessScroll = new Ajaxinate({
          container: ajaxinateContainer,
          pagination: ajaxinatePagination,
          method: 'scroll',
        });

        element.classList.add(classes$J.isLoaded);
        this.endlessScroll.push(endlessScroll);
      }

      loadMoreFix() {
        // Fix ajaxinate in theme editor
        Ajaxinate.prototype.loadMore = function loadMore() {
          this.request = new XMLHttpRequest();

          this.request.onreadystatechange = function success() {
            if (!this.request.responseXML) {
              return;
            }
            if (!this.request.readyState === 4 || !this.request.status === 200) {
              return;
            }

            const newContainer = this.request.responseXML.querySelector(this.settings.container);
            const newPagination = this.request.responseXML.querySelector(this.settings.pagination);

            this.containerElement.insertAdjacentHTML('beforeend', newContainer.innerHTML);

            if (typeof newPagination === 'undefined' || newPagination === null) {
              this.removePaginationElement();
            } else {
              this.paginationElement.innerHTML = newPagination.innerHTML;

              if (this.settings.callback && typeof this.settings.callback === 'function') {
                this.settings.callback(this.request.responseXML);
              }

              this.initialize();
            }
          }.bind(this);

          this.request.open('GET', this.nextPageUrl, true);
          this.request.responseType = 'document';
          this.request.send();
        };
      }

      unload() {
        if (this.endlessScroll.length > 0) {
          this.endlessScroll.forEach((instance) => {
            instance.settings.method = 'scroll';
            instance.destroy();
          });
          this.ajaxinateContainer.forEach((element) => element.classList.remove(classes$J.isLoaded));
        }
      }
    }

    const ajaxify = {
      onLoad() {
        sections$y = new Ajaxify(this.container);
      },
      onUnload: function () {
        if (typeof sections$y.unload === 'function') {
          sections$y.unload();
        }
      },
    };

    const settings$7 = {
      loadingTimeout: 300,
    };

    const selectors$R = {
      buttons: 'button',
      toggleFilters: '[data-toggle-filters]',
      closeFilters: '[data-close-filters]',
      openFilters: '[data-open-filters]',
      collectionWrapper: '[data-collection-wrapper]',
      collapsibleTrigger: '[data-collapsible-trigger]',
      sortToggle: '[data-sort-toggle]',
      collectionSortOptions: '[data-collection-sort-options]',
      inputs: 'input, select, label, textarea',
      inputSort: '[data-input-sort]',
      filters: '[data-collection-filters]',
      filtersWrapper: '[data-collection-filters-wrapper]',
      filtersList: '[data-collection-filters-list]',
      filtersStickyBar: '[data-collection-sticky-bar]',
      filter: '[data-collection-filter]',
      filterTag: '[data-collection-filter-tag]',
      filterTagButton: '[data-collection-filter-tag-button]',
      filtersForm: '[data-collection-filters-form]',
      filterResetButton: '[data-filter-reset-button]',
      filterTagClearButton: '[data-filter-tag-reset-button]',
      popupsSection: '[data-section-type="popups"]',
      productGrid: '[data-collection-products]',
      productsCount: '[data-products-count]',
      priceMin: '[data-field-price-min]',
      priceMax: '[data-field-price-max]',
      rangeMin: '[data-se-min-value]',
      rangeMax: '[data-se-max-value]',
      rangeMinValue: 'data-se-min-value',
      rangeMaxValue: 'data-se-max-value',
      rangeMinDefault: 'data-se-min',
      rangeMaxDefault: 'data-se-max',
      tooltip: '[data-tooltip]',
      tooltipContainer: '[data-tooltip-container]',
      showMore: '[data-show-more]',
      showMoreActions: '[data-show-more-actions]',
      showMoreContainer: '[data-show-more-container]',
      showMoreTrigger: '[data-show-more-trigger]',
      searchPerformed: '[data-search-performed]',
      searchForm: '[data-search-form]',
      scrollable: '[data-custom-scrollbar]',
    };

    const classes$I = {
      isActive: 'is-active',
      isExpanded: 'is-expanded',
      isVisible: 'is-visible',
      isLoading: 'is-loading',
      popupVisible: 'popup--visible',
      collectionFiltersVisible: 'collection__filters--visible',
      collectionSortOptionWrapperVisible: 'collection__sort__option-wrapper--visible',
      hidden: 'is-hidden',
    };

    const attributes$B = {
      filterActive: 'data-filter-active',
      preventScrollLock: 'data-prevent-scroll-lock',
      filtersDefaultState: 'data-filters-default-state',
      tabIndex: 'tabindex',
      ariaExpanded: 'aria-expanded',
      currentType: 'data-current-type',
    };

    const sections$x = {};

    class Filters {
      constructor(container) {
        this.container = container;
        this.sectionId = container.dataset.sectionId;
        this.enableFilters = container.dataset.enableFilters === 'true';
        this.enableSorting = container.dataset.enableSorting === 'true';
        this.filterMode = container.dataset.filterMode;
        this.collectionHandle = this.container.dataset.collection;
        this.isSearchPage = container.closest(selectors$R.searchPerformed) != null;
        this.productGrid = this.container.querySelector(selectors$R.productGrid);
        this.productsCount = this.container.querySelector(selectors$R.productsCount);
        this.groupTagFilters = this.container.querySelectorAll(selectors$R.filter);
        this.filters = this.container.querySelector(selectors$R.filters);
        this.filterTriggers = this.container.querySelectorAll(selectors$R.collapsibleTrigger);
        this.filtersStickyBar = this.container.querySelector(selectors$R.filtersStickyBar);
        this.filtersForm = this.container.querySelector(selectors$R.filtersForm);
        this.inputSort = this.container.querySelectorAll(selectors$R.inputSort);
        this.sortToggle = this.container.querySelector(selectors$R.sortToggle);
        this.collectionSortOptions = this.container.querySelector(selectors$R.collectionSortOptions);
        this.a11y = a11y;
        this.filterData = [];
        this.rangeSlider = null;
        this.sortDropdownEvent = () => this.sortDropdownToggle();
        this.onTabHandlerEvent = (event) => this.onTabHandler(event);
        this.updateCollectionFormSortEvent = (event) => this.updateCollectionFormSort(event);
        this.bodyClickEvent = (event) => this.bodyClick(event);
        this.onFilterResetClick = this.onFilterResetClick.bind(this);
        this.onFilterTagResetClick = this.onFilterTagResetClick.bind(this);
        this.onFilterTagClearClick = this.onFilterTagClearClick.bind(this);
        this.onFilterToggleClick = this.onFilterToggleClick.bind(this);
        this.onKeyUpHandler = this.onKeyUpHandler.bind(this);
        this.updateRangeEvent = this.updateRange.bind(this);
        this.debouncedSubmitEvent = debounce((event) => {
          this.onSubmitHandler(event);
        }, 500);
        this.debouncedSortEvent = debounce((event) => {
          this.onSortChange(event);
        }, 500);
        this.productGridEvents = {};

        if (this.filters) {
          this.hideFiltersDrawer = this.hideFiltersDrawer.bind(this);
          this.showFiltersDrawer = this.showFiltersDrawer.bind(this);
          this.resizeEvent = debounce(() => {
            this.filtersResizeEvents();
          }, 500);
          this.filtersResizeEvents();
          document.addEventListener('theme:resize:width', this.resizeEvent);
        }

        this.initTagFilters();
        this.initFacetedFilters();
        this.bindToggleButtonsEvents();
        this.bindFilterButtonsEvents();
        this.initProductGridEvents(theme.settings.enableInfinityScroll);

        makeSwatches(this.container);
        this.collapsible = new Collapsible(this.container);

        // Update css variable for collection sticky bar height
        setVars();

        window.addEventListener('popstate', this.onHistoryChange.bind(this));

        this.sortToggle?.addEventListener('click', this.sortDropdownEvent);

        document.addEventListener('click', this.bodyClickEvent);

        this.filterShowMore();
      }

      /*
       * Init faceted filters
       */
      initFacetedFilters() {
        if (this.filterMode == 'tag' || this.filterMode == 'group' || !this.enableFilters) {
          return;
        }

        this.rangeSlider = new RangeSlider(this.container);
      }

      /*
       * Init tooltips for swatches
       */
      initTooltips() {
        this.tooltips = this.container.querySelectorAll(selectors$R.tooltip);

        if (window.innerWidth < theme.sizes.small) {
          this.tooltips = this.productGrid?.querySelectorAll(selectors$R.tooltip);
        }

        this.tooltips?.forEach((tooltip) => {
          new Tooltip(tooltip);
        });

        this.handleVisibleTooltips();
      }

      handleVisibleTooltips() {
        if (this.tooltips.length > 0) {
          const tooltipTarget = document.querySelector(selectors$R.tooltipContainer);
          if (tooltipTarget.classList.contains(classes$I.isVisible)) {
            tooltipTarget.classList.remove(classes$I.isVisible);
          }
        }
      }

      /*
       * Price range slider update
       */
      updateRange() {
        const rangeMin = this.filtersForm.querySelector(selectors$R.rangeMin);
        const rangeMax = this.filtersForm.querySelector(selectors$R.rangeMax);
        const priceMin = this.filtersForm.querySelector(selectors$R.priceMin);
        const priceMax = this.filtersForm.querySelector(selectors$R.priceMax);

        if (rangeMin.hasAttribute(selectors$R.rangeMinValue) && rangeMax.hasAttribute(selectors$R.rangeMaxValue)) {
          const priceMinValue = parseFloat(priceMin.placeholder, 10);
          const priceMaxValue = parseFloat(priceMax.placeholder, 10);
          const rangeMinValue = parseFloat(rangeMin.getAttribute(selectors$R.rangeMinValue), 10);
          const rangeMaxValue = parseFloat(rangeMax.getAttribute(selectors$R.rangeMaxValue), 10);

          if (priceMinValue !== rangeMinValue || priceMaxValue !== rangeMaxValue) {
            priceMin.value = parseInt(rangeMinValue);
            priceMax.value = parseInt(rangeMaxValue);

            this.filtersForm.dispatchEvent(new Event('input', {bubbles: true}));
          }
        }
      }

      /*
       * Render product grid and filters on form submission
       */
      onSubmitHandler(event) {
        event.preventDefault();
        const formData = new FormData(this.filtersForm);
        const searchParams = new URLSearchParams(formData);
        const deleteParams = [];
        let searchParamsString = '';

        if (this.isSearchPage) {
          this.searchForm = this.container.querySelector(selectors$R.searchForm);
          this.currentType = this.container.getAttribute(attributes$B.currentType);
        }

        // if submitted price equal to price range min and max remove price parameters
        const rangeMin = this.filtersForm.querySelector(selectors$R.rangeMin);
        const rangeMax = this.filtersForm.querySelector(selectors$R.rangeMax);
        const priceMin = this.filtersForm.querySelector(selectors$R.priceMin);
        const priceMax = this.filtersForm.querySelector(selectors$R.priceMax);
        const checkElements = rangeMin && rangeMax && priceMin && priceMax;

        if (checkElements && rangeMin.hasAttribute(selectors$R.rangeMinDefault) && rangeMax.hasAttribute(selectors$R.rangeMaxDefault)) {
          const rangeMinDefault = parseFloat(rangeMin.getAttribute(selectors$R.rangeMinDefault), 10);
          const rangeMaxDefault = parseFloat(rangeMax.getAttribute(selectors$R.rangeMaxDefault), 10);
          const priceMinValue = !priceMin.value ? rangeMinDefault : parseFloat(priceMin.value, 10);
          const priceMaxValue = !priceMax.value ? rangeMaxDefault : parseFloat(priceMax.value, 10);

          if (priceMinValue <= rangeMinDefault && priceMaxValue >= rangeMaxDefault) {
            deleteParams.push('filter.v.price.gte');
            deleteParams.push('filter.v.price.lte');
            searchParams.delete('filter.v.price.gte');
            searchParams.delete('filter.v.price.lte');
          }
        }

        searchParamsString = searchParams.toString();

        if (this.isSearchPage) {
          searchParamsString = getSearchParams(this.searchForm, this.filtersForm, deleteParams);

          let typeString = '';
          if (this.currentType === 'all') typeString = '&type=product';
          if (searchParamsString.indexOf('&type=product') > -1) typeString = '';
          searchParamsString += typeString;
        }

        this.renderSection(searchParamsString, event);
      }

      /*
       * Call renderSection on history change
       */
      onHistoryChange(event) {
        if (!this.filters) return;

        let searchParams = event.state?.searchParams || '';

        if (this.isSearchPage) {
          if (!event.state) searchParams = window.location.search;
          const shouldRenderSearchResults = searchParams.indexOf('type=product') > -1;

          if (!shouldRenderSearchResults) return;
        }

        this.renderSection(searchParams, null, false);
      }

      /*
       * Render section on history change or filter/sort change event
       */
      renderSection(searchParams, event, updateURLHash = true) {
        this.startLoading();
        const url = `${window.location.pathname}?section_id=${this.sectionId}&${searchParams}`;
        const filterDataUrl = (element) => element.url === url;
        this.filterData.some(filterDataUrl) ? this.renderSectionFromCache(filterDataUrl, event) : this.renderSectionFromFetch(url, event);

        if (updateURLHash) {
          this.updateURLHash(searchParams);
        }
      }

      /*
       * Render section from fetch call
       */
      renderSectionFromFetch(url) {
        fetch(url)
          .then((response) => response.text())
          .then((responseText) => {
            const html = responseText;
            this.filterData = [...this.filterData, {html, url}];
            this.inputSort = this.container.querySelectorAll(selectors$R.inputSort);
            this.renderFilters(html);
            this.bindFilterButtonsEvents();
            this.hideFiltersOnMobile();
            this.renderProductGrid(html);
            this.updateProductsCount(html);
            this.finishLoading();
            this.mobileFiltersScrollLock();
            this.handleSearchPageActiveTab();
          });
      }

      /*
       * Render section from Cache
       */
      renderSectionFromCache(filterDataUrl, event) {
        const html = this.filterData.find(filterDataUrl).html;
        this.renderFilters(html, event);
        this.hideFiltersOnMobile();
        this.renderProductGrid(html);
        this.updateProductsCount(html);
        this.finishLoading();
        this.mobileFiltersScrollLock();
        this.handleSearchPageActiveTab();
      }

      handleSearchPageActiveTab() {
        if (!this.isSearchPage) return;

        this.scrollable = this.container.querySelector(selectors$R.scrollable);
        if (!this.scrollable || this.customScrollbar) return;
        this.customScrollbar = new CustomScrollbar(this.container);
      }

      /*
       * Render product grid items on fetch call
       */
      renderProductGrid(html) {
        const newProductGrid = new DOMParser().parseFromString(html, 'text/html').querySelector(selectors$R.productGrid);

        if (!newProductGrid) {
          return;
        }

        this.productGrid.innerHTML = newProductGrid.innerHTML;

        this.initProductGridEvents(theme.settings.enableInfinityScroll);
        this.filterShowMore();
      }

      /*
       * Update total number of products on fetch call
       */
      updateProductsCount(html) {
        const newProductsCount = new DOMParser().parseFromString(html, 'text/html').querySelector(selectors$R.productsCount);

        if (!newProductsCount) {
          return;
        }

        this.productsCount.innerHTML = newProductsCount.innerHTML;
      }

      /*
       * Render filters on fetch call
       */
      renderFilters(html) {
        const newFilters = new DOMParser().parseFromString(html, 'text/html').querySelector(selectors$R.filters);

        if (!newFilters) {
          return;
        }

        this.filters.innerHTML = newFilters.innerHTML;
        this.filtersForm = document.querySelector(selectors$R.filtersForm);
        this.bindFilterButtonsEvents();
        this.bindToggleButtonsEvents();
        makeSwatches(this.container);
        this.collapsible = new Collapsible(this.container);

        // Init price range slider
        document.dispatchEvent(new CustomEvent('theme:filters:init', {bubbles: true}));
      }

      /*
       * Update URL when filter/sort is changed
       */
      updateURLHash(searchParams) {
        history.pushState({searchParams}, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
      }

      /*
       * Bind filter buttons events
       */
      bindFilterButtonsEvents() {
        if (this.inputSort.length > 0) {
          this.inputSort.forEach((input) => {
            input.addEventListener('change', this.updateCollectionFormSortEvent);
          });
        }

        if (this.filtersForm) {
          this.filtersForm.addEventListener('input', this.debouncedSubmitEvent.bind(this));

          this.filtersForm.addEventListener('theme:filter:range-update', this.updateRangeEvent);
        }

        if (this.collectionSortOptions) {
          this.collectionSortOptions.addEventListener('keyup', this.onTabHandlerEvent);
        }

        if (this.filterMode == 'tag' || this.filterMode == 'group' || !this.enableFilters) {
          return;
        }

        this.container.querySelectorAll(selectors$R.filterResetButton).forEach((button) => {
          button.addEventListener('click', this.onFilterResetClick, {once: true});
        });
       setTimeout(function(){
        yotpoWidgetsContainer.initWidgets()
       },1000)
      }

      /*
       * Render products on specific filter click event
       */
      onFilterResetClick(event) {
        event.preventDefault();
        this.renderSection(new URL(event.currentTarget.href).searchParams.toString());
      }

      /*
       * Bind filter title click events to toggle options visibility
       */
      bindToggleButtonsEvents() {
        this.container.querySelectorAll(selectors$R.toggleFilters).forEach((button) => {
          button.addEventListener('click', this.onFilterToggleClick);
        });
        this.container.querySelectorAll(selectors$R.closeFilters).forEach((button) => {
          button.addEventListener('click', this.hideFiltersDrawer);
        });
        this.container.querySelectorAll(selectors$R.openFilters).forEach((button) => {
          button.addEventListener('click', this.showFiltersDrawer);
        });

        this.container.querySelector(selectors$R.collectionWrapper)?.addEventListener('keyup', this.onKeyUpHandler);
      }

      onTabHandler(event) {
        if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
          const newSortValue = event.target.previousElementSibling.value;

          this.filtersForm.querySelectorAll(selectors$R.inputSort).forEach((input) => {
            if (input.checked) {
              input.checked = false;
            }
            if (input.value === newSortValue) {
              input.checked = true;
            }
          });

          this.filtersForm.dispatchEvent(new Event('input', {bubbles: true}));
          event.target.dispatchEvent(new Event('click', {bubbles: true}));
        }
      }

      /*
       * Event handler on user ESC key press
       */
      onKeyUpHandler(event) {
        if (event.code === theme.keyboardKeys.ESCAPE) {
          this.hideFiltersDrawer();
        }
      }

      /*
       * Toggle filter options on title click
       */
      onFilterToggleClick(event) {
        event.preventDefault();
        setVars(); // Update css variables for correct filters drawer height

        const filtersVisible = this.filters.classList.contains(classes$I.collectionFiltersVisible);

        filtersVisible ? this.hideFiltersDrawer() : this.showFiltersDrawer();
      }

      sortDropdownToggle() {
        if (!this.collectionSortOptions) return;

        this.collectionSortOptions.classList.toggle(classes$I.collectionSortOptionWrapperVisible);
      }

      /*
       * Close the sort dropdown on button click outside the dropdown (for desktop)
       */
      bodyClick(event) {
        if (!this.collectionSortOptions) return;

        const isSortBar = this.sortToggle.contains(event.target);
        const isVisible = this.collectionSortOptions.classList.contains(classes$I.collectionSortOptionWrapperVisible);

        if (isVisible && !isSortBar) {
          this.sortDropdownToggle();
        }
      }

      updateCollectionFormSort(event) {
        const target = event.target;
        const newSortValue = target.value;
        const secondarySortBy = target.closest(selectors$R.collectionSortOptions);

        this.container.querySelectorAll(selectors$R.inputSort).forEach((input) => {
          if (input.value === newSortValue) {
            input.checked = true;
          }
        });

        if (secondarySortBy !== null) {
          this.filtersForm.dispatchEvent(new Event('input', {bubbles: true}));
        }
      }

      /*
       * Scroll down and open collection filters if they are hidden
       */
      showFiltersDrawer() {
        const instance = this;

        this.a11y.state.trigger = document.querySelector(selectors$R.toggleFilters);

        // Trap focus
        this.a11y.trapFocus({
          container: instance.filters,
        });

        this.mobileFiltersScrollLock();
      }

      /*
       * Scroll lock activation for filters drawer (on mobile)
       */
      mobileFiltersScrollLock() {
        // Open filters and scroll lock if only they are hidden on lower sized screens
        if (window.innerWidth < theme.sizes.small) {
          const scrollableElement = document.querySelector(selectors$R.filtersList);

          if (!this.filters.classList.contains(classes$I.collectionFiltersVisible)) {
            this.filters.classList.add(classes$I.collectionFiltersVisible);
          }

          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: scrollableElement}));
        }
      }

      /*
       * Hide filter accordion elements on mobile
       */
      hideFiltersOnMobile() {
        const filterTriggers = this.container.querySelectorAll(`${selectors$R.collapsibleTrigger}:not(${selectors$R.showMoreTrigger})`);

        if (window.innerWidth < theme.sizes.small) {
          requestAnimationFrame(() => {
            filterTriggers.forEach((element) => {
              const isFilterActive = element.getAttribute(attributes$B.filterActive) === 'true';

              if (element.classList.contains(classes$I.isExpanded) && !isFilterActive) {
                element.dispatchEvent(new Event('click'));
              }
            });
          });
        }
      }

      /*
       * Show filter accordion elements on desktop if they should be opened by default
       */
      showFiltersOnDesktop() {
        const filterTriggers = this.container.querySelectorAll(`${selectors$R.collapsibleTrigger}:not(${selectors$R.showMoreTrigger})`);

        // "Default filter layout" states
        const filtersDefaultState = this.container.getAttribute(attributes$B.filtersDefaultState);
        const openFirstFilterOnly = filtersDefaultState === 'first-open';
        const openAllFilters = filtersDefaultState === 'open';
        const closeAllFilters = filtersDefaultState === 'closed';
        // When sorting is enabled the first `${filterTrigger}` element on mobile is a 'Sort by' button
        const firstTriggerIndex = this.enableSorting ? 1 : 0;

        filterTriggers.forEach((element, index) => {
          const isCurrentFilterExpanded = element.classList.contains(classes$I.isExpanded);
          const isCurrentFilterActive = element.getAttribute(attributes$B.filterActive) === 'true';
          // 'first-open' state conditions
          const isFirstClosed = !isCurrentFilterExpanded && index === firstTriggerIndex;
          const allElseExpanded = isCurrentFilterExpanded && index !== firstTriggerIndex;
          const shouldOpenFirst = openFirstFilterOnly && isFirstClosed;
          const shouldCloseAllExceptFirst = openFirstFilterOnly && allElseExpanded;
          // 'open' state conditions
          const shouldOpenAllClosedOnes = openAllFilters && !isCurrentFilterExpanded;
          const shouldOpenActiveOnes = isCurrentFilterActive && !isCurrentFilterExpanded && openAllFilters;
          // 'close' state conditions
          const shouldCloseExpandedOnes = closeAllFilters && isCurrentFilterExpanded;

          if (isCurrentFilterActive && !shouldOpenActiveOnes) return;

          if (shouldCloseExpandedOnes || shouldOpenFirst || shouldCloseAllExceptFirst || shouldOpenAllClosedOnes || shouldOpenActiveOnes) {
            element.dispatchEvent(new Event('click'));
          }
        });
      }

      /*
       * Hide filters drawer
       */
      hideFiltersDrawer() {
        let filtersVisible = this.filters.classList.contains(classes$I.collectionFiltersVisible);
        let loading = this.container.classList.contains(classes$I.isLoading);

        if (filtersVisible) {
          this.filters.classList.remove(classes$I.collectionFiltersVisible);
          this.a11y.removeTrapFocus();
        }

        // Enable page scroll if no loading state
        if (!loading) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: settings$7.loadingTimeout}));
        }
      }

      /*
       * Hiding the filters drawer on desktop & hiding the filters on mobile (showing only filter title)
       */
      filtersResizeEvents() {
        if (window.innerWidth >= theme.sizes.small) {
          this.showFiltersOnDesktop();
          this.hideFiltersDrawer();
        } else {
          this.hideFiltersOnMobile();
        }
      }

      /*
       * Show more functionality
       */
      filterShowMore() {
        this.showMore = this.container.querySelectorAll(selectors$R.showMore);
        if (this.showMore.length === 0) return;

        this.showMore.forEach((element) => {
          const filterCollapsibleTrigger = element.querySelector(selectors$R.collapsibleTrigger);
          const showMoreActions = element.querySelector(selectors$R.showMoreActions);

          if (!showMoreActions) return;

          const showMoreTrigger = showMoreActions.querySelector(selectors$R.showMoreTrigger);
          const showMoreContainer = showMoreActions.querySelector(selectors$R.showMoreContainer);
          const focusable = showMoreContainer.querySelectorAll(window.theme.focusable);
          const isShowMoreContainerExpanded = showMoreContainer.getAttribute(attributes$B.ariaExpanded) === 'true';

          if (!isShowMoreContainerExpanded) {
            focusable.forEach((item) => {
              item.setAttribute(attributes$B.tabIndex, '-1');
            });
          }

          showMoreTrigger.addEventListener('keyup', (event) => {
            if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
              this.updateShowMoreFocusableElements(event, focusable);
            }
          });
          showMoreTrigger.addEventListener('click', (event) => {
            this.updateShowMoreFocusableElements(event, focusable);
          });

          filterCollapsibleTrigger.addEventListener('keyup', (event) => {
            if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
              this.updateCollapsedContainerFocusableElements(filterCollapsibleTrigger, showMoreTrigger, focusable);
            }
          });
          filterCollapsibleTrigger.addEventListener('click', () => {
            this.updateCollapsedContainerFocusableElements(filterCollapsibleTrigger, showMoreTrigger, focusable);
          });
        });
      }

      /*
       * A11y: Update tabindex for all focusable elements in show-more collapsible containers,
       * on opening and closing events of their parent collapsible container
       * Solves wrongful tabbing in cases where a collapsible content is opened,
       * but it is located in another parent collapsible container that is closed
       */
      updateCollapsedContainerFocusableElements(filterCollapsibleTrigger, showMoreTrigger, focusable) {
        requestAnimationFrame(() => {
          const isFilterExpanded = filterCollapsibleTrigger.getAttribute(attributes$B.ariaExpanded) === 'true';
          const isShowMoreExpanded = showMoreTrigger.getAttribute(attributes$B.ariaExpanded) === 'true';

          focusable.forEach((item) => {
            if (!isFilterExpanded && isShowMoreExpanded) {
              item.setAttribute(attributes$B.tabIndex, '-1');
            }

            if (isFilterExpanded && isShowMoreExpanded) {
              item.removeAttribute(attributes$B.tabIndex);
            }
          });
        });
      }

      /*
       * A11y: Update tabindex for all focusable elements in show-more collapsible containers on opening and closing events
       * Double requestAnimationFrame method is used to make sure the collapsible content has already been expanded
       */
      updateShowMoreFocusableElements(event, focusable) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const isExpanded = event.target.getAttribute(attributes$B.ariaExpanded) === 'true';

            focusable.forEach((item, index) => {
              if (isExpanded) {
                item.removeAttribute(attributes$B.tabIndex);

                if (index === 0) item.focus();
                return;
              }
              item.setAttribute(attributes$B.tabIndex, '-1');
            });
          });
        });
      }

      /*
       * Init functions required when "Filter by tag/group" is selected from Collection page -> Collection pages -> Filter mode
       */
      initTagFilters() {
        if ((this.filterMode != 'tag' && this.filterMode != 'group') || !this.enableFilters) {
          return;
        }

        this.tags = this.container.dataset.tags.split('+').filter((item) => item);
        this.bindFilterTagButtonsEvents();
        this.bindSortChangeEvent();
      }

      /*
       * Render products when tag filter is selected
       */
      renderTagFiltersProducts(url) {
        this.startLoading();

        if (typeof this.endlessCollection === 'object') {
          this.endlessCollection.unload();
        }

        fetch(url)
          .then((response) => response.text())
          .then((responseText) => {
            const html = responseText;
            const parsedData = new DOMParser().parseFromString(html, 'text/html');
            const productsHTML = parsedData.querySelector(selectors$R.productGrid).innerHTML;
            const filtersHTML = parsedData.querySelector(selectors$R.filters).innerHTML;

            this.productGrid.innerHTML = productsHTML;
            this.filters.innerHTML = filtersHTML;
            this.inputSort = this.container.querySelectorAll(selectors$R.inputSort);
            this.filtersForm = document.querySelector(selectors$R.filtersForm);
            this.filterData = [...this.filterData, {html, url}];
            this.alreadyClicked = false;

            this.bindFilterTagButtonsEvents();
            this.bindFilterButtonsEvents();
            this.bindSortChangeEvent();
            this.bindToggleButtonsEvents();
            this.initProductGridEvents(theme.settings.enableInfinityScroll);
            this.updateProductsCount(html);
            this.mobileFiltersScrollLock();
            this.hideFiltersOnMobile();
            makeSwatches(this.container);
            this.collapsible = new Collapsible(this.container);
            this.filterShowMore();

            // Update page URL if supported by the browser
            if (history.replaceState) {
              window.history.pushState({path: url}, '', url);
            }
          })
          .catch((error) => {
            this.finishLoading();
            console.log(`Error: ${error}`);
          });
      }

      /*
       * Bind Filter by tag buttons
       */
      bindFilterTagButtonsEvents() {
        this.container.querySelectorAll(selectors$R.filterTagButton).forEach((button) => {
          button.addEventListener('click', this.onFilterTagButtonClick.bind(this));
        });

        this.container.querySelectorAll(selectors$R.filterTagClearButton).forEach((button) => {
          button.addEventListener('click', this.onFilterTagClearClick);
        });

        this.container.querySelectorAll(selectors$R.filterResetButton).forEach((button) => {
          button.addEventListener('click', this.onFilterTagResetClick);
        });
      }

      /*
       * Bind input Sort by change event for "filters by tag/group" only
       */
      bindSortChangeEvent() {
        this.container.querySelectorAll(selectors$R.inputSort).forEach((input) => {
          input.addEventListener('input', this.debouncedSortEvent.bind(this));
        });
      }

      /*
       * Filter by tag buttons click event
       */
      onFilterTagButtonClick(event) {
        event.preventDefault();
        if (this.alreadyClicked) {
          return;
        }
        this.alreadyClicked = true;
        const button = event.currentTarget;
        const selectedTag = button.dataset.tag;
        let isTagSelected = button.parentNode.classList.contains(classes$I.isActive);

        if (isTagSelected) {
          let tagIndex = this.tags.indexOf(selectedTag);

          button.parentNode.classList.remove(classes$I.isActive);

          if (tagIndex > -1) {
            this.tags.splice(tagIndex, 1);
          }
        } else {
          button.parentNode.classList.add(classes$I.isActive);

          this.tags.push(selectedTag);
        }

        let url = this.collectionHandle + '/' + this.tags.join('+') + '?sort_by=' + this.getSortValue();

        // Close filters dropdown on tag select
        this.container.querySelector(selectors$R.filter).classList.remove(classes$I.isExpanded);
        this.container.querySelector(selectors$R.filter).setAttribute(attributes$B.ariaExpanded, false);
        this.container.setAttribute('data-tags', '[' + this.tags + ']');
        this.renderTagFiltersProducts(url);
      }

      /*
       * Remove a specific tag filter
       */
      onFilterTagClearClick(event) {
        event.preventDefault();
        if (this.alreadyClicked) {
          return;
        }
        this.alreadyClicked = true;
        const button = event.currentTarget;
        const selectedTag = button.dataset.tag;
        const tagIndex = this.tags.indexOf(selectedTag);

        if (tagIndex > -1) {
          this.tags.splice(tagIndex, 1);
        }
        const url = this.collectionHandle + '/' + this.tags.join('+') + '?sort_by=' + this.getSortValue();

        this.container.setAttribute('data-tags', '[' + this.tags + ']');
        this.renderTagFiltersProducts(url);
      }

      /*
       * Re-render products with the new sort option selected
       */
      onSortChange() {
        let url = this.collectionHandle + '/' + this.tags.join('+') + '?sort_by=' + this.getSortValue();

        this.renderTagFiltersProducts(url);
      }

      /*
       * Get the selected sort option value
       */
      getSortValue() {
        let sortValue = '';
        this.inputSort.forEach((input) => {
          if (input.checked) {
            sortValue = input.value;
          }
        });

        return sortValue;
      }

      /*
       * Filter by tag reset button click event
       */
      onFilterTagResetClick(event) {
        event?.preventDefault();

        if (this.alreadyClicked) {
          return;
        }
        this.alreadyClicked = true;

        this.container.querySelectorAll(selectors$R.filterTag).forEach((element) => {
          element.classList.remove(classes$I.isActive);
        });

        this.container.querySelectorAll(selectors$R.filter).forEach((element) => {
          element.classList.remove(classes$I.isExpanded);
          element.setAttribute(attributes$B.ariaExpanded, false);
        });

        // Reset saved tags
        this.tags = [];
        this.container.setAttribute('data-tags', '');

        let url = this.collectionHandle + '/?sort_by=' + this.getSortValue();

        this.renderTagFiltersProducts(url);
      }

      /*
       * Get products container top position
       */
      getProductsOffsetTop() {
        return this.productGrid.getBoundingClientRect().top - document.body.getBoundingClientRect().top - this.filtersStickyBar.offsetHeight;
      }

      /*
       * Get collection page sticky bar top position
       */
      getStickyBarOffsetTop() {
        return this.filtersStickyBar.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
      }

      /*
       * Init all the events required on product grid items
       */
      initProductGridEvents(infinityScroll) {
        if (infinityScroll) {
          this.initInfinityScroll();
          this.initProductGridEvents(false);
          return;
        }

        this.productGridEvents = new ProductGrid(this.container);

        this.initTooltips();

        // Stop loading animation
        setTimeout(() => {
          this.finishLoading();
        }, settings$7.loadingTimeout * 1.5);
      }

      /*
       * Init Infinity scroll functionality
       */
      initInfinityScroll() {
        const callback = () => this.initProductGridEvents(false);

        // For Search page filters, infinity scroll is mostly handled in Tabs
        if (this.isSearchPage) {
          if (!this.enableFilters) return;

          document.dispatchEvent(
            new CustomEvent('theme:tab:ajaxinate', {
              bubbles: true,
              detail: 'product',
            })
          );

          return;
        }

        if (typeof this.endlessCollection === 'object') {
          this.endlessCollection.unload();
        }
        this.endlessCollection = new Ajaxify(this.container);

        if (this.endlessCollection.endlessScroll.length === 0) return;
        this.endlessCollection.endlessScroll[0].settings.callback = callback;
      }

      /*
       * Show loading animation and lock body scroll
       */
      startLoading() {
        this.container.classList.add(classes$I.isLoading);

        if (window.innerWidth >= theme.sizes.small) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        }

        let productsTop = this.getProductsOffsetTop();

        window.scrollTo({
          top: productsTop,
          left: 0,
          behavior: 'smooth',
        });
      }

      /*
       * Hide loading animation and unlock body scroll
       */
      finishLoading() {
        const popups = document.querySelectorAll(`${selectors$R.popupsSection} .${classes$I.popupVisible}`);
        const isPopupActive = popups.length > 0;

        this.container.classList.remove(classes$I.isLoading);

        // Unlock the scroll unless there is a visible popup or there are only popups of types 'bar' and 'cookie'
        if (isPopupActive) {
          let preventScrollPopupsCount = 0;
          [...popups].forEach((popup) => {
            if (popup.hasAttribute(attributes$B.preventScrollLock)) {
              preventScrollPopupsCount += 1;
            }
          });

          if (preventScrollPopupsCount === popups.length) {
            document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: settings$7.loadingTimeout}));
          }
        } else if (window.innerWidth >= theme.sizes.small) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: settings$7.loadingTimeout}));
        }
      }

      /*
       * On block:deselect event
       */
      onDeselect() {
        if (this.productGridEvents) {
          this.productGridEvents.onDeselect();
        }
      }

      /*
       * On section:unload event
       */
      onUnload() {
        if (typeof this.endlessCollection === 'object') {
          this.endlessCollection.unload();
        }

        if (this.productGridEvents) {
          this.productGridEvents.onUnload();
        }

        if (this.collapsible) {
          this.collapsible.onUnload();
        }

        if (this.rangeSlider) {
          this.rangeSlider.unload();
        }

        if (this.filters) {
          document.removeEventListener('theme:resize:width', this.resizeEvent);
        }
        document.removeEventListener('click', this.bodyClickEvent);

        if (this.groupTagFilters.length > 0) {
          this.onFilterTagResetClick();
        }

        this.finishLoading();
      }
    }

    const filters = {
      onLoad() {
        sections$x[this.id] = new Filters(this.container);
      },
      onDeselect() {
        sections$x[this.id].onDeselect();
      },
      onUnload() {
        sections$x[this.id].onUnload();
      },
    };

    const selectors$Q = {
      aosItem: '[data-aos]',
      tabsLink: '[data-tabs-link]',
      tab: '[data-tab]',
      tabRef: '[data-tab-ref]',
      scrollable: '[data-custom-scrollbar]',
      scrollableHolder: '[data-custom-scrollbar-holder]',
      slider: '[data-slider]',
      tabsContents: '[data-tabs-contents]',
      searchForm: '[data-search-form]',
      allTypesContainer: '[data-all-types-container]',
      filtersForm: '[data-collection-filters-form]',
      currentPage: '[data-current-page]',
      tooltip: '[data-tooltip]',
      productGrid: '[data-collection-products]',
      ajaxinateContainer: '#AjaxinateLoop',
      ajaxinatePagination: '#AjaxinatePagination',
    };

    const classes$H = {
      current: 'current',
      hide: 'hide',
      alt: 'alt',
      aosAnimate: 'aos-animate',
      aosInit: 'aos-init',
      isLoaded: 'is-loaded',
    };

    const attributes$A = {
      tabsLink: 'data-tabs-link',
      tab: 'data-tab',
      tabRef: 'data-tab-ref',
      tabStartIndex: 'data-start-index',
      searchPerformed: 'data-search-performed',
      type: 'data-type',
      currentType: 'data-current-type',
      allTypes: 'data-all-types',
      currentPage: 'data-current-page',
      ajaxinateId: 'data-ajaxinate-id',
    };

    const sections$w = {};

    class Tabs {
      constructor(container) {
        this.container = container;
        this.tabsContents = container.querySelector(selectors$Q.tabsContents);
        this.animateElementsTimer = null;
        this.isSearchPage = container.closest(`[${attributes$A.searchPerformed}="true"]`) != null;

        if (this.container) {
          this.scrollable = this.container.querySelector(selectors$Q.scrollable);
          this.tabRef = this.container.querySelectorAll(selectors$Q.tabRef);
          this.tabsLink = this.container.querySelectorAll(selectors$Q.tabsLink);
          this.tab = this.container.querySelectorAll(selectors$Q.tab);

          this.assignSearchPageArguments();

          this.init();
          this.initCustomScrollbar();

          if (!this.isSearchPage) {
            this.initTooltips();
          }

          this.inactiveTabsAnimationsCallback = debounce(() => this.handleInactiveTabsAnimations(), 200);
          document.addEventListener('theme:scroll', this.inactiveTabsAnimationsCallback);

          this.container.addEventListener('mouseenter', () => {
            this.handleInactiveTabsAnimations();
          });
        }
      }

      /**
       * Arguments and methods related specifically to Search page tabs
       */
      assignSearchPageArguments() {
        if (!this.isSearchPage) return;

        this.searchForm = this.container.querySelector(selectors$Q.searchForm);
        this.searchFormData = new FormData(this.searchForm);
        this.searchTerm = encodeURIComponent(this.searchFormData.get('q'));
        this.currentType = this.container.getAttribute(attributes$A.currentType);
        this.sectionId = this.container.dataset.sectionId;
        this.searchForAllTypes = this.container.getAttribute(attributes$A.allTypes) === 'true';
        this.fetchURL = '';
        this.searchParams = '';
        this.cachedResults = {};

        this.handleTabsHistory();

        this.infiniteScrollListener();
        this.initInfinityScroll(this.currentType);
      }

      /**
       * Initialise
       */
      init() {
        const tabsNavList = this.container.querySelectorAll(selectors$Q.tabsLink);
        const firstTabsLink = this.container.querySelector(
          `[${attributes$A.tabsLink}="${this.container.hasAttribute(attributes$A.tabStartIndex) ? this.container.getAttribute(attributes$A.tabStartIndex) : 0}"]`
        );
        const firstTab = this.container.querySelector(`[${attributes$A.tab}="${this.container.hasAttribute(attributes$A.tabStartIndex) ? this.container.getAttribute(attributes$A.tabStartIndex) : 0}"]`);

        firstTab?.classList.add(classes$H.current);
        firstTabsLink?.classList.add(classes$H.current);

        this.checkVisibleTabsLinks();

        tabsNavList.forEach((element) => {
          this.handleTabsNavListeners(element);
        });
      }

      /**
       * Use a `theme:tab:open-from-history` custom event to change the active tab on history change
       */
      handleTabsHistory() {
        window.addEventListener('popstate', this.onHistoryChange.bind(this));

        this.openTabFromHistoryEvent = (event) => this.openTabFromHistory(event);

        this.tabsLink.forEach((element) => {
          element.addEventListener('theme:tab:open-from-history', this.openTabFromHistoryEvent);
        });
      }

      /**
       * Handle tabs navigations listeners
       */
      handleTabsNavListeners(element) {
        const tabId = element.getAttribute(attributes$A.tabsLink);
        const tab = this.container.querySelector(`[${attributes$A.tab}="${tabId}"]`);

        if (!tab) return;

        element.addEventListener('click', (event) => {
          if (this.isSearchPage) this.handleURLSearchParams(event, true);
          this.tabChange(element, tab);
        });

        element.addEventListener('keyup', (event) => {
          if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
            if (this.isSearchPage) this.handleURLSearchParams(event, true);
            this.tabChange(element, tab);
          }
        });
      }

      /**
       * Open active tab on history change
       */
      openTabFromHistory(event) {
        const target = event.target;
        const element = this.container.querySelector(event.detail.element);
        const tabId = element.getAttribute(attributes$A.tabsLink);
        const tab = this.container.querySelector(`[${attributes$A.tab}="${tabId}"]`);

        if (!tab) return;

        this.handleURLSearchParams(event, false);
        this.tabChange(target, tab);
      }

      /**
       * Update URL and Search parameters
       */
      handleURLSearchParams(event, updateHistory = true) {
        const target = event.target.matches(selectors$Q.tabsLink) ? event.target : event.target.closest(selectors$Q.tabsLink);
        const type = target.getAttribute(attributes$A.type);
        const tabId = target.getAttribute(attributes$A.tabsLink);
        const tab = this.container.querySelector(`[${attributes$A.tab}="${tabId}"]`);
        const currentPage = tab.querySelector(selectors$Q.currentPage);
        const filtersForm = document.querySelector(selectors$Q.filtersForm);
        let currentPageStr = currentPage ? `&page=${currentPage.getAttribute(attributes$A.currentPage)}` : '';

        this.searchParams = getSearchParams(this.searchForm, filtersForm, [], type);
        if (type === 'product') {
          // Remove duplicate parameter if filters have been applied before 'all-search-types' container is removed
          const sanitized = this.searchParams.replace('&type=product', '');
          this.searchParams = `${sanitized}&type=product`;
        } else {
          // Prevent erroneous search results by removing excess filters form's parameters if search filters have already been applied
          this.searchParams = `q=${this.searchTerm}&type=${type}`;
        }
        // Include current page into the URL
        if (!theme.settings.enableInfinityScroll && currentPageStr !== '') {
          this.searchParams += currentPageStr;
        }

        // Build the URL for fetching tab contents
        this.fetchURL = `${theme.routes.searchUrl}?${this.searchParams}&section_id=${this.sectionId}`;

        // Update URL on each tab change
        // Prevented when using the 'theme:tab:open-from-history' custom event to avoid endless cycle of wrong history updates
        if (updateHistory) {
          history.pushState({searchParams: this.searchParams}, '', `${window.location.pathname}${this.searchParams && '?'.concat(this.searchParams)}`);
        }
      }

      /**
       * Fetch tab content and handle tab change events
       */
      tabChangeFetchContent(element, tab) {
        const type = element.getAttribute(attributes$A.type);
        const tabId = element.getAttribute(attributes$A.tabsLink);
        const tabContainer = this.container.querySelector(`[${attributes$A.tab}="${tabId}"]`);
        const typeRendered = this.currentType === type;

        if (this.cachedResults[tabId] || typeRendered) {
          if (type === 'product' && !this.searchFilters) {
            this.searchFilters = new Filters(this.container);
          }

          requestAnimationFrame(() => {
            this.handleActiveTabClasses(element, tab);
            this.scrollToCurrentTabLink(element);
            this.triggerTabAnimations(tab);
            this.checkVisibleTabsLinks();
            this.updateAjaxify(tab, type);
          });

          return;
        }

        fetch(this.fetchURL)
          .then((response) => {
            if (!response.ok) {
              const error = new Error(response.status);
              throw error;
            }

            return response.text();
          })
          .then((text) => {
            const parsed = new DOMParser().parseFromString(text, 'text/html');
            const resultsMarkup = parsed.querySelector(`[${attributes$A.tab}="${tabId}"]`).innerHTML;

            // Remove the container with search results with all search types
            if (this.searchForAllTypes) {
              this.container.querySelector(selectors$Q.allTypesContainer)?.remove();
            }

            // Keep the cache for all tabs
            this.cachedResults[tabId] = resultsMarkup;
            // Render tab contents
            tabContainer.innerHTML = resultsMarkup;

            if (type === 'product' && !this.searchFilters) {
              this.searchFilters = new Filters(this.container);
            }

            requestAnimationFrame(() => {
              this.handleActiveTabClasses(element, tab);
              this.scrollToCurrentTabLink(element);
              this.triggerTabAnimations(tab);
              this.checkVisibleTabsLinks();
              this.initInfinityScroll(type);
            });
          })
          .catch((error) => {
            throw error;
          });
      }

      /**
       * Handle history change using `theme:tab:open-from-history` custom events
       */
      onHistoryChange(event) {
        const searchParams = event.state?.searchParams || window.location.search;
        const productResults = searchParams.indexOf('type=product') > -1;
        const articleResults = searchParams.indexOf('type=article') > -1;
        const pageResults = searchParams.indexOf('type=page') > -1;
        const shouldOpenTab = productResults || articleResults || pageResults;
        const typeProduct = this.container.querySelector(`${selectors$Q.tabsLink}[${attributes$A.type}="product"]`);
        const typeArticle = this.container.querySelector(`${selectors$Q.tabsLink}[${attributes$A.type}="article"]`);
        const typePage = this.container.querySelector(`${selectors$Q.tabsLink}[${attributes$A.type}="page"]`);

        if (!shouldOpenTab) {
          // Go to initial search page results if the 'all-search-types' container is removed
          window.location = searchParams;
          return;
        }

        if (productResults) {
          typeProduct?.dispatchEvent(
            new CustomEvent('theme:tab:open-from-history', {
              bubbles: true,
              detail: {
                element: `[${attributes$A.type}="product"]`,
              },
            })
          );
        }

        if (articleResults) {
          typeArticle?.dispatchEvent(
            new CustomEvent('theme:tab:open-from-history', {
              bubbles: true,
              detail: {
                element: `[${attributes$A.type}="article"]`,
              },
            })
          );
        }

        if (pageResults) {
          typePage?.dispatchEvent(
            new CustomEvent('theme:tab:open-from-history', {
              bubbles: true,
              detail: {
                element: `[${attributes$A.type}="page"]`,
              },
            })
          );
        }
      }

      /**
       * Initialise Custom scrollbar
       */
      initCustomScrollbar() {
        if (!this.scrollable || this.customScrollbar) return;

        this.customScrollbar = new CustomScrollbar(this.container);
      }

      /**
       * Use a `theme:tab:ajaxinate` custom event for Infinity Scroll in Filters
       */
      infiniteScrollListener() {
        if (!theme.settings.enableInfinityScroll) return;

        this.ajaxifyFromFiltersEvent = (event) => this.ajaxifyFromFilters(event);

        document.addEventListener('theme:tab:ajaxinate', this.ajaxifyFromFiltersEvent);
      }

      /**
       * Initialise Infinity Scroll with a custom event from Filters
       */
      ajaxifyFromFilters(event) {
        this.initInfinityScroll(event.detail);
      }

      /**
       * Initialise Infinity Scroll
       */
      initInfinityScroll(type) {
        if (!theme.settings.enableInfinityScroll) return;

        // Find all ajaxinate containers
        const ajaxinateContainer = this.container.querySelectorAll(selectors$Q.ajaxinateContainer);
        if (ajaxinateContainer.length === 0) return;

        // Find the current active tab's ajaxinate container
        const activeTab = this.container.querySelector(`${selectors$Q.tab}.${classes$H.current}`);
        const tabAjaxinateContainer = activeTab?.querySelector(selectors$Q.ajaxinateContainer);
        const isLoaded = tabAjaxinateContainer?.classList.contains(classes$H.isLoaded);

        // Whenever the search page with all types is loaded, there is no active tab
        if (!activeTab) {
          this.initAjaxyfy(type);
          return;
        }

        // Fix issues when opening a tab without any results but scrolling still loads more content in other tabs with Ajaxinate
        if (!tabAjaxinateContainer && this.endlessCollection) {
          this.updateAjaxinateInstancesSettings(type);
        }

        // Initialise on load or on tab change events, if the tab content is updated from fetch method
        if (!tabAjaxinateContainer || isLoaded) return;
        this.initAjaxyfy(type);
      }

      /**
       * Update the callback and method settings in Ajaxinate instances
       * The timeout is used to make sure the Ajaxinate instances are present when callbacks are inserted
       */
      updateAjaxinateInstancesSettings(type) {
        setTimeout(() => {
          if (this.endlessCollection.endlessScroll.length === 0) return;

          // Update method to 'click' instead of 'scroll' to prevent Ajaxinate loading on other closed tabs with more results
          [...this.endlessCollection.endlessScroll].forEach((instance) => {
            const containerElement = instance.containerElement;
            const activeTabPresent = [...this.tab].find((tab) => tab.classList.contains(classes$H.current));
            const isInActiveTab = containerElement.closest(`${selectors$Q.tab}.${classes$H.current}`) !== null;

            if (!isInActiveTab && activeTabPresent) instance.settings.method = 'click';
          });

          // Use `initProductGridEvents()` method as a callback when the new pages content is appended
          const callback = () => this.initProductGridEvents();

          if (type === 'product' || type === 'all') {
            const instanceIDCheck = (instance) => {
              return instance.settings.container.indexOf('resultsProducts') > -1 || instance.settings.container.indexOf('allTypes') > -1;
            };
            const productAjaxinateInstance = [...this.endlessCollection.endlessScroll].find(instanceIDCheck);

            if (!productAjaxinateInstance) return;

            productAjaxinateInstance.settings.callback = callback;
          }
        });
      }

      /**
       * Initialise new Ajaxinate instances
       */
      initAjaxyfy(type) {
        if (typeof this.endlessCollection !== 'object') {
          this.endlessCollection = new Ajaxify(this.container);
          this.updateAjaxinateInstancesSettings(type);
          return;
        }

        if (this.endlessCollection.endlessScroll.length > 0) {
          this.endlessCollection.unload();

          this.endlessCollection = new Ajaxify(this.container);
          this.updateAjaxinateInstancesSettings(type);
        }
      }

      /**
       * Update Ajaxinate instances with removing duplicated ones
       */
      updateAjaxify(tab, type) {
        if (this.endlessCollection?.endlessScroll.length === 0) return;

        const ajaxinateContainer = tab.querySelector(selectors$Q.ajaxinateContainer);
        const id = `${selectors$Q.ajaxinateContainer}[${attributes$A.ajaxinateId}="${ajaxinateContainer?.dataset.ajaxinateId}"]`;

        if (!ajaxinateContainer) return;

        this.endlessCollection.update(id);
        this.updateAjaxinateInstancesSettings(type);
      }

      /**
       * Init all the events required on product grid items
       */
      initProductGridEvents() {
        this.productGridEvents = new ProductGrid(this.container);
        this.initTooltips();
      }

      /**
       * Init tooltips for swatches
       */
      initTooltips() {
        this.tooltips = this.container.querySelectorAll(selectors$Q.tooltip);
        this.productGrid = this.container.querySelector(selectors$Q.productGrid);

        if (window.innerWidth < theme.sizes.small) {
          this.tooltips = this.productGrid?.querySelectorAll(selectors$Q.tooltip);
        }

        this.tooltips?.forEach((tooltip) => {
          new Tooltip(tooltip);
        });
      }

      /**
       * Tab change event
       */
      tabChange(element, tab) {
        if (element.classList.contains(classes$H.current)) return;

        if (this.isSearchPage) {
          this.tabChangeFetchContent(element, tab);
          return;
        }

        this.handleActiveTabClasses(element, tab);
        this.scrollToCurrentTabLink(element);
        this.triggerTabAnimations(tab);
        this.handleTabSliders(tab);
        this.checkVisibleTabsLinks();
      }

      /**
       * Handle active tab classes
       */
      handleActiveTabClasses(element, tab) {
        const lastActiveTab = this.container.querySelector(`${selectors$Q.tab}.${classes$H.current}`);
        const lastActiveTabsLink = this.container.querySelector(`${selectors$Q.tabsLink}.${classes$H.current}`);

        // Update active tab's classes
        lastActiveTab?.classList.remove(classes$H.current);
        lastActiveTabsLink?.classList.remove(classes$H.current);
        element.classList.add(classes$H.current);
        tab.classList.add(classes$H.current);

        if (element.classList.contains(classes$H.hide)) {
          tab.classList.add(classes$H.hide);
        }

        // Update tab's referenced elements' classes
        this.tabRef?.forEach((refElement) => {
          const isActive = refElement.classList.contains(classes$H.current);
          const shouldBeActive = refElement.getAttribute(attributes$A.tabRef) === tab.getAttribute(attributes$A.tab);

          refElement.classList.toggle(classes$H.current, !isActive && shouldBeActive);
        });
      }

      /**
       * Scroll to current tab link
       */
      scrollToCurrentTabLink(element) {
        const parent = element.closest(selectors$Q.scrollableHolder) ? element.closest(selectors$Q.scrollableHolder) : element.parentElement;
        const parentPadding = parseInt(window.getComputedStyle(parent).getPropertyValue('padding-left'));

        parent.scrollTo({
          top: 0,
          left: element.offsetLeft - parent.offsetWidth / 2 + element.offsetWidth / 2 + parentPadding,
          behavior: 'smooth',
        });

        element.dispatchEvent(
          new CustomEvent('theme:custom-scrollbar:change', {
            bubbles: true,
            detail: {
              element: element,
            },
          })
        );
      }

      /**
       * Refresh animations if they are enabled
       */
      triggerTabAnimations(tab) {
        if (theme.settings.animations == 'false') return;

        this.tabsContents.querySelectorAll(selectors$Q.aosItem).forEach((element) => {
          element.classList.remove(classes$H.aosAnimate);
        });

        if (this.animateElementsTimer) {
          clearTimeout(this.animateElementsTimer);
        }

        this.animateElementsTimer = setTimeout(() => {
          tab.querySelectorAll(selectors$Q.aosItem).forEach((element) => {
            element.classList.add(classes$H.aosAnimate);
          });
        }, 150);
      }

      /**
       * When the page is scrolled AOS classes are auto updated regardless of each tab visibility
       * Removing them for inactive tabs solves issues with animations refresh on tab opening
       */
      handleInactiveTabsAnimations() {
        this.tab.forEach((tab) => {
          if (!tab.classList.contains(classes$H.current)) {
            tab.querySelectorAll(selectors$Q.aosItem).forEach((element) => {
              requestAnimationFrame(() => element.classList.remove(classes$H.aosAnimate));
            });
          }
        });
      }

      /**
       * Trigger `theme:tab:change` custom event to reset the selected tab slider position
       */
      handleTabSliders(tab) {
        const slider = tab.querySelector(selectors$Q.slider);
        if (slider) slider.dispatchEvent(new CustomEvent('theme:tab:change', {bubbles: false}));
      }

      /**
       * Check visible tab links
       */
      checkVisibleTabsLinks() {
        const tabsNavList = this.container.querySelectorAll(selectors$Q.tabsLink);
        const tabsNavListHidden = this.container.querySelectorAll(`${selectors$Q.tabsLink}.${classes$H.hide}`);
        const difference = tabsNavList.length - tabsNavListHidden.length;

        if (difference < 2) {
          this.container.classList.add(classes$H.alt);
        } else {
          this.container.classList.remove(classes$H.alt);
        }
      }

      /**
       * Event callback for Theme Editor `shopify:block:select` event
       */
      onBlockSelect(event) {
        const element = event.target;
        if (element) {
          element.dispatchEvent(new Event('click'));

          element.parentNode.scrollTo({
            top: 0,
            left: element.offsetLeft - element.clientWidth,
            behavior: 'smooth',
          });
        }
      }

      /**
       * Event callback for Theme Editor `shopify:section:unload` event
       */
      onUnload() {
        if (this.customScrollbar) {
          this.customScrollbar.unload();
        }

        if (this.isSearchPage && theme.settings.enableInfinityScroll) {
          document.removeEventListener('theme:tab:ajaxinate', this.ajaxifyFromFiltersEvent);
        }

        document.removeEventListener('theme:scroll', this.inactiveTabsAnimationsCallback);
      }
    }

    const tabs = {
      onLoad() {
        sections$w[this.id] = new Tabs(this.container);
      },
      onBlockSelect(e) {
        sections$w[this.id].onBlockSelect(e);
      },
      onUnload() {
        sections$w[this.id].onUnload();
      },
    };

    const selectors$P = {
      drawer: '[data-drawer]',
      drawerToggle: '[data-drawer-toggle]',
      scroller: '[data-scroll]',
      quickviewItem: '[data-quick-view-item]',
      tabsLink: '[data-tabs-link]',
    };
    const classes$G = {
      open: 'is-open',
      drawerOpen: 'js-drawer-open',
      contentVisibilityHidden: 'cv-h',
      header: 'site-header',
    };
    const attributes$z = {
      ariaExpanded: 'aria-expanded',
      ariaControls: 'aria-controls',
    };

    let sections$v = {};

    class Drawer {
      constructor(container) {
        this.container = container;
        this.drawers = this.container.querySelectorAll(selectors$P.drawer);
        this.drawerToggleButtons = this.container.querySelectorAll(selectors$P.drawerToggle);
        this.a11y = a11y;

        this.drawerToggleEvent = throttle((event) => {
          this.toggle(event);
        }, 150);

        this.keyPressCloseEvent = throttle((event) => {
          if (event.code === theme.keyboardKeys.ESCAPE) {
            this.close(event);
          }
        }, 150);

        // Define drawer close event
        this.drawerCloseEvent = (event) => {
          const activeDrawer = document.querySelector(`${selectors$P.drawer}.${classes$G.open}`);
          let isDrawerToggle = false;

          if (!activeDrawer) {
            return;
          }

          if (event.type === 'click') {
            isDrawerToggle = event.target.matches(selectors$P.drawerToggle);
          }
          const isDrawerChild = activeDrawer ? activeDrawer.contains(event.target) : false;
          const quickviewItem = activeDrawer.closest(selectors$P.quickviewItem);
          const isQuickviewChild = quickviewItem ? quickviewItem.contains(event.target) : false;

          if (!isDrawerToggle && !isDrawerChild && !isQuickviewChild) {
            this.close();
          }
        };

        this.initListeners();
      }

      initListeners() {
        // Toggle event for each drawer button
        this.drawerToggleButtons.forEach((button) => {
          button.addEventListener('click', this.drawerToggleEvent);
        });

        // Close drawers if escape key pressed
        this.drawers.forEach((drawer) => {
          drawer.addEventListener('keyup', this.keyPressCloseEvent);

          // Init collapsible mobile dropdowns
          this.collapsible = new Collapsible(drawer);
          this.tabs = new Tabs(drawer);
        });

        // Close drawers on click outside
        document.addEventListener('click', this.drawerCloseEvent);

        // Close drawers on closing event
        document.addEventListener('theme:drawer:closing', this.drawerCloseEvent);
      }

      toggle(e) {
        e.preventDefault();
        const drawer = document.querySelector(`#${e.target.getAttribute(attributes$z.ariaControls)}`);
        if (!drawer) {
          return;
        }

        const isDrawerOpen = drawer.classList.contains(classes$G.open);

        if (isDrawerOpen) {
          this.close();
        } else {
          this.open(e);
        }
      }

      open(e) {
        const drawerOpenButton = e.target;
        const drawer = document.querySelector(`#${e.target.getAttribute(attributes$z.ariaControls)}`);

        if (!drawer) {
          return;
        }
        const drawerScroller = drawer.querySelector(selectors$P.scroller) || drawer;

        // Disable page scroll right away
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: drawerScroller}));
        document.dispatchEvent(new CustomEvent('theme:drawer:open'), {bubbles: true});
        document.body.classList.add(classes$G.drawerOpen);

        drawer.classList.add(classes$G.open);
        drawer.classList.remove(classes$G.contentVisibilityHidden);
        drawerOpenButton.setAttribute(attributes$z.ariaExpanded, true);

        setTimeout(() => {
          this.a11y.state.trigger = drawerOpenButton;
          this.a11y.trapFocus({
            container: drawer,
          });
        });
      }

      close() {
        if (!document.body.classList.contains(classes$G.drawerOpen)) {
          return;
        }

        const drawer = document.querySelector(`${selectors$P.drawer}.${classes$G.open}`);

        this.drawerToggleButtons.forEach((button) => {
          button.setAttribute(attributes$z.ariaExpanded, false);
        });

        this.a11y.removeTrapFocus({
          container: drawer,
        });

        drawer.classList.remove(classes$G.open);

        const onDrawerTransitionEnd = (event) => {
          if (event.target !== drawer) return;

          requestAnimationFrame(() => {
            drawer.classList.add(classes$G.contentVisibilityHidden);
            document.dispatchEvent(new CustomEvent('theme:drawer:close'), {bubbles: true});
            document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
          });

          drawer.removeEventListener('transitionend', onDrawerTransitionEnd);
        };

        drawer.addEventListener('transitionend', onDrawerTransitionEnd);

        document.body.classList.remove(classes$G.drawerOpen);
      }

      onUnload() {
        // Close drawer
        this.close();

        // Unbind all event listeners for drawers
        this.drawerToggleButtons.forEach((button) => {
          button.removeEventListener('click', this.drawerToggleEvent);
        });
        this.drawers.forEach((drawer) => {
          drawer.removeEventListener('keyup', this.keyPressCloseEvent);
        });
        document.removeEventListener('click', this.drawerCloseEvent);
        document.removeEventListener('theme:drawer:closing', this.drawerCloseEvent);

        if (this.collapsible) {
          this.collapsible.onUnload();
        }

        if (this.tabs) {
          this.tabs.onUnload();
        }
      }
    }

    const drawer = {
      onLoad() {
        if (this.container.classList.contains(classes$G.header)) {
          this.container = this.container.parentNode;
        }

        sections$v[this.id] = new Drawer(this.container);
      },
      onUnload() {
        sections$v[this.id].onUnload();
      },
    };

    const showElement = (elem, removeProp = false, prop = 'block') => {
      if (elem) {
        if (removeProp) {
          elem.style.removeProperty('display');
        } else {
          elem.style.display = prop;
        }
      }
    };

    const hideElement = (elem) => {
      if (elem) {
        elem.style.display = 'none';
      }
    };

    const scrollTo = (elementTop) => {
      const {stickyHeaderHeight} = readHeights();

      window.scrollTo({
        top: elementTop + Math.round(window.scrollY) - stickyHeaderHeight,
        left: 0,
        behavior: 'smooth',
      });
    };

    const selectors$O = {
      list: '[data-store-availability-list]',
    };

    const defaults = {
      close: '.js-modal-close',
      open: '.js-modal-open-store-availability-modal',
      openClass: 'modal--is-active',
      openBodyClass: 'modal--is-visible',
      closeModalOnClick: false,
      scrollIntoView: false,
    };

    class Modals {
      constructor(id, options) {
        this.modal = document.getElementById(id);

        if (!this.modal) return false;

        this.nodes = {
          parents: [document.querySelector('html'), document.body],
        };
        this.config = Object.assign(defaults, options);
        this.modalIsOpen = false;
        this.focusOnOpen = this.config.focusOnOpen ? document.getElementById(this.config.focusOnOpen) : this.modal;
        this.openElement = document.querySelector(this.config.open);
        this.a11y = a11y;

        this.init();
      }

      init() {
        this.openElement.addEventListener('click', this.open.bind(this));
        this.modal.querySelector(this.config.close).addEventListener('click', this.closeModal.bind(this));
      }

      open(evt) {
        // Keep track if modal was opened from a click, or called by another function
        let externalCall = false;
        // Prevent following href if link is clicked
        if (evt) {
          evt.preventDefault();
        } else {
          externalCall = true;
        }

        if (this.modalIsOpen && !externalCall) {
          this.closeModal();
          return;
        }

        this.modal.classList.add(this.config.openClass);
        this.nodes.parents.forEach((node) => {
          node.classList.add(this.config.openBodyClass);
        });
        this.modalIsOpen = true;

        const scrollableElement = document.querySelector(selectors$O.list);
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: scrollableElement}));

        if (this.config.scrollIntoView) {
          this.scrollIntoView();
        }
        this.bindEvents();

        this.a11y.trapFocus({
          container: this.modal,
        });
      }

      closeModal() {
        if (!this.modalIsOpen) return;
        document.activeElement.blur();
        this.modal.classList.remove(this.config.openClass);
        var self = this;
        this.nodes.parents.forEach(function (node) {
          node.classList.remove(self.config.openBodyClass);
        });
        this.modalIsOpen = false;
        this.openElement.focus();
        this.unbindEvents();

        this.a11y.removeTrapFocus({
          container: this.modal,
        });

        // Enable page scroll right after the closing animation ends
        const timeout = 400;
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: timeout}));
      }

      bindEvents() {
        this.keyupHandler = this.keyupHandler.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        document.body.addEventListener('keyup', this.keyupHandler);
        document.body.addEventListener('click', this.clickHandler);
      }

      unbindEvents() {
        document.body.removeEventListener('keyup', this.keyupHandler);
        document.body.removeEventListener('click', this.clickHandler);
      }

      keyupHandler(event) {
        if (event.code === theme.keyboardKeys.ESCAPE) {
          this.closeModal();
        }
      }

      clickHandler(event) {
        if (this.config.closeModalOnClick && !this.modal.contains(event.target) && !event.target.matches(this.config.open)) {
          this.closeModal();
        }
      }

      scrollIntoView() {
        this.focusOnOpen.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }

    const selectors$N = {
      body: 'body',
      storeAvailabilityModal: '[data-store-availability-modal]',
      storeAvailabilityModalOpen: '[data-store-availability-modal-open]',
      storeAvailabilityModalClose: '[data-store-availability-modal-close]',
      storeAvailabilityModalProductTitle: '[data-store-availability-modal-product__title]',
    };

    const classes$F = {
      openClass: 'store-availabilities-modal--active',
    };

    class StoreAvailability {
      constructor(container) {
        this.container = container;
      }

      updateContent(variantId, productTitle) {
        this._fetchStoreAvailabilities(variantId, productTitle);
      }

      clearContent() {
        this.container.innerHTML = '';
      }

      _initModal() {
        return new Modals('StoreAvailabilityModal', {
          close: selectors$N.storeAvailabilityModalClose,
          open: selectors$N.storeAvailabilityModalOpen,
          closeModalOnClick: true,
          openClass: classes$F.openClass,
          scrollIntoView: false,
        });
      }

      _fetchStoreAvailabilities(variantId, productTitle) {
        const variantSectionUrl = '/variants/' + variantId + '/?section_id=store-availability';
        this.clearContent();

        const self = this;
        fetch(variantSectionUrl)
          .then(function (response) {
            return response.text();
          })
          .then(function (storeAvailabilityHTML) {
            const body = document.querySelector(selectors$N.body);
            let storeAvailabilityModal = body.querySelector(selectors$N.storeAvailabilityModal);
            if (storeAvailabilityModal) {
              storeAvailabilityModal.remove();
            }

            self.container.innerHTML = storeAvailabilityHTML;
            self.container.innerHTML = self.container.firstElementChild.innerHTML;

            if (self.container.firstElementChild.innerHTML.trim() === '') {
              self.clearContent();
              return;
            }

            const storeAvailabilityModalOpen = self.container.querySelector(selectors$N.storeAvailabilityModalOpen);
            // Only create modal if open modal element exists
            if (!storeAvailabilityModalOpen) {
              return;
            }

            self.modal = self._initModal();
            self._updateProductTitle(productTitle);

            storeAvailabilityModal = self.container.querySelector(selectors$N.storeAvailabilityModal);
            if (storeAvailabilityModal) {
              body.appendChild(storeAvailabilityModal);
            }
          });
      }

      _updateProductTitle(productTitle) {
        const storeAvailabilityModalProductTitle = this.container.querySelector(selectors$N.storeAvailabilityModalProductTitle);
        storeAvailabilityModalProductTitle.textContent = productTitle;
      }
    }

    /**
     * Variant Sellout Precrime Click Preview
     * I think of this like the precrime machine in Minority report.  It gives a preview
     * of every possible click action, given the current form state.  The logic is:
     *
     * for each clickable name=options[] variant selection element
     * find the value of the form if the element were clicked
     * lookup the variant with those value in the product json
     * clear the classes, add .unavailable if it's not found,
     * and add .sold-out if it is out of stock
     *
     * Caveat: we rely on the option position so we don't need
     * to keep a complex map of keys and values.
     */

    const selectors$M = {
      form: '[data-product-form]',
      optionPosition: '[data-option-position]',
      optionInput: '[name^="options"], [data-popout-option]',
    };

    const classes$E = {
      soldOut: 'sold-out',
      unavailable: 'unavailable',
    };

    const attributes$y = {
      optionPosition: 'data-option-position',
      selectOptionValue: 'data-value',
    };

    class SelloutVariants {
      constructor(container, productJSON) {
        this.container = container;
        this.productJSON = productJSON;
        this.form = this.container.querySelector(selectors$M.form);
        this.formData = new FormData(this.form);
        this.optionElements = this.container.querySelectorAll(selectors$M.optionInput);

        if (this.productJSON && this.form) {
          this.init();
        }
      }

      init() {
        this.update();
      }

      update() {
        this.getCurrentState();

        this.optionElements.forEach((el) => {
          const val = el.value || el.getAttribute(attributes$y.selectOptionValue);
          const optionSelector = el.closest(selectors$M.optionPosition);

          if (!optionSelector) {
            return;
          }

          const positionString = optionSelector.getAttribute(attributes$y.optionPosition);
          // subtract one because option.position in liquid does not count form zero, but JS arrays do
          const position = parseInt(positionString, 10) - 1;

          let newVals = [...this.selections];
          newVals[position] = val;

          const found = this.productJSON.variants.find((element) => {
            // only return true if every option matches our hypothetical selection
            let perfectMatch = true;
            for (let index = 0; index < newVals.length; index++) {
              if (element.options[index] !== newVals[index]) {
                perfectMatch = false;
              }
            }
            return perfectMatch;
          });

          el.parentElement.classList.remove(classes$E.soldOut, classes$E.unavailable);
          if (typeof found === 'undefined') {
            el.parentElement.classList.add(classes$E.unavailable);
          } else if (found?.available === false) {
            el.parentElement.classList.add(classes$E.soldOut);
          }
        });
      }

      getCurrentState() {
        this.formData = new FormData(this.form);
        this.selections = [];
        for (var value of this.formData.entries()) {
          if (value[0].includes('options[')) {
            // push the current state of the form, dont worry about the group name
            // we will be using the array position instead of the name to match values
            this.selections.push(value[1]);
          }
        }
      }
    }

    const settings$6 = {
      templateIndex: 1,
    };

    const classes$D = {
      popupNotification: 'pswp--notification pswp--not-close-btn',
    };

    const attributes$x = {
      notificationPopup: 'data-notification-popup',
    };

    const options$1 = {
      history: false,
      focus: false,
      mainClass: classes$D.popupNotification,
      closeOnVerticalDrag: false,
    };

    class NotificationPopup {
      constructor(button) {
        this.button = button;
        this.a11y = a11y;
        this.notificationPopupHtml = this.button.getAttribute(attributes$x.notificationPopup);

        if (this.notificationPopupHtml.trim() !== '') {
          this.init();
        }
      }

      init() {
        const items = [
          {
            html: this.notificationPopupHtml,
          },
        ];

        this.a11y.state.trigger = this.button;

        new LoadPhotoswipe(items, options$1, settings$6.templateIndex);
      }
    }

    const selectors$L = {
      product: '[data-product]',
      productForm: '[data-product-form]',
      addToCart: '[data-add-to-cart]',
      addToCartText: '[data-add-to-cart-text]',
      buyItNow: '[data-buy-it-now]',
      comparePrice: '[data-compare-price]',
      formWrapper: '[data-form-wrapper]',
      header: '[data-site-header]',
      originalSelectorId: '[data-product-select]',
      preOrderTag: '_preorder',
      priceWrapper: '[data-price-wrapper]',
      priceOffWrap: '[data-price-off]',
      priceOffType: '[data-price-off-type]',
      priceOffAmount: '[data-price-off-amount]',
      productSlide: '[data-product-slide]',
      productImage: '[data-product-image]',
      productMediaSlider: '[data-product-single-media-slider]',
      productJson: '[data-product-json]',
      productPrice: '[data-product-price]',
      unitPrice: '[data-product-unit-price]',
      unitBase: '[data-product-base]',
      unitWrapper: '[data-product-unit]',
      subPrices: '[data-subscription-watch-price]',
      subSelectors: '[data-subscription-selectors]',
      subsToggle: '[data-toggles-group]',
      subsChild: 'data-group-toggle',
      subDescription: '[data-plan-description]',
      remainingCount: '[data-remaining-count]',
      remainingWrapper: '[data-remaining-wrapper]',
      remainingJSON: '[data-product-remaining-json]',
      idInput: '[name="id"]',
      storeAvailabilityContainer: '[data-store-availability-container]',
      upsellButton: '[data-upsell-btn]',
      sectionNode: '.shopify-section',
      quickViewItem: '[data-quick-view-item]',
      notificationButtonText: '[data-notification-button-text]',
      swatchesContainer: '[data-swatches-container]',
      swatchesMore: '[data-swatches-more]',
      selectorWrapper: '[data-option-position]',
      shopifyPaymentButton: '.shopify-payment-button__button',
      paymentButton: '[role="button"], [type="submit"], form',
      disabled: '[disabled]',
    };

    const classes$C = {
      hidden: 'hidden',
      variantSoldOut: 'variant--soldout',
      variantUnavailable: 'variant--unavailabe',
      productPriceSale: 'product__price--sale',
      priceWrapperHidden: 'product__price--hidden',
      remainingLow: 'count-is-low',
      remainingIn: 'count-is-in',
      remainingOut: 'count-is-out',
      remainingUnavailable: 'count-is-unavailable',
      selectorVisible: 'selector-wrapper--visible',
    };

    const attributes$w = {
      productImageId: 'data-image-id',
      tallLayout: 'data-tall-layout',
      dataEnableHistoryState: 'data-enable-history-state',
      notificationPopup: 'data-notification-popup',
      swatchVariant: 'data-swatch-variant',
      disabled: 'disabled',
    };

    let sections$u = {};

    class ProductAddForm {
      constructor(container) {
        this.container = container;
        this.product = this.container.querySelector(selectors$L.product);
        this.productForm = this.container.querySelector(selectors$L.productForm);
        this.tallLayout = this.container.getAttribute(attributes$w.tallLayout) === 'true';
        this.addToCartButton = this.container.querySelector(selectors$L.addToCart);
        this.buyItNow = this.container.querySelector(selectors$L.buyItNow);
        this.hasPaymentButton = this.buyItNow !== null;

        // Stop parsing if we don't have the product
        if (!this.product || !this.productForm) {
          const counter = new QuantityCounter(this.container);
          counter.init();
          return;
        }

        this.storeAvailabilityContainer = this.container.querySelector(selectors$L.storeAvailabilityContainer);
        this.enableHistoryState = this.container.getAttribute(attributes$w.dataEnableHistoryState) === 'true';
        this.hasUnitPricing = this.container.querySelector(selectors$L.unitWrapper);
        this.subSelectors = this.container.querySelector(selectors$L.subSelectors);
        this.subPrices = this.container.querySelector(selectors$L.subPrices);
        this.priceOffWrap = this.container.querySelector(selectors$L.priceOffWrap);
        this.priceOffAmount = this.container.querySelector(selectors$L.priceOffAmount);
        this.priceOffType = this.container.querySelector(selectors$L.priceOffType);
        this.planDecription = this.container.querySelector(selectors$L.subDescription);
        this.swatchesContainer = this.container.querySelector(selectors$L.swatchesContainer);
        this.latestVariantId = '';
        this.latestVariantTitle = '';
        this.sellout = null;

        this.sessionStorage = window.sessionStorage;

        this.remainingWrapper = this.container.querySelector(selectors$L.remainingWrapper);

        if (this.remainingWrapper) {
          this.remainingMaxInt = parseInt(this.remainingWrapper.dataset.remainingMax, 10);
          this.remainingCount = this.container.querySelector(selectors$L.remainingCount);
          this.remainingJSONWrapper = this.container.querySelector(selectors$L.remainingJSON);
          this.remainingJSON = null;

          if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
            this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
          }
        }

        if (this.storeAvailabilityContainer) {
          this.storeAvailability = new StoreAvailability(this.storeAvailabilityContainer);
        }

        const counter = new QuantityCounter(this.container);
        counter.init();

        this.init();

        if (this.hasPaymentButton) {
          this.mutationObserver = null;
          this.onResizeCallback = () => this.updateButtonsHeight();
          this.observeContainer();
          window.addEventListener('theme:resize:width', this.onResizeCallback);
        }
      }

      init() {
        let productJSON = null;
        const productElemJSON = this.container.querySelector(selectors$L.productJson);

        if (productElemJSON) {
          productJSON = productElemJSON.innerHTML;
        }
        if (productJSON) {
          this.productJSON = JSON.parse(productJSON);
          this.linkForm();
          this.sellout = new SelloutVariants(this.container, this.productJSON);
        } else {
          console.error('Missing product JSON');
        }
      }

      observeContainer() {
        // Create a MutationObserver to observe changes in the container
        this.mutationObserver = new MutationObserver((mutationList) => {
          for (const mutation of mutationList) {
            if (mutation.type === 'childList' && mutation.target.closest(selectors$L.buyItNow)) {
              this.updateButtonsHeight();

              if (!mutation.target.querySelector(selectors$L.disabled)) {
                this.mutationObserver?.disconnect();
                this.mutationObserver = null;
              }
            }
          }
        });
        this.mutationObserver.observe(this.container, {childList: true, subtree: true});
      }

      updateButtonsHeight() {
        this.shopifyPaymentButton = this.container.querySelector(selectors$L.shopifyPaymentButton);
        this.paymentButton = this.buyItNow.querySelectorAll(`${selectors$L.paymentButton}`);

        if (!this.shopifyPaymentButton) return;
        if (this.shopifyPaymentButton.hasAttribute(attributes$w.disabled)) return;

        // Reset heights to 'auto'
        this.shopifyPaymentButton.setAttribute('style', 'min-height: auto !important;');
        this.addToCartButton.setAttribute('style', 'min-height: auto;');
        this.paymentButton.forEach((element) => element.setAttribute('style', 'min-height: auto !important;'));

        // Gather elements heights for comparison
        requestAnimationFrame(() => {
          this.compareHeights = [];
          this.paymentButton.forEach((element) => this.compareHeights.push(element.offsetHeight));
          this.compareHeights.push(this.shopifyPaymentButton.offsetHeight);
          this.compareHeights.push(this.addToCartButton.offsetHeight);
          debounce(this.setButtonsStyles(), 400);
        });
      }

      setButtonsStyles() {
        if (this.compareHeights.length === 0) return;

        this.maxHeight = Math.max(...this.compareHeights);

        requestAnimationFrame(() => {
          this.addToCartButton.setAttribute('style', `min-height: ${this.maxHeight}px;`);
          this.shopifyPaymentButton.setAttribute('style', `min-height: ${this.maxHeight}px !important; height: auto !important;`);
          this.paymentButton.forEach((element) => element.setAttribute('style', `min-height: ${this.maxHeight}px !important; height: auto !important;`));
        });
      }

      linkForm() {
        this.productForm = new ProductForm(this.productForm, this.productJSON, {
          onOptionChange: this.onOptionChange.bind(this),
          onPlanChange: this.onPlanChange.bind(this),
        });
        const formState = this.productForm.getFormState();
        this.pushState(formState, true);
        this.subsToggleListeners();

        // Swatches show more functionality
        if (this.swatchesContainer) {
          this.observeSwatch(formState);

          const selectorWrapper = this.swatchesContainer.closest(selectors$L.selectorWrapper);
          const moreLink = selectorWrapper.querySelector(selectors$L.swatchesMore);
          moreLink?.addEventListener('click', (event) => {
            event.preventDefault();
            if (selectorWrapper.classList.contains(classes$C.selectorVisible)) {
              selectorWrapper.classList.remove(classes$C.selectorVisible);
            } else {
              selectorWrapper.classList.add(classes$C.selectorVisible);
            }
          });
        }
      }

      onOptionChange(evt) {
        this.pushState(evt.dataset);
        this.updateProductImage(evt);
      }

      onPlanChange(evt) {
        if (this.subPrices) {
          this.pushState(evt.dataset);
        }
      }

      pushState(formState, init = false) {
        this.productState = this.setProductState(formState);
        this.updateAddToCartState(formState);
        this.updateProductPrices(formState);
        this.updateSaleText(formState);
        this.updateSubscriptionText(formState);
        this.fireHookEvent(formState);
        this.updateRemaining(formState);
        this.sellout?.update(formState);

        if (this.enableHistoryState && !init) {
          this.updateHistoryState(formState);
        }

        if (this.storeAvailability) {
          if (formState.variant) {
            this.storeAvailability.updateContent(formState.variant.id, this.productForm.product.title);
          } else {
            this.storeAvailability.clearContent();
          }
        }
      }

      updateAddToCartState(formState) {
        const variant = formState.variant;
        const priceWrapper = this.container.querySelectorAll(selectors$L.priceWrapper);
        const addToCart = this.container.querySelectorAll(selectors$L.addToCart);
        const addToCartText = this.container.querySelectorAll(selectors$L.addToCartText);
        const formWrapper = this.container.querySelectorAll(selectors$L.formWrapper);
        const buyItNow = this.container.querySelector(selectors$L.buyItNow);
        let addText = theme.strings.add_to_cart;

        if (this.productJSON.tags.includes(selectors$L.preOrderTag)) {
          addText = theme.strings.preorder;
        }

        // Price wrapper elements
        priceWrapper?.forEach((element) => {
          // Hide price if there is no variant
          element.classList.toggle(classes$C.priceWrapperHidden, !variant);
        });

        // ATC Button elements
        addToCart?.forEach((element) => {
          // Skip the upsell "add to cart" button
          if (element.matches(selectors$L.upsellButton)) return;

          element.disabled = true;
          buyItNow?.classList.add(classes$C.hidden);

          // No variant
          if (!variant) return;

          // Available variant
          element.disabled = false;
          if (variant.available) {
            buyItNow?.classList.remove(classes$C.hidden);
          }

          // Notification popup
          if (!element.hasAttribute(attributes$w.notificationPopup)) return;

          const notificationFormId = element.id.replace('AddToCart', 'NotificationForm');
          const formID = this.sessionStorage.getItem('notification_form_id');
          let notificationFormSubmitted = false;
          let variantId = variant.id;
          let variantTitle = variant.title;

          if (formID) {
            const sessionId = formID.substring(0, formID.lastIndexOf('--'));
            const sessionVariantId = formID.split('--').slice(-1)[0];
            notificationFormSubmitted = notificationFormId === sessionId;

            if (notificationFormSubmitted) {
              this.latestVariantId = variantId;
              this.latestVariantTitle = variantTitle;
              variantId = Number(sessionVariantId);

              this.productJSON.variants.forEach((variant) => {
                if (variant.id === variantId) {
                  variantTitle = variant.title;
                }
              });
            }
          }

          let notificationPopupHtml = element.getAttribute(attributes$w.notificationPopup);
          const notificationButtonText = new DOMParser().parseFromString(notificationPopupHtml, 'text/html').querySelector(selectors$L.notificationButtonText)?.innerHTML;

          if (this.latestVariantId != '' && this.latestVariantTitle != '') {
            notificationPopupHtml = notificationPopupHtml.replaceAll(this.latestVariantId, variantId);
            notificationPopupHtml = notificationPopupHtml.replaceAll(this.latestVariantTitle, variantTitle);

            // Prevent updating of the "Notify me" button's text if the variant title matches part of it
            const updatedNotificationButtonText = new DOMParser().parseFromString(notificationPopupHtml, 'text/html').querySelector(selectors$L.notificationButtonText)?.innerHTML;
            notificationPopupHtml = notificationPopupHtml.replace(updatedNotificationButtonText, notificationButtonText);
          }

          element.setAttribute(attributes$w.notificationPopup, notificationPopupHtml);

          if (notificationFormSubmitted) {
            this.scrollToForm(this.product.closest(selectors$L.sectionNode));
            new NotificationPopup(element);
          }

          this.latestVariantId = variantId;
          this.latestVariantTitle = variantTitle;
        });

        // ATC Buttons' text elements
        addToCartText?.forEach((element) => {
          // No variant
          if (!variant) {
            element.innerHTML = theme.strings.unavailable;
            return;
          }

          // Unavailable variant
          if (!variant.available) {
            element.innerHTML = theme.strings.sold_out;

            if (element.parentNode.hasAttribute(attributes$w.notificationPopup)) {
              if (element.closest(selectors$L.quickViewItem)) return; // Disable 'notify me' text change for Quickview

              element.innerHTML = `${theme.strings.sold_out} - ${theme.strings.newsletter_product_availability}`;
            }

            return;
          }

          // Available variant
          element.innerHTML = addText;
        });

        // Form wrapper elements
        formWrapper?.forEach((element) => {
          // No variant
          if (!variant) {
            element.classList.add(classes$C.variantUnavailable);
            element.classList.remove(classes$C.variantSoldOut);
            return;
          }

          const formSelect = element.querySelector(selectors$L.originalSelectorId);
          if (formSelect) {
            formSelect.value = variant.id;
          }

          // Unavailable variant
          if (!variant.available) {
            element.classList.add(classes$C.variantSoldOut);
            element.classList.remove(classes$C.variantUnavailable);
            return;
          }

          // Available variant
          element.classList.remove(classes$C.variantSoldOut, classes$C.variantUnavailable);
        });
      }

      updateHistoryState(formState) {
        const variant = formState.variant;
        const plan = formState.plan;
        const location = window.location.href;
        if (variant && location.includes('/product')) {
          const url = new window.URL(location);
          const params = url.searchParams;
          params.set('variant', variant.id);
          if (plan && plan.detail && plan.detail.id && this.productState.hasPlan) {
            params.set('selling_plan', plan.detail.id);
          } else {
            params.delete('selling_plan');
          }
          url.search = params.toString();
          const urlString = url.toString();
          window.history.replaceState({path: urlString}, '', urlString);
        }
      }

      updateRemaining(formState) {
        const variant = formState.variant;
        const remainingClasses = [classes$C.remainingIn, classes$C.remainingOut, classes$C.remainingUnavailable, classes$C.remainingLow];

        if (variant && this.remainingWrapper && this.remainingJSON) {
          const remaining = this.remainingJSON[variant.id];

          if (remaining === 'out' || remaining < 1) {
            this.remainingWrapper.classList.remove(...remainingClasses);
            this.remainingWrapper.classList.add(classes$C.remainingOut);
          }

          if (remaining === 'in' || remaining >= this.remainingMaxInt) {
            this.remainingWrapper.classList.remove(...remainingClasses);
            this.remainingWrapper.classList.add(classes$C.remainingIn);
          }

          if (remaining === 'low' || (remaining > 0 && remaining < this.remainingMaxInt)) {
            this.remainingWrapper.classList.remove(...remainingClasses);
            this.remainingWrapper.classList.add(classes$C.remainingLow);

            if (this.remainingCount) {
              this.remainingCount.innerHTML = remaining;
            }
          }
        } else if (!variant && this.remainingWrapper) {
          this.remainingWrapper.classList.remove(...remainingClasses);
          this.remainingWrapper.classList.add(classes$C.remainingUnavailable);
        }
      }

      getBaseUnit(variant) {
        return variant.unit_price_measurement.reference_value === 1
          ? variant.unit_price_measurement.reference_unit
          : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
      }

      subsToggleListeners() {
        const toggles = this.container.querySelectorAll(selectors$L.subsToggle);

        toggles.forEach((toggle) => {
          toggle.addEventListener(
            'change',
            function (e) {
              const val = e.target.value.toString();
              const selected = this.container.querySelector(`[${selectors$L.subsChild}="${val}"]`);
              const groups = this.container.querySelectorAll(`[${selectors$L.subsChild}]`);
              if (selected) {
                selected.classList.remove(classes$C.hidden);
                const first = selected.querySelector('[name="selling_plan"]');
                first.checked = true;
                first.dispatchEvent(new Event('change'));
              }
              groups.forEach((group) => {
                if (group !== selected) {
                  group.classList.add(classes$C.hidden);
                  const plans = group.querySelectorAll('[name="selling_plan"]');
                  plans.forEach((plan) => {
                    plan.checked = false;
                    plan.dispatchEvent(new Event('change'));
                  });
                }
              });
            }.bind(this)
          );
        });
      }

      updateSaleText(formState) {
        if (this.productState.planSale) {
          this.updateSaleTextSubscription(formState);
        } else if (this.productState.onSale) {
          this.updateSaleTextStandard(formState);
        } else if (this.priceOffWrap) {
          this.priceOffWrap.classList.add(classes$C.hidden);
        }
      }

      updateSaleTextStandard(formState) {
        if (!this.priceOffType) {
          return;
        }
        this.priceOffType.innerHTML = window.theme.strings.sale_badge_text || 'sale';
        const variant = formState.variant;
        if (window.theme.settings.savingBadgeType && window.theme.settings.savingBadgeType === 'percentage') {
          const discountFloat = (variant.compare_at_price - variant.price) / variant.compare_at_price;
          const discountInt = Math.floor(discountFloat * 100);
          this.priceOffAmount.innerHTML = `${discountInt}%`;
        } else {
          const discount = variant.compare_at_price - variant.price;
          this.priceOffAmount.innerHTML = themeCurrency.formatMoney(discount, theme.moneyFormat);
        }
        this.priceOffWrap.classList.remove(classes$C.hidden);
      }

      updateSaleTextSubscription(formState) {
        const variant = formState.variant;
        const variantFirstPlan = this.productForm.product.selling_plan_groups.find((plan) => plan.id === variant.selling_plan_allocations[0].selling_plan_group_id);
        const adjustment = formState.plan ? formState.plan.detail.price_adjustments[0] : variantFirstPlan.selling_plans[0].price_adjustments[0];
        const discount = adjustment.value || 0;
        const saleText = adjustment.value_type === 'percentage' ? `${discount}%` : themeCurrency.formatMoney(variant.price - discount, theme.moneyFormat);

        this.priceOffType.innerHTML = window.theme.strings.subscription || 'subscripton';
        this.priceOffAmount.innerHTML = saleText;
        this.priceOffWrap.classList.remove(classes$C.hidden);
      }

      updateSubscriptionText(formState) {
        if (formState.plan && this.planDecription && formState.plan.detail.description !== null) {
          this.planDecription.innerHTML = formState.plan.detail.description;
          this.planDecription.classList.remove(classes$C.hidden);
        } else if (this.planDecription) {
          this.planDecription.classList.add(classes$C.hidden);
        }
      }

      updateProductPrices(formState) {
        const variant = formState.variant;
        const plan = formState.plan;
        const priceWrappers = this.container.querySelectorAll(selectors$L.priceWrapper);

        priceWrappers.forEach((wrap) => {
          const comparePriceEl = wrap.querySelector(selectors$L.comparePrice);
          const productPriceEl = wrap.querySelector(selectors$L.productPrice);

          let comparePrice = '';
          let price = '';

          if (this.productState.available) {
            comparePrice = variant.compare_at_price;
            price = variant.price;
          }

          if (this.productState.hasPlan) {
            const allocationPrice = plan ? plan.allocation.price : variant.selling_plan_allocations[0].per_delivery_price;
            price = allocationPrice;
          }

          if (this.productState.planSale) {
            const allocationPrice = plan ? plan.allocation.price : variant.selling_plan_allocations[0].per_delivery_price;
            const allocationPriceCompare = plan ? plan.allocation.compare_at_price : variant.selling_plan_allocations[0].compare_at_price;
            comparePrice = allocationPriceCompare;
            price = allocationPrice;
          }

          if (comparePriceEl) {
            if (this.productState.onSale || this.productState.planSale) {
              comparePriceEl.classList.remove(classes$C.hidden);
              productPriceEl.classList.add(classes$C.productPriceSale);
            } else {
              comparePriceEl.classList.add(classes$C.hidden);
              productPriceEl.classList.remove(classes$C.productPriceSale);
            }
            let price_string = theme.settings.currency_code_enable ? themeCurrency.formatMoney(comparePrice, theme.moneyWithCurrencyFormat) : themeCurrency.formatMoney(comparePrice, theme.moneyFormat);
            comparePriceEl.innerHTML = price_string.replace('.00','');
          }

          if (price === 0) {
            productPriceEl.innerHTML = window.theme.strings.free;
          }
          else{
            let price_string = theme.settings.currency_code_enable ? themeCurrency.formatMoney(price, theme.moneyWithCurrencyFormat) : themeCurrency.formatMoney(price, theme.moneyFormat);
            productPriceEl.innerHTML = price_string.replace('.00','');
          }
        });

        if (this.hasUnitPricing) {
          this.updateProductUnits(formState);
        }
      }

      updateProductUnits(formState) {
        const variant = formState.variant;
        const plan = formState.plan;
        let unitPrice = null;

        if (variant && variant.unit_price) {
          unitPrice = variant.unit_price;
        }
        if (plan && plan?.allocation && plan?.allocation.unit_price) {
          unitPrice = plan.allocation.unit_price;
        }
        if (!plan && variant.selling_plan_allocations) {
          if (variant.selling_plan_allocations.length > 0) {
            const allocationUnitPrice = variant.selling_plan_allocations[0].unit_price;
            unitPrice = allocationUnitPrice;
          }
        }

        if (unitPrice) {
          const base = this.getBaseUnit(variant);
          const formattedPrice = unitPrice === 0 ? window.theme.strings.free : themeCurrency.formatMoney(unitPrice, theme.moneyFormat);
          this.container.querySelector(selectors$L.unitPrice).innerHTML = formattedPrice;
          this.container.querySelector(selectors$L.unitBase).innerHTML = base;
          showElement(this.container.querySelector(selectors$L.unitWrapper));
        } else {
          hideElement(this.container.querySelector(selectors$L.unitWrapper));
        }
      }

      fireHookEvent(formState) {
        const variant = formState.variant;

        // Hook for product variant change event
        this.container.dispatchEvent(
          new CustomEvent('theme:variant:change', {
            detail: {
              variant: variant,
            },
            bubbles: true,
          })
        );
      }

      /**
       * Tracks aspects of the product state that are relevant to UI updates
       * @param {object} evt - variant change event
       * @return {object} productState - represents state of variant + plans
       *  productState.available - current variant and selling plan options result in valid offer
       *  productState.soldOut - variant is sold out
       *  productState.onSale - variant is on sale
       *  productState.showUnitPrice - variant has unit price
       *  productState.requiresPlan - all the product variants requires a selling plan
       *  productState.hasPlan - there is a valid selling plan
       *  productState.planSale - plan has a discount to show next to price
       *  productState.planPerDelivery - plan price does not equal per_delivery_price - a prepaid subscribtion
       */
      setProductState(dataset) {
        const variant = dataset.variant;
        const plan = dataset.plan;

        const productState = {
          available: true,
          soldOut: false,
          onSale: false,
          showUnitPrice: false,
          requiresPlan: false,
          hasPlan: false,
          planPerDelivery: false,
          planSale: false,
        };

        if (!variant) {
          productState.available = false;
        } else {
          const requiresPlan = variant.requires_selling_plan || false;

          if (!variant.available) {
            productState.soldOut = true;
          }

          if (variant.compare_at_price > variant.price) {
            productState.onSale = true;
          }

          if (variant.unit_price) {
            productState.showUnitPrice = true;
          }

          if (this.product && this.product.requires_selling_plan) {
            productState.requiresPlan = true;
          }

          if (plan && this.subPrices) {
            productState.hasPlan = true;
            if (plan.allocation.per_delivery_price !== plan.allocation.price) {
              productState.planPerDelivery = true;
            }
            if (variant.price > plan.allocation.price) {
              productState.planSale = true;
            }
          }

          if (!plan && requiresPlan) {
            productState.hasPlan = true;
            if (variant.selling_plan_allocations[0].per_delivery_price !== variant.selling_plan_allocations[0].price) {
              productState.planPerDelivery = true;
            }
            if (variant.price > variant.selling_plan_allocations[0].price) {
              productState.planSale = true;
            }
          }
        }
        return productState;
      }

      updateProductImage(evt) {
        const variant = evt.dataset.variant;

        if (!variant || !variant?.featured_media) {
          return;
        }

        // Update variant image, if one is set
        const newImg = this.container.querySelector(`${selectors$L.productImage}[${attributes$w.productImageId}="${variant.featured_media.id}"]`);
        const newImageParent = newImg?.closest(selectors$L.productSlide);

        if (newImageParent) {
          const newImagePos = parseInt([...newImageParent.parentElement.children].indexOf(newImageParent));
          const imgSlider = this.container.querySelector(selectors$L.productMediaSlider);
          const flkty = Flickity.data(imgSlider);

          // Activate image slide in mobile view
          if (flkty && flkty.isActive) {
            const variantSlide = imgSlider.querySelector(`[data-id="${variant.featured_media.id}"]`);

            if (variantSlide) {
              const slideIndex = parseInt([...variantSlide.parentNode.children].indexOf(variantSlide));
              flkty.select(slideIndex);
            }
            return;
          }

          if (this.tallLayout) {
            // We know its a tall layout, if it's sticky
            // scroll to the images
            // Scroll to/reorder image unless it's the first photo on load
            const newImgTop = newImg.getBoundingClientRect().top;

            if (newImagePos === 0 && newImgTop + window.scrollY > window.pageYOffset) return;

            // Scroll to variant image
            document.dispatchEvent(
              new CustomEvent('theme:tooltip:close', {
                bubbles: false,
                detail: {
                  hideTransition: false,
                },
              })
            );

            scrollTo(newImgTop);
          }
        }
      }

      observeSwatch(formState) {
        const swatch = this.swatchesContainer.querySelector(`[${attributes$w.swatchVariant}*="${formState.variant.id}"]`);
        this.swatchesContainer.closest(selectors$L.selectorWrapper).classList.remove(classes$C.selectorVisible);

        let observer = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              const notVisible = entry.intersectionRatio == 0;

              if (notVisible) {
                this.swatchesContainer.closest(selectors$L.selectorWrapper).classList.add(classes$C.selectorVisible);
              }
            });
          },
          {
            root: this.container,
            threshold: [0.95, 1],
          }
        );
        observer.observe(swatch);
      }

      /**
       * Scroll to the last submitted notification form
       */
      scrollToForm(section) {
        const headerHeight = document.querySelector(selectors$L.header)?.dataset.height;
        const isVisible = visibilityHelper.isElementPartiallyVisible(section) || visibilityHelper.isElementTotallyVisible(section);

        if (!isVisible) {
          setTimeout(() => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top - headerHeight;

            window.scrollTo({
              top: sectionTop,
              left: 0,
              behavior: 'smooth',
            });
          }, 400);
        }
      }

      onUnload() {
        if (this.productForm) this.productForm.destroy();
        if (this.hasPaymentButton) window.removeEventListener('theme:resize:width', this.onResizeCallback);
      }
    }

    const productFormSection = {
      onLoad() {
        sections$u[this.id] = new ProductAddForm(this.container);
      },
      onUnload() {
        sections$u[this.id].onUnload();
      },
    };

    const selectors$K = {
      form: 'form',
      popoutWrapper: '[data-popout]',
      popoutList: '[data-popout-list]',
      popoutToggle: '[data-popout-toggle]',
      popoutInput: '[data-popout-input]',
      popoutOptions: '[data-popout-option]',
      popoutText: '[data-popout-text]',
      ariaCurrent: '[aria-current]',
      productGridImage: '[data-product-image]',
      productGrid: '[data-product-grid-item]',
    };

    const classes$B = {
      listVisible: 'select-popout__list--visible',
      popoutAlternative: 'select-popout--alt',
      currentSuffix: '--current',
      visible: 'is-visible',
    };

    const attributes$v = {
      ariaCurrent: 'aria-current',
      ariaExpanded: 'aria-expanded',
      dataValue: 'data-value',
      popoutPrevent: 'data-popout-prevent',
      popoutQuantity: 'data-quantity-field',
      quickViewItem: 'data-quick-view-item',
    };

    let sections$t = {};

    class Popout {
      constructor(popout) {
        this.popout = popout;
        this.popoutList = this.popout.querySelector(selectors$K.popoutList);
        this.popoutToggle = this.popout.querySelector(selectors$K.popoutToggle);
        this.popoutText = this.popout.querySelector(selectors$K.popoutText);
        this.popoutInput = this.popout.querySelector(selectors$K.popoutInput);
        this.popoutOptions = this.popout.querySelectorAll(selectors$K.popoutOptions);
        this.popoutPrevent = this.popout.getAttribute(attributes$v.popoutPrevent) === 'true';
        this.popupToggleFocusoutEvent = (evt) => this.popupToggleFocusout(evt);
        this.popupListFocusoutEvent = (evt) => this.popupListFocusout(evt);
        this.popupToggleClickEvent = (evt) => this.popupToggleClick(evt);
        this.popoutKeyupEvent = (evt) => this.popoutKeyup(evt);
        this.popupOptionsClickEvent = (evt) => this.popupOptionsClick(evt);
        this._connectOptionsDispatchEvent = (evt) => this._connectOptionsDispatch(evt);
        this.bodyClick = this.bodyClick.bind(this);
        this.updatePopout = this.updatePopout.bind(this);

        this._connectOptions();
        this._connectToggle();
        this._onFocusOut();

        if (this.popoutInput && this.popoutInput.hasAttribute(attributes$v.popoutQuantity)) {
          document.addEventListener('theme:cart:update', this.updatePopout);
        }
      }

      unload() {
        if (this.popoutOptions.length) {
          this.popoutOptions.forEach((element) => {
            element.removeEventListener('theme:popout:click', this.popupOptionsClickEvent);
            element.removeEventListener('click', this._connectOptionsDispatchEvent);
          });
        }

        this.popoutToggle.removeEventListener('click', this.popupToggleClickEvent);
        this.popoutToggle.removeEventListener('focusout', this.popupToggleFocusoutEvent);
        this.popoutList.removeEventListener('focusout', this.popupListFocusoutEvent);
        this.popout.removeEventListener('keyup', this.popoutKeyupEvent);
        document.removeEventListener('theme:cart:update', this.updatePopout);
        document.body.removeEventListener('click', this.bodyClick);
      }

      popupToggleClick(evt) {
        const ariaExpanded = evt.currentTarget.getAttribute(attributes$v.ariaExpanded) === 'true';

        if (this.popoutList.closest(selectors$K.productGrid)) {
          const productGridItemImage = this.popoutList.closest(selectors$K.productGrid).querySelector(selectors$K.productGridImage);

          if (productGridItemImage) {
            productGridItemImage.classList.toggle(classes$B.visible, !ariaExpanded);
          }
        }

        evt.currentTarget.setAttribute(attributes$v.ariaExpanded, !ariaExpanded);
        this.popoutList.classList.toggle(classes$B.listVisible);
      }

      popupToggleFocusout(evt) {
        if (!evt.relatedTarget) {
          return;
        }

        const popoutLostFocus = this.popout.contains(evt.relatedTarget);
        const popoutFromQuickView = evt.relatedTarget.hasAttribute(attributes$v.quickViewItem);

        if (!popoutLostFocus && !popoutFromQuickView) {
          this._hideList();
        }
      }

      popupListFocusout(evt) {
        const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
        const isVisible = this.popoutList.classList.contains(classes$B.listVisible);

        if (isVisible && !childInFocus) {
          this._hideList();
        }
      }

      popupOptionsClick(evt) {
        const link = evt.target.closest(selectors$K.popoutOptions);
        if (link.attributes.href.value === '#') {
          evt.preventDefault();

          let attrValue = '';

          if (evt.currentTarget.getAttribute(attributes$v.dataValue)) {
            attrValue = evt.currentTarget.getAttribute(attributes$v.dataValue);
          }

          this.popoutInput.value = attrValue;

          if (this.popoutPrevent) {
            this.popoutInput.dispatchEvent(new Event('change'));

            if (!evt.detail.preventTrigger && this.popoutInput.hasAttribute(attributes$v.popoutQuantity)) {
              this.popoutInput.dispatchEvent(new Event('input'));
            }

            const currentElement = this.popoutList.querySelector(`[class*="${classes$B.currentSuffix}"]`);
            let targetClass = classes$B.currentSuffix;

            if (currentElement && currentElement.classList.length) {
              for (const currentElementClass of currentElement.classList) {
                if (currentElementClass.includes(classes$B.currentSuffix)) {
                  targetClass = currentElementClass;
                  break;
                }
              }
            }

            const listTargetElement = this.popoutList.querySelector(`.${targetClass}`);

            if (listTargetElement) {
              listTargetElement.classList.remove(`${targetClass}`);
              evt.currentTarget.parentElement.classList.add(`${targetClass}`);
            }

            const targetAttribute = this.popoutList.querySelector(selectors$K.ariaCurrent);

            if (targetAttribute) {
              targetAttribute.removeAttribute(attributes$v.ariaCurrent);
              evt.currentTarget.setAttribute(attributes$v.ariaCurrent, 'true');
            }

            if (attrValue !== '') {
              this.popoutText.textContent = attrValue;
            }

            this.popupToggleFocusout(evt);
            this.popupListFocusout(evt);
          } else {
            this._submitForm(attrValue);
          }
        }
      }

      updatePopout() {
        const targetElement = this.popoutList.querySelector(`[${attributes$v.dataValue}="${this.popoutInput.value}"]`);
        if (targetElement) {
          targetElement.dispatchEvent(
            new CustomEvent('theme:popout:click', {
              cancelable: true,
              bubbles: true,
              detail: {
                preventTrigger: true,
              },
            })
          );

          if (!targetElement.parentElement.nextSibling) {
            this.popout.classList.add(classes$B.popoutAlternative);
          }
        } else {
          this.popout.classList.add(classes$B.popoutAlternative);
        }
      }

      popoutKeyup(event) {
        if (event.code !== theme.keyboardKeys.ESCAPE) {
          return;
        }
        this._hideList();
        this.popoutToggle.focus();
      }

      bodyClick(event) {
        const isOption = this.popout.contains(event.target);
        const isVisible = this.popoutList.classList.contains(classes$B.listVisible);

        if (isVisible && !isOption) {
          this._hideList();
        }
      }

      _connectToggle() {
        this.popoutToggle.addEventListener('click', this.popupToggleClickEvent);
      }

      _connectOptions() {
        if (this.popoutOptions.length) {
          this.popoutOptions.forEach((element) => {
            element.addEventListener('theme:popout:click', this.popupOptionsClickEvent);
            element.addEventListener('click', this._connectOptionsDispatchEvent);
          });
        }
      }

      _connectOptionsDispatch(evt) {
        const event = new CustomEvent('theme:popout:click', {
          cancelable: true,
          bubbles: true,
          detail: {
            preventTrigger: false,
          },
        });

        if (!evt.target.dispatchEvent(event)) {
          evt.preventDefault();
        }
      }

      _onFocusOut() {
        this.popoutToggle.addEventListener('focusout', this.popupToggleFocusoutEvent);
        this.popoutList.addEventListener('focusout', this.popupListFocusoutEvent);
        this.popout.addEventListener('keyup', this.popoutKeyupEvent);

        document.body.addEventListener('click', this.bodyClick);
      }

      _submitForm() {
        const form = this.popout.closest(selectors$K.form);
        if (form) {
          form.submit();
        }
      }

      _hideList() {
        this.popoutList.classList.remove(classes$B.listVisible);
        this.popoutToggle.setAttribute(attributes$v.ariaExpanded, false);
      }
    }

    const popoutSection = {
      onLoad() {
        sections$t[this.id] = [];
        const wrappers = this.container.querySelectorAll(selectors$K.popoutWrapper);
        wrappers.forEach((wrapper) => {
          sections$t[this.id].push(new Popout(wrapper));
        });
      },
      onUnload() {
        sections$t[this.id].forEach((popout) => {
          if (typeof popout.unload === 'function') {
            popout.unload();
          }
        });
      },
    };

    const selectors$J = {
      addToCart: '[data-add-to-cart]',
      deferredMedia: '[data-deferred-media]',
      deferredMediaButton: '[data-deferred-media-button]',
      popupClose: '[data-popup-close]',
      popout: '[data-popout]',
      quickViewInner: '[data-quick-view-inner]',
      quickViewItemHolder: '[data-quick-view-item-holder]',
      product: '[data-product]',
      productForm: '[data-product-form]',
      productMediaSlider: '[data-product-single-media-slider]',
      productMediaWrapper: '[data-product-single-media-wrapper]',
      productModel: '[data-model]',
      productJSON: '[data-product-json]',
      quickViewFootInner: '[data-quick-view-foot-inner]',
      shopTheLookThumb: '[data-shop-the-look-thumb]',
      tooltip: '[data-tooltip]',
      drawerToggle: '[data-drawer-toggle]',
    };

    const classes$A = {
      hasMediaActive: 'has-media-active',
      isActive: 'is-active',
      isLoading: 'is-loading',
      mediaHidden: 'media--hidden',
      noOutline: 'no-outline',
      notificationPopupVisible: 'notification-popup-visible',
      popupQuickViewAnimateIn: 'popup-quick-view--animate-in',
      popupQuickViewAnimateOut: 'popup-quick-view--animate-out',
      popupQuickViewAnimated: 'popup-quick-view--animated',
      popupQuickView: 'popup-quick-view',
      jsQuickViewVisible: 'js-quick-view-visible',
      jsQuickViewFromCart: 'js-quick-view-from-cart',
      drawerOpen: 'js-drawer-open',
    };

    const attributes$u = {
      id: 'id',
      mediaId: 'data-media-id',
      sectionId: 'data-section-id',
      handle: 'data-handle',
      loaded: 'loaded',
      tabindex: 'tabindex',
      quickViewOnboarding: 'data-quick-view-onboarding',
      hotspot: 'data-hotspot',
      hotspotRef: 'data-hotspot-ref',
    };

    const ids = {
      addToCartFormId: 'AddToCartForm--',
      addToCartId: 'AddToCart--',
    };

    class LoadQuickview {
      constructor(popup, pswpElement) {
        this.popup = popup;
        this.pswpElement = pswpElement;
        this.quickViewFoot = this.pswpElement.querySelector(selectors$J.quickViewFootInner);
        this.quickViewInner = this.pswpElement.querySelector(selectors$J.quickViewInner);
        this.product = this.pswpElement.querySelectorAll(selectors$J.product);
        this.flkty = [];
        this.videos = [];
        this.productForms = [];
        this.deferredMedias = this.pswpElement.querySelectorAll(selectors$J.deferredMedia);
        this.buttonsShopTheLookThumb = this.pswpElement.querySelectorAll(selectors$J.shopTheLookThumb);
        this.quickViewItemHolders = this.pswpElement.querySelectorAll(selectors$J.quickViewItemHolder);
        this.popupCloseButtons = this.quickViewInner.querySelectorAll(selectors$J.popupClose);
        this.a11y = a11y;

        this.prevent3dModelSubmitEvent = (event) => this.prevent3dModelSubmit(event);
        this.closeOnAnimationEndEvent = (event) => this.closeOnAnimationEnd(event);
        this.closeOnEscapeEvent = (event) => this.closeOnEscape(event);

        this.outerCloseEvent = (event) => {
          if (!this.quickViewInner.contains(event.target)) {
            // Check if quickview has drawer
            const drawer = this.quickViewInner.nextElementSibling;
            if (drawer && drawer.contains(event.target)) return;

            this.closePopup(event);
          }
        };

        this.product.forEach((item, index) => {
          const isQuickViewOnboarding = item.hasAttribute(attributes$u.quickViewOnboarding);

          if (!isQuickViewOnboarding) {
            this.initItems(item, index);
          }
        });

        this.init();
        this.initTooltips();
        this.initPopouts();

        // Check swatches containers height
        this.swatchesContainer = new SwatchesContainer(this.pswpElement);
      }

      /*
       * Init tooltips for swatches
       */
      initTooltips() {
        this.tooltips = this.pswpElement.querySelectorAll(selectors$J.tooltip);
        this.tooltips.forEach((tooltip) => {
          new Tooltip(tooltip);
        });
      }

      /*
       * Init popouts
       */
      initPopouts() {
        this.popoutElements = this.pswpElement.querySelectorAll(selectors$J.popout);
        this.popouts = {};

        this.popoutElements?.forEach((popout, index) => {
          this.popouts[index] = new Popout(popout);
        });
      }

      handleDraggable(slider, draggableStatus) {
        if (!slider) return;

        slider.options.draggable = Boolean(draggableStatus);
        slider.updateDraggable();
      }

      initItems(item, index) {
        this.addFormSuffix(item);
        this.initProductSlider(item, index);
        this.initProductVideo(item);
        this.initProductModel(item);
        this.initShopifyXrLaunch(item);

        // Init swatches
        makeSwatches(item);

        // Init drawer
        const drawerToggles = this.pswpElement.querySelectorAll(selectors$J.drawerToggle);
        if (drawerToggles.length) {
          new Drawer(item);
        }

        // Wrap tables
        wrapElements(item);

        const productForm = new ProductAddForm(item.parentNode);
        this.productForms.push(productForm);

        if (Shopify.PaymentButton) {
          Shopify.PaymentButton.init();
        }

        item.classList.remove(classes$A.isLoading);
      }

      init() {
        // Prevent 3d models button redirecting to cart page when enabling/disabling the model a couple of times
        document.addEventListener('submit', this.prevent3dModelSubmitEvent);

        // Custom closing events
        this.popupCloseButtons.forEach((popupClose) => {
          popupClose.addEventListener('keyup', (event) => {
            if (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER || event.code === theme.keyboardKeys.SPACE) {
              this.closePopup(event);
            }
          });

          popupClose.addEventListener('click', (event) => {
            this.closePopup(event);
          });
        });

        this.pswpElement.addEventListener('click', this.outerCloseEvent);

        document.dispatchEvent(new CustomEvent('theme:popup:open', {bubbles: true}));

        this.popup.listen('preventDragEvent', (e, isDown, preventObj) => {
          preventObj.prevent = false;
        });

        this.pswpElement.addEventListener('mousedown', () => {
          this.popup.framework.unbind(window, 'pointermove pointerup pointercancel', this.popup);
        });

        // Opening event
        this.popup.listen('initialZoomInEnd', () => {
          document.body.classList.add(classes$A.jsQuickViewVisible);

          this.a11y.trapFocus({
            container: this.quickViewInner,
          });
        });

        this.pswpElement.addEventListener('animationend', this.closeOnAnimationEndEvent);

        this.popup.listen('destroy', () => {
          if (this.flkty.length > 0) {
            requestAnimationFrame(() => {
              this.flkty.forEach((slider) => slider.pausePlayer());
            });
          }
          document.body.classList.remove(classes$A.jsQuickViewVisible);
          document.removeEventListener('keyup', this.closeOnEscapeEvent);
          document.addEventListener('keyup', this.closeOnEscapeEvent);
          this.pswpElement.removeEventListener('click', this.outerCloseEvent);
          this.pswpElement.removeEventListener('animationend', this.closeOnAnimationEndEvent);
          document.removeEventListener('submit', this.prevent3dModelSubmitEvent);

          this.deferredMedias.forEach((deferredMedia) => {
            // Remove the 'loaded' attribute so the videos will can load properly when we reopening the quickview
            deferredMedia.removeAttribute(attributes$u.loaded);

            // Pause videos on closing the popup
            const media = deferredMedia.closest(selectors$J.productMediaWrapper);
            media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
            media.classList.add(classes$A.mediaHidden);
          });
        });

        document.addEventListener('keyup', this.closeOnEscapeEvent);
        document.addEventListener('theme:cart:added', () => {
          if (this.pswpElement.classList.contains(classes$A.popupQuickView)) {
            this.pswpElement.classList.add(classes$A.popupQuickViewAnimateOut);
          }
        });

        this.animateInQuickview();

        // 'Shop the look' thumbnails nav
        this.initShopTheLookListeners();
      }

      initShopTheLookListeners() {
        this.buttonsShopTheLookThumb?.forEach((button) => {
          button.addEventListener('click', (event) => {
            event.preventDefault();

            const thumb = event.target.matches(selectors$J.shopTheLookThumb) ? event.target : event.target.closest(selectors$J.shopTheLookThumb);
            const holder = this.pswpElement.querySelector(`[${attributes$u.hotspot}="${thumb.getAttribute(attributes$u.hotspotRef)}"]`);

            if (thumb.classList.contains(classes$A.isActive) || !holder) return;

            // Handle sliders
            if (this.flkty.length > 0) {
              requestAnimationFrame(() => {
                this.flkty.forEach((slider) => {
                  slider.resize();

                  const allMediaItems = this.quickViewInner.querySelectorAll(selectors$J.productMediaWrapper);

                  // Pause all media
                  if (allMediaItems.length) {
                    allMediaItems.forEach((media) => {
                      media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
                      media.classList.add(classes$A.mediaHidden);
                    });
                  }
                });
              });
            }

            // Active Quick View item class toggle
            holder.classList.add(classes$A.isActive);

            this.quickViewItemHolders.forEach((element) => {
              if (element !== holder) {
                element.classList.remove(classes$A.isActive);
              }
            });
          });
        });
      }

      // Prevents the 3d model buttons submitting the form
      prevent3dModelSubmit(event) {
        if (event.submitter.closest(selectors$J.deferredMedia) && event.submitter.closest(selectors$J.productForm)) {
          event.preventDefault();
        }
      }

      closeQuickviewOnMobile() {
        if (window.innerWidth < window.theme.sizes.large && document.body.classList.contains(classes$A.jsQuickViewVisible)) {
          this.popup.close();
        }
      }

      animateInQuickview() {
        this.pswpElement.classList.add(classes$A.popupQuickViewAnimateIn);

        this.quickViewFoot.addEventListener('animationend', (event) => {
          this.handleAnimatedState(event);
        });

        // Mobile
        this.pswpElement.addEventListener('animationend', (event) => {
          this.handleAnimatedState(event, true);
        });
      }

      handleAnimatedState(event, isMobileAnimation = false) {
        if (event.animationName == 'quickViewAnimateInUp') {
          if (isMobileAnimation && window.innerWidth >= window.theme.sizes.small) {
            // Checks mobile animation but it's not mobile screen size
            return;
          }

          this.pswpElement.classList.add(classes$A.popupQuickViewAnimated);
          this.pswpElement.classList.remove(classes$A.popupQuickViewAnimateIn);
          document.body.classList.remove(classes$A.jsQuickViewFromCart); // Clear the class that we are adding in quick-view-popup.js when the animation ends

          removeLoadingClassFromLoadedImages(this.pswpElement); // Remove loading class from images
        }
      }

      closePopup(event) {
        event?.preventDefault();
        const isNavDrawerOpen = document.body.classList.contains(classes$A.drawerOpen);

        if (isNavDrawerOpen) {
          document.dispatchEvent(new CustomEvent('theme:drawer:closing', {bubbles: true}));
        }

        this.pswpElement.classList.add(classes$A.popupQuickViewAnimateOut); // Adding this class triggers the 'animationend' event which calls closeOnAnimationEndEvent()

        this.swatchesContainer.onUnload();
      }

      closeOnAnimationEnd(event) {
        if (event.animationName == 'quickViewAnimateOutRight' || event.animationName == 'quickViewAnimateOutDown') {
          this.popup.template.classList.remove(classes$A.popupQuickViewAnimateOut, classes$A.popupQuickViewAnimated);
          this.popup.close();

          if (this.productForms.length > 0) {
            this.productForms.forEach((form) => form.onUnload());
          }
        }
      }

      closeOnEscape(event) {
        const isQuickViewVisible = document.body.classList.contains(classes$A.jsQuickViewVisible);
        const isNotificationVisible = document.body.classList.contains(classes$A.notificationPopupVisible);

        if (event.code === theme.keyboardKeys.ESCAPE && isQuickViewVisible && !isNotificationVisible) {
          this.closePopup(event);
        }
      }

      initProductSlider(item, index) {
        const slider = item.querySelector(selectors$J.productMediaSlider);
        const mediaItems = item.querySelectorAll(selectors$J.productMediaWrapper);

        if (mediaItems.length > 1) {
          const itemSlider = new Flickity(slider, {
            wrapAround: true,
            cellAlign: 'left',
            pageDots: false,
            prevNextButtons: true,
            adaptiveHeight: false,
            pauseAutoPlayOnHover: false,
            selectedAttraction: 0.2,
            friction: 1,
            autoPlay: false,
            on: {
              ready: () => {
                slider.setAttribute(attributes$u.tabindex, '-1');

                // This resize should happen when the show animation of the PhotoSwipe starts and after PhotoSwipe adds the custom 'popup--quickview' class with the mainClass option.
                // This class is changing the slider width with CSS and looks like this is happening after the slider loads which is breaking it. That's why we need to call the resize() method here.
                requestAnimationFrame(() => {
                  itemSlider.resize();
                });
              },
              settle: () => {
                const currentSlide = itemSlider.selectedElement;
                const mediaId = currentSlide.getAttribute(attributes$u.mediaId);

                currentSlide.setAttribute(attributes$u.tabindex, '0');

                itemSlider.cells.forEach((slide) => {
                  if (slide.element === currentSlide) {
                    return;
                  }

                  slide.element.setAttribute(attributes$u.tabindex, '-1');
                });

                this.switchMedia(item, mediaId);
              },
            },
          });

          this.flkty.push(itemSlider);

          // Toggle flickity draggable functionality based on media play/pause state
          if (mediaItems.length) {
            mediaItems.forEach((element) => {
              element.addEventListener('theme:media:play', () => {
                this.handleDraggable(this.flkty[index], false);
                element.closest(selectors$J.productMediaSlider).classList.add(classes$A.hasMediaActive);
              });

              element.addEventListener('theme:media:pause', () => {
                this.handleDraggable(this.flkty[index], true);
                element.closest(selectors$J.productMediaSlider).classList.remove(classes$A.hasMediaActive);
              });
            });
          }

          // iOS smooth scrolling fix
          flickitySmoothScrolling(slider);
        }
      }

      switchMedia(item, mediaId) {
        const allMediaItems = this.quickViewInner.querySelectorAll(selectors$J.productMediaWrapper);
        const selectedMedia = item.querySelector(`${selectors$J.productMediaWrapper}[${attributes$u.mediaId}="${mediaId}"]`);
        const isFocusEnabled = !document.body.classList.contains(classes$A.noOutline);

        // Pause other media
        if (allMediaItems.length) {
          allMediaItems.forEach((media) => {
            media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
            media.classList.add(classes$A.mediaHidden);
          });
        }

        if (isFocusEnabled) {
          selectedMedia.focus();
        }

        selectedMedia.closest(selectors$J.productMediaSlider).classList.remove(classes$A.hasMediaActive);
        selectedMedia.classList.remove(classes$A.mediaHidden);
        selectedMedia.dispatchEvent(new CustomEvent('theme:media:visible'), {bubbles: true});

        // If media is not loaded, trigger poster button click to load it
        const deferredMedia = selectedMedia.querySelector(selectors$J.deferredMedia);
        if (deferredMedia && deferredMedia.getAttribute(attributes$u.loaded) !== 'true') {
          selectedMedia.querySelector(selectors$J.deferredMediaButton).dispatchEvent(new Event('click'));
        }
      }

      initProductVideo(item) {
        const videos = new ProductVideo(item);

        this.videos.push(videos);
      }

      initProductModel(item) {
        const sectionId = item.getAttribute(attributes$u.sectionId);
        const modelItems = item.querySelectorAll(selectors$J.productModel);

        if (modelItems.length) {
          modelItems.forEach((element) => {
            theme.ProductModel.init(element, sectionId);
          });
        }
      }

      initShopifyXrLaunch(item) {
        document.addEventListener('shopify_xr_launch', () => {
          const currentMedia = item.querySelector(`${selectors$J.productModel}:not(.${classes$A.mediaHidden})`);
          currentMedia.dispatchEvent(new CustomEvent('xrLaunch'));
        });
      }

      addFormSuffix(item) {
        const sectionId = item.getAttribute(attributes$u.sectionId);
        const productObject = JSON.parse(item.querySelector(selectors$J.productJSON).innerHTML);

        const formSuffix = `${sectionId}-${productObject.handle}`;
        const productForm = item.querySelector(selectors$J.productForm);
        const addToCart = item.querySelector(selectors$J.addToCart);

        productForm.setAttribute(attributes$u.id, ids.addToCartFormId + formSuffix);
        addToCart.setAttribute(attributes$u.id, ids.addToCartId + formSuffix);
      }
    }

    const settings$5 = {
      unlockScrollDelay: 400,
    };

    const selectors$I = {
      popupContainer: '.pswp',
      popupCloseBtn: '.pswp__custom-close',
      popupIframe: 'iframe, video',
      popupCustomIframe: '.pswp__custom-iframe',
      popupThumbs: '.pswp__thumbs',
      popupButtons: '.pswp__button, .pswp__caption-close',
      product: '[data-product]',
      productJSON: '[data-product-json]',
    };

    const classes$z = {
      current: 'is-current',
      customLoader: 'pswp--custom-loader',
      customOpen: 'pswp--custom-opening',
      loader: 'pswp__loader',
      opened: 'pswp--open',
      popupCloseButton: 'pswp__button--close',
      notificationPopup: 'pswp--notification',
      quickviewPopup: 'popup-quick-view',
      isCartDrawerOpen: 'js-drawer-open-cart',
      quickViewAnimateOut: 'popup-quick-view--animate-out',
    };

    const attributes$t = {
      dataOptionClasses: 'data-pswp-option-classes',
      dataVideoType: 'data-video-type',
    };

    const loaderHTML = `<div class="${classes$z.loader}"><div class="loader loader--image"><div class="loader__image"></div></div></div>`;

    class LoadPhotoswipe {
      constructor(items, options = '', templateIndex = 0, triggerButton = null) {
        this.items = items;
        this.triggerBtn = triggerButton;
        this.pswpElements = document.querySelectorAll(selectors$I.popupContainer);
        this.pswpElement = this.pswpElements[templateIndex];
        this.popup = null;
        this.popupThumbs = null;
        this.popupThumbsContainer = this.pswpElement.querySelector(selectors$I.popupThumbs);
        this.closeBtn = this.pswpElement.querySelector(selectors$I.popupCloseBtn);
        const defaultOptions = {
          history: false,
          focus: false,
          mainClass: '',
        };
        this.options = options !== '' ? options : defaultOptions;
        this.onCloseCallback = () => this.onClose();
        this.dispatchPopupInitEventCallback = () => this.dispatchPopupInitEvent();
        this.setCurrentThumbCallback = () => this.setCurrentThumb();
        this.a11y = a11y;

        this.init();
      }

      init() {
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

        this.pswpElement.classList.add(classes$z.customOpen);

        this.initLoader();

        loadScript({url: window.theme.assets.photoswipe})
          .then(() => this.loadPopup())
          .catch((e) => console.error(e));
      }

      initLoader() {
        if (this.pswpElement.classList.contains(classes$z.customLoader) && this.options !== '' && this.options.mainClass) {
          this.pswpElement.setAttribute(attributes$t.dataOptionClasses, this.options.mainClass);
          let loaderElem = document.createElement('div');
          loaderElem.innerHTML = loaderHTML;
          loaderElem = loaderElem.firstChild;
          this.pswpElement.appendChild(loaderElem);
        } else {
          this.pswpElement.setAttribute(attributes$t.dataOptionClasses, '');
        }
      }

      loadPopup() {
        const PhotoSwipe = window.themePhotoswipe.PhotoSwipe.default;
        const PhotoSwipeUI = window.themePhotoswipe.PhotoSwipeUI.default;

        if (this.pswpElement.classList.contains(classes$z.customLoader)) {
          this.pswpElement.classList.remove(classes$z.customLoader);
        }

        this.pswpElement.classList.remove(classes$z.customOpen);

        this.popup = new PhotoSwipe(this.pswpElement, PhotoSwipeUI, this.items, this.options);

        this.popup.listen('afterInit', this.dispatchPopupInitEventCallback);
        this.popup.listen('imageLoadComplete', this.setCurrentThumbCallback);
        this.popup.listen('beforeChange', this.setCurrentThumbCallback);
        this.popup.listen('close', this.onCloseCallback);

        this.popup.init();

        this.initPopupCallback();
      }

      initPopupCallback() {
        if (this.isVideo) {
          this.hideUnusedButtons();
        }

        this.initVideo();
        this.thumbsActions();

        this.a11y.trapFocus({
          container: this.pswpElement,
        });

        if (this.pswpElement.classList.contains(classes$z.quickviewPopup)) {
          new LoadQuickview(this.popup, this.pswpElement);
        }

        if (this.pswpElement.classList.contains(classes$z.notificationPopup)) {
          new LoadNotification(this.popup, this.pswpElement);
        }

        this.closePopup = () => {
          if (this.pswpElement.classList.contains(classes$z.quickviewPopup)) {
            this.pswpElement.classList.add(classes$z.quickViewAnimateOut); // Close the Quickview popup accordingly
          } else {
            this.popup.close();
          }
        };

        if (this.closeBtn) {
          this.closeBtn.addEventListener('click', this.closePopup);
        }

        // Close Quick view popup when product added to cart
        document.addEventListener('theme:cart:added', this.closePopup);
      }

      dispatchPopupInitEvent() {
        if (this.triggerBtn) {
          this.triggerBtn.dispatchEvent(new CustomEvent('theme:popup:init', {bubbles: true}));
        }
      }

      initVideo() {
        const videoContainer = this.pswpElement.querySelector(selectors$I.popupCustomIframe);
        if (videoContainer) {
          const videoType = videoContainer.getAttribute(attributes$t.dataVideoType);
          this.isVideo = true;

          if (videoType == 'youtube') {
            new LoadVideoYT(videoContainer.parentElement);
          } else if (videoType == 'vimeo') {
            new LoadVideoVimeo(videoContainer.parentElement);
          }
        }
      }

      thumbsActions() {
        if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
          this.popupThumbsContainer.addEventListener('wheel', (e) => this.stopDisabledScroll(e));
          this.popupThumbsContainer.addEventListener('mousewheel', (e) => this.stopDisabledScroll(e));
          this.popupThumbsContainer.addEventListener('DOMMouseScroll', (e) => this.stopDisabledScroll(e));

          this.popupThumbs = this.pswpElement.querySelectorAll(`${selectors$I.popupThumbs} > *`);
          this.popupThumbs.forEach((element, i) => {
            element.addEventListener('click', (e) => {
              e.preventDefault();
              element.parentElement.querySelector(`.${classes$z.current}`).classList.remove(classes$z.current);
              element.classList.add(classes$z.current);
              this.popup.goTo(i);
            });
          });
        }
      }

      hideUnusedButtons() {
        const buttons = this.pswpElement.querySelectorAll(selectors$I.popupButtons);
        buttons.forEach((element) => {
          if (!element.classList.contains(classes$z.popupCloseButton)) {
            element.style.display = 'none';
          }
        });
      }

      stopDisabledScroll(e) {
        e.stopPropagation();
      }

      onClose() {
        const popupIframe = this.pswpElement.querySelector(selectors$I.popupIframe);
        if (popupIframe) {
          popupIframe.parentNode.removeChild(popupIframe);
        }

        if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
          while (this.popupThumbsContainer.firstChild) {
            this.popupThumbsContainer.removeChild(this.popupThumbsContainer.firstChild);
          }
        }

        this.pswpElement.setAttribute(attributes$t.dataOptionClasses, '');
        const loaderElem = this.pswpElement.querySelector(`.${classes$z.loader}`);
        if (loaderElem) {
          this.pswpElement.removeChild(loaderElem);
        }

        if (!document.body.classList.contains(classes$z.isCartDrawerOpen)) {
          this.a11y.removeTrapFocus();
        }

        document.removeEventListener('theme:cart:added', this.closePopup);

        // Unlock scroll if only cart drawer is closed and there are no more popups opened
        setTimeout(() => {
          const recentlyOpenedPopups = this.recentlyOpenedPopupsCount();
          const isCartDrawerOpen = document.body.classList.contains(classes$z.isCartDrawerOpen);

          if (recentlyOpenedPopups === 0 && !isCartDrawerOpen) {
            document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
          }
        }, settings$5.unlockScrollDelay);
      }

      recentlyOpenedPopupsCount() {
        let count = 0;

        this.pswpElements.forEach((popup) => {
          const isOpened = popup.classList.contains(classes$z.opened);

          if (isOpened) {
            count += 1;
          }
        });

        return count;
      }

      setCurrentThumb() {
        const hasThumbnails = this.popupThumbsContainer && this.popupThumbsContainer.firstChild;

        if (hasThumbnails) return;

        const lastCurrentThumb = this.pswpElement.querySelector(`${selectors$I.popupThumbs} > .${classes$z.current}`);
        if (lastCurrentThumb) {
          lastCurrentThumb.classList.remove(classes$z.current);
        }

        if (!this.popupThumbs) {
          return;
        }
        const currentThumb = this.popupThumbs[this.popup.getCurrentIndex()];
        currentThumb.classList.add(classes$z.current);
        this.scrollThumbs(currentThumb);
      }

      scrollThumbs(currentThumb) {
        const thumbsContainerLeft = this.popupThumbsContainer.scrollLeft;
        const thumbsContainerWidth = this.popupThumbsContainer.offsetWidth;
        const thumbsContainerPos = thumbsContainerLeft + thumbsContainerWidth;
        const currentThumbLeft = currentThumb.offsetLeft;
        const currentThumbWidth = currentThumb.offsetWidth;
        const currentThumbPos = currentThumbLeft + currentThumbWidth;

        if (thumbsContainerPos <= currentThumbPos || thumbsContainerPos > currentThumbLeft) {
          const currentThumbMarginLeft = parseInt(window.getComputedStyle(currentThumb).marginLeft);
          this.popupThumbsContainer.scrollTo({
            top: 0,
            left: currentThumbLeft - currentThumbMarginLeft,
            behavior: 'smooth',
          });
        }
      }
    }

    const settings$4 = {
      templateIndex: 0,
    };

    const selectors$H = {
      buttonQuickView: '[data-button-quick-view]',
      quickViewItemsTemplate: '[data-quick-view-items-template]',
      cartDrawer: '[data-cart-drawer]',
      shopTheLookQuickViewButton: '[data-shop-the-look-quick-view-button]',
      shopTheLookThumb: '[data-shop-the-look-thumb]',
      quickViewItemHolder: '[data-quick-view-item-holder]',
    };

    const classes$y = {
      loading: 'is-loading',
      isActive: 'is-active',
      quickViewFromCart: 'js-quick-view-from-cart',
      mainClass: 'popup-quick-view pswp--not-close-btn',
      shopTheLookPopupClass: 'popup-quick-view popup-quick-view--shop-the-look pswp--not-close-btn',
    };

    const attributes$s = {
      loaded: 'data-loaded',
      handle: 'data-handle',
      variantId: 'data-variant-id',
      shopTheLookQuickView: 'data-shop-the-look-quick-view',
      hotspot: 'data-hotspot',
      quickButtonInit: 'data-initialized',
    };

    const options = {
      history: false,
      focus: false,
      mainClass: classes$y.mainClass,
      showHideOpacity: false, // we need that off to control the animation ourselves
      closeOnVerticalDrag: false,
      closeOnScroll: false,
      modal: false,
      escKey: false,
    };

    class QuickViewPopup {
      constructor(container) {
        this.container = container;
        this.a11y = a11y;
        this.buttonsQuickView = this.container.querySelectorAll(selectors$H.buttonQuickView);
        this.buttonsShopTheLookQuickView = this.container.querySelectorAll(selectors$H.shopTheLookQuickViewButton);
        this.popupInitCallback = (trigger) => this.popupInit(trigger);

        this.buttonsQuickView?.forEach((button) => {
          if (!button.hasAttribute(attributes$s.quickButtonInit)) {
            button.addEventListener('click', (event) => this.initPhotoswipe(event));
            button.addEventListener('theme:popup:init', () => {
              button.classList.remove(classes$y.loading);

              if (button.hasAttribute(attributes$s.shopTheLookQuickView)) {
                this.popupInitCallback(button);
              }
            });
            button.setAttribute(attributes$s.quickButtonInit, '');
          }
        });

        this.buttonsShopTheLookQuickView?.forEach((button) => {
          button.addEventListener('click', () => {
            this.buttonsQuickView[0]?.dispatchEvent(new Event('click'));
          });
        });
      }

      popupInit(trigger) {
        // Handle active Quick View item
        const holder = this.loadPhotoswipe.pswpElement.querySelector(`[${attributes$s.hotspot}="${trigger.getAttribute(attributes$s.hotspot)}"]`);
        const quickViewItemHolders = this.loadPhotoswipe.pswpElement.querySelectorAll(selectors$H.quickViewItemHolder);

        holder.classList.add(classes$y.isActive);

        quickViewItemHolders.forEach((element) => {
          if (element !== holder) {
            element.classList.remove(classes$y.isActive);
          }
        });

        // Handle pointer events
        this.toggleQuickViewButtonsLoadingClasses(true);
        this.toggleQuickViewThumbsLoadingClasses(true);

        const onAnimationInEnd = (event) => {
          // Animation on open
          if (event.animationName === 'quickViewAnimateInUp') {
            requestAnimationFrame(() => {
              this.toggleQuickViewThumbsLoadingClasses(false);
            });
          }

          // Animation on close
          if (event.animationName === 'quickViewAnimateOutDown') {
            this.loadPhotoswipe.pswpElement.removeEventListener('animationend', onAnimationInEnd);
          }
        };

        this.loadPhotoswipe.pswpElement.addEventListener('animationend', onAnimationInEnd);

        this.loadPhotoswipe?.popup?.listen('destroy', () => {
          this.toggleQuickViewButtonsLoadingClasses(false);
          this.toggleQuickViewThumbsLoadingClasses(false);
        });
      }

      toggleQuickViewButtonsLoadingClasses(isLoading = true) {
        if (isLoading) {
          this.buttonsQuickView?.forEach((element) => {
            element.classList.add(classes$y.loading);
          });
          return;
        }

        this.buttonsQuickView?.forEach((element) => {
          element.classList.remove(classes$y.loading);
        });
      }

      toggleQuickViewThumbsLoadingClasses(isLoading = true) {
        this.buttonsShopTheLookThumb = this.loadPhotoswipe?.pswpElement.querySelectorAll(selectors$H.shopTheLookThumb);

        if (isLoading) {
          this.buttonsShopTheLookThumb?.forEach((element) => {
            element.classList.add(classes$y.loading);
          });
          return;
        }

        this.buttonsShopTheLookThumb?.forEach((element) => {
          element.classList.remove(classes$y.loading);
        });
      }

      initPhotoswipe(event) {
        event.preventDefault();

        const button = event.target.matches(selectors$H.buttonQuickView) ? event.target : event.target.closest(selectors$H.buttonQuickView);
        const isMobile = window.innerWidth < theme.sizes.small;
        let quickViewVariant = '';
        let isShopTheLookPopupTrigger = false;

        if (button.hasAttribute(attributes$s.shopTheLookQuickView)) {
          if (!isMobile) return;
          isShopTheLookPopupTrigger = true;
        }

        options.mainClass = classes$y.mainClass;
        button.classList.add(classes$y.loading);

        // Add class js-quick-view-from-cart to change the default Quick view animation
        if (button.closest(selectors$H.cartDrawer)) {
          document.body.classList.add(classes$y.quickViewFromCart);
        }

        // Set the trigger element before calling trapFocus
        this.a11y.state.trigger = button;

        if (button.hasAttribute(attributes$s.variantId)) {
          quickViewVariant = `&variant=${button.getAttribute(attributes$s.variantId)}`;
        }

        const productUrl = `${theme.routes.root}products/${button.getAttribute(attributes$s.handle)}?section_id=api-quickview${quickViewVariant}`;

        if (isShopTheLookPopupTrigger) {
          options.mainClass = classes$y.shopTheLookPopupClass;

          this.buttonsQuickView.forEach((element) => {
            element.classList.add(classes$y.loading);
          });

          const XMLS = new XMLSerializer();
          const quickViewItemsTemplate = this.container.querySelector(selectors$H.quickViewItemsTemplate).content.firstElementChild.cloneNode(true);

          const itemsData = XMLS.serializeToString(quickViewItemsTemplate);

          this.loadPhotoswipeWithTemplate(itemsData, button);
        } else {
          this.loadPhotoswipeFromFetch(productUrl, button);
        }
      }

      loadPhotoswipeWithTemplate(data, button) {
        const items = [
          {
            html: data,
          },
        ];

        this.loadPhotoswipe = new LoadPhotoswipe(items, options, settings$4.templateIndex, button);
      }

      loadPhotoswipeFromFetch(url, button) {
        fetch(url)
          .then((response) => {
            return response.text();
          })
          .then((data) => {
            const items = [
              {
                html: data,
              },
            ];

            this.loadPhotoswipe = new LoadPhotoswipe(items, options, settings$4.templateIndex, button);
          })
          .catch((error) => console.log('error: ', error));
      }
    }

    const settings$3 = {
      cartDrawerEnabled: window.theme.settings.cartType === 'drawer',
      timers: {
        addProductTimeout: 1000,
      },
      animations: {
        data: 'data-aos',
        method: 'fade-up',
      },
    };

    const selectors$G = {
      outerSection: '[data-section-id]',
      aos: '[data-aos]',
      additionalCheckoutButtons: '[data-additional-checkout-button]',
      apiContent: '[data-api-content]',
      apiLineItems: '[data-api-line-items]',
      apiUpsellItems: '[data-api-upsell-items]',
      apiCartPrice: '[data-api-cart-price]',
      buttonAddToCart: '[data-add-to-cart]',
      upsellButtonByHandle: '[data-handle]',
      cartCloseError: '[data-cart-error-close]',
      cartDrawer: '[data-cart-drawer]',
      cartDrawerTemplate: '[data-cart-drawer-template]',
      cartDrawerToggle: '[data-cart-drawer-toggle]',
      cartDrawerBody: '[data-cart-drawer-body]',
      cartErrors: '[data-cart-errors]',
      cartForm: '[data-cart-form]',
      cartTermsCheckbox: '[data-cart-acceptance-checkbox]',
      cartCheckoutButtonWrapper: '[data-cart-checkout-buttons]',
      cartCheckoutButton: '[data-cart-checkout-button]',
      cartItemRemove: '[data-item-remove]',
      cartItemsQty: '[data-cart-items-qty]',
      cartTotal: '[data-cart-total]',
      cartTotalPrice: '[data-cart-total-price]',
      cartMessage: '[data-cart-message]',
      cartMessageDefault: '[data-message-default]',
      cartPage: '[data-cart-page]',
      cartProgress: '[data-cart-message-progress]',
      emptyMessage: '[data-empty-message]',
      buttonHolder: '[data-foot-holder]',
      item: '[data-cart-item]',
      itemsHolder: '[data-items-holder]',
      itemsWrapper: '[data-items-wrapper]',
      formCloseError: '[data-close-error]',
      formErrorsContainer: '[data-cart-errors-container]',
      upsellHolder: '[data-upsell-holder]',
      errorMessage: '[data-error-message]',
      termsErrorMessage: '[data-terms-error-message]',
      pairProductsHolder: '[data-pair-products-holder]',
      pairProducts: '[data-pair-products]',
      priceHolder: '[data-cart-price-holder]',
      leftToSpend: '[data-left-to-spend]',
      quickBuyForm: '[data-quickbuy-form]',
      qtyInput: '[data-quantity-field]',
      productMediaContainer: '[data-product-media-container]',
      formWrapper: '[data-form-wrapper]',
      productForm: '[data-product-form]',
      popupQuickView: '.popup-quick-view',
      popupClose: '[data-popup-close]',
      error: '[data-error]',
      quickViewOnboarding: '[data-quick-view-onboarding]',
      flickityEnabled: '.flickity-enabled',
    };

    const classes$x = {
      hidden: 'hidden',
      added: 'is-added',
      isHidden: 'is-hidden',
      cartDrawerOpen: 'js-drawer-open-cart',
      open: 'is-open',
      visible: 'is-visible',
      expanded: 'is-expanded',
      loading: 'is-loading',
      disabled: 'is-disabled',
      success: 'is-success',
      error: 'has-error',
      cartItems: 'cart__toggle--has-items',
      variantSoldOut: 'variant--soldout',
      removed: 'is-removed',
      aosAnimate: 'aos-animate',
      updated: 'is-updated',
      noOutline: 'no-outline',
      productGridImageError: 'product-grid-item__image--error',
      contentVisibilityHidden: 'cv-h',
    };

    const attributes$r = {
      shippingMessageLimit: 'data-limit',
      cartMessageValue: 'data-cart-message',
      cartTotal: 'data-cart-total',
      ariaExpanded: 'aria-expanded',
      disabled: 'disabled',
      value: 'value',
      dataId: 'data-id',
      item: 'data-item',
      itemIndex: 'data-item-index',
      itemTitle: 'data-item-title',
      atcTrigger: 'data-atc-trigger',
      upsellButton: 'data-upsell-btn',
      notificationPopup: 'data-notification-popup',
      sectionId: 'data-section-id',
      recipientError: 'data-recipient-errors',
    };

    let sections$s = {};

    class CartDrawer {
      constructor() {
        if (window.location.pathname === '/password') {
          return;
        }

        this.init();
      }

      init() {
        // DOM Elements
        this.cartToggleButtons = document.querySelectorAll(selectors$G.cartDrawerToggle);
        this.cartPage = document.querySelector(selectors$G.cartPage);
        this.cartDrawer = document.querySelector(selectors$G.cartDrawer);
        this.cart = this.cartDrawer || this.cartPage;

        this.cartCount = this.getCartItemCount();

        this.assignArguments();

        this.recipientErrors = this.form?.getAttribute(attributes$r.recipientError) === 'true';
        this.flktyUpsell = null;
        this.form = null;
        this.collapsible = null;
        this.a11y = a11y;

        this.build = this.build.bind(this);

        // AJAX request
        this.addToCart = this.addToCart.bind(this);
        this.updateCart = this.updateCart.bind(this);

        // Cart events
        this.openCartDrawer = this.openCartDrawer.bind(this);
        this.closeCartDrawer = this.closeCartDrawer.bind(this);
        this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
        this.formSubmitHandler = throttle(this.formSubmitHandler.bind(this), 50);
        this.closeCartError = () => {
          this.cartErrorHolder.classList.remove(classes$x.expanded);
        };
        this.cartDrawerCloseEvent = null;

        // Checking
        this.hasItemsInCart = this.hasItemsInCart.bind(this);
        this.isCartPage = Boolean(this.cart && this.cartDrawer === null);
        this.showAnimations = Boolean(document.body.dataset.animations === 'true');

        // Set classes
        this.toggleClassesOnContainers = this.toggleClassesOnContainers.bind(this);

        // Flags
        this.totalItems = 0;
        this.isCartDrawerOpen = false;
        this.isCartDrawerLoaded = false;
        this.cartDiscounts = 0;
        this.cartDrawerEnabled = settings$3.cartDrawerEnabled;
        this.cartAnimationTimer = 0;
        this.cartUpdateFailed = false;

        // Cart Events
        this.cartEvents();
        this.cartAddEvent();
        this.cartDrawerToggleEvents();

        // Init quantity for fields
        this.initQuantity();

        // Init collapsible function for the cart accordions
        if (this.buttonHolder) {
          this.collapsible = new Collapsible(this.buttonHolder);
        }

        if (this.isCartPage) {
          this.renderPairProducts();
        }

        document.addEventListener('theme:popup:open', this.closeCartDrawer);
      }

      /**
       * Assign cart constructor arguments on page load or after cart drawer is loaded
       *
       * @return  {Void}
       */
      assignArguments() {
        this.cartDrawerBody = document.querySelector(selectors$G.cartDrawerBody);
        this.emptyMessage = document.querySelector(selectors$G.emptyMessage);
        this.buttonHolder = document.querySelector(selectors$G.buttonHolder);
        this.itemsHolder = document.querySelector(selectors$G.itemsHolder);
        this.cartItemsQty = document.querySelector(selectors$G.cartItemsQty);
        this.itemsWrapper = document.querySelector(selectors$G.itemsWrapper);
        this.items = document.querySelectorAll(selectors$G.item);
        this.cartTotal = document.querySelector(selectors$G.cartTotal);
        this.cartTotalPrice = document.querySelector(selectors$G.cartTotalPrice);
        this.cartMessage = document.querySelectorAll(selectors$G.cartMessage);
        this.cartOriginalTotal = document.querySelector(selectors$G.cartOriginalTotal);
        this.cartErrorHolder = document.querySelector(selectors$G.cartErrors);
        this.cartCloseErrorMessage = document.querySelector(selectors$G.cartCloseError);
        this.pairProductsHolder = document.querySelector(selectors$G.pairProductsHolder);
        this.pairProducts = document.querySelector(selectors$G.pairProducts);
        this.priceHolder = document.querySelector(selectors$G.priceHolder);
        this.upsellHolders = document.querySelectorAll(selectors$G.upsellHolder);
        this.cartTermsCheckbox = document.querySelector(selectors$G.cartTermsCheckbox);
        this.cartCheckoutButtonWrapper = document.querySelector(selectors$G.cartCheckoutButtonWrapper);
        this.cartCheckoutButton = document.querySelector(selectors$G.cartCheckoutButton);
        this.cartForm = document.querySelector(selectors$G.cartForm);
        this.cartItemCount = 0;
        this.subtotal = window.theme.subtotal;
        this.button = null;

        if (this.cartMessage.length > 0) {
          this.cartFreeLimitShipping = Number(this.cartMessage[0].getAttribute(attributes$r.shippingMessageLimit)) * 100 * window.Shopify.currency.rate;
        }

        this.updateProgress();
      }

      /**
       * Init quantity field functionality
       *
       * @return  {Void}
       */

      initQuantity() {
        this.items = document.querySelectorAll(selectors$G.item);

        this.items?.forEach((item) => {
          const quantity = new QuantityCounter(item, true);

          quantity.init();
          this.cartUpdateEvent(item);
        });
      }

      /**
       * Custom event who change the cart
       *
       * @return  {Void}
       */

      cartUpdateEvent(item) {
        item.addEventListener('theme:cart:update', (event) => {
          this.updateCart(
            {
              id: event.detail.id,
              quantity: event.detail.quantity,
            },
            item
          );
        });
      }

      /**
       * Cart events
       *
       * @return  {Void}
       */

      cartEvents() {
        const cartItemRemove = document.querySelectorAll(selectors$G.cartItemRemove);
        this.totalItems = cartItemRemove.length;

        cartItemRemove?.forEach((button) => {
          const item = button.closest(selectors$G.item);
          button.addEventListener('click', (event) => {
            event.preventDefault();

            if (button.classList.contains(classes$x.disabled)) return;

            this.updateCart(
              {
                id: item.getAttribute(attributes$r.dataId),
                quantity: 0,
              },
              item
            );
          });
        });

        if (this.cartCloseErrorMessage) {
          this.cartCloseErrorMessage.removeEventListener('click', this.closeCartError);
          this.cartCloseErrorMessage.addEventListener('click', this.closeCartError);
        }

        if (this.cartTermsCheckbox) {
          this.cartTermsCheckbox.removeEventListener('change', this.formSubmitHandler);
          this.cartCheckoutButtonWrapper.removeEventListener('click', this.formSubmitHandler);
          this.cartForm.removeEventListener('submit', this.formSubmitHandler);

          this.cartTermsCheckbox.addEventListener('change', this.formSubmitHandler);
          this.cartCheckoutButtonWrapper.addEventListener('click', this.formSubmitHandler);
          this.cartForm.addEventListener('submit', this.formSubmitHandler);
        }
      }

      /**
       * Cart event add product to cart
       *
       * @return  {Void}
       */

      cartAddEvent() {
        document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isButtonATC = clickedElement?.matches(selectors$G.buttonAddToCart);
          const getButtonATC = clickedElement?.closest(selectors$G.buttonAddToCart);

          if (isButtonATC || getButtonATC) {
            event.preventDefault();

            this.button = isButtonATC ? clickedElement : getButtonATC;
            this.form = clickedElement.closest('form');
            this.recipientErrors = this.form?.getAttribute(attributes$r.recipientError) === 'true';
            this.formWrapper = this.button.closest(selectors$G.formWrapper);
            const isVariantSoldOut = this.formWrapper?.classList.contains(classes$x.variantSoldOut);
            const isButtonDisabled = this.button.hasAttribute(attributes$r.disabled);
            const isQuickViewOnboarding = this.button.closest(selectors$G.quickViewOnboarding);
            const hasDataAtcTrigger = this.button.hasAttribute(attributes$r.atcTrigger);
            const hasNotificationPopup = this.button.hasAttribute(attributes$r.notificationPopup);
            const hasFileInput = this.form?.querySelector('[type="file"]');

            if (isButtonDisabled || hasFileInput || isQuickViewOnboarding) return;

            // Notification popup
            if (isVariantSoldOut && hasNotificationPopup) {
              new NotificationPopup(this.button);
              return;
            }

            if (hasDataAtcTrigger) {
              this.a11y.state.trigger = this.button;
            }

            const formData = new FormData(this.form);
            this.addToCart(formData);

            // Hook for cart/add.js event
            document.dispatchEvent(
              new CustomEvent('theme:cart:add', {
                bubbles: true,
                detail: {
                  selector: clickedElement,
                },
              })
            );
          }
        });
      }

      /**
       * Get response from the cart
       *
       * @return  {Void}
       */

      getCart() {
        // Render cart drawer if it exists but it's not loaded yet
        if (this.cartDrawer && !this.isCartDrawerLoaded) {
          const alwaysOpen = false;
          this.renderCartDrawer(alwaysOpen);
        }

        fetch(theme.routes.cart_url + '?section_id=api-cart-items')
          .then(this.handleErrors)
          .then((response) => response.text())
          .then((response) => {
            const element = document.createElement('div');
            element.innerHTML = response;

            const cleanResponse = element.querySelector(selectors$G.apiContent);
            this.build(cleanResponse);
          })
          .catch((error) => console.log(error));
      }

      /**
       * Add item(s) to the cart and show the added item(s)
       *
       * @param   {String}  data
       * @param   {DOM Element}  button
       *
       * @return  {Void}
       */

      addToCart(data) {
        if (this.cartDrawerEnabled && this.button) {
          this.button.classList.add(classes$x.loading);
          this.button.setAttribute(attributes$r.disabled, true);
        }

        fetch(theme.routes.cart_add_url, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/javascript',
          },
          body: data,
        })
          .then((response) => response.json())
          .then((response) => {
            this.button.disabled = true;
            this.addLoadingClass();

            if (response.status) {
              this.addToCartError(response);
              this.removeLoadingClass();
              return;
            }

            this.hideAddToCartErrorMessage();

            if (this.cartDrawerEnabled) {
              this.getCart();
            } else {
              window.location = theme.routes.cart_url;
            }

          })
          .catch((error) => console.log(error));
      }

      /**
       * Update cart
       *
       * @param   {Object}  updateData
       *
       * @return  {Void}
       */

      updateCart(updateData = {}, currentItem = null) {
        let updatedQuantity = updateData.quantity;
        if (currentItem !== null) {
          if (updatedQuantity) {
            currentItem.classList.add(classes$x.loading);
          } else {
            currentItem.classList.add(classes$x.removed);
          }
        }
        this.disableCartButtons();
        this.addLoadingClass();

        const newItem = this.cart.querySelector(`[${attributes$r.item}="${updateData.id}"]`) || currentItem;
        const lineIndex = newItem?.hasAttribute(attributes$r.itemIndex) ? parseInt(newItem.getAttribute(attributes$r.itemIndex)) : 0;
        const itemTitle = newItem?.hasAttribute(attributes$r.itemTitle) ? newItem.getAttribute(attributes$r.itemTitle) : null;

        if (lineIndex === 0) return;

        const data = {
          line: lineIndex,
          quantity: updatedQuantity,
        };

        fetch(theme.routes.cart_change_url, {
          method: 'post',
          headers: {'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify(data),
        })
          .then((response) => {
            if (response.status === 400) {
              const error = new Error(response.status);
              this.cartDrawerEnabled ? this.getCart() : (window.location = theme.routes.cart_url);
              throw error;
            }

            return response.text();
          })
          .then((state) => {
            const parsedState = JSON.parse(state);

            if (parsedState.errors) {
              this.cartUpdateFailed = true;
              this.updateErrorText(itemTitle);
              this.toggleErrorMessage();
              this.resetLineItem(currentItem);
              this.enableCartButtons();
              this.removeLoadingClass();

              return;
            }

            this.getCart();

          })
          .catch((error) => {
            console.log(error);
            this.enableCartButtons();
            this.removeLoadingClass();
          });
      }

      /**
       * Reset line item initial state
       *
       * @return  {Void}
       */
      resetLineItem(item) {
        const qtyInput = item.querySelector(selectors$G.qtyInput);
        const qty = qtyInput.getAttribute('value');
        qtyInput.value = qty;
        item.classList.remove(classes$x.loading);
      }

      /**
       * Disable cart buttons and inputs
       *
       * @return  {Void}
       */
      disableCartButtons() {
        const inputs = this.cart.querySelectorAll('input');
        const buttons = this.cart.querySelectorAll(`button, ${selectors$G.cartItemRemove}`);

        if (inputs.length) {
          inputs.forEach((item) => {
            item.classList.add(classes$x.disabled);
            item.blur();
            item.disabled = true;
          });
        }

        if (buttons.length) {
          buttons.forEach((item) => {
            item.setAttribute(attributes$r.disabled, true);
          });
        }
      }

      /**
       * Enable cart buttons and inputs
       *
       * @return  {Void}
       */
      enableCartButtons() {
        const inputs = this.cart.querySelectorAll('input');
        const buttons = this.cart.querySelectorAll(`button, ${selectors$G.cartItemRemove}`);

        if (inputs.length) {
          inputs.forEach((item) => {
            item.classList.remove(classes$x.disabled);
            item.disabled = false;
          });
        }

        if (buttons.length) {
          buttons.forEach((item) => {
            item.removeAttribute(attributes$r.disabled);
          });
        }
      }

      /**
       * Update error text
       *
       * @param   {String}  itemTitle
       *
       * @return  {Void}
       */

      updateErrorText(itemTitle) {
        this.cartErrorHolder.querySelector(selectors$G.errorMessage).innerText = itemTitle;
      }

      /**
       * Toggle error message
       *
       * @return  {Void}
       */

      toggleErrorMessage() {
        if (!this.cartErrorHolder) return;

        this.cartErrorHolder.classList.toggle(classes$x.expanded, this.cartUpdateFailed);

        if (this.cartUpdateFailed) {
          const cartCloseError = this.cartErrorHolder.querySelector(selectors$G.cartCloseError);
          this.focusOnErrorMessage(this.cartErrorHolder, cartCloseError);
        }

        // Reset cart error events flag
        this.cartUpdateFailed = false;
      }

      /**
       * Handle errors
       *
       * @param   {Object}  response
       *
       * @return  {Object}
       */

      handleErrors(response) {
        if (!response.ok) {
          return response.json().then(function (json) {
            const e = new FetchError({
              status: response.statusText,
              headers: response.headers,
              json: json,
            });
            throw e;
          });
        }
        return response;
      }

      /**
       * Add to cart error handle
       *
       * @param   {Object}  data
       * @param   {DOM Element/Null} button
       *
       * @return  {Void}
       */

      addToCartError(data) {
        const buttonQuickBuyForm = this.button.closest(selectors$G.quickBuyForm);
        const buttonUpsellHolder = this.button.closest(selectors$G.upsellHolder);
        const isFocusEnabled = !document.body.classList.contains(classes$x.noOutline);
        // holder: Product form containers or Upsell products in Cart form
        let holder = this.button.closest(selectors$G.productForm) ? this.button.closest(selectors$G.productForm) : this.button.closest(selectors$G.upsellHolder);
        let errorContainer = holder.querySelector(selectors$G.formErrorsContainer);

        // Upsell products in Cart form
        if (buttonUpsellHolder) {
          errorContainer = buttonUpsellHolder.querySelector(selectors$G.formErrorsContainer);
        }

        if (this.cartDrawerEnabled && this.button && this.button.closest(selectors$G.cartDrawer) !== null && !this.button.closest(selectors$G.cartDrawer)) {
          this.closeCartDrawer();
        }

        this.button.classList.remove(classes$x.loading);
        this.button.removeAttribute(attributes$r.disabled);

        // Error message content
        const closeErrorButton = buttonQuickBuyForm
          ? ''
          : `
      <button type="button" class="errors__button-close" data-close-error>
        ${theme.icons.close}
      </button>
    `;

        let errorMessages = `${data.message}: ${data.description}`;
        if (this.recipientErrors && data.description && typeof data.description === 'object') {
          errorMessages = Object.entries(data.description)
            .map(([key, value]) => `${value}`)
            .join('<br>');
        }

        errorContainer.innerHTML = `
      <div class="errors" data-error autofocus>
        ${errorMessages}
        ${closeErrorButton}
      </div>
    `;

        // Quick buy in PGI errors
        if (buttonQuickBuyForm) {
          const productMediaContainer = errorContainer.closest(selectors$G.productMediaContainer);
          productMediaContainer.classList.add(classes$x.productGridImageError);

          errorContainer.querySelector(selectors$G.error).addEventListener('animationend', () => {
            productMediaContainer.classList.remove(classes$x.productGridImageError);
            errorContainer.innerHTML = '';

            if (!isFocusEnabled) {
              document.activeElement.blur();
            }
          });
        } else {
          // PDP form, Quick view popup forms and Upsell sliders errors
          errorContainer.classList.add(classes$x.visible);
          errorContainer.addEventListener('transitionend', () => {
            this.resizeSliders(errorContainer);
          });

          this.handleCloseErrorMessages(errorContainer);
        }
      }

      /**
       * Handle close buttons in error messages containers
       *
       * @param   {Object}  The error container that holds the close button
       * @return  {Void}
       */
      handleCloseErrorMessages(container) {
        const formErrorClose = container.querySelector(selectors$G.formCloseError);

        formErrorClose?.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isFormCloseError = clickedElement.matches(selectors$G.formCloseError) || clickedElement.closest(selectors$G.formCloseError);

          if (!isFormCloseError) return;

          event.preventDefault();
          container.classList.remove(classes$x.visible);
          container.querySelector(selectors$G.error).addEventListener('transitionend', () => {
            container.innerHTML = '';
            this.resizeSliders(clickedElement);
          });
        });

        this.focusOnErrorMessage(container, formErrorClose);
      }

      /**
       * Focus on the error container's close button so that the alert message is read outloud on voiceover assistive technologies
       *
       * @param   {Object}  The error container that holds the error message
       * @param   {Object}  The button that closes the error message
       * @return  {Void}
       */
      focusOnErrorMessage(container, button) {
        const isFocusEnabled = !document.body.classList.contains(classes$x.noOutline);

        if (!isFocusEnabled) return;

        container.addEventListener('transitionend', () => {
          requestAnimationFrame(() => button?.focus({focusVisible: true}));
        });
      }

      /**
       * Hide error message container as soon as an item is successfully added to the cart
       */
      hideAddToCartErrorMessage() {
        const holder = this.button.closest(selectors$G.upsellHolder) ? this.button.closest(selectors$G.upsellHolder) : this.button.closest(selectors$G.productForm);
        const errorContainer = holder?.querySelector(selectors$G.formErrorsContainer);
        errorContainer?.classList.remove(classes$x.visible);
      }

      /**
       * Resize sliders height
       *
       * @param   {Object}  Element within the slider container that would be resized
       * @return  {Void}
       */
      resizeSliders(element) {
        const slider = element.closest(selectors$G.flickityEnabled);

        if (!slider) return;

        const flkty = Flickity.data(slider);
        requestAnimationFrame(() => flkty.resize());
      }

      /**
       * Render cart and define all elements after cart drawer is open for a first time
       *
       * @return  {Void}
       */
      renderCartDrawer(alwaysOpen = true) {
        const cartDrawerTemplate = document.querySelector(selectors$G.cartDrawerTemplate);

        if (!cartDrawerTemplate) {
          return;
        }

        // Append cart items HTML to the cart drawer container
        this.cartDrawer.innerHTML = cartDrawerTemplate.innerHTML;
        this.assignArguments();

        // Bind cart quantity events
        this.initQuantity();

        // Bind cart events
        this.cartEvents();

        // Init collapsible function for the cart drawer accordions
        if (this.buttonHolder) {
          this.collapsible = new Collapsible(this.buttonHolder);
        }

        // Bind cart drawer close button event
        this.cartDrawerToggle = this.cartDrawer.querySelector(selectors$G.cartDrawerToggle);
        this.cartDrawerToggle.addEventListener('click', this.cartDrawerToggleClickEvent);

        this.isCartDrawerLoaded = true;

        this.renderPairProducts();

        // Hook for cart drawer loaded event
        document.dispatchEvent(new CustomEvent('theme:cart:loaded', {bubbles: true}));

        // Open cart drawer after cart items and events are loaded
        if (alwaysOpen) {
          this.openCartDrawer();
        }
      }

      /**
       * Open cart dropdown and add class on body
       *
       * @return  {Void}
       */

      openCartDrawer() {
        if (this.isCartDrawerOpen) {
          return;
        }

        if (!this.isCartDrawerLoaded) {
          this.renderCartDrawer();
          return;
        }

        // Hook for cart drawer open event
        document.dispatchEvent(new CustomEvent('theme:cart:open', {bubbles: true}));
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.cartDrawer}));
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.cartDrawerBody}));

        document.body.classList.add(classes$x.cartDrawerOpen);
        this.cartDrawer.classList.add(classes$x.open);
        this.cartDrawer.classList.remove(classes$x.contentVisibilityHidden);

        // Cart elements opening animation
        this.cartDrawer.querySelectorAll(selectors$G.aos).forEach((item) => {
          requestAnimationFrame(() => {
            item.classList.add(classes$x.aosAnimate);
          });
        });

        this.cartToggleButtons.forEach((button) => {
          button.setAttribute(attributes$r.ariaExpanded, true);
        });

        this.a11y.trapFocus({
          container: this.cartDrawer,
        });

        // Observe Additional Checkout Buttons
        this.observeAdditionalCheckoutButtons();
        this.isCartDrawerOpen = true;
      }

      /**
       * Close cart dropdown and remove class on body
       *
       * @return  {Void}
       */

      closeCartDrawer() {
        if (!this.isCartDrawerOpen) {
          return;
        }

        // Hook for cart drawer close event
        document.dispatchEvent(new CustomEvent('theme:cart:close', {bubbles: true}));

        // Cart elements closing animation

        if (this.cartAnimationTimer) {
          clearTimeout(this.cartAnimationTimer);
        }

        this.cartAnimationTimer = setTimeout(() => {
          this.cartDrawer.querySelectorAll(selectors$G.aos).forEach((item) => {
            item.classList.remove(classes$x.aosAnimate);
          });
        }, 300);

        this.cartErrorHolder.classList.remove(classes$x.expanded);

        this.a11y.removeTrapFocus();

        this.cartToggleButtons.forEach((button) => {
          button.setAttribute(attributes$r.ariaExpanded, false);
        });

        document.body.classList.remove(classes$x.cartDrawerOpen);
        this.cartDrawer.classList.remove(classes$x.open);
        this.itemsHolder.classList.remove(classes$x.updated);

        const onCartDrawerTransitionEnd = (event) => {
          if (event.target !== this.cartDrawer) return;

          requestAnimationFrame(() => {
            this.cartDrawer.classList.add(classes$x.contentVisibilityHidden);
          });

          this.cartDrawer.removeEventListener('transitionend', onCartDrawerTransitionEnd);
        };

        this.cartDrawer.addEventListener('transitionend', onCartDrawerTransitionEnd);

        // Fixes header background update on cart-drawer close
        const isFocusEnabled = !document.body.classList.contains(classes$x.noOutline);
        if (!isFocusEnabled) {
          requestAnimationFrame(() => {
            document.activeElement.blur();
          });
        }

        // Enable page scroll right after the closing animation ends
        const timeout = 400;
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: timeout}));

        this.isCartDrawerOpen = false;
      }

      /**
       * Toggle cart dropdown
       *
       * @return  {Void}
       */

      toggleCartDrawer() {
        if (this.isCartDrawerOpen) {
          this.closeCartDrawer();
        } else {
          this.openCartDrawer();
        }
      }

      /**
       * Cart drawer toggle events
       *
       * @return  {Void}
       */

      cartDrawerToggleEvents() {
        if (!this.cartDrawer) return;

        // Close cart drawer on ESC key pressed
        this.cartDrawer.addEventListener('keyup', (event) => {
          if (event.code === theme.keyboardKeys.ESCAPE) {
            this.closeCartDrawer();
          }
        });

        // Define cart drawer toggle button click event
        this.cartDrawerToggleClickEvent = (event) => {
          event.preventDefault();
          const button = event.target;

          if (button.getAttribute(attributes$r.ariaExpanded) === 'false') {
            this.a11y.state.trigger = button;
          }

          this.toggleCartDrawer();
        };

        // Define cart drawer close event
        this.cartDrawerCloseEvent = (event) => {
          const isCartDrawerToggle = event.target.matches(selectors$G.cartDrawerToggle);
          const isCartDrawerChild = document.querySelector(selectors$G.cartDrawer).contains(event.target);
          const isPopupQuickView = event.target.closest(selectors$G.popupQuickView);

          if (!isCartDrawerToggle && !isCartDrawerChild && !isPopupQuickView) {
            this.closeCartDrawer();
          }
        };

        // Bind cart drawer toggle buttons click event
        this.cartToggleButtons.forEach((button) => {
          button.addEventListener('click', this.cartDrawerToggleClickEvent);
        });

        // Close drawers on click outside
        //   Replaced 'click' with 'mousedown' as a quick and simple fix to the dragging issue on the upsell slider
        //   which was causing the cart-drawer to close when we start dragging the slider and finish our drag outside the cart-drawer
        //   which was triggering the 'click' event
        document.addEventListener('mousedown', this.cartDrawerCloseEvent);
      }

      /**
       * Toggle classes on different containers and messages
       *
       * @return  {Void}
       */

      toggleClassesOnContainers() {
        const that = this;

        this.emptyMessage.classList.toggle(classes$x.hidden, that.hasItemsInCart());
        this.buttonHolder.classList.toggle(classes$x.hidden, !that.hasItemsInCart());
        this.itemsHolder.classList.toggle(classes$x.hidden, !that.hasItemsInCart());
        this.cartItemsQty.classList.toggle(classes$x.hidden, !that.hasItemsInCart());
      }

      /**
       * Build cart depends on results
       *
       * @param   {Object}  data
       *
       * @return  {Void}
       */

      build(data) {
        const cartItemsData = data.querySelector(selectors$G.apiLineItems);
        const upsellItemsData = data.querySelector(selectors$G.apiUpsellItems);
        const cartEmptyData = Boolean(cartItemsData === null && upsellItemsData === null);
        const priceData = data.querySelector(selectors$G.apiCartPrice);
        const cartTotal = data.querySelector(selectors$G.cartTotal);

        if (this.priceHolder && priceData) {
          this.priceHolder.innerHTML = priceData.innerHTML;
        }

        // Cart page empty state animations re-init
        this.emptyMessage.querySelectorAll(selectors$G.aos).forEach((item) => {
          item.classList.remove(classes$x.aosAnimate);
        });

        if (cartEmptyData) {
          this.itemsHolder.innerHTML = '';

          if (this.pairProductsHolder) {
            this.pairProductsHolder.innerHTML = '';
          }
        } else {
          this.itemsHolder.innerHTML = cartItemsData.innerHTML;

          if (this.pairProductsHolder) {
            this.pairProductsHolder.innerHTML = upsellItemsData.innerHTML;
          }

          this.renderPairProducts();
        }

        this.newTotalItems = cartItemsData && cartItemsData.querySelectorAll(selectors$G.item).length ? cartItemsData.querySelectorAll(selectors$G.item).length : 0;
        this.subtotal = cartTotal && cartTotal.hasAttribute(attributes$r.cartTotal) ? parseInt(cartTotal.getAttribute(attributes$r.cartTotal)) : 0;
        this.cartCount = this.getCartItemCount();

        if (this.cartMessage.length > 0) {
          this.updateProgress();
        }

        this.cartToggleButtons.forEach((button) => {
          button.classList.remove(classes$x.cartItems);

          if (this.newTotalItems > 0) {
            button.classList.add(classes$x.cartItems);
          }
        });

        this.toggleErrorMessage();
        this.updateItemsQuantity(this.cartCount);

        // Update cart total price
        /*
        * [THEME ALTERATION]
        * UK-198
        * We need to show total money without currency word 
        */
        this.cartTotalPrice.innerHTML = this.subtotal === 0 ? window.theme.strings.free : themeCurrency.formatMoney(this.subtotal, theme.moneyFormat); //theme.moneyWithCurrencyFormat);

        if (this.totalItems !== this.newTotalItems) {
          this.totalItems = this.newTotalItems;

          this.toggleClassesOnContainers();
        }

        // Add class "is-updated" line items holder to reduce cart items animation delay via CSS variables
        if (this.isCartDrawerOpen) {
          this.itemsHolder.classList.add(classes$x.updated);
        }

        this.cartEvents();
        this.initQuantity();
        this.enableCartButtons();
        this.resetButtonClasses();
        this.removeLoadingClass();

        document.dispatchEvent(new CustomEvent('theme:cart:added', {bubbles: true}));

        if (this.cartDrawer) {
          this.openCartDrawer();
        }
      }

      /**
       * Get cart item count
       *
       * @return  {Void}
       */

      getCartItemCount() {
        // Returning 0 and not the actual cart items count is done only for when "Cart type" settings are set to "Page"
        // The actual count is necessary only when we build and render the cart/cart-drawer after we get a response from the Cart API
        if (!this.cart) return 0;
        return Array.from(this.cart.querySelectorAll(selectors$G.qtyInput)).reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
      }

      /**
       * Check for items in the cart
       *
       * @return  {Void}
       */

      hasItemsInCart() {
        return this.totalItems > 0;
      }

      /**
       * Show/hide free shipping message
       *
       * @param   {Number}  total
       *
       * @return  {Void}
       */

      freeShippingMessageHandle(total) {
        if (this.cartMessage.length > 0) {
          document.querySelectorAll(selectors$G.cartMessage).forEach((message) => {
            const hasFreeShipping = message.hasAttribute(attributes$r.cartMessageValue) && message.getAttribute(attributes$r.cartMessageValue) === 'true' && total !== 0;
            const cartMessageDefault = message.querySelector(selectors$G.cartMessageDefault);

            message.classList.toggle(classes$x.success, total >= this.cartFreeLimitShipping && hasFreeShipping);
            message.classList.toggle(classes$x.isHidden, total === 0);
            cartMessageDefault.classList.toggle(classes$x.isHidden, total >= this.cartFreeLimitShipping);
          });
        }
      }

      /**
       * Update progress when update cart
       *
       * @return  {Void}
       */

      updateProgress() {
        const newPercentValue = (this.subtotal / this.cartFreeLimitShipping) * 100;
        const leftToSpend = theme.settings.currency_code_enable
          ? themeCurrency.formatMoney(this.cartFreeLimitShipping - this.subtotal, theme.moneyWithCurrencyFormat)
          : themeCurrency.formatMoney(this.cartFreeLimitShipping - this.subtotal, theme.moneyFormat);

        if (this.cartMessage.length > 0) {
          document.querySelectorAll(selectors$G.cartMessage).forEach((message) => {
            const cartMessageProgressItems = message.querySelectorAll(selectors$G.cartProgress);
            const leftToSpendMessage = message.querySelector(selectors$G.leftToSpend);

            if (leftToSpendMessage) {
              leftToSpendMessage.innerHTML = leftToSpend.replace('.00', '').replace(',00', '');
            }

            if (cartMessageProgressItems.length) {
              cartMessageProgressItems.forEach((cartMessageProgress, index) => {
                cartMessageProgress.classList.toggle(classes$x.isHidden, this.subtotal / this.cartFreeLimitShipping >= 1);
                cartMessageProgress.style.setProperty('--progress-width', `${newPercentValue}%`);
                if (index === 0) {
                  cartMessageProgress.setAttribute(attributes$r.value, newPercentValue);
                }
              });
            }

            this.freeShippingMessageHandle(this.subtotal);
          });
        }
      }

      /**
       * Render Upsell Products
       */
      renderPairProducts() {
        this.flktyUpsell = null;
        this.pairProductsHolder = document.querySelector(selectors$G.pairProductsHolder);
        this.pairProducts = document.querySelector(selectors$G.pairProducts);
        this.upsellHolders = document.querySelectorAll(selectors$G.upsellHolder);

        if (this.pairProductsHolder === null || this.pairProductsHolder === undefined) {
          return;
        }

        // Upsell slider
        const that = this;
        if (this.upsellHolders.length > 1) {
          this.flktyUpsell = new Flickity(this.pairProducts, {
            wrapAround: true,
            pageDots: true,
            adaptiveHeight: true,
            prevNextButtons: false,
            on: {
              ready: function () {
                new QuickViewPopup(that.cart);
                this.reloadCells();
                requestAnimationFrame(() => this.resize());
              },
            },
          });

          return;
        }

        // Single upsell item
        new QuickViewPopup(this.cart);
      }

      updateItemsQuantity(itemsQty) {
        let oneItemText = theme.strings.cart_items_one;
        let manyItemsText = theme.strings.cart_items_many;
        oneItemText = oneItemText.split('}}')[1];
        manyItemsText = manyItemsText.split('}}')[1];

        if (this.cartItemsQty) {
          this.cartItemsQty.textContent = itemsQty === 1 ? `${itemsQty} ${oneItemText}` : `${itemsQty} ${manyItemsText}`;
        }
      }

      observeAdditionalCheckoutButtons() {
        // identify an element to observe
        const additionalCheckoutButtons = this.cart.querySelector(selectors$G.additionalCheckoutButtons);
        if (additionalCheckoutButtons) {
          // create a new instance of `MutationObserver` named `observer`,
          // passing it a callback function
          const observer = new MutationObserver(() => {
            this.a11y.removeTrapFocus();
            this.a11y.trapFocus({
              container: this.cart,
            });
            observer.disconnect();
          });

          // call `observe()` on that MutationObserver instance,
          // passing it the element to observe, and the options object
          observer.observe(additionalCheckoutButtons, {subtree: true, childList: true});
        }
      }

      formSubmitHandler() {
        const termsAccepted = document.querySelector(selectors$G.cartTermsCheckbox).checked;
        const termsError = document.querySelector(selectors$G.termsErrorMessage);

        // Disable form submit if terms and conditions are not accepted
        if (!termsAccepted) {
          if (document.querySelector(selectors$G.termsErrorMessage).length > 0) {
            return;
          }

          termsError.innerText = theme.strings.cart_acceptance_error;
          this.cartCheckoutButton.setAttribute(attributes$r.disabled, true);
          termsError.classList.add(classes$x.expanded);
        } else {
          termsError.classList.remove(classes$x.expanded);
          this.cartCheckoutButton.removeAttribute(attributes$r.disabled);
        }
      }

      resetButtonClasses() {
        const buttons = document.querySelectorAll(selectors$G.buttonAddToCart);
        if (buttons) {
          buttons.forEach((button) => {
            if (button.classList.contains(classes$x.loading)) {
              button.classList.remove(classes$x.loading);
              button.classList.add(classes$x.success);

              setTimeout(() => {
                button.removeAttribute(attributes$r.disabled);
                button.classList.remove(classes$x.success);
              }, settings$3.timers.addProductTimeout);
            }
          });
        }
      }

      addLoadingClass() {
        if (this.cartDrawer) {
          this.cartDrawer.classList.add(classes$x.loading);
        } else if (this.itemsWrapper) {
          this.itemsWrapper.classList.add(classes$x.loading);
        }
      }

      removeLoadingClass() {
        if (this.cartDrawer) {
          this.cartDrawer.classList.remove(classes$x.loading);
        } else if (this.itemsWrapper) {
          this.itemsWrapper.classList.remove(classes$x.loading);
        }
      }

      unload() {
        if (this.cartDrawerToggle) {
          this.cartDrawerToggle.removeEventListener('click', this.cartDrawerToggleClickEvent);
        }

        this.cartToggleButtons.forEach((button) => {
          button.removeEventListener('click', this.cartDrawerToggleClickEvent);
        });

        // Close drawers on click outside
        document.removeEventListener('mousedown', this.cartDrawerCloseEvent);

        if (this.collapsible !== null) {
          this.collapsible.onUnload();
        }
      }
    }

    const cartDrawer = {
      onLoad() {
        sections$s[this.id] = new CartDrawer();

        /*
          THEME CORE ALTERATION
          We need this to work with Cart Elements On The Cart Page
          We can rewerite it later, to avoid this code
        */
        window.cart = sections$s[this.id];
        document.dispatchEvent(new CustomEvent('theme:cartpage:ready'));

      },
      onUnload() {
        if (typeof sections$s[this.id].unload === 'function') {
          sections$s[this.id].unload();
        }
      },
    };
    register('cart-template', cartDrawer);

    const selectors$F = {
      scrollToTop: '[data-scroll-top-button]',
    };
    const classes$w = {
      isVisible: 'is-visible',
    };

    // Scroll to top button
    const scrollTopButton = document.querySelector(selectors$F.scrollToTop);
    if (scrollTopButton) {
      scrollTopButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      });
      document.addEventListener(
        'scroll',
        throttle(() => {
          scrollTopButton.classList.toggle(classes$w.isVisible, window.pageYOffset > window.innerHeight);
        }, 150)
      );
    }

    const selectors$E = {
      details: 'details',
      popdownBody: '[data-popdown-body]',
      popdownClose: '[data-popdown-close]',
      popdownToggle: '[data-popdown-toggle]',
      searchFormInner: '[data-search-form-inner]',
      input: 'input:not([type="hidden"])',
      popularSearchesLink: '[data-popular-searches-link]',
      header: '[data-site-header]',
      nav: '[data-nav]',
      navItemsCompress: '[data-nav-items-compress]',
      navIcons: '[data-nav-icons]',
      mobileMenu: '[data-mobile-menu]',
      predictiveSearch: 'predictive-search',
      searchForm: 'search-form',
    };

    const attributes$q = {
      popdownInHeader: 'data-popdown-in-header',
      popdownInPage: 'data-popdown-in-page',
      searchPerformed: 'data-search-performed',
    };

    const classes$v = {
      searchOpened: 'search-opened',
      headerMenuOpened: 'site-header--menu-opened',
      headerCompress: 'site-header--compress',
    };

    class SearchPopdown extends HTMLElement {
      constructor() {
        super();
        this.isPopdownInHeader = this.hasAttribute(attributes$q.popdownInHeader);
        this.isPopdownInPage = this.hasAttribute(attributes$q.popdownInPage);
        this.popdownBody = this.querySelector(selectors$E.popdownBody);
        this.popdownClose = this.querySelector(selectors$E.popdownClose);
        this.searchFormInner = this.querySelector(selectors$E.searchFormInner);
        this.popularSearchesLink = this.querySelectorAll(selectors$E.popularSearchesLink);
        this.searchFormWrapper = this.querySelector(selectors$E.searchForm) ? this.querySelector(selectors$E.searchForm) : this.querySelector(selectors$E.predictiveSearch);
        this.predictiveSearch = this.searchFormWrapper.matches(selectors$E.predictiveSearch);
        this.header = document.querySelector(selectors$E.header);
        this.headerSection = this.header?.parentNode;
        this.nav = this.header?.querySelector(selectors$E.nav);
        this.mobileMenu = this.headerSection?.querySelector(selectors$E.mobileMenu);
        this.a11y = a11y;
        this.ensureClosingOnResizeEvent = () => this.ensureClosingOnResize();

        if (this.isPopdownInHeader) {
          this.details = this.querySelector(selectors$E.details);
          this.popdownToggle = this.querySelector(selectors$E.popdownToggle);
        }
      }

      connectedCallback() {
        if (this.isPopdownInHeader) {
          this.details.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
          this.popdownClose.addEventListener('click', () => this.close());
          this.popdownToggle.addEventListener('click', (event) => this.onPopdownToggleClick(event));
          this.popdownToggle.setAttribute('role', 'button');
        }

        if (this.isPopdownInPage) {
          this.popdownClose.addEventListener('click', () => this.triggerPopdownClose());
          this.searchFormWrapper.addEventListener('focusout', () => this.onFocusOut());
          this.searchFormWrapper.input.addEventListener('click', (event) => this.triggerPopdownOpen(event));
        }

        this.searchFormInner.addEventListener('transitionend', (event) => {
          if (event.target === this.searchFormInner && this.details.hasAttribute('open') && this.details.getAttribute('open') == 'false') {
            this.onClose();
          }
        });

        this.popularSearchesLink.forEach((element) => {
          element.addEventListener('click', (event) => {
            event.preventDefault();
            const popularSearchText = event.target.textContent;

            this.searchFormWrapper.input.value = popularSearchText;
            this.searchFormWrapper.submit();
          });
        });
      }

      onPopdownToggleClick(event) {
        event.preventDefault();
        event.target.closest(selectors$E.details).hasAttribute('open') ? this.close() : this.open(event);
      }

      onBodyClick(event) {
        const isTargetInPopdown = this.contains(event.target);
        const isHeaderMenuOpened = this.header?.classList.contains(classes$v.headerMenuOpened);

        if (isHeaderMenuOpened || isTargetInPopdown) return;
        if (!isTargetInPopdown) this.close();
      }

      onFocusOut() {
        if (!this.predictiveSearch) return;

        requestAnimationFrame(() => {
          if (!this.searchFormWrapper.contains(document.activeElement)) {
            this.searchFormWrapper.close();
          }
        });
      }

      triggerPopdownOpen(event) {
        const isSearchPageWithoutTerms = this.closest(`[${attributes$q.searchPerformed}="false"]`);
        const isTouch = matchMedia('(pointer:coarse)').matches;
        const viewportMobile = window.innerWidth < theme.sizes.small;
        const shouldOpenPopdownOnTouchDevice = isTouch || viewportMobile;
        const shouldOpenPopdownOnNoTerms = isSearchPageWithoutTerms != null;

        if (!this.nav || !this.mobileMenu) return;

        if (shouldOpenPopdownOnTouchDevice || shouldOpenPopdownOnNoTerms) {
          event.preventDefault();

          const isHeaderCompressed = this.header.classList.contains(classes$v.headerCompress);
          let popdownToggle = this.mobileMenu.querySelector(selectors$E.popdownToggle);

          if (!isTouch) {
            popdownToggle = isHeaderCompressed
              ? this.nav.querySelector(`${selectors$E.navItemsCompress} ${selectors$E.popdownToggle}`)
              : this.nav.querySelector(`${selectors$E.navIcons} ${selectors$E.popdownToggle}`);
          }

          setTimeout(() => {
            popdownToggle?.dispatchEvent(new Event('click', {bubbles: true}));
          }, 300);
        }
      }

      open(event) {
        this.onBodyClickEvent = (event) => this.onBodyClick(event);
        event.target.closest(selectors$E.details).setAttribute('open', '');
        this.searchFormWrapper.input.setAttribute('aria-expanded', true);

        document.body.classList.add(classes$v.searchOpened);
        document.body.addEventListener('click', this.onBodyClickEvent);
        document.addEventListener('theme:resize', this.ensureClosingOnResizeEvent);
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

        this.a11y.state.trigger = event.target;

        // Safari opening transition fix
        requestAnimationFrame(() => {
          // Firefox opening transition fix (single requestAnimationFrame method does not work everytime)
          requestAnimationFrame(() => {
            event.target.closest(selectors$E.details).setAttribute('open', 'true');
            this.a11y.trapFocus({
              container: this.searchFormInner,
            });
          });
        });
      }

      close() {
        this.a11y.removeTrapFocus();
        this.details.setAttribute('open', 'false');
        if (this.predictiveSearch) this.searchFormWrapper.close();
        this.searchFormWrapper.handleFocusableDescendants(true);
      }

      triggerPopdownClose() {
        if (this.predictiveSearch) this.searchFormWrapper.close();

        if (this.searchFormWrapper.popularSearches) {
          requestAnimationFrame(() => document.activeElement.blur());
        }
      }

      onClose() {
        this.details.removeAttribute('open');
        document.dispatchEvent(new CustomEvent('theme:search:close', {bubbles: true}));
        document.body.classList.remove(classes$v.searchOpened);
        document.body.removeEventListener('click', this.onBodyClickEvent);
        document.removeEventListener('theme:resize', this.ensureClosingOnResizeEvent);
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      }

      ensureClosingOnResize() {
        // Due to having multiple <search-popdown> elements in `.mobile-menu`, `.nav--default` or `.menu__item--compress` parents,
        // the element can become hidden when the browser is resized
        // `transitionend` event is then not fired and the closing methods are not finished properly
        const isElementHiddenFromView = this.offsetParent === null;
        if (!isElementHiddenFromView) return;

        this.onClose();
      }
    }

    customElements.define('search-popdown', SearchPopdown);

    Shopify.Products = (function () {
      const config = {
        howManyToShow: 4,
        howManyToStoreInMemory: 10,
        wrapperId: 'recently-viewed-products',
        section: null,
        onComplete: null,
      };

      let productHandleQueue = [];
      let wrapper = null;
      let howManyToShowItems = null;

      const today = new Date();
      const expiresDate = new Date();
      const daysToExpire = 90;
      expiresDate.setTime(today.getTime() + 3600000 * 24 * daysToExpire);

      const cookie = {
        configuration: {
          expires: expiresDate.toGMTString(),
          path: '/',
          domain: window.location.hostname,
          sameSite: 'none',
          secure: true,
        },
        name: 'shopify_recently_viewed',
        write: function (recentlyViewed) {
          const recentlyViewedString = recentlyViewed.join(' ');
          document.cookie = `${this.name}=${recentlyViewedString}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
        },
        read: function () {
          let recentlyViewed = [];
          let cookieValue = null;

          if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
            cookieValue = document.cookie
              .split('; ')
              .find((row) => row.startsWith(this.name))
              .split('=')[1];
          }

          if (cookieValue !== null) {
            recentlyViewed = cookieValue.split(' ');
          }

          return recentlyViewed;
        },
        destroy: function () {
          const cookieVal = null;
          document.cookie = `${this.name}=${cookieVal}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
        },
        remove: function (productHandle) {
          const recentlyViewed = this.read();
          const position = recentlyViewed.indexOf(productHandle);
          if (position !== -1) {
            recentlyViewed.splice(position, 1);
            this.write(recentlyViewed);
          }
        },
      };

      const finalize = (wrapper, section) => {
        showElement(wrapper, true);
        const cookieItemsLength = cookie.read().length;

        if (Shopify.recentlyViewed && howManyToShowItems && cookieItemsLength && cookieItemsLength < howManyToShowItems && wrapper.children.length) {
          let allClassesArr = [];
          let addClassesArr = [];
          let objCounter = 0;
          for (const property in Shopify.recentlyViewed) {
            objCounter += 1;
            const objString = Shopify.recentlyViewed[property];
            const objArr = objString.split(' ');
            const propertyIdx = parseInt(property.split('_')[1]);
            allClassesArr = [...allClassesArr, ...objArr];

            if (cookie.read().length === propertyIdx || (objCounter === Object.keys(Shopify.recentlyViewed).length && !addClassesArr.length)) {
              addClassesArr = [...addClassesArr, ...objArr];
            }
          }

          for (let i = 0; i < wrapper.children.length; i++) {
            const element = wrapper.children[i];
            if (allClassesArr.length) {
              element.classList.remove(...allClassesArr);
            }

            if (addClassesArr.length) {
              element.classList.add(...addClassesArr);
            }
          }
        }

        // If we have a callback.
        if (config.onComplete) {
          try {
            config.onComplete(wrapper, section);
          } catch (error) {
            console.log(error);
          }
        }
      };

      const moveAlong = (shown, productHandleQueue, wrapper, section) => {
        if (productHandleQueue.length && shown < config.howManyToShow) {
          fetch(`${window.theme.routes.root}products/${productHandleQueue[0]}?section_id=api-product-grid-item`)
            .then((response) => response.text())
            .then((product) => {
              const aosDelay = shown * 150;
              const aosAnchor = wrapper.id ? `#${wrapper.id}` : '';
              const fresh = document.createElement('div');
              let productReplaced = product;

              // Unpublished products that are draft or archived can still be displayed in Theme editor
              // Preventing them from showing cleans all JS errors that are present because of the missing products and JSON data
              if (productReplaced.includes('data-unpublished')) {
                cookie.remove(productHandleQueue[0]);
                productHandleQueue.shift();
                moveAlong(shown, productHandleQueue, wrapper, section);
                return;
              }

              productReplaced = productReplaced.includes('||itemAosDelay||') ? productReplaced.replaceAll('||itemAosDelay||', aosDelay) : productReplaced;
              productReplaced = productReplaced.includes('||itemAosAnchor||') ? productReplaced.replaceAll('||itemAosAnchor||', aosAnchor) : productReplaced;
              fresh.innerHTML = productReplaced;

              wrapper.innerHTML += fresh.querySelector('[data-api-content]').innerHTML;

              productHandleQueue.shift();
              shown++;
              moveAlong(shown, productHandleQueue, wrapper, section);
            })
            .catch(() => {
              cookie.remove(productHandleQueue[0]);
              productHandleQueue.shift();
              moveAlong(shown, productHandleQueue, wrapper, section);
            });
        } else {
          finalize(wrapper, section);
        }
      };

      return {
        showRecentlyViewed: function (params) {
          const paramsNew = params || {};
          const shown = 0;

          // Update defaults.
          Object.assign(config, paramsNew);

          // Read cookie.
          productHandleQueue = cookie.read();

          // Element where to insert.
          wrapper = document.querySelector(`#${config.wrapperId}`);

          // How many products to show.
          howManyToShowItems = config.howManyToShow;
          config.howManyToShow = Math.min(productHandleQueue.length, config.howManyToShow);

          // If we have any to show.
          if (config.howManyToShow && wrapper) {
            // Getting each product with an Ajax call and rendering it on the page.
            moveAlong(shown, productHandleQueue, wrapper, config.section);
          }
        },

        getConfig: function () {
          return config;
        },

        clearList: function () {
          cookie.destroy();
        },

        recordRecentlyViewed: function (params) {
          const paramsNew = params || {};

          // Update defaults.
          Object.assign(config, paramsNew);

          // Read cookie.
          let recentlyViewed = cookie.read();

          // If we are on a product page.
          if (window.location.pathname.indexOf('/products/') !== -1) {
            // What is the product handle on this page.
            let productHandle = decodeURIComponent(window.location.pathname)
              .match(
                /\/products\/([a-z0-9\-]|[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|[\u203B]|[\w\u0430-\u044f]|[\u0400-\u04FF]|[\u0900-\u097F]|[\u0590-\u05FF\u200f\u200e]|[\u0621-\u064A\u0660-\u0669 ])+/
              )[0]
              .split('/products/')[1];

            if (config.handle) {
              productHandle = config.handle;
            }

            // In what position is that product in memory.
            const position = recentlyViewed.indexOf(productHandle);

            // If not in memory.
            if (position === -1) {
              // Add product at the start of the list.
              recentlyViewed.unshift(productHandle);
              // Only keep what we need.
              recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
            } else {
              // Remove the product and place it at start of list.
              recentlyViewed.splice(position, 1);
              recentlyViewed.unshift(productHandle);
            }

            // Update cookie.
            cookie.write(recentlyViewed);
          }
        },

        hasProducts: cookie.read().length > 0,
      };
    })();

    theme.ProductModel = (function () {
      let modelJsonSections = {};
      let models = {};
      let xrButtons = {};

      const selectors = {
        productMediaWrapper: '[data-product-single-media-wrapper]',
        mediaGroup: '[data-product-single-media-group]',
        productXr: '[data-shopify-xr]',
        mediaId: 'data-media-id',
        model3d: 'data-shopify-model3d-id',
        modelViewer: 'model-viewer',
        modelJson: '#ModelJson-',
        deferredMedia: '[data-deferred-media]',
        deferredMediaButton: '[data-deferred-media-button]',
      };
      const classes = {
        isLoading: 'is-loading',
        mediaHidden: 'media--hidden',
      };

      function init(mediaContainer, sectionId) {
        modelJsonSections[sectionId] = {
          loaded: false,
        };

        const deferredMediaButton = mediaContainer.querySelector(selectors.deferredMediaButton);

        if (deferredMediaButton) {
          deferredMediaButton.addEventListener('click', loadContent.bind(this, mediaContainer, sectionId));
        }
      }

      function loadContent(mediaContainer, sectionId) {
        if (mediaContainer.querySelector(selectors.deferredMedia).getAttribute('loaded')) {
          return;
        }

        mediaContainer.classList.add(classes.isLoading);
        const content = document.createElement('div');
        content.appendChild(mediaContainer.querySelector('template').content.firstElementChild.cloneNode(true));
        const modelViewerElement = content.querySelector('model-viewer');
        const deferredMedia = mediaContainer.querySelector(selectors.deferredMedia);
        deferredMedia.appendChild(modelViewerElement);
        deferredMedia.setAttribute('loaded', true);
        const mediaId = mediaContainer.dataset.mediaId;
        const modelId = modelViewerElement.dataset.modelId;
        const xrButton = mediaContainer.closest(selectors.mediaGroup).parentElement.querySelector(selectors.productXr);
        xrButtons[sectionId] = {
          element: xrButton,
          defaultId: modelId,
        };

        models[mediaId] = {
          modelId: modelId,
          mediaId: mediaId,
          sectionId: sectionId,
          container: mediaContainer,
          element: modelViewerElement,
        };

        if (!window.ShopifyXR) {
          window.Shopify.loadFeatures([
            {
              name: 'shopify-xr',
              version: '1.0',
              onLoad: setupShopifyXr,
            },
            {
              name: 'model-viewer-ui',
              version: '1.0',
              onLoad: setupModelViewerUi,
            },
          ]);
        } else {
          setupModelViewerUi();
        }
      }

      function setupShopifyXr(errors) {
        if (errors) {
          console.warn(errors);
          return;
        }
        if (!window.ShopifyXR) {
          document.addEventListener('shopify_xr_initialized', function () {
            setupShopifyXr();
          });
          return;
        }

        for (const sectionId in modelJsonSections) {
          if (modelJsonSections.hasOwnProperty(sectionId)) {
            const modelSection = modelJsonSections[sectionId];

            if (modelSection.loaded) {
              continue;
            }

            const modelJson = document.querySelector(`${selectors.modelJson}${sectionId}`);

            if (modelJson) {
              window.ShopifyXR.addModels(JSON.parse(modelJson.innerHTML));
              modelSection.loaded = true;
            }
          }
        }

        window.ShopifyXR.setupXRElements();
      }

      function setupModelViewerUi(errors) {
        if (errors) {
          console.warn(errors);
          return;
        }

        for (const key in models) {
          if (models.hasOwnProperty(key)) {
            const model = models[key];
            if (!model.modelViewerUi) {
              model.modelViewerUi = new Shopify.ModelViewerUI(model.element);
              setupModelViewerListeners(model);
            }
          }
        }
      }

      function setupModelViewerListeners(model) {
        const xrButton = xrButtons[model.sectionId];
        model.container.addEventListener('theme:media:visible', function () {
          xrButton.element.setAttribute(selectors.model3d, model.modelId);

          if (window.theme.touch) {
            return;
          }

          model.modelViewerUi.play();
          model.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
        });

        model.container.addEventListener('theme:media:hidden', function () {
          model.modelViewerUi.pause();
        });

        model.container.addEventListener('xrLaunch', function () {
          model.modelViewerUi.pause();
        });

        model.element.addEventListener('load', () => {
          xrButton.element.setAttribute(selectors.model3d, model.modelId);
          model.container.classList.remove(classes.isLoading);
          model.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
        });

        model.element.addEventListener('shopify_model_viewer_ui_toggle_play', function () {
          pauseOtherMedia(model.mediaId);
          setTimeout(() => {
            // Timeout to trigger play event after pause events
            model.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
          }, 50);
        });
        model.element.addEventListener('shopify_model_viewer_ui_toggle_pause', function () {
          model.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
        });

        pauseOtherMedia(model.mediaId);
      }

      function pauseOtherMedia(mediaId) {
        const currentMedia = `[${selectors.mediaId}="${mediaId}"]`;
        const otherMedia = document.querySelectorAll(`${selectors.productMediaWrapper}:not(${currentMedia})`);

        if (otherMedia.length) {
          otherMedia.forEach((media) => {
            media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
            media.classList.add(classes.mediaHidden);
          });
        }
      }

      function removeSectionModels(sectionId) {
        for (const key in models) {
          if (models.hasOwnProperty(key)) {
            const model = models[key];
            if (model.sectionId === sectionId) {
              delete models[key];
            }
          }
        }
        delete modelJsonSections[sectionId];
        delete theme.mediaInstances[sectionId];
      }

      return {
        init: init,
        loadContent: loadContent,
        removeSectionModels: removeSectionModels,
      };
    })();

    register('collection-template', filters);

    const selectors$D = {
      templateAddresses: '.template-customers-addresses',
      accountForm: '[data-form]',
      addressNewForm: '[data-form-new]',
      btnNew: '[data-button-new]',
      btnEdit: '[data-button-edit]',
      btnDelete: '[data-button-delete]',
      btnCancel: '[data-button-cancel]',
      editAddress: 'data-form-edit',
      addressCountryNew: 'AddressCountryNew',
      addressProvinceNew: 'AddressProvinceNew',
      addressProvinceContainerNew: 'AddressProvinceContainerNew',
      addressCountryOption: '[data-country-option]',
      addressCountry: 'AddressCountry',
      addressProvince: 'AddressProvince',
      addressProvinceContainer: 'AddressProvinceContainer',
      requiredInputs: 'input[type="text"]:not(.optional)',
    };

    const attributes$p = {
      dataFormId: 'data-form-id',
    };

    const classes$u = {
      hidden: 'is-hidden',
      validation: 'validation--showup',
    };

    class Addresses {
      constructor(section) {
        this.section = section;
        this.addressNewForm = this.section.querySelector(selectors$D.addressNewForm);
        this.accountForms = this.section.querySelectorAll(selectors$D.accountForm);

        this.init();
        this.validate();
      }

      init() {
        if (this.addressNewForm) {
          const section = this.section;
          const newAddressForm = this.addressNewForm;
          this.customerAddresses();

          const newButtons = section.querySelectorAll(selectors$D.btnNew);
          if (newButtons.length) {
            newButtons.forEach((button) => {
              button.addEventListener('click', function (e) {
                e.preventDefault();
                button.classList.add(classes$u.hidden);
                newAddressForm.classList.remove(classes$u.hidden);
              });
            });
          }

          const editButtons = section.querySelectorAll(selectors$D.btnEdit);
          if (editButtons.length) {
            editButtons.forEach((button) => {
              button.addEventListener('click', function (e) {
                e.preventDefault();
                const formId = this.getAttribute(attributes$p.dataFormId);
                section.querySelector(`[${selectors$D.editAddress}="${formId}"]`).classList.toggle(classes$u.hidden);
              });
            });
          }

          const deleteButtons = section.querySelectorAll(selectors$D.btnDelete);
          if (deleteButtons.length) {
            deleteButtons.forEach((button) => {
              button.addEventListener('click', function (e) {
                e.preventDefault();
                const formId = this.getAttribute(attributes$p.dataFormId);
                if (confirm(theme.strings.delete_confirm)) {
                  Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
                }
              });
            });
          }

          const cancelButtons = section.querySelectorAll(selectors$D.btnCancel);
          if (cancelButtons.length) {
            cancelButtons.forEach((button) => {
              button.addEventListener('click', function (e) {
                e.preventDefault();
                this.closest(selectors$D.accountForm).classList.add(classes$u.hidden);
                document.querySelector(selectors$D.btnNew).classList.remove(classes$u.hidden);
              });
            });
          }
        }
      }

      customerAddresses() {
        // Initialize observers on address selectors, defined in shopify_common.js
        if (Shopify.CountryProvinceSelector) {
          new Shopify.CountryProvinceSelector(selectors$D.addressCountryNew, selectors$D.addressProvinceNew, {
            hideElement: selectors$D.addressProvinceContainerNew,
          });
        }

        // Initialize each edit form's country/province selector
        const countryOptions = this.section.querySelectorAll(selectors$D.addressCountryOption);
        countryOptions.forEach((element) => {
          const formId = element.getAttribute(attributes$p.dataFormId);
          const countrySelector = `${selectors$D.addressCountry}_${formId}`;
          const provinceSelector = `${selectors$D.addressProvince}_${formId}`;
          const containerSelector = `${selectors$D.addressProvinceContainer}_${formId}`;

          new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
            hideElement: containerSelector,
          });
        });
      }

      validate() {
        this.accountForms.forEach((accountForm) => {
          const form = accountForm.querySelector('form');
          const inputs = form.querySelectorAll(selectors$D.requiredInputs);

          form.addEventListener('submit', (event) => {
            let isEmpty = false;

            // Display notification if input is empty
            inputs.forEach((input) => {
              if (!input.value) {
                input.nextElementSibling.classList.add(classes$u.validation);
                isEmpty = true;
              } else {
                input.nextElementSibling.classList.remove(classes$u.validation);
              }
            });

            if (isEmpty) {
              event.preventDefault();
            }
          });
        });
      }
    }

    const template = document.querySelector(selectors$D.templateAddresses);
    if (template) {
      new Addresses(template);
    }

    const selectors$C = {
      form: '[data-account-form]',
      showReset: '[data-show-reset]',
      hideReset: '[data-hide-reset]',
      recover: '[data-recover-password]',
      login: '[data-login-form]',
      recoverSuccess: '[data-recover-success]',
      recoverSuccessText: '[data-recover-success-text]',
      recoverHash: '#recover',
    };

    const classes$t = {
      hidden: 'is-hidden',
    };

    class Login {
      constructor(form) {
        this.form = form;
        this.showButton = form.querySelector(selectors$C.showReset);
        this.hideButton = form.querySelector(selectors$C.hideReset);
        this.recover = form.querySelector(selectors$C.recover);
        this.login = form.querySelector(selectors$C.login);
        this.success = form.querySelector(selectors$C.recoverSuccess);
        this.successText = form.querySelector(selectors$C.recoverSuccessText);
        this.init();
      }

      init() {
        if (window.location.hash == selectors$C.recoverHash) {
          this.showRecoverPasswordForm();
        } else {
          this.hideRecoverPasswordForm();
        }

        if (this.success) {
          this.successText.classList.remove(classes$t.hidden);
        }

        this.showButton.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            this.showRecoverPasswordForm();
          },
          false
        );
        this.hideButton.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            this.hideRecoverPasswordForm();
          },
          false
        );
      }

      showRecoverPasswordForm() {
        this.recover.classList.remove(classes$t.hidden);
        this.login.classList.add(classes$t.hidden);
        window.location.hash = selectors$C.recoverHash;
        return false;
      }

      hideRecoverPasswordForm() {
        this.login.classList.remove(classes$t.hidden);
        this.recover.classList.add(classes$t.hidden);
        window.location.hash = '';
        return false;
      }
    }

    const loginForm = document.querySelector(selectors$C.form);
    if (loginForm) {
      new Login(loginForm);
    }

    register('search-template', [filters, tabs]);

    const selectors$B = {
      frame: '[data-ticker-frame]',
      scale: '[data-ticker-scale]',
      text: '[data-ticker-text]',
      clone: 'data-clone',
    };

    const attributes$o = {
      speed: 'data-marquee-speed',
    };

    const classes$s = {
      animationClass: 'ticker--animated',
      unloadedClass: 'ticker--unloaded',
      comparitorClass: 'ticker__comparitor',
    };

    const settings$2 = {
      moveTime: 1.63, // 100px going to move for 1.63s
      space: 100, // 100px
    };

    class Ticker {
      constructor(el, stopClone = false) {
        this.frame = el;
        this.stopClone = stopClone;
        this.scale = this.frame.querySelector(selectors$B.scale);
        this.text = this.frame.querySelector(selectors$B.text);

        this.comparitor = this.text.cloneNode(true);
        this.comparitor.classList.add(classes$s.comparitorClass);
        this.frame.appendChild(this.comparitor);
        this.scale.classList.remove(classes$s.unloadedClass);
        this.resizeEvent = debounce(() => this.checkWidth(), 100);
        this.listen();
      }

      listen() {
        document.addEventListener('theme:resize:width', this.resizeEvent);
        this.checkWidth();
      }

      checkWidth() {
        const padding = window.getComputedStyle(this.frame).paddingLeft.replace('px', '') * 2;

        if (this.frame.clientWidth - padding < this.comparitor.clientWidth || this.stopClone) {
          if (this.scale.childElementCount === 1) {
            this.text.classList.add(classes$s.animationClass);
            this.clone = this.text.cloneNode(true);
            this.clone.setAttribute(selectors$B.clone, '');
            this.scale.appendChild(this.clone);

            if (this.stopClone) {
              for (let index = 0; index < 10; index++) {
                const cloneSecond = this.text.cloneNode(true);
                cloneSecond.setAttribute(selectors$B.clone, '');
                this.scale.appendChild(cloneSecond);
              }
            }

            let frameSpeed = this.frame.getAttribute(attributes$o.speed);
            if (frameSpeed === null) {
              frameSpeed = 100;
            }
            const speed = settings$2.moveTime * (100 / parseInt(frameSpeed, 10));
            const animationTimeFrame = (this.text.clientWidth / settings$2.space) * speed;

            this.scale.style.setProperty('--animation-time', `${animationTimeFrame}s`);
          }
        } else {
          this.text.classList.add(classes$s.animationClass);
          let clone = this.scale.querySelector(`[${selectors$B.clone}]`);
          if (clone) {
            this.scale.removeChild(clone);
          }
          this.text.classList.remove(classes$s.animationClass);
        }
      }

      unload() {
        document.removeEventListener('theme:resize:width', this.resizeEvent);
      }
    }

    const selectors$A = {
      announcement: '[data-announcement]',
      announcementSlide: '[data-announcement-slide]',
      frame: '[data-ticker-frame]',
      slide: '[data-slide]',
      slider: '[data-slider]',
      tickerScale: '[data-ticker-scale]',
      tickerText: '[data-ticker-text]',
    };

    const attributes$n = {
      slide: 'data-slide',
      speed: 'data-slider-speed',
      arrows: 'data-slider-arrows',
      stop: 'data-stop',
      style: 'style',
      targetReferrer: 'data-target-referrer',
      clipPath: 'clip-path',
    };

    const classes$r = {
      desktop: 'desktop',
      mobile: 'mobile',
      tickerAnimated: 'ticker--animated',
    };

    const tags = {
      clipPath: 'clipPath',
    };

    const sections$r = {};

    class AnnouncementBar {
      constructor(container) {
        this.barHolder = container;
        this.locationPath = location.href;
        this.slides = this.barHolder.querySelectorAll(selectors$A.slide);
        this.slider = this.barHolder.querySelector(selectors$A.slider);
        this.tickers = [];
        this.flkty = null;

        this.init();
      }

      init() {
        this.removeAnnouncement();

        if (this.slider) {
          this.initSlider();
          document.addEventListener('theme:resize:width', this.initSlider.bind(this));
        }

        if (!this.slider) {
          this.initTickers(true);
          this.tickerAnimationPause();
        }

        this.updateSVGClipPathIDs();
      }

      /**
       * Delete announcement which has a target referrer attribute and it is not contained in page URL
       */
      removeAnnouncement() {
        for (let i = 0; i < this.slides.length; i++) {
          const element = this.slides[i];

          if (!element.hasAttribute(attributes$n.targetReferrer)) {
            continue;
          }

          if (this.locationPath.indexOf(element.getAttribute(attributes$n.targetReferrer)) === -1 && !window.Shopify.designMode) {
            element.parentNode.removeChild(element);
          }
        }
      }

      /**
       * Init slider
       */
      initSlider() {
        const slides = this.slider.querySelectorAll(selectors$A.slide);
        const sliderArrows = this.slider.hasAttribute(attributes$n.arrows);
        const announcementBar = document.querySelector('[data-announcement-bar]');
        const enableCustomWidth = announcementBar?.dataset.enableCustomSliderWidth === 'true';

        if (slides) {
          let slideSelector = `${selectors$A.slide}`;

          if (window.innerWidth < theme.sizes.small) {
            slideSelector = `${selectors$A.slide}:not(.${classes$r.desktop})`;
          } else {
            slideSelector = `${selectors$A.slide}:not(.${classes$r.mobile})`;
          }

          if (this.flkty != null) {
            this.flkty.destroy();
          }

          this.flkty = new Flickity(this.slider, {
            cellSelector: slideSelector,
            pageDots: false,
            prevNextButtons: sliderArrows,
            wrapAround: true,
            autoPlay: parseInt(this.slider.getAttribute(attributes$n.speed), 10),
            on: {
              ready: () => {
                setTimeout(() => {
                  if (this.flkty && enableCustomWidth) {
                    this.updateFlickitySliderWidth(this.flkty);
                  }
                  this.slider.dispatchEvent(
                    new CustomEvent('slider-is-loaded', {
                      bubbles: true,
                      detail: {
                        slider: this,
                      },
                    })
                  );
                }, 10);
              },
              change: () => {
                if (enableCustomWidth) {
                  setTimeout(() => {
                    if (this.flkty) {
                      this.updateFlickitySliderWidth(this.flkty);
                    }
                  }, 10);
                }
              }
            },
          });
          this.flkty.reposition();
        }

        this.slider.addEventListener('slider-is-loaded', () => {
          this.initTickers();
          this.updateSVGClipPathIDs();
        });
      }

      updateFlickitySliderWidth(flkty) {
        if (window.innerWidth < theme.sizes.small || !flkty) return;

        const clonedTexts = this.slider.querySelectorAll('.announcement__text[data-clone]');
        if (clonedTexts.length > 0) {
          clonedTexts.forEach(clone => clone.remove());

          const scales = this.slider.querySelectorAll('.announcement__scale');
          scales.forEach(scale => {
            scale.style.animation = 'none';
            scale.style.setProperty('--animation-time', '0s');
          });
        }

        const selectedElement = flkty.selectedElement;
        if (selectedElement) {
          const announcementText = selectedElement.querySelector('.announcement__text');
          if (announcementText) {
            let width = announcementText.offsetWidth + 230;

            const flickitySlider = this.slider.querySelector('.flickity-slider');
            const announcementSlider = flickitySlider?.closest('.announcement__slider');

            if (flickitySlider && announcementSlider) {
              announcementSlider.style.width = `${width}px`;
              announcementSlider.style.margin = '0 auto';
            }
          }
        }
      }

      /**
       * Init tickers in sliders
       */
      initTickers(stopClone = false) {
        const frames = this.barHolder.querySelectorAll(selectors$A.frame);

        frames.forEach((element) => {
          const ticker = new Ticker(element, stopClone);
          this.tickers.push(ticker);

          const slides = element.querySelectorAll(selectors$A.slide);
          if (slides.length !== 0) {
            const slidesMobile = element.querySelectorAll(`${selectors$A.slide}.${classes$r.mobile}`);
            const slidesDesktop = element.querySelectorAll(`${selectors$A.slide}.${classes$r.desktop}`);

            if (slides.length === slidesMobile.length) {
              element.parentNode.classList.add(classes$r.mobile);
            } else if (slides.length === slidesDesktop.length) {
              element.parentNode.classList.add(classes$r.desktop);
            }
          }
        });
      }

      toggleTicker(e, isStopped) {
        const tickerScale = e.target.closest(selectors$A.tickerScale);
        const element = document.querySelector(`[${attributes$n.slide}="${e.detail.blockId}"]`);

        if (isStopped && element) {
          tickerScale.setAttribute(attributes$n.stop, '');
          tickerScale.querySelectorAll(selectors$A.tickerText).forEach((textHolder) => {
            textHolder.classList.remove(classes$r.tickerAnimated);
            textHolder.style.transform = `translate3d(${-(element.offsetLeft - parseInt(getComputedStyle(element).marginLeft, 10))}px, 0, 0)`;
          });
        }

        if (!isStopped && element) {
          tickerScale.querySelectorAll(selectors$A.tickerText).forEach((textHolder) => {
            textHolder.classList.add(classes$r.tickerAnimated);
            textHolder.removeAttribute(attributes$n.style);
          });
          tickerScale.removeAttribute(attributes$n.stop);
        }
      }

      tickerAnimationPause() {
        let hoverTimer = 0;
        let isHovered = false;
        const tickerContainer = this.barHolder.querySelector(selectors$A.announcementSlide);

        tickerContainer.addEventListener('mouseenter', () => {
          isHovered = true;

          hoverTimer = setTimeout(() => {
            if (isHovered) {
              tickerContainer.querySelectorAll(selectors$A.tickerText).forEach((element) => {
                element.style.animationPlayState = 'paused';
              });
            }

            clearTimeout(hoverTimer);
          }, 500);
        });

        tickerContainer.addEventListener('mouseleave', () => {
          isHovered = false;

          tickerContainer.querySelectorAll(selectors$A.tickerText).forEach((element) => {
            element.style.animationPlayState = 'running';
          });
        });
      }

      updateSVGClipPathIDs() {
        this.barHolder.querySelectorAll(selectors$A.slide).forEach((svg, index) => {
          const clipPath = svg.querySelector(tags.clipPath);

          if (clipPath) {
            const newclipPathId = `${clipPath.id}_${index}`;

            // Update the clipPath ID
            clipPath.id = newclipPathId;

            // Update the 'clip-path' URL reference in the <g> tag
            const gTag = svg.querySelector(`g[${attributes$n.clipPath}]`);
            if (gTag) {
              gTag.setAttribute(attributes$n.clipPath, `url(#${newclipPathId})`);
            }
          }
        });
      }

      onBlockSelect(evt) {
        const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));

        if (this.slider && this.flkty !== null) {
          this.flkty.select(index);
          this.flkty.pausePlayer();
        }
        if (!this.slider) {
          this.toggleTicker(evt, true);
        }
      }

      onBlockDeselect(evt) {
        if (this.slider && this.flkty !== null) {
          this.flkty.unpausePlayer();
        }
        if (!this.slider) {
          this.toggleTicker(evt, false);
        }
      }

      onUnload() {
        document.removeEventListener('theme:resize:width', this.initSlider.bind(this));

        if (this.tickers.length > 0) {
          this.tickers.forEach((ticker) => {
            ticker.unload();
          });
        }
      }
    }

    const announcement = {
      onLoad() {
        sections$r[this.id] = [];
        const element = this.container.querySelector(selectors$A.announcement);
        if (element) {
          sections$r[this.id].push(new AnnouncementBar(element));
        }
      },
      onBlockSelect(e) {
        if (sections$r[this.id].length) {
          sections$r[this.id].forEach((el) => {
            if (typeof el.onBlockSelect === 'function') {
              el.onBlockSelect(e);
            }
          });
        }
      },
      onBlockDeselect(e) {
        if (sections$r[this.id].length) {
          sections$r[this.id].forEach((el) => {
            if (typeof el.onBlockSelect === 'function') {
              el.onBlockDeselect(e);
            }
          });
        }
      },
      onUnload() {
        sections$r[this.id].forEach((el) => {
          if (typeof el.onUnload === 'function') {
            el.onUnload();
          }
        });
      },
    };

    register('announcement-bar', announcement);
    register('marquee', announcement);

    const selectors$z = {
      disclosureWrappper: '[data-hover-disclosure]',
      header: '[data-site-header]',
      link: '[data-top-link]',
      headerBackground: '[data-header-background]',
      navItem: '[data-nav-item]',
    };

    const classes$q = {
      isVisible: 'is-visible',
      grandparent: 'grandparent',
      headerMenuOpened: 'site-header--menu-opened',
      hasScrolled: 'has-scrolled',
      headerHovered: 'site-header--hovered',
      searchOpened: 'search-opened',
    };

    const attributes$m = {
      disclosureToggle: 'data-hover-disclosure-toggle',
      ariaHasPopup: 'aria-haspopup',
      ariaExpanded: 'aria-expanded',
      ariaControls: 'aria-controls',
    };

    let sections$q = {};

    class HoverDisclosure {
      constructor(el) {
        this.disclosure = el;
        this.header = el.closest(selectors$z.header);
        this.key = this.disclosure.id;
        this.trigger = document.querySelector(`[${attributes$m.disclosureToggle}='${this.key}']`);
        this.link = this.trigger.querySelector(selectors$z.link);
        this.grandparent = this.trigger.classList.contains(classes$q.grandparent);
        this.background = document.querySelector(selectors$z.headerBackground);
        this.trigger.setAttribute(attributes$m.ariaHasPopup, true);
        this.trigger.setAttribute(attributes$m.ariaExpanded, false);
        this.trigger.setAttribute(attributes$m.ariaControls, this.key);
        this.dropdown = this.trigger.querySelector(selectors$z.disclosureWrappper);
        this.setBackgroundHeightEvent = () => this.setBackgroundHeight();

        this.connectHoverToggle();
        this.handleTablets();
      }

      setBackgroundHeight() {
        this.hasScrolled = document.body.classList.contains(classes$q.hasScrolled);
        this.headerHeight = this.hasScrolled ? window.stickyHeaderHeight : this.header.offsetHeight;

        if (this.grandparent) {
          this.dropdown.style.height = 'auto';
          this.dropdownHeight = this.dropdown.offsetHeight + this.headerHeight;
        } else {
          this.dropdownHeight = this.headerHeight;
        }

        this.background.style.setProperty('--header-background-height', `${this.dropdownHeight}px`);

        // Hide header dropdowns on mobile
        if (window.innerWidth < theme.sizes.small) {
          this.hideDisclosure();
        }
      }

      showDisclosure() {
        this.setBackgroundHeight();
        document.addEventListener('theme:resize', this.setBackgroundHeightEvent);

        // Set accessibility and classes
        this.trigger.setAttribute(attributes$m.ariaExpanded, true);
        this.trigger.classList.add(classes$q.isVisible);
        this.header.classList.add(classes$q.headerMenuOpened);
        if (this.trigger.classList.contains(classes$q.grandparent)) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.header}));
        }
        this.updateHeaderHover();
      }

      hideDisclosure() {
        this.background.style.removeProperty('--header-background-height');
        document.removeEventListener('theme:resize', this.setBackgroundHeightEvent);

        this.trigger.classList.remove(classes$q.isVisible);
        this.trigger.setAttribute(attributes$m.ariaExpanded, false);
        this.header.classList.remove(classes$q.headerMenuOpened);
        if (!document.body.classList.contains(classes$q.searchOpened)) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }

      updateHeaderHover() {
        requestAnimationFrame(() => {
          const isHovered = this.header.matches(':hover');
          const hasHoveredClass = this.header.classList.contains(classes$q.headerHovered);

          if (isHovered && !hasHoveredClass) this.header.classList.add(classes$q.headerHovered);
        });
      }

      handleTablets() {
        // first click opens the popup, second click opens the link
        this.trigger.addEventListener('touchstart', (e) => {
          const isOpen = this.trigger.classList.contains(classes$q.isVisible);
          if (!isOpen) {
            e.preventDefault();

            // Hide the rest of the active nav items
            const activeNavItems = this.header.querySelectorAll(`.${classes$q.isVisible}${selectors$z.navItem}`);

            if (activeNavItems.length > 0) {
              activeNavItems.forEach((item) => {
                if (item !== this.trigger) {
                  item.dispatchEvent(new Event('mouseleave', {bubbles: true}));

                  const onTransitionEnd = () => {
                    requestAnimationFrame(() => {
                      this.showDisclosure();
                    });

                    item.removeEventListener('transitionend', onTransitionEnd);
                  };

                  item.addEventListener('transitionend', onTransitionEnd);
                }
              });

              return;
            }

            this.showDisclosure();
          }
        });
      }

      connectHoverToggle() {
        this.trigger.addEventListener('mouseenter', () => this.showDisclosure());
        this.link.addEventListener('focus', () => this.showDisclosure());

        this.trigger.addEventListener('mouseleave', () => this.hideDisclosure());
        this.trigger.addEventListener('focusout', (event) => {
          const inMenu = this.trigger.contains(event.relatedTarget);

          if (!inMenu) {
            this.hideDisclosure();
          }
        });
        this.disclosure.addEventListener('keyup', (event) => {
          if (event.code !== theme.keyboardKeys.ESCAPE) {
            return;
          }
          this.hideDisclosure();
        });
      }

      onBlockSelect(event) {
        if (this.disclosure.contains(event.target)) {
          this.showDisclosure(event);
        }
      }

      onBlockDeselect(event) {
        if (this.disclosure.contains(event.target)) {
          this.hideDisclosure();
        }
      }
    }

    const hoverDisclosure = {
      onLoad() {
        sections$q[this.id] = [];
        const disclosures = this.container.querySelectorAll(selectors$z.disclosureWrappper);

        disclosures.forEach((el) => {
          sections$q[this.id].push(new HoverDisclosure(el));
        });
      },
      onBlockSelect(evt) {
        sections$q[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockSelect(evt);
          }
        });
      },
      onBlockDeselect(evt) {
        sections$q[this.id].forEach((el) => {
          if (typeof el.onBlockDeselect === 'function') {
            el.onBlockDeselect(evt);
          }
        });
      },
    };

    const selectors$y = {
      header: '[data-site-header]',
      announcementBar: '[data-announcement-wrapper]',
      collectionFilters: '[data-collection-filters]',
      logoTextLink: '[data-logo-text-link]',
      mobileNavDropdownTrigger: '[data-collapsible-trigger]',
      navDrawer: '#nav-drawer',
      drawer: '[data-drawer]',
      drawerToggle: '[data-drawer-toggle]',
      popdownToggle: '[data-popdown-toggle]',
      mobileMenu: '[data-mobile-menu]',
      nav: '[data-nav]',
      navIcons: '[data-nav-icons]',
      navItem: '[data-nav-item]',
      navLinkMobile: '[data-nav-link-mobile]',
      navSearchOpen: '[data-nav-search-open]',
      wrapper: '[data-wrapper]',
      headerBackground: '[data-header-background]',
      cartPage: '[data-cart-page]',
      widthContent: '[data-takes-space]',
    };

    const classes$p = {
      jsDrawerOpenAll: ['js-drawer-open', 'js-drawer-open-cart', 'js-quick-view-visible', 'js-quick-view-from-cart'],
      headerTransparent: 'site-header--transparent',
      headerHovered: 'site-header--hovered',
      headerMenuOpened: 'site-header--menu-opened',
      hasScrolled: 'has-scrolled',
      hideHeader: 'hide-header',
      headerCompress: 'site-header--compress',
      isVisible: 'is-visible',
      isOpen: 'is-open',
      searchOpened: 'search-opened',
      noOutline: 'no-outline',
      cloneClass: 'js__header__clone',
    };

    const attributes$l = {
      navAlignment: 'data-nav-alignment',
    };

    const sections$p = {};

    class Header {
      constructor(container) {
        this.container = container;
        this.background = document.querySelector(selectors$y.headerBackground);
        this.header = container;
        this.headerSection = container.parentNode;
        this.headerWrapper = container.querySelector(selectors$y.wrapper);
        this.logoTextLink = container.querySelector(selectors$y.logoTextLink);
        this.nav = container.querySelector(selectors$y.nav);
        this.navIcons = container.querySelector(selectors$y.navIcons);
        this.headerStateEvent = (event) => this.headerState(event);
        this.handleTouchstartEvent = (event) => this.handleTouchstart(event);
        this.updateBackgroundHeightEvent = (event) => this.updateBackgroundHeight(event);

        initTransparentHeader();

        this.minWidth = this.getMinWidth();
        this.checkWidthEvent = () => this.checkWidth();
        this.listenWidth();
        this.initMobileNav();
        this.handleTextLinkLogos();
        this.initStickyHeader();
        this.handleBackgroundEvents();


        if (!document.querySelector(selectors$y.cartPage)) {
          window.cart = new CartDrawer();
        }

        document.body.addEventListener('touchstart', this.handleTouchstartEvent, {passive: true});
        this.updateHeaderHover();
      }

      updateHeaderHover() {
        requestAnimationFrame(() => {
          const isHovered = this.header.matches(':hover');
          const hasHoveredClass = this.header.classList.contains(classes$p.headerHovered);

          if (isHovered && !hasHoveredClass) this.header.classList.add(classes$p.headerHovered);
        });
      }

      handleTouchstart(event) {
        const isInHeader = this.header.contains(event.target);
        const activeNavItem = this.header.querySelector(`.${classes$p.isVisible}${selectors$y.navItem}`);

        if (!isInHeader && activeNavItem) {
          activeNavItem.dispatchEvent(new Event('mouseleave', {bubbles: true}));
        }
      }

      handleTextLinkLogos() {
        if (this.logoTextLink === null) return;

        const headerHeight = this.header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        document.documentElement.style.setProperty('--header-sticky-height', `${headerHeight}px`);
      }

      initStickyHeader() {
        this.hasScrolled = false;
        this.hasCollectionFilters = document.querySelector(selectors$y.collectionFilters);
        this.position = this.header.dataset.position;

        var displayHeader = theme.settings.showHeader;
        const shouldShowCompactHeader = displayHeader ? (this.position === 'fixed') : (this.position === 'fixed' && !this.hasCollectionFilters);
        if (shouldShowCompactHeader) {
          this.headerState();
          document.addEventListener('theme:scroll', this.headerStateEvent);
          return;
        }

        document.body.classList.remove(classes$p.hasScrolled);
        if (window.isHeaderTransparent) {
          this.header.classList.add(classes$p.headerTransparent);
        }
      }

      // Switch to "compact" header on scroll
      headerState(event) {
        const headerHeight = parseInt(this.header.dataset.height || this.header.offsetHeight);
        const announcementBar = document.querySelector(selectors$y.announcementBar);
        const announcementHeight = announcementBar ? announcementBar.offsetHeight : 0;
        const pageOffset = headerHeight + announcementHeight;
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollUp = event && event.detail && event.detail.up;

        // Show compact header when scroll down
        this.hasScrolled = currentScrollTop > pageOffset;
        document.body.classList.toggle(classes$p.hasScrolled, this.hasScrolled);

        // Hide compact header when scroll back to top
        const hideHeaderThreshold = pageOffset + window.stickyHeaderHeight;
        const bellowThreshold = currentScrollTop < hideHeaderThreshold;
        const shouldHideHeader = bellowThreshold && scrollUp;
        document.body.classList.toggle(classes$p.hideHeader, shouldHideHeader);

        if (window.isHeaderTransparent) {
          const shouldShowTransparentHeader = !this.hasScrolled || shouldHideHeader;
          this.header.classList.toggle(classes$p.headerTransparent, shouldShowTransparentHeader);
        }

        // Update header background height if users scroll the page with their mouse over the header or over an opened nav menu
        if (this.header.classList.contains(classes$p.headerHovered)) {
          const currentHeight = this.hasScrolled ? window.stickyHeaderHeight : headerHeight;
          this.background.style.setProperty('--header-background-height', `${currentHeight}px`);

          const activeNavItem = this.header.querySelector(`.${classes$p.isVisible}${selectors$y.navItem}`);
          if (activeNavItem) {
            activeNavItem.dispatchEvent(new Event('mouseenter', {bubbles: true}));
          }
        }
      }

      handleBackgroundEvents() {
        this.headerWrapper.addEventListener('mouseenter', this.updateBackgroundHeightEvent);

        this.headerWrapper.addEventListener('mouseleave', this.updateBackgroundHeightEvent);

        this.header.addEventListener('focusout', this.updateBackgroundHeightEvent);

        document.addEventListener('theme:cart:close', this.updateBackgroundHeightEvent);

        // Helps fixing Safari issues with background not being updated on search close and mouse over the header
        document.addEventListener('theme:search:close', this.updateBackgroundHeightEvent);
      }

      updateBackgroundHeight(event) {
        const isDesktop = matchMedia('(pointer:fine)').matches;
        const isFocusEnabled = !document.body.classList.contains(classes$p.noOutline);
        const isNotTabbingOnDesktop = isDesktop && !isFocusEnabled;

        if (!event) return;

        let drawersVisible = classes$p.jsDrawerOpenAll.some((popupClass) => document.body.classList.contains(popupClass));

        // Update header background height on:
        // 'mouseenter' event
        // opened Cart drawer/Quick View/Menu drawers
        if (event.type === 'mouseenter' || drawersVisible) {
          this.headerHeight = this.hasScrolled ? window.stickyHeaderHeight : this.header.offsetHeight;

          this.header.classList.add(classes$p.headerHovered);

          if (!this.header.classList.contains(classes$p.headerMenuOpened)) {
            this.background.style.setProperty('--header-background-height', `${this.headerHeight}px`);
          }
        }

        if (event.type === 'mouseenter') return;

        requestAnimationFrame(() => {
          drawersVisible = classes$p.jsDrawerOpenAll.some((popupClass) => document.body.classList.contains(popupClass));

          if (drawersVisible) return;

          // Remove header background and handle focus on:
          // 'mouseleave' event
          // 'theme:cart:close' event
          // 'theme:search:close' event
          // 'focusout' event
          // closed Cart drawer/Quick View/Menu drawers

          if (event.type === 'focusout' && !isDesktop) return;
          if (event.type === 'theme:search:close' && !isNotTabbingOnDesktop) return;
          if (this.hasScrolled) return;

          const focusOutOfHeader = document.activeElement.closest(selectors$y.header) === null;
          const isSearchOpened = document.body.classList.contains(classes$p.searchOpened);
          const headerMenuOpened = this.header.classList.contains(classes$p.headerMenuOpened);

          if (isSearchOpened || headerMenuOpened) return;

          if (event.type === 'focusout') {
            if (!focusOutOfHeader) return;
          }

          this.header.classList.remove(classes$p.headerHovered);
          this.background.style.setProperty('--header-background-height', '0px');

          if (!isFocusEnabled) {
            document.activeElement.blur();
          }
        });
      }

      listenWidth() {
        document.addEventListener('theme:resize', this.checkWidthEvent);
        this.checkWidth();
      }

      checkWidth() {
        if (window.innerWidth < this.minWidth) {
          this.header.classList.add(classes$p.headerCompress);
        } else {
          this.header.classList.remove(classes$p.headerCompress);
        }
      }

      getMinWidth() {
        const headerWrapperStyles = this.headerWrapper.currentStyle || window.getComputedStyle(this.headerWrapper);
        const headerPaddings = parseInt(headerWrapperStyles.paddingLeft) * 2;
        const comparitor = this.header.cloneNode(true);
        comparitor.classList.add(classes$p.cloneClass);
        document.body.appendChild(comparitor);
        const wideElements = comparitor.querySelectorAll(selectors$y.widthContent);
        const navAlignment = this.header.getAttribute(attributes$l.navAlignment);
        const minWidth = _sumSplitWidths(wideElements, navAlignment);

        document.body.removeChild(comparitor);

        return minWidth + wideElements.length * 20 + headerPaddings;
      }

      initMobileNav() {
        // Search popdown link
        this.mobileMenu = this.headerSection.querySelector(selectors$y.mobileMenu);
        this.navDrawer = this.headerSection.querySelector(selectors$y.navDrawer);
        this.drawerToggle = this.navDrawer.querySelector(selectors$y.drawerToggle);
        this.navSearchOpen = this.navDrawer.querySelectorAll(selectors$y.navSearchOpen);

        this.navSearchOpen?.forEach((element) => {
          element.addEventListener('click', (event) => {
            event.preventDefault();

            const drawer = this.drawerToggle.closest(`${selectors$y.drawer}.${classes$p.isOpen}`);
            const isMobile = matchMedia('(pointer:coarse)').matches;
            const popdownToggle = isMobile ? this.mobileMenu.querySelector(selectors$y.popdownToggle) : this.nav.querySelector(selectors$y.popdownToggle);

            this.drawerToggle.dispatchEvent(new Event('click', {bubbles: true}));

            const onDrawerTransitionEnd = (e) => {
              if (e.target !== drawer) return;
              requestAnimationFrame(() => popdownToggle.dispatchEvent(new Event('click', {bubbles: true})));
              drawer.removeEventListener('transitionend', onDrawerTransitionEnd);
            };

            drawer.addEventListener('transitionend', onDrawerTransitionEnd);
          });
        });

        // First item in dropdown menu
        if (theme.settings.mobileMenuBehaviour === 'link') {
          return;
        }

        const navMobileLinks = this.headerSection.querySelectorAll(selectors$y.navLinkMobile);
        if (navMobileLinks.length) {
          navMobileLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
              const hasDropdown = link.parentNode.querySelectorAll(selectors$y.mobileNavDropdownTrigger).length;
              const dropdownTrigger = link.nextElementSibling;

              if (hasDropdown) {
                e.preventDefault();
                dropdownTrigger.dispatchEvent(new Event('click'), {bubbles: true});
              }
            });
          });
        }
      }

      onUnload() {
        // Reset variables so that the proper ones are applied before saving in the Theme editor
        // Necessary only when they were previously updated in `handleTextLinkLogos()` function
        document.documentElement.style.removeProperty('--header-height');
        document.documentElement.style.removeProperty('--header-sticky-height');

        this.initStickyHeader();
        document.body.classList.remove(...classes$p.jsDrawerOpenAll);
        document.removeEventListener('theme:scroll', this.headerStateEvent);
        document.removeEventListener('theme:resize', this.checkWidthEvent);
        document.removeEventListener('theme:cart:close', this.updateBackgroundHeightEvent);
        document.removeEventListener('theme:search:close', this.updateBackgroundHeightEvent);
        document.body.removeEventListener('touchstart', this.handleTouchstartEvent);
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

        if (typeof window.cart.unload === 'function') {
          window.cart.unload();
        }
      }
    }

    function _sumSplitWidths(nodes, alignment) {
      let arr = [];
      nodes.forEach((el) => {
        arr.push(el.clientWidth);
      });
      let [logoWidth, navWidth, iconsWidth] = arr;

      // Check if nav is left and set correct width
      if (alignment === 'left') {
        const tempWidth = logoWidth;
        logoWidth = navWidth;
        navWidth = tempWidth;
      }

      if (alignment !== 'right') {
        if (logoWidth > iconsWidth) {
          iconsWidth = logoWidth;
        } else {
          logoWidth = iconsWidth;
        }
      }

      return logoWidth + navWidth + iconsWidth;
    }

    const headerSection = {
      onLoad() {
        sections$p[this.id] = new Header(this.container);
      },
      onUnload() {
        sections$p[this.id].onUnload();
      },
    };

    register('header', [headerSection, hoverDisclosure, drawer]);

    const selectors$x = {
      trigger: '[data-collapsible-trigger]',
    };

    const classes$o = {
      isExpanded: 'is-expanded',
    };

    const accordionSection = {
      onBlockSelect(e) {
        const trigger = e.target.querySelector(selectors$x.trigger);
        requestAnimationFrame(() => {
          if (!trigger.classList.contains(classes$o.isExpanded)) {
            trigger.dispatchEvent(new Event('click'));
          }
        });
      },
    };

    register('accordions', [accordionSection, collapsible]);

    const selectors$w = {
      button: '[data-share-button]',
      tooltip: '[data-share-button-tooltip]',
    };

    const classes$n = {
      visible: 'is-visible',
      hiding: 'is-hiding',
    };

    const sections$o = {};

    class ShareButton {
      constructor(container) {
        this.container = container;
        this.button = this.container.querySelector(selectors$w.button);
        this.tooltip = this.container.querySelector(selectors$w.tooltip);
        this.transitionSpeed = 200;
        this.hideTransitionTimeout = 0;
        this.init();
      }

      init() {
        if (this.button) {
          this.button.addEventListener('click', () => {
            let targetUrl = window.location.href;
            if (this.button.dataset.shareLink) {
              targetUrl = this.button.dataset.shareLink;
            }

            if (!this.tooltip.classList.contains(classes$n.visible)) {
              navigator.clipboard.writeText(targetUrl).then(() => {
                this.tooltip.classList.add(classes$n.visible);
                setTimeout(() => {
                  this.tooltip.classList.add(classes$n.hiding);
                  this.tooltip.classList.remove(classes$n.visible);

                  if (this.hideTransitionTimeout) {
                    clearTimeout(this.hideTransitionTimeout);
                  }

                  this.hideTransitionTimeout = setTimeout(() => {
                    this.tooltip.classList.remove(classes$n.hiding);
                  }, this.transitionSpeed);
                }, 1500);
              });
            }
          });
        }
      }
    }

    const shareButton = {
      onLoad() {
        sections$o[this.id] = new ShareButton(this.container);
      },
    };

    register('article', [shareButton]);

    const selectors$v = {
      videoPlay: '[data-video-play]',
    };

    const attributes$k = {
      videoPlayValue: 'data-video-play',
    };

    class VideoPlay {
      constructor(container) {
        this.container = container;
        this.videoPlay = this.container.querySelectorAll(selectors$v.videoPlay);
        this.a11y = a11y;

        this.init();
      }

      init() {
        if (this.videoPlay.length) {
          this.videoPlay.forEach((element) => {
            element.addEventListener('click', (e) => {
              if (element.hasAttribute(attributes$k.videoPlayValue) && element.getAttribute(attributes$k.videoPlayValue).trim() !== '') {
                e.preventDefault();

                const items = [
                  {
                    html: element.getAttribute(attributes$k.videoPlayValue),
                  },
                ];
                this.a11y.state.trigger = element;
                new LoadPhotoswipe(items);
              }
            });
          });
        }
      }
    }

    const videoPlay = {
      onLoad() {
        new VideoPlay(this.container);
      },
    };

    const selectors$u = {
      header: '[data-site-header]',
      main: '[data-main]',
    };

    let sections$n = {};

    class ZoomAnimation {
      constructor(container) {
        this.container = container;
        this.header = document.querySelector(selectors$u.header);

        this.init();
      }

      init() {
        if (this.container.dataset.zoomAnimation !== 'true') {
          return;
        }

        // Target element to be observed.
        const observedElement = this.container;
        const firstSection = document.body.querySelector(selectors$u.main).children[0];
        const isFirstSection = this.container.parentNode === firstSection;
        const hasTransparentHeader = this.header?.dataset.transparent == 'true';

        const renderZoomEffect = () => {
          const headerHeight = isFirstSection & hasTransparentHeader ? 0 : parseInt(this.header?.dataset.height || this.header?.offsetHeight);
          const rect = observedElement.getBoundingClientRect();
          const sectionHeight = observedElement.offsetHeight;
          const scrolled = isFirstSection ? headerHeight - rect.top : headerHeight - rect.top + window.innerHeight;
          const scrolledPercentage = scrolled / sectionHeight;
          let transitionSpeed = 0.1; // Set value between 0 and 1. Bigger value will make the zoom more aggressive
          if (isFirstSection) {
            transitionSpeed *= 1.5;
          }

          let scale = 1 + scrolledPercentage * transitionSpeed;

          // Prevent image scale down under 100%
          scale = scale > 1 ? scale : 1;
          observedElement.style.setProperty('--scale', scale);
        };

        renderZoomEffect();

        this.zoomOnScrollEvent = throttle(renderZoomEffect, 5);

        // Intersection Observer Configuration
        const observerOptions = {
          root: null,
          rootMargin: '0px', // important: needs units on all values
          threshold: 0,
        };

        // Intersection Observer Callback Function
        const intersectionCallback = (entry) => {
          if (entry[0].isIntersecting) {
            window.addEventListener('scroll', this.zoomOnScrollEvent);
          } else {
            window.removeEventListener('scroll', this.zoomOnScrollEvent);
          }
        };

        // Intersection Observer Constructor.
        const observer = new IntersectionObserver(intersectionCallback, observerOptions);

        observer.observe(observedElement);
      }

      onUnload() {
        if (this.zoomOnScrollEvent !== null) {
          window.removeEventListener('scroll', this.zoomOnScrollEvent);
        }
      }
    }

    const zoomAnimation = {
      onLoad() {
        sections$n[this.id] = new ZoomAnimation(this.container);
      },
      onUnload() {
        sections$n[this.id].onUnload();
      },
    };

    register('banner-image', [zoomAnimation, videoPlay]);

    function getWindowWidth() {
      return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    }

    function isDesktop() {
      return getWindowWidth() >= window.theme.sizes.small;
    }

    function isMobile() {
      return getWindowWidth() < window.theme.sizes.small;
    }

    const selectors$t = {
      scrollSpy: '[data-scroll-spy]',
    };

    const classes$m = {
      selected: 'is-selected',
      isFullHeight: 'is-full-height',
    };

    const attributes$j = {
      scrollSpy: 'data-scroll-spy',
      scrollSpyPrevent: 'data-scroll-spy-prevent',
      mobile: 'data-scroll-spy-mobile',
      desktop: 'data-scroll-spy-desktop',
    };

    const sections$m = {};

    class ScrollSpy {
      constructor(section, element) {
        this.container = section;
        this.element = element;

        if (!this.element) return;

        this.anchorSelector = `[${attributes$j.scrollSpy}="#${this.element.id}"]`;
        this.anchor = this.container.querySelector(this.anchorSelector);
        this.anchors = this.container.querySelectorAll(`[${attributes$j.scrollSpy}]`);

        if (!this.anchor) return;

        this.scrollCallback = () => this.onScroll();
        this.init();
      }

      init() {
        this.onScroll();
        document.addEventListener('theme:scroll', this.scrollCallback);
        document.addEventListener('theme:resize:width', this.scrollCallback);
      }

      isEligible() {
        if (this.container.hasAttribute(attributes$j.scrollSpyPrevent)) return false;

        return (
          (isMobile() && this.anchor.hasAttribute(attributes$j.mobile)) ||
          (isDesktop() && this.anchor.hasAttribute(attributes$j.desktop)) ||
          (!this.anchor.hasAttribute(attributes$j.desktop) && !this.anchor.hasAttribute(attributes$j.mobile))
        );
      }

      onScroll() {
        // Check eligibility of whether to run `onScroll()` handler
        if (!this.isEligible()) return;

        // Check element's visibility in the viewport
        this.top = this.element.getBoundingClientRect().top;
        this.bottom = this.element.getBoundingClientRect().bottom;
        const windowHeight = Math.round(window.innerHeight);
        const scrollTop = Math.round(window.scrollY);
        const scrollBottom = scrollTop + windowHeight;
        const elementOffsetTopPoint = Math.round(this.top + scrollTop);
        const elementHeight = this.element.offsetHeight;
        const elementOffsetBottomPoint = elementOffsetTopPoint + elementHeight;
        const isBottomOfElementPassed = elementOffsetBottomPoint < scrollTop;
        const isTopOfElementReached = elementOffsetTopPoint < scrollBottom;
        const isInView = isTopOfElementReached && !isBottomOfElementPassed;

        if (!isInView) return;

        // Set container classes or inline styles to help with proper sticky positon of the anchor elements parent container
        if (this.anchor.parentNode.offsetHeight <= elementHeight) {
          this.container.style.setProperty('--sticky-position', `${window.innerHeight / 2 - elementHeight / 2}px`);
        } else {
          this.container.classList.add(classes$m.isFullHeight);
        }

        // Check anchor's intersection within the element
        this.anchorTop = this.anchor.getBoundingClientRect().top;
        this.anchorBottom = this.anchor.getBoundingClientRect().bottom;
        const anchorTopPassedElementTop = this.top < this.anchorTop;
        const anchorBottomPassedElementBottom = this.bottom < this.anchorBottom;
        const shouldBeActive = anchorTopPassedElementTop && !anchorBottomPassedElementBottom;

        if (!shouldBeActive) return;

        // Update active classes
        this.anchors.forEach((anchor) => {
          if (!anchor.matches(this.anchorSelector)) {
            anchor.classList.remove(classes$m.selected);
          }
        });

        this.anchor.classList.add(classes$m.selected);
      }

      onUnload() {
        document.removeEventListener('theme:scroll', this.scrollCallback);
        document.removeEventListener('theme:resize:width', this.scrollCallback);
      }
    }

    const scrollSpy = {
      onLoad() {
        sections$m[this.id] = [];
        const elements = this.container.querySelectorAll(selectors$t.scrollSpy);

        elements.forEach((element) => {
          const scrollSpy = this.container.querySelector(element.getAttribute(attributes$j.scrollSpy));
          sections$m[this.id].push(new ScrollSpy(this.container, scrollSpy));
        });
      },
      onUnload() {
        sections$m[this.id].forEach((element) => {
          if (typeof element.onUnload === 'function') {
            element.onUnload();
          }
        });
      },
    };

    const selectors$s = {
      banner: '[data-banner]',
      sliderContent: '[data-slider-content]',
      sliderMedia: '[data-slider-media]',
      links: 'a, button',
    };

    const attributes$i = {
      index: 'data-index',
      tabIndex: 'tabindex',
      singleImage: 'data-slider-single-image',
      scrollSpyPrevent: 'data-scroll-spy-prevent',
    };

    const classes$l = {
      isSelected: 'is-selected',
    };

    const settings$1 = {
      row: 'row',
      columns: 'columns',
    };

    let sections$l = {};

    class BannerWithTextColumns {
      constructor(section) {
        this.container = section.container;
        this.sliderContent = this.container.querySelector(selectors$s.sliderContent);
        this.singleImageEnabled = this.sliderContent?.hasAttribute(attributes$i.singleImage);
        this.banners = this.container.querySelectorAll(selectors$s.banner);
        this.links = this.container.querySelectorAll('a');
        this.sliderMedia = this.container.querySelector(selectors$s.sliderMedia);
        this.flktyContent = null;
        this.flktyMedia = null;
        this.onResizeCallback = () => this.handleSlidersOnResize();

        // Initialise functionality based on the "Appearance > Row/Columns" section settings
        this.appearance = this.container.dataset.appearance;

        if (this.appearance === settings$1.columns) {
          this.handleColumnsLayout();
        } else {
          this.handleRowLayout();
        }
      }

      /**
       * Event listeners on hover, touch or keyboard tabbing, that sync the Content and Media items states
       */
      listen() {
        document.addEventListener('theme:resize:width', this.onResizeCallback);

        // A11y focusables event listener
        this.links.forEach((link) => {
          link.addEventListener('focus', () => {
            const selectedIndex = Number(link.closest(selectors$s.banner).getAttribute(attributes$i.index));

            if (window.innerWidth >= theme.sizes.small) {
              this.sync(selectedIndex);
            }
          });
        });

        this.banners.forEach((slide) => {
          // Listener for screens with mouse cursors
          slide.addEventListener('mouseenter', () => {
            const selectedIndex = Number(slide.getAttribute(attributes$i.index));

            if (window.innerWidth >= theme.sizes.small && !window.theme.touch) {
              this.sync(selectedIndex);
            }
          });

          // Listener specifically for touch devices
          slide.addEventListener('pointerup', () => {
            const selectedIndex = Number(slide.getAttribute(attributes$i.index));

            if (window.innerWidth >= theme.sizes.small && window.theme.touch) {
              this.sync(selectedIndex);
            }
          });
        });
      }

      /**
       * Functionality for "Appearance -> Columns"
       *  - grid with columns count based on section blocks count
       *  - init two sliders, one for Content, another for Media items
       *  - have a distinct flickity slider on mobile
       *  - sync sliders with fade-in/scale animations
       */
      handleColumnsLayout() {
        if (this.sliderContent.children.length <= 1) return;

        let isDraggable = window.innerWidth < window.theme.sizes.small;

        if (this.sliderMedia.children.length > 1) {
          this.flktyMedia = new Flickity(this.sliderMedia, {
            draggable: false,
            wrapAround: false,
            fade: true,
            prevNextButtons: false,
            adaptiveHeight: false,
            pageDots: false,
            setGallerySize: false,
            on: {
              change: (index) => {
                this.handleGroupItemsNavigation(index, this.flktyContent);
              },
            },
          });

          flickitySmoothScrolling(this.sliderMedia);
        }

        this.flktyContent = new Flickity(this.sliderContent, {
          draggable: isDraggable,
          prevNextButtons: false,
          pageDots: true,
          cellAlign: 'left',
          adaptiveHeight: false,
          imagesLoaded: true,
          on: {
            ready: () => {
              this.listen();
              this.slidesTabIndex();
            },
            change: (index) => {
              if (window.innerWidth < theme.sizes.small && !this.singleImageEnabled) {
                this.flktyMedia.select(index);
              }

              this.slidesTabIndex();
              this.handleGroupItemsNavigation(index, this.flktyMedia);
            },
          },
        });

        flickitySmoothScrolling(this.sliderContent);
      }

      /**
       * Functionality for "Appearance -> Row"
       *  - a row of items, spaced as much as their content allows
       *  - init a Media slider and sync Content items with it
       *  - listen for mouseover/touch events to update active states when "Show single image" settings are enabled
       *  - use fade-in and scale animations on states change
       *  - Media slider draggable events are used to change the active states on tablet
       *  - Content items active state is automatically updated based on scroll position and visibility in the viewport
       */
      handleRowLayout() {
        const isSingleMedia = this.sliderMedia.children.length <= 1;

        if (isSingleMedia || isMobile()) {
          this.updateState(0);
          this.listen();

          return;
        }

        this.initMediaSlider();
      }

      /**
       * Initialise media slider with Flickity
       */
      initMediaSlider() {
        this.flktyMedia = new Flickity(this.sliderMedia, {
          draggable: true,
          wrapAround: false,
          fade: true,
          prevNextButtons: false,
          adaptiveHeight: false,
          pageDots: false,
          setGallerySize: false,
          on: {
            ready: () => {
              this.updateState(0);
              this.listen();
            },
            change: (index) => {
              this.updateState(index);
            },
          },
        });

        flickitySmoothScrolling(this.sliderMedia);
      }

      /**
       * Handle slider sync on navigating with tabbing or using arrow keys through flickity's items group
       */
      handleGroupItemsNavigation(index, sliderToSync = null) {
        if (sliderToSync === null) return;

        requestAnimationFrame(() => {
          if (index !== sliderToSync.selectedIndex) {
            sliderToSync.select(index);
          }
        });
      }

      /**
       * Update focusables tab index on slide change
       */
      slidesTabIndex() {
        if (!this.sliderContent) return;

        const slider = Flickity.data(this.sliderContent);
        slider.cells.forEach((slide) => {
          let tabIndex = '-1';
          if (slide.element.classList.contains(classes$l.isSelected)) {
            tabIndex = '0';
          }
          slide.element.querySelectorAll(selectors$s.links).forEach((link) => {
            link.setAttribute(attributes$i.tabIndex, tabIndex);
          });
        });
      }

      /**
       * Synchronise the Content and Media items states
       */
      sync(index = 0) {
        if (this.appearance === settings$1.columns) {
          this.flktyContent.selectCell(index);
        } else {
          this.updateState(index);
        }

        if (this.flktyMedia) {
          this.flktyMedia.selectCell(index);
        }
      }

      /**
       * Update the active state, based on a selected item's index
       */
      updateState(index = 0) {
        this.banners.forEach((element) => {
          const elementIndex = Number(element.getAttribute(attributes$i.index));
          element.classList.toggle(classes$l.isSelected, elementIndex === index);
        });
      }

      /**
       * Resize or destroy sliders
       */
      handleSlidersOnResize() {
        const isLayoutRow = this.appearance === settings$1.row;

        if (isLayoutRow) {
          if (isMobile() && this.flktyMedia) {
            this.flktyMedia.destroy();
            this.flktyMedia = null;
            return;
          }

          if (isDesktop() && !this.flktyMedia) {
            this.initMediaSlider();
            return;
          }
        }

        if (this.flktyContent) {
          this.flktyContent.resize();
          this.toggleDraggable();
        }

        if (this.flktyMedia) {
          this.flktyMedia.resize();
        }
      }

      /**
       * Enable or disable dragging and flicking on initialised Flickity instances, depending on screen size
       */
      toggleDraggable() {
        this.flktyContent.options.draggable = window.innerWidth < window.theme.sizes.small;
        this.flktyContent.updateDraggable();
      }

      /**
       * Event callback for Theme Editor `shopify:block:select` event
       */
      onBlockSelect(event) {
        const selectedIndex = parseInt([...event.target.parentNode.children].indexOf(event.target));
        this.sync(selectedIndex);

        if (this.appearance === settings$1.row) {
          const target = this.sliderMedia.children[selectedIndex];
          const targetOffsetTop = Math.round(target.getBoundingClientRect().top);

          this.container.setAttribute(attributes$i.scrollSpyPrevent, '');

          setTimeout(() => scrollTo(targetOffsetTop), 400);
          setTimeout(() => this.container.removeAttribute(attributes$i.scrollSpyPrevent), 1000);
        }
      }

      /**
       * Event callback for Theme Editor `shopify:section:unload` event
       */
      onUnload() {
        document.removeEventListener('theme:resize:width', this.onResizeCallback);
      }
    }

    const BannerWithTextColumnsSection = {
      onLoad() {
        sections$l[this.id] = new BannerWithTextColumns(this);
      },
      onBlockSelect(event) {
        sections$l[this.id].onBlockSelect(event);
      },
    };

    register('banner-with-text-columns', [BannerWithTextColumnsSection, scrollSpy]);

    register('blog-posts', ajaxify);

    const selectors$r = {
      slider: '[data-slider]',
      sliderItem: '[data-slider-item]',
      sliderItemImage: '[data-media-container]',
      links: 'a, button',
      flickityButton: '.flickity-button',
    };

    const classes$k = {
      carouselInactive: 'carousel--inactive',
      carouselResize: 'carousel--resize',
    };

    const attributes$h = {
      tabIndex: 'tabindex',
    };

    const sections$k = {};

    class ColumnsWithImage {
      constructor(section) {
        this.container = section.container;
        this.slider = this.container.querySelector(selectors$r.slider);
        this.flkty = null;
        this.gutter = 0;
        this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
        this.listen();
      }

      initSlider() {
        this.slider.classList.remove(classes$k.carouselInactive);

        this.flkty = new Flickity(this.slider, {
          pageDots: false,
          cellAlign: 'left',
          groupCells: true,
          contain: true,
          on: {
            ready: () => {
              this.setSliderArrowsPosition(this.slider);
              setTimeout(() => {
                this.changeTabIndex();
                this.flkty.resize();
              }, 0);
            },
            change: () => {
              this.changeTabIndex();
            },
          },
        });

        Flickity.prototype._createResizeClass = function () {
          this.element.classList.add(classes$k.carouselResize);
        };

        Flickity.createMethods.push('_createResizeClass');

        const resize = Flickity.prototype.resize;
        Flickity.prototype.resize = function () {
          this.element.classList.remove(classes$k.carouselResize);
          resize.call(this);
          this.element.classList.add(classes$k.carouselResize);
        };
      }

      destroySlider() {
        this.slider.classList.add(classes$k.carouselInactive);

        if (this.flkty !== null) {
          this.flkty.destroy();
          this.flkty = null;
        }
      }

      checkSlidesSize() {
        const sliderItemStyle = this.container.querySelector(selectors$r.sliderItem).currentStyle || window.getComputedStyle(this.container.querySelector(selectors$r.sliderItem));
        this.gutter = parseInt(sliderItemStyle.marginRight);
        const containerWidth = this.slider.offsetWidth;
        const itemsWidth = this.getItemsWidth();
        const itemsOverflowViewport = containerWidth < itemsWidth;

        if (window.innerWidth >= theme.sizes.small && itemsOverflowViewport) {
          this.initSlider();
        } else {
          this.destroySlider();
        }
      }

      changeTabIndex() {
        const selectedElementsIndex = this.flkty.selectedIndex;

        this.flkty.slides.forEach((slide, index) => {
          slide.cells.forEach((cell) => {
            cell.element.querySelectorAll(selectors$r.links).forEach((link) => {
              link.setAttribute(attributes$h.tabIndex, selectedElementsIndex === index ? '0' : '-1');
            });
          });
        });
      }

      getItemsWidth() {
        let itemsWidth = 0;
        const slides = this.slider.querySelectorAll(selectors$r.sliderItem);
        if (slides.length) {
          slides.forEach((item) => {
            itemsWidth += item.offsetWidth + this.gutter;
          });
        }

        return itemsWidth;
      }

      listen() {
        if (this.slider) {
          this.checkSlidesSize();
          document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
        }
      }

      setSliderArrowsPosition(slider) {
        const arrows = slider.querySelectorAll(selectors$r.flickityButton);
        const image = slider.querySelector(selectors$r.sliderItemImage);

        if (arrows.length && image) {
          arrows.forEach((arrow) => {
            arrow.style.top = `${image.offsetHeight / 2}px`;
          });
        }
      }

      onBlockSelect(evt) {
        if (this.flkty !== null) {
          const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));
          const slidesPerPage = parseInt(this.flkty.slides[0].cells.length);
          const groupIndex = Math.floor(index / slidesPerPage);

          this.flkty.select(groupIndex);
        } else {
          const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
          const sliderPadding = parseInt(sliderStyle.paddingLeft);
          const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

          // Native scroll to item
          this.slider.scrollTo({
            top: 0,
            left: blockPositionLeft,
            behavior: 'smooth',
          });
        }
      }

      onUnload() {
        document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
      }
    }

    const ColumnsWithImageSection = {
      onLoad() {
        sections$k[this.id] = new ColumnsWithImage(this);
      },
      onUnload(e) {
        sections$k[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections$k[this.id].onBlockSelect(e);
      },
    };

    register('columns-with-image', [ColumnsWithImageSection, videoPlay]);

    const selectors$q = {
      formMessageClose: '[data-form-message-close]',
      formMessageWrapper: '[data-form-message]',
    };

    const classes$j = {
      hideDown: 'hide-down',
      notificationVisible: 'notification-visible',
    };

    let sections$j = {};

    class ContactForm {
      constructor(section) {
        this.container = section.container;
        this.closeButton = this.container.querySelector(selectors$q.formMessageClose);
        this.messageWrapper = this.container.querySelector(selectors$q.formMessageWrapper);

        if (this.messageWrapper) {
          this.hidePopups();
          this.closeFormMessage();
          this.autoHideMessage();
        }
      }

      hidePopups() {
        document.body.classList.add(classes$j.notificationVisible);
      }

      showPopups() {
        document.body.classList.remove(classes$j.notificationVisible);
      }

      closeFormMessage() {
        this.closeButton.addEventListener('click', this.closeMessage.bind(this));
      }

      closeMessage(e) {
        e.preventDefault();
        this.messageWrapper.classList.add(classes$j.hideDown);
        this.showPopups();
      }

      autoHideMessage() {
        setTimeout(() => {
          this.messageWrapper.classList.add(classes$j.hideDown);
          this.showPopups();
        }, 10000);
      }
    }

    const contactFormSection = {
      onLoad() {
        sections$j[this.id] = new ContactForm(this);
      },
    };

    register('contact-form', contactFormSection);

    const selectors$p = {
      time: 'time',
      days: '[data-days]',
      hours: '[data-hours]',
      minutes: '[data-minutes]',
      seconds: '[data-seconds]',
      sectionType: '[data-section-type]',
      shopifySection: '.shopify-section',
    };

    const classes$i = {
      countdownLoading: 'countdown--loading',
      countdownLoaded: 'countdown--loaded',
      countdownTimerShowMessage: 'countdown-timer--show-message',
      hideCountdown: 'hide-countdown',
    };

    const attributes$g = {
      expirationBehavior: 'data-expiration-behavior',
    };

    const settings = {
      hide: 'hide',
      showMessage: 'show-message',
    };

    class CountdownTimer extends HTMLElement {
      constructor() {
        super();

        this.section = this.closest(selectors$p.sectionType);
        this.shopifySection = this.closest(selectors$p.shopifySection);
        this.expirationBehavior = this.getAttribute(attributes$g.expirationBehavior);

        this.time = this.querySelector(selectors$p.time);
        // The string we're passing should be ISO 8601 compliant
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
        this.endDate = Date.parse(this.time.dateTime);

        this.days = this.querySelector(selectors$p.days);
        this.hours = this.querySelector(selectors$p.hours);
        this.minutes = this.querySelector(selectors$p.minutes);
        this.seconds = this.querySelector(selectors$p.seconds);

        this.daysInMs = 1000 * 60 * 60 * 24;
        this.hoursInMs = this.daysInMs / 24;
        this.minutesInMs = this.hoursInMs / 60;
        this.secondsInMs = this.minutesInMs / 60;

        this.isLoading = true;
        this.shouldHideOnComplete = this.expirationBehavior === settings.hide;
        this.shouldShowMessage = this.expirationBehavior === settings.showMessage;

        this.update = this.update.bind(this);
      }

      connectedCallback() {
        this.init();
      }

      disconnectedCallback() {
        this.stopTimer();
      }

      init() {
        if (isNaN(this.endDate)) {
          this.onComplete();
          return;
        }

        if (this.endDate <= Date.now()) {
          this.onComplete();
          return;
        }

        this.onLoad(true);

        // Update the countdown every second
        this.interval = setInterval(this.update, 1000);
      }

      stopTimer() {
        clearInterval(this.interval);
      }

      convertTime(timeInMs) {
        const days = parseInt(timeInMs / this.daysInMs, 10);
        timeInMs -= days * this.daysInMs;
        const hours = parseInt(timeInMs / this.hoursInMs, 10);
        timeInMs -= hours * this.hoursInMs;
        const minutes = parseInt(timeInMs / this.minutesInMs, 10);
        timeInMs -= minutes * this.minutesInMs;
        const seconds = parseInt(timeInMs / this.secondsInMs, 10);

        return {
          days: days,
          hours: hours,
          minutes: minutes,
          seconds: seconds,
        };
      }

      render(timer) {
        // `textContent` is used instead of `innerText` or `innerHTML` because it doesn't trigger computationally expensive reflows.
        // https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#differences_from_innertext
        this.days.textContent = timer.days;
        this.hours.textContent = timer.hours;
        this.minutes.textContent = timer.minutes;
        this.seconds.textContent = timer.seconds;
      }

      onComplete() {
        this.render({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        if (this.shouldHideOnComplete) {
          this.shopifySection.classList.add(classes$i.hideCountdown);
        }

        if (this.shouldShowMessage) {
          this.classList.add(classes$i.countdownTimerShowMessage);
        }
      }

      onLoad(init) {
        if (init) {
          this.section.classList.add(classes$i.countdownLoading);
          return;
        }
        this.section.classList.add(classes$i.countdownLoaded);
        this.isLoading = false;
      }

      update() {
        const currentDate = Date.now();
        const timeDiff = this.endDate - currentDate;

        if (timeDiff <= 0) {
          this.stopTimer();
          this.onComplete();
          return;
        }

        const remainingTime = this.convertTime(timeDiff);

        this.render(remainingTime);

        if (this.isLoading) this.onLoad(false);
      }
    }

    register('countdown', [zoomAnimation, videoPlay]);

    if (!customElements.get('countdown-timer')) {
      customElements.define('countdown-timer', CountdownTimer);
    }

    const selectors$o = {
      videoId: '[data-video-id]',
      videoPlayer: '[data-video-player]',
      videoTemplate: '[data-video-template]',
      videoAutoplay: '[data-video-autoplay]',
      videoWrapper: '[data-video-wrapper]',
      videoPlayButton: '[data-video-bg-play]',
    };

    const classes$h = {
      loading: 'is-loading',
      paused: 'is-paused',
    };

    const sections$i = {};

    class VideoBackground {
      constructor(container) {
        this.container = container;
        this.videoId = this.container.querySelector(selectors$o.videoId);
        this.videoPlayer = this.container.querySelector(selectors$o.videoPlayer);
        this.videoTemplate = this.container.querySelector(selectors$o.videoTemplate);
        this.videoPlayButton = this.container.querySelector(selectors$o.videoPlayButton);
        this.init();
      }

      init() {
        if (!this.videoId) return;

        /*
          Observe video element and pull it out from its template tag
        */
        const videoObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const videoMarkup = this.videoTemplate.innerHTML;
                this.videoPlayer.innerHTML = videoMarkup;
                this.video = this.container.querySelector(selectors$o.videoAutoplay);
                this.videoPlayer.classList.remove(classes$h.loading);
                this.container.classList.add(classes$h.paused);

                /*
                * [THEME ALTERATION]
                * UK-100
                * Addition of Video:Ready event used within custom.js file
                */
                
                document.dispatchEvent(new CustomEvent('theme:video:ready', {detail:this.container.querySelector('video')}));

                this.listen();

                // Stop observing element after it was animated
                observer.unobserve(entry.target);
              }
            });
          },
          {
            root: null,
            rootMargin: '300px',
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
          }
        );

        videoObserver.observe(this.videoPlayer);

        // Force video autoplay button
        this.videoPlayButton.addEventListener('click', (event) => {
          event.preventDefault();
          this.video?.play();
        });
      }

      listen() {
        this.video.addEventListener('play', () => {
          this.container.classList.remove(classes$h.paused);
        });

        // Force video autoplay on iOS when Low Power Mode is On
        this.container.addEventListener(
          'touchstart',
          () => {
            this.video.play();
          },
          {passive: true}
        );
      }
    }

    const videoBackground = {
      onLoad() {
        sections$i[this.id] = [];
        const videoWrappers = this.container.querySelectorAll(selectors$o.videoWrapper);
        videoWrappers.forEach((videoWrapper) => {
          sections$i[this.id].push(new VideoBackground(videoWrapper));
        });
      },
    };

    class PopupCookie {
      constructor(name, value) {
        this.configuration = {
          expires: null, // session cookie
          path: '/',
          domain: window.location.hostname,
          sameSite: 'none',
          secure: true,
        };
        this.name = name;
        this.value = value;
      }

      write() {
        const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row) => row.startsWith(this.name));
        if (hasCookie || document.cookie.indexOf('; ') === -1) {
          document.cookie = `${this.name}=${this.value}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
        }
      }

      read() {
        if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          const returnCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(this.name))
            .split('=')[1];

          return returnCookie;
        } else {
          return false;
        }
      }

      destroy() {
        if (document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          document.cookie = `${this.name}=null; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
        }
      }
    }

    const selectors$n = {
      newsletterForm: '[data-newsletter-form]',
      popup: '[data-popup]',
    };

    const classes$g = {
      success: 'has-success',
      error: 'has-error',
    };

    const attributes$f = {
      storageNewsletterFormId: 'newsletter_form_id',
    };

    const sections$h = {};

    class Newsletter {
      constructor(newsletter) {
        this.newsletter = newsletter;
        this.sessionStorage = window.sessionStorage;
        this.popup = this.newsletter.closest(selectors$n.popup);
        this.stopSubmit = true;
        this.isChallengePage = false;
        this.formID = null;
        this.formIdSuccess = null;

        this.checkForChallengePage();

        this.newsletterSubmit = (e) => this.newsletterSubmitEvent(e);

        if (!this.isChallengePage) {
          this.init();
        }
      }

      init() {
        this.newsletter.addEventListener('submit', this.newsletterSubmit);

        this.showMessage();
      }

      newsletterSubmitEvent(e) {
        if (this.stopSubmit) {
          e.preventDefault();

          this.removeStorage();
          this.writeStorage();
          this.stopSubmit = false;
          this.newsletter.submit();
        }
      }

      checkForChallengePage() {
        this.isChallengePage = window.location.pathname === theme.routes.root + 'challenge';
      }

      writeStorage() {
        if (this.sessionStorage !== undefined) {
          this.sessionStorage.setItem(attributes$f.storageNewsletterFormId, this.newsletter.id);
        }
      }

      readStorage() {
        this.formID = this.sessionStorage.getItem(attributes$f.storageNewsletterFormId);
      }

      removeStorage() {
        this.sessionStorage.removeItem(attributes$f.storageNewsletterFormId);
      }

      showMessage() {
        this.readStorage();

        if (this.newsletter.id === this.formID) {
          const newsletter = document.getElementById(this.formID);
          const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
          const submissionFailure = window.location.search.indexOf('accepts_marketing') !== -1;

          if (submissionSuccess) {
            newsletter.classList.remove(classes$g.error);
            newsletter.classList.add(classes$g.success);

            if (this.popup) {
              this.cookie = new PopupCookie(this.popup.dataset.cookieName, 'user_has_closed');
              this.cookie.write();
            }
          } else if (submissionFailure) {
            newsletter.classList.remove(classes$g.success);
            newsletter.classList.add(classes$g.error);
          }

          if (submissionSuccess || submissionFailure) {
            this.scrollToForm(newsletter);
          }
        }
      }

      /**
       * Scroll to the last submitted newsletter form
       */
      scrollToForm(newsletter) {
        const rect = newsletter.getBoundingClientRect();
        const isVisible = visibilityHelper.isElementPartiallyVisible(newsletter) || visibilityHelper.isElementTotallyVisible(newsletter);

        if (!isVisible) {
          setTimeout(() => {
            window.scrollTo({
              top: rect.top,
              left: 0,
              behavior: 'smooth',
            });
          }, 400);
        }
      }

      /**
       * Event callback for Theme Editor `section:unload` event
       */
      onUnload() {
        this.newsletter.removeEventListener('submit', this.newsletterSubmit);
      }
    }

    const newsletterSection = {
      onLoad() {
        sections$h[this.id] = [];
        const newsletters = this.container.querySelectorAll(selectors$n.newsletterForm);
        newsletters.forEach((form) => {
          sections$h[this.id].push(new Newsletter(form));
        });
      },
      onUnload() {
        sections$h[this.id].forEach((form) => {
          if (typeof form.onUnload === 'function') {
            form.onUnload();
          }
        });
      },
    };

    const selectors$m = {
      product: '[data-product]',
      productSlider: '[data-slider]',
      productSlide: '[data-slide]',
      productGridItemImage: '[data-product-media-container]',
      flickityButton: '.flickity-button',
      item: '[data-slide]',
      links: 'a, button',
    };

    const attributes$e = {
      tabIndex: 'tabindex',
    };

    const sections$g = {};

    class CustomContent {
      constructor(container) {
        this.container = container;
        this.product = this.container.querySelectorAll(selectors$m.product);
        this.productSlider = this.container.querySelectorAll(selectors$m.productSlider);
        this.checkSliderOnResize = () => this.checkSlider();
        this.resizeSliderEvent = (event) => this.resizeSlider(event);
        this.flkty = [];
        this.videoObj = [];
        this.quickViewObj = [];

        this.listen();
      }

      checkSlider() {
        if (window.innerWidth >= theme.sizes.small) {
          this.productSlider.forEach((slider) => {
            this.initProductSlider(slider);
          });
        } else {
          this.productSlider.forEach((slider) => {
            this.destroyProductSlider(slider);
          });
        }
      }

      initProductSlider(slider) {
        const slidesCount = slider.querySelectorAll(selectors$m.productSlide).length;
        const sliderId = slider.dataset.slider;

        if (slidesCount > 1) {
          if (this.flkty[sliderId] === undefined || !this.flkty[sliderId].isActive) {
            this.flkty[sliderId] = new Flickity(slider, {
              prevNextButtons: true,
              adaptiveHeight: true,
              pageDots: true,
              wrapAround: true,
              on: {
                ready: () => {
                  this.setSliderArrowsPosition(slider);
                },
                change: (index) => {
                  this.flkty[sliderId].cells.forEach((slide, i) => {
                    slide.element.querySelectorAll(selectors$m.links).forEach((link) => {
                      link.setAttribute(attributes$e.tabIndex, i === index ? '0' : '-1');
                    });
                  });
                },
              },
            });
          } else {
            this.setSliderArrowsPosition(slider);
          }
        }
      }

      destroyProductSlider(slider) {
        const sliderId = slider.dataset.slider;

        if (typeof this.flkty[sliderId] === 'object') {
          this.flkty[sliderId].destroy();
        }
      }

      setSliderArrowsPosition(slider) {
        const arrows = slider.querySelectorAll(selectors$m.flickityButton);
        const image = slider.querySelector(selectors$m.productGridItemImage);

        if (arrows.length && image) {
          arrows.forEach((arrow) => {
            arrow.style.top = `${image.offsetHeight / 2}px`;
          });
        }
      }

      resizeSlider(event) {
        const slider = event.target;
        const flkty = Flickity.data(slider) || null;

        if (!flkty) return;
        flkty.resize();
      }

      listen() {
        this.checkSlider();
        document.addEventListener('theme:resize:width', this.checkSliderOnResize);

        this.productSlider.forEach((slider) => {
          slider.addEventListener('theme:slider:resize', this.resizeSliderEvent);
        });
      }

      onUnload() {
        if (this.flkty) {
          for (const key in this.flkty) {
            if (this.flkty.hasOwnProperty(key)) {
              this.flkty[key].destroy();
            }
          }
        }

        document.removeEventListener('theme:resize:width', this.checkSliderOnResize);

        this.productSlider.forEach((slider) => {
          slider.removeEventListener('theme:slider:resize', this.resizeSliderEvent);
        });
      }
    }

    const CustomContentSection = {
      onLoad() {
        sections$g[this.id] = new CustomContent(this.container);
      },
      onUnload(e) {
        sections$g[this.id].onUnload(e);
      },
    };

    register('custom-content', [CustomContentSection, newsletterSection, videoPlay, tooltip, videoBackground, productGrid]);

    const selectors$l = {
      slider: '[data-slider]',
      sliderItem: '[data-slide]',
      productGridItemImage: '[data-product-media-container]',
      links: 'a, button',
      flickityButton: '.flickity-button',
      promo: '[data-promo]',
    };

    const classes$f = {
      carousel: 'carousel',
      carouselInactive: 'carousel--inactive',
      isLastSlideVisible: 'is-last-slide-visible',
      featuredCollection: 'featured-collection',
      promoFullWidth: 'collection-promo--full',
      promoTwoItemsWidth: 'collection-promo--two-columns',
    };

    const attributes$d = {
      sliderId: 'data-slider-id',
      showImage: 'data-slider-show-image',
      tabIndex: 'tabindex',
    };

    const sections$f = {};

    class GridSlider {
      constructor(container) {
        this.container = container;
        this.columns = parseInt(this.container.dataset.columns);
        this.sliders = this.container.querySelectorAll(selectors$l.slider);
        this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
        this.resetSliderEvent = (e) => this.resetSlider(e);
        this.resizeSliderEvent = (event) => this.resizeSlider(event);
        this.flkty = [];
        this.listen();

        this.handleLastSlideOverlayOnMobile();
      }

      initSlider(slider) {
        const sliderId = slider.getAttribute(attributes$d.sliderId);
        slider.classList.remove(classes$f.carouselInactive);

        if (this.flkty[sliderId] === undefined || !this.flkty[sliderId].isActive) {
          this.flkty[sliderId] = new Flickity(slider, {
            pageDots: isLpUsHeader,
            cellSelector: selectors$l.sliderItem,
            cellAlign: 'left',
            groupCells: true,
            contain: true,
            wrapAround: false,
            adaptiveHeight: false,
            arrowShape: {
              x0: 10,
              x1: 60,
              y1: 50,
              x2: 65,
              y2: 45,
              x3: 20
            },
            on: {
              ready: () => {
                if(isLpUsHeader) {
                  slider.querySelector('.flickity-prev-next-button.previous').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
                    <path d="M9.50059 0.5L1 9M1 9L9.50059 17.5M1 9H21" stroke="black" stroke-linecap="round"/>
                  </svg>`;
                  
                  slider.querySelector('.flickity-prev-next-button.next').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
                    <path d="M12.4994 0.5L21 9M21 9L12.4994 17.5M21 9H1" stroke="black" stroke-linecap="round"/>
                  </svg>`;
                }
                
                this.setSliderArrowsPosition(slider);
                setTimeout(() => {
                  this.changeTabIndex(slider);
                }, 0);
              },
              change: () => {
                this.changeTabIndex(slider);
              },
            },
          });

          this.handleLastSlideOverlayOnTablet(slider);
        } else {
          this.setSliderArrowsPosition(slider);
        }
      }

      destroySlider(slider) {
        const sliderId = slider.getAttribute(attributes$d.sliderId);

        if (slider.classList.contains(classes$f.carousel)) {
          slider.classList.add(classes$f.carouselInactive);
        }

        if (typeof this.flkty[sliderId] === 'object') {
          this.flkty[sliderId].destroy();
        }
      }

      // Move slides to their initial position
      resetSlider(e) {
        const slider = e.target;
        const sliderId = slider.getAttribute(attributes$d.sliderId);

        if (typeof this.flkty[sliderId] === 'object') {
          this.flkty[sliderId].select(0, false, true);
        } else {
          slider.scrollTo({
            left: 0,
            behavior: 'instant',
          });
        }
      }

      resizeSlider(event) {
        const slider = event.target;
        const flkty = Flickity.data(slider) || null;

        if (!flkty) return;
        flkty.resize();
      }

      checkSlidesSize() {
        if (this.sliders.length) {
          this.sliders.forEach((slider) => {
            const columns = this.columns;
            const isDesktop = window.innerWidth >= theme.sizes.large;
            const isTablet = window.innerWidth >= theme.sizes.small && window.innerWidth < theme.sizes.large;
            const slides = slider.querySelectorAll(selectors$l.sliderItem);
            let itemsCount = slides.length;
            const promos = slider.querySelectorAll(selectors$l.promo);

            // If there are promos in the grid with different width
            if (promos.length && isDesktop) {
              promos.forEach((promo) => {
                if (promo.classList.contains(classes$f.promoFullWidth)) {
                  itemsCount += columns - 1;
                } else if (promo.classList.contains(classes$f.promoTwoItemsWidth)) {
                  itemsCount += 1;
                }
              });
            }

            // If tab collection has show image enabled
            if (slider.hasAttribute(attributes$d.showImage)) {
              itemsCount += 1;
            }

            if ((isDesktop && itemsCount > columns) || (isTablet && itemsCount > 2)) {
              this.initSlider(slider);
            } else {
              this.destroySlider(slider);
            }
          });
        }
      }

      changeTabIndex(slider) {
        const sliderId = slider.getAttribute(attributes$d.sliderId);
        const selectedElementsIndex = this.flkty[sliderId].selectedIndex;

        this.flkty[sliderId].slides.forEach((slide, index) => {
          slide.cells.forEach((cell) => {
            cell.element.querySelectorAll(selectors$l.links).forEach((link) => {
              link.setAttribute(attributes$d.tabIndex, selectedElementsIndex === index ? '0' : '-1');
            });
          });
        });
      }

      setSliderArrowsPosition(slider) {
        const arrows = slider.querySelectorAll(selectors$l.flickityButton);
        const image = slider.querySelector(selectors$l.productGridItemImage);

        if (arrows.length && image) {
          arrows.forEach((arrow) => {
            arrow.style.top = `${image.offsetHeight / 2}px`;
          });
        }
      }

      handleLastSlideOverlayOnTablet(slider) {
        const sliderId = slider.getAttribute(attributes$d.sliderId);

        this.flkty[sliderId].on('select', () => {
          const isTablet = window.innerWidth >= theme.sizes.small && window.innerWidth < theme.sizes.large;

          if (!isTablet) return;

          const selectedIndex = this.flkty[sliderId].selectedIndex;
          const sliderGroups = this.flkty[sliderId].slides.length - 1;
          const isLastSliderGroup = sliderGroups === selectedIndex;

          slider.parentNode.classList.toggle(classes$f.isLastSlideVisible, isLastSliderGroup);
        });
      }

      handleLastSlideOverlayOnMobile() {
        this.sliders.forEach((slider) => {
          slider.addEventListener('scroll', (event) => {
            const isMobile = window.innerWidth < theme.sizes.small;

            if (!isMobile) return;

            const offsetWidth = event.target.offsetWidth;
            const lastSlide = Array.from(slider.children).pop();
            const rect = lastSlide.getBoundingClientRect();
            const isLastSlideVisible = rect.left + 80 < offsetWidth; // 80px is enough to negate the small visible part of the slide on the right

            slider.parentNode.classList.toggle(classes$f.isLastSlideVisible, isLastSlideVisible);
          });
        });
      }

      listen() {
        if (this.sliders.length) {
          this.checkSlidesSize();
          document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);

          this.sliders.forEach((slider) => {
            slider.addEventListener('theme:tab:change', this.resetSliderEvent);
            slider.addEventListener('theme:slider:resize', this.resizeSliderEvent);
          });
        }
      }

      /**
       * Event callback for Theme Editor `section:block:select` event
       */
      onBlockSelect(evt) {
        const slider = evt.target.closest(selectors$l.slider);
        const flkty = Flickity.data(slider) || null;

        if (!slider) {
          return;
        }

        let parent = evt.target.parentNode;
        let target = evt.target;

        if (this.container.classList.contains(classes$f.featuredCollection)) {
          // In Featured collection section the shopify block attributes are on inner element
          parent = parent.parentNode;
          target = target.parentNode;
        }

        if (flkty !== null && flkty.isActive) {
          const index = parseInt([...parent.children].indexOf(target));
          const slidesPerPage = parseInt(flkty.slides[0].cells.length);
          const groupIndex = Math.floor(index / slidesPerPage);

          flkty.select(groupIndex);
        } else {
          const sliderStyle = slider.currentStyle || window.getComputedStyle(slider);
          const sliderPadding = parseInt(sliderStyle.paddingLeft);
          const blockPositionLeft = target.offsetLeft - sliderPadding;

          // Native scroll to item
          slider.scrollTo({
            top: 0,
            left: blockPositionLeft,
            behavior: 'smooth',
          });
        }
      }

      /**
       * Event callback for Theme Editor `section:unload` event
       */
      onUnload() {
        if (this.flkty) {
          for (const key in this.flkty) {
            if (this.flkty.hasOwnProperty(key)) {
              this.flkty[key].destroy();
            }
          }
        }

        document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);

        if (this.sliders.length) {
          this.sliders.forEach((slider) => {
            slider.removeEventListener('theme:tab:change', this.resetSliderEvent);
            slider.removeEventListener('theme:slider:resize', this.resizeSliderEvent);
          });
        }
      }
    }

    const gridSlider = {
      onLoad() {
        sections$f[this.id] = [];
        const els = this.container.querySelectorAll(selectors$l.slider);
        els.forEach((el) => {
          sections$f[this.id].push(new GridSlider(this.container));
        });
      },
      onUnload() {
        sections$f[this.id].forEach((el) => {
          if (typeof el.onUnload === 'function') {
            el.onUnload();
          }
        });
      },
      onBlockSelect(e) {
        sections$f[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockSelect(e);
          }
        });
      },
    };

    register('featured-collection', [productGrid, tooltip, gridSlider]);

    register('featured-video', [videoPlay, videoBackground]);

    const selectors$k = {
      shopPayWrapper: '[data-shop-pay-wrapper]',
      shopLoginButton: 'shop-login-button',
      shopFollowButton: 'shop-follow-button',
      followOnShopButton: 'follow-on-shop-button',
      heartIcon: 'heart-icon',
      shopLogo: 'shop-logo',
    };

    const sections$e = {};

    class ShopPayLink {
      constructor(container) {
        this.container = container;
        this.shopPayWrapper = document.querySelector(selectors$k.shopPayWrapper);
        this.shopLoginButton = document.querySelector(selectors$k.shopLoginButton);

        this.init();
      }

      init() {
        if (!this.shopLoginButton || !this.shopPayWrapper) return;

        const bgColor = this.shopPayWrapper.dataset.bg || 'transparent';
        const textColor = this.shopPayWrapper.dataset.text || '#fff';
        const hoverColor = this.shopPayWrapper.dataset.hover || '#fff';

        this.mainButtonStyles = `
      :host {
        --bg-color: ${bgColor};
        --text-color: ${textColor};
        --hover-color: ${hoverColor};
      }

      .follow-icon-wrapper:before {
        background: var(--bg-color);
        border-color: var(--text-color);
        transition: border 0.3s ease;
      }

      .button:not(.button--following):focus-visible .follow-icon-wrapper:before,
      .button:not(.button--following):hover .follow-icon-wrapper:before {
        background: var(--bg-color);
        border-color: var(--hover-color);
      }

      .button {
        background: transparent;
        color: var(--text-color);
      }

      .following-text {
        color: var(--text-color);
      }

      .button--following:focus-visible,
      .button--following:hover {
        background: var(--bg-color);
      }

      .button:not(.button--following):focus-visible .follow-icon-wrapper:before,
      .button:not(.button--following):hover .follow-icon-wrapper:before {
        background: var(--bg-color);
        border-color: var(--hover-color);
      }
    `;

        this.svgIconsStyles = `
      :host {
        color: ${textColor};
      }
    `;

        customElements.whenDefined(selectors$k.shopLoginButton).then((res) => {
          requestAnimationFrame(() => {
            const shadowRoot1 = this.shopLoginButton.shadowRoot;
            const shopFollowButton = shadowRoot1?.querySelector(selectors$k.shopFollowButton);
            const shadowRoot2 = shopFollowButton?.shadowRoot;
            const followOnShopButton = shadowRoot2?.querySelector(selectors$k.followOnShopButton);
            const shadowRoot3 = followOnShopButton?.shadowRoot;

            if (shadowRoot3) this.overwriteStyles(shadowRoot3.host.shadowRoot, this.mainButtonStyles);

            const heartIcon = shadowRoot3.querySelector(selectors$k.heartIcon);
            const shadowRoot4 = heartIcon?.shadowRoot;
            const shopLogo = shadowRoot3.querySelector(selectors$k.shopLogo);
            const shadowRoot5 = shopLogo?.shadowRoot;

            if (shadowRoot4) this.overwriteStyles(shadowRoot4.host.shadowRoot, this.svgIconsStyles);
            if (shadowRoot5) this.overwriteStyles(shadowRoot5.host.shadowRoot, this.svgIconsStyles);
          });
        });
      }

      overwriteStyles(element, styles) {
        let style = document.createElement('style');
        style.innerHTML = styles;
        element.appendChild(style);
      }
    }

    const shopPayLink = {
      onLoad() {
        sections$e[this.id] = new ShopPayLink(this.container);
      },
    };

    const selectors$j = {
      trigger: '[data-collapsible-trigger-mobile]',
    };

    const classes$e = {
      isExpanded: 'is-expanded',
    };

    const footerAccordionSection = {
      onBlockSelect(e) {
        const trigger = e.target.querySelector(selectors$j.trigger);
        requestAnimationFrame(() => {
          if (trigger && !trigger.classList.contains(classes$e.isExpanded)) {
            trigger.dispatchEvent(new Event('click'));
          }
        });
      },
      onBlockDeselect(e) {
        const trigger = e.target.querySelector(selectors$j.trigger);
        requestAnimationFrame(() => {
          if (trigger && trigger.classList.contains(classes$e.isExpanded)) {
            trigger.dispatchEvent(new Event('click'));
          }
        });
      },
    };

    register('footer', [popoutSection, newsletterSection, collapsible, footerAccordionSection, shopPayLink]);

    const selectors$i = {
      slider: '[data-slider]',
    };

    let sections$d = {};

    class IconsRow {
      constructor(section) {
        this.container = section.container;
        this.slider = this.container.querySelector(selectors$i.slider);
      }

      onBlockSelect(evt) {
        const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
        const sliderPadding = parseInt(sliderStyle.paddingLeft);
        const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

        this.slider.scrollTo({
          top: 0,
          left: blockPositionLeft,
          behavior: 'smooth',
        });
      }
    }

    const iconsRowSection = {
      onLoad() {
        sections$d[this.id] = new IconsRow(this);
      },
      onBlockSelect(e) {
        sections$d[this.id].onBlockSelect(e);
      },
    };

    register('icons-row', iconsRowSection);

    const selectors$h = {
      item: '[data-accordion-item]',
      button: '[data-accordion-button]',
    };

    const classes$d = {
      isExpanded: 'is-expanded',
    };

    const sections$c = {};

    class ImageAccordions {
      constructor(section) {
        this.container = section.container;
        this.imageAccordionsItems = this.container.querySelectorAll(selectors$h.item);
        this.buttons = this.container.querySelectorAll(selectors$h.button);
        this.accordionExpandEvent = (item) => this.accordionExpand(item);
        this.accordionFocusEvent = (item) => this.accordionFocus(item);

        this.init();
      }

      init() {
        this.imageAccordionsItems.forEach((item) => {
          item.addEventListener('mouseenter', this.accordionExpandEvent.bind(this, item));
        });

        this.buttons.forEach((button) => {
          button.addEventListener('focusin', this.accordionFocusEvent.bind(this, button));
        });
      }

      accordionExpand(item) {
        if (!item.classList.contains(classes$d.isExpanded)) {
          this.imageAccordionsItems.forEach((item) => {
            item.classList.remove(classes$d.isExpanded);
          });
          item.classList.add(classes$d.isExpanded);
        }
      }

      accordionFocus(button) {
        button.closest(selectors$h.item).dispatchEvent(new Event('mouseenter'));
      }

      onBlockSelect(evt) {
        const element = evt.target;
        if (element) {
          element.dispatchEvent(new Event('mouseenter'));
        }
      }
    }

    const imageAccordionsSection = {
      onLoad() {
        sections$c[this.id] = new ImageAccordions(this);
      },
      onBlockSelect(evt) {
        sections$c[this.id].onBlockSelect(evt);
      },
    };

    register('image-accordions', imageAccordionsSection);

    register('image-with-text', videoPlay);

    register('list-collections', gridSlider);

    const sections$b = {};

    const selectors$g = {
      slider: '[data-slider-gallery]',
      sliderNav: '[data-slider-info]',
      item: '[data-slide-item]',
    };

    class Locations {
      constructor(section) {
        this.container = section.container;
        this.slider = this.container.querySelector(selectors$g.slider);
        this.sliderNav = this.container.querySelector(selectors$g.sliderNav);

        this.initSlider();
      }

      initSlider() {
        const slidesCount = this.container.querySelectorAll(selectors$g.item).length;
        let flkty = Flickity.data(this.slider) || null;
        let flktyNav = Flickity.data(this.sliderNav) || null;

        if (slidesCount <= 1) {
          return;
        }

        flkty = new Flickity(this.slider, {
          fade: true,
          wrapAround: true,
          adaptiveHeight: true,
          prevNextButtons: false,
          pageDots: false,
        });

        // iOS smooth scrolling fix
        flickitySmoothScrolling(this.slider);

        flktyNav = new Flickity(this.sliderNav, {
          fade: true,
          wrapAround: true,
          imagesLoaded: true,
          asNavFor: this.slider,
          prevNextButtons: true,
          pageDots: false,
        });

        // Trigger text change on image move/drag
        flktyNav.on('change', () => {
          flkty.selectCell(flktyNav.selectedIndex);
        });

        // Trigger text change on image move/drag
        flkty.on('change', () => {
          flktyNav.selectCell(flkty.selectedIndex);
        });
      }

      onBlockSelect(evt) {
        const flkty = Flickity.data(this.slider) || null;
        const flktyNav = Flickity.data(this.sliderNav) || null;
        const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));

        if (flkty !== null) {
          flkty.select(index);
        }
        if (flktyNav !== null) {
          flktyNav.select(index);
        }
      }
    }

    const LocationsSection = {
      onLoad() {
        sections$b[this.id] = new Locations(this);
      },
      onBlockSelect(e) {
        sections$b[this.id].onBlockSelect(e);
      },
    };

    register('locations', LocationsSection);

    const sections$a = {};

    const selectors$f = {
      slider: '[data-slider]',
      sliderItem: '[data-slide-item]',
      pointer: '[data-pointer]',
      productGridItemImage: '[data-product-media-container]',
      quickViewItemHolder: '[data-quick-view-item-holder]',
      flickityButton: '.flickity-button',
      links: 'a, button',
      tooltip: '[data-tooltip]',
    };

    const attributes$c = {
      pointer: 'data-pointer',
      hotspot: 'data-hotspot',
      tabIndex: 'tabindex',
    };

    const classes$c = {
      productGridItemImageHover: 'product-grid-item__image--hovered',
      pointerSelected: 'pointer--selected',
      isSelected: 'is-selected',
      isActive: 'is-active',
      popupOpen: 'pswp--open',
    };

    class Look {
      constructor(container) {
        this.container = container;
        this.slider = this.container.querySelector(selectors$f.slider);
        this.slides = this.container.querySelectorAll(selectors$f.sliderItem);
        this.pointers = this.container.querySelectorAll(selectors$f.pointer);
        this.flkty = null;
        this.observer = null;

        this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
        this.resizeSliderEvent = (event) => this.resizeSlider(event);
        this.pointersInit = (event) => this.dotPointers(event);
        this.pointersOver = (event) => this.dotPointerIn(event);
        this.pointersOut = (event) => this.dotPointerOut(event);

        this.debouncedBlockSelectCallback = debounce((event) => this.debouncedBlockSelect(event), 500);

        this.quickViewPopup = new QuickViewPopup(this.container);
        this.listen();
      }

      listen() {
        if (this.slider) {
          this.checkSlidesSize();
          document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
          this.slider.addEventListener('theme:slider:resize', this.resizeSliderEvent);
        }

        if (this.pointers.length > 0) {
          this.pointers.forEach((pointer) => {
            pointer.addEventListener('click', this.pointersInit);
            pointer.addEventListener('mouseover', this.pointersOver);
            pointer.addEventListener('mouseleave', this.pointersOut);
          });
        }
      }

      checkSlidesSize() {
        const isDesktop = window.innerWidth >= theme.sizes.small;

        this.initTooltips();

        if (isDesktop) {
          if (this.slides.length > 2) {
            this.initSlider();
          } else {
            this.destroySlider();
            this.slidesTabIndex();
          }

          return;
        }

        if (!isDesktop && this.slides.length > 1) {
          this.initSlider();

          return;
        }

        this.destroySlider();
      }

      initTooltips() {
        this.tooltips = this.container.querySelectorAll(selectors$f.tooltip);
        this.tooltips.forEach((tooltip) => {
          new Tooltip(tooltip);
        });
      }

      initSlider() {
        if (this.flkty === null) {
          this.flkty = new Flickity(this.slider, {
            prevNextButtons: true,
            wrapAround: true,
            adaptiveHeight: false,
            cellAlign: 'left',
            groupCells: false,
            contain: true,
            on: {
              ready: () => {
                this.slidesTabIndex();
                this.setSliderArrowsPosition();
                this.dotPointers();
              },
              change: () => {
                this.slidesTabIndex();
                this.dotPointers();
              },
            },
          });

          return;
        }

        this.setSliderArrowsPosition();
      }

      setSliderArrowsPosition() {
        const isDesktop = window.innerWidth >= theme.sizes.small;

        if (!isDesktop) return;

        const arrows = this.slider.querySelectorAll(selectors$f.flickityButton);
        const image = this.slider.querySelector(selectors$f.productGridItemImage);

        if (arrows.length && image) {
          arrows.forEach((arrow) => {
            arrow.style.top = `${image.offsetHeight / 2}px`;
          });
        }
      }

      slidesTabIndex() {
        if (this.slides.length < 3) {
          this.slider.querySelectorAll(selectors$f.links).forEach((link) => {
            link.setAttribute(attributes$c.tabIndex, '0');
          });

          return;
        }

        const slider = Flickity.data(this.slider);

        slider.cells.forEach((slide) => {
          let tabIndex = '-1';
          if (slide.element.classList.contains(classes$c.isSelected)) {
            tabIndex = '0';
          }

          slide.element.querySelectorAll(selectors$f.links).forEach((link) => {
            link.setAttribute(attributes$c.tabIndex, tabIndex);
          });
        });
      }

      destroySlider() {
        if (typeof this.flkty === 'object' && this.flkty !== null) {
          this.flkty.destroy();
          this.flkty = null;
        }
      }

      resizeSlider(event) {
        const slider = event.target;
        const flkty = Flickity.data(slider) || null;

        if (!flkty) return;
        flkty.resize();
      }

      dotPointers(event) {
        if (this.pointers.length === 0) return;

        this.pointers.forEach((button) => {
          button.classList.remove(classes$c.pointerSelected);
        });

        if (event) {
          const dotIndex = event.target.getAttribute(attributes$c.pointer);

          this.flkty?.select(dotIndex);

          return;
        }

        const slideIndex = this.flkty == null ? 0 : this.flkty.selectedIndex;

        if (slideIndex >= 0) {
          this.pointers[slideIndex].classList.add(classes$c.pointerSelected);
        }
      }

      dotPointerIn(event) {
        const dotIndex = event.target.getAttribute(attributes$c.pointer);
        const image = this.slides[dotIndex].querySelector(selectors$f.productGridItemImage);
        const isTouch = matchMedia('(pointer:coarse)').matches;
        const isMobile = window.innerWidth < theme.sizes.small;
        if (!isMobile && !isTouch) {
          this.observeImage(image);
        }

        this.pointers.forEach((pointer) => {
          pointer.style.setProperty('--look-animation', 'none');
        });
      }

      dotPointerOut(event) {
        const dotIndex = event.target.getAttribute(attributes$c.pointer);
        const image = this.slides[dotIndex].querySelector(selectors$f.productGridItemImage);
        image.classList.remove(classes$c.productGridItemImageHover);
        image.dispatchEvent(new Event('mouseleave'));
        if (this.observer) {
          this.observer.disconnect();
        }

        this.pointers.forEach((pointer) => {
          pointer.style.removeProperty('--look-animation');
        });
      }

      observeImage(image) {
        this.observer = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              const target = entry.target;
              const outsideWrapper = entry.intersectionRatio == 0;

              if (!outsideWrapper) {
                target.dispatchEvent(new Event('mouseenter'));
                target.classList.add(classes$c.productGridItemImageHover);
              }
            });
          },
          {
            root: this.slider,
            threshold: [0.95, 1],
          }
        );
        this.observer.observe(image);
      }

      triggerClick(target) {
        requestAnimationFrame(() => target.dispatchEvent(new Event('click')));
      }

      destroyQuickViewPopup() {
        const pswpElement = this.quickViewPopup?.loadPhotoswipe?.pswpElement;
        if (!pswpElement) return;
        if (pswpElement.classList.contains(classes$c.popupOpen)) {
          this.quickViewPopup.loadPhotoswipe.popup.close();
        }
      }

      /**
       * Event callback for Theme Editor `shopify:block:select` event
       * The timeouts here are necessary for issues with selecting blocks from one `Shop the look` section to another
       */
      onBlockSelect(event) {
        this.debouncedBlockSelectCallback(event);
      }

      debouncedBlockSelect(event) {
        const pswpElement = this.quickViewPopup?.loadPhotoswipe?.pswpElement;

        // No popup element
        if (!pswpElement) {
          setTimeout(() => this.triggerClick(event.target), 400);
          return;
        }

        setTimeout(() => {
          // Popup initialized
          if (pswpElement.classList.contains(classes$c.popupOpen)) {
            // Popup opened
            const holder = this.quickViewPopup.loadPhotoswipe.pswpElement.querySelector(`[${attributes$c.hotspot}="${event.target.getAttribute(attributes$c.hotspot)}"]`);
            const quickViewItemHolders = this.quickViewPopup.loadPhotoswipe.pswpElement.querySelectorAll(selectors$f.quickViewItemHolder);

            holder.classList.add(classes$c.isActive);

            quickViewItemHolders.forEach((element) => {
              if (element !== holder) {
                element.classList.remove(classes$c.isActive);
              }
            });
          } else {
            // Popup closed
            this.triggerClick(event.target);
          }
        });
      }

      /**
       * Event callback for Theme Editor `shopify:section:unload` event
       */
      onUnload() {
        this.destroyQuickViewPopup();
        document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);

        if (this.slider) {
          this.slider.removeEventListener('theme:slider:resize', this.resizeSliderEvent);
        }
      }

      /**
       * Event callback for Theme Editor `shopify:section:deselect` event
       */
      onDeselect() {
        this.destroyQuickViewPopup();
      }
    }

    const lookSection = {
      onLoad() {
        sections$a[this.id] = new Look(this.container);
      },
      onUnload() {
        sections$a[this.id].onUnload();
      },
      onBlockSelect(event) {
        sections$a[this.id].onBlockSelect(event);
      },
      onDeselect() {
        sections$a[this.id].onDeselect();
      },
    };

    register('look', [lookSection]);

    const selectors$e = {
      grid: '[data-grid]',
    };

    const mosaicSection = {
      onBlockSelect(e) {
        const grid = e.target.closest(selectors$e.grid);
        const wrapperStyle = grid.currentStyle || window.getComputedStyle(grid);
        const wrapperPadding = parseInt(wrapperStyle.paddingLeft);
        const blockPositionLeft = e.target.offsetLeft - wrapperPadding;

        // Native scroll to item
        grid.scrollTo({
          top: 0,
          left: blockPositionLeft,
          behavior: 'smooth',
        });
      },
    };

    register('mosaic', mosaicSection);

    register('newsletter', newsletterSection);

    register('overlapping-images', videoPlay);

    const selectors$d = {
      toggleAdmin: '[data-toggle-admin]',
      toggleNewsletter: '[data-toggle-newsletter]',
      adminForm: '[data-form-admin]',
      newsletterForm: '[data-form-newsletter]',
    };

    let sections$9 = {};

    class Password {
      constructor(section) {
        this.container = section.container;
        this.toggleAdmin = this.container.querySelector(selectors$d.toggleAdmin);
        this.toggleNewsletter = this.container.querySelector(selectors$d.toggleNewsletter);
        this.adminForm = this.container.querySelector(selectors$d.adminForm);
        this.newsletterForm = this.container.querySelector(selectors$d.newsletterForm);
        this.adminErrors = this.adminForm.querySelector('.errors');
        this.newsletterErrors = this.newsletterForm.querySelector('.errors');

        this.init();
      }

      init() {
        this.toggleAdmin.addEventListener('click', (e) => {
          e.preventDefault();
          this.showPasswordForm();
        });

        this.toggleNewsletter.addEventListener('click', (e) => {
          e.preventDefault();
          this.hidePasswordForm();
        });

        if (window.location.hash == '#login' || this.adminErrors) {
          this.showPasswordForm();
        } else {
          this.hidePasswordForm();
        }
      }

      showPasswordForm() {
        showElement(this.adminForm);
        hideElement(this.newsletterForm);
        window.location.hash = '#login';
      }

      hidePasswordForm() {
        showElement(this.newsletterForm);
        hideElement(this.adminForm);
        window.location.hash = '';
      }
    }

    const passwordSection = {
      onLoad() {
        sections$9[this.id] = new Password(this);
      },
    };

    register('password-template', passwordSection);

    const selectors$c = {
      largePromo: '[data-large-promo]',
      largePromoInner: '[data-large-promo-inner]',
      tracking: '[data-tracking-consent]',
      trackingInner: '[data-tracking-consent-inner]',
      trackingAccept: '[data-confirm-cookies]',
      popupBar: '[data-popup-bar]',
      popupBarHolder: '[data-popup-bar-holder]',
      popupBarToggle: '[data-popup-bar-toggle]',
      popupBody: '[data-popup-body]',
      popupClose: '[data-popup-close]',
      popupUnderlay: '[data-popup-underlay]',
      newsletterForm: '[data-newsletter-form]',
    };

    const attributes$b = {
      cookieName: 'data-cookie-name',
      targetReferrer: 'data-target-referrer',
      preventScrollLock: 'data-prevent-scroll-lock',
    };

    const classes$b = {
      success: 'has-success',
      error: 'has-error',
      selected: 'selected',
      hasBlockSelected: 'has-block-selected',
      expanded: 'popup--expanded',
      visible: 'popup--visible',
      mobile: 'mobile',
      desktop: 'desktop',
      popupBar: 'popup--bar',
      barIsVisible: 'popup-bar-is-visible',
    };

    let sections$8 = {};
    let scrollLockTimer = 0;
    let activePopups = 0;
    let popups = [];

    class DelayShow {
      constructor(popupContainer, popup) {
        this.popupContainer = popupContainer;
        this.popup = popup;
        this.popupBody = popup.querySelector(selectors$c.popupBody);
        this.delay = popupContainer.dataset.popupDelay;
        this.isSubmitted = window.location.href.indexOf('accepts_marketing') !== -1 || window.location.href.indexOf('customer_posted=true') !== -1;
        this.a11y = a11y;
        this.showPopupOnScrollEvent = () => this.showPopupOnScroll();

        if (this.delay === 'always' || this.isSubmitted) {
          this.always();
        }

        if (this.delay && this.delay.includes('delayed') && !this.isSubmitted) {
          const seconds = this.delay.includes('_') ? parseInt(this.delay.split('_')[1]) : 10;
          this.delayed(seconds);
        }

        if (this.delay === 'bottom' && !this.isSubmitted) {
          this.bottom();
        }

        if (this.delay === 'idle' && !this.isSubmitted) {
          this.idle();
        }
      }

      always() {
        this.showPopup();
      }

      delayed(seconds = 10) {
        setTimeout(() => {
          // Show popup after specific seconds
          this.showPopup();
        }, seconds * 1000);
      }

      // Scroll to the bottom of the page
      bottom() {
        document.addEventListener('theme:scroll', this.showPopupOnScrollEvent);
      }

      // Idle for 1 min
      idle() {
        const isTargetValid = this.checkPopupTarget() === true;
        if (!isTargetValid) {
          return;
        }

        let timer = 0;
        let idleTime = 60000;
        const documentEvents = ['mousemove', 'mousedown', 'click', 'touchmove', 'touchstart', 'touchend', 'keydown', 'keypress'];
        const windowEvents = ['load', 'resize', 'scroll'];

        const startTimer = () => {
          timer = setTimeout(() => {
            timer = 0;
            this.showPopup();
          }, idleTime);

          documentEvents.forEach((eventType) => {
            document.addEventListener(eventType, resetTimer);
          });

          windowEvents.forEach((eventType) => {
            window.addEventListener(eventType, resetTimer);
          });
        };

        const resetTimer = () => {
          if (timer) {
            clearTimeout(timer);
          }

          documentEvents.forEach((eventType) => {
            document.removeEventListener(eventType, resetTimer);
          });

          windowEvents.forEach((eventType) => {
            window.removeEventListener(eventType, resetTimer);
          });

          startTimer();
        };

        startTimer();
      }

      showPopup() {
        // Push every popup in array, so we can focus the next one, after closing each
        const popupElement = {id: this.popup.id, body: this.popupBody};
        popups.push(popupElement);

        const isTargetValid = this.checkPopupTarget() === true;

        if (isTargetValid) {
          activePopups += 1;
          this.popup.classList.add(classes$b.visible);
          if (this.popup.classList.contains(classes$b.popupBar)) {
            document.body.classList.add(classes$b.barIsVisible);
          }

          this.a11y.trapFocus({
            container: this.popupBody,
          });

          // The scroll is not locking if data-prevent-scroll-lock is added to the Popup container
          if (this.popup.hasAttribute(attributes$b.preventScrollLock)) {
            return false;
          }

          this.scrollLock();
        }
      }

      checkPopupTarget() {
        const targetMobile = this.popup.parentNode.classList.contains(classes$b.mobile);
        const targetDesktop = this.popup.parentNode.classList.contains(classes$b.desktop);

        if ((targetMobile && window.innerWidth >= theme.sizes.small) || (targetDesktop && window.innerWidth < theme.sizes.small)) {
          return false;
        } else {
          return true;
        }
      }

      scrollLock() {
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popupBody}));
      }

      showPopupOnScroll() {
        if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
          this.showPopup();
          document.removeEventListener('theme:scroll', this.showPopupOnScrollEvent);
        }
      }

      onUnload() {
        document.removeEventListener('theme:scroll', this.showPopupOnScrollEvent);
      }
    }

    class TargetReferrer {
      constructor(el) {
        this.popupContainer = el;
        this.locationPath = location.href;

        if (!this.popupContainer.hasAttribute(attributes$b.targetReferrer)) {
          return false;
        }

        if (this.locationPath.indexOf(this.popupContainer.getAttribute(attributes$b.targetReferrer)) === -1 && !window.Shopify.designMode) {
          this.popupContainer.parentNode.removeChild(this.popupContainer);
        }
      }
    }

    class LargePopup {
      constructor(el) {
        this.popupContainer = el;
        this.popup = this.popupContainer.querySelector(selectors$c.largePromoInner);
        this.popupBody = this.popup.querySelector(selectors$c.popupBody);
        this.popupId = this.popup.id;
        this.close = this.popup.querySelector(selectors$c.popupClose);
        this.underlay = this.popup.querySelector(selectors$c.popupUnderlay);
        this.form = this.popup.querySelector(selectors$c.newsletterForm);
        this.cookie = new PopupCookie(this.popupContainer.dataset.cookieName, 'user_has_closed');
        this.isTargeted = new TargetReferrer(this.popupContainer);
        this.a11y = a11y;

        this.init();
      }

      init() {
        const cookieExists = this.cookie.read() !== false;

        if (!cookieExists || window.Shopify.designMode) {
          if (!window.Shopify.designMode) {
            new DelayShow(this.popupContainer, this.popup);
          } else {
            this.showPopup();
          }

          if (this.form) {
            setTimeout(() => {
              if (this.form.classList.contains(classes$b.success)) {
                this.showPopupIfNoCookie();
                activePopups -= 1;
              }
            });
          }

          this.initClosers();
        }
      }

      checkPopupTarget() {
        const targetMobile = this.popup.parentNode.classList.contains(classes$b.mobile);
        const targetDesktop = this.popup.parentNode.classList.contains(classes$b.desktop);

        if ((targetMobile && window.innerWidth >= theme.sizes.small) || (targetDesktop && window.innerWidth < theme.sizes.small)) {
          return false;
        } else {
          return true;
        }
      }

      showPopupIfNoCookie() {
        this.showPopup();
      }

      initClosers() {
        this.close.addEventListener('click', this.closePopup.bind(this));
        this.underlay.addEventListener('click', this.closePopup.bind(this));
        this.popupContainer.addEventListener('keyup', (event) => {
          if (event.code === theme.keyboardKeys.ESCAPE) {
            this.closePopup(event);
          }
        });
      }

      closePopup(event) {
        event.preventDefault();
        this.hidePopup();
        this.cookie.write();
      }

      scrollLock() {
        this.resetScrollUnlock();
        this.a11y.trapFocus({
          container: this.popupBody,
        });
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popupBody}));
      }

      scrollUnlock() {
        this.resetScrollUnlock();

        // Unlock scrollbar after popup animation completes
        scrollLockTimer = setTimeout(() => {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }, 300);
      }

      resetScrollUnlock() {
        if (scrollLockTimer) {
          clearTimeout(scrollLockTimer);
        }
      }

      showPopup() {
        const isTargetValid = this.checkPopupTarget() === true;
        const popupElement = {id: this.popupId, body: this.popup};
        popups.push(popupElement);
        if (isTargetValid) {
          activePopups += 1;
          this.popup.classList.add(classes$b.visible);
          this.scrollLock();
        }
      }

      hidePopup() {
        this.popup.classList.remove(classes$b.visible);
        const popupIndex = popups.findIndex((x) => x.id === this.popupId);
        activePopups -= 1;
        popups.splice(popupIndex, 1);

        if (activePopups == 1 && document.body.classList.contains(classes$b.barIsVisible)) {
          this.scrollUnlock();
        } else if (activePopups < 1) {
          this.scrollUnlock();
          this.a11y.removeTrapFocus();
        } else if (popups.length > 0) {
          const nextPopup = popups[popups.length - 1].body;
          this.a11y.trapFocus({
            container: nextPopup,
          });
        }
      }

      onBlockSelect(evt) {
        if (this.popupContainer.contains(evt.target) && !this.popup.classList.contains(classes$b.visible)) {
          this.popup.classList.add(classes$b.selected);
          this.popupContainer.classList.add(classes$b.hasBlockSelected);
          this.showPopup();
        }
      }

      onBlockDeselect(evt) {
        if (this.popupContainer.contains(evt.target)) {
          this.popup.classList.remove(classes$b.selected);
          this.popupContainer.classList.remove(classes$b.hasBlockSelected);
          this.hidePopup();
        }
      }

      onUnload() {
        this.scrollUnlock();
      }

      onDeselect() {
        this.popup.classList.remove(classes$b.selected);
        this.popupContainer.classList.remove(classes$b.hasBlockSelected);
        this.hidePopup();
      }
    }

    class Tracking {
      constructor(el) {
        this.popupContainer = el;
        this.popup = this.popupContainer.querySelector(selectors$c.trackingInner);
        this.popupId = this.popup.id;
        this.close = this.popup.querySelector(selectors$c.popupClose);
        this.acceptButton = this.popup.querySelector(selectors$c.trackingAccept);
        this.enable = this.popupContainer.dataset.enable === 'true';
        this.a11y = a11y;

        window.Shopify.loadFeatures(
          [
            {
              name: 'consent-tracking-api',
              version: '0.1',
            },
          ],
          (error) => {
            if (error) {
              throw error;
            }

            const userCanBeTracked = window.Shopify.customerPrivacy.userCanBeTracked();
            const userTrackingConsent = window.Shopify.customerPrivacy.getTrackingConsent();

            this.enableTracking = !userCanBeTracked && userTrackingConsent === 'no_interaction' && this.enable;

            if (window.Shopify.designMode) {
              this.enableTracking = true;
            }

            this.init();
          }
        );
      }

      init() {
        if (this.enableTracking) {
          this.showPopup();
        }

        this.clickEvents();
      }

      clickEvents() {
        this.close.addEventListener('click', (event) => {
          event.preventDefault();

          window.Shopify.customerPrivacy.setTrackingConsent(false, () => this.hidePopup());
        });

        this.acceptButton.addEventListener('click', (event) => {
          event.preventDefault();

          window.Shopify.customerPrivacy.setTrackingConsent(true, () => this.hidePopup());
        });

        document.addEventListener('trackingConsentAccepted', () => {
          console.log('trackingConsentAccepted event fired');
        });
      }

      showPopup() {
        const popupElement = {id: this.popupId, body: this.popup};
        popups.push(popupElement);
        this.popup.classList.add(classes$b.visible);
        this.a11y.trapFocus({
          container: this.popup,
        });
      }

      hidePopup() {
        this.popup.classList.remove(classes$b.visible);
        const popupIndex = popups.findIndex((x) => x.id === this.popupId);
        popups.splice(popupIndex, 1);

        if (activePopups < 1) {
          this.a11y.removeTrapFocus();
        } else if (popups.length > 0) {
          const nextPopup = popups[popups.length - 1].body;
          this.a11y.trapFocus({
            container: nextPopup,
          });
        }
      }

      onBlockSelect(evt) {
        if (this.popupContainer.contains(evt.target) && this.enableTracking && !this.popup.classList.contains(classes$b.visible)) {
          this.showPopup();
          this.popup.classList.add(classes$b.selected);
          this.popup.parentNode.classList.add(classes$b.hasBlockSelected);
        }
      }

      onBlockDeselect(evt) {
        if (this.popupContainer.contains(evt.target)) {
          this.popup.classList.remove(classes$b.selected);
          this.popupContainer.classList.remove(classes$b.hasBlockSelected);
          this.hidePopup();
        }
      }

      onDeselect() {
        this.popup.classList.remove(classes$b.selected);
        this.popupContainer.classList.remove(classes$b.hasBlockSelected);
        this.hidePopup();
      }
    }

    class PopupBar {
      constructor(el) {
        this.popupContainer = el;
        this.popup = this.popupContainer.querySelector(selectors$c.popupBarHolder);
        this.popupBody = this.popup.querySelector(selectors$c.popupBody);
        this.popupId = this.popup.id;
        this.close = this.popup.querySelector(selectors$c.popupClose);
        this.underlay = this.popup.querySelector(selectors$c.popupUnderlay);
        this.toggle = this.popup.querySelector(selectors$c.popupBarToggle);
        this.cookie = new PopupCookie(this.popupContainer.dataset.cookieName, 'user_has_closed');
        this.form = this.popup.querySelector(selectors$c.newsletterForm);
        this.isTargeted = new TargetReferrer(this.popupContainer);
        this.a11y = a11y;

        this.init();
      }

      init() {
        const cookieExists = this.cookie.read() !== false;

        if (!cookieExists || window.Shopify.designMode) {
          if (!window.Shopify.designMode) {
            new DelayShow(this.popupContainer, this.popup);
          } else {
            this.showPopup();
          }

          this.initPopupToggleButton();
          this.initClosers();

          if (this.form) {
            setTimeout(() => {
              if (this.form.classList.contains(classes$b.success)) {
                this.showPopupIfNoCookie();
              }

              if (this.form.classList.contains(classes$b.error)) {
                // Expand popup if form has error
                this.toggle.dispatchEvent(new Event('click'));
              }
            });
          }
        }
      }

      checkPopupTarget() {
        const targetMobile = this.popup.parentNode.classList.contains(classes$b.mobile);
        const targetDesktop = this.popup.parentNode.classList.contains(classes$b.desktop);

        if ((targetMobile && window.innerWidth >= theme.sizes.small) || (targetDesktop && window.innerWidth < theme.sizes.small)) {
          return false;
        } else {
          return true;
        }
      }

      showPopupIfNoCookie() {
        this.showPopup();
        this.toggle.dispatchEvent(new Event('click'));
      }

      initPopupToggleButton() {
        this.toggle.addEventListener('click', (event) => {
          event.preventDefault();

          this.popup.classList.toggle(classes$b.expanded);

          if (this.popup.classList.contains(classes$b.expanded)) {
            this.scrollLock();
          } else {
            this.scrollUnlock();
          }
        });
      }

      showPopup() {
        const popupElement = {id: this.popupId, body: this.popup};
        popups.push(popupElement);
        this.a11y.trapFocus({
          container: this.popupBody,
        });
        const isTargetValid = this.checkPopupTarget() === true;
        if (isTargetValid) {
          activePopups += 1;
          document.body.classList.add(classes$b.barIsVisible);
          this.popup.classList.add(classes$b.visible);
        }
      }

      hidePopup() {
        this.popup.classList.remove(classes$b.visible);
        document.body.classList.remove(classes$b.barIsVisible);
        const popupIndex = popups.findIndex((x) => x.id === this.popupId);
        popups.splice(popupIndex, 1);

        if (activePopups >= 1) {
          activePopups -= 1;
        }

        if (activePopups < 1) {
          this.scrollUnlock();
          this.a11y.removeTrapFocus();
        } else if (popups.length > 0) {
          const nextPopup = popups[popups.length - 1].body;
          this.a11y.trapFocus({
            container: nextPopup,
          });
        }
      }

      initClosers() {
        this.close.addEventListener('click', this.closePopup.bind(this));
        this.underlay.addEventListener('click', () => this.toggle.dispatchEvent(new Event('click')));
        this.popupContainer.addEventListener('keyup', (event) => {
          if (event.code === theme.keyboardKeys.ESCAPE) {
            this.popup.classList.remove(classes$b.expanded);
            this.scrollUnlock();
          }
        });
      }

      closePopup(event) {
        event.preventDefault();

        this.cookie.write();
        this.hidePopup();
      }

      scrollLock() {
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popupBody}));
      }

      scrollUnlock() {
        this.resetScrollUnlock();

        // Unlock scrollbar after popup animation completes
        scrollLockTimer = setTimeout(() => {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }, 300);
      }

      resetScrollUnlock() {
        if (scrollLockTimer) {
          clearTimeout(scrollLockTimer);
        }
      }

      onBlockSelect(evt) {
        if (this.popupContainer.contains(evt.target) && !this.popup.classList.contains(classes$b.visible)) {
          this.showPopup();
          this.popup.classList.add(classes$b.expanded);
          this.popup.classList.add(classes$b.selected);
          this.popup.parentNode.classList.add(classes$b.hasBlockSelected);
          this.resetScrollUnlock();
          this.scrollLock();
        }
      }

      onBlockDeselect(evt) {
        if (this.popupContainer.contains(evt.target)) {
          this.popup.classList.remove(classes$b.expanded);
          this.popup.classList.remove(classes$b.selected);
          this.popup.parentNode.classList.remove(classes$b.hasBlockSelected);
          this.hidePopup();
        }
      }

      onUnload() {
        this.scrollUnlock();
      }

      onDeselect() {
        this.popup.classList.remove(classes$b.expanded);
        this.popup.classList.remove(classes$b.selected);
        this.popup.parentNode.classList.remove(classes$b.hasBlockSelected);
        this.hidePopup();
      }
    }

    const popupSection = {
      onLoad() {
        sections$8[this.id] = [];

        if (window.Shopify.designMode) {
          activePopups = 0;
        }

        const popupsLarge = this.container.querySelectorAll(selectors$c.largePromo);
        if (popupsLarge.length) {
          popupsLarge.forEach((el) => {
            sections$8[this.id].push(new LargePopup(el));
          });
        }

        const popupBars = this.container.querySelectorAll(selectors$c.popupBar);
        if (popupBars.length) {
          popupBars.forEach((el) => {
            sections$8[this.id].push(new PopupBar(el));
          });
        }

        const cookiesPopups = this.container.querySelectorAll(selectors$c.tracking);
        if (cookiesPopups.length) {
          cookiesPopups.forEach((el) => {
            sections$8[this.id].push(new Tracking(el));
          });
        }
      },
      onDeselect() {
        sections$8[this.id].forEach((el) => {
          if (typeof el.onDeselect === 'function') {
            el.onDeselect();
          }
        });
      },
      onBlockSelect(evt) {
        sections$8[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockSelect(evt);
          }
        });
      },
      onBlockDeselect(evt) {
        sections$8[this.id].forEach((el) => {
          if (typeof el.onBlockDeselect === 'function') {
            el.onBlockDeselect(evt);
          }
        });
      },
      onUnload(evt) {
        sections$8[this.id].forEach((el) => {
          if (typeof el.onUnload === 'function') {
            el.onUnload(evt);
          }
        });
      },
    };

    register('popups', [popupSection, newsletterSection]);

    const selectors$b = {
      pressItems: '[data-press-items]',
      logoSlider: '[data-logo-slider]',
      logoSlide: '[data-logo-slide]',
      links: 'a, button',
    };

    const attributes$a = {
      logoSlide: 'data-logo-index',
      tabIndex: 'tabindex',
    };

    let sections$7 = {};

    class Press {
      constructor(section) {
        this.container = section.container;
        this.slider = this.container.querySelector(selectors$b.pressItems);
        this.sliderNav = this.container.querySelector(selectors$b.logoSlider);
        this.sliderResizeEvent = () => this.checkSlides();

        this.initSlider();
        this.checkSlides();

        window.addEventListener('load', this.resizeSlider.bind(this));
        document.addEventListener('theme:resize:width', this.sliderResizeEvent);
      }

      checkSlides() {
        const containerWidth = this.container.offsetWidth;
        const slides = this.container.querySelectorAll(selectors$b.logoSlide);
        const sliderNav = Flickity.data(this.sliderNav) || null;

        if (sliderNav !== null) {
          sliderNav.options.draggable = false;
          sliderNav.options.wrapAround = false;
          sliderNav.options.contain = true;

          if (this.getSlidesWidth() > containerWidth && slides.length > 2) {
            sliderNav.options.draggable = true;
            sliderNav.options.wrapAround = true;
            sliderNav.options.contain = false;
          }
          sliderNav.resize();
          sliderNav.updateDraggable();
        }
      }

      getSlidesWidth() {
        const slides = this.container.querySelectorAll(selectors$b.logoSlide);
        let slidesTotalWidth = 0;

        if (slides.length) {
          slides.forEach((slide) => {
            slidesTotalWidth += slide.offsetWidth;
          });
        }
        return slidesTotalWidth;
      }

      /* Init slider */
      initSlider() {
        let flkty = Flickity.data(this.slider) || null;
        let flktyNav = Flickity.data(this.sliderNav) || null;
        const duration = parseInt(this.container.dataset.duration);
        const autoplay = this.container.dataset.autoplay === 'true' ? duration : false;

        flkty = new Flickity(this.slider, {
          fade: true,
          wrapAround: true,
          adaptiveHeight: true,
          prevNextButtons: false,
          pageDots: false,
          autoPlay: autoplay,
        });

        flktyNav = new Flickity(this.sliderNav, {
          draggable: false,
          wrapAround: false,
          contain: true,
          imagesLoaded: true,
          asNavFor: this.slider,
          prevNextButtons: false,
          adaptiveHeight: false,
          pageDots: false,
          on: {
            ready: () => {
              const slides = this.container.querySelectorAll(selectors$b.logoSlide);
              slides.forEach((slide) => {
                // Change slide text on logo change for a11y reasons
                slide.addEventListener('keyup', (event) => {
                  if (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER || event.code === theme.keyboardKeys.SPACE) {
                    const selectedIndex = Number(slide.getAttribute(attributes$a.logoSlide));
                    flkty.selectCell(selectedIndex);
                  }
                });
              });
            },
          },
        });

        // iOS smooth scrolling fix
        flickitySmoothScrolling(this.slider);
        flickitySmoothScrolling(this.sliderNav);

        // Trigger text change on image move/drag
        flktyNav.on('change', (index) => {
          flkty.selectCell(index);
        });

        // Trigger text change on image move/drag
        flkty.on('change', (index) => {
          flktyNav.selectCell(index);

          flkty.cells.forEach((slide, i) => {
            slide.element.querySelectorAll(selectors$b.links).forEach((link) => {
              link.setAttribute(attributes$a.tabIndex, i === index ? '0' : '-1');
            });
          });
        });
      }

      // slider height fix on window load
      resizeSlider() {
        const hasSlider = Flickity.data(this.slider);

        if (hasSlider) {
          hasSlider.resize();
        }
      }

      onBlockSelect(event) {
        const slider = Flickity.data(this.slider) || null;
        const sliderNav = Flickity.data(this.sliderNav) || null;
        const index = parseInt([...event.target.parentNode.children].indexOf(event.target));

        if (slider !== null) {
          slider.select(index);
          slider.pausePlayer();
        }

        if (sliderNav !== null) {
          sliderNav.select(index);
        }
      }

      onBlockDeselect() {
        const slider = Flickity.data(this.slider) || null;
        const autoplay = this.container.dataset.autoplay === 'true';

        if (autoplay && slider !== null) {
          slider.playPlayer();
        }
      }

      onUnload() {
        document.removeEventListener('theme:resize:width', this.sliderResizeEvent);
      }
    }

    const pressSection = {
      onLoad() {
        sections$7[this.id] = new Press(this);
      },
      onUnload(e) {
        sections$7[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections$7[this.id].onBlockSelect(e);
      },
      onBlockDeselect() {
        sections$7[this.id].onBlockDeselect();
      },
    };

    register('press', pressSection);

    const selectors$a = {
      slideshow: '[data-product-single-media-slider]',
      productInfo: '[data-product-info]',
      headerSticky: '[data-header-sticky]',
      headerHeight: '[data-header-height]',
    };

    const classes$a = {
      sticky: 'is-sticky',
    };

    const attributes$9 = {
      stickyEnabled: 'data-sticky-enabled',
    };

    window.theme.variables = {
      productPageSticky: false,
    };

    const sections$6 = {};

    class ProductSticky {
      constructor(section) {
        this.container = section.container;
        this.stickyEnabled = this.container.getAttribute(attributes$9.stickyEnabled) === 'true';
        this.productInfo = this.container.querySelector(selectors$a.productInfo);
        this.stickyScrollTop = 0;
        this.scrollLastPosition = 0;
        this.stickyDefaultTop = 0;
        this.currentPoint = 0;
        this.defaultTopBottomSpacings = 30;
        this.scrollTop = window.scrollY;
        this.scrollDirectionDown = true;
        this.requestAnimationSticky = null;
        this.stickyFormLoad = true;
        this.stickyFormLastHeight = null;
        this.onChangeCounter = 0;
        this.scrollEvent = (e) => this.scrollEvents(e);
        this.resizeEvent = (e) => this.resizeEvents(e);

        this.init();
      }

      init() {
        if (this.stickyEnabled) {
          this.stickyScrollCheck();

          document.addEventListener('theme:resize', this.resizeEvent);
        }

        this.initSticky();
      }

      initSticky() {
        if (theme.variables.productPageSticky) {
          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());

          this.productInfo.addEventListener('theme:form:sticky', (e) => {
            this.removeAnimationFrame();

            this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
          });

          document.addEventListener('theme:scroll', this.scrollEvent);
        }
      }

      scrollEvents(e) {
        if (e.detail !== null) {
          this.scrollTop = e.detail.position;
          this.scrollDirectionDown = e.detail.down;
        }

        if (!this.requestAnimationSticky) {
          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());
        }
      }

      resizeEvents() {
        this.stickyScrollCheck();

        document.removeEventListener('theme:scroll', this.scrollEvent);

        this.initSticky();
      }

      stickyScrollCheck() {
        const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const isDesktop = windowWidth >= window.theme.sizes.large;
        const targetProductInfo = this.container.querySelector(selectors$a.productInfo);

        if (!targetProductInfo) return;

        if (isDesktop) {
          const productInfo = this.container.querySelector(selectors$a.productInfo);
          const slideshow = this.container.querySelector(selectors$a.slideshow);

          if (!productInfo || !slideshow) return;
          const productCopyHeight = productInfo.offsetHeight;
          const productImagesHeight = slideshow.offsetHeight;

          // Is the product form and description taller than window space
          // Is also shorter than the window and images
          if (productCopyHeight < productImagesHeight) {
            theme.variables.productPageSticky = true;
            targetProductInfo.classList.add(classes$a.sticky);
          } else {
            theme.variables.productPageSticky = false;
            targetProductInfo.classList.remove(classes$a.sticky);
          }
        } else {
          theme.variables.productPageSticky = false;
          targetProductInfo.classList.remove(classes$a.sticky);
        }
      }

      calculateStickyPosition(e = null) {
        const eventExist = Boolean(e && e.detail);
        const isAccordion = Boolean(eventExist && e.detail.element && e.detail.element === 'accordion');
        const productInfoHeight = this.productInfo.offsetHeight;
        const heightDifference = window.innerHeight - productInfoHeight - this.defaultTopBottomSpacings;
        const scrollDifference = Math.abs(this.scrollTop - this.scrollLastPosition);

        if (this.scrollDirectionDown) {
          this.stickyScrollTop -= scrollDifference;
        } else {
          this.stickyScrollTop += scrollDifference;
        }

        if (this.stickyFormLoad) {
          if (document.querySelector(selectors$a.headerSticky) && document.querySelector(selectors$a.headerHeight)) {
            this.stickyDefaultTop = parseInt(document.querySelector(selectors$a.headerHeight).getBoundingClientRect().height);
          } else {
            this.stickyDefaultTop = this.defaultTopBottomSpacings;
          }

          this.stickyScrollTop = this.stickyDefaultTop;
        }

        this.stickyScrollTop = Math.min(Math.max(this.stickyScrollTop, heightDifference), this.stickyDefaultTop);

        const differencePoint = this.stickyScrollTop - this.currentPoint;
        this.currentPoint = this.stickyFormLoad ? this.stickyScrollTop : this.currentPoint + differencePoint * 0.5;

        this.productInfo.style.setProperty('--sticky-top', `${this.currentPoint}px`);

        this.scrollLastPosition = this.scrollTop;
        this.stickyFormLoad = false;

        if (
          (isAccordion && this.onChangeCounter <= 10) ||
          (isAccordion && this.stickyFormLastHeight !== productInfoHeight) ||
          (this.stickyScrollTop !== this.currentPoint && this.requestAnimationSticky)
        ) {
          if (isAccordion) {
            this.onChangeCounter += 1;
          }

          if (isAccordion && this.stickyFormLastHeight !== productInfoHeight) {
            this.onChangeCounter = 11;
          }

          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
        } else if (this.requestAnimationSticky) {
          this.removeAnimationFrame();
        }

        this.stickyFormLastHeight = productInfoHeight;
      }

      removeAnimationFrame() {
        if (this.requestAnimationSticky) {
          cancelAnimationFrame(this.requestAnimationSticky);
          this.requestAnimationSticky = null;
          this.onChangeCounter = 0;
        }
      }

      onUnload() {
        if (this.stickyEnabled) {
          document.removeEventListener('theme:resize', this.resizeEvent);
        }

        if (theme.variables.productPageSticky) {
          document.removeEventListener('theme:scroll', this.scrollEvent);
        }
      }
    }

    const productStickySection = {
      onLoad() {
        sections$6[this.id] = new ProductSticky(this);
      },
      onUnload() {
        sections$6[this.id].onUnload();
      },
    };

    const selectors$9 = {
      mediaContainer: '[data-product-single-media-group]',
      productMediaSlider: '[data-product-single-media-slider]',
      zoomWrapper: '[data-zoom-wrapper]',
    };

    const classes$9 = {
      popupClass: 'pswp-zoom-gallery',
      popupClassNoThumbs: 'pswp-zoom-gallery--single',
      isMoving: 'is-moving',
    };

    const attributes$8 = {
      dataImageWidth: 'data-image-width',
      dataImageHeight: 'data-image-height',
    };

    class Zoom {
      constructor(container) {
        this.container = container;
        this.mediaContainer = this.container.querySelector(selectors$9.mediaContainer);
        this.slider = this.container.querySelector(selectors$9.productMediaSlider);
        this.zoomWrappers = this.container.querySelectorAll(selectors$9.zoomWrapper);
        this.zoomEnable = this.mediaContainer.dataset.gallery === 'true';
        this.a11y = a11y;

        if (this.zoomEnable) {
          this.init();
        }
      }

      init() {
        if (this.zoomWrappers.length) {
          this.zoomWrappers.forEach((element, i) => {
            element.addEventListener('click', (e) => {
              e.preventDefault();

              const isMoving = this.slider && this.slider.classList.contains(classes$9.isMoving);

              if (!isMoving) {
                this.a11y.state.trigger = element;
                this.createZoom(i);
              }
            });
          });
        }
      }

      createZoom(indexImage) {
        const instance = this;
        let items = [];
        let counter = 0;

        this.zoomWrappers.forEach((elementImage) => {
          const imgSrc = elementImage.getAttribute('href');
          const imgWidth = parseInt(elementImage.getAttribute(attributes$8.dataImageWidth));
          const imgHeight = parseInt(elementImage.getAttribute(attributes$8.dataImageHeight));

          items.push({
            src: imgSrc,
            w: imgWidth,
            h: imgHeight,
            msrc: imgSrc,
          });

          counter += 1;
          if (instance.zoomWrappers.length === counter) {
            let popupClass = `${classes$9.popupClass}`;

            if (counter === 1) {
              popupClass = `${classes$9.popupClass} ${classes$9.popupClassNoThumbs}`;
            }
            const options = {
              barsSize: {top: 60, bottom: 60},
              history: false,
              focus: false,
              index: indexImage,
              mainClass: popupClass,
              showHideOpacity: true,
              showAnimationDuration: 250,
              hideAnimationDuration: 250,
              closeOnScroll: false,
              closeOnVerticalDrag: false,
              captionEl: false,
              closeEl: true,
              closeElClasses: ['caption-close'],
              tapToClose: false,
              clickToCloseNonZoomable: false,
              maxSpreadZoom: 2,
              loop: true,
              spacing: 0,
              allowPanToNext: true,
              pinchToClose: false,
            };

            new LoadPhotoswipe(items, options);
          }
        });
      }
    }

    const selectors$8 = {
      complementaryProducts: '[data-complementary-products]',
      buttonQuickView: '[data-button-quick-view]',
    };

    const attributes$7 = {
      url: 'data-url',
    };

    class ComplementaryProducts extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        const handleIntersection = (entries, observer) => {
          if (!entries[0].isIntersecting) return;
          observer.unobserve(this);

          if (this.hasAttribute(attributes$7.url) && this.getAttribute(attributes$7.url) !== '') {
            fetch(this.getAttribute(attributes$7.url))
              .then((response) => response.text())
              .then((text) => {
                const html = document.createElement('div');
                html.innerHTML = text;
                const recommendations = html.querySelector(selectors$8.complementaryProducts);

                if (recommendations && recommendations.innerHTML.trim().length) {
                  this.innerHTML = recommendations.innerHTML;
                }

                if (html.querySelector(selectors$8.buttonQuickView)) {
                  new QuickViewPopup(this);
                }
              })
              .catch((e) => {
                console.error(e);
              });
          }
        };

        new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 400px 0px'}).observe(this);
      }
    }

    const selectors$7 = {
      recipientCheckbox: '[data-recipient-checkbox]',
      recipientEmail: '[data-recipient-email]',
      recipientName: '[data-recipient-name]',
      recipientMessage: '[data-recipient-message]',
      recipientSendOn: '[data-recipient-send-on]',
      recipientControl: '[data-recipient-control]',
      recipientOffset: '[data-recipient-offset]',
      productForm: '[data-product-form]',
      cartDrawer: '[data-cart-drawer]',
    };

    const classes$8 = {
      quickViewVisible: 'js-quick-view-visible',
    };

    class RecipientForm extends HTMLElement {
      constructor() {
        super();
        this.recipientCheckbox = this.querySelector(selectors$7.recipientCheckbox);
        this.recipientControl = this.querySelector(selectors$7.recipientControl);
        this.recipientControl.disabled = true;
        this.recipientEmail = this.querySelector(selectors$7.recipientEmail);
        this.recipientName = this.querySelector(selectors$7.recipientName);
        this.recipientMessage = this.querySelector(selectors$7.recipientMessage);
        this.recipientSendOn = this.querySelector(selectors$7.recipientSendOn);
        this.recipientOffset = this.querySelector(selectors$7.recipientOffset);
        if (this.recipientOffset) this.recipientOffset.value = new Date().getTimezoneOffset();
        this.cartDrawer = document.querySelector(selectors$7.cartDrawer);

        this.onChangeEvent = (event) => this.onChange(event);
        this.onCartAddedEvent = () => this.onCartAdded();
      }

      connectedCallback() {
        if (!this.recipientCheckbox) return;

        this.disableInputFields();

        this.recipientCheckbox.addEventListener('change', this.onChangeEvent);
        document.addEventListener('theme:cart:added', this.onCartAddedEvent);
      }

      onChange(event) {
        if (!event.target.checked) {
          this.clearInputFields();
          this.disableInputFields();
          return;
        }

        this.enableInputFields();
      }

      onCartAdded() {
        const scrollToPosition = this.closest(selectors$7.productForm).offsetTop;
        const isQuickBuyForm = document.body.classList.contains(classes$8.quickViewVisible);
        const isRecipientFormActive = this.recipientCheckbox.checked === true;

        if (!isRecipientFormActive) return;

        if (!isQuickBuyForm) {
          // Scroll to the top position of the Product form to prevent layout shift when Recipient form fields are hidden
          window.scrollTo({
            top: scrollToPosition,
            left: 0,
            behavior: 'smooth',
          });
        }

        // Hide Recipient form fields when Cart Drawer's opening animation is completed
        const onCartDrawerTransitionEnd = (event) => {
          if (event.target !== this.cartDrawer) return;

          requestAnimationFrame(() => {
            this.recipientCheckbox.checked = false;
            this.recipientCheckbox.dispatchEvent(new Event('change'));
          });

          this.cartDrawer.removeEventListener('transitionend', onCartDrawerTransitionEnd);
        };

        this.cartDrawer.addEventListener('transitionend', onCartDrawerTransitionEnd);
      }

      inputFields() {
        return [this.recipientEmail, this.recipientName, this.recipientMessage, this.recipientSendOn];
      }

      disableableFields() {
        return [...this.inputFields(), this.recipientOffset];
      }

      clearInputFields() {
        this.inputFields().forEach((field) => (field.value = ''));
      }

      enableInputFields() {
        this.disableableFields().forEach((field) => (field.disabled = false));
      }

      disableInputFields() {
        this.disableableFields().forEach((field) => (field.disabled = true));
      }

      disconnectedCallback() {
        this.recipientCheckbox.removeEventListener('change', this.onChangeEvent);
        document.removeEventListener('theme:cart:added', this.onCartAddedEvent);
      }
    }

    const selectors$6 = {
      option: '[data-option]',
      popout: '[data-popout]',
      productMediaSlider: '[data-product-single-media-slider]',
      productMediaThumb: '[data-thumbnail-id]',
      productMediaThumbs: '[data-product-single-media-thumbs]',
      productMediaWrapper: '[data-product-single-media-wrapper]',
      productModel: '[data-model]',
      productSingleThumbnailLink: '.product-single__thumbnail-link',
      deferredMedia: '[data-deferred-media]',
      deferredMediaButton: '[data-deferred-media-button]',
      modalScrollContainer: '[data-tabs-holder]',
      tooltip: '[data-tooltip]',
      productRating: '[data-product-rating]',
      productReviews: '#shopify-product-reviews',
      links: 'a, button',
      upsellProduct: '[data-upsell-holder]',
      upsellProductSlider: '[data-upsell-slider]',
      featureSlider: '[data-slider]',
      productJson: '[data-product-json]',
    };

    const classes$7 = {
      featuredProduct: 'featured-product',
      featuredProductOnboarding: 'featured-product--onboarding',
      hasMediaActive: 'has-media-active',
      isSelected: 'is-selected',
      mediaHidden: 'media--hidden',
      noOutline: 'no-outline',
      hasPopup: 'has-popup',
      isMoving: 'is-moving',
    };

    const attributes$6 = {
      mediaId: 'data-media-id',
      sectionId: 'data-section-id',
      thumbId: 'data-thumbnail-id',
      dataTallLayout: 'data-tall-layout',
      loaded: 'loaded',
      tabindex: 'tabindex',
    };

    const sections$5 = {};

    class Product {
      constructor(section) {
        this.container = section.container;
        this.sectionId = this.container.getAttribute(attributes$6.sectionId);
        this.tallLayout = this.container.getAttribute(attributes$6.dataTallLayout) === 'true';
        this.featureSliders = this.container.querySelectorAll(selectors$6.featureSlider);
        this.flkty = null;
        this.flktyNav = null;
        this.isFlickityDragging = false;
        this.enableHistoryState = !this.container.classList.contains(classes$7.featuredProduct);
        this.checkSliderOnResize = () => this.checkSlider();
        this.flktyNavOnResize = () => this.resizeFlickityNav();

        this.scrollToReviews();
        this.initUpsellSlider();
        this.initFeatureSlider();

        new QuickViewPopup(this.container);

        // Skip initialization of product form, slider and media functions if section has onboarding content only
        if (this.container.classList.contains(classes$7.featuredProductOnboarding)) {
          return;
        }

        // Record recently viewed products when the product page is loading
        const productJson = this.container.querySelector(selectors$6.productJson);
        if (productJson && productJson.innerHTML) {
          const productJsonHandle = JSON.parse(productJson.innerHTML).handle;
          let recentObj = {};
          if (productJsonHandle) {
            recentObj = {
              handle: productJsonHandle,
            };
          }
          Shopify.Products.recordRecentlyViewed(recentObj);
        } else {
          Shopify.Products.recordRecentlyViewed();
        }

        new Zoom(this.container);

        this.productSlider();
        this.initMediaSwitch();
        this.initProductVideo();
        this.initProductModel();
        this.initShopifyXrLaunch();
      }

      productSlider() {
        this.checkSlider();
        document.addEventListener('theme:resize:width', this.checkSliderOnResize);
      }

      checkSlider() {
        if (!this.tallLayout || window.innerWidth < theme.sizes.large) {
          this.initProductSlider();
          return;
        }

        this.destroyProductSlider();
      }

      resizeFlickityNav() {
        if (this.flktyNav !== null) {
          this.flktyNav.resize();
        }
      }

      /* Product Slider */
      initProductSlider() {
        const slider = this.container.querySelector(selectors$6.productMediaSlider);
        const thumbs = this.container.querySelector(selectors$6.productMediaThumbs);
        const media = this.container.querySelectorAll(selectors$6.productMediaWrapper);

        if (media.length > 1) {
          this.flkty = new Flickity(slider, {
            wrapAround: false,
            cellAlign: 'left',
            pageDots: false,
            adaptiveHeight: true,
            on: {
              ready: () => {
                slider.setAttribute(attributes$6.tabindex, '-1');

                media.forEach((item) => {
                  if (!item.classList.contains(classes$7.isSelected)) {
                    const links = item.querySelectorAll(selectors$6.links);
                    if (links.length) {
                      links.forEach((link) => {
                        link.setAttribute(attributes$6.tabindex, '-1');
                      });
                    }
                  }
                });
              },
              dragStart: () => {
                slider.classList.add(classes$7.isMoving);
              },
              dragMove: () => {
                // Prevent lightbox trigger on dragMove
                this.isFlickityDragging = true;
              },
              staticClick: () => {
                this.isFlickityDragging = false;
              },
              settle: (index) => {
                const currentSlide = this.flkty.selectedElement;
                const mediaId = currentSlide.getAttribute(attributes$6.mediaId);

                this.flkty.cells.forEach((slide, i) => {
                  const links = slide.element.querySelectorAll(selectors$6.links);
                  if (links.length) {
                    links.forEach((link) => {
                      link.setAttribute(attributes$6.tabindex, i === index ? '0' : '-1');
                    });
                  }
                });
                this.switchMedia(mediaId);
                slider.classList.remove(classes$7.isMoving);
              },
            },
          });

          // Toggle flickity draggable functionality based on media play/pause state
          if (media.length) {
            media.forEach((el) => {
              el.addEventListener('theme:media:play', () => {
                this.flkty.options.draggable = false;
                this.flkty.updateDraggable();
                el.closest(selectors$6.productMediaSlider).classList.add(classes$7.hasMediaActive);
              });

              el.addEventListener('theme:media:pause', () => {
                this.flkty.options.draggable = true;
                this.flkty.updateDraggable();
                el.closest(selectors$6.productMediaSlider).classList.remove(classes$7.hasMediaActive);
              });
            });
          }

          // iOS smooth scrolling fix
          flickitySmoothScrolling(slider);

          if (thumbs !== null) {
            this.flktyNav = new Flickity(thumbs, {
              asNavFor: slider,
              contain: true,
              groupCells: 1,
              pageDots: false,
              prevNextButtons: true,
              resize: true,
              on: {
                ready: () => {
                  thumbs.setAttribute(attributes$6.tabindex, '-1');
                },
                change: (index) => {
                  this.flkty.select(index);
                },
              },
            });

            if (this.flktyNav !== null) {
              document.addEventListener('theme:resize:width', this.flktyNavOnResize);
            }

            // iOS smooth scrolling fix
            flickitySmoothScrolling(thumbs);

            // Disable link click
            const thumbLinks = this.container.querySelectorAll(selectors$6.productSingleThumbnailLink);
            if (thumbLinks.length) {
              thumbLinks.forEach((el) => {
                el.addEventListener('click', (e) => {
                  e.preventDefault();
                });
              });
            }
          }
        }
      }

      destroyProductSlider() {
        if (this.flkty !== null) {
          this.flkty.destroy();
          this.flktyNav.destroy();

          this.flkty = null;
          this.flktyNav = null;
        }
      }

      /* Upsell Products Slider */
      initUpsellSlider() {
        const slider = this.container.querySelector(selectors$6.upsellProductSlider);
        const items = this.container.querySelectorAll(selectors$6.upsellProduct);

        if (items.length > 1) {
          const flktyUpsell = new Flickity(slider, {
            wrapAround: true,
            pageDots: true,
            adaptiveHeight: true,
            prevNextButtons: false,
          });

          flktyUpsell.on('change', (index) => {
            flktyUpsell.cells.forEach((slide, i) => {
              const links = slide.element.querySelectorAll(selectors$6.links);
              if (links.length) {
                links.forEach((link) => {
                  link.setAttribute(attributes$6.tabindex, i === index ? '0' : '-1');
                });
              }
            });
          });
        }
      }

      /* Feature Block Slider */
      initFeatureSlider() {
        this.featureSliders.forEach((featureSliders) => {
          const featureSlideIndex = Array.from(featureSliders.children);

          if (featureSlideIndex.length > 1) {
            this.flktyFeature = new Flickity(featureSliders, {
              wrapAround: true,
              pageDots: true,
              adaptiveHeight: true,
              prevNextButtons: false,
            });
          }
        });
      }

      handleMediaFocus(event) {
        // Do nothing unless ENTER or TAB key are pressed
        if (event.code !== theme.keyboardKeys.ENTER && event.code !== theme.keyboardKeys.TAB) {
          return;
        }

        const mediaId = event.currentTarget.getAttribute(attributes$6.thumbId);
        const activeSlide = this.container.querySelector(`[${attributes$6.mediaId}="${mediaId}"]`);
        const slideIndex = parseInt([...activeSlide.parentNode.children].indexOf(activeSlide));
        const slider = this.container.querySelector(selectors$6.productMediaSlider);
        const sliderNav = this.container.querySelector(selectors$6.productMediaThumbs);
        const flkty = Flickity.data(slider) || null;
        const flktyNav = Flickity.data(sliderNav) || null;

        // Go to the related slide media
        if (flkty && flkty.isActive && slideIndex > -1 && (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER)) {
          flkty.select(slideIndex);
        }

        // Move thumbs to the selected one
        if (flktyNav && flktyNav.isActive && slideIndex > -1) {
          flktyNav.select(slideIndex);
        }
      }

      switchMedia(mediaId) {
        const mediaItems = document.querySelectorAll(`${selectors$6.productMediaWrapper}`);
        const selectedMedia = this.container.querySelector(`${selectors$6.productMediaWrapper}[${attributes$6.mediaId}="${mediaId}"]`);
        const isFocusEnabled = !document.body.classList.contains(classes$7.noOutline);

        // Pause other media
        if (mediaItems.length) {
          mediaItems.forEach((media) => {
            media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
            media.classList.add(classes$7.mediaHidden);
          });
        }

        if (isFocusEnabled) {
          selectedMedia.focus();
        }

        selectedMedia.closest(selectors$6.productMediaSlider).classList.remove(classes$7.hasMediaActive);
        selectedMedia.classList.remove(classes$7.mediaHidden);
        selectedMedia.dispatchEvent(new CustomEvent('theme:media:visible'), {bubbles: true});

        // If media is not loaded, trigger poster button click to load it
        const deferredMedia = selectedMedia.querySelector(selectors$6.deferredMedia);
        if (deferredMedia && deferredMedia.getAttribute(attributes$6.loaded) !== 'true') {
          selectedMedia.querySelector(selectors$6.deferredMediaButton).dispatchEvent(new Event('click'));
        }
      }

      initMediaSwitch() {
        const productThumbImages = this.container.querySelectorAll(selectors$6.productMediaThumb);
        if (productThumbImages.length) {
          productThumbImages.forEach((el) => {
            el.addEventListener('keyup', this.handleMediaFocus.bind(this));
            el.addEventListener('click', (e) => {
              e.preventDefault();
            });
          });
        }
      }

      initProductVideo() {
        this.videos = new ProductVideo(this.container);
      }

      initProductModel() {
        const modelItems = this.container.querySelectorAll(selectors$6.productModel);
        if (modelItems.length) {
          modelItems.forEach((element) => {
            theme.ProductModel.init(element, this.sectionId);
          });
        }
      }

      initShopifyXrLaunch() {
        document.addEventListener('shopify_xr_launch', () => {
          const currentMedia = this.container.querySelector(`${selectors$6.productModel}:not(.${classes$7.mediaHidden})`);
          currentMedia.dispatchEvent(new CustomEvent('xrLaunch'));
        });
      }

      onUnload() {
        if (this.flktyNav !== null) {
          document.removeEventListener('theme:resize:width', this.flktyNavOnResize);
        }

        document.removeEventListener('theme:resize:width', this.checkSliderOnResize);
      }

      scrollToReviews() {
        const productRating = this.container.querySelector(selectors$6.productRating);
        const events = ['click', 'keydown'];

        if (!productRating) {
          return;
        }

        events.forEach((eventName) => {
          productRating.addEventListener(eventName, (event) => {
            if ((event.code !== theme.keyboardKeys.ENTER && event.code !== theme.keyboardKeys.NUMPADENTER) || event.type != 'click') {
              const reviewsContainer = document.querySelector(selectors$6.productReviews);

              if (!reviewsContainer) {
                return;
              }

              reviewsContainer.scrollIntoView({behavior: 'smooth'});
            }
          });
        });
      }

      onBlockSelect(event) {
        const flkty = Flickity.data(event.target.closest(selectors$6.featureSlider));
        const index = parseInt([...event.target.parentNode.children].indexOf(event.target));

        if (flkty) {
          flkty.select(index);
        }
      }
    }

    const productSection = {
      onLoad() {
        sections$5[this.id] = new Product(this);
      },
      onUnload: function () {
        sections$5[this.id].onUnload();
      },
      onBlockSelect(event) {
        sections$5[this.id].onBlockSelect(event);
      },
    };

    register('product-template', [productFormSection, productSection, swatchSection, swatchesContainer, shareButton, collapsible, tooltip, popoutSection, drawer, productStickySection]);
    register('featured-product', [productFormSection, productSection, swatchSection, swatchesContainer, shareButton, collapsible, tooltip, popoutSection, drawer, productStickySection]);

    if (!customElements.get('complementary-products')) {
      customElements.define('complementary-products', ComplementaryProducts);
    }

    if (!customElements.get('recipient-form')) {
      customElements.define('recipient-form', RecipientForm);
    }

    const classes$6 = {
      isDisabled: 'is-disabled',
    };

    const attributes$5 = {
      circleTextParallax: 'data-circle-text-parallax',
    };

    class CircleText {
      constructor(el) {
        this.circleText = el;
        this.rotateDegree = 70;
        this.adjustRotateDegree = this.rotateDegree / 2; // We use this to keep the image upright when scrolling and it gets to the middle of the page

        this.scrollEvent = () => this.updateParallax();
        this.init();
      }

      init() {
        if (this.circleText.hasAttribute(attributes$5.circleTextParallax)) {
          document.addEventListener('theme:scroll', this.scrollEvent);
        }
      }

      updateParallax() {
        if (this.circleText.classList.contains(classes$6.isDisabled)) return;

        const windowHeight = Math.round(window.innerHeight);
        const scrollTop = Math.round(window.scrollY);
        const scrollBottom = scrollTop + windowHeight;
        const elementOffsetTopPoint = Math.round(this.circleText.getBoundingClientRect().top + scrollTop);
        const elementHeight = this.circleText.offsetHeight;
        const elementOffsetBottomPoint = elementOffsetTopPoint + elementHeight;
        const isBottomOfElementPassed = elementOffsetBottomPoint < scrollTop;
        const isTopOfElementReached = elementOffsetTopPoint < scrollBottom;
        const isInView = isTopOfElementReached && !isBottomOfElementPassed;

        if (isInView) {
          const scrollProgress = scrollBottom - elementOffsetTopPoint - elementHeight / 2;
          const percentage = (scrollProgress * 100) / windowHeight;
          let angle = ((this.rotateDegree * percentage) / 100) * -1; // The -1 negates the value to have it rotate counterclockwise

          if (percentage > 0) {
            this.circleText.style.transform = `rotate(${this.adjustRotateDegree + angle}deg)`;
          }
        }
      }

      unload() {
        document.removeEventListener('theme:scroll', this.scrollEvent);
      }
    }

    const attributes$4 = {
      href: 'href',
      mediaId: 'data-media-id',
      deferredMediaLoaded: 'data-deferred-media-loaded',
    };

    const selectors$5 = {
      deferredMedia: '[data-deferred-media]',
      deferredMediaButton: '[data-deferred-media-button]',
      productContentWrapper: '[data-product-content-wrapper]',
      productMediaWrapper: '[data-product-single-media-wrapper]',
      productModel: '[data-model]',
      productLink: '[data-product-link]',
      productSingleMediaImage: '[data-product-single-media-image]',
      sliderContents: '[data-slider-contents]',
      sliderImages: '[data-slider-images]',
      tabButton: '[data-tab-button]',
      tabItem: '[data-tab-item]',
      circleText: '[data-circle-text]',
    };

    const classes$5 = {
      aosAnimate: 'aos-animate',
      tabButtonActive: 'products-list__nav__button--active',
      tabItemActive: 'products-list__item--active',
      mediaHidden: 'media--hidden',
      isDisabled: 'is-disabled',
    };

    const sections$4 = {};

    class ProductsList {
      constructor(section) {
        this.container = section.container;
        this.sectionId = this.container.dataset.sectionId;
        this.tabButtons = this.container.querySelectorAll(selectors$5.tabButton);
        this.tabItems = this.container.querySelectorAll(selectors$5.tabItem);
        this.slidersImages = this.container.querySelectorAll(selectors$5.sliderImages);
        this.slidersContents = this.container.querySelectorAll(selectors$5.sliderContents);
        this.videos = [];
        this.flktyImages = [];
        this.flktyContent = [];
        this.sliderResizeEvent = () => this.resizeSlider();

        this.initButtons();
        this.initSliders();
        this.initProductVideos();
        this.initProductModel();
        this.initShopifyXrLaunch();
        this.initCircleText();
        this.listen();
      }

      listen() {
        if (this.slidersImages.length > 0 || this.slidersContents.length > 0) {
          document.addEventListener('theme:resize', this.sliderResizeEvent);
        }
      }

      resizeSlider() {
        if (this.flktyImages.length > 0) {
          requestAnimationFrame(() => {
            this.flktyImages.forEach((flktyImages) => flktyImages.resize());
          });
        }

        if (this.flktyContent.length > 0) {
          requestAnimationFrame(() => {
            this.flktyContent.forEach((flktyContent) => flktyContent.resize());
          });
        }
      }

      initButtons() {
        if (this.tabButtons.length) {
          this.tabButtons.forEach((tabButton) => {
            tabButton.addEventListener('click', (e) => {
              if (tabButton.classList.contains(classes$5.tabButtonActive)) {
                return;
              }

              const currentTabAnchor = tabButton.getAttribute(attributes$4.href);
              const currentTab = this.container.querySelector(currentTabAnchor);
              const currentMedia = currentTab.querySelector(selectors$5.productMediaWrapper);
              const mediaId = currentMedia ? currentMedia.dataset.mediaId : null;
              const currentCircleText = currentTab.querySelector(selectors$5.circleText);

              this.tabButtons.forEach((button) => {
                button.classList.remove(classes$5.tabButtonActive);
              });
              this.tabItems.forEach((item) => {
                const circleText = item.querySelector(selectors$5.circleText);
                item.classList.remove(classes$5.tabItemActive);
                circleText?.classList.add(classes$5.isDisabled);

                if (theme.settings.animations) {
                  item.querySelectorAll(`.${classes$5.aosAnimate}`).forEach((element) => {
                    element.classList.remove(classes$5.aosAnimate);
                    setTimeout(() => {
                      element.classList.add(classes$5.aosAnimate);
                    });
                  });
                }
              });

              tabButton.classList.add(classes$5.tabButtonActive);
              currentTab.classList.add(classes$5.tabItemActive);

              document.dispatchEvent(new Event('theme:resize')); // Trigger theme:resize event to refresh the slider height

              if (currentCircleText) {
                currentCircleText.classList.remove(classes$5.isDisabled);
                this.circleText.forEach((element) => element.updateParallax()); // Refresh circle-text values
              }

              this.handleProductVideos(currentTab, mediaId);

              e.preventDefault();
            });
          });
        }
      }

      initSliders() {
        this.slidersImages.forEach((sliderImages, idx) => {
          const contentsElement = sliderImages.closest(selectors$5.tabItem).querySelector(selectors$5.sliderContents);

          const flktyImages = new Flickity(sliderImages, {
            fade: true,
            pageDots: false,
            prevNextButtons: true,
            wrapAround: true,
            adaptiveHeight: true,
            asNavFor: contentsElement,
            on: {
              change: (index) => {
                if (this.flktyContent.length > 0) {
                  this.flktyContent[idx].select(index);
                }
              },
            },
          });

          flktyImages.on('settle', (index) => {
            const elements = sliderImages.querySelectorAll(selectors$5.productMediaWrapper);

            for (let i = 0; i < elements.length; i++) {
              if (i === index) {
                elements[i].querySelector(selectors$5.productSingleMediaImage).removeAttribute('tabindex');
              } else {
                elements[i].querySelector(selectors$5.productSingleMediaImage).setAttribute('tabindex', '-1');
              }
            }
          });

          this.flktyImages.push(flktyImages);
        });

        this.slidersContents.forEach((sliderContent) => {
          const flktyContent = new Flickity(sliderContent, {
            fade: true,
            pageDots: false,
            prevNextButtons: false,
            wrapAround: true,
            adaptiveHeight: true,
          });

          flktyContent.on('settle', (index) => {
            const elements = sliderContent.querySelectorAll(selectors$5.productContentWrapper);

            for (let i = 0; i < elements.length; i++) {
              if (i === index) {
                elements[i].querySelectorAll(selectors$5.productLink).forEach((element) => {
                  element.removeAttribute('tabindex');
                });
              } else {
                elements[i].querySelectorAll(selectors$5.productLink).forEach((element) => {
                  element.setAttribute('tabindex', '-1');
                });
              }
            }
          });

          this.flktyContent.push(flktyContent);
        });
      }

      initProductVideos() {
        this.tabItems.forEach((item) => {
          if (item.classList.contains(classes$5.tabItemActive)) {
            this.handleProductVideos(item);
          }
        });
      }

      loadVideos(container, mediaId = null) {
        const videoObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const productVideo = new ProductVideo(container);

                this.videos.push(productVideo);
                container.setAttribute(attributes$4.deferredMediaLoaded, '');
                this.playToggle(mediaId);

                observer.unobserve(entry.target);
              }
            });
          },
          {
            root: null,
            rootMargin: '300px',
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
          }
        );

        videoObserver.observe(container);
      }

      handleProductVideos(container, mediaId = null) {
        if (!container.hasAttribute(attributes$4.deferredMediaLoaded)) {
          this.loadVideos(container, mediaId);
          return;
        }

        this.playToggle(mediaId);
      }

      playToggle(mediaId) {
        this.videos.forEach((element) => {
          if (typeof element.pauseContainerMedia === 'function' && mediaId) {
            element.pauseContainerMedia(mediaId, this.container);
            this.switchMedia(mediaId);
          }

          if (!mediaId && Object.keys(element.players).length === 0) {
            this.pauseContainerMedia(this.container);
          }
        });
      }

      switchMedia(mediaId) {
        const selectedMedia = this.container.querySelector(`${selectors$5.productMediaWrapper}[${attributes$4.mediaId}="${mediaId}"]`);
        const isFocusEnabled = !document.body.classList.contains(classes$5.noOutline);

        if (isFocusEnabled) {
          selectedMedia.focus();
        }

        selectedMedia.classList.remove(classes$5.mediaHidden);
        selectedMedia.dispatchEvent(new CustomEvent('theme:media:visible'), {bubbles: true});
      }

      pauseContainerMedia(container) {
        const mediaItems = container.querySelectorAll(selectors$5.productMediaWrapper);

        if (mediaItems.length === 0) return;

        mediaItems.forEach((media) => {
          media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
          media.classList.add(classes$5.mediaHidden);
        });
      }

      initProductModel() {
        const modelItems = this.container.querySelectorAll(selectors$5.productModel);
        if (modelItems.length) {
          modelItems.forEach((element) => {
            theme.ProductModel.init(element, this.sectionId);
          });
        }
      }

      initShopifyXrLaunch() {
        document.addEventListener('shopify_xr_launch', () => {
          const currentMedia = this.container.querySelector(`${selectors$5.productModel}:not(.${classes$5.mediaHidden})`);
          currentMedia.dispatchEvent(new CustomEvent('xrLaunch'));
        });
      }

      initCircleText() {
        const elements = this.container.querySelectorAll(selectors$5.circleText);
        this.circleText = [];

        elements.forEach((element) => {
          const circleText = new CircleText(element);
          this.circleText.push(circleText);
        });
      }

      onBlockSelect(evt) {
        // Show selected tab
        evt.target.dispatchEvent(new Event('click'));
      }

      onUnload() {
        if (this.slidersImages.length > 0 || this.slidersContents.length > 0) {
          document.removeEventListener('theme:resize', this.sliderResizeEvent);
        }
      }
    }

    const productsListSection = {
      onLoad() {
        sections$4[this.id] = new ProductsList(this);
      },
      onUnload() {
        sections$4[this.id].onUnload();
      },
      onBlockSelect(e) {
        sections$4[this.id].onBlockSelect(e);
      },
    };

    register('products-list', productsListSection);

    const selectors$4 = {
      product: '[data-product-block]',
      relatedProducts: '[data-related-products]',
      recentlyViewed: '[data-recent-wrapper]',
      recentlyViewedWrapper: '[data-recently-viewed-wrapper]',
      slider: '[data-slider]',
      aos: '[data-aos]',
      tabsHolder: '[data-tabs-holder]',
      tabsLink: '[data-tabs-link]',
      tab: '[data-tab]',
      tooltip: '[data-tooltip]',
    };

    const attributes$3 = {
      sectionId: 'data-section-id',
      productId: 'data-product-id',
      limit: 'data-limit',
      minimum: 'data-minimum',
      tabsLink: 'data-tabs-link',
    };

    const classes$4 = {
      hidden: 'hidden',
      aosAnimate: 'aos-animate',
      aosInit: 'aos-init',
    };

    const sections$3 = {};

    class RelatedProducts {
      constructor(section) {
        this.section = section;
        this.sectionId = section.id;
        this.container = section.container;

        this.related();
        this.recent();

        this.tabs = new Tabs(this.container);
      }

      related() {
        this.relatedProducts = this.container.querySelector(selectors$4.relatedProducts);

        if (!this.relatedProducts) {
          return;
        }

        const sectionId = this.container.getAttribute(attributes$3.sectionId);
        const productId = this.container.getAttribute(attributes$3.productId);
        const limit = this.container.getAttribute(attributes$3.limit);
        const requestUrl = `${theme.routes.product_recommendations_url}?section_id=${sectionId}&limit=${limit}&product_id=${productId}`;

        fetch(requestUrl)
          .then((response) => {
            if (!response.ok) {
              const error = new Error(response.status);
              this.hideRelated();
              throw error;
            }
            return response.text();
          })
          .then((data) => {
            const createdElement = document.createElement('div');
            createdElement.innerHTML = data;
            const inner = createdElement.querySelector(selectors$4.relatedProducts);

            if (inner.querySelectorAll(selectors$4.product).length) {
              this.relatedProducts.innerHTML = inner.innerHTML;

              this.relatedProductGrid = new ProductGrid(this.relatedProducts);
              this.relatedGridSlider = new GridSlider(this.relatedProducts);
              this.initTooltips(this.relatedProducts);
            }
          });
      }

      recent() {
        const recentlyViewed = this.container.querySelector(selectors$4.recentlyViewed);
        const howManyToshow = recentlyViewed ? parseInt(recentlyViewed.getAttribute(attributes$3.limit)) : 4;

        Shopify.Products.showRecentlyViewed({
          howManyToShow: howManyToshow,
          wrapperId: `recently-viewed-products-${this.sectionId}`,
          section: this.section,
          onComplete: (wrapper, section) => {
            const container = section.container;
            const recentlyViewedHolder = container.querySelector(selectors$4.recentlyViewed);
            const recentlyViewedWrapper = container.querySelector(selectors$4.recentlyViewedWrapper);
            const recentProducts = wrapper.querySelectorAll(selectors$4.product);
            const aosItem = container.querySelectorAll(selectors$4.aos);
            const slider = recentlyViewedHolder.querySelector(selectors$4.slider);
            const minimumNumberProducts = recentlyViewedHolder.hasAttribute(attributes$3.minimum) ? parseInt(recentlyViewedHolder.getAttribute(attributes$3.minimum)) : 1;
            const checkRecentInRelated = !recentlyViewedWrapper && recentProducts.length > 0;
            const checkRecentOutsideRelated = recentlyViewedWrapper && recentProducts.length >= minimumNumberProducts;

            if (checkRecentInRelated || checkRecentOutsideRelated) {
              this.recentProductGrid = new ProductGrid(recentlyViewedHolder);
              this.initTooltips(recentlyViewedHolder);

              if (checkRecentOutsideRelated) {
                aosItem.forEach((item) => item.classList.remove(classes$4.aosInit, classes$4.aosAnimate));
                container.classList.remove(classes$4.hidden);

                requestAnimationFrame(() => aosItem.forEach((item) => item.classList.add(classes$4.aosInit)));
              }

              if (slider) {
                this.recentGridSlider = new GridSlider(recentlyViewedHolder);

                requestAnimationFrame(() => {
                  this.recentGridSlider.sliders.forEach((slider) => {
                    slider.dispatchEvent(new Event('theme:slider:resize', {bubbles: true}));
                    this.recentGridSlider.setSliderArrowsPosition(slider);
                  });
                });
              }
            }
          },
        });
      }

      hideRelated() {
        const tab = this.relatedProducts.closest(selectors$4.tab);
        const tabsHolder = this.relatedProducts.closest(selectors$4.tabsHolder);
        const tabsLink = tabsHolder.querySelector(`[${attributes$3.tabsLink}="${tab.dataset.tab}"]`);

        tab.remove();

        if (!tabsLink) return;
        tabsLink.remove();
        tabsHolder.querySelector(selectors$4.tabsLink).dispatchEvent(new Event('click'));
        this.tabs.customScrollbar.unload();
        requestAnimationFrame(() => {
          this.tabs.customScrollbar = new CustomScrollbar(this.tabs.container);
        });
      }

      /**
       * Init tooltips for swatches
       */
      initTooltips(container) {
        this.tooltips = container.querySelectorAll(selectors$4.tooltip);
        this.tooltips.forEach((tooltip) => {
          new Tooltip(tooltip);
        });
      }

      /**
       * Event callback for Theme Editor `section:deselect` event
       */
      onDeselect() {
        if (this.relatedProductGrid) this.relatedProductGrid.onDeselect();
        if (this.recentProductGrid) this.recentProductGrid.onDeselect();
      }

      /**
       * Event callback for Theme Editor `section:unload` event
       */
      onUnload() {
        if (this.relatedProductGrid) this.relatedProductGrid.onUnload();
        if (this.relatedGridSlider) this.relatedGridSlider.onUnload();
        if (this.recentProductGrid) this.recentProductGrid.onUnload();
        if (this.recentGridSlider) this.recentGridSlider.onUnload();
      }
    }

    const relatedProductsSection = {
      onLoad() {
        sections$3[this.id] = new RelatedProducts(this);
      },
      onDeselect() {
        sections$3[this.id].onDeselect();
      },
      onUnload() {
        sections$3[this.id].onUnload();
      },
    };

    register('related-products', relatedProductsSection);
    register('recent-products', relatedProductsSection);

    const sections$2 = {};

    const selectors$3 = {
      slider: '[data-slider]',
      sliderItem: '[data-item]',
      buttonProductsShow: '[data-button-show]',
      buttonProductsHide: '[data-button-hide]',
      itemProducts: '[data-item-products]',
      itemProductSlider: '[data-item-products-slider]',
      itemProduct: '[data-item-product]',
      links: 'a, button',
    };

    const classes$3 = {
      itemActive: 'blog-item--active',
      itemProductsVisible: 'blog-item__products--visible',
      featuredBlogSlider: 'shoppable-blog__slider',
      flickityEnabled: 'flickity-enabled',
      isSelected: 'is-selected',
    };

    const attributes$2 = {
      slider: 'data-slider',
      slidePosition: 'data-slide-position',
      sectionId: 'data-section-id',
      tabIndex: 'tabindex',
    };

    class ShoppableBlog {
      constructor(section) {
        this.container = section.container;
        this.flkty = null;
        this.slider = this.container.querySelector(selectors$3.slider);
        this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
        this.isFullWidth = this.container.hasAttribute(attributes$2.fullWidth);
        this.gutter = 0;
        this.a11y = a11y;
        this.clickOutsideItemEvent = (e) => {
          const clickOutsideSliderItem = !(e.target.matches(selectors$3.sliderItem) || e.target.closest(selectors$3.sliderItem));

          if (clickOutsideSliderItem) {
            const sliderItem = this.container.querySelectorAll(selectors$3.sliderItem);
            if (sliderItem.length) {
              sliderItem.forEach((item) => {
                const itemProducts = item.querySelector(selectors$3.itemProducts);
                if (itemProducts) {
                  itemProducts.classList.remove(classes$3.itemProductsVisible);

                  this.changeTabIndex(itemProducts);
                }
                item.classList.remove(classes$3.itemActive);
              });
            }
          }
        };

        this.bindButtons();
        this.listen();
      }

      initSlider() {
        this.flkty = new Flickity(this.slider, {
          prevNextButtons: true,
          pageDots: false,
          cellAlign: 'left',
          wrapAround: false,
          groupCells: true,
          contain: true,
          on: {
            ready: () => {
              this.handleFocus();
            },
          },
        });

        this.flkty.on('change', () => {
          const slides = this.container.querySelectorAll(selectors$3.sliderItem);

          this.handleFocus();

          if (slides.length) {
            slides.forEach((el) => {
              const itemProducts = el.querySelector(selectors$3.itemProducts);

              el.classList.remove(classes$3.itemActive);

              if (itemProducts) {
                el.querySelector(selectors$3.itemProducts).classList.remove(classes$3.itemProductsVisible);
              }
            });
          }

          if (this.flkty && !this.flkty.options.draggable) {
            this.flkty.options.draggable = true;
            this.flkty.updateDraggable();
          }
        });
      }

      destroySlider() {
        if (this.flkty !== null) {
          this.flkty.destroy();
          this.flkty = null;
        }
      }

      checkSlidesSize() {
        const sliderItemStyle = this.container.querySelector(selectors$3.sliderItem).currentStyle || window.getComputedStyle(this.container.querySelector(selectors$3.sliderItem));
        this.gutter = parseInt(sliderItemStyle.marginRight);
        const containerWidth = this.slider.offsetWidth + this.gutter;
        const itemsWidth = this.getItemsWidth();
        const itemsOverflowViewport = containerWidth < itemsWidth;

        if (window.innerWidth >= theme.sizes.small && itemsOverflowViewport) {
          this.initSlider();
        } else {
          this.destroySlider();
        }
      }

      getItemsWidth() {
        let itemsWidth = 0;
        const slides = this.slider.querySelectorAll(selectors$3.sliderItem);
        if (slides.length) {
          slides.forEach((item) => {
            itemsWidth += item.offsetWidth + this.gutter;
          });
        }

        return itemsWidth;
      }

      bindButtons() {
        const itemProductSlider = this.container.querySelectorAll(selectors$3.itemProductSlider);
        const buttonProductsShow = this.container.querySelectorAll(selectors$3.buttonProductsShow);
        const buttonProductsHide = this.container.querySelectorAll(selectors$3.buttonProductsHide);

        if (buttonProductsShow.length) {
          buttonProductsShow.forEach((button) => {
            button.addEventListener('click', (e) => {
              e.preventDefault();

              this.container.querySelectorAll(selectors$3.sliderItem).forEach((item) => {
                const itemProducts = item.querySelector(selectors$3.itemProducts);
                item.classList.remove(classes$3.itemActive);

                if (itemProducts) {
                  itemProducts.classList.remove(classes$3.itemProductsVisible);

                  this.changeTabIndex(itemProducts);
                }
              });

              const item = button.closest(selectors$3.sliderItem);
              const itemProducts = item.querySelector(selectors$3.itemProducts);
              item.classList.add(classes$3.itemActive);

              if (itemProducts) {
                itemProducts.classList.add(classes$3.itemProductsVisible);
                this.changeTabIndex(itemProducts, 'enable');

                const itemProductsSlider = itemProducts.querySelector(selectors$3.itemProductSlider);
                const allSlides = itemProductsSlider.querySelectorAll(selectors$3.itemProduct);
                const sliderActive = itemProductsSlider.classList.contains(classes$3.flickityEnabled);

                if (sliderActive) {
                  const currentSlide = itemProductsSlider.querySelector(`.${classes$3.isSelected}`);
                  const currentSlideIndex = currentSlide.getAttribute(attributes$2.slidePosition);

                  allSlides.forEach((slide, i) => {
                    slide.setAttribute(attributes$2.tabIndex, i === currentSlideIndex ? '0' : '-1');
                  });
                }
              }

              if (this.flkty !== null) {
                this.flkty.options.draggable = false;
                this.flkty.updateDraggable();
              }

              this.a11y.state.trigger = button;
            });
          });
        }

        if (buttonProductsHide.length) {
          buttonProductsHide.forEach((button) => {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              const item = button.closest(selectors$3.sliderItem);
              const itemProducts = item.querySelector(selectors$3.itemProducts);
              item.classList.remove(classes$3.itemActive);

              if (itemProducts) {
                itemProducts.classList.remove(classes$3.itemProductsVisible);

                this.changeTabIndex(itemProducts);
              }

              if (this.flkty !== null) {
                this.flkty.options.draggable = true;
                this.flkty.updateDraggable();
              }

              this.a11y.state.trigger.focus();
            });
          });
        }

        if (itemProductSlider.length) {
          itemProductSlider.forEach((slider) => {
            const countSlides = slider.querySelectorAll(selectors$3.itemProduct).length;

            if (countSlides > 1) {
              const flktyProducts = new Flickity(slider, {
                prevNextButtons: true,
                contain: true,
                pageDots: false,
                wrapAround: true,
                on: {
                  change: (index) => {
                    flktyProducts.cells.forEach((slide, i) => {
                      slide.element.querySelectorAll(selectors$3.links).forEach((link) => {
                        link.setAttribute(attributes$2.tabIndex, i === index ? '0' : '-1');
                      });
                    });
                  },
                },
              });
            }
          });
        }

        this.slider.addEventListener('keyup', (event) => {
          if (event.code === theme.keyboardKeys.ESCAPE) {
            const sliderItem = event.target.hasAttribute(attributes$2.slider)
              ? event.target.querySelectorAll(selectors$3.sliderItem)
              : event.target.closest(selectors$3.slider).querySelectorAll(selectors$3.sliderItem);

            if (sliderItem.length) {
              sliderItem.forEach((item) => {
                const itemProducts = item.querySelector(selectors$3.itemProducts);
                item.classList.remove(classes$3.itemActive);
                if (itemProducts) {
                  itemProducts.classList.remove(classes$3.itemProductsVisible);

                  this.changeTabIndex(itemProducts);
                }
              });

              if (this.flkty) {
                this.flkty.options.draggable = true;
                this.flkty.updateDraggable();
              }
            }

            this.a11y.state.trigger.focus();
          }
        });
      }

      handleFocus() {
        const sliderItems = this.container.querySelectorAll(selectors$3.sliderItem);

        if (sliderItems.length) {
          sliderItems.forEach((item) => {
            const selected = item.classList.contains(classes$3.isSelected);
            const itemProducts = item.querySelector(selectors$3.itemProducts);

            if (!selected) {
              this.changeTabIndex(item);

              if (itemProducts) {
                itemProducts.classList.remove(classes$3.itemProductsVisible);
              }
            } else {
              this.changeTabIndex(item, 'enable');

              if (itemProducts) {
                this.changeTabIndex(itemProducts);
              }
            }
          });
        }
      }

      listen() {
        if (this.slider) {
          this.checkSlidesSize();
          document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
        }

        document.addEventListener('mousedown', this.clickOutsideItemEvent);
      }

      changeTabIndex(items, state = '') {
        const tabIndex = state === 'enable' ? '0' : '-1';
        items.querySelectorAll(selectors$3.links).forEach((link) => {
          link.setAttribute(attributes$2.tabIndex, tabIndex);
        });
      }

      onBlockSelect(evt) {
        if (this.flkty !== null) {
          const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));
          const slidesPerPage = parseInt(this.flkty.slides[0].cells.length);
          const groupIndex = Math.floor(index / slidesPerPage);

          this.flkty.select(groupIndex);
        } else {
          const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
          const sliderPadding = parseInt(sliderStyle.paddingLeft);
          const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

          // Native scroll to item
          this.slider.scrollTo({
            top: 0,
            left: blockPositionLeft,
            behavior: 'smooth',
          });
        }
      }

      onUnload() {
        document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
        document.removeEventListener('mousedown', this.clickOutsideItemEvent);
      }
    }

    const shoppableBlogSection = {
      onLoad() {
        sections$2[this.id] = new ShoppableBlog(this);
      },
      onUnload(e) {
        sections$2[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections$2[this.id].onBlockSelect(e);
      },
    };

    register('shoppable-blog', shoppableBlogSection);

    const selectors$2 = {
      arrowScrollDown: '[data-scroll-down]',
      header: '[data-site-header]',
      item: '[data-slide]',
      links: 'a, button',
      slider: '[data-slider]',
      lazyImage: '.lazy-image',
    };

    const attributes$1 = {
      style: 'data-style',
      currentStyle: 'data-current-style',
      tabIndex: 'tabindex',
      slidePosition: 'data-slide-position',
    };

    const classes$2 = {
      headerFixed: 'site-header--fixed',
      sliderNoCachedImages: 'slider--no-cached-images',
      sliderImgLoaded: 'slider--img-loaded',
      imgIn: 'img-in',
    };

    const sections$1 = {};

    class Slider {
      constructor(section) {
        this.container = section.container;
        this.header = document.querySelector(selectors$2.header);
        this.flkty = null;
        this.resizeEvent = () => {
          this.flkty.resize();
        };

        this.initSlider();
        this.bindScrollButton();
      }

      initSlider() {
        const slidesCount = this.container.querySelectorAll(selectors$2.item).length;
        const duration = parseInt(this.container.dataset.duration);
        const pageDots = this.container.dataset.pageDots === 'true' && slidesCount > 1;
        const prevNextButtons = this.container.dataset.navArrows === 'true' && slidesCount > 1;
        let autoplay = this.container.dataset.autoplay === 'true';

        if (autoplay) {
          autoplay = duration;
        }

        if (slidesCount > 1) {
          this.flkty = new Flickity(this.container, {
            fade: true,
            cellSelector: selectors$2.item,
            autoPlay: autoplay,
            wrapAround: true,
            adaptiveHeight: true,
            setGallerySize: true,
            imagesLoaded: true,
            pageDots: pageDots,
            prevNextButtons: prevNextButtons,
            on: {
              ready: () => {
                const currentStyle = this.container.querySelector(`${selectors$2.item}[${attributes$1.slidePosition}="1"]`).getAttribute(attributes$1.style);
                this.container.setAttribute(attributes$1.currentStyle, currentStyle);
                requestAnimationFrame(this.resizeEvent);
                document.addEventListener('theme:vars', this.resizeEvent); // Update slideshow height after height vars init

                this.handleFirstSlideAnimation(true);
              },
              change: (index) => {
                const currentSlide = this.flkty.selectedElement;
                const currentStyle = currentSlide.getAttribute(attributes$1.style);

                this.container.setAttribute(attributes$1.currentStyle, currentStyle);
                this.handleFirstSlideAnimation(false);

                this.flkty.cells.forEach((slide, i) => {
                  slide.element.querySelectorAll(selectors$2.links).forEach((link) => {
                    link.setAttribute(attributes$1.tabIndex, i === index ? '0' : '-1');
                  });
                });
              },
            },
          });

          // iOS smooth scrolling fix
          flickitySmoothScrolling(this.container);
        } else if (slidesCount === 1) {
          const currentStyle = this.container.querySelector(selectors$2.item).getAttribute(attributes$1.style);
          this.container.setAttribute(attributes$1.currentStyle, currentStyle);
        }
      }

      /**
       * Handles image animation in first slide that would be triggered on page load
       *  - uses a fallback class modifier for sliders that contain a first slide with no cached hero images
       *  - that class resets the default slider CSS animation so it won't be executed when `.img-in` class is added when `img.complete` is detected
       *  - gets the first slide's `.lazy-image` container and listens for `transitionend` event of its `<img>` child element
       *  - adds a class modifier after `<img>` transition has completed, when shimmer effect has been removed, that should trigger the hero image animation
       *  - removes classes on Theme Editor `shopify:section:unload` and `shopify:section:reorder` events
       */
      handleFirstSlideAnimation(onLoad = false) {
        if (!onLoad) {
          this.container.classList.remove(classes$2.sliderNoCachedImages);
          this.container.classList.remove(classes$2.sliderImgLoaded);
          return;
        }

        const firstSlide = this.container.querySelectorAll(selectors$2.item)[0];
        const slideImage = firstSlide.querySelectorAll(selectors$2.lazyImage);
        const slideImgComplete = this.container.classList.contains(classes$2.imgIn);

        if (slideImage.length && !slideImgComplete) {
          this.container.classList.add(classes$2.sliderNoCachedImages);

          const onImageTransitionEnd = (event) => {
            requestAnimationFrame(() => this.container.classList.add(classes$2.sliderImgLoaded));
            slideImage[0].removeEventListener('transitionend', onImageTransitionEnd);
          };

          slideImage[0].addEventListener('transitionend', onImageTransitionEnd);
        }
      }

      // Scroll down function
      bindScrollButton() {
        const arrowDown = this.container.querySelector(selectors$2.arrowScrollDown);

        if (arrowDown) {
          arrowDown.addEventListener('click', (e) => {
            e.preventDefault();

            const headerHeight = this.header.classList.contains(classes$2.headerFixed) ? 60 : 0;
            const scrollToPosition = parseInt(Math.ceil(this.container.offsetTop + this.container.offsetHeight - headerHeight));

            window.scrollTo({
              top: scrollToPosition,
              left: 0,
              behavior: 'smooth',
            });
          });
        }
      }

      onBlockSelect(evt) {
        const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));

        if (this.flkty !== null) {
          this.flkty.select(index);
          this.flkty.pausePlayer();
        }
      }

      onBlockDeselect(evt) {
        const autoplay = evt.target.closest(selectors$2.slider).dataset.autoplay === 'true';
        if (autoplay && this.flkty !== null) {
          this.flkty.playPlayer();
        }
      }

      onReorder() {
        this.handleFirstSlideAnimation(false);

        if (this.flkty !== null) {
          this.flkty.resize();
        }
      }

      onUnload() {
        this.handleFirstSlideAnimation(false);

        if (this.flkty !== null) {
          document.removeEventListener('theme:vars', this.resizeEvent);
          this.flkty.destroy();
          this.flkty = null;
        }
      }
    }

    const slider = {
      onLoad() {
        sections$1[this.id] = new Slider(this);
      },
      onReorder(e) {
        sections$1[this.id].onReorder(e);
      },
      onUnload(e) {
        sections$1[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections$1[this.id].onBlockSelect(e);
      },
      onBlockDeselect(e) {
        sections$1[this.id].onBlockDeselect(e);
      },
    };

    register('slider', [slider, videoPlay, zoomAnimation]);

    register('subcollections', gridSlider);

    register('tab-collections', [productGrid, gridSlider, tabs]);

    const sections = {};

    const selectors$1 = {
      slider: '[data-slider]',
      item: '[data-item]',
    };

    const classes$1 = {
      flickityEnabled: 'flickity-enabled',
    };

    const attributes = {
      sectionId: 'data-section-id',
    };

    class Testimonials {
      constructor(section) {
        this.container = section.container;
        this.sectionId = this.container.getAttribute(attributes.sectionId);
        this.slider = this.container.querySelector(selectors$1.slider);
        this.sliderResizeEvent = () => this.initSlider();
        this.flkty = null;
        this.initSlider();

        document.addEventListener('theme:resize:width', this.sliderResizeEvent);
      }

      initSlider() {
        const slidesCount = this.slider.querySelectorAll(selectors$1.item).length;
        let flickityEnabled = this.slider.classList.contains(classes$1.flickityEnabled);

        // Destroy slider if there are 3 slides on desktop or 2 on tablet
        // Use native scrolling on mobile
        if ((slidesCount == 2 && window.innerWidth >= theme.sizes.small) || slidesCount == 1 || window.innerWidth < theme.sizes.small) {
          if (flickityEnabled) {
            this.flkty.destroy();
          }

          return;
        }

        this.flkty = new Flickity(this.slider, {
          cellSelector: selectors$1.item,
          prevNextButtons: true,
          pageDots: false,
          groupCells: true,
          cellAlign: 'left',
          contain: true,
          adaptiveHeight: false,
        });

        this.flkty.resize();
        const isLargerThanVw = this.flkty.slideableWidth > this.flkty.size.width;
        // Destroy slider if slidable container is smaller than the slider's container width
        if (!isLargerThanVw) {
          this.flkty.destroy();
        }
      }

      onBlockSelect(evt) {
        if (this.flkty !== null) {
          const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));
          const slidesPerPage = parseInt(this.flkty.slides[0].cells.length);
          const groupIndex = Math.floor(index / slidesPerPage);

          this.flkty.select(groupIndex);
        } else {
          const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
          const sliderPadding = parseInt(sliderStyle.paddingLeft);
          const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

          // Native scroll to item
          this.slider.scrollTo({
            top: 0,
            left: blockPositionLeft,
            behavior: 'smooth',
          });
        }
      }

      onUnload() {
        document.removeEventListener('theme:resize:width', this.sliderResizeEvent);
      }
    }

    const TestimonialsSection = {
      onLoad() {
        sections[this.id] = new Testimonials(this);
      },
      onUnload(e) {
        sections[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections[this.id].onBlockSelect(e);
      },
    };

    register('testimonials', TestimonialsSection);

    // Customer Favourites Video Carousel Component
    const customerFavouritesSections = {};

    class CustomerFavouritesVideoCarousel {
      constructor(section) {
        this.container = section.container;
        this.slider = this.container.querySelector('[data-slider]');
        this.flkty = null;
        this.sliderResizeEvent = () => this.initSlider();
        
        if (this.slider) {
          this.initSlider();
          document.addEventListener('theme:resize:width', this.sliderResizeEvent);
        }
      }

      initSlider() {
        const slidesCount = this.slider.querySelectorAll('[data-slider-item]').length;
        let flickityEnabled = this.slider.classList.contains('flickity-enabled');

        // Only initialize if we have multiple slides
        if (slidesCount <= 1) {
          if (flickityEnabled && this.flkty) {
            this.flkty.destroy();
            this.flkty = null;
          }
          return;
        }

        // Destroy existing instance if it exists
        if (this.flkty) {
          this.flkty.destroy();
        }

        // Initialize Flickity
        this.flkty = new Flickity(this.slider, {
          cellSelector: '[data-slider-item]',
          prevNextButtons: true,
          pageDots: isLpUsHeader,
          cellAlign: 'left',
          contain: true,
          wrapAround: false,
          adaptiveHeight: false,
          groupCells: true,
          imagesLoaded: true,
          arrowShape: {
            x0: 10,
            x1: 60,
            y1: 50,
            x2: 65,
            y2: 45,
            x3: 20
          },
          on: {
            ready: () => {
              // Use Living Proof US icons
              if(isLpUsHeader) {
                this.slider.querySelector('.flickity-prev-next-button.previous').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
                  <path d="M9.50059 0.5L1 9M1 9L9.50059 17.5M1 9H21" stroke="black" stroke-linecap="round"/>
                </svg>`;
                
                this.slider.querySelector('.flickity-prev-next-button.next').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
                  <path d="M12.4994 0.5L21 9M21 9L12.4994 17.5M21 9H1" stroke="black" stroke-linecap="round"/>
                </svg>`;
              }
              
              this.handleVideoPlayback();
              this.setTabIndexes();
              
              // Setup video controls
              setTimeout(() => {
                this.setupVideoControls();
                this.setupHoverToPlay();
                this.preventControlsNavigation();
              }, 100);
            },
            change: () => {
              this.setTabIndexes();
            },
            settle: () => {
              this.handleVideoPlayback();
            },
          },
        });

        // iOS smooth scrolling fix
        flickitySmoothScrolling(this.slider);
      }

      handleVideoPlayback() {
        this.pauseAllVideos();

        // Play video in active slide
        const activeSlide = this.slider.querySelector('.is-selected');
        if (activeSlide) {
          const activeVideo = activeSlide.querySelector('video');
          if (activeVideo) {
            // Play video after slide has settled
            activeVideo.play().catch(error => {
              // Handle autoplay restrictions silently
              console.log('Video autoplay prevented:', error);
            });
          }
        }
      }

      setTabIndexes() {
        const slides = this.slider.querySelectorAll('[data-slider-item]');
        const activeSlide = this.slider.querySelector('.is-selected');
        
        slides.forEach(slide => {
          const focusableElements = slide.querySelectorAll('a, button, video, [tabindex]:not([tabindex="-1"])');
          
          if (slide === activeSlide) {
            // Enable focus for active slide
            focusableElements.forEach(el => {
              el.removeAttribute('tabindex');
            });
          } else {
            // Disable focus for inactive slides
            focusableElements.forEach(el => {
              el.setAttribute('tabindex', '-1');
            });
          }
        });
      }

      setupVideoControls() {
        const videoWrappers = this.container.querySelectorAll('.video-wrapper');
        
        videoWrappers.forEach(wrapper => {
          const video = wrapper.querySelector('video');
          const controls = wrapper.querySelector('.video-controls');
          
          if (!video || !controls) return;
          
          // Show controls
          controls.style.display = 'flex';
          
          // Setup play/pause button
          const playButton = controls.querySelector('.video-flow-button');
          if (playButton) {
            const playIcon = playButton.querySelector('.video-play-icon');
            const pauseIcon = playButton.querySelector('.video-pause-icon');
            
            const updatePlayPauseIcons = () => {
              playIcon.style.display = video.paused ? '' : 'none';
              pauseIcon.style.display = video.paused ? 'none' : '';
            };
            
            playButton.addEventListener('click', () => {
              if (video.paused) {
                // Pause all other videos first
                this.pauseAllVideos();
                video.play();
              } else {
                video.pause();
              }
              updatePlayPauseIcons();
            });
            
            video.addEventListener('play', updatePlayPauseIcons);
            video.addEventListener('pause', updatePlayPauseIcons);
            
            // Set initial state
            updatePlayPauseIcons();
          }
          
          // Setup sound button
          const soundButton = controls.querySelector('.video-sound-button');
          if (soundButton) {
            const muteIcon = soundButton.querySelector('.video-mute-icon');
            const unmuteIcon = soundButton.querySelector('.video-unmute-icon');
            
            const updateSoundIcons = () => {
              muteIcon.style.display = video.muted ? '' : 'none';
              unmuteIcon.style.display = video.muted ? 'none' : '';
            };
            
            soundButton.addEventListener('click', () => {
              video.muted = !video.muted;
              if (!video.muted) video.volume = 0.4;
              updateSoundIcons();
            });
            
            video.addEventListener('volumechange', updateSoundIcons);
            
            // Set initial state
            updateSoundIcons();
          }
        });
      }

      setupHoverToPlay() {
        // Only enable hover-to-play on desktop
        if (window.innerWidth < 1024) return;
        
        const videoWrappers = this.container.querySelectorAll('.video-wrapper');
        
        videoWrappers.forEach(wrapper => {
          const video = wrapper.querySelector('video');
          if (!video) return;
          
          wrapper.addEventListener('mouseenter', () => {
            // Pause all videos in this section
            this.pauseAllVideos();
            
            // Play the hovered video
            video.play().catch(error => {
              console.log('Video hover play prevented:', error);
            });
          });
        });
      }

      preventControlsNavigation() {
        const videoControls = this.container.querySelectorAll('.video-controls');
        
        // Prevent navigation when clicking on video controls only
        videoControls.forEach(controls => {
          controls.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
          
          // Also prevent on all buttons and elements inside controls
          const controlElements = controls.querySelectorAll('button, [data-video-button]');
          controlElements.forEach(element => {
            element.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
            });
          });
        });
      }

      pauseAllVideos() {
        const allVideos = this.slider.querySelectorAll('video');
        allVideos.forEach(video => {
          video.pause();
        });
      }

      onUnload() {
        if (this.flkty) {
          this.flkty.destroy();
          this.flkty = null;
        }
        document.removeEventListener('theme:resize:width', this.sliderResizeEvent);
      }

      onBlockSelect(event) {
        if (this.flkty) {
          const index = parseInt([...event.target.parentNode.children].indexOf(event.target));
          this.flkty.select(index);
        }
      }
    }

    const customerFavouritesVideoCarouselSection = {
      onLoad() {
        customerFavouritesSections[this.id] = new CustomerFavouritesVideoCarousel(this);
      },
      onUnload() {
        if (customerFavouritesSections[this.id]) {
          customerFavouritesSections[this.id].onUnload();
          delete customerFavouritesSections[this.id];
        }
      },
      onBlockSelect(event) {
        if (customerFavouritesSections[this.id]) {
          customerFavouritesSections[this.id].onBlockSelect(event);
        }
      }
    };

    register('customer-favourites-video-carousel', customerFavouritesVideoCarouselSection);

    const classes = {
      noOutline: 'no-outline',
    };

    const selectors = {
      inPageLink: '[data-skip-content]',
      linkesWithOnlyHash: 'a[href="#"]',
    };

    class Accessibility {
      constructor() {
        this.init();
      }

      init() {
        // this.a11y = a11y;

        // DOM Elements
        this.body = document.body;
        this.inPageLink = document.querySelector(selectors.inPageLink);
        this.linkesWithOnlyHash = document.querySelectorAll(selectors.linkesWithOnlyHash);

        // Flags
        this.isFocused = false;

        // A11Y init methods
        this.focusHash();
        this.bindInPageLinks();

        // Events
        this.clickEvents();
        this.focusEvents();
        this.focusEventsOff();
      }

      /**
       * Clicked events accessibility
       *
       * @return  {Void}
       */

      clickEvents() {
        if (this.inPageLink) {
          this.inPageLink.addEventListener('click', (event) => {
            event.preventDefault();
          });
        }

        if (this.linkesWithOnlyHash) {
          this.linkesWithOnlyHash.forEach((item) => {
            item.addEventListener('click', (event) => {
              event.preventDefault();
            });
          });
        }
      }

      /**
       * Focus events
       *
       * @return  {Void}
       */

      focusEvents() {
        document.addEventListener('keyup', (event) => {
          if (event.code !== theme.keyboardKeys.TAB) {
            return;
          }

          this.body.classList.remove(classes.noOutline);
          this.isFocused = true;
        });
      }

      /**
       * Focus events off
       *
       * @return  {Void}
       */

      focusEventsOff() {
        document.addEventListener('mousedown', () => {
          this.body.classList.add(classes.noOutline);
          this.isFocused = false;
        });
      }

      /**
       * Moves focus to an HTML element
       * eg for In-page links, after scroll, focus shifts to content area so that
       * next `tab` is where user expects. Used in bindInPageLinks()
       * eg move focus to a modal that is opened. Used in trapFocus()
       *
       * @param {Element} container - Container DOM element to trap focus inside of
       * @param {Object} options - Settings unique to your theme
       * @param {string} options.className - Class name to apply to element on focus.
       */

      forceFocus(element, options) {
        options = options || {};

        var savedTabIndex = element.tabIndex;

        element.tabIndex = -1;
        element.dataset.tabIndex = savedTabIndex;
        element.focus();
        if (typeof options.className !== 'undefined') {
          element.classList.add(options.className);
        }
        element.addEventListener('blur', callback);

        function callback(event) {
          event.target.removeEventListener(event.type, callback);

          element.tabIndex = savedTabIndex;
          delete element.dataset.tabIndex;
          if (typeof options.className !== 'undefined') {
            element.classList.remove(options.className);
          }
        }
      }

      /**
       * If there's a hash in the url, focus the appropriate element
       * This compensates for older browsers that do not move keyboard focus to anchor links.
       * Recommendation: To be called once the page in loaded.
       *
       * @param {Object} options - Settings unique to your theme
       * @param {string} options.className - Class name to apply to element on focus.
       * @param {string} options.ignore - Selector for elements to not include.
       */

      focusHash(options) {
        options = options || {};
        let hash = window.location.hash;

        if (typeof theme.settings.newHash !== 'undefined') {
          hash = theme.settings.newHash;
          window.location.hash = `#${hash}`;
        }
        const element = document.getElementById(hash.slice(1));

        // if we are to ignore this element, early return
        if (element && options.ignore && element.matches(options.ignore)) {
          return false;
        }

        if (hash && element) {
          this.forceFocus(element, options);
        }
      }

      /**
       * When an in-page (url w/hash) link is clicked, focus the appropriate element
       * This compensates for older browsers that do not move keyboard focus to anchor links.
       * Recommendation: To be called once the page in loaded.
       *
       * @param {Object} options - Settings unique to your theme
       * @param {string} options.className - Class name to apply to element on focus.
       * @param {string} options.ignore - CSS selector for elements to not include.
       */

      bindInPageLinks(options) {
        options = options || {};
        const links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

        function queryCheck(selector) {
          return document.getElementById(selector) !== null;
        }

        return links.filter((link) => {
          if (link.hash === '#' || link.hash === '') {
            return false;
          }

          if (options.ignore && link.matches(options.ignore)) {
            return false;
          }

          if (!queryCheck(link.hash.substr(1))) {
            return false;
          }

          var element = document.querySelector(link.hash);

          if (!element) {
            return false;
          }

          link.addEventListener('click', () => {
            this.forceFocus(element, options);
          });

          return true;
        });
      }
    }

    const getScrollbarWidth = () => {
      // Creating invisible container
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll'; // forcing scrollbar to appear
      outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
      document.body.appendChild(outer);

      // Creating inner element and placing it in the container
      const inner = document.createElement('div');
      outer.appendChild(inner);

      // Calculating difference between container's full width and the child width
      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

      // Removing temporary elements from the DOM
      outer.parentNode.removeChild(outer);

      return scrollbarWidth;
    };

    document.documentElement.style.setProperty('--scrollbar-width', `${getScrollbarWidth()}px`);

    document.addEventListener('DOMContentLoaded', function () {
      // Load all registered sections on the page.
      load('*');

      new Accessibility();

      if (!customElements.get('product-grid-item-swatch') && window.theme.settings.enableColorSwatchesCollection) {
        customElements.define('product-grid-item-swatch', GridSwatch);
      }

      // Safari smoothscroll polyfill
      const hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;

      if (!hasNativeSmoothScroll) {
        loadScript({url: theme.assets.smoothscroll});
      }
    });


    /*
      THEME CORE ALTERATION
      We need it to work with Quick View Popup from custom.js
    */
    window.quick_view_helper = function(element){
      new QuickViewPopup(element);
    }


})(themeVendor.ScrollLock, themeVendor.AOS, themeVendor.Flickity, themeVendor.themeCurrency, themeVendor.ajaxinate);
