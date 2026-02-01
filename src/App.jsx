import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import TutorPage from './pages/TutorPage'
import SessionPage from './pages/SessionPage'

function App() {
    return (
        <AuthProvider>
            <AppProvider>
                <div className="min-h-screen bg-dark-900">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />

                        {/* All routes now public - authentication disabled for now */}
                        <Route path="/onboarding" element={<OnboardingPage />} />
                        <Route path="/tutor" element={<TutorPage />} />
                        <Route path="/session" element={<SessionPage />} />

                        {/* Catch all - redirect to landing */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </AppProvider>
        </AuthProvider>
    )
}

export default App
