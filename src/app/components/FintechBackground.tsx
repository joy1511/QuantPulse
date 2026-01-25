import { useEffect, useRef } from 'react';

/**
 * FintechBackground Component
 * Renders a sophisticated, deep navy animated background with subtle floating particles.
 * Designed for reliability, performance, and a premium fintech aesthetic.
 */
export function FintechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Mouse position tracking
    const mouse = { x: -1000, y: -1000 }; // Start off-screen

    // Configuration
    const config = {
      bg: '#0B1220', // Deep Navy
      particleColors: ['#3B82F6', '#60A5FA', '#2563EB'], // Muted Blues
      particleCount: 60, // Balanced density
      connectionDistance: 120, // Distance for drawing lines
      baseVelocity: 0.2, // Very slow drift
      // Cursor interaction config
      cursorRadius: 100, // Radius of cursor influence
      cursorForce: 0.015, // Very gentle push - subtle and ambient
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      targetAlpha: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        // Subtle random movement
        this.vx = (Math.random() - 0.5) * config.baseVelocity;
        this.vy = (Math.random() - 0.5) * config.baseVelocity;
        this.size = Math.random() * 2 + 0.5; // Small, refined bits
        this.color = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];
        this.alpha = Math.random() * 0.5 + 0.1;
        this.targetAlpha = this.alpha;
      }

      update(w: number, h: number, mouseX: number, mouseY: number) {
        // Calculate distance from cursor
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Subtle cursor repulsion - only if mouse is on screen
        if (dist < config.cursorRadius && mouseX > 0 && mouseY > 0) {
          // Normalize direction and apply a very gentle push
          const force = (config.cursorRadius - dist) / config.cursorRadius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * config.cursorForce;
          this.vy += Math.sin(angle) * force * config.cursorForce;
        }

        // Dampen velocity to prevent particles from flying away
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Ensure minimum velocity for continuous movement
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < config.baseVelocity * 0.5) {
          this.vx += (Math.random() - 0.5) * config.baseVelocity * 0.1;
          this.vy += (Math.random() - 0.5) * config.baseVelocity * 0.1;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;

        // Subtle alpha pulsing
        if (Math.abs(this.targetAlpha - this.alpha) < 0.01) {
          this.targetAlpha = Math.random() * 0.5 + 0.1;
        }
        this.alpha += (this.targetAlpha - this.alpha) * 0.01;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const count = Math.min(config.particleCount, (canvas.width * canvas.height) / 15000); // Responsive count
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const drawLines = (p1: Particle, p2: Particle) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < config.connectionDistance) {
        const opacity = 1 - (dist / config.connectionDistance);
        ctx.globalAlpha = opacity * 0.15; // Very subtle lines
        ctx.strokeStyle = p1.color; // Use particle color or fixed color
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    };

    const render = () => {
      ctx.fillStyle = config.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update(canvas.width, canvas.height, mouse.x, mouse.y);
        p.draw(ctx);
      });

      // Draw subtle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          drawLines(particles[i], particles[j]);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      // Move mouse off-screen when it leaves the window
      mouse.x = -1000;
      mouse.y = -1000;
    };

    // Initial setup
    handleResize();
    render();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#0B1220' }} // Fallback/Initial color
    />
  );
}

