import './App.css';
import { useAuth } from './AuthContext';
import Login from './Login';
import Profile from './Profile';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading…</div>;
  }

  return user ? <Profile /> : <Login />;
}
