import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RoomDirectoryPage } from './pages/RoomDirectoryPage';
import { ChatRoomPage } from './pages/ChatRoomPage';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { DmProvider } from './contexts/DmContext';
import { DmPopoverContainer } from './components/dm/DmPopoverContainer';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { did, serverToken, isLoading, authError, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!did) return <Navigate to="/login" replace />;

  if (authError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{authError}</p>
        <button onClick={logout} style={{ marginTop: '1rem' }}>
          Back to login
        </button>
      </div>
    );
  }

  if (!serverToken) return <div>Connecting to server...</div>;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoomDirectoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rooms/:id"
        element={
          <ProtectedRoute>
            <ChatRoomPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <WebSocketProvider>
            <DmProvider>
              <AppRoutes />
              <DmPopoverContainer />
            </DmProvider>
          </WebSocketProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
