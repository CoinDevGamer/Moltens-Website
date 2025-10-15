document.addEventListener('DOMContentLoaded', () => {
  /* ========= Particles ========= */
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');

  function fitCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', fitCanvas);
  fitCanvas();

  const particlesArray = [];
  const colors = ['#ff4c00', '#ff8700', '#ffcf00'];
  const PARTICLE_COUNT = 80; // Reduced for performance
  const CONNECT_DISTANCE = 120;

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.8 - 0.4;
      this.speedY = Math.random() * 0.8 - 0.4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    for (let i = 0; i < PARTICLE_COUNT; i++) particlesArray.push(new Particle());
  }

  function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a + 1; b < particlesArray.length; b++) {
        const dx = particlesArray[a].x - particlesArray[b].x;
        const dy = particlesArray[a].y - particlesArray[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DISTANCE) {
          ctx.strokeStyle = `rgba(255,76,0,${1 - dist / CONNECT_DISTANCE})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
  }

  // Mouse repel effect (subset for performance)
  document.addEventListener('mousemove', e => {
    const radius = 80;
    for (let i = 0; i < 20; i++) {
      const p = particlesArray[Math.floor(Math.random() * particlesArray.length)];
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        const angle = Math.atan2(dy, dx);
        p.x -= Math.cos(angle) * 2;
        p.y -= Math.sin(angle) * 2;
      }
    }
  });

  initParticles();
  animateParticles();

  /* ========= Smooth nav scroll ========= */
  document.querySelectorAll('.site-header nav a').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      e.preventDefault();
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ========= Models carousel ========= */
  const MODELS = window.MOLTENTIC_MODELS;
  const viewer = document.getElementById('active-model');
  const titleEl = document.getElementById('model-title');
  const descEl = document.getElementById('model-description');
  const prevBtn = document.getElementById('prevModel');
  const nextBtn = document.getElementById('nextModel');

  let modelIndex = 0;
  function renderModel(i) {
    const m = MODELS[i];
    if (!m) return;
    viewer.setAttribute('src', m.src);
    viewer.setAttribute('alt', m.title);
    titleEl.textContent = m.title;
    descEl.textContent = m.description;
  }

  prevBtn.addEventListener('click', () => {
    modelIndex = (modelIndex - 1 + MODELS.length) % MODELS.length;
    renderModel(modelIndex);
  });

  nextBtn.addEventListener('click', () => {
    modelIndex = (modelIndex + 1) % MODELS.length;
    renderModel(modelIndex);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });

  renderModel(modelIndex);

  /* ========= Builds carousel ========= */
  const BUILDS = window.MOLTENTIC_BUILDS;
  const buildsEl = document.getElementById('builds-carousel');
  BUILDS.forEach(b => {
    const card = document.createElement('div');
    card.className = 'build-card';
    card.innerHTML = `
      <img src="${b.img}" alt="${b.title}">
      <div class="info">
        <h3>${b.title}</h3>
        <p>${b.description}</p>
      </div>`;
    buildsEl.appendChild(card);
  });

  // Drag scrolling
  let isDown = false, startX, scrollLeft;
  buildsEl.addEventListener('mousedown', e => {
    isDown = true;
    buildsEl.classList.add('grabbing');
    startX = e.pageX - buildsEl.offsetLeft;
    scrollLeft = buildsEl.scrollLeft;
  });
  buildsEl.addEventListener('mouseleave', () => { isDown = false; buildsEl.classList.remove('grabbing'); });
  buildsEl.addEventListener('mouseup', () => { isDown = false; buildsEl.classList.remove('grabbing'); });
  buildsEl.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - buildsEl.offsetLeft;
    const walk = (x - startX) * 1.5;
    buildsEl.scrollLeft = scrollLeft - walk;
  });
  buildsEl.addEventListener('wheel', e => {
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (e.shiftKey || Math.abs(e.deltaY) > 0) {
      e.preventDefault();
      buildsEl.scrollLeft += delta;
    }
  }, { passive: false });

});
