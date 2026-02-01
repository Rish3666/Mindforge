import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
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

                        {/* Protected routes */}
                        <Route path="/onboarding" element={
                            <ProtectedRoute>
                                <OnboardingPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/tutor" element={
                            <ProtectedRoute>
                                <TutorPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/session" element={
                            <ProtectedRoute>
                                <SessionPage />
                            </ProtectedRoute>
                        } />

                        {/* Catch all - redirect to landing */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </AppProvider>
        </AuthProvider>
    )
}

export default App
