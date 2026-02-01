import { motion } from 'framer-motion'

export default function GlowingOrb({ size = 'default' }) {
    const sizeClasses = size === 'small'
        ? 'w-32 h-32 md:w-40 md:h-40'
        : 'w-64 h-64 md:w-80 md:h-80'

    const particleCount = size === 'small' ? 4 : 8

    return (
        <div className={`relative ${sizeClasses}`}>
            {/* Outer glow rings */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                }}
            />

            <motion.div
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute inset-4 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%)',
                }}
            />

            {/* Main orb */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-8 rounded-full overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #1a1a25 0%, #0a0a0f 100%)',
                    border: '2px solid rgba(139, 92, 246, 0.5)',
                    boxShadow: '0 0 60px rgba(139, 92, 246, 0.4), inset 0 0 60px rgba(139, 92, 246, 0.1)',
                }}
            >
                {/* Inner gradient */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
                    }}
                />

                {/* Face-like features for robot effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        {/* Eyes */}
                        <div className={`flex ${size === 'small' ? 'gap-4' : 'gap-8'} mb-4`}>
                            <motion.div
                                animate={{ opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`${size === 'small' ? 'w-4 h-2' : 'w-6 h-3'} rounded-full bg-accent-cyan`}
                                style={{ boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' }}
                            />
                            <motion.div
                                animate={{ opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                                className={`${size === 'small' ? 'w-4 h-2' : 'w-6 h-3'} rounded-full bg-accent-cyan`}
                                style={{ boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' }}
                            />
                        </div>

                        {/* Mouth / indicator */}
                        <motion.div
                            animate={{ scaleX: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className={`${size === 'small' ? 'w-8' : 'w-12'} h-1 mx-auto rounded-full bg-primary-500`}
                            style={{ boxShadow: '0 0 15px rgba(139, 92, 246, 0.8)' }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Floating particles around orb */}
            {[...Array(particleCount)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        rotate: { duration: 20 + i * 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2 + i * 0.5, repeat: Infinity },
                    }}
                    className="absolute"
                    style={{
                        top: '50%',
                        left: '50%',
                        width: `${140 + i * 15}%`,
                        height: `${140 + i * 15}%`,
                        marginTop: `-${(140 + i * 15) / 2}%`,
                        marginLeft: `-${(140 + i * 15) / 2}%`,
                    }}
                >
                    <div
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            top: 0,
                            left: '50%',
                            background: i % 2 === 0 ? '#8b5cf6' : '#00d4ff',
                            boxShadow: `0 0 10px ${i % 2 === 0 ? '#8b5cf6' : '#00d4ff'}`,
                        }}
                    />
                </motion.div>
            ))}
        </div>
    )
}
