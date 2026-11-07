/* KOLOS TIG, цикл 3. Рух за motion.md: розкрій на завантаженні, «розгортка → бак» на прокрутці. Лише transform/opacity/clip-path. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- фільтр журналу марками (працює і без анімацій) ---------- */
  var buttons = $$('.grades button'), entries = $$('.log .entry'), status = $('#grade-status');
  var quick = matchMedia('(prefers-reduced-motion: reduce)').matches;
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var g = b.getAttribute('data-grade'), shown = 0;
      buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      entries.forEach(function (e) {
        var on = g === 'all' || e.getAttribute('data-grade') === g;
        if (on) { shown++; e.hidden = false; requestAnimationFrame(function () { e.classList.remove('is-out'); }); }
        else if (!e.hidden) {
          e.classList.add('is-out');
          if (quick) e.hidden = true; else setTimeout(function () { if (e.classList.contains('is-out')) e.hidden = true; }, 190);
        }
      });
      if (status) status.textContent = 'Показано ' + shown + ' з ' + entries.length + ' карт';
    });
  });

  // «алюміній у журналі» з основного напису: відкриває журнал з фільтром
  $$('[data-jump]').forEach(function (a) {
    a.addEventListener('click', function () {
      var b = $('.grades button[data-grade="' + a.getAttribute('data-jump') + '"]'); if (b) b.click();
    });
  });

  /* ---------- нижня кнопка телефону: ховається, поки видно перший екран з телефоном ---------- */
  // і поки йде сцена «Карта 1» (там маршрут унизу екрана); телефон лишається в шапці
  // і поки гортається журнал: там під шапкою прилипає стрічка фільтра, а низ екрана лишається для карт і цін
  var dock = $('.dock'), card1 = $('.card1'), journal = $('#journal');
  if (dock && card1 && 'IntersectionObserver' in window) {
    var seen = { card1: true, journal: false };
    var apply = function () {
      var hide = seen.card1 || seen.journal;
      dock.classList.toggle('is-hidden', hide);
      root.classList.toggle('dock-on', !hide); // на мобільному телефон у шапці поступається нижній кнопці
    };
    new IntersectionObserver(function (es) { seen.card1 = es[0].isIntersecting; apply(); }).observe(card1);
    if (journal) new IntersectionObserver(function (es) { seen.journal = es[0].isIntersecting; apply(); },
      { rootMargin: '-30% 0px -30% 0px' }).observe(journal);
  }

  if (!window.gsap || !window.ScrollTrigger || !root.classList.contains('fold-ready')) return;
  window.__kolosReady = true;
  gsap.registerPlugin(ScrollTrigger);

  var dev = $('.dev'), laser = $('.laser');
  var P = { base: $('.base'), front: $('.front'), back: $('.back'), lid: $('.lid'), left: $('.wall.left'), right: $('.wall.right') };
  var seams = $$('.seam'), steel = $$('.seam u'), tacks = $$('.tack'), photo = $('.result img'), ops = $$('.route__ops li');
  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    /* стан до сцени: плаский аркуш (ставимо явно, щоб GSAP не читав matrix3d) */
    var box = $('.box');
    gsap.set(dev, { rotationX: 0, scale: 1 }); gsap.set(box, { rotation: 0 });
    gsap.set('h1 .ln > span', { y: 0, yPercent: 105 });
    gsap.set([P.front, P.back, P.lid], { rotationX: 0 });
    gsap.set([P.left, P.right], { rotationY: 0 });
    gsap.set(seams, { scaleX: 0 }); gsap.set(steel, { opacity: 0 }); gsap.set(tacks, { scale: 0 });

    /* ---------- 1. Розкрій (завантаження) ---------- */
    var u = dev.offsetWidth / 3.6;
    // за motion.md 5.1: спершу контур дна (0–420 мс), далі лазер іде лінією гибу до кришки й обходить зовнішній контур
    var pts = [[1, 1.5], [2.6, 1.5], [2.6, 2.5], [1, 2.5], [1, 1.5], [1, 0], [2.6, 0], [2.6, 1.5], [3.6, 1.5], [3.6, 2.5], [2.6, 2.5], [2.6, 3.5], [1, 3.5], [1, 2.5], [0, 2.5], [0, 1.5], [1, 1.5]];
    var intro = gsap.timeline({ defaults: { ease: 'none' }, onComplete: function () {
      gsap.set(Object.keys(P).map(function (k) { return P[k]; }), { clipPath: 'none' });
    } });
    intro.set(laser, { x: pts[0][0] * u, y: pts[0][1] * u, opacity: 1 }, 0);
    var t = 0;
    for (var i = 1; i < pts.length; i++) {
      var d = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]), dur = i <= 4 ? .42 * d / 5.2 : .72 * d / 13.1;
      intro.to(laser, { x: pts[i][0] * u, y: pts[i][1] * u, duration: dur }, t); t += dur;
    }
    intro.to(laser, { opacity: 0, duration: .2 }, t);
    // панелі відкриваються в порядку різу (затримки нерівні — за маршрутом лазера)
    intro.fromTo(P.base, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .42 }, 0)
      .fromTo(P.back, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .38 }, .12)
      .fromTo(P.right, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .38 }, .3)
      .fromTo(P.front, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .38 }, .42)
      .fromTo(P.left, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .38 }, .6)
      .fromTo(P.lid, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .36 }, .78)
      .fromTo('.dim', { opacity: 0 }, { opacity: 1, duration: .4 }, 1);
    // заголовок з першого кадру; кнопки телефону стоять статично — дія не чекає анімацію
    intro.fromTo('h1 .ln > span', { yPercent: 105 }, { yPercent: 0, duration: .9, ease: 'expo.out', stagger: .11 }, 0)
      .fromTo('.lead', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5, ease: 'expo.out' }, .3);

    /* ---------- 2. Розгортка → бак (прокрутка, scrub) ---------- */
    var fold = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: '.run', start: function () { return 'top ' + ($('.top').offsetHeight) + 'px'; }, end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true
    } });
    var seg = function (target, vars, a, b) { fold.to(target, Object.assign({ duration: b - a }, vars), a); };
    seg(dev, { rotationX: 56, scale: 1.12, ease: 'power2.inOut' }, 0, .14);
    seg(box, { rotation: -38, ease: 'power2.inOut' }, 0, .14);
    seg(P.front, { rotationX: 90, ease: 'power2.inOut' }, .12, .34);
    seg(P.back, { rotationX: -90, ease: 'power2.inOut' }, .15, .36);
    seg(P.left, { rotationY: 90, ease: 'power2.inOut' }, .24, .44);
    seg(P.right, { rotationY: -90, ease: 'power2.inOut' }, .27, .46);
    fold.to(tacks, { scale: 1, duration: .03, stagger: { each: .018 }, ease: 'back.out(3)' }, .46);
    fold.to(seams, { scaleX: 1, duration: .1, stagger: { each: .025 } }, .5);
    // побіжалість (солома → синій) тримається повною до .76 — довгий відрізок прокрутки з кольоровим швом
    fold.to(steel, { opacity: .4, duration: .06, stagger: { each: .02 } }, .76);
    // desktop: на час зварювання бак наближається, щоб шви й побіжалість читались
    if (matchMedia('(min-width: 900px)').matches) seg(dev, { scale: 1.95, ease: 'power2.inOut' }, .36, .5);
    seg(P.lid, { rotationX: -90, ease: 'power2.inOut' }, .68, .8);
    // передача: заголовок і телефон поступаються маршрутній карті, коли починається складання
    fold.to('.intro', { autoAlpha: 0, y: -24, duration: .08, ease: 'power2.inOut' }, .02)
      .fromTo('.route', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .08, ease: 'expo.out' }, .07);
    // фінал: справжнє фото відкривається поверх схеми, схема гасне до .15
    fold.fromTo(photo, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .12, ease: 'power2.inOut' }, .82)
      .to(dev, { opacity: .15, duration: .1 }, .84);
    fold.fromTo('.result figcaption', { opacity: 0 }, { opacity: 1, duration: .05 }, .92);
    fold.to('.bench__note', { opacity: 0, duration: .06 }, .1);
    // рядки маршруту лишаються читабельними; поточна операція — чорнило й синя риска (клас, без руху макета)
    var marks = ops.map(function (li) { return parseFloat(li.getAttribute('data-at')) || 0; });
    fold.eventCallback('onUpdate', function () {
      var p = fold.progress();
      ops.forEach(function (li, n) { li.toggleAttribute('data-on', p >= marks[n] - .01); });
    });
    fold.to({}, { duration: .04 }, .96); // тримаємо фінальний кадр до кінця сцени

    /* ---------- 3. Лінії рамки аркуша між секціями ---------- */
    $$('.rule').forEach(function (r) {
      // лінія креслиться разом з прокруткою секції: від її верху до заголовка наступної
      gsap.fromTo(r, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: r.parentNode, start: 'top 85%', end: 'bottom 70%', scrub: true } });
    });

    /* ---------- 4. Шви крупно: «відкрити кадр» від лінії шва (fail-open: ховаємо лише після першої прокрутки) ---------- */
    var from = { 'ph--a': 'inset(0% 0% 100% 0%)', 'ph--b': 'inset(0% 100% 0% 0%)', 'ph--c': 'inset(0% 0% 0% 100%)', 'ph--d': 'inset(100% 0% 0% 0%)' };
    var delays = [0, .08, .2, .26];
    var armed = false;
    var arm = function () {
      if (armed) return; armed = true;
      $$('.ph').forEach(function (f, n) {
        if (f.getBoundingClientRect().top < innerHeight) return;
        var img = $('img', f), key = Object.keys(from).filter(function (k) { return f.classList.contains(k); })[0];
        gsap.set(img, { clipPath: from[key] });
        ScrollTrigger.create({ trigger: f, start: 'top 85%', once: true, onEnter: function () {
          gsap.to(img, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, delay: delays[n] || 0, ease: 'expo.out' });
        } });
      });
    };
    addEventListener('scroll', arm, { once: true, passive: true });

    return function () { removeEventListener('scroll', arm); };
  });

  // reduced motion змінився на ходу: повертаємо статичний зібраний стан
  mm.add('(prefers-reduced-motion: reduce)', function () { root.classList.remove('fold-ready'); });
})();
