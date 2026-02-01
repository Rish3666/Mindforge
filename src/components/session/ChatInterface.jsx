import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useApp } from '../../context/AppContext'
import { generateChatResponse, generateMindMapData } from '../../services/geminiService'

const ChatInterface = forwardRef(function ChatInterface({ compact = false }, ref) {
    const { selectedTutor, userPreferences, sessionState, addMessage, updateMindMap, updateProgress } = useApp()
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [voiceEnabled, setVoiceEnabled] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    // Expose method to parent for external messages
    useImperativeHandle(ref, () => ({
        handleExternalMessage: (message) => {
            setInput(message)
            setTimeout(() => handleSend(message), 100)
        }
    }))

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [sessionState.messages])

    // Initial greeting
    useEffect(() => {
        if (sessionState.messages.length === 0 && selectedTutor) {
            const greeting = getGreeting()
            addMessage({ role: 'tutor', content: greeting })

            // Generate initial mind map
            if (userPreferences.chapters?.[0]) {
                generateInitialMindMap()
            }
        }
    }, [])

    const getGreeting = () => {
        const chapter = userPreferences.chapters?.[0]?.chapterName || 'your selected topics'
        const greetings = {
            einstein: `Ah, wonderful! I see you want to explore **${chapter}**. You know, the important thing is to never stop questioning. Curiosity is the key to understanding the universe.\n\n📚 You can read the chapter content on the left, and ask me any doubts here!\n\nWhat would you like to understand today?`,
            ramanujan: `Welcome! Today we shall discover the beautiful patterns in **${chapter}**. Mathematics speaks to us through patterns - let me show you what I see.\n\n📚 Read through the material and come to me with your questions. I love when students find patterns on their own!`,
            kalam: `My dear student, I'm delighted you've chosen to learn **${chapter}**. Remember - dream, dream, dream!\n\n📚 Read the chapter carefully, and don't hesitate to ask doubts. Every question brings you closer to your dreams!`,
            curie: `Greetings! Together we'll explore **${chapter}**. Science is about patience and curiosity.\n\n📚 Study the material methodically, and I'll help you understand anything that puzzles you. No question is too small!`,
            darwin: `How wonderful! Let's observe and question **${chapter}** together.\n\n📚 As you read, notice the connections between concepts. Nature has patterns everywhere - let's discover them!`,
            feynman: `Hey! Ready to have some fun with **${chapter}**?\n\n📚 Read through the chapter, and whenever something doesn't click, ask me! The best way to learn is to be honest about what you don't understand.`
        }
        return greetings[selectedTutor.id] || `Hello! I'm ${selectedTutor.name}, and I'll be your guide to **${chapter}**.\n\n📚 Read the chapter content and ask me anything!\n\nWhat would you like to explore?`
    }

    const generateInitialMindMap = async () => {
        const chapter = userPreferences.chapters?.[0]
        if (chapter) {
            try {
                const mindMapData = await generateMindMapData(chapter.chapterName, chapter.subtopics)
                updateMindMap(mindMapData.nodes, mindMapData.edges)
            } catch (error) {
                console.error('Failed to generate mind map:', error)
                // Use fallback static mind map
                const fallbackNodes = [
                    { id: '1', type: 'central', data: { label: chapter.chapterName }, position: { x: 250, y: 200 } },
                    ...chapter.subtopics.slice(0, 6).map((topic, i) => ({
                        id: `${i + 2}`,
                        type: 'default',
                        data: { label: topic },
                        position: {
                            x: 250 + Math.cos(i * Math.PI / 3) * 180,
                            y: 200 + Math.sin(i * Math.PI / 3) * 180
                        }
                    }))
                ]
                const fallbackEdges = chapter.subtopics.slice(0, 6).map((_, i) => ({
                    id: `e1-${i + 2}`,
                    source: '1',
                    target: `${i + 2}`
                }))
                updateMindMap(fallbackNodes, fallbackEdges)
            }
        }
    }

    const handleSend = async (messageOverride = null) => {
        const messageToSend = messageOverride || input.trim()
        if (!messageToSend || isLoading) return

        setInput('')
        addMessage({ role: 'user', content: messageToSend })
        setIsLoading(true)

        try {
            const response = await generateChatResponse(
                messageToSend,
                selectedTutor,
                userPreferences,
                sessionState.messages
            )

            // Validate response isn't empty or too short
            if (!response || response.trim().length < 10) {
                throw new Error('Invalid response received')
            }

            addMessage({ role: 'tutor', content: response })

            // Update progress slightly
            const newProgress = Math.min(sessionState.progress + 5, 100)
            updateProgress(newProgress)

            // Voice output if enabled
            if (voiceEnabled) {
                speakText(response)
            }
        } catch (error) {
            console.error('Chat error:', error)
            addMessage({
                role: 'tutor',
                content: `I apologize, but I'm having trouble right now. 😔

**Possible issues:**
- Gemini API key not configured or invalid
- Network connection problem
- Rate limit reached

**What you can do:**
1. Check your Gemini API key in \`.env.local\`
2. Verify your internet connection
3. Try again in a moment
4. Ask a different question

**Need help?** Check the console for detailed error messages.

I'm still here to help once we resolve this! 💪`
            })
        } finally {
            setIsLoading(false)
        }
    }

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel()

            // Clean text for speech (remove markdown)
            const cleanText = text.replace(/[*#`]/g, '').replace(/\n+/g, '. ')

            const utterance = new SpeechSynthesisUtterance(cleanText)
            utterance.rate = 0.9
            utterance.pitch = 1
            window.speechSynthesis.speak(utterance)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleProveIt = () => {
        const chapter = userPreferences.chapters?.[0]?.chapterName || 'what we\'ve discussed'
        handleSend(`I'd like to test my understanding of ${chapter}. Ask me a challenging question to see if I truly understand the concepts!`)
    }

    const handleViewMindMap = async () => {
        if (sessionState.messages.length > 0) {
            handleSend("Can you create a mind map summarizing the key concepts we've discussed?")
        }
    }

    return (
        <div className="h-full flex flex-col bg-dark-900">
            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 ${compact ? 'p-3' : 'p-6'} space-y-4`}>
                <AnimatePresence>
                    {sessionState.messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`chat-message ${message.role} ${compact ? 'text-sm' : ''}`}>
                                {message.role === 'tutor' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={compact ? 'text-base' : 'text-lg'}>{selectedTutor?.avatar}</span>
                                        <span className="text-sm font-medium text-primary-400">{selectedTutor?.name}</span>
                                    </div>
                                )}
                                <div className={`prose prose-invert ${compact ? 'prose-sm' : 'prose-sm'} max-w-none`}>
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                                            code: ({ children }) => <code className="bg-dark-600 px-1 rounded text-accent-cyan">{children}</code>,
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className={`chat-message tutor ${compact ? 'text-sm' : ''}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={compact ? 'text-base' : 'text-lg'}>{selectedTutor?.avatar}</span>
                                <span className="text-sm font-medium text-primary-400">{selectedTutor?.name}</span>
                            </div>
                            <div className="loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions - Only show if not compact */}
            {!compact && (
                <div className="px-6 py-3 flex gap-3 border-t border-gray-800/30 overflow-x-auto">
                    <button
                        onClick={handleViewMindMap}
                        className="px-4 py-2 rounded-lg text-sm bg-dark-700 text-gray-300 hover:text-white hover:bg-dark-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <span>🗺️</span>
                        <span>Generate Mind Map</span>
                    </button>
                    <button
                        onClick={handleProveIt}
                        className="px-4 py-2 rounded-lg text-sm bg-dark-700 text-gray-300 hover:text-white hover:bg-dark-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <span>🎯</span>
                        <span>Test My Understanding</span>
                    </button>
                    <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`
              px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap
              ${voiceEnabled
                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                                : 'bg-dark-700 text-gray-300 hover:text-white hover:bg-dark-600'
                            }
            `}
                    >
                        <span>{voiceEnabled ? '🔊' : '🔇'}</span>
                        <span>Voice</span>
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className={`${compact ? 'p-3' : 'p-6'} border-t border-gray-800/50`}>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={compact ? "Ask a doubt..." : `Ask ${selectedTutor?.name || 'your tutor'} anything...`}
                            className={`
                w-full px-4 rounded-xl bg-dark-700 border border-gray-700 text-white 
                placeholder-gray-500 focus:border-primary-500 focus:outline-none resize-none transition-colors
                ${compact ? 'py-3 text-sm' : 'py-4'}
              `}
                            rows={1}
                            style={{ minHeight: compact ? '44px' : '56px', maxHeight: '150px' }}
                        />
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className={`
              rounded-xl flex items-center justify-center transition-all
              ${compact ? 'px-4' : 'px-6'}
              ${input.trim() && !isLoading
                                ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white hover:shadow-lg hover:shadow-primary-500/30'
                                : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                            }
            `}
                    >
                        <span className={compact ? 'text-lg' : 'text-xl'}>→</span>
                    </button>
                </div>
                {!compact && (
                    <p className="text-gray-600 text-xs mt-2 text-center">
                        Press Enter to send • Shift+Enter for new line
                    </p>
                )}
            </div>
        </div>
    )
})

export default ChatInterface
