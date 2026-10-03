/*

THIS CODE IS FROM reactbits.dev

*/


document.querySelectorAll('.particle-text').forEach(createParticleText);

function createParticleText(container) {
  const canvas = container.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const settings = {
    particleSize: 2,
    density: 4,
    scatter: 180,
    duration: 1600,
    stagger: 420,
    repelRadius: 120,
    repelStrength: 40,
    idleDrift: 0.7
  };

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: 0, y: 0, active: false };

  let particles = [];
  let width = 0;
  let height = 0;
  let startTime = 0;
  let animationFrame = null;
  let resizeFrame = null;
  let buildId = 0;

  function replay() {
    startTime = performance.now();

    particles.forEach(p => {
      const angle = Math.random() * Math.PI * 2;
      const distance = settings.scatter * (0.3 + Math.random());

      p.startX = p.targetX + Math.cos(angle) * distance;
      p.startY = p.targetY + Math.sin(angle) * distance;
      p.x = motion.matches ? p.targetX : p.startX;
      p.y = motion.matches ? p.targetY : p.startY;
    });

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }

    animationFrame = requestAnimationFrame(draw);
  }

  async function build() {
    const currentBuild = ++buildId;
    const styles = getComputedStyle(container);
    let fontSize = parseFloat(styles.fontSize);
    const family = styles.fontFamily;
    const weight = styles.fontWeight;
    const text = container.dataset.text || 'CodeJam';

    if (document.fonts) {
      try {
        await document.fonts.load(
          `${weight} ${fontSize}px ${family}`,
          text
        );
      } catch {
        // Use the browser's fallback font if loading fails.
      }
      await document.fonts.ready;
    }

    if (currentBuild !== buildId) return;

    width = container.clientWidth;
    height = container.clientHeight;
    if (!width || !height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sample = document.createElement('canvas');
    sample.width = width;
    sample.height = height;

    const sampleCtx = sample.getContext('2d', {
      willReadFrequently: true
    });
    if (!sampleCtx) return;

    sampleCtx.font = `${weight} ${fontSize}px ${family}`;
    const measuredWidth = sampleCtx.measureText(text).width;

    // Shrink the text to fit smaller screens.
    fontSize *= Math.min(
      1,
      width * 0.9 / Math.max(1, measuredWidth),
      height * 0.65 / fontSize
    );

    sampleCtx.font = `${weight} ${fontSize}px ${family}`;
    sampleCtx.textAlign = 'center';
    sampleCtx.textBaseline = 'alphabetic';
    sampleCtx.fillStyle = '#ffffff';

    const metrics = sampleCtx.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
    const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;

    sampleCtx.fillText(
      text,
      width / 2,
      height / 2 + (ascent - descent) / 2
    );

    const pixels = sampleCtx.getImageData(0, 0, width, height).data;
    const targets = [];

    for (let y = 0; y < height; y += settings.density) {
      for (let x = 0; x < width; x += settings.density) {
        if (pixels[(y * width + x) * 4 + 3] < 100) continue;
        targets.push({ x, y });
      }
    }

    // Limit the particle count to keep the animation manageable.
    const stride = Math.max(1, Math.ceil(targets.length / 5000));

    particles = targets
      .filter((_, index) => index % stride === 0)
      .map(({ x, y }) => {
        const blend = x / width;

        // Blend soft white into cyan across the text.
        const r = Math.round(248 + (34 - 248) * blend);
        const g = Math.round(250 + (211 - 250) * blend);
        const b = Math.round(252 + (238 - 252) * blend);

        return {
          targetX: x,
          targetY: y,
          color: `rgb(${r}, ${g}, ${b})`,
          delay: Math.random() * settings.stagger,
          phase: Math.random() * Math.PI * 2
        };
      });

    replay();
  }

  function draw(now) {
    animationFrame = null;
    ctx.clearRect(0, 0, width, height);
    ctx.shadowBlur = motion.matches ? 0 : 5;
    ctx.shadowColor = '#22D3EE';

    particles.forEach(p => {
      const progress = motion.matches
        ? 1
        : Math.max(
            0,
            Math.min(1, (now - startTime - p.delay) / settings.duration)
          );

      const eased = 1 - Math.pow(1 - progress, 3);
      let x = p.startX + (p.targetX - p.startX) * eased;
      let y = p.startY + (p.targetY - p.startY) * eased;

      if (!motion.matches && progress === 1) {
        x += Math.sin(now * 0.001 + p.phase) * settings.idleDrift;
        y += Math.cos(now * 0.001 + p.phase) * settings.idleDrift;
      }

      if (pointer.active && !motion.matches) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0 && distance < settings.repelRadius) {
          const force =
            Math.pow(1 - distance / settings.repelRadius, 2) *
            settings.repelStrength;

          x += dx / distance * force;
          y += dy / distance * force;
        }
      }

      const follow = motion.matches ? 1 : 0.22;
      p.x += (x - p.x) * follow;
      p.y += (y - p.y) * follow;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.35 + progress * 0.65;
      ctx.fillRect(
        p.x - settings.particleSize / 2,
        p.y - settings.particleSize / 2,
        settings.particleSize,
        settings.particleSize
      );
    });

    ctx.globalAlpha = 1;

    if (!motion.matches) {
      animationFrame = requestAnimationFrame(draw);
    }
  }

  canvas.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });

  canvas.addEventListener('pointerleave', () => {
    pointer.active = false;
  });

  const observer = new ResizeObserver(() => {
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      build();
    });
  });

  observer.observe(container);
  motion.addEventListener('change', build);
}