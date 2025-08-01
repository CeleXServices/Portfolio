class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.scroll = { y: 0 };
    this.animationId = null;
    this.isMobile = 'ontouchstart' in window;
    
    this.config = {
      particleCount: this.isMobile ? 60 : 120,
      maxDistance: 150,
      mouseRadius: this.isMobile ? 100 : 200, 
      particleSpeed: 0.5,
      lineOpacity: 0.15,
      particleOpacity: 0.8,
      mouseForce: 0.3,
      returnForce: 0.02,
      scrollForce: 0.8,
      scrollDamping: 0.95
    };

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        baseX: Math.random() * this.canvas.width,
        baseY: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.config.particleSpeed,
        vy: (Math.random() - 0.5) * this.config.particleSpeed,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.5
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createParticles();
    });

    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });


    document.addEventListener('touchmove', (e) => {

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.mouse.x = touch.clientX;
        this.mouse.y = touch.clientY;
      }

    }, { passive: true });

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.mouse.x = touch.clientX;
        this.mouse.y = touch.clientY;
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    }, { passive: true });


    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = requestAnimationFrame(() => {
        this.updateScroll();
      });
    }, { passive: true });
  }

  updateScroll() {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    this.scroll.y = currentScrollY;
  }

  updateParticles() {
    this.particles.forEach(particle => {
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.mouseRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (this.config.mouseRadius - distance) / this.config.mouseRadius;
          
          particle.vx -= Math.cos(angle) * force * this.config.mouseForce;
          particle.vy -= Math.sin(angle) * force * this.config.mouseForce;
        }
      }

      const returnX = (particle.baseX - particle.x) * this.config.returnForce;
      const returnY = (particle.baseY - particle.y) * this.config.returnForce;
      particle.vx += returnX;
      particle.vy += returnY;

      particle.vx *= 0.98;
      particle.vy *= 0.98;


      particle.x += particle.vx;
      particle.y += particle.vy;


      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.vx *= -0.5;
        particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.vy *= -0.5;
        particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
      }
    });
  }

  drawParticles() {
    this.ctx.save();

    this.ctx.translate(0, -this.scroll.y * 0.5);
    

    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * this.config.particleOpacity})`;
      this.ctx.fill();
    });
    
    this.ctx.restore();
  }

  drawConnections() {
    this.ctx.save();

    this.ctx.translate(0, -this.scroll.y * 0.5);
    

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.maxDistance) {
          const opacity = (1 - distance / this.config.maxDistance) * this.config.lineOpacity;
          
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
    
    this.ctx.restore();
  }

  drawMouseConnections() {
    if (this.mouse.x === null || this.mouse.y === null) return;

    this.ctx.save();

    const adjustedMouseY = this.mouse.y + this.scroll.y * 0.5;


    this.particles.forEach(particle => {
      const dx = this.mouse.x - particle.x;
      const dy = adjustedMouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.config.mouseRadius) {
        const opacity = (1 - distance / this.config.mouseRadius) * 0.3;
        
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y - this.scroll.y * 0.5);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });


    const cursorSize = this.isMobile ? 2 : 4;
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, cursorSize, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fill();


    const glowSize = this.isMobile ? 15 : 30;
    const gradient = this.ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, glowSize
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, glowSize, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    this.ctx.restore();
  }

  animate() {

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.updateParticles();
    this.drawConnections();
    this.drawParticles();
    this.drawMouseConnections();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    window.removeEventListener('resize', this.resizeCanvas);
    window.removeEventListener('scroll', this.updateScroll);
    document.removeEventListener('mousemove', this.bindEvents);
    document.removeEventListener('mouseleave', this.bindEvents);
    document.removeEventListener('touchmove', this.bindEvents);
    document.removeEventListener('touchstart', this.bindEvents);
    document.removeEventListener('touchend', this.bindEvents);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const particleSystem = new ParticleSystem('bgCanvas');
  

  window.particleSystem = particleSystem;
});


if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleSystem;
}