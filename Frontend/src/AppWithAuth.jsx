import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Login from './Login/Login';
import App from './App';

function ProtectedRoute({ children, isAuthenticated, checkingAuth }) {
    const location = useLocation();

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

function LoginRoute({ children, isAuthenticated, checkingAuth }) {
    const location = useLocation();

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    return children;
}

function AppContent({ isAuthenticated, username, handleLogout }) {
    return (
        <div className="relative">
            <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
                <span className="text-sm text-gray-600">
                    Welcome, <span className="font-semibold text-gray-800">{username}</span>
                </span>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
            <App />
        </div>
    );
}

function LoginWrapper({ onLoginSuccess }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = (user) => {
        onLoginSuccess(user);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
    };

    return <Login onLoginSuccess={handleLogin} />;
}

export default function AppWithAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/status', {
                credentials: 'include',
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.authenticated) {
                    setIsAuthenticated(true);
                    setUsername(data.username);
                }
            }
        } catch (err) {
            console.error('Auth check failed:', err);
        } finally {
            setCheckingAuth(false);
        }
    };

    const handleLoginSuccess = (user) => {
        setIsAuthenticated(true);
        setUsername(user);
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            setIsAuthenticated(false);
            setUsername('');
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <LoginRoute isAuthenticated={isAuthenticated} checkingAuth={checkingAuth}>
                            <LoginWrapper onLoginSuccess={handleLoginSuccess} />
                        </LoginRoute>
                    }
                />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} checkingAuth={checkingAuth}>
                            <AppContent 
                                isAuthenticated={isAuthenticated}
                                username={username}
                                handleLogout={handleLogout}
                            />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
