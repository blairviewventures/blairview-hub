// ═══════════════════════════════════════════════════════════
// Blairview Ventures — shared scripts.js
// Used by /, /about/, /writing/
// All handlers gracefully no-op if target elements are absent.
// ═══════════════════════════════════════════════════════════

// ── Sticky nav shadow ──
const navEl = document.querySelector('nav');
if (navEl) {
  window.addEventListener('scroll', () => {
    navEl.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ── Mobile nav ──
const hamburger = document.getElementById('hamburger');
const drawer    = document.getElementById('drawer');

if (hamburger && drawer) {
  hamburger.addEventListener('click', () => {
    const open = drawer.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.addEventListener('click', e => {
    if (!drawer.contains(e.target) && !hamburger.contains(e.target)) closeDrawer();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
}
function closeDrawer() {
  if (!drawer || !hamburger) return;
  drawer.classList.remove('is-open');
  hamburger.classList.remove('is-open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// ── Formspree AJAX (homepage only — gracefully skips if form absent) ──
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('form-submit-btn');
const successMsg  = document.getElementById('form-success');

if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    submitBtn.textContent = 'Sending\u2026';
    submitBtn.disabled = true;
    try {
      const response = await fetch(contactForm.action, {
        method:  'POST',
        body:    new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        contactForm.reset();
        submitBtn.style.display = 'none';
        successMsg.style.display = 'block';
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', { event_category: 'contact', event_label: 'consulting_inquiry' });
        }
      } else {
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
        alert('Something went wrong. Please try again or reach out directly via email.');
      }
    } catch(err) {
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again or reach out directly via email.');
    }
  });
}

// ── Scroll reveals ──
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Pre-select contact form dropdown from engagement-type URL hash (homepage only) ──
(function() {
  const engagementSelect = document.getElementById('f-engagement');
  if (!engagementSelect) return;

  const typeMap = {
    'advisory':   'Senior Product Advisory',
    'fractional': 'Fractional Product Leadership',
    'coaching':   'Interview Coaching'
  };

  function selectOptionByText(text) {
    for (const opt of engagementSelect.options) {
      if (opt.text === text) {
        opt.selected = true;
        engagementSelect.dispatchEvent(new Event('change'));
        return true;
      }
    }
    return false;
  }

  function applyFromHash() {
    const hash = window.location.hash || '';
    const match = hash.match(/type=([a-z]+)/i);
    if (match && typeMap[match[1].toLowerCase()]) {
      selectOptionByText(typeMap[match[1].toLowerCase()]);
    }
  }

  applyFromHash();

  document.querySelectorAll('.eng-cta[data-engagement]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const engagementText = this.getAttribute('data-engagement');
      selectOptionByText(engagementText);
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      history.replaceState(null, '', '#contact');
    });
  });
})();
