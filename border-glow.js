/*

THIS CODE IS FROM reactbits.dev

*/


document.querySelectorAll('.border-glow-card').forEach(card => {
  const settings = {
    edgeSensitivity: 30,
    glowIntensity: 1
  };

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  let introFrame = null;

  const clamp = value => Math.max(0, Math.min(1, value));

  function updateGlow(proximity, angle) {
    const edgeThreshold = settings.edgeSensitivity / 100;
    const colorThreshold = Math.min(edgeThreshold + 0.2, 0.99);

    const glow = clamp(
      (proximity - edgeThreshold) / (1 - edgeThreshold)
    );

    const color = clamp(
      (proximity - colorThreshold) / (1 - colorThreshold)
    );

    card.style.setProperty('--cursor-angle', `${angle}deg`);
    card.style.setProperty(
      '--glow-opacity',
      clamp(glow * settings.glowIntensity)
    );
    card.style.setProperty('--color-opacity', color);
  }

  function stopIntro() {
    if (introFrame !== null) {
      cancelAnimationFrame(introFrame);
      introFrame = null;
    }
  }

  function hideGlow() {
    stopIntro();
    card.style.setProperty('--glow-opacity', 0);
    card.style.setProperty('--color-opacity', 0);
  }

  function handlePointer(event) {
    stopIntro();

    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const dx = event.clientX - rect.left - centerX;
    const dy = event.clientY - rect.top - centerY;

    // 0 at the center; 1 at an edge.
    const proximity = clamp(Math.max(
      Math.abs(dx) / centerX,
      Math.abs(dy) / centerY
    ));

    // CSS conic gradients start at the top.
    const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;

    updateGlow(proximity, angle);
  }

  card.addEventListener('pointerenter', handlePointer);
  card.addEventListener('pointermove', handlePointer);
  card.addEventListener('pointerleave', hideGlow);
  card.addEventListener('pointercancel', hideGlow);

  if (card.dataset.animated === 'true' && !reducedMotion.matches) {
    const duration = 3000;
    const started = performance.now();

    function animate(now) {
      const progress = clamp((now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const angle = 110 + 355 * eased;

      const fadeIn = clamp(progress / 0.15);
      const fadeOut = clamp((1 - progress) / 0.3);

      updateGlow(Math.min(fadeIn, fadeOut), angle);

      if (progress < 1) {
        introFrame = requestAnimationFrame(animate);
      } else {
        introFrame = null;
        hideGlow();
      }
    }

    introFrame = requestAnimationFrame(animate);
  }

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) hideGlow();
  });
});