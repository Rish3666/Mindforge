import { supabase } from '../lib/supabaseClient'

// ============================================
// USER PREFERENCES
// ============================================

export async function getUserPreferences(userId) {
    try {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "not found" - that's ok
            throw error
        }

        return { data, error: null }
    } catch (error) {
        console.error('Error fetching user preferences:', error)
        return { data: null, error }
    }
}

export async function saveUserPreferences(userId, preferences) {
    try {
        const { data, error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: userId,
                level: preferences.level,
                subject: preferences.subject,
                chapters: preferences.chapters || [],
                language: preferences.language || 'en',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error saving user preferences:', error)
        return { data: null, error }
    }
}

// ============================================
// CHAT HISTORY
// ============================================

export async function getChatHistory(userId, tutorId, chapterName) {
    try {
        let query = supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', userId)
            .eq('tutor_id', tutorId)

        if (chapterName) {
            query = query.eq('chapter_name', chapterName)
        }

        const { data, error } = await query.order('updated_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching chat history:', error)
        return { data: null, error }
    }
}

export async function saveChatHistory(userId, tutorId, chapterName, messages) {
    try {
        // Check if chat history exists
        const { data: existing } = await supabase
            .from('chat_history')
            .select('id')
            .eq('user_id', userId)
            .eq('tutor_id', tutorId)
            .eq('chapter_name', chapterName)
            .single()

        let result
        if (existing) {
            // Update existing chat
            result = await supabase
                .from('chat_history')
                .update({
                    messages: messages,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single()
        } else {
            // Create new chat
            result = await supabase
                .from('chat_history')
                .insert({
                    user_id: userId,
                    tutor_id: tutorId,
                    chapter_name: chapterName,
                    messages: messages
                })
                .select()
                .single()
        }

        const { data, error } = result
        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error saving chat history:', error)
        return { data: null, error }
    }
}

export async function deleteChatHistory(chatId) {
    try {
        const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('id', chatId)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error deleting chat history:', error)
        return { error }
    }
}

// ============================================
// USER PROGRESS
// ============================================

export async function getUserProgress(userId, subject, chapterName) {
    try {
        let query = supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)

        if (subject) {
            query = query.eq('subject', subject)
        }

        if (chapterName) {
            query = query.eq('chapter_name', chapterName)
        }

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching user progress:', error)
        return { data: null, error }
    }
}

export async function saveUserProgress(userId, subject, chapterName, progressData) {
    try {
        const { data, error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: userId,
                subject: subject,
                chapter_name: chapterName,
                completed_subtopics: progressData.completedSubtopics || [],
                quiz_scores: progressData.quizScores || [],
                last_accessed: new Date().toISOString()
            }, {
                onConflict: 'user_id,subject,chapter_name'
            })
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error saving user progress:', error)
        return { data: null, error }
    }
}

// ============================================
// PROFILE
// ============================================

export async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating user profile:', error)
        return { data: null, error }
    }
}
