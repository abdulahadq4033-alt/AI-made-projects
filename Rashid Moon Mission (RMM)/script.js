// ═══════════════════════════════════════
// STARFIELD
// ═══════════════════════════════════════
(function() {
  const c = document.getElementById('starfield');
  const ctx = c.getContext('2d');
  let stars = [];

  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    stars = Array.from({length: 300}, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.5,
      o: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.3 + 0.05
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(238,242,248,${s.o})`;
      ctx.fill();
      s.o += (Math.random() - 0.5) * 0.02;
      s.o = Math.max(0.1, Math.min(1, s.o));
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ═══════════════════════════════════════
// MOON CANVAS
// ═══════════════════════════════════════
(function() {
  const canvas = document.getElementById('moon-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const R = W / 2;
  let rotX = 0, rotY = 0;
  let dragging = false, lastX, lastY;
  let velX = 0, velY = 0;
  let autoRot = 0.002;

  // Craters: [cx%, cy%, radius%, name, desc]
  const craters = [
    [55, 42, 4.5, 'Atlas Crater', 'Target landing site for the Rashid Rover — Mare Frigoris region, NE of the Moon'],
    [40, 50, 3.2, 'Mare Frigoris', 'Sea of Cold — vast lunar mare region in the northern hemisphere'],
    [62, 60, 2.8, 'Aristoteles', 'Large impact crater ~87km wide, near Mare Frigoris'],
    [30, 38, 2.0, 'Plato', 'Walled plain ~101km — notable flat dark lava floor'],
    [48, 68, 3.5, 'Copernicus', 'Prominent lunar impact crater ~93km, formed ~800Ma ago'],
    [72, 44, 1.8, 'Endymion', 'Flooded crater ~123km wide, north-eastern mare region'],
  ];

  function drawMoon() {
    ctx.clearRect(0, 0, W, H);

    // Clip circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(R, R, R - 2, 0, Math.PI * 2);
    ctx.clip();

    // Base lunar gradient
    const grad = ctx.createRadialGradient(R*0.75, R*0.65, 0, R, R, R);
    grad.addColorStop(0, '#D8DADE');
    grad.addColorStop(0.3, '#B8BFC8');
    grad.addColorStop(0.7, '#8A9198');
    grad.addColorStop(1, '#4A5060');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Surface texture noise using many small dots
    const seed = 42;
    const noisePoints = 2000;
    for (let i = 0; i < noisePoints; i++) {
      const nx = (Math.sin(i * 127.1 + seed) * 0.5 + 0.5) * W;
      const ny = (Math.sin(i * 311.7 + seed) * 0.5 + 0.5) * H;
      const nr = (Math.sin(i * 74.3) * 0.5 + 0.5) * 3;
      const alpha = (Math.sin(i * 53.9) * 0.5 + 0.5) * 0.15;
      const dark = Math.sin(i * 91.1) > 0;
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI*2);
      ctx.fillStyle = dark ? `rgba(50,55,70,${alpha})` : `rgba(220,225,235,${alpha*0.5})`;
      ctx.fill();
    }

    // Mare regions (dark seas)
    const mares = [
      { x: R*0.55, y: R*0.45, rx: R*0.32, ry: R*0.22, color: 'rgba(80,90,110,0.55)' },
      { x: R*0.85, y: R*0.6,  rx: R*0.22, ry: R*0.18, color: 'rgba(70,80,100,0.45)' },
      { x: R*0.65, y: R*0.75, rx: R*0.28, ry: R*0.18, color: 'rgba(75,85,105,0.4)' },
      { x: R*0.35, y: R*0.35, rx: R*0.18, ry: R*0.12, color: 'rgba(85,95,115,0.4)' },
    ];

    mares.forEach(m => {
      const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, Math.max(m.rx, m.ry));
      mg.addColorStop(0, m.color);
      mg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.scale(1, m.ry/m.rx);
      ctx.beginPath();
      ctx.arc(m.x, m.y * m.rx/m.ry, m.rx, 0, Math.PI*2);
      ctx.fillStyle = mg;
      ctx.fill();
      ctx.restore();
    });

    // Draw craters with rotation offset
    const offset = rotY * 60;
    craters.forEach(([cxP, cyP, rP, name], i) => {
      const cx = (cxP/100 * W + offset) % W;
      const cy = cyP/100 * H;
      const cr = rP/100 * W;

      // Outer shadow
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI*2);
      const cg = ctx.createRadialGradient(cx-cr*0.3, cy-cr*0.3, 0, cx, cy, cr);
      cg.addColorStop(0, 'rgba(180,185,195,0.9)');
      cg.addColorStop(0.5, 'rgba(120,128,140,0.7)');
      cg.addColorStop(0.8, 'rgba(60,65,80,0.8)');
      cg.addColorStop(1, 'rgba(30,35,50,0.3)');
      ctx.fillStyle = cg;
      ctx.fill();

      // Rim highlight
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(220,225,235,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Atlas crater special highlight
      if (name === 'Atlas Crater') {
        ctx.beginPath();
        ctx.arc(cx, cy, cr + 4, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(200,150,42,0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = 'rgba(200,150,42,0.9)';
        ctx.font = '11px Orbitron, monospace';
        ctx.fillText('← RASHID', cx + cr + 8, cy - 2);
      }
    });

    // Terminator shadow (day/night line)
    const termX = R + Math.sin(rotY * 0.5) * R * 0.3;
    const termGrad = ctx.createLinearGradient(termX - R*0.3, 0, termX + R*0.5, 0);
    termGrad.addColorStop(0, 'rgba(0,0,0,0)');
    termGrad.addColorStop(0.6, 'rgba(5,10,20,0.1)');
    termGrad.addColorStop(1, 'rgba(2,5,16,0.65)');
    ctx.fillStyle = termGrad;
    ctx.fillRect(0, 0, W, H);

    // Atmosphere rim
    ctx.restore();
    const rimGrad = ctx.createRadialGradient(R, R, R - 15, R, R, R + 5);
    rimGrad.addColorStop(0, 'rgba(180,190,210,0.05)');
    rimGrad.addColorStop(0.6, 'rgba(180,190,210,0.12)');
    rimGrad.addColorStop(1, 'rgba(180,190,210,0)');
    ctx.beginPath();
    ctx.arc(R, R, R, 0, Math.PI*2);
    ctx.fillStyle = rimGrad;
    ctx.fill();
  }

  // Interaction
  canvas.addEventListener('mousedown', e => {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    velX = velY = 0;
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    velX = dy * 0.003;
    velY = dx * 0.003;
    rotX += velX;
    rotY += velY;
    lastX = e.clientX; lastY = e.clientY;
    drawMoon();
  });

  window.addEventListener('mouseup', () => { dragging = false; });

  // Tooltip on hover
  const tooltip = document.getElementById('tooltip');
  canvas.addEventListener('mousemove', e => {
    if (dragging) { tooltip.style.display = 'none'; return; }
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    const offset = rotY * 60;
    let found = null;

    craters.forEach(([cxP, cyP, rP, name, desc]) => {
      const cx = (cxP/100 * W + offset) % W;
      const cy = cyP/100 * H;
      const cr = rP/100 * W;
      if (Math.hypot(mx - cx, my - cy) < cr + 8) found = {name, desc};
    });

    if (found) {
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 15) + 'px';
      tooltip.style.top = (e.clientY - 20) + 'px';
      tooltip.innerHTML = `<strong>${found.name}</strong>${found.desc}`;
    } else {
      tooltip.style.display = 'none';
    }
  });

  canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });

  // Touch support
  canvas.addEventListener('touchstart', e => {
    const t = e.touches[0];
    dragging = true; lastX = t.clientX; lastY = t.clientY; velX = velY = 0;
    e.preventDefault();
  }, {passive: false});
  canvas.addEventListener('touchmove', e => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - lastX, dy = t.clientY - lastY;
    velY += dx * 0.003;
    rotY += dx * 0.003;
    lastX = t.clientX; lastY = t.clientY;
    drawMoon(); e.preventDefault();
  }, {passive: false});
  canvas.addEventListener('touchend', () => { dragging = false; });

  // Auto rotation + inertia
  function animate() {
    if (!dragging) {
      rotY += autoRot;
      velX *= 0.95;
      velY *= 0.95;
      rotX += velX;
      rotY += velY;
      drawMoon();
    }
    requestAnimationFrame(animate);
  }
  drawMoon();
  animate();
})();

// ═══════════════════════════════════════
// ROVER CANVAS
// ═══════════════════════════════════════
(function() {
  const canvas = document.getElementById('rover-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', () => { resize(); draw(); });
  resize();

  let t = 0;
  let roverX = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Lunar ground
    const groundY = H * 0.7;

    // Stars bg
    for (let i = 0; i < 80; i++) {
      const sx = (Math.sin(i*137.5) * 0.5 + 0.5) * W;
      const sy = (Math.sin(i*241.1) * 0.5 + 0.5) * groundY * 0.9;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8, 0, Math.PI*2);
      ctx.fillStyle = `rgba(200,210,230,${0.3 + Math.sin(i+t*0.5)*0.2})`;
      ctx.fill();
    }

    // Ground gradient
    const gg = ctx.createLinearGradient(0, groundY - 20, 0, H);
    gg.addColorStop(0, '#8A9198');
    gg.addColorStop(0.3, '#6A7180');
    gg.addColorStop(1, '#3A4050');
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    // Bumpy terrain
    ctx.lineTo(0, groundY);
    for (let x = 0; x <= W; x += 20) {
      const bump = Math.sin(x * 0.03 + 1) * 8 + Math.sin(x * 0.07) * 4;
      ctx.lineTo(x, groundY + bump);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();

    // Surface craters
    [[W*0.15, groundY+5, 25], [W*0.75, groundY+3, 18], [W*0.45, groundY+7, 12]].forEach(([cx, cy, cr]) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, cr, cr * 0.3, 0, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(40,48,65,0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(150,160,175,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Rover position (bounces slightly)
    const rx = W * 0.35 + Math.sin(t * 0.5) * 3;
    const ry = groundY - 2 + Math.sin(t * 1.2) * 1;

    drawRover(ctx, rx, ry, t);

    // Ground shadow under rover
    ctx.beginPath();
    ctx.ellipse(rx, ry + 6, 55, 8, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(20,25,40,0.4)';
    ctx.fill();

    // UAE flag patch
    ctx.save();
    ctx.translate(rx + 5, ry - 72);
    ctx.fillStyle = '#009736';
    ctx.fillRect(0, 0, 28, 7);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 7, 28, 7);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 14, 28, 7);
    ctx.fillStyle = '#EF3340';
    ctx.fillRect(0, 0, 7, 21);
    ctx.restore();

    t += 0.04;
    requestAnimationFrame(draw);
  }

  function drawRover(ctx, rx, ry, t) {
    const wheelBob = Math.sin(t * 2) * 1.5;

    // ── Solar panels ──
    ctx.save();
    ctx.translate(rx, ry - 65);
    ctx.rotate(Math.sin(t * 0.3) * 0.04);

    // Left panel
    const lpg = ctx.createLinearGradient(-70, -8, -20, 8);
    lpg.addColorStop(0, '#1a3a6a');
    lpg.addColorStop(0.5, '#2050a0');
    lpg.addColorStop(1, '#1a3a6a');
    ctx.fillStyle = lpg;
    ctx.fillRect(-72, -8, 48, 16);

    // Right panel
    const rpg = ctx.createLinearGradient(20, -8, 72, 8);
    rpg.addColorStop(0, '#1a3a6a');
    rpg.addColorStop(0.5, '#2050a0');
    rpg.addColorStop(1, '#1a3a6a');
    ctx.fillStyle = rpg;
    ctx.fillRect(22, -8, 48, 16);

    // Panel grid lines
    ctx.strokeStyle = 'rgba(80,130,200,0.5)';
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(-72 + i*10, -8); ctx.lineTo(-72 + i*10, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(22 + i*10, -8); ctx.lineTo(22 + i*10, 8); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(-72, 0); ctx.lineTo(-24, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(72, 0); ctx.stroke();

    // Mast
    ctx.fillStyle = '#8090a8';
    ctx.fillRect(-3, -40, 6, 32);

    // Camera head
    ctx.fillStyle = '#5a6a80';
    ctx.beginPath();
    ctx.arc(0, -44, 10, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#2a3a50';
    ctx.beginPath();
    ctx.arc(0, -44, 5, 0, Math.PI*2);
    ctx.fill();
    // Camera lens glow
    ctx.beginPath();
    ctx.arc(0, -44, 3, 0, Math.PI*2);
    ctx.fillStyle = `rgba(80,160,255,${0.6 + Math.sin(t*3)*0.3})`;
    ctx.fill();

    ctx.restore();

    // ── Main body ──
    ctx.save();
    ctx.translate(rx, ry);
    const bodyGrad = ctx.createLinearGradient(-35, -50, 35, -10);
    bodyGrad.addColorStop(0, '#B8C0CC');
    bodyGrad.addColorStop(0.5, '#9098A8');
    bodyGrad.addColorStop(1, '#606878');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-35, -55, 70, 45, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,190,210,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Body details — vents
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = 'rgba(50,55,70,0.6)';
      ctx.fillRect(-20 + i*9, -48, 5, 8);
    }

    // Thermal camera
    ctx.fillStyle = '#404858';
    ctx.fillRect(18, -50, 14, 10);
    ctx.fillStyle = '#c8961a';
    ctx.beginPath();
    ctx.arc(25, -45, 4, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();

    // ── Wheels (6 wheels) ──
    const wheelPositions = [-50, -18, 18, 50];
    const wheelY = ry - 5;
    const wheelR = 12;
    wheelPositions.forEach((wx, i) => {
      const wy = wheelY + (i % 2 === 0 ? wheelBob : -wheelBob * 0.5);
      ctx.save();
      ctx.translate(rx + wx, wy);
      ctx.rotate(t * 2 * (wx > 0 ? 1 : -1));

      // Wheel rim
      const wg = ctx.createRadialGradient(0, 0, 2, 0, 0, wheelR);
      wg.addColorStop(0, '#6a7080');
      wg.addColorStop(0.7, '#3a4050');
      wg.addColorStop(1, '#2a3040');
      ctx.beginPath();
      ctx.arc(0, 0, wheelR, 0, Math.PI*2);
      ctx.fillStyle = wg;
      ctx.fill();
      ctx.strokeStyle = '#8090a8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Spokes
      for (let s = 0; s < 6; s++) {
        const a = (s / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * wheelR, Math.sin(a) * wheelR);
        ctx.strokeStyle = '#8090a8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Tread marks
      for (let s = 0; s < 8; s++) {
        const a = (s / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * (wheelR - 2), Math.sin(a) * (wheelR - 2), 1.5, 0, Math.PI*2);
        ctx.fillStyle = '#505868';
        ctx.fill();
      }

      ctx.restore();
    });

    // Wheel axles
    ctx.strokeStyle = '#607080';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(rx - 50, ry - 5); ctx.lineTo(rx - 18, ry - 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx + 18, ry - 5); ctx.lineTo(rx + 50, ry - 5); ctx.stroke();

    // Langmuir probe arm
    ctx.save();
    ctx.translate(rx - 38, ry - 40);
    ctx.rotate(-0.4 + Math.sin(t*0.3)*0.05);
    ctx.strokeStyle = '#8090a8';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-25, -15); ctx.stroke();
    ctx.beginPath();
    ctx.arc(-25, -15, 4, 0, Math.PI*2);
    ctx.fillStyle = '#c8961a';
    ctx.fill();
    ctx.restore();
  }

  draw();
})();

// ═══════════════════════════════════════
// TIMELINE SCROLL ANIMATION
// ═══════════════════════════════════════
(function() {
  const items = document.querySelectorAll('.tl-item');
  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 150);
      }
    });
  }, { threshold: 0.2 });
  items.forEach(item => observer.observe(item));
})();