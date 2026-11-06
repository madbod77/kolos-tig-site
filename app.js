/* KOLOS TIG — рух за motion.md: «Шолом угору» + прохід дуги + відблиск на шві. */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduce = !window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';

  /* Шапка: поки CTA hero на екрані, кнопка шапки — контур (одна основна дія на екрані). */
  var heroCta = document.getElementById('hero-cta');
  if (heroCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      document.body.classList.toggle('hero-on', es[0].isIntersecting);
    }).observe(heroCta);
  }

  if (reduce || !hasGsap) { html.classList.remove('intro'); return; }
  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  var EASE_IN = 'expo.out', EASE_MOVE = 'power2.inOut';
  var lens = document.querySelector('.lens');
  var img = lens && lens.querySelector('img');
  var arcBox = lens && lens.querySelector('.arc');
  var poster = lens && lens.querySelector('.arc__poster');
  var ARC_UV = [0.205, 0.813]; // кінчик пальника на older-1 (903×1199)

  /* Де дуга в обрізаному object-fit: cover кадрі (частки боксу). */
  function arcPoint() {
    var w = lens.clientWidth, h = lens.clientHeight, iw = 903, ih = 1199;
    var s = Math.max(w / iw, h / ih), rw = iw * s, rh = ih * s;
    var pos = getComputedStyle(img).objectPosition.split(' ');
    var px = parseFloat(pos[0]) / 100, py = parseFloat(pos[1]) / 100;
    var ox = (w - rw) * px, oy = (h - rh) * py;
    return { x: (ox + ARC_UV[0] * rw) / w, y: (oy + ARC_UV[1] * rh) / h, w: w, h: h };
  }

  /* ---------- WebGL-дуга (сирий WebGL1, без бібліотек) ---------- */
  function makeArc(box, mobile) {
    var c = document.createElement('canvas');
    var gl = c.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) return null;
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = [
      'precision mediump float;',
      'uniform vec2 uRes;uniform vec2 uPos;uniform float uI;uniform float uT;uniform float uE;',
      'float h(float n){return fract(sin(n)*43758.5453);}',
      'float n1(float x){float i=floor(x),f=fract(x);return mix(h(i),h(i+1.),f*f*(3.-2.*f));}',
      'void main(){',
      ' float S=min(uRes.x,uRes.y);',
      ' vec2 p=(gl_FragCoord.xy-uPos)/S; float d=length(p);',
      ' float fl=.74+.2*n1(uT*41.)+.14*n1(uT*97.+3.1);',
      ' float I=uI*fl;',
      ' float core=exp(-d*d*2200.);',
      ' float halo=.022/(d+.022); halo*=halo;',
      ' float streak=exp(-abs(p.y)*170.)*exp(-abs(p.x)*4.2);',
      ' vec3 blue=vec3(.42,.77,1.); vec3 lilac=vec3(.66,.6,1.);',
      ' vec3 col=vec3(.97,.99,1.)*core*I*1.7 + mix(blue,lilac,smoothstep(0.,.25,d))*halo*I*1.15 + blue*streak*I*.6;',
      ' col+=blue*.07*I*exp(-d*2.6);',
      ' col+=vec3(1.,.74,.52)*exp(-d*d*1400.)*uE*.85;',
      ' gl_FragColor=vec4(col,1.);',
      '}'
    ].join('\n');
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    var pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['uRes', 'uPos', 'uI', 'uT', 'uE'].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });
    var dpr = Math.min(window.devicePixelRatio || 1, 2) * (mobile ? 0.5 : 0.75);
    box.appendChild(c);
    var pt = { x: .2, y: .8 };
    function size() {
      var a = arcPoint(); pt = a;
      c.width = Math.max(1, Math.round(a.w * dpr)); c.height = Math.max(1, Math.round(a.h * dpr));
      gl.viewport(0, 0, c.width, c.height);
    }
    size();
    return {
      canvas: c,
      draw: function (I, E, t) {
        gl.uniform2f(U.uRes, c.width, c.height);
        gl.uniform2f(U.uPos, pt.x * c.width, (1 - pt.y) * c.height);
        gl.uniform1f(U.uI, I); gl.uniform1f(U.uE, E); gl.uniform1f(U.uT, t);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      live: function () { c.classList.add('is-live'); },
      dispose: function () { c.remove(); var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }
    };
  }

  /* ---------- «Шолом угору» ---------- */
  function intro() {
    if (!lens || !html.classList.contains('intro')) return;
    if (window.scrollY > 200) { html.classList.remove('intro'); return; }
    var mobile = window.innerWidth < 1021;
    var a = arcPoint();
    // віконце фільтра навколо дуги
    var wl = Math.max(0.02, a.x - 0.17), wr = Math.max(0.02, 1 - (a.x + (mobile ? 0.42 : 0.40)));
    var wt = Math.max(0.04, a.y - (mobile ? 0.38 : 0.34)), wb = Math.max(0.03, 1 - (a.y + 0.10));
    var win = 'inset(' + (wt * 100).toFixed(1) + '% ' + (wr * 100).toFixed(1) + '% ' + (wb * 100).toFixed(1) + '% ' + (wl * 100).toFixed(1) + '% round 14px)';
    lens.style.setProperty('--ax', (a.x * 100) + '%'); lens.style.setProperty('--ay', (a.y * 100) + '%');

    var tint = lens.querySelector('.lens__tint');
    var lines = document.querySelectorAll('.hero h1 .ln > span');
    var sub = document.querySelector('.hero__sub');
    var metals = document.querySelector('.hero__metals');
    var cap = document.querySelector('.hero__photo figcaption');

    // явні стартові стани inline (той самий вигляд, що й .intro), тоді знімаємо клас
    gsap.set(lens, { clipPath: win });
    gsap.set(img, { filter: 'brightness(0.34) saturate(0.35)' });
    gsap.set(tint, { opacity: 1 });
    gsap.set(lines, { y: 0, yPercent: 105 }); // y: 0 — інакше GSAP читає CSS translateY(105%) як пікселі (R15 пастка 4)
    gsap.set(sub, { opacity: 0, y: 14 });
    gsap.set([metals, cap], { opacity: 0 });
    html.classList.remove('intro');

    var arc = makeArc(arcBox, mobile);
    var st = { i: 0, e: 0 }, t0 = performance.now(), running = true;
    function frame(now) {
      if (!running) return;
      if (arc) arc.draw(st.i, st.e, (now - t0) / 1000);
      requestAnimationFrame(frame);
    }
    if (arc) { arc.draw(0, 0, 0); requestAnimationFrame(function () { requestAnimationFrame(function () { arc.live(); }); }); requestAnimationFrame(frame); }

    var tl = gsap.timeline({
      onComplete: function () {
        running = false;
        if (arc) arc.dispose();
        gsap.set(lens, { clearProps: 'clipPath' });
        gsap.set(img, { clearProps: 'filter' });
      }
    });
    // дуга: удар, мерехтіння, згасання, жаринка
    tl.to(st, { i: 1.4, duration: .09, ease: 'power4.out' }, .06)
      .to(st, { i: 1, duration: .16, ease: 'power2.out' }, .15)
      .to(st, { i: 0, duration: .24, ease: 'expo.in' }, .58)
      .to(st, { e: 1, duration: .06, ease: 'none' }, .76)
      .to(st, { e: 0, duration: .55, ease: 'power2.out' }, .82);
    if (!arc && poster) {
      tl.fromTo(poster, { opacity: 0 }, { opacity: 1, duration: .09, ease: 'power4.out' }, .06)
        .to(poster, { keyframes: [{ opacity: .78, duration: .07 }, { opacity: 1, duration: .05 }, { opacity: .7, duration: .08 }, { opacity: .95, duration: .06 }, { opacity: .85, duration: .08 }], ease: 'none' }, .15)
        .to(poster, { opacity: 0, duration: .24, ease: 'expo.in' }, .58);
    }
    // текст: Support, накладається на дугу
    tl.to(lines[0], { yPercent: 0, duration: .8, ease: EASE_IN }, .14)
      .to(lines[1], { yPercent: 0, duration: .8, ease: EASE_IN }, .23)
      .to(sub, { opacity: 1, y: 0, duration: .5, ease: EASE_IN }, .42);
    // шолом угору: віконце → повний кадр, фільтр → ясно (наслідок згаслої дуги)
    tl.fromTo(lens, { clipPath: win }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: .82, ease: EASE_MOVE }, .78)
      .fromTo(img, { filter: 'brightness(0.34) saturate(0.35)' }, { filter: 'brightness(1) saturate(1)', duration: .82, ease: EASE_MOVE }, .78)
      .to(tint, { opacity: 0, duration: .82, ease: EASE_MOVE }, .78)
      .to([metals, cap], { opacity: 1, duration: .5, ease: 'power1.out' }, 1.1);
  }

  /* ---------- прокрутка ---------- */
  function scrollMotion() {
    if (!window.ScrollTrigger) return;
    var mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', function () {
      // перехід hero → метали: маска опускається (scrub)
      var shade = document.querySelector('.lens__shade');
      if (shade) gsap.fromTo(shade, { opacity: 0 }, { opacity: .78, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'center top', scrub: true } });
      // відблиск дуги вздовж шва на великій плитці
      var glint = document.querySelector('.glint');
      if (glint) gsap.fromTo(glint, { x: 0, xPercent: -130, rotation: 50 }, { xPercent: 470, rotation: 50, ease: 'none', scrollTrigger: { trigger: '.tile--a', start: 'top 80%', end: 'bottom 20%', scrub: true } });
      // шов між кроками: горизонтальний на desktop, вертикальний на телефоні
      var seam = document.querySelector('.steps__seam'), track = document.querySelector('.steps__track');
      if (seam && track) {
        var wide = window.matchMedia('(min-width: 1021px)').matches;
        gsap.fromTo(seam, wide ? { scaleX: 0 } : { scaleY: 0 }, Object.assign(wide ? { scaleX: 1 } : { scaleY: 1 },
          { ease: 'none', scrollTrigger: { trigger: track, start: 'top 80%', end: wide ? 'top 40%' : 'bottom 55%', scrub: true } }));
      }
    });
  }

  /* Входи нижче екрана: ставляться лише після першої реальної прокрутки й лише для того, що ще під екраном
     (fail-open: без прокрутки, на скриншоті повної сторінки, без JS — усе видно). */
  function entrances() {
    if (!window.ScrollTrigger) return;
    var armed = false;
    function below(el) { return el.getBoundingClientRect().top > window.innerHeight * 0.96; }
    function arm() {
      if (armed || window.scrollY < 4) return;
      armed = true; window.removeEventListener('scroll', arm);
      var ST = window.ScrollTrigger;

      // H2 — прохід дуги (Lead секції)
      document.querySelectorAll('.sweep').forEach(function (h) {
        if (!below(h)) return;
        var bar = document.createElement('span'); bar.className = 'arcbar'; bar.setAttribute('aria-hidden', 'true'); h.appendChild(bar);
        gsap.set(h, { clipPath: 'inset(-12% 100% -12% 0%)' });
        ST.create({ trigger: h, start: 'clamp(top 84%)', once: true, onEnter: function () {
          var w = h.getBoundingClientRect().width;
          gsap.timeline({ onComplete: function () { gsap.set(h, { clearProps: 'clipPath' }); bar.remove(); } })
            .fromTo(h, { clipPath: 'inset(-12% 100% -12% 0%)' }, { clipPath: 'inset(-12% 0% -12% 0%)', duration: .8, ease: EASE_IN }, 0)
            .fromTo(bar, { x: 0, opacity: 1 }, { x: w - 3, duration: .8, ease: EASE_IN }, 0)
            .to(bar, { opacity: 0, duration: .18, ease: 'power1.in' }, .34);
        } });
      });

      // метали: Support за H2, затримки зменшуються
      var rows = [].filter.call(document.querySelectorAll('.metal'), below);
      if (rows.length) {
        gsap.set(rows, { opacity: 0, y: 14 });
        ST.create({ trigger: '.metals__list', start: 'clamp(top 85%)', once: true, onEnter: function () {
          var d = [0, .1, .17];
          rows.forEach(function (r, i) { gsap.to(r, { opacity: 1, y: 0, duration: .5, delay: .12 + (d[i] || .2), ease: EASE_IN }); });
        } });
      }

      // галерея: велика плитка — Lead, решта — тим самим жестом з накладанням
      var tiles = [].filter.call(document.querySelectorAll('.tile .tile__img, .master__photo'), below);
      if (tiles.length) {
        var delays = [0, .05, .1, .14, .17, .2];
        gsap.set(tiles, { clipPath: 'inset(100% 0% 0% 0%)' });
        tiles.forEach(function (t, i) {
          ST.create({ trigger: t, start: 'clamp(top bottom)', once: true, onEnter: function () {
            var big = t.closest('.tile--a') || t.classList.contains('master__photo');
            gsap.to(t, { clipPath: 'inset(0% 0% 0% 0%)', duration: big ? .6 : .45, delay: big ? 0 : delays[(i % 3) + 1], ease: EASE_MOVE,
              onComplete: function () { gsap.set(t, { clearProps: 'clipPath' }); } });
          } });
        });
      }
    }
    window.addEventListener('scroll', arm, { passive: true });
  }

  function start() { intro(); scrollMotion(); entrances(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
})();
