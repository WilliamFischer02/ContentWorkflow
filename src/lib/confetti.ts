/**
 * Dependency-free canvas confetti burst, used when an idea's checklist
 * reaches 100%. Skipped entirely under prefers-reduced-motion.
 */
export function burstConfetti(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999'
  document.body.appendChild(canvas)

  const colors = ['#a970ff', '#772ce8', '#f0abfc', '#34d399', '#fbbf24', '#38bdf8']
  const particles = Array.from({ length: 110 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 240,
    y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 11,
    vy: -(Math.random() * 11 + 5),
    size: Math.random() * 7 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.3,
  }))

  const start = performance.now()
  const duration = 1500

  function frame(now: number) {
    const elapsed = now - start
    if (elapsed > duration || !ctx) {
      canvas.remove()
      return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const fade = 1 - elapsed / duration
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.35
      p.rotation += p.spin
      ctx.save()
      ctx.globalAlpha = fade
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
