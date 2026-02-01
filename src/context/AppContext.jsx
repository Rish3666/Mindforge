import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getUserPreferences, saveUserPreferences, saveChatHistory } from '../services/supabaseService'

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const { user } = useAuth()
    const [userPreferences, setUserPreferences] = useState({
        level: null,
        subject: null,
        chapters: [],
        learningStyle: 'visual',
        weakAreas: '',
        language: 'english'
    })

    const [selectedTutor, setSelectedTutor] = useState(null)

    const [sessionState, setSessionState] = useState({
        messages: [],
        mindMapNodes: [],
        mindMapEdges: [],
        progress: 0,
        currentTopic: null
    })

    const [loading, setLoading] = useState(false)

    // Load user preferences from Supabase when user logs in
    useEffect(() => {
        if (user) {
            loadUserPreferences()
        } else {
            // Reset to defaults when user logs out
            setUserPreferences({
                level: null,
                subject: null,
                chapters: [],
                learningStyle: 'visual',
                weakAreas: '',
                language: 'english'
            })
            setSelectedTutor(null)
            resetSession()
        }
    }, [user])

    const loadUserPreferences = async () => {
        if (!user) return

        try {
            setLoading(true)
            const { data, error } = await getUserPreferences(user.id)

            if (data && !error) {
                setUserPreferences({
                    level: data.level,
                    subject: data.subject,
                    chapters: data.chapters || [],
                    learningStyle: 'visual',
                    weakAreas: '',
                    language: data.language || 'english'
                })
            }
        } catch (error) {
            console.error('Error loading user preferences:', error)
        } finally {
            setLoading(false)
        }
    }

    const updatePreferences = async (updates) => {
        setUserPreferences(prev => ({ ...prev, ...updates }))

        // Save to Supabase if user is logged in
        if (user) {
            try {
                const newPreferences = { ...userPreferences, ...updates }
                await saveUserPreferences(user.id, newPreferences)
            } catch (error) {
                console.error('Error saving preferences:', error)
            }
        }
    }

    const addMessage = (message) => {
        setSessionState(prev => ({
            ...prev,
            messages: [...prev.messages, message]
        }))
    }

    const updateMindMap = (nodes, edges) => {
        setSessionState(prev => ({
            ...prev,
            mindMapNodes: nodes,
            mindMapEdges: edges
        }))
    }

    const updateProgress = (progress) => {
        setSessionState(prev => ({ ...prev, progress }))
    }

    const resetSession = () => {
        setSessionState({
            messages: [],
            mindMapNodes: [],
            mindMapEdges: [],
            progress: 0,
            currentTopic: null
        })
    }

    // Auto-save chat history when messages change
    useEffect(() => {
        if (user && selectedTutor && sessionState.messages.length > 0 && sessionState.currentTopic) {
            const saveChat = async () => {
                try {
                    await saveChatHistory(
                        user.id,
                        selectedTutor.id,
                        sessionState.currentTopic,
                        sessionState.messages
                    )
                } catch (error) {
                    console.error('Error auto-saving chat:', error)
                }
            }

            // Debounce the save operation
            const timeoutId = setTimeout(saveChat, 2000)
            return () => clearTimeout(timeoutId)
        }
    }, [user, selectedTutor, sessionState.messages, sessionState.currentTopic])

    const value = {
        userPreferences,
        updatePreferences,
        selectedTutor,
        setSelectedTutor,
        sessionState,
        setSessionState,
        addMessage,
        updateMindMap,
        updateProgress,
        resetSession,
        loading
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within AppProvider')
    }
    return context
}
