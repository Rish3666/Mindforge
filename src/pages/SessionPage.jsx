import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import MindMapView from '../components/session/MindMapView'
import ChatInterface from '../components/session/ChatInterface'
import ChapterReader from '../components/session/ChapterReader'
import ProgressTracker from '../components/session/ProgressTracker'
import { getChapterContent } from '../data/chapterContent'

export default function SessionPage() {
    const navigate = useNavigate()
    const { selectedTutor, userPreferences, sessionState, addMessage, setCurrentTopic } = useApp()
    const [viewMode, setViewMode] = useState('read') // 'read', 'chat', 'mindmap'
    const [isMobile, setIsMobile] = useState(false)
    const chatRef = useRef(null)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Redirect if no tutor selected
    useEffect(() => {
        if (!selectedTutor) {
            navigate('/tutor')
        }
    }, [selectedTutor, navigate])

    // Set current topic when chapter changes
    useEffect(() => {
        const currentChapter = userPreferences.chapters?.[0]
        if (currentChapter) {
            setCurrentTopic(currentChapter.chapterName)
        }
    }, [userPreferences.chapters, setCurrentTopic])

    if (!selectedTutor) return null

    const currentChapter = userPreferences.chapters?.[0]
    const chapterContent = getChapterContent(currentChapter?.chapterName)
    const hasContent = chapterContent !== null

    // Default to chat mode if no chapter content available
    useEffect(() => {
        if (!hasContent && viewMode === 'read') {
            setViewMode('chat')
        }
    }, [hasContent, viewMode])

    // Handle doubt from reader - switch to chat and send message
    const handleAskDoubt = (message) => {
        setViewMode('chat')
        // Use a small delay to ensure chat is rendered
        setTimeout(() => {
            if (chatRef.current?.handleExternalMessage) {
                chatRef.current.handleExternalMessage(message)
            }
        }, 100)
    }

    return (
        <div className="h-screen bg-dark-900 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-800/50 bg-dark-900/80 backdrop-blur-sm z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/tutor')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ←
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 border border-primary-500/50">
                            {selectedTutor.avatar}
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">{selectedTutor.name}</h2>
                            <p className="text-xs text-gray-500">
                                {currentChapter?.chapterName || 'Learning Session'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Mode Tabs */}
                    <div className="flex bg-dark-700 rounded-lg p-1">
                        {hasContent && (
                            <button
                                onClick={() => setViewMode('read')}
                                className={`
                  px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all
                  ${viewMode === 'read'
                                        ? 'bg-primary-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }
                `}
                            >
                                <span>📖</span>
                                <span className="hidden sm:inline">Read</span>
                            </button>
                        )}
                        <button
                            onClick={() => setViewMode('chat')}
                            className={`
                px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all
                ${viewMode === 'chat'
                                    ? 'bg-primary-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }
              `}
                        >
                            <span>💬</span>
                            <span className="hidden sm:inline">Chat</span>
                        </button>
                        <button
                            onClick={() => setViewMode('mindmap')}
                            className={`
                px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all
                ${viewMode === 'mindmap'
                                    ? 'bg-primary-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }
              `}
                        >
                            <span>🗺️</span>
                            <span className="hidden sm:inline">Mind Map</span>
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="hidden md:block">
                        <ProgressTracker />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Desktop Layout */}
                {!isMobile && (
                    <>
                        {viewMode === 'read' && hasContent && (
                            <>
                                {/* Reading Panel - 60% */}
                                <div className="w-3/5 h-full border-r border-gray-800/50">
                                    <ChapterReader onAskDoubt={handleAskDoubt} />
                                </div>
                                {/* Chat Panel - 40% */}
                                <div className="w-2/5 h-full">
                                    <ChatInterface ref={chatRef} compact />
                                </div>
                            </>
                        )}

                        {viewMode === 'chat' && (
                            <>
                                {/* Mind Map Panel - 40% */}
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: '40%', opacity: 1 }}
                                    className="h-full border-r border-gray-800/50 bg-dark-800/50"
                                >
                                    <MindMapView />
                                </motion.div>
                                {/* Chat Panel - 60% */}
                                <div className="flex-1 h-full">
                                    <ChatInterface ref={chatRef} />
                                </div>
                            </>
                        )}

                        {viewMode === 'mindmap' && (
                            <div className="w-full h-full">
                                <MindMapView />
                            </div>
                        )}
                    </>
                )}

                {/* Mobile Layout */}
                {isMobile && (
                    <div className="w-full h-full">
                        <AnimatePresence mode="wait">
                            {viewMode === 'read' && hasContent && (
                                <motion.div
                                    key="read"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full"
                                >
                                    <ChapterReader onAskDoubt={handleAskDoubt} />
                                </motion.div>
                            )}
                            {viewMode === 'chat' && (
                                <motion.div
                                    key="chat"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full"
                                >
                                    <ChatInterface ref={chatRef} />
                                </motion.div>
                            )}
                            {viewMode === 'mindmap' && (
                                <motion.div
                                    key="mindmap"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full"
                                >
                                    <MindMapView />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Quick Actions Bar (Mobile) */}
            {isMobile && viewMode === 'read' && (
                <div className="flex-shrink-0 p-3 border-t border-gray-800/50 bg-dark-800">
                    <button
                        onClick={() => setViewMode('chat')}
                        className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                        <span>💬</span>
                        <span>Ask a Doubt</span>
                    </button>
                </div>
            )}
        </div>
    )
}
