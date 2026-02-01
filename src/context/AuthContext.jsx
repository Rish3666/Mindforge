import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                loadUserProfile(session.user.id)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                await loadUserProfile(session.user.id)
            } else {
                setProfile(null)
            }

            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const loadUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error && error.code !== 'PGRST116') {
                // PGRST116 is "not found" - that's ok for new users
                console.error('Error loading profile:', error)
                return
            }

            if (data) {
                setProfile(data)
            } else {
                // Create profile for new user
                await createUserProfile(userId)
            }
        } catch (error) {
            console.error('Error in loadUserProfile:', error)
        }
    }

    const createUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: userId,
                        email: user?.email,
                        full_name: user?.user_metadata?.full_name || user?.user_metadata?.name,
                        avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture,
                    },
                ])
                .select()
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error('Error creating profile:', error)
        }
    }

    const signInWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('Error signing in with Google:', error)
            return { data: null, error }
        }
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null)
            setProfile(null)
            setSession(null)
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    const value = {
        user,
        profile,
        session,
        loading,
        signInWithGoogle,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
