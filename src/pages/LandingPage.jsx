import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ParticleBackground from '../components/landing/ParticleBackground'
import GlowingOrb from '../components/landing/GlowingOrb'
import { tutors } from '../data/syllabus'

export default function LandingPage() {
    const navigate = useNavigate()
    const [showDemo, setShowDemo] = useState(false)
    const [activeSection, setActiveSection] = useState(null) // 'features', 'tutors', 'about'

    const features = [
        { icon: '🧠', title: 'AI-Powered Tutoring', desc: 'Learn from legendary minds like Einstein, Ramanujan, and Kalam with personalized explanations' },
        { icon: '🗺️', title: 'Visual Mind Maps', desc: 'Generate interactive mind maps to visualize concepts and their connections' },
        { icon: '📖', title: 'Digital Textbooks', desc: 'Read comprehensive chapter content with formulas, examples, and practice questions' },
        { icon: '🔊', title: 'Voice Explanations', desc: 'Listen to your tutor explain concepts with text-to-speech technology' },
        { icon: '🎯', title: 'Adaptive Learning', desc: 'AI adapts to your level, learning style, and weak areas for personalized sessions' },
        { icon: '🌐', title: 'Multilingual Support', desc: 'Learn in English, Hindi, or Telugu - AI translates seamlessly' }
    ]

    return (
        <div className="min-h-screen bg-animated-gradient relative overflow-hidden">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 md:px-16">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <span className="text-xl">🧠</span>
                    </div>
                    <span className="text-xl font-display font-bold text-white">MindForge</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden md:flex items-center gap-8"
                >
                    <button
                        onClick={() => setActiveSection(activeSection === 'features' ? null : 'features')}
                        className={`transition-colors ${activeSection === 'features' ? 'text-primary-400' : 'text-gray-300 hover:text-white'}`}
                    >
                        Features
                    </button>
                    <button
                        onClick={() => setActiveSection(activeSection === 'tutors' ? null : 'tutors')}
                        className={`transition-colors ${activeSection === 'tutors' ? 'text-primary-400' : 'text-gray-300 hover:text-white'}`}
                    >
                        Tutors
                    </button>
                    <button
                        onClick={() => setActiveSection(activeSection === 'about' ? null : 'about')}
                        className={`transition-colors ${activeSection === 'about' ? 'text-primary-400' : 'text-gray-300 hover:text-white'}`}
                    >
                        About
                    </button>
                </motion.div>
            </nav>

            {/* Expandable Sections */}
            <AnimatePresence>
                {activeSection && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative z-20 mx-8 md:mx-16 mb-8"
                    >
                        <div className="glass-card rounded-2xl p-8">
                            {/* Features Section */}
                            {activeSection === 'features' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">✨ Key Features</h2>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {features.map((feature, i) => (
                                            <div key={i} className="flex gap-4">
                                                <span className="text-3xl">{feature.icon}</span>
                                                <div>
                                                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                                                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tutors Section */}
                            {activeSection === 'tutors' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">🧑‍🏫 Meet Your Legendary Tutors</h2>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {tutors.map((tutor) => (
                                            <div key={tutor.id} className="bg-dark-700/50 rounded-xl p-4 flex items-start gap-4 hover:bg-dark-600/50 transition-colors cursor-pointer" onClick={() => navigate('/tutor')}>
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-700/20 flex items-center justify-center text-3xl border border-primary-500/30">
                                                    {tutor.avatar}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white">{tutor.name}</h3>
                                                    <p className="text-primary-400 text-sm">{tutor.subject}</p>
                                                    <p className="text-gray-500 text-xs mt-1 italic">"{tutor.tagline}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => navigate('/tutor')}
                                        className="mt-6 btn-primary px-6 py-3 rounded-lg"
                                    >
                                        Choose Your Tutor →
                                    </button>
                                </div>
                            )}

                            {/* About Section */}
                            {activeSection === 'about' && (
                                <div className="max-w-2xl">
                                    <h2 className="text-2xl font-bold text-white mb-6">🎯 About MindForge</h2>
                                    <div className="space-y-4 text-gray-300">
                                        <p>
                                            <strong className="text-white">MindForge</strong> is an adaptive AI learning companion designed specifically for Indian students preparing for JEE, NEET, and Board exams.
                                        </p>
                                        <p>
                                            We believe learning should be personalized, engaging, and inspiring. That's why we've created AI tutors that simulate legendary figures like Einstein, Ramanujan, and APJ Abdul Kalam - each with their unique teaching style.
                                        </p>
                                        <div className="glass-card p-4 rounded-lg mt-6">
                                            <h3 className="font-semibold text-white mb-3">🛠️ Built With</h3>
                                            <div className="flex flex-wrap gap-3">
                                                {['React', 'Gemini 2.5 Flash', 'React Flow', 'Tailwind CSS', 'Framer Motion', 'Web Speech API'].map(tech => (
                                                    <span key={tech} className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-6">
                                            Made with ❤️ for Indian students | Hackathon 2026
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Close button */}
                            <button
                                onClick={() => setActiveSection(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <main className={`relative z-10 flex flex-col items-center justify-center px-8 text-center ${activeSection ? 'min-h-[50vh]' : 'min-h-[calc(100vh-100px)]'}`}>
                {/* Glowing Orb / Robot */}
                {!activeSection && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mb-8"
                    >
                        <GlowingOrb />
                    </motion.div>
                )}

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className={`font-display font-bold mb-6 max-w-4xl ${activeSection ? 'text-3xl md:text-4xl' : 'text-4xl md:text-6xl lg:text-7xl'}`}
                >
                    <span className="text-white">Learn from</span>
                    <br />
                    <span className="gradient-text">Legendary Minds</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
                >
                    Experience personalized AI tutoring with legendary figures like Einstein,
                    Ramanujan, and Kalam. Master JEE, NEET, and Board exams with adaptive
                    learning, visual mind maps, and voice explanations.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="btn-primary text-lg px-10 py-4 rounded-xl flex items-center gap-2 group"
                    >
                        <span>Start Learning Free</span>
                        <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            →
                        </motion.span>
                    </button>
                    <button
                        onClick={() => setShowDemo(true)}
                        className="btn-secondary text-lg px-10 py-4 rounded-xl flex items-center gap-2"
                    >
                        <span>▶</span>
                        <span>Watch Demo</span>
                    </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="flex gap-12 mt-16"
                >
                    {[
                        { value: '100+', label: 'Chapters' },
                        { value: '6', label: 'AI Tutors' },
                        { value: '3', label: 'Languages' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl md:text-3xl font-bold gradient-text-purple">{stat.value}</div>
                            <div className="text-gray-500 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </main>

            {/* Demo Modal */}
            <AnimatePresence>
                {showDemo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowDemo(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">🎬 MindForge Demo</h2>
                                <button
                                    onClick={() => setShowDemo(false)}
                                    className="text-gray-400 hover:text-white text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Demo Content - App Flow */}
                            <div className="space-y-6">
                                <p className="text-gray-300 text-center mb-8">
                                    See how MindForge transforms your learning experience!
                                </p>

                                {/* Flow Steps */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {[
                                        { step: 1, title: 'Select Your Level', desc: 'Choose from Class 11, 12, JEE Main, JEE Advanced, or NEET', icon: '📚' },
                                        { step: 2, title: 'Pick Your Subject & Chapters', desc: 'Browse Physics, Chemistry, Math, or Biology with comprehensive syllabus', icon: '🎯' },
                                        { step: 3, title: 'Choose Your Tutor', desc: 'Learn from Einstein, Ramanujan, Kalam, Curie, Darwin, or Feynman', icon: '🧑‍🔬' },
                                        { step: 4, title: 'Start Learning!', desc: 'Read textbook content, ask doubts, generate mind maps, test your understanding', icon: '🚀' }
                                    ].map(item => (
                                        <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-dark-700/50">
                                            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div className="text-primary-400 text-sm mb-1">Step {item.step}</div>
                                                <h3 className="font-semibold text-white">{item.title}</h3>
                                                <p className="text-gray-400 text-sm">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Features Highlight */}
                                <div className="glass-card p-6 rounded-xl mt-8">
                                    <h3 className="font-semibold text-white mb-4 text-center">✨ What Makes MindForge Special</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div className="p-3">
                                            <div className="text-3xl mb-2">📖</div>
                                            <div className="text-sm text-gray-300">Real Textbook Content</div>
                                        </div>
                                        <div className="p-3">
                                            <div className="text-3xl mb-2">🗺️</div>
                                            <div className="text-sm text-gray-300">Interactive Mind Maps</div>
                                        </div>
                                        <div className="p-3">
                                            <div className="text-3xl mb-2">💬</div>
                                            <div className="text-sm text-gray-300">AI Chat with Tutors</div>
                                        </div>
                                        <div className="p-3">
                                            <div className="text-3xl mb-2">🎯</div>
                                            <div className="text-sm text-gray-300">Practice Questions</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setShowDemo(false); navigate('/onboarding'); }}
                                    className="w-full btn-primary py-4 rounded-xl text-lg"
                                >
                                    Try It Now - Start Learning Free →
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />

            {/* Footer */}
            <footer className="relative z-10 text-center py-8 border-t border-gray-800/50">
                <p className="text-gray-500 text-sm">
                    Powered by <span className="text-primary-400">Google Gemini 2.5 Flash</span> •
                    Available in English, हिंदी, తెలుగు
                </p>
            </footer>
        </div>
    )
}
