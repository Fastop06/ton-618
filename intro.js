/* ═══════════════════════════════════════════════════════
   TON 618 — intro film
   a wall of English words → two waves → letters break,
   heat up and stretch into lines → accretion disk →
   the disk keeps turning, forever, as the site's hero
   ═══════════════════════════════════════════════════════ */
(() => {
  const intro    = document.getElementById('intro');
  const canvas   = document.getElementById('intro-canvas');
  const skipBtn  = document.getElementById('intro-skip');
  const site     = document.getElementById('site');
  const root     = document.documentElement;
  if (!intro || !canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (site) site.inert = true;

  const ctx = canvas.getContext('2d', { alpha: true });
  const layer = document.createElement('canvas');
  const lctx = layer.getContext('2d', { alpha: true });
  const TAU = Math.PI * 2;

  /* timeline, seconds */
  const T = {
    wave1: 2.0,
    wave2: 2.9,
    hole: 3.55,
    collapse: 3.8,
    drift: 7.9,
    title: 8.9,
    freeze: 9.55,
    ready: 10.4
  };

  /* ambient mode: after the page opens the disk never stops turning */
  const SPIN_RATE = 0.11;     /* radians per second at full speed */
  const SPIN_RAMP = 2.5;      /* seconds to ease the rotation in */

  const WORDS = (
    'the of and to in is you that it he was for on are as with his they at be this have from or one had by ' +
    'word but not what all were we when your can said there use an each which she do how their if will up ' +
    'other about out many then them these so some her would make like him into time has look two more write ' +
    'go see number no way could people my than first water been call who its now find long down day did get ' +
    'come made may part over new sound take only little work know place year live me back give most very ' +
    'after thing our just name good sentence man think say great where help through much before line right ' +
    'too mean old any same tell boy follow came want show also around form three small set put end does ' +
    'another well large must big even such because turn here why ask went men read need land different home ' +
    'us move try kind hand picture again change off play spell air away animal house point page letter ' +
    'mother answer found study still learn should world gravity orbit horizon signal escape velocity drift ' +
    'momentum absorb light dark matter space star dust spin pull weight fall rise quiet distant near ' +
    'language voice phrase meaning memory pattern habit practice speak listen repeat notice wonder ' +
    'clear subtle vivid simple patient curious fluent precise natural calm brave honest tiny vast ' +
    'silent bright warm cold slow fast early late always never almost enough another between beyond'
  ).split(/\s+/);

  const D0 = 4.0;
  const F  = 4.0;
  const CY0 = 0.06;

  let W = 0, H = 0, DPR = 1, U0 = 1;
  let words = [], letters = [], stars = [];
  let totalLetters = 0, eaten = 0;

  let startTime = 0, lastFrame = 0, elapsed = 0, simTime = 0;
  let raf = 0, finished = false, titleShown = false;
  let spin = 0;              /* ambient rotation of the disk, radians */
  let ambT = 0;              /* ambient clock for pulses and twinkle */
  let ambLast = 0, ambLive = false;

  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp  = (a, b, k) => a + (b - a) * k;
  const sstep = (a, b, x) => {
    const u = clamp((x - a) / (b - a), 0, 1);
    return u * u * (3 - 2 * u);
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const rad = d => d * Math.PI / 180;

  const FONT = 'Menlo, "SF Mono", "Cascadia Mono", Consolas, monospace';

  /* ───────── wall of words ───────── */
  function buildWall() {
    const fs = W < 640 ? 8 : W < 1100 ? 9 : 10;
    const charW = fs * 0.62;
    const lineH = Math.max(11, Math.round(fs * 1.6));
    const pad = 6;
    const gapW = charW * 1.8;
    const rows = Math.ceil(H / lineH) + 1;

    words = [];
    letters = [];
    totalLetters = 0;
    eaten = 0;

    let wi = 7;
    for (let r = 0; r < rows; r++) {
      const y = pad + r * lineH + lineH * 0.5;
      const items = [];
      let used = 0;

      while (true) {
        const text = WORDS[wi % WORDS.length];
        wi++;
        const wWidth = text.length * charW;
        const add = wWidth + (items.length ? gapW : 0);
        if (used + add > W - pad * 2) break;
        items.push({ text, wWidth });
        used += add;
      }
      if (!items.length) continue;

      const gaps = Math.max(1, items.length - 1);
      const extra = Math.max(0, (W - pad * 2 - used) / gaps);
      let x = pad;

      for (const it of items) {
        const wxPx = x + it.wWidth / 2;
        const wyPx = y;
        const rnd = Math.random();
        const color = rnd < 0.075 ? [255, 192, 138]
                    : rnd < 0.13  ? [255, 213, 138]
                    : [224, 216, 204];

        const word = {
          text: it.text,
          wx: (wxPx - W / 2) / U0,
          wy: -(wyPx - H / 2) / U0 - CY0,
          color,
          alpha: 0.28 + Math.pow(Math.random(), 1.15) * 0.6,
          size: fs,
          weight: Math.random() < 0.12 ? 600 : 400,
          flyS: rand(0, 0.52),
          flyT: 0.85,
          flyZ: rand(0.35, 0.95),
          flyA: rand(0, TAU),
          letters: [],
          tauMin: 99
        };

        for (let c = 0; c < it.text.length; c++) {
          const lx = x + c * charW + charW / 2;
          const lwx = (lx - W / 2) / U0;
          const lwy = -(y - H / 2) / U0 - CY0;
          const r0 = Math.hypot(lwx, lwy);
          const th0 = Math.atan2(lwy, lwx);

          const L = {
            ch: it.text[c],
            word,
            r0, th0,
            r: r0, th: th0,
            tau: 0, dur: 1, k: 0,
            heat: 0, flat: 0,
            alive: true,
            size: fs,
            color,
            alpha: word.alpha,
            prevX: null, prevY: null
          };

          word.letters.push(L);
          letters.push(L);
        }

        words.push(word);
        x += it.wWidth + gapW + extra;
      }
    }

    totalLetters = letters.length;

    let RMAX = 0.5;
    for (const L of letters) if (L.r0 > RMAX) RMAX = L.r0;

    for (const L of letters) {
      const k = L.r0 / RMAX;
      L.tau = T.collapse + 2.9 * Math.pow(k, 1.3) + rand(0, 0.35);
      L.dur = 2.2 + 3.9 * k + rand(-0.2, 0.2);
      L.k = (L.r0 * L.r0 - 0.0036) / Math.max(0.4, L.dur);
      L.word.tauMin = Math.min(L.word.tauMin, L.tau);
    }
  }

  function makeStars() {
    stars = [];
    const n = Math.round(clamp(W * H / 9000, 70, 220));
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: rand(0.4, 1.3),
        a: rand(0.12, 0.55),
        p: Math.random() * TAU,
        sp: rand(0.3, 1.2)
      });
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width  = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    layer.width  = canvas.width;
    layer.height = canvas.height;
    lctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    U0 = H / 2;
    buildWall();
    makeStars();

    if (finished) {
      fastForward(T.freeze);
      draw(T.freeze, 1 / 60);
    } else if (elapsed > 0.2 && elapsed < T.ready) {
      fastForward(elapsed);
    }
  }

  /* ───────── physics ───────── */
  function holeRadius(t) {
    const frac = totalLetters ? eaten / totalLetters : 0;
    return (0.058 + 0.072 * frac) * sstep(T.hole, T.hole + 0.9, t);
  }

  function stepSim(t, dt) {
    const rh = holeRadius(t);

    for (const L of letters) {
      if (!L.alive) continue;

      if (t >= L.tau) {
        const spin = sstep(L.tau, L.tau + 0.75, t);
        const dr = -L.k / (2 * Math.max(L.r, 0.001)) * dt;
        L.r = Math.sqrt(Math.max(L.r * L.r + 2 * L.r * dr, 0.0001));
        const omega = 0.6 * Math.pow(Math.max(L.r, 0.14), -1.5) * spin;
        L.th += omega * dt;

        if (L.r < rh * 1.03 + 0.0035) {
          L.alive = false;
          eaten++;
        }
      }

      L.heat = sstep(L.tau, L.tau + 1.25, t);
      L.flat = sstep(L.tau, L.tau + 1.95, t);
    }
  }

  function fastForward(t) {
    for (const L of letters) {
      L.r = L.r0;
      L.th = L.th0;
      L.alive = true;
      L.heat = 0;
      L.flat = 0;
      L.prevX = null;
      L.prevY = null;
    }
    eaten = 0;

    const stepDt = 1 / 30;
    for (let s = 0; s < t; s += stepDt) {
      stepSim(Math.min(s + stepDt, t), Math.min(stepDt, t - s));
    }
    simTime = t;
  }

  function lensRadius(r, rh) {
    const rE = 1.5 * rh;
    return (r + Math.sqrt(r * r + 4 * rE * rE)) / 2;
  }

  function tempColor(r) {
    const k = clamp((0.8 - r) / 0.68, 0, 1);
    if (k < 0.5) {
      const u = k * 2;
      return [lerp(185, 255, u), lerp(28, 100, u), lerp(38, 22, u)];
    }
    const u = (k - 0.5) * 2;
    return [255, lerp(100, 232, u), lerp(22, 170, u)];
  }

  /* ───────── waves ───────── */
  function wavesAt(t) {
    const out = [];
    const maxR = Math.hypot(W, H) * 0.6;
    const cfg = [
      { at: T.wave1, dur: 1.15, power: 1.0 },
      { at: T.wave2, dur: 0.8, power: 1.5 }
    ];

    for (const c of cfg) {
      const p = (t - c.at) / c.dur;
      if (p <= 0 || p >= 1) continue;
      out.push({
        p,
        radius: easeOutCubic(p) * maxR,
        width: Math.max(70, maxR * 0.13) * (1 - p * 0.2),
        strength: (1 - p * 0.55) * c.power
      });
    }
    return out;
  }

  function drawWaves(waves, hp) {
    for (const w of waves) {
      const fade = (1 - w.p) * 0.8 + 0.2;
      const g = ctx.createRadialGradient(hp.x, hp.y, Math.max(1, w.radius - w.width),
                                              hp.x, hp.y, w.radius + w.width);
      g.addColorStop(0,    'rgba(255,255,255,0)');
      g.addColorStop(0.40, `rgba(255,190,130,${0.07 * fade * w.strength})`);
      g.addColorStop(0.49, `rgba(255,236,212,${0.30 * fade * w.strength})`);
      g.addColorStop(0.51, `rgba(255,210,165,${0.24 * fade * w.strength})`);
      g.addColorStop(0.62, `rgba(255,150,100,${0.06 * fade * w.strength})`);
      g.addColorStop(1,    'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, w.radius, 0, TAU);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = `rgba(255,238,215,${0.30 * fade * w.strength})`;
      ctx.shadowColor = 'rgba(255,180,120,.8)';
      ctx.shadowBlur = 22;
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ───────── camera ───────── */
  function zoomAt(t) {
    if (t < 0.7) return 2.2;
    if (t < 2.0) return lerp(2.2, 1.0, sstep(0.7, 2.0, t));
    if (t < 6.2) return lerp(1.0, 1.15, sstep(2.0, 6.2, t));
    if (t < 8.2) return lerp(1.15, 1.45, sstep(6.2, 8.2, t));
    return lerp(1.45, 1.34, sstep(8.2, 9.6, t));
  }

  function elevAt(t) {
    return rad(20 * sstep(1.6, 5.0, t)
      + 2.2 * Math.sin(t * 0.7) * sstep(3, 6, t)
      + 3 * sstep(8.0, 9.6, t));
  }

  function azimAt(t) {
    return rad(10 * sstep(2.0, 6.5, t) + 8 * sstep(T.drift, 9.5, t));
  }

  function shakeAt(t) {
    let amp = 0.003 * sstep(6.0, 7.0, t);
    if (t > 7.0) amp += 0.025 * Math.exp(-(t - 7.0) * 5);
    return [
      amp * (Math.sin(t * 71) + 0.5 * Math.sin(t * 113)),
      amp * (Math.sin(t * 83 + 1) + 0.5 * Math.sin(t * 131))
    ];
  }

  function cameraAt(t) {
    const D = D0 / zoomAt(t);
    const el = elevAt(t) + rad(1.2 * Math.sin(ambT * 0.3)), az = azimAt(t) + rad(1.5 * Math.sin(ambT * 0.21));
    const sh = shakeAt(t);

    const C = [
      sh[0] + D * Math.sin(az) * Math.cos(el),
      sh[1] + D * Math.sin(el),
      D * Math.cos(az) * Math.cos(el)
    ];

    const fl = Math.hypot(C[0], C[1], C[2]);
    const f = [-C[0] / fl, -C[1] / fl, -C[2] / fl];

    let rx = -f[2], ry = 0, rz = f[0];
    const rl = Math.hypot(rx, rz) || 1;
    rx /= rl; rz /= rl;

    const ux = ry * f[2] - rz * f[1];
    const uy = rz * f[0] - rx * f[2];
    const uz = rx * f[1] - ry * f[0];

    return { C, f, r: [rx, ry, rz], u: [ux, uy, uz], D, el, az };
  }

  function panX(t) {
    const amt = W < 800 ? 0.06 : 0.12;
    return -W * amt * sstep(T.drift, 9.45, t);
  }

  function projectPoint(x, y, z, cam, t) {
    const dx = x - cam.C[0], dy = y - cam.C[1], dz = z - cam.C[2];
    const zz = dx * cam.f[0] + dy * cam.f[1] + dz * cam.f[2];
    const zc = Math.max(zz, 0.04);
    const sx = F * (dx * cam.r[0] + dy * cam.r[1] + dz * cam.r[2]) / zc;
    const sy = F * (dx * cam.u[0] + dy * cam.u[1] + dz * cam.u[2]) / zc;
    return { x: W / 2 + sx * U0 + panX(t), y: H / 2 - sy * U0, z: zz };
  }

  /* ───────── stars / hole ───────── */
  function drawStars(t) {
    for (const s of stars) {
      const a = s.a * (0.6 + 0.4 * Math.sin(t * s.sp + s.p));
      ctx.fillStyle = `rgba(245,236,222,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fill();
    }
  }

  function drawHole(rhs, hp, t) {
    if (rhs < 0.8) return;
    const hx = hp.x, hy = hp.y;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(hx, hy, rhs * 0.7, hx, hy, rhs * 4.2);
    g.addColorStop(0, 'rgba(255,150,60,.18)');
    g.addColorStop(0.35, 'rgba(255,90,30,.065)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(hx, hy, rhs, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,228,186,.95)';
    ctx.lineWidth = Math.max(1.2, rhs * 0.028);
    ctx.shadowColor = 'rgba(255,170,80,.95)';
    ctx.shadowBlur = rhs * 0.75;
    ctx.beginPath();
    ctx.arc(hx, hy, rhs * 1.035, 0, TAU);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,235,210,.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(hx, hy, rhs, 0, TAU);
    ctx.stroke();
  }

  /* ───────── render ───────── */
  const LINE_COLORS = [
    [190, 35, 48], [224, 58, 26], [255, 92, 20],
    [255, 138, 42], [255, 188, 86], [255, 234, 178]
  ];
  const lineBuckets = [[], [], [], [], [], []];
  let lastFont = '';

  function setFont(weight, px) {
    const size = Math.max(1, Math.round(px * 2) / 2);
    const key = weight + ' ' + size.toFixed(1) + 'px ' + FONT;
    if (key !== lastFont) {
      lctx.font = key;
      lastFont = key;
    }
  }

  function draw(t, dt) {
    const cam = cameraAt(t);
    const rh = holeRadius(t);
    const hp = projectPoint(0, 0, 0, cam, t);
    const hz = Math.max(hp.z, 0.04);
    const vt = t + ambT;
    const rhs = F * rh / hz * U0 * (1 + 0.02 * Math.sin(t * 9) + 0.01 * Math.sin(ambT * 1.3));
    const waves = wavesAt(t);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);

    const halo = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, Math.max(W, H) * 0.8);
    halo.addColorStop(0, `rgba(36,17,10,${0.35 * clamp(rh * 8, 0, 1)})`);
    halo.addColorStop(0.4, `rgba(14,9,12,${0.5 * clamp(rh * 8, 0, 1)})`);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    drawStars(t + ambT);
    drawWaves(waves, hp);

    lctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    lctx.clearRect(0, 0, W, H);
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    lastFont = '';

    for (const b of lineBuckets) b.length = 0;

    for (const word of words) {
      if (t < word.tauMin) {
        /* intact word — one token */
        const e = clamp((t - word.flyS) / word.flyT, 0, 1);
        const fe = easeOutCubic(e);

        let wx = word.wx, wy = word.wy;
        const r = Math.hypot(wx, wy);
        const rl = lensRadius(r, rh);
        const th = Math.atan2(wy, wx) + spin;
        wx = rl * Math.cos(th);
        wy = rl * Math.sin(th);

        const off = (1 - fe) * 0.35;
        wx += off * Math.cos(word.flyA);
        wy += off * Math.sin(word.flyA);
        const wz = (1 - fe) * word.flyZ;

        const p = projectPoint(wx, wy, wz, cam, t);
        if (p.z <= 0.08) continue;
        if (p.x < -140 || p.x > W + 140 || p.y < -80 || p.y > H + 80) continue;

        let bright = 0;
        for (const wv of waves) {
          const dd = Math.hypot(p.x - hp.x, p.y - hp.y);
          const diff = Math.abs(dd - wv.radius);
          if (diff < wv.width) bright += (1 - diff / wv.width) * wv.strength;
        }

        const fs = word.size;
        const alpha = clamp(word.alpha * (0.55 + 0.45 * fe) * (1 + 0.6 * bright), 0, 1);
        setFont(word.weight, fs);
        lctx.fillStyle = `rgba(${word.color[0]},${word.color[1]},${word.color[2]},${alpha.toFixed(3)})`;
        lctx.fillText(word.text, p.x, p.y);
        continue;
      }

      /* the word has broken into letters */
      for (const L of word.letters) {
        if (!L.alive) continue;

        let x, y, z;
        if (t < L.tau) {
          const rl = lensRadius(L.r0, rh);
          x = rl * Math.cos(L.th0);
          y = rl * Math.sin(L.th0);
          z = 0;
        } else {
          const r = L.r, th = L.th + spin, phi = L.flat * (Math.PI / 2);
          x = r * Math.cos(th);
          y = r * Math.sin(th) * Math.cos(phi);
          z = -r * Math.sin(th) * Math.sin(phi);
        }

        const p = projectPoint(x, y, z, cam, t);
        if (p.z <= 0.08) { L.prevX = null; continue; }

        let px = p.x, py = p.y;
        let waveBright = 0;

        if (t < L.tau) {
          for (const wv of waves) {
            const dd = Math.hypot(px - hp.x, py - hp.y) || 1;
            const diff = Math.abs(dd - wv.radius);
            if (diff < wv.width) {
              const f = (1 - diff / wv.width) * wv.strength;
              waveBright += f;
              px += (px - hp.x) / dd * f * 9;
              py += (py - hp.y) / dd * f * 9;
            }
          }
        }

        if (px < -50 || px > W + 50 || py < -50 || py > H + 50) {
          L.prevX = null;
          continue;
        }

        const heat = L.heat;
        const tc = tempColor(L.r);
        let cr = lerp(L.color[0], tc[0], heat);
        let cg = lerp(L.color[1], tc[1], heat);
        let cb = lerp(L.color[2], tc[2], heat);

        const tint = clamp(waveBright, 0, 1) * 0.5;
        cr = lerp(cr, 255, tint);
        cg = lerp(cg, 170, tint);
        cb = lerp(cb, 90, tint);

        const dop = 1 + 0.35 * (-Math.cos(L.th)) * L.flat * heat;
        const alpha = clamp(L.alpha * (0.72 + 0.38 * heat) * (1 + 0.5 * waveBright) * dop, 0, 1);

        let dx = 0, dy = 0, speed = 0;
        if (L.prevX !== null) {
          dx = px - L.prevX;
          dy = py - L.prevY;
          speed = Math.hypot(dx, dy) / Math.max(dt, 1 / 120);
        }
        L.prevX = px;
        L.prevY = py;

        if (heat > 0.18 && speed > 340) {
          const stretch = Math.min(2.3, 1.5 + heat * 0.7);
          let ax = px - dx * stretch;
          let ay = py - dy * stretch;
          const len = Math.hypot(px - ax, py - ay);
          if (len > 26) {
            const k = 26 / len;
            ax = px - (px - ax) * k;
            ay = py - (py - ay) * k;
          }
          const bucket = clamp(Math.floor(clamp(1 - (L.r - rh) / 0.75, 0, 1) * 5.999), 0, 5);
          lineBuckets[bucket].push(ax, ay, px, py);
        } else {
          setFont(400, L.size);
          lctx.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${alpha.toFixed(3)})`;
          lctx.fillText(L.ch, px, py);
        }
      }
    }

    for (let b = 0; b < 6; b++) {
      const arr = lineBuckets[b];
      if (!arr.length) continue;
      const c = LINE_COLORS[b];
      lctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},0.8)`;
      lctx.lineWidth = 1.15;
      lctx.beginPath();
      for (let i = 0; i < arr.length; i += 4) {
        lctx.moveTo(arr[i], arr[i + 1]);
        lctx.lineTo(arr[i + 2], arr[i + 3]);
      }
      lctx.stroke();
    }

    ctx.drawImage(layer, 0, 0, W, H);

    const glowK = clamp((t - T.collapse) / 1.2, 0, 1);
    if (glowK > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.55 * glowK;
      ctx.filter = 'blur(5px)';
      ctx.drawImage(layer, 0, 0, W, H);
      ctx.restore();
    }

    drawHole(rhs, hp, t);
  }

  /* ───────── loop ───────── */
  function frame(now) {
    if (!startTime) {
      startTime = now;
      lastFrame = now;
      ambLast = now;
    }

    const rawDt = (now - lastFrame) / 1000;
    lastFrame = now;
    const dt = Math.min(rawDt, 0.05) || 0.0167;

    if (!finished) {
      elapsed = (now - startTime) / 1000;

      if (elapsed < T.freeze) {
        if (elapsed - simTime > 0.2) fastForward(elapsed);
        else stepSim(elapsed, dt);
        simTime = elapsed;
      } else if (simTime < T.freeze - 0.05) {
        fastForward(T.freeze);
      }

      draw(elapsed, dt);

      if (!titleShown && elapsed >= T.title) {
        titleShown = true;
        root.classList.add('title-on');
      }

      if (elapsed >= T.ready) settle();
    } else {
      /* the hero is off screen — stop drawing until it comes back */
      if (!ambLive) {
        raf = 0;
        return;
      }

      const adt = Math.min(rawDt, 0.12);
      ambT += adt;

      const ramp = sstep(0, SPIN_RAMP, ambT);
      spin += SPIN_RATE * ramp * adt;
      draw(T.freeze, adt);
    }

    raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!raf) {
      lastFrame = performance.now();
      ambLast = lastFrame;
      raf = requestAnimationFrame(frame);
    }
  }

  /* ───────── hand the frame over to the page ───────── */
  function settle() {
    if (finished) return;
    finished = true;
    ambLast = performance.now();
    root.classList.add('title-on', 'ready');
    root.classList.remove('intro-running');
    clearTimeout(window.__introSafety);
    if (site) site.inert = false;
    installAmbient();
    document.dispatchEvent(new CustomEvent('ton618:ready'));
  }

  function installAmbient() {
    ambLive = true;
    ambT = 0;

    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        ambLive = e.isIntersecting;
        if (ambLive) wake();
      }
    }, { threshold: 0 });
    io.observe(intro);
  }

  function skip() {
    if (finished) return;
    fastForward(T.freeze);
    titleShown = true;
    root.classList.add('title-on');
    spin = 0;
    draw(T.freeze, 1 / 60);
    elapsed = T.ready;
    settle();
  }

  /* ───────── events ───────── */
  skipBtn?.addEventListener('click', skip);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' || e.key === 'Esc') skip();
  });
  intro.addEventListener('click', e => {
    if (e.target === intro) skip();
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  /* ───────── go ───────── */
  resize();

  if (reduced) {
    fastForward(T.freeze);
    draw(T.freeze, 1 / 60);
    titleShown = true;
    settle();
    return;
  }

  raf = requestAnimationFrame(frame);
})();
