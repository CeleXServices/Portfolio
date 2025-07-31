document.addEventListener('DOMContentLoaded', () => {
  const particleSystem = new ParticleSystem('bgCanvas');
  
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
  }
  
  function handleViewportChange() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  handleViewportChange();
  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('orientationchange', handleViewportChange);
  
  window.particleSystem = particleSystem;
});