/* The 100-Year Family — landing page behaviour
   1. Generations story (auto-plays when in view, click to explore)
   2. Founding Readers signup forms (POST to Formspree)
   No dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Generations story ---------- */
  var GENS = [
    { stat: '100%',   bar: 100, cap: 'One founder, one vision, and the cost of earning it still in his bones.' },
    { stat: '30%',    bar: 30,  cap: 'of family enterprises make it into the second generation.' },
    { stat: '10–15%', bar: 12,  cap: 'make it through the third. The family is now a network.' },
    { stat: '3–5%',   bar: 4,   cap: 'reach the fourth. What is left is often a name on a building.' }
  ];

  var panel = document.querySelector('.gen-panel');
  if (panel) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.gen-row'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.gen-btn'));
    var statEl = document.querySelector('.js-stat');
    var capEl = document.querySelector('.js-cap');
    var barEl = document.querySelector('.js-bar');
    var current = 0;
    var timer = null;
    var userTook = false;

    var show = function (g) {
      current = g;
      rows.forEach(function (row, i) {
        row.classList.toggle('is-active', i === g);
        row.classList.toggle('is-past', i < g);
      });
      buttons.forEach(function (b, i) { b.setAttribute('aria-pressed', i === g ? 'true' : 'false'); });
      statEl.textContent = GENS[g].stat;
      capEl.textContent = GENS[g].cap;
      barEl.style.width = GENS[g].bar + '%';
    };

    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var play = function () {
      if (timer || userTook || reduceMotion) return;
      timer = setInterval(function () { show((current + 1) % GENS.length); }, 2800);
    };

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        userTook = true;
        stop();
        show(parseInt(b.getAttribute('data-gen'), 10));
      });
    });

    show(0);

    if ('IntersectionObserver' in window) {
      var seen = false;
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            if (!seen) { seen = true; show(0); }
            play();
          } else {
            stop();
          }
        });
      }, { threshold: 0.35 }).observe(panel);
    } else {
      play();
    }
  }

  /* ---------- 2. Signup forms (Formspree) ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  Array.prototype.forEach.call(document.querySelectorAll('.js-signup'), function (form) {
    var success = form.parentNode.querySelector('.js-success');
    var errorEl = form.querySelector('.signup__error');
    var button = form.querySelector('button[type="submit"]');
    var buttonLabel = button.textContent;

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      errorEl.textContent = '';

      var email = (form.elements.email.value || '').trim();
      if (!EMAIL_RE.test(email)) {
        errorEl.textContent = 'Please enter a valid email address.';
        form.elements.email.focus();
        return;
      }

      // Everything in the form, including the hidden source/_subject/_gotcha fields.
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (el.name) data[el.name] = el.value;
      });
      data.email = email;

      button.disabled = true;
      button.textContent = 'Joining…';

      fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (res.ok && body.ok !== false) return;
            var msg = (body.errors && body.errors.length && body.errors[0].message) || body.error || 'Something went wrong. Please try again.';
            throw new Error(msg);
          });
        })
        .then(function () {
          form.hidden = true;
          if (success) { success.hidden = false; success.focus(); }
          if (window.va) { try { window.va('event', { name: 'signup', data: { source: data.source || 'site' } }); } catch (e) {} }
        })
        .catch(function (err) {
          errorEl.textContent = err.message || 'Something went wrong. Please try again.';
          button.disabled = false;
          button.textContent = buttonLabel;
        });
    });
  });

  /* ---------- footer year ---------- */
  var y = document.querySelector('.js-year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
