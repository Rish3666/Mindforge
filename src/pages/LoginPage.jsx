import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import ParticleBackground from '../components/landing/ParticleBackground'
import GlowingOrb from '../components/landing/GlowingOrb'

export default function LoginPage() {
    const { user, signInWithGoogle, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [signingIn, setSigningIn] = useState(false)
    const [error, setError] = useState(null)

    const from = location.state?.from?.pathname || '/onboarding'

    useEffect(() => {
        // If user is already logged in, redirect them
        if (user && !loading) {
            navigate(from, { replace: true })
        }
    }, [user, loading, navigate, from])

    const handleGoogleSignIn = async () => {
        try {
            setSigningIn(true)
            setError(null)
            const { error } = await signInWithGoogle()

            if (error) {
                setError(error.message)
                setSigningIn(false)
            }
            // If successful, the auth state change will trigger navigation
        } catch (err) {
            setError('Failed to sign in. Please try again.')
            setSigningIn(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-animated-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-animated-gradient relative overflow-hidden flex items-center justify-center">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="glass-card rounded-2xl p-8 md:p-12">
                    {/* Logo and Branding */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-6 flex justify-center"
                        >
                            <GlowingOrb size="small" />
                        </motion.div>

                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
                            <span className="text-white">Welcome to </span>
                            <span className="gradient-text">MindForge</span>
                        </h1>

                        <p className="text-gray-400 text-sm md:text-base">
                            Sign in to continue your learning journey with legendary minds
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
                        >
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </motion.div>
                    )}

                    {/* Google Sign In Button */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        onClick={handleGoogleSignIn}
                        disabled={signingIn}
                        className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {signingIn ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </motion.button>

                    {/* Features Preview */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 pt-8 border-t border-gray-700/50"
                    >
                        <p className="text-gray-500 text-xs text-center mb-4">What you'll get:</p>
                        <div className="grid grid-cols-2 gap-3 text-center">
                            {[
                                { icon: '🧠', label: 'AI Tutors' },
                                { icon: '🗺️', label: 'Mind Maps' },
                                { icon: '📖', label: 'Textbooks' },
                                { icon: '💾', label: 'Save Progress' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <span className="text-2xl">{item.icon}</span>
                                    <span className="text-gray-400 text-xs">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Privacy Note */}
                    <p className="text-gray-600 text-xs text-center mt-6">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </motion.div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />
        </div>
    )
}
