/* =============================================
   ROVEN — main.js
   Shared JS: Nav, Accordion, Scroll FX, Gallery
   ============================================= */

(function () {
  'use strict';

  /* ── Sticky Nav ──────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile Nav Toggle ───────────────────── */
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      });
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      }
    });
  }

  /* ── Scroll Fade-Up Animations ───────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach(el => observer.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Hero BG Ken Burns ───────────────────── */
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg) {
    setTimeout(() => heroBg.classList.add('loaded'), 100);
  }

  /* ── Accordion ───────────────────────────── */
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion__item');
      const isOpen = item.classList.contains('open');

      // Close siblings in same accordion
      const accordion = trigger.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion__item.open').forEach(openItem => {
          openItem.classList.remove('open');
          openItem.querySelector('.accordion__trigger').setAttribute('aria-expanded', false);
        });
      }

      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', true);
      }
    });
  });

  /* ── Product Gallery Thumbnails ──────────── */
  const thumbs = document.querySelectorAll('.gallery__thumb');
  const mainImg = document.querySelector('.gallery__main img');
  if (thumbs.length && mainImg) {
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const src = thumb.querySelector('img').src;
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = src;
          mainImg.style.opacity = '1';
        }, 160);
      });
    });
  }

  /* ── Smooth inner-page scroll offset for fixed nav ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = (nav ? nav.offsetHeight : 68) + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Contact Form Submission Stub ─────────── */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      btn.textContent = 'Message sent!';
      btn.disabled = true;
      btn.style.background = 'var(--c-sage)';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
        btn.style.background = '';
        contactForm.reset();
      }, 3500);
    });
  }

  /* ── Cart State (localStorage) ───────────── */
  const CART_KEY = 'roven_cart';
  const SHOPIFY_DOMAIN = 'jaxwqr-f0.myshopify.com';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function updateCartBadge() {
    const count = getCart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? '' : 'none';
    });
  }

  function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(i => i.variantId === item.variantId);
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push(item);
    }
    saveCart(cart);
  }

  updateCartBadge();

  /* ── Product Color Selector ─────────────── */
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const colorNameLabel = document.getElementById('selected-color-name');
  const addToCartBtn = document.getElementById('add-to-cart-btn');

  if (colorSwatches.length && colorNameLabel && addToCartBtn) {
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        // Remove active state from all
        colorSwatches.forEach(s => {
          s.classList.remove('active');
          s.setAttribute('aria-pressed', 'false');
          s.style.borderColor = 'transparent';
          if (s.dataset.color === 'White') {
            s.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1)';
          }
        });
        
        // Add active state to clicked
        swatch.classList.add('active');
        swatch.setAttribute('aria-pressed', 'true');
        swatch.style.borderColor = 'var(--c-green)';
        if (swatch.dataset.color === 'White') {
          swatch.style.boxShadow = 'none';
        }
        
        // Update label and button data attribute
        const selectedColor = swatch.dataset.color;
        colorNameLabel.textContent = selectedColor;
        addToCartBtn.dataset.selectedColor = selectedColor;

        // Update main gallery image based on color
        const mainGalleryImg = document.getElementById('gallery-main-img');
        if (mainGalleryImg) {
          mainGalleryImg.style.opacity = '0';
          setTimeout(() => {
            if (selectedColor === 'White') {
              mainGalleryImg.src = 'assets/images/product-white-studio.jpg';
            } else if (selectedColor === 'Yellow') {
              mainGalleryImg.src = 'assets/images/product-yellow-studio.jpg';
            } else {
              mainGalleryImg.src = 'assets/images/product-grey-studio.jpg';
            }
            mainGalleryImg.style.opacity = '1';
          }, 160);
        }
      });
    });
  }

  /* ── Add to Cart ─────────────────────────── */
  if (addToCartBtn) {
    const PRODUCT_TITLE = 'Roven Trail Companion';
    const PRODUCT_PRICE = 23.99;
    const VARIANT_IDS = {
      Grey: '53443238232353',
      White: '53443238265121',
      Yellow: '53443238297889'
    };
    const PRODUCT_IMAGES = {
      Grey: 'assets/images/product-grey-studio.jpg',
      White: 'assets/images/product-white-studio.jpg',
      Yellow: 'assets/images/product-yellow-studio.jpg'
    };

    addToCartBtn.addEventListener('click', () => {
      const color = addToCartBtn.dataset.selectedColor || 'Grey';
      addToCart({
        variantId: VARIANT_IDS[color],
        title: PRODUCT_TITLE,
        color: color,
        price: PRODUCT_PRICE,
        image: PRODUCT_IMAGES[color],
        qty: 1
      });

      const originalText = addToCartBtn.textContent;
      addToCartBtn.textContent = 'Added to Cart ✓';
      addToCartBtn.disabled = true;
      setTimeout(() => {
        addToCartBtn.textContent = originalText;
        addToCartBtn.disabled = false;
      }, 1400);
    });
  }

  /* ── Cart Page ───────────────────────────── */
  const cartItemsEl = document.getElementById('cart-items');
  if (cartItemsEl) {
    const cartEmptyEl = document.getElementById('cart-empty');
    const cartSummaryEl = document.getElementById('cart-summary');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('checkout-btn');

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function renderCart() {
      const cart = getCart();

      if (!cart.length) {
        cartItemsEl.innerHTML = '';
        if (cartEmptyEl) cartEmptyEl.style.display = '';
        if (cartSummaryEl) cartSummaryEl.style.display = 'none';
        return;
      }

      if (cartEmptyEl) cartEmptyEl.style.display = 'none';
      if (cartSummaryEl) cartSummaryEl.style.display = '';

      cartItemsEl.innerHTML = cart.map((item, i) => `
        <div class="cart-item" data-index="${i}">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)} — ${escapeHtml(item.color)}" class="cart-item__img" />
          <div class="cart-item__info">
            <p class="cart-item__title">${escapeHtml(item.title)}</p>
            <p class="cart-item__color">Color: ${escapeHtml(item.color)}</p>
            <div class="cart-item__qty">
              <button type="button" class="qty-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
              <span class="qty-value">${item.qty}</span>
              <button type="button" class="qty-btn" data-action="increase" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="cart-item__price">$${(item.price * item.qty).toFixed(2)}</div>
          <button type="button" class="cart-item__remove" aria-label="Remove item from cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>
          </button>
        </div>
      `).join('');

      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    }

    cartItemsEl.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.cart-item');
      if (!itemEl) return;
      const index = parseInt(itemEl.dataset.index, 10);
      const cart = getCart();
      if (!cart[index]) return;

      if (e.target.closest('.qty-btn')) {
        const action = e.target.closest('.qty-btn').dataset.action;
        if (action === 'increase') {
          cart[index].qty += 1;
        } else if (action === 'decrease') {
          cart[index].qty -= 1;
          if (cart[index].qty <= 0) cart.splice(index, 1);
        }
        saveCart(cart);
        renderCart();
      } else if (e.target.closest('.cart-item__remove')) {
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
      }
    });

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const cart = getCart();
        if (!cart.length) return;
        const lineItems = cart.map(item => `${item.variantId}:${item.qty}`).join(',');
        window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${lineItems}`;
      });
    }

    renderCart();
  }

})();
