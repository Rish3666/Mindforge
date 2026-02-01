import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        let animationFrameId
        let particles = []

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        // Define exclusion zone for text content (center area)
        const isInExclusionZone = (x, y) => {
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2

            // Define exclusion zone dimensions (adjust these values to control the text-free area)
            const exclusionWidth = canvas.width * 0.6  // 60% of screen width
            const exclusionHeight = canvas.height * 0.5 // 50% of screen height

            const left = centerX - exclusionWidth / 2
            const right = centerX + exclusionWidth / 2
            const top = centerY - exclusionHeight / 2
            const bottom = centerY + exclusionHeight / 2

            return x > left && x < right && y > top && y < bottom
        }

        const createParticles = () => {
            particles = []
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000)

            for (let i = 0; i < particleCount; i++) {
                let x, y
                let attempts = 0

                // Keep trying to place particle outside exclusion zone
                do {
                    x = Math.random() * canvas.width
                    y = Math.random() * canvas.height
                    attempts++
                } while (isInExclusionZone(x, y) && attempts < 50)

                // Only add particle if it's outside exclusion zone
                if (!isInExclusionZone(x, y)) {
                    particles.push({
                        x: x,
                        y: y,
                        size: Math.random() * 2 + 0.5,
                        speedX: (Math.random() - 0.5) * 0.3,
                        speedY: (Math.random() - 0.5) * 0.3,
                        opacity: Math.random() * 0.5 + 0.2,
                        hue: Math.random() > 0.5 ? 270 : 190 // Purple or cyan
                    })
                }
            }
        }

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((particle, index) => {
                // Calculate next position
                let nextX = particle.x + particle.speedX
                let nextY = particle.y + particle.speedY

                // Check if next position would be in exclusion zone
                if (isInExclusionZone(nextX, nextY)) {
                    // Bounce away from exclusion zone
                    const centerX = canvas.width / 2
                    const centerY = canvas.height / 2

                    // Reverse direction to bounce away
                    if (Math.abs(nextX - centerX) > Math.abs(nextY - centerY)) {
                        particle.speedX *= -1
                    } else {
                        particle.speedY *= -1
                    }

                    nextX = particle.x + particle.speedX
                    nextY = particle.y + particle.speedY
                }

                // Update position
                particle.x = nextX
                particle.y = nextY

                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width
                if (particle.x > canvas.width) particle.x = 0
                if (particle.y < 0) particle.y = canvas.height
                if (particle.y > canvas.height) particle.y = 0

                // Draw particle
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`
                ctx.fill()

                // Draw connections (only if both particles are outside exclusion zone)
                particles.forEach((otherParticle, otherIndex) => {
                    if (index === otherIndex) return

                    const dx = particle.x - otherParticle.x
                    const dy = particle.y - otherParticle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 100) {
                        // Check if line would cross exclusion zone
                        const midX = (particle.x + otherParticle.x) / 2
                        const midY = (particle.y + otherParticle.y) / 2

                        if (!isInExclusionZone(midX, midY)) {
                            ctx.beginPath()
                            ctx.moveTo(particle.x, particle.y)
                            ctx.lineTo(otherParticle.x, otherParticle.y)
                            ctx.strokeStyle = `hsla(270, 70%, 60%, ${0.1 * (1 - distance / 100)})`
                            ctx.lineWidth = 0.5
                            ctx.stroke()
                        }
                    }
                })
            })

            animationFrameId = requestAnimationFrame(drawParticles)
        }

        resizeCanvas()
        createParticles()
        drawParticles()

        window.addEventListener('resize', () => {
            resizeCanvas()
            createParticles()
        })

        return () => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('resize', resizeCanvas)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.6 }}
        />
    )
}
